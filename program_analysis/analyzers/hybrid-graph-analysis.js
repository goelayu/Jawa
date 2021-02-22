/**
 * Generates a hybrid call graph
 * using information from both static and dynamic call graphs
 */

var fs = require('fs'),
    program = require('commander'),
    staticGraph = require('../analyzers/static/get-acg-graph'),
    CFA = require('../analyzers/static/control-flow-analysis');

program
    .option('-p, --performance [value]','path to performance directory')
    .option('-s, --source [value]','path to JS source directory')
    .option('-v, --verbose','enable verbose logging')
    .parse(process.argv);

var unique = function(arr){
    return [...new Set(arr)];
}

var parse = function(f){
    return JSON.parse(fs.readFileSync(f,'utf-8'));
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

var mergeValsArr = function(dict){
    /**
     * Takes a dictionary where values are arrays
     * and merges them together in a single array
     */

    var arr = [];
    Object.values(dict).forEach((val)=>{
        arr = arr.concat(val);
    });
    //add the keys as well since they are the root of the call gaphs
    arr = arr.concat(Object.keys(dict).map(e=>e.split(';;;;')[1]));
    return arr;
}

var loadDynamicGraphs = function(dir, num){
    var graphs = [];
    for (var i = 0;i<num;i++){ 
        try {
            var g = parse(`${dir}/cg${i}`);
            var fns = unique(mergeValsArr(g));
            program.verbose && console.log(`extract graph ${i} with ${fns.length} nodes`)
            graphs.push(fns);
        }catch (e) {
            program.verbose && console.error(`Error while fetching dynamic cg: ${i}`)
        }
    }
    return graphs;
}

var getControlFlowFns  = function(dynamicCG, filenames){
    var filenames = filenames.filter(e=>e.indexOf('-script-')<0)
    var paths = filenames.map(e=>`${program.source}/${e}/${e}`);
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
var learnNodes = function(hybridGraph, dynamicGraph, completeGraph, filenames){
    // learn all the nodes from the dynamic graph
    dynamicGraph.forEach(hybridGraph.add, hybridGraph);

    //extract static call graph for control flow functions
    var cntrlFlowFns = getControlFlowFns(dynamicGraph, filenames);
    var staticCntrlFlowFns = sliceGraph(completeGraph, cntrlFlowFns);
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
     * Learning param - 10
     * Eval param - 50
     */
    var learn = 10, eval = 30, evalLimit = dynamicGraphs.length;
        learnGraph = graphUnions(dynamicGraphs, learn),
        evalGraph = graphUnions(dynamicGraphs, eval);

    learnNodes(hybridGraph, learnGraph, completeGraph, filenames);
    while (!isComplete(hybridGraph, evalGraph)){
        program.verbose && console.log(`Comparing learnt ${learn} of size ${hybridGraph.size} with eval ${eval} of size ${evalGraph.size}`)
        learn += 10;
        learnGraph = graphUnions(dynamicGraphs, learn);
        if (learn == eval) {
            eval += 30;
            evalGraph = graphUnions(dynamicGraphs, eval);
        }
        learnNodes(hybridGraph, learnGraph, completeGraph, filenames);

        if (eval > Math.min(evalLimit,90))
            throw new Error(`Call graph didn't converge within the limit specified`);
    }
    program.verbose && console.log(`Comparing learnt ${learn} of size ${hybridGraph.size} with eval ${eval} of size ${evalGraph.size}`)
}

var buildCallGraph = function(){
    //get all the dynamic call graphs
    var dynamicGraphs = loadDynamicGraphs(program.performance, 100);

    // get the complete call graph
    var completeGraph = staticGraph.getCallGraph(program.source, dynamicGraphs[0], false);

    var filenames = extractFileNames(dynamicGraphs[0]);

    var hybridGraph = new Set;
    tuneGraph(hybridGraph, dynamicGraphs, completeGraph, filenames);

    console.log(`Final call graph: ${hybridGraph.size} nodes`)
    fs.writeFileSync(`${program.performance}/hybridcg`,JSON.stringify([...hybridGraph]));
}

buildCallGraph();

