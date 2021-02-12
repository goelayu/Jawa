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
    return [...filenames];
}

var extractGraphs = function(dir, num){
    var graphs = [];
    for (var i = 0;i<num;i++){ 
        var g = parse(`${dir}/cg${i}`);
        var fns = mergeValsArr(g);
        program.verbose && console.log(`extract graph ${i} with ${fns.length} nodes`)
        graphs.push(fns);
    }
    return graphs;
}

var unique = function(arr){
    console.log(`turning ${arr.length} to unique`)
    return [...new Set(arr)];
}

var cgVariance = function(){
    var graphs = extractGraphs(program.dir, parseInt(program.num));
    var filenames = [];
    graphs.forEach((g,i)=>{
        var f = extractFileNames(g);
        program.verbose && console.log(`extract filenames ${i} with ${f.length} names`)
        filenames.push(f);
    });

    var fnUnion = concatArr(graphs);
    console.log(`union fn length ${fnUnion.length}`)
    var fileUnion = concatArr(filenames);
    console.log(`union filenames length ${fileUnion.length}`)


    var fnCandidate = unique(graphs[0]),
        fileCandidate = unique(filenames[0]);

    var fnDiff = fnUnion.length - fnCandidate.length;
    var fileDiff = fileUnion.length - fileCandidate.length;
    // console.log(fnUnion.length, graphs[0].length)
    console.log(fnDiff/fnCandidate.length, fileDiff/fileCandidate.length)
}
console.log(program.verbose)
cgVariance();


