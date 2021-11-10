

var program = require('commander'),
    fs = require('fs'),
    zlib = require('zlib');


program
    .option('-i, --input [input]', 'path to input' )
    .option('-o, --output [output]', 'path to output')
    .option('-z, --zip', 'is zipped')
    .parse(process.argv);

    var removeComments = function(content, zip){
        if (zip){
            content = zlib.gunzipSync(content).toString()
        } else content = content.toString()
        return content.replace(/FILE ARCHIVED [\s\S]*./g,"");
    }

var rewrite = function(){
    var input = fs.readFileSync(program.input);
    var add = '<script> console.log("Tsting")</script>';
    if (program.zip){
        input = zlib.gunzipSync(input).toString()
    } else input = input.toString();
    input = add + input;

    if (program.zip){
        input = zlib.gzipSync(input);
    }

    fs.writeFileSync(program.output, input);
}

rewrite()