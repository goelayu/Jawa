/**
 * This script does deduplicate analysis
 * for all mime-types based on only the network logs
 */

var fs = require('fs'),
    program = require('commander'),
    netParser = require('parser/networkParser'),
    blocker = require('@cliqz/adblocker');

const Request = blocker.Request;
const EASYPRIVACY=`${__dirname}/../../filter-lists/combined.txt`;
const CUSTOMLIST=`${__dirname}/../../filter-lists/alexa-3k`;

program
    .option('-n, --network [network]', 'file containing network file paths')
    .option('-v, --verbose', 'enable verbose logging')
    .parse(process.argv);


var getOrigUrl = function(n){
    if (ignoreUrl(n)) return null;
    var timeStamp = timeStampInURL(n.url);
    if (!timeStamp) return null;
    var urlPrefix = `https://web.archive.org/web/${timeStamp}`;
    var _origUrl = n.url.split(urlPrefix)
    if (_origUrl.length > 1)
        return _origUrl[1];
}

var ignoreUrl = function(n){
    return n.request.method != "GET"
        ||  n.url.indexOf('data') == 0
        || !n.type
        || !n.size
        || n.response.status != 200;
        // || n.size < 1000;
        
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

var initBlockerEngines = function(){
    var engineFactory = blocker.FiltersEngine;
    var engineADBL = engineFactory.parse(fs.readFileSync(EASYPRIVACY, 'utf-8')),
        engineCUSTOM = engineFactory.parse(fs.readFileSync(CUSTOMLIST, 'utf-8'));
    
    return [engineADBL, engineCUSTOM];
}

var _filterCheck = function(engine, url, sourceURL){
    return engine.match(Request.fromRawDetails({
        type:'script',
        url:url,
        sourceUrl: sourceURL
    })).match;

}

var checkForFilteredURLs = function(url, sourceURL, engines){
    var filter_adblk = filter_custom = false;

    filter_adblk = _filterCheck(engines[0], url, sourceURL);
    filter_custom = _filterCheck(engines[1], url, sourceURL);

    return [filter_adblk, filter_custom];
}

var updateDataStore = function(n, dataStore, engines){
    // n is the network file
    var net = netParser.parseNetworkLogs(JSON.parse(fs.readFileSync(n, 'utf-8')));
    for (var n of net){
        var url = getOrigUrl(n);
        if (!url) continue;

        var type = n.type.indexOf('script') >=0 ? 'js' : 'other';
        var key = `${url}+${n.size}`;
        if (dataStore[type].keys.indexOf(key)<0){
            dataStore[type].dedup += n.size
            dataStore[type].keys.push(key);

            //check against filter lists
            if (type == 'js'){
                var [filter_adblk, filter_custom] = checkForFilteredURLs(n.url, net.documentURL, engines);
                !filter_adblk && (dataStore[type].filter_adblk += n.size);
                !filter_custom && (dataStore[type].filter_custom += n.size);
                (!filter_custom && !filter_adblk) && (dataStore[type].filter_both += n.size);
            }

        }
        dataStore[type].total += n.size;
    }
}

var main = function(){
    var pages = fs.readFileSync(program.network, 'utf-8');

    var dataStore = {
        other: {total:0, dedup:0, keys:[]},
        js: {total:0, dedup:0, filter_adblk:0, filter_custom:0, filter_both: 0, keys:[]}
    }

    var [engineADBL, engineCUSTOM] = initBlockerEngines();

    pages.split('\n').forEach((p)=>{
        if (p == '') return;
        try {
            updateDataStore(p, dataStore, [engineADBL, engineCUSTOM]);
        } catch (e){
            program.verbose && console.log(`error while parsing network file: ${e}`);
        }

    })
    console.log(dataStore.other.total, dataStore.other.dedup,dataStore.js.total, dataStore.js.dedup, dataStore.js.filter_adblk, dataStore.js.filter_custom, dataStore.js.filter_both);
}

main();
