/**
 * This file computes deduplication ratio
 * when only the relevant parts of each JS file are stored
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

var getPerFileSize = function(fns, resDir, rfiles){
    var fileFns = convertToFiles(fns, rfiles);
    //get all ids for this dir
    var allIds = getAllIds(rfiles, resDir);
    
    var idSrcLen = utils.getIdLen(allIds),
        res = {};
    Object.keys(fileFns).forEach((file)=>{
        var fns = fileFns[file];
        var fnsSize = utils.sumFnSizes(fns, idSrcLen);
        res[file] = [fns,fnsSize]; // store a 2-tuple of fn arrays and their corresponding size
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
 * @param {any} fnEntry  
 *         fnEntry is a dictionary where keys are filenames loaded for the current url, and 
 *          values are 2-tuple with list of fn in each file, and their corresponding total size
 * @param {any} dedupStore 
 *          dedupStore is a dict with keys as filenames
 *          and values as arrays where each entry is a unique combination of functions executed in this file
 */ 
var queryAndUpdateDedupStore = function(fnEntry, dedupStore){
    var total = dedup = 0;
    Object.keys(fnEntry).forEach((file)=>{
        var fnOrders = dedupStore[file] || [];

        var [curOrder, curSize] = fnEntry[file],
            isDuplicate = false,
            curOrder = curOrder + '' // convert array to strings for easier comparison
        for (var o of fnOrders){
            var [fns,size] = o;
            if (fns == curOrder){
                //match found ; dedup this entry
                isDuplicate = true;
                break;
            }
        }
        if (!isDuplicate){
            //not a duplicate, update entry in dedup store
            if (!(file in dedupStore))
                dedupStore[file] = [];
            
            dedupStore[file].push([curOrder, curSize]);
            dedup += curSize;
        }
        total += curSize;
    });
    return [total, dedup];
}
/**
 * For each url it does the following
 * 1) Categories all executed functions in a set of files
 * 2) Computes the total size of these new files
 * 3) Compares this with the dedup store to see if an entry for the file already exists or not
 */
var dedupAnalysis = function(){
    var total = 0, dedup = 0;
    var dedupStore = {};

    var paths = fs.readFileSync(program.urls,'utf-8').split('\n');
    // console.log(paths)
    paths.forEach((path)=>{
        if (path == '') return;
        // get source files
        var srcDir = `${program.dir}/${path}`;
        var rfiles = getRelevantFiles(srcDir);
        if (!rfiles.length) return;
        // get all functions
        var execFns = parse(`${program.performance}/${path}/allFns`).preload;

        var fnFileSizes = getPerFileSize(execFns, srcDir, rfiles);
        var [_total, _dedup] = queryAndUpdateDedupStore(fnFileSizes, dedupStore);


        total += _total, dedup += _dedup;
        program.verbose && console.log(`${path}: Total- ${_total} Dedup- ${_dedup}`);
    });
    console.log(total, dedup);


}

dedupAnalysis();