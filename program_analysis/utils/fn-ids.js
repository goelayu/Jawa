/**
 * This module takes in input a valid javascript source file
 * and outputs the identifiers of all javascript functions
 */

const falafel = require('falafel'),
    fs = require('fs'),
    program = require('commander'),
    beautifier = require('js-beautify');

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
    var fns = options.fns; // return the id of the only these fns
    var fnIds = {}, allFnIds = {};
    falafel(src, {
        locations: true,
        ranges: true
    }, function (node) {
        if (node.type == 'FunctionDeclaration' || node.type == 'FunctionExpression'
            || node.type == 'ArrowFunctionExpression') {
            var id = makeId(filename, node);
            var idLen = id.split('-').length;
            var ln = Number.parseInt(id.split('-')[idLen - 4])
            allFnIds[ln] =id;
            var nodeIndex = inArray(options.fns, node.source());
            if (options.fns && nodeIndex == -1)
                return;
            // console.log(makeId('test', node));
            fns[nodeIndex].found = true;
            fnIds[ln] = id;
        }
    });
    console.log(`Found ids for ${Object.keys(fnIds).length}`)
    return [fnIds, allFnIds];
}

function main() {
    var input = fs.readFileSync(program.input);
    parse(input);
}

// main();

module.exports = {
    parse: parse
}
