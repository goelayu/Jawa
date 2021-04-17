/**
 * This module parses the static cfg created by https://github.com/goelayu/javascript-call-graph
 * and patches the output to create function 2 function relations as opposed to
 * caller location to function relations
 * 
 * Pretty-fy the JS files so using simply line start number would suffice to unique
 * identify each function declaration
 */

const fs = require('fs');

var parsedCfg;

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

var read = function(f){
    return fs.readFileSync(f,'utf-8');
}

var parseCfgId = function(strLoc){
    if (strLoc.indexOf('@')<0)
        return ['','NATIVE'];
    // var [file, _loc, fnLoc] = strLoc.split('@'), loc = _loc.split(':')[0]; 
    // return [file,Number.parseInt(loc), fnLoc];
    var file = strLoc.split('@')[0],
        fnLoc = strLoc.replace('@','-');
    return [file, fnLoc];
}

var preprocessFnIds = function(fns){
    var fnLns = {};
    Object.keys(fns).forEach((file)=>{
        var lns = Object.keys(fns[file]).map(e=>Number.parseInt(e));
        fnLns[file] = lns;
    });
    return fnLns;
}

var findBoundingFn = function(strLoc, fns, fnLns){
    /**
     * Find the immediately bounding function for this LOC
     */
    var _cache = {}; // caches ln to boundingFn
    var curFnLn = Number.MIN_VALUE, curFn = null;
    var [file,loc] = parseCfgId(strLoc);
    var cachedFn;
    if (cachedFn = _cache[loc])
        return cachedFn;
    var fileFns = fns[file], lns = fnLns[file], idx = 0; //Object.keys converts all keys to strings
    while (lns[idx] < loc && idx < lns.length) {
        // the final fn is a two tuple of id and source.length, just need id here
        var fn = fileFns[lns[idx]][0];
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
        _cache[loc] = 'GLOBAL';
        return 'GLOBAL'
    }
    _cache[loc] = curFn;
    return curFn;
}

var findMatchingFn = function(strLoc, fns, isCaller){
    /**
     * Find matching function based on line number
     * Doesn't need preprocessed fnIds since its a direct lookup
     */
    if (!strLoc) return null;
    var [file, fnLoc] = parseCfgId(strLoc);
    if (fnLoc == 'NATIVE') return strLoc;
    // console.log(file,loc,fnLoc)
    var index;
    if (isCaller){
        if (!fnLoc) return 'GLOBAL';
        index = fnLoc.split('-')[1];
    }
    else index = loc;
    var curFn = fns[file][index][0]; // first index is the id, 2nd is the source length

    if (!curFn) throw new Error(`no matching function found for ${strLoc}`);
    return curFn;
}

var getFnCallSites = function(fns){
    var cg = parsedCfg;
    var fnCallSites = {};//dict where key is fn and value is call sites
    cg.forEach((entry)=>{
        var [file, loc, fnLoc] = parseCfgId(entry[0]);
        if (!fnLoc) return;
        var index = fnLoc.split('-')[1];
        var caller = fns[file][index][0]
        if (!(caller in fnCallSites))
            fnCallSites[caller] = new Set;
        fnCallSites[caller].add(loc);
    });
    return fnCallSites;
}

var patchCFG = function(cfg, fnIds){
    var res = [];
    var fnLns = preprocessFnIds(fnIds);
    var uniqueCallers = {};
    cfg.forEach((entry,id)=>{
        // if (entry[0] in uniqueCallers)
        //     return;
        var caller, callee;
        var perc = id/cfg.length;
        console.log(`${perc*100}% done...`)
        caller = findBoundingFn(entry[0], fnIds, fnLns),
        callee = findMatchingFn(entry[1], fnIds);
        // console.log(`${entry} becomes ${[caller, callee]}`);
        res.push([caller, callee]);
        uniqueCallers[entry[0]] = true;
    });
    return res;
}

var dictStaticCFG = function(cfg){
    var res = {};
    cfg.forEach((entry,id)=>{
        var [_caller, _callee] = entry;
        if (_caller.indexOf('@') <0 || _callee.indexOf('@')<0) return;
        var caller = _caller.replace('@','-'),
            callee = _callee.replace('@','-');
        // var caller = findMatchingFn(entry[0], fnIds, true),
        //     callee = findMatchingFn(entry[1], fnIds, false);
        // var perc = id/cfg.length;
        // ((perc*100) % 10 == 0) && console.log(`${perc*100}% done...`)
        if (!(caller in res))
            res[caller] = new Set;
        res[caller].add(callee);
    });
    return res;
}

var _findMissingCallees = function(cg, fg){
    var cgCallees = [...new Set(cg.map(e=>e[0]))]; // remove dedup callees
    var allCallees = fg.map(e=>e[1]).filter(e=>e.indexOf('Callee')>=0)
        .map(e=>e.replace('"Callee(','').replace(')";',''));
    var missingCallees = allCallees.filter(e=> cgCallees.indexOf(e)<0);
    console.log(`Found total ${missingCallees.length} missing edges`);
    missingCallees.forEach((mc)=>{
        cg.push([mc, null]);
    });
    // console.log(cg);
}

function findMissingCallees(cg, fg){
    parsedCfg = parseCFG(read(cg));
    // var parsedFg = parseCFG(read(fg));
    // console.log(`done parsing cg and fg\nPatching cg and fg now`)
    // _findMissingCallees(parsedCfg, parsedFg);

    return dictStaticCFG(parsedCfg)
}

module.exports = {
    findMissingCallees : findMissingCallees,
    getFnCallSites : getFnCallSites
}