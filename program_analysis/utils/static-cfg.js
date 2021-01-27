/**
 * This module parses the static cfg created by https://github.com/goelayu/javascript-call-graph
 * and patches the output to create function 2 function relations as opposed to
 * caller location to function relations
 * 
 * Pretty-fy the JS files so using simply line start number would suffice to unique
 * identify each function declaration
 */

const fs = require('fs'),
    program = require('commander'),
    idExtractor = require('./fn-ids.js')
    cgPatcher = require('./patch-fg-cg');

program 
    .option('--src [src]', 'input source file')
    .option('--cfg [cfg]', 'static cfg')
    .option('--fg [fg]','static flow graph')
    .parse(process.argv);

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

var getLnFromString = function(strLoc){
    if (strLoc.indexOf('@')<0)
        return 'NATIVE';
    var _loc = strLoc.split('@')[1], loc = _loc.split(':')[0]; 
    return Number.parseInt(loc);
}

var findBoundingFn = function(strLoc, fns){
    /**
     * Find the immediately bounding function for this LOC
     */
    var curFnLn = Number.MIN_VALUE, curFn = null;
    var loc = getLnFromString(strLoc);
    fns.forEach((fn)=>{
        var lnStart = Number.parseInt(fn.split('-')[1]), 
            lnEnd = Number.parseInt(fn.split('-')[3]);
        // caller location after function start and this is the nearest function start
        // console.log(`comparing ${ln} with ${loc}`)
        if ( (loc > lnStart) && (lnStart > curFnLn) && (lnEnd > loc)){
            curFnLn = lnStart;
            curFn = fn;
        }
    });
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
    var loc = getLnFromString(strLoc);
    if (loc == 'NATIVE') return strLoc;
    var curFn = null;
    fns.forEach((fn)=>{
        var ln = fn.split('-')[1];
        if (ln == loc)
            curFn = fn;
    });
    if (!curFn) throw new Error(`no matching function found for ${strLoc}`);
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
        res.push([caller, callee]);
    });
    console.log(res);
}

function main(){
    var staticCfg = parse(program.cfg),
        source = parse(program.src),
        staticFg = parse(program.fg);

    var fnIds = idExtractor.parse(source);
    var parsedCfg = parseCFG(staticCfg);
    var parsedFg = parseCFG(staticFg);
    console.log(parsedCfg);
    cgPatcher.findMissingCallees(parsedCfg, parsedFg);
    console.log(parsedCfg);
    // patchCFG(parsedCfg, fnIds);
}

main();

