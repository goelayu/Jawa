

const fs = require('fs'),
    program = require('commander'),
    vm = require('vm');

program
    .version("0.1.0")
    .option("-i, --input [input]","path to the input file")
    .option("-n, --name [name]", "name of the file being instrumented")
    .option("-t , --type [type]", "[HTML | Javascript (js)]", "html")
    .option('-r, --rewriter [rewriter]', 'type of static rewriter to use')
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
    rewriter = require(`./rewriters/${program.rewriter}`);
}

function getTracerObj(){
    return fs.readFileSync('./runtime/tracer.js','utf-8');
}

function instrumentHTML(src, filename){

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
        return instrumentJavaScript(src, filename, false);

    var scriptLocs = [];
    var scriptBeginRegexp = /<\s*script[^>]*>/ig;
    var scriptEndRegexp = /<\s*\/\s*script/i;
    var lastScriptEnd = 0;
    var match, newline = /\n/ig;

    var inHtmlScripts = "";


    while (match = scriptBeginRegexp.exec(src)) {
        var scriptOffset = 0;
        var scriptBegin = match.index + match[0].length;
        if (scriptBegin < lastScriptEnd) {
            continue;
        }

        /*
        The slicing takes care of whether there is. a new line
        immediately after the <Script> tag or not, because 
        it will account for the correct offset
        */
        var _prevScript = src.slice(0,scriptBegin+1);
        while(nMatch = newline.exec(_prevScript))
            scriptOffset++;
        var endMatch = scriptEndRegexp.exec(src.slice(scriptBegin));
        if (endMatch) {
            var scriptEnd = scriptBegin + endMatch.index;
            scriptLocs.push({ start: scriptBegin, end: scriptEnd , offset: scriptOffset});
            lastScriptEnd = scriptEnd;
        }
    }

    // process the scripts in reverse order
    for (var i = scriptLocs.length - 1; i >= 0; i--) {
        var loc = scriptLocs[i];
        var script = src.slice(loc.start, loc.end);
        inHtmlScripts += script;
        var path = filename + "-script-" + i;
        //Add the script offset to be sent to the instrumentation script
        // options.scriptOffset = loc;
        var offset = src.slice(0,loc.start).length;
        var prefix = src.slice(0, loc.start).replace(/[^\n]/g, " "); // padding it out so line numbers make sense
        // console.log("Instrumenting " + JSON.stringify(loc));
        // src = src.slice(0, loc.start) + instrumentJavaScript(prefix + script, options, true) + src.slice(loc.end);
        // console.log("And the final src is :" + src)
        src = src.slice(0, loc.start) + instrumentJavaScript(script, {filename:path, offset:offset}, true) + src.slice(loc.end);
    }
    //insert the tracer object at top of the html
    var doctypeMatch = /<!DOCTYPE[^>[]*(\[[^]]*\])?>/i.exec(src);
    var headIndx = src.indexOf('<head>');

    var preStr = postStr = "";
    if (doctypeMatch){
        preStr = doctypeMatch[0];
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
    // dumps the metadata information post instrumentation
    fs.writeFileSync(returnInfoFile, JSON.stringify(rewriter.metadata.allFnIds));
}

function instrumentJavaScript(src, options, jsInHTML){
    if (IsJsonString(src)){
        // if (jsInHTML)
        //     return src.replace(/^\s+|\s+$/g, '');
        // else 
        return src;
    }
    // console.log(`instrumenting src`)
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