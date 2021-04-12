/**
 * This script analyzes function size distribution
 * for used and unused functions
 */

const fs = require('fs'),
    program = require('commander'),
    beautifier = require('js-beautify'),
    utils = require('../../program_analysis/utils/util')

program
    .option('-p, --performance [value]','path to the performance directory')
    .option('-s, --js-src [value]','path to the js source files')
    .parse(process.argv);


var getFnSizes = function(){
    var allIds = utils.getAllIds(program.jsSrc);
    var fnSize = utils.getIdLen(allIds);
    return fnSize;
}

var fnDistribution = function(fnLens, total, execSizes, unexecSizes){
    var curTotal = 0;
    // fnLens.forEach((len)=>{
    //     curTotal += len;
    //     console.log(curTotal, total)
    // })

    var execLens = Object.values(execSizes).map(e=>e).sort((a,b)=>{return b - a});
    var unexecLens = Object.entries(unexecSizes).sort((a,b)=>{return b[1] - a[1]});
    // console.log(execLens)
    // execLens.forEach((len)=>{
    //     curTotal += len;
    //     console.log(curTotal, total)
    // })
    unexecLens.forEach((entry)=>{
        curTotal += entry[1];
        console.log(curTotal, total, ...entry)
    })

}

var execDistribution = function(exec, fnSizes){
    var execSizes = {}, unexecSizes = {};
    var cloneSizes = Object.assign({},fnSizes);
    // console.log(fnSizes)
    exec.forEach((fn)=>{
        if (!(fn in cloneSizes))
            return;
        execSizes[fn] = cloneSizes[fn][1];
        delete cloneSizes[fn];
    })

    Object.keys(cloneSizes).forEach((fn)=>{
        unexecSizes[fn] = cloneSizes[fn][1];
    })
    return [execSizes, unexecSizes]

}

var getPerFileFns = function(execFns){
    var fileFns = {};
    execFns.forEach((fn)=>{
        var endIndx = 4;
        if (fn.indexOf('-script-')>=0)
            endIndx = 6;
        var fnFile = fn.split('-').slice(0,fn.split('-').length - endIndx).join('-');
        if (!(fnFile in fileFns))
            fileFns[fnFile]=[];
        fileFns[fnFile].push(fn);
    });
    return fileFns;
}

var fileDistribution = function(allIds, execFns, fnSizes, ignoreFiles){
    var filenames = Object.keys(allIds);
    var fileUsed = {};
    var fileFns = getPerFileFns(execFns);
    filenames.forEach((file)=>{
        if (ignoreFiles.indexOf(file)>=0) return;
        fileUsed[file]=[];
        var totalSize = Object.values(allIds[file]).reduce((acc,cur)=>{return acc+cur[2]},0);
        var execSize = 0;
        fileFns[file] && fileFns[file].forEach((fn)=>{
            if (!(fn in fnSizes)) return;
            execSize += fnSizes[fn][1];
        });
        // var fileLen = beautifier.js(fs.readFileSync(`${program.jsSrc}/${file}/${file}`,'utf-8')).length;
        fileUsed[file]=[totalSize, execSize];
    })
    return fileUsed;
}

var prettyPrint = function(dict){
    var total = exec = 0;
    Object.keys(dict).forEach((file)=>{
        console.log(file, ...dict[file]);
        total += dict[file][0], exec += dict[file][1];
    });
    console.log(total, exec);
}

var cmpFileFnSize = function(){
    var allIds = utils.getAllIds(program.jsSrc);
    var filenames = fs.readdirSync(program.jsSrc);
    var ignoreJS = JSON.parse(fs.readFileSync(`${program.jsSrc}/__metadata__/analytics`));
    var _execFns = JSON.parse(fs.readFileSync(`${program.performance}/allFns`),'utf-8');
    var execFns = new Set;
    _execFns.preload.forEach((fn)=>{
        execFns.add(fn);
    });
    _execFns.postload.forEach((fn)=>{
        execFns.add(fn);
    })
    execFns = [...execFns];
    
    var fnSizes = utils.getIdLen(allIds);

    var fileDst = fileDistribution(allIds, execFns, fnSizes, ignoreJS);
    prettyPrint(fileDst)
    return;
    // console.log(execFns)
    var [execSizes, unexecSizes] = execDistribution(execFns, fnSizes);
    var totalSelf = Object.values(fnSizes).reduce((acc,cur)=>{return acc+cur[1];},0);
    var fnLens = Object.values(fnSizes).map(e=>e[1]).sort((a,b)=>{return b - a});
    fnDistribution(fnLens, totalSelf,execSizes, unexecSizes);
    filenames.forEach((file)=>{
        var f = `${program.jsSrc}/${file}/${file}`;
        var ids = allIds[file];
        if (fs.existsSync(f) && ids){
            // var fsrc = fs.readFileSync(f, 'utf-8');
            // var beautifiedJS = beautifier.js(fsrc);
            // var totalFile = beautifiedJS.length;
            // var totalSelf = Object.values(ids).reduce((acc,cur)=>{return acc+cur[2];},0);
            // var fnLens = Object.values(ids).map(e=>e[1]).sort((a,b)=>{return b - a});
            // fnDistribution(fnLens, totalSelf);
            // console.log(file, totalFile, totalSelf);
        }
    })
}

// var fnSizes = getFnSizes();
// console.log(fnSizes);
// Object.values(fnSizes).forEach((size)=>{
//     console.log(size[1]);
// });

cmpFileFnSize();


