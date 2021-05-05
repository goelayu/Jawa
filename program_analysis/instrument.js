

const fs = require('fs'),
    program = require('commander'),
    vm = require('vm');
const { report } = require('process');

program
    .version("0.1.0")
    .option("-i, --input [input]","path to the input file")
    .option("-n, --name [name]", "name of the file being instrumented")
    .option("-t , --type [type]", "[HTML | Javascript (js)]", "html")
    .option('-r, --rewriter [rewriter]', 'type of static rewriter to use')
    .option('--fns [fns]','path to file containing relevant functions')
    .parse(process.argv)



var rewriter = null, intercepts;
var returnInfoFile = program.input + ".info";

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function initRewriter(){
    rewriter = program.fns ? 
        require(`./rewriters/strip-fns`) : require(`./rewriters/dynamic-cfg`);
}

function getTracerObj(){
    return fs.readFileSync('./runtime/tracer.js','utf-8');
}

function instrumentHTML(src, filename){
    if (program.fns){
        return src;
    }
    var isHtml;
    try {
        var script = new vm.Script(src);
        isHtml = false;
    } catch (e) {
        isHtml = true;
    }

    if (IsJsonString(src))
        return src;

    if (!isHtml)
        return instrumentJavaScript(src, {filename:filename}, false);

    var scriptLocs = [];
    var scriptBeginRegexp = /<\s*script[^>]*>/ig;
    var scriptEndRegexp = /<\s*\/\s*script/i;
    var lastScriptEnd = 0;
    var match, newline = /\n/ig;

    var inHtmlScripts = "";


    // while (match = scriptBeginRegexp.exec(src)) {
    //     var scriptOffset = 0;
    //     var scriptBegin = match.index + match[0].length;
    //     if (scriptBegin < lastScriptEnd) {
    //         continue;
    //     }

    //     /*
    //     The slicing takes care of whether there is. a new line
    //     immediately after the <Script> tag or not, because 
    //     it will account for the correct offset
    //     */
    //     var _prevScript = src.slice(0,scriptBegin+1);
    //     while(nMatch = newline.exec(_prevScript))
    //         scriptOffset++;
    //     var endMatch = scriptEndRegexp.exec(src.slice(scriptBegin));
    //     if (endMatch) {
    //         var scriptEnd = scriptBegin + endMatch.index;
    //         scriptLocs.push({ start: scriptBegin, end: scriptEnd , offset: scriptOffset});
    //         lastScriptEnd = scriptEnd;
    //     }
    // }

    // // process the scripts in reverse order
    // for (var i = scriptLocs.length - 1; i >= 0; i--) {
    //     var loc = scriptLocs[i];
    //     var script = src.slice(loc.start, loc.end);
    //     inHtmlScripts += script;
    //     var path = filename + "-script-" + i;
    //     //Add the script offset to be sent to the instrumentation script
    //     // options.scriptOffset = loc;
    //     var offset = src.slice(0,loc.start).length;
    //     var prefix = src.slice(0, loc.start).replace(/[^\n]/g, " "); // padding it out so line numbers make sense
    //     // console.log("Instrumenting " + JSON.stringify(loc));
    //     // src = src.slice(0, loc.start) + instrumentJavaScript(prefix + script, options, true) + src.slice(loc.end);
    //     // console.log("And the final src is :" + src)
    //     src = src.slice(0, loc.start) + instrumentJavaScript(script, {filename:path, offset:offset}, true) + src.slice(loc.end);
    // }
    //insert the tracer object at top of the html
    var doctypeMatch = /<!DOCTYPE[^>[]*(\[[^]]*\])?>/i.exec(src);
    var headIndx = src.indexOf('<head>');

    var preStr = postStr = "";
    if (doctypeMatch){
        var preInd = src.indexOf(doctypeMatch[0]);
        preStr = src.slice(0,preInd);
        postStr = src.slice(preStr.length);
    } else if (headIndx){
        preStr = src.slice(0,headIndx+6);
        postStr = src.slice(headIndx+6,)
    } else {
        preStr = '';
        postStr = src;
    }

    var intercepts = fs.readFileSync('./runtime/dynamic-api-intercepts.js','utf-8');

    var tracerStr = `<script> ${intercepts + getTracerObj()} </script>`;

    src = preStr + tracerStr + postStr;

    //dump all the scripts at the stdout channel;
    console.log(inHtmlScripts);

    return src;

}

function dumpMD(){
    var dumpData = program.fns ? {} : rewriter.metadata.allFnIds;
    // dumps the metadata information post instrumentation
    fs.writeFileSync(returnInfoFile, JSON.stringify(dumpData));
}

var mergeValsArr = function(dict){
    /**
     * Takes a dictionary where values are arrays
     * and merges them together in a single array
     */

    var arr = [];
    Object.values(dict).forEach((val)=>{
        if (!Array.isArray(val)) return;
        arr = arr.concat(val);
    });
    //add the keys as well since they are the root of the call gaphs
    arr = arr.concat(Object.keys(dict).map(e=>e.split(';;;;')[1]));
    return arr;
}

var getEVTFns = function(path){
    var nGraphs = 10, fns = new Set;
    try {   
        for (var i =0; i<10;i++){
            var evtFile = `${path}/cg${i}`,
                evt = JSON.parse(fs.readFileSync(evtFile, 'utf-8'));
            var _fns = mergeValsArr(evt);
            _fns.forEach(fns.add, fns);
        }
    } catch (err) {}
    console.log(`evt graph of size ${fns.size}`);
    return [...fns];
}

var getAllFns = function(path){
    var execFns = [];
    try {
        var fnFile = `${path}/allFns`;
        var _execFns = JSON.parse(fs.readFileSync(fnFile,"utf-8")), _evtCG,
        execFns = [...new Set(_execFns.preload.concat(_execFns.postload))];
        execFns = execFns.concat(getEVTFns(path));
    } catch (err) {};
    return execFns;
}

function instrumentJavaScript(src, options, jsInHTML){
    if (IsJsonString(src)){
        // if (jsInHTML)
        //     return src.replace(/^\s+|\s+$/g, '');
        // else 
        return src;
    }
    if (program.fns){
        var allfns = getAllFns(program.fns)
         options.fns = allfns.filter(e=>e.indexOf(options.filename)>=0);

    }
    try {
        src = rewriter.instrument(src, options);
    } catch (e) {
        console.error('error while instrumenting script',e);
    }
    // console.log(`returned from instrumentation`);
    // if (jsInHTML)
    //     return src.replace(/^\s+|\s+$/g, '');
    return src;
}

function main(){
    initRewriter();
    var url = program.name.split(';;;')[0];
    var filename = program.name.split(';;;;')[1];
    // _filename = _filename == "/" ? url + _filename : _filename;
    // var filename = _filename.length>50?_filename.substring(_filename.length-50,_filename.length) : _filename;
    
    var src = fs.readFileSync(program.input,"utf-8")

    if (program.type == "js"){
        // Some js files are utf-16 encoded, therefore src might be an invalid file
        try {
            new vm.Script(src);
        } catch (e) {
            var _ucs2_ = fs.readFileSync(program.input,"ucs2")
            /*If still invalid just return the actual source*/
            try {
                new vm.Script(_ucs2_);
                src = _ucs2_;
            } catch (e){

            }
        }
        src = instrumentJavaScript(src, {filename:filename}, false)
    } else {
        src = instrumentHTML(src, filename)
    }

    fs.writeFileSync(program.input, src)
    dumpMD();
}

main();