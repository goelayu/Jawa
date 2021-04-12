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

var convertToFiles = function(fns, excludedFiles){
    fileFns = {};
    fns.forEach((f)=>{
        var endIndx = 4;
        if (f.indexOf('-script-')>=0)
            endIndx = 6;
        var fnFile = f.split('-').slice(0,f.split('-').length - endIndx).join('-');
        if (excludedFiles.indexOf(fnFile)>=0) return;
        if (fnFile == undefined || fnFile == 'undefined') return; //TODO handle why are filenames undefined
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
var getPerFileData = function(fns, resDir, excludedFiles){
    var fileFns = convertToFiles(fns, excludedFiles);
    //get all ids for this dir
    
    var res = {};
    Object.keys(fileFns).forEach((file)=>{
        try {
        var allIds = getAllIds([file], resDir);
        var fileSrc = JSON.parse(fs.readFileSync(`${resDir}/${file}/${file}`,'utf-8'));
        var fns = fileFns[file];
        // var storeKey = file.replace(/\d/g,'');
        var storeKey = file;
        res[storeKey] = [fns,allIds[file],fileSrc]; // store a 3-tuple of fn arrays and their corresponding size, and the file src
        } catch (e) {
            console.error(`Error while reading file ${file}, e`)
        }
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
var updateFileStore = function(fnEntry, filestore, allJS){
    Object.keys(fnEntry).forEach((file)=>{
        // if (!firstUrl && filestore[file] == null) return;
        // var storeKey = file.replace(/\d/g,'');
        var storeKey = file;
        var fnsCur = fnEntry[storeKey];
        // var curHash = Object.keys(fnsCur[1]).map(e=>{var ar = e.split('-'); return ar.slice(ar.length-4,ar.length)}) + ' ' + storeKey;
        //[fns, length, source] length = {{id:length}}
        // var curHash = crypto.createHash('md5').update(fnsCur[2]).digest('hex');
        if (!fnsCur[1]) return; // TODO handle this case
        var curHash = Object.keys(fnsCur[1]) + '';
        if (!(storeKey in filestore))
            filestore[storeKey] = {};
        var fnsPast = filestore[storeKey];
        var fileExists = false;
        Object.keys(fnsPast).forEach((hash)=>{
            if (hash == curHash)
                fileExists = true;
        })
        if (fileExists){
            // console.log(`[DUPLICATE] ${file}`)
            // console.log('adding', fnsCur[2].length)
            var curFns = fnsCur[0];
            var unionFns = mergeFns(fnsPast[curHash][0],curFns);
            fnsPast[curHash][0] = unionFns;
            console.log(`[duplicate] ${utils.sumFnSizes(curFns, fnsCur[1])} ${fnsCur[2].length} ${file}`)
            // program.verbose && console.log(`File: ${file} Orig fns: ${fnsCur[0].length} Final Fns: ${unionFns.length}`)
        } else {
            allJS.dedup += fnsCur[2].length;
            fnsPast[curHash] = fnsCur;
            console.log(`[unique] ${utils.sumFnSizes(fnsCur[0], fnsCur[1])} ${fnsCur[2].length} ${file}`)
            // program.verbose && console.log(`No hash for file: ${file}`)
        }
        console.log(`File: ${file} Orig fns: ${fnsCur[0].length}`)
        
        
    });
}

var processFileStore = function(filestore){
    var totalUnion = 0, totalFile = 0;
    Object.keys(filestore).forEach((file)=>{
        
        Object.keys(filestore[file]).forEach((hash,id)=>{
            var fns = filestore[file][hash][0];
            var allIds = filestore[file][hash][1];
            totalFile += filestore[file][hash][2].length;
            var _size = utils.sumFnSizes(fns, allIds);
            totalUnion += _size;
            console.log(file, id, _size, filestore[file][hash][2].length)
        })
        
    });
    return [totalUnion, totalFile];
}

/**
 * For each url it does the following
 * 1) Categories all executed functions in a set of files
 * 2) Computes the total size of these new files
 * 3) Compares this with the dedup store to see if an entry for the file already exists or not
 */
var allFunctionsAnalysis = function(){
    var total = 0, dedup = 0;
    var filestore = {}, allJS = {total: 0, dedup:0};

    var paths = fs.readFileSync(program.urls,'utf-8').split('\n');
    // console.log(paths)
    paths.forEach((path, idx)=>{
        if (path == '') return;
        // program.verbose && console.log(`path: ${path}`)
        if (!fs.existsSync(`${program.performance}/${path}/allFns`)) return;
        // get source files
        var srcDir = `${program.dir}/${path}`;
        var rfiles = fs.readdirSync(srcDir).filter(e=>e!='__metadata__' && e!='py_out');
        var _execFns = parse(`${program.performance}/${path}/allFns`),
            execFns = [...new Set(_execFns.preload.concat(_execFns.postload))];

        var _filterFiles = parse(`${srcDir}/__metadata__/analytics`),
            filterFiles = _filterFiles.tracker.concat(_filterFiles.custom);
        // console.log(filterFiles, filterFiles.length)
        var fnFileData = getPerFileData(execFns, srcDir,filterFiles);
        var prevTotal = allJS.dedup;
        updateFileStore(fnFileData, filestore, allJS);
        console.log(path, allJS.dedup - prevTotal)
        //for subsequent urls, don't update the filestore
        firstUrl = false;
    });
    console.log(allJS)
    console.log(processFileStore(filestore));
}

allFunctionsAnalysis();