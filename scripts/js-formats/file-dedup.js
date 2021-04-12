/**
 * This script computes storage overheads
 * when a file level deduplication is applied
 * like currently employed by IA
 * this is the JS version of the compare-captures script:
 * Good thing it only looks at JS, and is exponentially faster
 * because all the files are already uncompressed, with content
 * written to the disk already
 */

var fs = require('fs'),
program = require('commander'),
crypto = require('crypto'),
utils = require('../../program_analysis/utils/util');

program
    .option('-d, --dir [dir]',"directory containing resource files")
    .option('-u, --urls [urls]', 'file containing list of urls for dedup analysis')
    .option('-v, --verbose', 'enable verbose logging')
    .parse(process.argv);

var parse = function(f){
    return JSON.parse(fs.readFileSync(f, 'utf-8'));
}

var getFileKey = function(f){
    var hInd = f.indexOf('-hash-');
    return f.slice(0,hInd);
}

var dedupAnalysis = function(JSStore, page, filterFiles,fileDistStore){
    try {    
        var filenames = fs.readdirSync(`${program.dir}/${page}`);
    } catch (e){
        return;
    }
    filenames.forEach((file)=>{
        try {
            if (file == '__metadata__' || file == 'py_out') return;
            var resInfo = parse(`${program.dir}/${page}/${file}/${file}`);
            var curHash = resInfo.hash;
            var storeKey = getFileKey(file);
            // var storeKey = file.replace(/\d/g,'');
            // var curHash = Object.keys(parse(`${program.dir}/${page}/${file}/ids`)).map(e=>{var ar = e.split('-'); return ar.slice(ar.length-4,ar.length)}) + ' ' + storeKey;
            var ids = parse(`${program.dir}/${page}/${file}/ids`) ;
            // var stripIds = {};
            // Object.keys(ids).forEach((f)=>{
            //     var val = ids[f];
            //     var fArr = f.split('-');
            //     fArr.splice(fArr.length - 6,2);
            //     f = fArr.join('-');
            //     stripIds[f] = val;
            // })
            var _curHash = Object.keys(ids) + '',
                curHash = crypto.createHash('md5').update(_curHash).digest('hex');
            var storedHashes = JSStore.files[storeKey];
            var isDuplicate = false;
            if (!storedHashes){
                //first occurance of the file
                JSStore.files[storeKey]=[curHash];
                JSStore.dedupSize += resInfo.length;

                if (filterFiles.indexOf(file)>=0)
                    JSStore.filterDedupSize+= resInfo.length;
            } else {
                storedHashes.forEach((hash)=>{
                    if (hash == curHash){
                        //duplicate file
                        isDuplicate = true;
                    }
                });
                if (!isDuplicate){
                    // console.log(`[No hash] ${file}`)
                    JSStore.files[storeKey].push(curHash);
                    JSStore.dedupSize += resInfo.length;

                    if (filterFiles.indexOf(file)>=0)
                        JSStore.filterDedupSize+= resInfo.length;
                }
            }
            JSStore.totalSize += resInfo.length;
            // console.log(`file ${file} with ${resInfo.length}`)
            if (filterFiles.indexOf(file)>=0)
                JSStore.filterSize+= resInfo.length;
            else {
                // console.log(`file ${file} with ${resInfo.length}`)
            }

            //distribution analysis
            var fileDist = fileDistStore[curHash];
            if (!fileDist){
                fileDistStore[curHash] = 1
            } else {
                fileDistStore[curHash]++;
            }
        } catch (e){
            program.verbose && console.error(`Error while reading file ${file}`,e);
        }
    });
}


function main(){
    var pages = fs.readFileSync(program.urls, 'utf-8').split('\n');

    var JSStore = {files:{}, dedupSize:0, totalSize:0, filterDedupSize:0, filterSize:0};
    var fileDistStore = {};
    pages.forEach((page)=>{
        if (page == '') return;
        console.log(page)
        // var _filterFiles = parse(`${program.dir}/${page}/__metadata__/analytics`),
        //     filterFiles = _filterFiles.tracker.concat(_filterFiles.custom);
        var filterFiles = [];
            // console.log(filterFiles, filterFiles.length)
        var prevTotal = JSStore.totalSize, prevDedup = JSStore.dedupSize, prevFilter = JSStore.filterSize, prevFilterDedup = JSStore.filterDedupSize;
        dedupAnalysis(JSStore, page, filterFiles,fileDistStore)
        
        
        program.verbose && console.log(page, JSStore.totalSize - prevTotal, JSStore.filterSize - prevFilter, JSStore.dedupSize - prevDedup, JSStore.filterDedupSize - prevFilterDedup)
    });
    console.log('Total- ',JSStore.totalSize, ' filterTotal- ',JSStore.filterSize, ' Dedup- ', JSStore.dedupSize,' filterDedup- ', JSStore.filterDedupSize)

    //print distribution data
    // Object.keys(fileDistStore).forEach((file,idx)=>{
    //     var fileDist = fileDistStore[file];
    //     var nameOcc = fileDist/pages.length
    //         // matchOcc = fileDist.matches/pages.length;
    //     console.log(idx, nameOcc, fileDist, pages.length);
    // })
}

main();