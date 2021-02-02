/**
 * This module takes in input a valid javascript source file
 * and outputs the identifiers of all javascript functions
 */

const falafel = require('falafel'),
    fs = require('fs'),
    program = require('commander'),
    beautifier = require('js-beautify'),
    astutils = require('./astutils');

// program
//     .option('-i, --input [input]','path to the input file')
//     .parse(process.argv);

var makeId = function (path, node) {
    var loc = node.loc;
    if (!loc) {
        console.error(`No location for node`);
        return;
    }
    // console.log(loc)
    return `${path}-${loc.start.line}-${loc.start.column}-${loc.end.line}-${loc.end.column}`;
}

var inArray = function(arr, val){
    var removeFileNameRegex = /\n..fn inside file.*\n/
    for (var i =0;i < arr.length;i++){
        if (arr[i].replace(removeFileNameRegex,'') == val)
            return i;
    }
    return -1;
}


var parse = function (src, options) {
    src = beautifier.js(src);
    var filename = options.filename;
    var allFnIds = {}, nodes = [];
    falafel(src, {
        locations: true,
        ranges: true
    }, function (node) {
        nodes.push(node);
    });

    var prgNode = nodes[nodes.length - 1];
    prgNode.attr = {filename: filename};
    astutils.addMetadata(prgNode);

    nodes.forEach((node)=>{
        if (node.type == 'FunctionDeclaration' || node.type == 'FunctionExpression'
            || node.type == 'ArrowFunctionExpression') {
            var id = makeId(filename, node);
            var idLen = id.split('-').length;
            var ln = Number.parseInt(id.split('-')[idLen - 4])
            var nodeAttr = node.attr;
            allFnIds[ln] =[id,nodeAttr.totalLen, nodeAttr.selfLen];
            
        }
    });
    return allFnIds;
}

function main() {
    var input = fs.readFileSync(program.input);
    parse(input);
}

// main();

module.exports = {
    parse: parse
}
