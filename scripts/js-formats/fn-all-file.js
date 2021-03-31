/**
 * This script computes storage overheads
 * when each JS file contains all the JS functions that were executed across
 * different pages
 */

var fs = require('fs'),
    program = require('commander'),
    utils = require('../../program_analysis/utils/util');
    var crypto = require('crypto');

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
    
    var res = {};
    Object.keys(fileFns).forEach((file)=>{
        var allIds = getAllIds([file], resDir);
        var idSrcLen = utils.getIdLen(allIds);
        var fileSrc = fs.readFileSync(`${resDir}/${file}/${file}`,'utf-8');
        var fns = fileFns[file];
        res[file] = [fns,idSrcLen,fileSrc]; // store a 2-tuple of fn arrays and their corresponding size
    });
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
    const ARCHIVE_URLS = 'archive_urls';
    var urls = [];
    try {
        urls = parse(`${path}/${ARCHIVE_URLS}`);
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
 * @param {any} filestore 
 *          filestore is a dict with keys as filenames
 *          and values as dictionaries: key is md5 hash of the source, value is list of fns and the fn sizes of all fns in the file
 */ 
var updateFileStore = function(fnEntry, filestore, firstUrl){
    Object.keys(fnEntry).forEach((file)=>{
        // if (!firstUrl && filestore[file] == null) return;
        if (!(file in filestore))
            filestore[file] = {};
        var fnsPast = filestore[file];

        var fnsCur = fnEntry[file]; //[fns, length, source]
        // var curHash = crypto.createHash('md5').update(fnsCur[2]).digest('hex');
        var curHash = Object.keys(fnsCur[1]) + '';
        var fileExists = false;
        Object.keys(fnsPast).forEach((hash)=>{
            if (hash == curHash)
                fileExists = true;
        })
        if (fileExists){
            var curFns = fnsCur[0];
            var unionFns = mergeFns(fnsPast[curHash][0],curFns);
            fnsPast[curHash][0] = unionFns;
            program.verbose && console.log(`File: ${file} Orig fns: ${fnsCur[0].length} Final Fns: ${unionFns.length}`)
        } else {
            fnsPast[curHash] = fnsCur.slice(0,2);
            program.verbose && console.log(`No hash for file: ${file}`)
        }
        
    });
}

var processFileStore = function(filestore){
    var total = 0, idSrcLen = filestore.idSrcLen;
    Object.keys(filestore).forEach((file)=>{
        
        Object.keys(filestore[file]).forEach((hash)=>{
            var fns = filestore[file][hash][0];
            var idSrcLen = filestore[file][hash][1];

            var _size = utils.sumFnSizes(fns, idSrcLen);
            total += _size;
        })
        
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
    paths.forEach((path, idx)=>{
        if (path == '') return;
        program.verbose && console.log(`path: ${path}`)
        if (!fs.existsSync(`${program.performance}/${path}/allFns`)) return;
        // get source files
        var srcDir = `${program.dir}/${path}`;
        var rfiles = getRelevantFiles(srcDir);
        // console.log(rfiles)
        if (!rfiles.length) return;
        // get all functions
        var execFns = parse(`${program.performance}/${path}/allFns`).preload;

        var fnFileData = getPerFileData(execFns, srcDir, rfiles);
        updateFileStore(fnFileData, filestore);

        //for subsequent urls, don't update the filestore
        firstUrl = false;
    });
    console.log(processFileStore(filestore));
}

allFunctionsAnalysis();