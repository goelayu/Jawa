/**
 * This script tracks how many DOM
 * modifications do the filtered files make
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

var domWrites = function(all, filFiles){
    var writes = [];
    filFiles.forEach((f)=>{
        // console.log(JSON.stringify(all[f]))
        // console.log(f)
        var domwrites = all[f][0][1].filter(e=>e[1] == 'appendChild');
        // console.log(domwrites)
        writes = writes.concat(domwrites.map(e=>e[3]))
    })
    writes.forEach((w)=>{
        console.log(w)
    })
}

var main = function(){
    var unfiltered = parse(program.unfiltered),
        all = parse(program.all);

    var unfilFiles = Object.keys(unfiltered),
        allFiles = Object.keys(all);

    var filFiles = getFilteredFiles(all, unfilFiles);
    program.verbose && console.log(`filtered files: ${filFiles}`)
    domWrites(all, filFiles, unfilFiles);

}

main();