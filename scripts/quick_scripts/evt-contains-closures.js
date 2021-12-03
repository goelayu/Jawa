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

console.log(containsClosure());