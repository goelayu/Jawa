/**
 * Generates a bash script for running
 * archive_Filter in a parallel fashion
 * 
 */

 var fs = require('fs'),
    program = require('commander');

program 
    .option('-p, --paths [paths]','file containing list of paths')
    .option('-s, --site [site]','site name')
    .parse(process.argv);

var createBashScript = function(){
    var _paths = fs.readFileSync(program.paths, 'utf-8'),
        paths = _paths.split('\n');
    
    paths = paths.filter(e=>e!= '' && e!= '\n');
    var len = paths.length;
    var bashCmd = '';
    var splits = 30, splitSize = Number.parseInt(len/splits);
    for (var ind = 1; ind<=splits;ind++){
        var head = splitSize*ind, 
            tail = splitSize;

        if (ind == splits){
            head = len;
            tail = (len - splits*splitSize) + splitSize; // add the difference 
        }
        var _cmd = `python ../pyutils/archive_filter.py /w/goelayu/webArchive/data/sites/${program.site}/instOutput <(cat /vault-home/goelayu/webArchive/data/500k/stats/fns/${program.site} | head -n ${head} | tail -n ${tail} | cut -d/ -f2,3)`
        console.log(_cmd);
    }

}

createBashScript();