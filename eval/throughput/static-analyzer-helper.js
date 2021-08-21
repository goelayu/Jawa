/**
 * takes as input a file location and list of dynamic call graphs
 * and return a final tuned call graph
 */
const fs = require('fs'),
{spawnSync} = require('child_process');

class Graph{
    constructor (data){
        this.raw = data;
        this.nodes = new Set;
        this.callers = new Set;
        this.callerCallee = {};
    }

    buildGraph(){
        this.raw.forEach((entry)=>{
            var [caller, callee] = entry;
            if (!(caller in this.callerCallee)){
                this.callerCallee[caller] = new Set;
                this.callers.add(caller);
                this.nodes.add(caller);
            }
            this.nodes.add(callee);
            this.callerCallee[caller].add(callee);
        });
    }
}

var extractFilteredFns = function(fns){
    var filFns = [];
    fns.forEach((f)=>{
        // if (f.indexOf('-hash-')<0) return;
        var endIndx = 4;
        var fnFile = f.split('-').slice(0,f.split('-').length - endIndx).join('-');
        // if (excludedFiles.indexOf(fnFile)>=0) return;
        if (fnFile == 'undefined'){
            console.error('undefined filename');
            return;
        }
        filFns.push(f);
    });
    return filFns;
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

var extractFileNames = function(dynamicCfg){
    /**
     * Parses the dynamic cfg and creates a filename array
     */
    var filenames = [];
    dynamicCfg.forEach((id)=>{
        var _filename =  id.split('-').slice(0,id.split('-').length - 4).join('-');
        if (filenames.indexOf(_filename)<0 && _filename != '')
            filenames.push(_filename);
    })
    return filenames;
}

var unique = function(arr){
    return [...new Set(arr)];
}

var mergeValsArr = function(dict){
    /**
     * Takes a dictionary where values are arrays
     * and merges them together in a single array
     */

    var arr = [];
    Object.values(dict).forEach((val)=>{
        if (!Array.isArray(val)) return;
        arr = arr.concat(val);
    });
    //add the keys as well since they are the root of the call gaphs
    arr = arr.concat(Object.keys(dict).map(e=>e.split(';;;;')[1]));
    return arr;
}

var loadDynamicGraphs = function(srcGraphs){
    var graphs = [];
    for (var i = 0;i<srcGraphs.length;i++){ 
        try {
            var fns = unique(mergeValsArr(srcGraphs[i]));
            console.log(`extract graph ${i} with ${fns.length} nodes`)
            var filFns = extractFilteredFns(fns);
            filFns.length != 0 && graphs.push(filFns);
        }catch (e) {
            console.error(`Error while fetching dynamic cg: ${i}`,e)
        }
    }
    return graphs;
}

var runSA = function(srcs, out){
    const STATICANALYSER = `${__dirname}/../../program_analysis/analyzers/javascript-call-graph/main.js `
    var cmd = `node --max-old-space-size=64512 ${STATICANALYSER} ${srcs} --cg 2>${out}/cg`;
    spawnSync(cmd, {shell:true} );
    var parsedCG = dictStaticCFG(parseCFG(read(`${out}/cg`)));
    return new Graph(parsedCG);
}

var getControlFlowFns  = function(dynamicCG, filenames, filepaths){
    var filenames = filenames.filter(e=>e.indexOf('-script-')<0)
    var paths = filenames.map(e=>filepaths.filter(f=>f.indexOf(e)>=0)[0]);
    var options = {
        filepaths:paths, filenames:filenames, fns:[...dynamicCG]
    };
    var controlFlowFns = CFA.analyze(options);
    program.verbose && console.log(`only ${controlFlowFns.length} have control flow stmnts in them`);
    return controlFlowFns
}

var isNativeFn = function(fnId){
    return fnId.split('-').length < 4;
}

/**
 * 
 * @param {set} completeGraph 
 * @param {set} nodes
 * 
 * Traverse complete graph and returns subtree for nodes 
 */
var sliceGraph = function(completeGraph, nodes){
    var res = new Set;
    nodes.forEach((n)=>{
        var callees = completeGraph.raw[n];
        if (!callees) return;
        // remove native and null callees
        callees = [...callees].filter(e=> e && !isNativeFn(e));
        callees.forEach(res.add, res);
    });
    return res;
}

/**
 * 
 * @param {array} staticGraph 
 * @param {array} dynamicGraph 
 */
var learnNodes = function(hybridGraph, dynamicGraph, completeGraph){
    // learn all the nodes from the dynamic graph
    dynamicGraph.forEach(hybridGraph.add, hybridGraph);

    //extract static call graph for control flow functions
    // var cntrlFlowFns = getControlFlowFns(dynamicGraph, filenames, filepaths);
    // var staticCntrlFlowFns = sliceGraph(completeGraph, cntrlFlowFns);
    var staticCntrlFlowFns = sliceGraph(completeGraph, [...dynamicGraph]);
    staticCntrlFlowFns.forEach(hybridGraph.add, hybridGraph);
    return hybridGraph;
}

/**
 * 
 * @param {arr} graphs 
 * @param {int} num
 * 
 * Given an array of graphs, takes the first num graphs and returns a union graph 
 */
var graphUnions = function(graphs, num){
    var res = new Set;
    graphs.slice(0,num).forEach((g)=>{
        g.forEach(res.add, res);
    });
    return res;
}

var isComplete = function(hybridGraph, truthGraph){
    return new Set([...truthGraph].filter(x => !hybridGraph.has(x))).size == 0;
}

/**
 * Generates a static call graph and then
 * optimizes it using dynamic graphs
 */
var tuneGraph = function(hybridGraph, dynamicGraphs, completeGraph, filenames){
    /**
     * Initialize tunining parameters
     * Learning param - 5
     * Eval param - 10
     */
    var learn = 1, eval = 2, evalLimit = dynamicGraphs.length;
        learnGraph = graphUnions(dynamicGraphs, learn),
        evalGraph = graphUnions(dynamicGraphs, eval);

    if (dynamicGraphs.length == 1){
        program.verbose && console.log(`Only a single DCG obtained: Can't train`);
        return;
    }

    learnNodes(hybridGraph, learnGraph, completeGraph);
    while (!isComplete(hybridGraph, evalGraph)){
        console.log(`Comparing learnt ${learn} of size ${hybridGraph.size} with eval ${eval} of size ${evalGraph.size}`)
        learn += 1;
        learnGraph = graphUnions(dynamicGraphs, learn);
        if (learn == eval) {
            eval += 2;
            evalGraph = graphUnions(dynamicGraphs, eval);
        }
        learnNodes(hybridGraph, learnGraph, completeGraph);

        if (eval > Math.min(evalLimit,10))
            throw new Error(`Call graph didn't converge within the limit specified`);
    }
    console.log(`Comparing learnt ${learn} of size ${hybridGraph.size} with eval ${eval} of size ${evalGraph.size}`)
}

var getCompleteGraph = function(graphs, srcDir){
    var finGraphs = loadDynamicGraphs(graphs);
    if (!finGraphs.length) {
        console.log('Done')
        return;
    }
    var filenames = extractFileNames(finGraphs[0]);
    var srcFiles = filenames.map(e=>`${srcDir}/${e}`).join(' ');
    var tempOut = '/tmp/webarchive/';
    var completeGraph = runSA(srcFiles, tempOut);
    console.log(`complete graph length: ${Object.keys(completeGraph.raw).length}`)
    var hybridGraph = new Set;
    tuneGraph(hybridGraph, finGraphs, completeGraph);
    console.log('Done')
    return;
}


module.exports = {
    getCompleteGraph: getCompleteGraph
}