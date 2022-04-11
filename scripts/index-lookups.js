/**
 * 
 */

 var fs = require('fs'),
    program = require('commander');

    
const CRAWL_ENTRY_LEN= 77
const SERVING_ENTRY_LEN = 275
const SERVING_ENTRY_APPEND = 32

program
    .option('--jd [jd]', 'path to page javascript metadata')
    .option('--alld [alld]','path to all resource metadata')
    .option('--src [src]','path to src files data')
    .parse(process.argv);

var parse = function(f){
    return JSON.parse(fs.readFileSync(f, 'utf-8'));
}


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

var otherServe = function(page){
    var res = {lookups:0, cSize:0, sSize:0};
    var _all = `${program.src}/${page}/__metadata__/allfiles`,
        all = parse(_all);

    var urls = all.map(e=>e.url).filter(e=>!isFilterUrl(e));

    res.lookups += urls.length;
    res.sSize += urls.length * SERVING_ENTRY_LEN;
    return res;
}

var prettyPrintData = function(d){
    var {page, data} = d;
    console.log(`${page} Lookups: ${data.lookups.orig} ${data.lookups.union} cSize: ${data.cSize.orig} ${data.cSize.union} sSize: ${data.sSize.orig} ${data.sSize.union} cWrites ${data.cWrites.orig} ${data.cWrites.union}`)
}

var getLookUps = function(){
    var pageMD = parse(program.jd); // {page: {lookups:{}, cSize:{}, sSize:{}, cWrites:{}}}
    var allCWritesDict = parse(program.alld) // {page:cWrites}

    var indexStore = {
        cSize:{orig:0, union:0},
        sSize:{orig:0, union:0},
        lookups:{orig:0, union:0},
        cWrites:{orig:0, union:0}
    };

    var orig = union = 0;

    pages = Object.keys(pageMD);

    pages.forEach((page)=>{
        var jsData = pageMD[page];
        var allCWrites= allCWritesDict[page];

        var allSData = otherServe(page);

        var pageData = {
            lookups:{orig: jsData.lookups.orig + allSData.lookups, union:jsData.lookups.union+allSData.lookups},
            cSize:{orig:allCWrites*CRAWL_ENTRY_LEN + jsData.cSize.orig,union:allCWrites*CRAWL_ENTRY_LEN + jsData.cSize.union},
            sSize:{orig: allSData.sSize + jsData.sSize.orig, union:allSData.sSize + jsData.sSize.union},
            cWrites: {orig: jsData.cWrites.orig + allCWrites, union: jsData.cWrites.union + allCWrites}
        }

        prettyPrintData({page:page, data:pageData})

    })
}

getLookUps();