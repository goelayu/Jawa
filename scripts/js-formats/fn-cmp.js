/**
 * This script combines all the three formats
 * file level dedup
 * file level dedup while storing only functions on each page
 * and union
 * Copies content from the three other scripts doing this separately
 */

/**
 * Information about crawl and serving index sizes
 * 
 * crawl index:
 * Format: {url: [<content-hash, warc-id>]}
 * content-hash: 32 bytes length (eg: "398f4956d66fd21dea6cba445642a31b")
 * warc-id: 45 bytes (eg: urn:uuid:23200706-de3e-3c61-a131-g65d7fd80cc1)
 * 
 * serving index:
 * Format: CDX A b e a m s c k r V v D d g M n -- 275 bytes
 * eg: 0-0-0checkmate.com/Bugs/Bug_Investigators.html 20010424210551 209.52.183.152 0-0-0checkmate.com:80/Bugs/Bug_Investigators.html text/html 200 58670fbe7432c5bed6f3dcd7ea32b221 a725a64ad6bb7112c55ed26c9e4cef63 - 17130110 59129865 1927657 6501523 DE_crawl6.20010424210458 - 5750
 * and for set differences only filename and byte offset is added
 * 6627262 DE_crawl6.20010424212307 -- 32 bytes
 */

const CRAWL_ENTRY_LEN= 77
const SERVING_ENTRY_LEN = 275
const SERVING_ENTRY_APPEND = 32

var fs = require('fs'),
    program = require('commander'),
    utils = require('../../program_analysis/utils/util'),
    crypto = require('crypto');
const { createRequire } = require('module');

program
    .option('-d, --dir [dir]',"directory containing resource files")
    .option('-p, --performance [performance]','directory containing performance data')
    .option('-u, --urls [urls]', 'file containing list of urls for dedup analysis')
    .option('-v, --verbose', 'enable verbose logging')
    .option('-f, --filter','filter out irrelevant files')
    .option('-o, --output [output]','path to the output directory')
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
        fileSrc.rlength = fs.statSync(`${resDir}/${file}/content`).size; //size transfered over the network, raw size
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

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    var aClone = Object.assign(a,[]).sort(),
        bClone = Object.assign(b,[]).sort();
  
    for (var i = 0; i < aClone.length; ++i) {
      if (a[i] !== bClone[i]) return false;
    }
    return true;
  }

  var getUnionIds = function(ids){
      return ids.map((e)=>{
          var i = e.split('-');
          return i.slice(i.length - 4,).join('-');
      });
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
var queryAndUpdateStore = function(filesData, store, page, pageMD){
    var fileTotal = fileDedup = fnTotal = fnDedup = fnUnion = 0;

    Object.keys(filesData).forEach((file)=>{
        var [curfns, curIds, curfileInfo] = filesData[file];
        var zipRatio = curfileInfo.length == 0 ? 1 : parseFloat((curfileInfo.rlength/curfileInfo.length).toFixed(2));
        curfileInfo.zipRatio = zipRatio;
        var fnsSize = utils.sumFnSizes(curfns, curIds);
        program.verbose &&  console.log(`ratio is ${zipRatio}`)
        // var fileKey = getFileKey(file)
        // var _storeKey = Object.keys(curIds) + '' + fileKey;
        //     storeKey = crypto.createHash('md5').update(_storeKey).digest('hex');
        var storeKey = curfileInfo.url;
        var oldVersion = store.entries[storeKey];
        var curFnOrder = curfns;

        pageMD._files.push(storeKey);

        program.verbose &&  console.log(`copy: ${storeKey}`)
        if (oldVersion){
            
            //duplicate file
            var [oldFnOrders, oldUnion, oldIds, oldfileInfo] = oldVersion;
            // check for fn duplication
            var fnOrderMatch = false;
            for (var o of oldFnOrders){
                if (arraysEqual(o,curFnOrder)){
                    fnOrderMatch = true;
                    break;
                }
            }
            if (!fnOrderMatch){
                fnDedup += fnsSize*zipRatio;
                store.fnDedup += fnsSize*zipRatio;
                oldFnOrders.push(curFnOrder);
                program.verbose &&  console.log(`fn-match: ${storeKey}`)
            }

            var newUnion = mergeFns(oldUnion, curfns);
            oldVersion[1] = newUnion;

            // if union is updated, update union length;
            if (newUnion.length > oldUnion.length){
                program.verbose &&  console.log(`union: ${storeKey}`)
                var unionLen = utils.sumFnSizes(newUnion, curIds);
                fnUnion += unionLen*zipRatio;
                store.fnUnion += unionLen*zipRatio;
                oldVersion[4]++; // update the number of unions

                pageMD.cSize.union += CRAWL_ENTRY_LEN + (getUnionIds(newUnion) + '').length; //update crawl index
                pageMD.cWrites.union++ // update crawl index
            }

        } else {
            store.entries[storeKey] = [
                [curFnOrder],
                curfns,
                curIds, 
                curfileInfo,
                1
            ];

            //unique file
            fileDedup += curfileInfo.rlength;
            store.fileDedup += curfileInfo.rlength;

            fnDedup += fnsSize*zipRatio;
            store.fnDedup += fnsSize*zipRatio;
            program.verbose &&  console.log(`fn-match: ${storeKey}`)

            fnUnion += fnsSize*zipRatio;
            store.fnUnion += fnsSize*zipRatio;
            program.verbose &&  console.log(`union: ${storeKey}`)

            pageMD.cSize.orig += CRAWL_ENTRY_LEN
            pageMD.cSize.union += CRAWL_ENTRY_LEN + (getUnionIds(curfns) + '').length; // updating crawl index
            pageMD.cWrites.orig++
            pageMD.cWrites.union++
        }

        fileTotal += curfileInfo.rlength;
        store.fileTotal += curfileInfo.rlength;
        fnTotal += fnsSize*zipRatio;
        store.fnTotal += fnsSize*zipRatio;
    });
    program.verbose &&  console.log(`filetotal: ${fileTotal} fileDedup: ${fileDedup} fnTotal: ${fnTotal} fnDedup: ${fnDedup} fnUnion ${fnUnion}`);
}

var processFnUnion = function(store){
    var size = 0;
    Object.keys(store.entries).forEach((entry)=>{
        var [oldFnOrders, oldUnion, oldIds, oldfileInfo, unionCount] = store.entries[entry];
        var _size = utils.sumFnSizes(oldUnion, oldIds);
        var zipRatio = oldfileInfo.zipRatio;
        size += _size*zipRatio;
    });
    return size;
}

var processPageMD = function(store, perPageMD){
    Object.keys(perPageMD).forEach((page)=>{
        var pageMD = perPageMD[page], nUnion = 0;
        var files = pageMD._files;
        files.forEach((f)=>{
            var _nUnion = store.entries[f][4];
            nUnion += _nUnion;
        });
        pageMD.lookups.union = nUnion;
        pageMD.sSize.union = files.length*SERVING_ENTRY_LEN + (nUnion-files.length)*SERVING_ENTRY_APPEND
        //delete the files data
    });
    fs.writeFileSync(`${program.output}`, JSON.stringify(perPageMD));

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

    var perPageMD = {};

    var paths = fs.readFileSync(program.urls,'utf-8').split('\n');
    // console.log(paths)
    paths.forEach((path)=>{
        if (path == '') return;
        // get source files
        var srcDir = `${program.dir}/${path}`;
        // get all functions
        try {
            var _execFns = parse(`${program.performance}/${path}/allFns`), _evtCG,
            execFns = [...new Set(_execFns.preload.concat(_execFns.postload))];

        
            _evtCG = parse(`${program.performance}/${path}/hybridcg`)
            program.verbose && console.log(`Adding evt graph: ${_evtCG.length}`);
            execFns = [...new Set(execFns.concat(_evtCG))]
        } catch (e) {
            execFns = [];
            //pass nothing can be done, no event handler graph
        }

        var filterFiles = [];
        if (program.filter) {
            try {
                var _filterFiles = parse(`${srcDir}/__metadata__/filtered`),
                filterFiles = _filterFiles.tracker.concat(_filterFiles.custom);
            } catch (e){
                filterFiles = [];
            }
        }
        
        var pageMD = perPageMD[path] = {
            lookups:{orig:0, union:0}, 
            cSize:{orig:0, union:0},
            sSize:{orig:0, union:0},
            _files:[],
            cWrites:{orig:0, union:0}
        };
        
        var filesData = getPerFileData(execFns, srcDir, filterFiles);

        pageMD.lookups.orig = Object.keys(filesData).length + filterFiles.length;
        pageMD.sSize.orig = pageMD.lookups.orig * SERVING_ENTRY_LEN;
        queryAndUpdateStore(filesData, store, path, pageMD);
    });
    processPageMD(store, perPageMD);
    with (store){
        console.log(`Final: filetotal: ${fileTotal} fileDedup: ${fileDedup} fnTotal: ${fnTotal} fnDedup: ${fnDedup} fnUnion ${processFnUnion(store, perPageMD)}`);
    }

}

dedupAnalysis();