/**
 * This module compares the state accessed
 * by filtered and unfiltered JS files
 */

var program = require('commander'),
    fs = require('fs');

program
    .option('-u, --unfiltered [unfiltered]','path to unfiltered state accesses')
    .option('-a, --all [all]','path to all state accesses')
    .option('-v, --verbose','enable verbose logging')
    .parse(process.argv);


var parse = function(f){
    return JSON.parse(fs.readFileSync(f, 'utf-8'));
}

var getFilteredFiles = function(all, unfiltered){
    var ret = [];
    program.verbose && console.log(`${Object.keys(all).length} total files`)
    Object.keys(all).forEach((u)=>{
        if (unfiltered.indexOf(u)<0)
            ret.push(u);
    });
    program.verbose && console.log(`${ret.length} filtered files`)
    return ret;
}

var getExecutedFiles = function(allFiles, endFile, filFiles){
    var ret = [];
    for (var f of allFiles){
        if (f == endFile)
            return ret;
        if (filFiles.indexOf(f)>=0)
            ret.push(f);
    }
}

var getFilteredWrites = function(state, files){
    var writeKeys = [],
     fileNames = files.map(e=>e.split('_count')[0]);
    Object.keys(state).forEach((f)=>{
        if (files.indexOf(f)<0) return;
        var st = state[f];
        writeKeys = writeKeys.concat(
            st
            .filter(e=>e[0].indexOf('_writes')>0 && !fileNames.find(f=>e[0].indexOf(f)>=0))
            .map(e=>[e[0],e[1]])
        )
        // console.log(file, writeKeys)
    });
    // program.verbose && console.log(`${writeKeys.length} writes made by filtered files`)
    return writeKeys;
}


var unfilDict = {reads:{}, writes:{}};
var _hasStateOverlap = function(fileState, allWrites){
    if (!allWrites.length) return false;
    var filWritesDict = {};
    allWrites.forEach((w)=>{
        w[0] = w[0].split('_writes')[0];
        if (!(w[0] in filWritesDict))
        filWritesDict[w[0]] = [];
        filWritesDict[w[0]].push(w[1]);
    })
    // re initialize the reads for the current state
    unfilDict.reads = {};
    fileState.forEach((r)=>{
        var type = r[0].indexOf('_reads') > 0 ? 'reads' : 'writes';
        if (type == 'reads') return;
        r[0] = r[0].split(`_${type}`)[0];
        if (!(r[0] in unfilDict[type]))
            unfilDict[type][r[0]] = [];
        unfilDict[type][r[0]].push(r[1]);
    });
    fileState.forEach((r)=>{
        var type = r[0].indexOf('_reads') > 0 ? 'reads' : 'writes';
        if (type == 'writes') return;
        r[0] = r[0].split(`_${type}`)[0];

        if (unfilDict.writes[r[0]] && unfilDict.writes[r[0]].indexOf(r[1])>=0)
            return;
            
        if (!(r[0] in unfilDict[type]))
            unfilDict[type][r[0]] = [];
        unfilDict[type][r[0]].push(r[1]);
    });


    // compare states
    for (var ws of Object.keys(filWritesDict)){
        if (!(ws in unfilDict.reads)) continue;
        var reads = unfilDict.reads[ws];
        for (var write of filWritesDict[ws]){
            var match;
            if (match = reads.find(e => write == e)){
                console.log(match, ws)
                return true;
            }
        }
    }
}

var hasStateOverlap = function(state, fil, unfil){
    var allFiles = Object.keys(state);
    var filNames = fil.map(e=>e.split('_count')[0]);
    for (var unfilFile of unfil){
        if (!(unfilFile in state)) continue;
        // program.verbose && console.log(`comparing state of file ${unfilFile}`)
        var fileState = state[unfilFile].map(e=>[e[0],e[1]])
        // filter(e=>e[0].indexOf('global_reads')>=0 && !filNames.find(f=>e[0].indexOf(f)>=0) && e[0].indexOf('jquery')<0);
        var executedFiles = getExecutedFiles(allFiles, unfilFile, fil);
        var filteredWrites = getFilteredWrites(state, executedFiles)
        if (_hasStateOverlap(fileState, filteredWrites))
            return true;
        // inner:
        //     for (var write of filteredWrites){
        //         var match;
        //         if (match = fileState.find(e => e[0] == write[0] && e[1] == write[1])){
        //             program.verbose && console.log(write,match)
        //             return true;
        //         }
        //     }

        };
    return false;
}


var main = function(){
    var unfiltered = parse(program.unfiltered),
        all = parse(program.all);

    var unfilFiles = Object.keys(unfiltered),
        allFiles = Object.keys(all);

    var filFiles = getFilteredFiles(all, unfilFiles);
    program.verbose && console.log(`filtered files: ${filFiles}`)
    console.log(hasStateOverlap(all, filFiles, unfilFiles));

}

main();
