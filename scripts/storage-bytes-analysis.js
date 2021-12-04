/**
 * This script processes the JS files on a web page
 * and output the 1) total JS bytes on the page
 * 2) The bytes executed pre onload
 * 3) The bytes accounted for by event handlers
 * thereby showing the potential for storage savings
 */

var fs = require('fs'),
    program = require('commander'),
    util = require('../program_analysis/utils/util');

program
    .option('-l, --logDir [val]', 'directory containing javascript source files')
    .option('-p, --performance [val]', 'directory containing performance data')
    .parse(process.argv);

var parse = function (f) {
    return JSON.parse(fs.readFileSync(f, 'utf-8'));
}

var unique = function (arr) {
    return [...new Set(arr)];
}

var concatArr = function (dict) {
    /**
     * Linearizes an array of arrays
     */
    var res = [];
    Object.values(dict).forEach((a) => {
        res = res.concat(a);
    });
    return unique(res);
}

var extractFileNames = function (fns) {
    /**
     * Parses the dynamic cfg and creates a filename array
     */
    var filenames = new Set;
    fns.forEach((id) => {
        var _filename = id.split('-').slice(0, id.split('-').length - 4).join('-');
        if (_filename != '')
            filenames.add(_filename);
    })
    return [...filenames];
}

var getJsSrcSize = function (evtFiles) {
    var allJsFiles = fs.readdirSync(program.logDir);
    var totalSize = evtSize = 0;
    allJsFiles.forEach((file) => {
        if (file == '' || file == 'cg' || file == 'fg' || file == 'py_out'
            || file == 'missingFns' || file.indexOf('-script-') >= 0) return

        var s = fs.readFileSync(`${program.logDir}/${file}/${file}`);
        totalSize += s.length;
        if (evtFiles.indexOf(file) >= 0)
            evtSize += s.length;
    });
    console.log(evtFiles.length, allJsFiles.length)
    return [totalSize, evtSize];
}

var getIdLen = function (allIds) {
    // returns all ids an array
    var idSrcLen = {};
    Object.values(allIds).forEach((idDict) => {
        //idDict is a dict with key as ln and values as id, source length tuple
        Object.keys(idDict).forEach((fn) => {
            idSrcLen[fn] = idDict[fn];
        });
    });
    return idSrcLen;
}

var getAllIds = function () {
    var filenames = fs.readdirSync(program.logDir);
    var allIds = {};
    filenames.forEach((file) => {
        try {
            var idFile = `${program.logDir}/${file}/ids`;
            var ids = JSON.parse(fs.readFileSync(idFile, 'utf-8'));
            allIds[file] = ids;
        } catch (e) {
            program.verbose && console.log(`Error while readings ids for ${file}`);
        }
    });
    return allIds;
}

function main() {
    // var evtFnsFile = `${program.performance}/cg`;
    // var evtDict = parse(evtFnsFile);
    // var evtFns = concatArr(evtDict);
    // var evtFiles = extractFileNames(evtFns);
    // var [totalSize, evtSize] = getJsSrcSize(evtFiles);
    var totalSize = util.getFileSize(program.logDir)
    var allIds = getAllIds();

    var preLoadFns = parse(`${program.performance}/allFns`);
    var idSrcLen = getIdLen(allIds);

    var preloadSize = util.sumFnSizes(preLoadFns.preload, idSrcLen);
    // var preloadSizeExcluded = util.sumFnSizes(preLoadFns.preload, idSrcLen, evtFiles);

    console.log(totalSize, preloadSize);

}

main();