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

var dedupAnalysis = function(JSStore, page){
    var filenames = fs.readdirSync(`${program.dir}/${page}`);
    filenames.forEach((file)=>{
        try {
            if (file == '__metadata__' || file == 'py_out') return;
            var resInfo = parse(`${program.dir}/${page}/${file}/${file}`);
            var storedHashes = JSStore.files[file];
            if (!storedHashes){
                //first occurance of the file
                JSStore.files[file]=[resInfo.hash];
            } else {
                var isDuplicate = false;
                storedHashes.forEach((hash)=>{
                    if (hash == resInfo.hash){
                        //duplicate file
                        isDuplicate = true;
                    }
                });
                if (!isDuplicate){
                    JSStore.files[file].push(resInfo.hash);
                    JSStore.dedupSize += resInfo.length;
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

    var JSStore = {files:{}, dedupSize:0, totalSize:0};
    pages.forEach((page)=>{
        if (page == '') return;
        dedupAnalysis(JSStore, page)
        console.log(JSStore.totalSize, JSStore.dedupSize)
    });
    console.log(JSStore.totalSize, JSStore.dedupSize)
}

main();