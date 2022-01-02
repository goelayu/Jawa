/**
 * This script parses the event js state 
 * and checks whether it contains closures.
 */

const fs = require('fs'),
    program = require('commander');

program
    .option('-f, --file <file>', 'File to parse')
    .parse(process.argv);

var containsClosure = function () {
    var state = JSON.parse(fs.readFileSync(program.file, 'utf8'));
    if (!Object.keys(state).length) return 'na';
    for (var evt in state) {
        var stateArr = state[evt];
        for (var entry of stateArr) {
            if (entry && entry.length == 3 && entry[0].indexOf('closure') > -1) {
                return true;
            }
        }
    }
    return false;
}

var iscomplexDOM = function () {
    var state = JSON.parse(fs.readFileSync(program.file, 'utf8'));
    var total = indirect = 0;
    Object.keys(state).forEach(function (evt) {
        var stateArr = state[evt].filter(e => e[0] == 'DOMS');
        if (stateArr.length) {
            total += stateArr[0][1].length;
            var relevant = stateArr[0][1].filter(e => e[0] == 'HTMLElement' || e[0] == 'Node');
            // console.log(relevant)
            indirect += relevant.filter(e => e[1].indexOf('RootNode') >= 0 || e[1].indexOf('siblings') >= 0
                || e[1].indexOf('hasChildNodes') >= 0).length;
        }
    });
    console.log(total, indirect)
}

iscomplexDOM();
// console.log(containsClosure());