/**
 * This module contains utility functions
 */

 const fs = require('fs'),
    program = require('commander');


program
    .option('-i, --input [input]','path to the input file')
    .option('-t, --type [type]','type of run')
    .option('-o, --output [output]','path to output file')
    .parse(process.argv);


var parse = function(f){
    return JSON.parse(fs.readFileSync(f));
}

var pruneDB = function(d){
    var critera = "Top/News"
    d.forEach((entry)=>{
        if (entry.category.indexOf(critera)>=0)
            console.log(entry.url);
    });
}

if (program.type == "prune")
    pruneDB(parse(program.input));