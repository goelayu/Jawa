/**
 * 
 * analyse how frequently do event handler filenames change
 */

var fs = require('fs'),
    program = require('commander');

program
    .option('-u, --urls [urls]', 'file containing list of urls')
    .option('-p, --performance [performance]','path to the performance directory')
    .parse(process.argv);

var extractFileNames = function(gFile){
    /**
     * Parses the dynamic cfg and creates a filename array
     */
    try{
        var graph = JSON.parse(fs.readFileSync(gFile, 'utf-8'));
        var fns = unique(mergeValsArr(graph));
        var filenames = [];
        fns.forEach((id)=>{
            var _filename =  id.split('-').slice(0,id.split('-').length - 4).join('-');
            if (filenames.indexOf(_filename)<0 && _filename != '')
                filenames.push(_filename);
        })
        return filenames;
    }catch (e) {
        // console.log(e)
        return [];
    }
}

var unique = function(arr){
    return [...new Set(arr)];
}

var mergeFiles = function(src, dst){
    var res = new Set(src);
    dst.forEach(res.add, res);
    return [...res];
}

var mergeValsArr = function(dict){
    /**
     * Takes a dictionary where values are arrays
     * and merges them together in a single array
     */

    var arr = [];
    Object.values(dict).forEach((val)=>{
        arr = arr.concat(val);
    });
    //add the keys as well since they are the root of the call gaphs
    arr = arr.concat(Object.keys(dict).map(e=>e.split(';;;;')[1]));
    return arr;
}

function main(){
    var paths = fs.readFileSync(program.urls,'utf-8').split('\n');
    var evtStore = {}, total = dedup = 0, fileUnion = [];
    paths.forEach((path)=>{
        if (path == '') return;
        // console.log(path)
        var cgpath = `${program.performance}/${path}/cg0`;
        var filenames = extractFileNames(cgpath);
        if (!filenames.length) return;
        // var fnStr = filenames + '';
        // console.log(fnStr)
        var newUnion = mergeFiles(fileUnion, filenames)
        if (newUnion > fileUnion){
            fileUnion = newUnion;
            dedup++;
        }
        total++;
        console.log(total, dedup);
    });
    console.log(total, dedup);
}

main();