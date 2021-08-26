/**
 * This script checks whether a give page
 * read the global variable in a safe manner
 * by looking at the output of the analyzer_mm.py files
 */

var fs = require('fs'),
    program = require('commander');


program
    .option('-f, --files [files]', 'path to the list of files')
    .parse(process.argv);


var parse = function(f){
    return fs.readFileSync(f, 'utf-8');
}

var hasSafeRead = function(){
    var files = parse(program.files).split('\n');

    for (var f of files){
        if (f == '') continue;
        var content = parse(f);
        if (content.indexOf('true')>=0)
            return true;
    }

    return false;
}

console.log(hasSafeRead());