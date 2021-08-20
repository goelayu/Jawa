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

var getFilteredWrites = function(state, fil){
    var writeKeys = [];
    Object.keys(state).forEach((file)=>{
        if (fil.indexOf(file)<0) return;
        var st = state[file];
        writeKeys = writeKeys.concat(
            st
            .filter(e=>e[0].indexOf('_writes')>0)
            .map(e=>[e[0],e[1]])
        )
        // console.log(file, writeKeys)
    });
    program.verbose && console.log(`${writeKeys.length} writes made by filtered files`)
    return writeKeys;
}

var _hasStateOverlap = function(fileState, allWrites){
    var writesDict = {};
    allWrites.forEach((w)=>{
        w[0] = w[0].split('_writes')[0];
        if (!(w[0] in writesDict))
            writesDict[w[0]] = [];
        writesDict[w[0]].push(w[1]);
    })
    var readDict = {};
    fileState.forEach((r)=>{
        r[0] = r[0].split('_reads')[0];
        if (!(r[0] in readDict))
            readDict[r[0]] = [];
        readDict[r[0]].push(r[1]);
    });

    // compare states
    for (var ws of Object.keys(writesDict)){
        if (!(ws in readDict)) continue;
        var reads = readDict[ws];
        for (var write of writesDict[ws]){
            var match;
            if (match = reads.find(e => write == e)){
                program.verbose && console.log(match, ws)
                // return true;
            }
        }
    }
}

var hasStateOverlap = function(state, fil, unfil){
    var filteredWrites = getFilteredWrites(state, fil),
        overlap = false;
    outer: 
        for (var unfilFile of unfil){
            program.verbose && console.log(`comparing state of file ${unfilFile}`)
            var fileState = state[unfilFile].map(e=>[e[0],e[1]]).filter(e=>e[0].indexOf('reads')>0);
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
