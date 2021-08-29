/**
 * Analyze at what rate for a given site
 * does a new JS file is crawled
 */


 var fs = require('fs'),
 crypto = require('crypto'),
 zlib = require('zlib'),
 program = require('commander');

program
 .option('-d, --dir [dir]','path to the src directory')
 .option('-u, --urls [urls]','list of urls the data needs to be processed on')
 .option('-v, --verbose')
 .option('-o, --output [output]','path to output file')
 .parse(process.argv);

var isSubset = function(sets, targetSet){
    for (var s of sets){
        if (targetSet.every(val => s.includes(val)))
            return true;
    }
    return false;
}


function main(){
    var pages = fs.readFileSync(program.urls,'utf-8').split('\n');

    var jsSets = [];
    var total = newSets = 0;
    pages.forEach((page,idx)=>{
        if (page == '') return;

        try {
            var srcDir = `${program.dir}/${page}`
            var jsFiles = fs.readdirSync(`${srcDir}`).filter(e=>e!='__metadata__' && e!='py_out');
        } catch (e) {
            // console.log(e)
            return;
        }
        if (isSubset(jsSets, jsFiles)) {
            total++; 
            return;
        }
        newSets++;
        jsSets.push(jsFiles);


    })
    console.log(total, newSets);
}
main();

