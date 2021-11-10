/**
 * This script returns the list
 * of URLs which don't match the given filter list
 */

const fs = require('fs'),
    program = require('commander'),
    blocker = require('@cliqz/adblocker');

const EASYPRIVACY=`${__dirname}/../../filter-lists/combined.txt`;
program
    .option('-u, --urls [urls]','file containing list of URLs')
    .option('-f, --filters [filters]','file containing list of filters (optional)')
    .parse(process.argv);


var initiateBlocker = function(){
    var engineFactory = blocker.FiltersEngine;
    return engine = engineFactory.parse(fs.readFileSync(EASYPRIVACY, 'utf-8'));
}

var filterURLs = function(){
    var _urls = fs.readFileSync(program.urls, 'utf-8'),
    urls = _urls.split('\n').filter(e=>e!="");
    var engine = initiateBlocker();
    var Request = blocker.Request;
    var remainingURLs = [];
    urls.forEach((u)=>{
        var res = engine.match(Request.fromRawDetails({
            type:'script',
            url:u,
            sourceUrl: 'https://www.nytimes.com'
        }));
        // console.log(`URL:${u}, Match:${res.match}`);
        !res.match && remainingURLs.push(u);
    })
    remainingURLs.forEach((u)=>{
        console.log(u)
    })
}

filterURLs();