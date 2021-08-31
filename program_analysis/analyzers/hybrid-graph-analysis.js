/**
 * Generates a hybrid call graph
 * using information from both static and dynamic call graphs
 */

var fs = require('fs'),
    program = require('commander'),
    staticGraph = require('../analyzers/static/get-acg-graph'),
    CFA = require('../analyzers/static/control-flow-analysis');
const { spawnSync } = require('child_process');

program
    .option('-p, --performance [value]','path to performance directory')
    .option('-s, --source [value]','path to JS source directory')
    .option('-u, --url [url]', 'url which is being processed')
    .option('-v, --verbose','enable verbose logging')
    .parse(process.argv);

var unique = function(arr){
    return [...new Set(arr)];
}

var parse = function(f){
    return JSON.parse(fs.readFileSync(f,'utf-8'));
}

var extractFilteredFns = function(fns, excludedFiles){
    var filFns = [];
    fns.forEach((f)=>{
        if (f.indexOf('-hash-')<0) return;
        var endIndx = 4;
        if (f.indexOf('-script-')>=0)
            endIndx = 6;
        var fnFile = f.split('-').slice(0,f.split('-').length - endIndx).join('-');
        if (excludedFiles.indexOf(fnFile)>=0) return;
        if (fnFile == 'undefined'){
            console.error('undefined filename');
            return;
        }
        filFns.push(f);
    });
    return filFns;
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

var loadDynamicGraphs = function(dir, filteredFiles, num){
    var graphs = [];
    for (var i = 0;i<num;i++){ 
        try {
            var g = parse(`${dir}/cg${i}`);
            var fns = unique(mergeValsArr(g));
            program.verbose && console.log(`extract graph ${i} with ${fns.length} nodes`)
            var filFns = extractFilteredFns(fns, filteredFiles);
            filFns.length != 0 && graphs.push(filFns);
        }catch (e) {
            program.verbose && console.error(`Error while fetching dynamic cg: ${i}`)
        }
    }
    return graphs;
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
var learnNodes = function(hybridGraph, dynamicGraph, completeGraph, filenames, filepaths){
    // learn all the nodes from the dynamic graph
    dynamicGraph.forEach(hybridGraph.add, hybridGraph);

    //extract static call graph for control flow functions
    // var cntrlFlowFns = getControlFlowFns(dynamicGraph, filenames, filepaths);
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
var tuneGraph = function(hybridGraph, dynamicGraphs, completeGraph, filenames, filepaths){
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

    learnNodes(hybridGraph, learnGraph, completeGraph, filenames, filepaths);
    while (!isComplete(hybridGraph, evalGraph)){
        program.verbose && console.log(`Comparing learnt ${learn} of size ${hybridGraph.size} with eval ${eval} of size ${evalGraph.size}`)
        learn += 5;
        learnGraph = graphUnions(dynamicGraphs, learn);
        if (learn == eval) {
            eval += 10;
            evalGraph = graphUnions(dynamicGraphs, eval);
        }
        learnNodes(hybridGraph, learnGraph, completeGraph, filenames, filepaths);

        if (eval > Math.min(evalLimit,10))
            throw new Error(`Call graph didn't converge within the limit specified`);
    }
    program.verbose && console.log(`Comparing learnt ${learn} of size ${hybridGraph.size} with eval ${eval} of size ${evalGraph.size}`)
}

var buildCallGraph = function(){

    // var _filterFiles = parse(`${program.source}/__metadata__/filtered`),
    //     filterFiles = _filterFiles.tracker.concat(_filterFiles.custom);
    //get all the dynamic call graphs
    var dynamicGraphs = loadDynamicGraphs(program.performance, [], 10);
    if (!dynamicGraphs.length){
        program.verbose && console.log('No dynamic call graphs obtained');
        fs.writeFileSync(`${program.performance}/hybridcg`,JSON.stringify([]));
        console.log(`Time: ${program.url} 0 0 0`);
        return;
    }

    // get the complete call graph
    var time = {};
    var completeGraph = staticGraph.getCallGraph(program.source, dynamicGraphs[0], true, time);
    console.log(`complete graph length: ${Object.keys(completeGraph.raw).length}`)
    var filePaths = staticGraph.contentFiles;
    var filenames = extractFileNames(dynamicGraphs[0]);

    var hybridGraph = new Set;
    var tuneStart = process.hrtime();
    tuneGraph(hybridGraph, dynamicGraphs, completeGraph, filenames, filePaths);
    var tuneEnd = process.hrtime(tuneStart);

    var hybridBenchTime = tuneEnd[0] + time.static[0];
    console.log(`Time: ${program.url} ${hybridBenchTime} ${tuneEnd[0]*1000 + tuneEnd[1]/(1000*1000)} ${time.static[0]*1000 + time.static[1]/(1000*1000)}`)
    console.log(`Final call graph: ${hybridGraph.size} nodes`)
    fs.writeFileSync(`${program.performance}/hybridcg`,JSON.stringify([...hybridGraph]));

    //delete temp files; cleanupa
    var staticTempDir = `${program.source}/__metadata__/static_temp`;
    fs.existsSync(staticTempDir) && spawnSync(`rm -r ${staticTempDir}`, {shell:true})

}

buildCallGraph();

