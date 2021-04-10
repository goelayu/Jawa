/**
 * This script combines all the three formats
 * file level dedup
 * file level dedup while storing only functions on each page
 * and union
 * Copies content from the three other scripts doing this separately
 */

var fs = require('fs'),
    program = require('commander'),
    utils = require('../../program_analysis/utils/util'),
    crypto = require('crypto');

program
    .option('-d, --dir [dir]',"directory containing resource files")
    .option('-p, --performance [performance]','directory containing performance data')
    .option('-u, --urls [urls]', 'file containing list of urls for dedup analysis')
    .option('-v, --verbose', 'enable verbose logging')
    .option('-f, --filter','filter out irrelevant files')
    .parse(process.argv);

var parse = function(f){
    return JSON.parse(fs.readFileSync(f,'utf-8'));
}

var stripHash = function(str){

}

var convertToFiles = function(fns, excludedFiles){
    fileFns = {};
    fns.forEach((f)=>{
        if (f.indexOf('-hash-')<0) return;
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
        
        // splice hash from the function
        // var fArr = f.split('-');
        // fArr.splice(fArr.length - 6,2);
        // f = fArr.join('-')
        
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
        if (!allIds[file]) return; //TODO
        var fileSrc = JSON.parse(fs.readFileSync(`${resDir}/${file}/${file}`,'utf-8'));
        var fns = fileFns[file];
        // var storeKey = file.replace(/\d/g,'');
        var storeKey = file;
        res[storeKey] = [fns,allIds[file],fileSrc]; // store a 3-tuple of fn arrays and their corresponding size, and the file src
        } catch (e) {
            console.error(`Error while reading file ${file}, ${e}`)
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
            // strip hash from ids
            var stripIds = {};
            // Object.keys(ids).forEach((f)=>{
            //     var val = ids[f];
            //     var fArr = f.split('-');
            //     fArr.splice(fArr.length - 6,2);
            //     f = fArr.join('-');
            //     stripIds[f] = val;
            // })
            allIds[file] = ids;
        } catch (e) {
            program.verbose && console.error(`Error while readings ids for ${file}`);
        }
    });
    return allIds;
}

var mergeFns = function(src, dst){
    var res = new Set(src);
    dst.forEach(res.add, res);
    return [...res];
}

var getFileKey = function(f){
    var hInd = f.indexOf('-hash-');
    return f.slice(0,hInd);
}

/**
* 
* @param {any} fnEntry  
*         fnEntry is a dictionary where keys are filenames loaded for the current url, and 
*          values are 2-tuple with list of fn in each file, and their corresponding total size
* @param {any} store 
*          store is a dict with keys as filename+contenthash
*           eg: {
                1-2-3-4.js-a.js:[[fns1,fns2,fns3], [union-of-all-fns], allIds, fileInfo]
            }
*/ 
var queryAndUpdateStore = function(filesData, store, page){
    var fileTotal = fileDedup = fnTotal = fnDedup = fnUnion = 0;
    Object.keys(filesData).forEach((file)=>{
        var [curfns, curIds, curfileInfo] = filesData[file];
        var fnsSize = utils.sumFnSizes(curfns, curIds);
        // var fileKey = getFileKey(file)
        // var _storeKey = Object.keys(curIds) + '' + fileKey;
        //     storeKey = crypto.createHash('md5').update(_storeKey).digest('hex');
        var storeKey = curfileInfo.url;
        var oldVersion = store.entries[storeKey];
        var curFnOrder = curfns + '';

        if (oldVersion){
            //duplicate file
            var [oldFnOrders, oldUnion, oldIds, oldfileInfo] = oldVersion;
            // check for fn duplication
            var fnOrderMatch = false;
            for (var o of oldFnOrders){
                if (o == curFnOrder){
                    fnOrderMatch = true;
                    break;
                }
            }
            if (!fnOrderMatch){
                fnDedup += fnsSize;
                store.fnDedup += fnsSize;
                oldFnOrders.push(curFnOrder);
            }

            var newUnion = mergeFns(oldUnion, curfns);
            oldVersion[1] = newUnion;

            // if union is updated, update union length;
            if (newUnion.length > oldUnion.length){
                var unionLen = utils.sumFnSizes(newUnion, curIds);
                fnUnion += unionLen;
                store.fnUnion += unionLen;
            }

        } else {
            store.entries[storeKey] = [
                [curFnOrder],
                curfns,
                curIds, 
                curfileInfo
            ];

            //unique file
            fileDedup += curfileInfo.length;
            store.fileDedup += curfileInfo.length;

            fnDedup += fnsSize;
            store.fnDedup += fnsSize;

            fnUnion += fnsSize;
            store.fnUnion += fnsSize;

        }

        fileTotal += curfileInfo.length;
        store.fileTotal += curfileInfo.length;
        fnTotal += fnsSize;
        store.fnTotal += fnsSize;
    });
    console.log(`filetotal: ${fileTotal} fileDedup: ${fileDedup} fnTotal: ${fnTotal} fnDedup: ${fnDedup} fnUnion ${fnUnion}`);
}

var processFnUnion = function(store){
    var size = 0;
    Object.keys(store.entries).forEach((entry)=>{
        var [oldFnOrders, oldUnion, oldIds, oldfileInfo] = store.entries[entry];
        var _size = utils.sumFnSizes(oldUnion, oldIds);
        size += _size;
    });
    return size;
}
/**
* For each url it does the following
* 1) Categories all executed functions in a set of files
* 2) Computes the total size of these new files
* 3) Compares this with the dedup store to see if an entry for the file already exists or not
*/
var dedupAnalysis = function(){
    var total = 0, dedup = 0, fileTotal = 0, excludedTotal = 0;
    var store = {entries:{}, fileTotal :0, fileDedup:0, fnTotal:0, fnDedup:0, fnUnion:0};

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

        // var _filterFiles = parse(`${srcDir}/__metadata__/analytics`),
        //     filterFiles = _filterFiles.tracker.concat(_filterFiles.custom);

        var filterFiles = [];
        if (!program.filter)
            filterFiles = [];
        
        var filesData = getPerFileData(execFns, srcDir, filterFiles);
        queryAndUpdateStore(filesData, store, path);
    });
    with (store){
        console.log(`{page} filetotal: ${fileTotal} fileDedup: ${fileDedup} fnTotal: ${fnTotal} fnDedup: ${fnDedup} fnUnion ${processFnUnion(store)}`);
    }

}

dedupAnalysis();