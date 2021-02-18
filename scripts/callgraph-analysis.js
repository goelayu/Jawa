/**
 * This script analyser dynamic call graphs
 * and compute variance between functions executed and files invoked.
 */

const fs = require('fs'),
    program = require('commander');

program
    .option('-d, --dir [dir]','path to the directory containing call graphs')
    .option('-n, --num [num]','number of call graphs')
    .option('-v, --verbose','enable verbose logging')
    .parse(process.argv);

var parse = function(f){
    return JSON.parse(fs.readFileSync(f,'utf-8'));
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

var concatArr = function(arr){
    /**
     * Linearizes an array of arrays
     */
    var res = [];
    arr.forEach((a)=>{
        res = res.concat(a);
    });
    return unique(res);
}

var extractFileNames = function(fns){
    /**
     * Parses the dynamic cfg and creates a filename array
     */
    var filenames = new Set;
    fns.forEach((id)=>{
        var _filename =  id.split('-').slice(0,id.split('-').length - 4).join('-');
        if (_filename != '')
            filenames.add(_filename);
    })
    // console.log(filenames)
    return [...filenames];
}

var extractGraphs = function(dir, num){
    var graphs = [];
    for (var i = 0;i<num;i++){ 
        var g = parse(`${dir}/cg${i}`);
        var fns = unique(mergeValsArr(g));
        program.verbose && console.log(`extract graph ${i} with ${fns.length} nodes`)
        graphs.push(fns);
    }
    return graphs;
}

var unique = function(arr){
    // console.log(`turning ${arr.length} to unique`)
    return [...new Set(arr)];
}

var minArray = function(arr){
    var arrLen = arr.map(e=>e.length);
    return arrLen.indexOf(Math.min(...arrLen));
}

var fnUnionGrowth = function(graphs){
    var union = new Set;
    program.verbose && console.log(`graphs length : ${graphs.length}`)
    graphs.forEach((g)=>{
        program.vebose && console.log(`adding g of size ${g.length}`);
        g.forEach(union.add, union);
    });
    program.verbose && console.log(`union size: ${union.size}`);
    return union;
}

var cgVariance = function(dir, num){
    var graphs = extractGraphs(dir, parseInt(num));
    var filenames = [];
    // graphs.forEach((g,i)=>{
    //     var f = extractFileNames(g);
    //     program.verbose && console.log(`extract filenames ${i} with ${f.length} names`)
    //     filenames.push(f);
    // });

    var union = fnUnionGrowth(graphs);
    var smallestGraph = graphs[0];
    var fnCandidate = unique(smallestGraph);
    if (union.size == 0) return;
    console.log((union.size-fnCandidate.length)/fnCandidate.length);
    return;
    // var fnUnion = concatArr(graphs);
    // // console.log(`union fn length ${fnUnion.length}`)
    // var fileUnion = concatArr(filenames);
    // // console.log(`union filenames length ${fileUnion.length}`)

    // var smallestGraph = graphs[minArray(graphs)];
    // var fnCandidate = unique(smallestGraph),
    //     fileCandidate = unique(filenames[0]);

    // var fnDiff = fnUnion.length - fnCandidate.length;
    // var fileDiff = fileUnion.length - fileCandidate.length;
    // // console.log(fnUnion.length, graphs[0].length)
    // return fnUnion;
    console.log(fnDiff/fnCandidate.length, fileDiff/fileCandidate.length)
}
cgVariance(program.dir, program.num);
// module.exports = {
//     cgVariance : cgVariance
// }


