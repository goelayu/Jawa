/**
 * This module takes in input a valid javascript source file
 * and outputs the identifiers of all javascript functions
 */

const falafel = require('falafel'),
    fs = require('fs'),
    program = require('commander');

// program
//     .option('-i, --input [input]','path to the input file')
//     .parse(process.argv);

var makeId = function(path, node){
    var loc = node.loc;
    if (!loc){
        console.error(`No location for node`);
        return;
    }
    // console.log(loc)
    return `${node.id ? node.id.name : path}-${loc.start.line}-${loc.start.column}-${loc.end.line}-${loc.end.column}`;
}

var parse = function(src){
    var fnIds = [];
    falafel(src, {
        locations:true, 
        ranges: true
    }, function(node){
        if (node.type == 'FunctionDeclaration' || node.type == 'FunctionExpression'){
            // console.log(makeId('test', node));
            fnIds.push(makeId('test', node));
        }
    });
    return fnIds;
}

function main(){
    var input = fs.readFileSync(program.input);
    parse(input);
}

// main();

module.exports = {
    parse: parse
}
