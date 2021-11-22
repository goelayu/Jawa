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
    .option('-v, --verbose', 'enable verbose logging')
    .parse(process.argv);


var parse = function(f){
    return JSON.parse(fs.readFileSync(f, 'utf-8'));
}

var filterAndStrState = function(state){
    var res = state;
    //filter
    Object.keys(res).forEach((evt)=>{
        res[evt] = res[evt].filter(e=>e[2].indexOf('__')<0);
    })
    //str state
    Object.keys(res).forEach((evt)=>{
        res[evt].forEach((entry,ind)=>{
            res[evt][ind] = JSON.stringify(entry);
        });
    });
    return res;
}

var compareStateSimple = function(allstate, filteredstate){
    return JSON.stringify(allstate) == JSON.stringify(filteredstate);
}

var compareState = function(all, filteredstate, handlers){
    // if (!allstate || !allstate.length) return true;
    var res = false, mismatches = 0;
    loop1: for (var entry of filteredstate){
        var found = false;
        loop2: for (var h of handlers){
            var allstate = all[h];
            if (!allstate || !allstate.length){
                found = true;
                break;
            }
            if (allstate.indexOf(entry)>=0){
                found = true;
                break;
            }
        }
        if (!found){
            mismatches++;
            program.verbose && console.log(`no entry found for ${entry}`)
            // return false;
        }
        // if (allstate.indexOf(entry)<0){
        //     console.log(`no entry found for ${entry}`)
        //     return false;
        // }
    }
    return mismatches;
}

var getMainElems = function(evtHandlers){
    var elemsToInvocs = {};
    for (var handler of evtHandlers){
        var elem = handler.split('_on')[0];
        if (!elemsToInvocs[elem])
            elemsToInvocs[elem] = [];
        elemsToInvocs[elem].push(handler);
    }
    return elemsToInvocs;
}

var stateMatches = function(all, filtered){
    all = filterAndStrState(parse(all)),
        filtered = filterAndStrState(parse(filtered));


    var evtHandlers = Object.keys(filtered);
    var elemsToInvocs = getMainElems(evtHandlers);
    var mismatch = 0;
    for (var handler of evtHandlers){
        program.verbose && console.log(handler)
        var elem = handler.split('_on')[0];
        mismatch += compareState(all, filtered[handler], elemsToInvocs[elem]);
        // if (!isMatch)
        //     return false;
    }
    return mismatch;
}

console.log(stateMatches(program.all, program.filtered));