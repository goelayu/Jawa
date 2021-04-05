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
utils = require('../../program_analysis/utils/util');

program
    .option('-d, --dir [dir]',"directory containing resource files")
    .option('-u, --urls [urls]', 'file containing list of urls for dedup analysis')
    .option('-v, --verbose', 'enable verbose logging')
    .parse(process.argv);

var parse = function(f){
    return JSON.parse(fs.readFileSync(f, 'utf-8'));
}


var dedupAnalysis = function(JSStore, page, filterFiles){
    var filenames = fs.readdirSync(`${program.dir}/${page}`);
    filenames.forEach((file)=>{
        try {
            if (file == '__metadata__' || file == 'py_out') return;
            var resInfo = parse(`${program.dir}/${page}/${file}/${file}`);
            var curHash = resInfo.hash;
            var curHash = Object.keys(parse(`${program.dir}/${page}/${file}/ids`)) + '';
            var storedHashes = JSStore.files[file];
            if (!storedHashes){
                //first occurance of the file
                JSStore.files[file]=[curHash];
                JSStore.dedupSize += resInfo.length;

                if (filterFiles.indexOf(file)>=0)
                    JSStore.filterDedupSize+= resInfo.length;
            } else {
                var isDuplicate = false;
                storedHashes.forEach((hash)=>{
                    if (hash == curHash){
                        //duplicate file
                        isDuplicate = true;
                    }
                });
                if (!isDuplicate){
                    JSStore.files[file].push(curHash);
                    JSStore.dedupSize += resInfo.length;

                    if (filterFiles.indexOf(file)>=0)
                        JSStore.filterDedupSize+= resInfo.length;
                }
            }
            JSStore.totalSize += resInfo.length;
        } catch (e){
            program.verbose && console.error(`Error while reading file ${file}`,e);
        }
    });
}


function main(){
    var pages = fs.readFileSync(program.urls, 'utf-8').split('\n');

    var JSStore = {files:{}, dedupSize:0, totalSize:0, filterDedupSize:0};
    pages.forEach((page)=>{
        if (page == '') return;

        var _filterFiles = parse(`${program.dir}/${page}/__metadata__/analytics`),
            filterFiles = _filterFiles.tracker.concat(_filterFiles.custom);
        var prevTotal = JSStore.totalSize, prevDedup = JSStore.dedupSize;
        dedupAnalysis(JSStore, page, filterFiles)
        
        program.verbose && console.log(page, JSStore.totalSize - prevTotal, JSStore.dedupSize - prevDedup)
    });
    console.log(JSStore.totalSize, JSStore.dedupSize, JSStore.filterDedupSize)
}

main();