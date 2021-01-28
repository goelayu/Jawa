

const fs = require('fs'),
    program = require('commander');

program
    .version("0.1.0")
    .option("-i, --input [input]","path to the input file")
    .option("-n, --name [name]", "name of the file being instrumented")
    .option("-t , --type [type]", "[HTML | Javascript (js)]", "html")
    .option('-r, --rewriter [rewriter]', 'type of static rewriter to use')
    .parse(process.argv)



var rewriter = null;

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function initRewriter(){
    rewriter = require(`./analyzers/rewriters/${program.rewriter}`);
}

function getTracerObj(){
    return fs.readFileSync('./analyzers/runtime/tracer.js','utf-8');
}

function instrumentHTML(src){
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

    var tracerStr = `<script> ${getTracerObj()} </script>`;

    src = preStr + tracerStr + postStr;

    return src;

}

function instrumentJavaScript(src, filename, jsInHTML){
    if (IsJsonString(src)){
        if (jsInHTML)
            return src.replace(/^\s+|\s+$/g, '');
        else return src;
    }
    src = rewriter.instrument(src, {filename: filename});
    console.log(`returned: ${JSON.stringify(src)}`);
    return src;
}

function main(){
    initRewriter();
    var url = program.name.split(';;;')[0];
    var _filename = program.name.split(';;;;')[1];
    _filename = _filename == "/" ? url + _filename : _filename;
    var filename = _filename.length>50?_filename.substring(_filename.length-50,_filename.length) : _filename;
    
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
        src = instrumentJavaScript(src, filename, false)
    } else {
        src = instrumentHTML(src, filename)
    }

    fs.writeFileSync(program.input, src)
}

main();