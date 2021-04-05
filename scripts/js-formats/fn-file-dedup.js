/**
 * This file computes deduplication ratio
 * when only the relevant parts of each JS file are stored
 */

var fs = require('fs'),
    program = require('commander'),
    utils = require('../../program_analysis/utils/util'),
    beautifier = require('js-beautify');

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
        if (fnFile == 'undefined'){
            console.error('undefined filename');
            return;
        }
        // console.log('filename is', fnFile)
        if (!(fnFile in fileFns))
            fileFns[fnFile] = [];
        
        fileFns[fnFile].push(f);
    });
    return fileFns;
}

var getPerFileSize = function(fns, resDir, excludedFiles){
    var fileFns = convertToFiles(fns,excludedFiles);
    //get all ids for this dir
    var allIds = utils.getAllIds(resDir);
    
    var res = {};
    Object.keys(fileFns).forEach((file)=>{
        var fns = fileFns[file];
        var fnsSize = utils.sumFnSizes(fns, allIds[file]);
        var totalSize = utils.getFileSize(resDir, [file])[1];
        // program.verbose && console.log(file, fnsSize, totalSize)
        res[file] = [fns,fnsSize]; // store a 2-tuple of fn arrays and their corresponding size
    });
    return res;
}

var getRelevantFiles = function(path){
    const ARCHIVE_URLS = 'archive_urls';
    var urls = [];
    try {
        // urls = parse(`${path}/${ARCHIVE_URLS}`);
        urls = fs.readdirSync(path);
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
    var total = 0, dedup = 0, fileTotal = 0, excludedTotal = 0;
    var dedupStore = {};

    var paths = fs.readFileSync(program.urls,'utf-8').split('\n');
    // console.log(paths)
    paths.forEach((path)=>{
        if (path == '') return;
        // get source files
        var srcDir = `${program.dir}/${path}`;
        var rfiles = fs.readdirSync(srcDir).filter(e=>e!='__metadata__' && e!='py_out');
        // get all functions
        var _execFns = parse(`${program.performance}/${path}/allFns`),
            execFns = [...new Set(_execFns.preload.concat(_execFns.postload))];

        var _filterFiles = parse(`${srcDir}/__metadata__/analytics`),
            filterFiles = _filterFiles.tracker.concat(_filterFiles.custom);
        
        var fnFileSizes = getPerFileSize(execFns, srcDir, filterFiles);
        // console.log(rfiles.filter(x => !Object.keys(fnFileSizes).includes(x)))
        var [_total, _dedup] = queryAndUpdateDedupStore(fnFileSizes, dedupStore);
        console.log(rfiles, filterFiles)
        var [_fileTotal, _excludedTotal] = utils.getFileSize(srcDir, rfiles, filterFiles);

        total += _total, dedup += _dedup, fileTotal += _fileTotal, excludedTotal += _excludedTotal;
        program.verbose && console.log(`${path}: Total- ${_total} Dedup- ${_dedup} FileTotal- ${_fileTotal} ExcludedTotal- ${_excludedTotal}`);
    });
    console.log(total, dedup, fileTotal, excludedTotal);

}

dedupAnalysis();