/**
 * 
 * This script compares the state accessed by event handlers
 * before and after filtering 
 * to detect whether the page fidelity was maintained or not. 
 */

const fs = require('fs'),
    program = require('commander');

program 
    .option('-a, --all [all]', 'path to evt state for all js files')
    .option('-f, --filtered [filtered]','path to evt state post filtering')
    .parse(process.argv);


var parse = function(f){
    return JSON.parse(fs.readFileSync(f, 'utf-8'));
}

var compareState = function(allstate, filteredstate){
    return JSON.stringify(allstate) == JSON.stringify(filteredstate);
}

var stateMatches = function(all, filtered){
    all = parse(all),
        filtered = parse(filtered);

    var evtHandlers = Object.keys(filtered);

    for (var handler of evtHandlers){
        var isMatch = compareState(all[handler], filtered[handler]);
        if (!isMatch)
            return false;
    }
    return true;
}

console.log(stateMatches(program.all, program.filtered));