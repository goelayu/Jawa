/**
 * Analyze the storage overhead of 
 * all other mimetypes
 */


var fs = require('fs'),
    program = require('commander');

program
    .option('-d, --dir [dir]','path to the src directory')
    .option('-u, --urls [urls]','list of urls the data needs to be processed on')
    .parse(process.argv);

var isFilterUrl = function(url){
    if (url.indexOf('web.archive.org/_static/')>=0  || url.indexOf('archive.org/includes')>=0)
        return true;

    return !timeStampInURL(url);
        
    
}

var timeStampInURL = function (url) {
    // Only extract timestamp from the main part of the url
    var idx = url.indexOf('?') ;
    url = idx >= 0 ? url.slice(0,idx) : url;
    var hasNumbers = url.match(/\d+/g);
    if (hasNumbers) {
        for (var num of hasNumbers) {
            if (num.length == 14)
                return num;
        }
    }
    return false
}

var dedupMime = function(mimeData, store){
    mimeData.forEach((entry)=>{
        var {url, content, length, type} = entry;
        var fType;
        if (!type) return;
        if (isFilterUrl(url)) return;
        if (type.indexOf('image')>=0) fType = 'image'
        else if (type.indexOf('css')>=0) fType = 'css'
        else if (type.indexOf('html')>=0) fType = 'html'
        else return;

        if (store[fType].hashes.indexOf(content)<0){
            store[fType].size+=length;
            store[fType].hashes.push(content);
        };
        store[fType].total+=length;
    })
}


function main(){
    var paths = fs.readFileSync(program.urls,'utf-8').split('\n'), store = {
        image:{size:0, hashes:[],total:0},
        css:{size:0, hashes:[],total:0},
        html:{size:0, hashes:[],total:0},
    };
    paths.forEach((path)=>{
        if (path == '') return;

        try {
            var mimeData = JSON.parse(fs.readFileSync(`${program.dir}/${path}/__metadata__/allfiles`,'utf-8'));
        } catch (e) {
            return;
        }
        dedupMime(mimeData, store);

    })
    console.log(`image ${store.image.size} css ${store.css.size} ${store.html.size}`)
    console.log(`image ${store.image.total} css ${store.css.total} ${store.html.total}`)
}
main();

