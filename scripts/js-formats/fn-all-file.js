/**
 * This script computes storage overheads
 * when each JS file contains all the JS functions that were executed across
 * different pages
 */

var fs = require('fs'),
    program = require('commander'),
    utils = require('../../program_analysis/utils/util');

program
    .option('-d, --dir [dir]',"directory containing resource files")
    .option('-p, --performance [performance]','directory containing performance data')
    .option('-u, --urls [urls]', 'file containing list of urls for dedup analysis')
    .option('-v, --verbose', 'enable verbose logging')
    .parse(process.argv);

var parse = function(f){
    return JSON.parse(fs.readFileSync(f,'utf-8'));
}

var convertToFiles = function(fns, rfiles){
    fileFns = {};
    fns.forEach((f)=>{
        var fnFile = f.split('-').slice(0,f.split('-').length - 4).join('-');
        if (rfiles.indexOf(fnFile)<0) return;
        if (!(fnFile in fileFns))
            fileFns[fnFile] = [];
        
        fileFns[fnFile].push(f);
    });
    return fileFns;
}

/**
 * 
 * @param {} fns 
 * @param {*} resDir 
 * @param {*} rfiles 
 * For a given set of fns executed for a particular page, 
 * returns a set of files, for each file  lists the functions and the corresponding
 * length information
 */
var getPerFileData = function(fns, resDir, rfiles){
    var fileFns = convertToFiles(fns, rfiles);
    //get all ids for this dir
    var allIds = getAllIds(rfiles, resDir);
    
    var idSrcLen = utils.getIdLen(allIds),
        res = {};
    Object.keys(fileFns).forEach((file)=>{
        var fns = fileFns[file];
        res[file] = fns; // store a 2-tuple of fn arrays and their corresponding size
    });
    res.idSrcLen = idSrcLen;
    return res;
}

var getAllIds = function(filenames, dir){
    var allIds = {};
    filenames.forEach((file)=>{
        try {    
            var idFile = `${dir}/${file}/ids`;
            var ids = JSON.parse(fs.readFileSync(idFile, 'utf-8'));
            allIds[file] = ids;
        } catch (e) {
            program.verbose && console.error(`Error while readings ids for ${file}`);
        }
    });
    return allIds;
}

var getRelevantFiles = function(path){
    var urls = [];
    try {
        urls = fs.readdirSync(path);
    } catch (e){
        urls = [];
    }
    return urls
}

/**
 * 
 * @param {*} src 
 * @param {*} dst
 * Add dst fns to src fns 
 */
var mergeFns = function(src, dst){
    var res = new Set(src);
    dst.forEach(res.add, res);
    return [...res];
}

/**
 * 
 * @param {any} fnEntry  
 *         fnEntry is a dictionary where keys are filenames loaded for the current url, and 
 *          values are 2-tuple with list of fn in each file, and their corresponding total size
 * @param {any} dedupStore 
 *          dedupStore is a dict with keys as filenames
 *          and values as arrays where each entry is a unique combination of functions executed in this file
 */ 
var updateFileStore = function(fnEntry, filestore, firstUrl){
    Object.keys(fnEntry).forEach((file)=>{
        if (file == 'idSrcLen') return;
        if (!firstUrl && filestore[file] == null) return;
        var fnOrders = filestore[file] || [];
        var curOrder = fnEntry[file];
        var unionFns = mergeFns(curOrder, fnOrders) 
        program.verbose && console.log(`File: ${file} Orig fns: ${fnOrders.length} Final Fns: ${unionFns.length}`)
        //update filestore with the union
        filestore[file] = unionFns;
    });
}

var processFileStore = function(filestore){
    var total = 0, idSrcLen = filestore.idSrcLen;
    Object.keys(filestore).forEach((file)=>{
        if (file == 'idSrcLen') return;
        var fns = filestore[file];
        var _size = utils.sumFnSizes(fns, idSrcLen);
        total += _size[0];
    });
    return total;
}

/**
 * For each url it does the following
 * 1) Categories all executed functions in a set of files
 * 2) Computes the total size of these new files
 * 3) Compares this with the dedup store to see if an entry for the file already exists or not
 */
var allFunctionsAnalysis = function(){
    var total = 0, dedup = 0;
    var filestore = {};

    var paths = fs.readFileSync(program.urls,'utf-8').split('\n');
    // console.log(paths)
    var firstUrl = true;
    paths.forEach((path, idx)=>{
        if (path == '') return;
        if (!fs.existsSync(`${program.performance}/${path}/allFns`)) return;
        // get source files
        var srcDir = `${program.dir}/${path}`;
        var rfiles = getRelevantFiles(srcDir);
        if (!rfiles.length) return;
        // get all functions
        var execFns = parse(`${program.performance}/${path}/allFns`).preload;

        var fnFileData = getPerFileData(execFns, srcDir, rfiles);
        updateFileStore(fnFileData, filestore, firstUrl);

        if (firstUrl)
            filestore.idSrcLen = fnFileData.idSrcLen;

        //for subsequent urls, don't update the filestore
        firstUrl = false;
    });
    console.log(processFileStore(filestore));
}

allFunctionsAnalysis();