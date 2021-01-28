/**
 * This module parses the static cfg created by https://github.com/goelayu/javascript-call-graph
 * and patches the output to create function 2 function relations as opposed to
 * caller location to function relations
 * 
 * Pretty-fy the JS files so using simply line start number would suffice to unique
 * identify each function declaration
 */

const fs = require('fs');

// program 
//     .option('--src [src]', 'input source file')
//     .option('--cfg [cfg]', 'static cfg')
//     .option('--fg [fg]','static flow graph')
//     .parse(process.argv);

var parseCFG = function(strCfg){
    /**
     * Parsed CFG is an array with each entry defining a caller callee relation
     * Each entry is a two tuple with first entry being caller function, and second entry
     * being callee function
     */
    var  cfg = [];
    strCfg.split('\n').forEach((entry)=>{
        if (!entry.length) return;
        if (entry.indexOf('->')<0) return;

        var [caller, callee] = entry.split('->');
        caller = caller.trim(), callee = callee.trim();
        cfg.push([caller, callee]);
    });
    return cfg;
}

var parseCfgId = function(strLoc){
    if (strLoc.indexOf('@')<0)
        return ['','NATIVE'];
    var [file, _loc] = strLoc.split('@'), loc = _loc.split(':')[0]; 
    return [file,Number.parseInt(loc)];
}

var findBoundingFn = function(strLoc, fns){
    /**
     * Find the immediately bounding function for this LOC
     */
    var curFnLn = Number.MIN_VALUE, curFn = null;
    var [file,loc] = parseCfgId(strLoc);
    var fileFns = fns[file], lns = Object.keys(fileFns), idx = 0;
    while (lns[idx] < loc && idx < lns.length) {
        var fn = fileFns[lns[idx]];
        var lnStart = lns[idx],
            idLen = fn.split('-').length;
            lnEnd = Number.parseInt(fn.split('-')[idLen - 2]);
        if ( (lnStart > curFnLn) && (lnEnd > loc)){
            curFnLn = lnStart;
            curFn = fn;
        }
        idx++;
    }
    // fns.forEach((fn)=>{
    //     var lnStart = Number.parseInt(fn.split('-')[1]), 
    //         lnEnd = Number.parseInt(fn.split('-')[3]);
    //     // caller location after function start and this is the nearest function start
    //     // console.log(`comparing ${ln} with ${loc}`)
    //     if ( (loc > lnStart) && (lnStart > curFnLn) && (lnEnd > loc)){
    //         curFnLn = lnStart;
    //         curFn = fn;
    //     }
    // });
    if (curFnLn == Number.MIN_VALUE) {
        // the current caller location is in the global scope
        return 'GLOBAL'
    }
    return curFn;
}

var findMatchingFn = function(strLoc, fns){
    /**
     * Find matching function based on line number
     */
    if (!strLoc) return null;
    var [file, loc] = parseCfgId(strLoc);
    if (loc == 'NATIVE') return strLoc;
    var curFn = fns[file][loc];

    // fns.forEach((fn)=>{
    //     var ln = fn.split('-')[1];
    //     if (ln == loc)
    //         curFn = fn;
    // });
    if (!curFn) console.error(`no matching function found for ${strLoc}`);
    return curFn;
}

var parse = function(f){
    return fs.readFileSync(f, 'utf-8');
}

var patchCFG = function(cfg, fnIds){
    var res = [];
    cfg.forEach((entry)=>{
        var caller, callee;
        caller = findBoundingFn(entry[0], fnIds),
        callee = findMatchingFn(entry[1], fnIds);
        // console.log(`${entry} becomes ${[caller, callee]}`);
        res.push([caller, callee]);
    });
    console.log(res);
    return res;
}

var _findMissingCallees = function(cg, fg){
    var cgCallees = cg.map(e=>e[0]);
    var allCallees = fg.map(e=>e[1]).filter(e=>e.indexOf('Callee')>=0)
        .map(e=>e.replace('"Callee(','').replace(')";',''));
    var missingCallees = allCallees.filter(e=> cgCallees.indexOf(e)<0);
    console.log(missingCallees);
    missingCallees.forEach((mc)=>{
        cg.push([mc, null]);
    });
    // console.log(cg);
}

var read = function(f){
    return fs.readFileSync(f,'utf-8');
}

function findMissingCallees(cg, fg, allIds){
    var parsedCfg = parseCFG(read(cg));
    var parsedFg = parseCFG(read(fg));
    _findMissingCallees(parsedCfg, parsedFg);

    return patchCFG(parsedCfg, allIds);
}

module.exports = {
    findMissingCallees : findMissingCallees
}