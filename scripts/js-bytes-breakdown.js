/**
 * This scripts estimates the bytes of javascript
 * executed by a supposedely live version of the web page
 */

var fs = require('fs'),
    program = require('commander'),
    utils = require('../program_analysis/utils/util');

program
    .option('-j, --js-src [value]','path to the js source files')
    .option('-p, --performance [value]','path to the performance files')
    .parse(process.argv);


var parse = function(f){
    return JSON.parse(fs.readFileSync(f,'utf-8'));
}

var unionSize = function(){
    var allIds = utils.getAllIds(program.jsSrc);
    var idSrcLen = utils.getIdLen(allIds);

    var nRuns = 5, preLoadFns = new Set;
    for (var i = 0;i<=nRuns;i++){
        var _fns = parse(`${program.performance}/${i}/allFns`);
        _fns.preload.forEach(preLoadFns.add, preLoadFns);
    }

    var totalSize = utils.sumFnSizes([...preLoadFns], idSrcLen);
    console.log(totalSize);

}

var breakdown = function(){
    // var allIds = utils.getAllIds(program.jsSrc);
    // var idSrcLen = utils.getIdLen(allIds);
    // var fns = parse(`${program.performance}/allFns`);
    // var analyticFiles = parse(`${program.jsSrc}/__metadata__/analytics`);

    // var [preload, preloadTotal] = utils.sumFnSizes([...fns.preload], idSrcLen, null, analyticFiles);
    // var [postload, postloadTotal] = utils.sumFnSizes([...fns.postload], idSrcLen, null, analyticFiles);

    var totalJs = utils.getFileSize(program.jsSrc, fs.readdirSync(program.jsSrc));
    // var totalJs = utils.getFileSize(program.jsSrc, );

    // console.log(preload, postload, (preloadTotal+postloadTotal)-(preload+postload), totalJs);
    console.log(totalJs)

}

// unionSize();
breakdown();