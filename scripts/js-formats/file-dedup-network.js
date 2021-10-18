/**
 * This script does deduplicate analysis
 * for all mime-types based on only the network logs
 */

var fs = require('fs'),
    program = require('commander'),
    netParser = require('parser/networkParser');

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

var updateDataStore = function(n, dataStore){
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
        }
        dataStore[type].total += n.size;
    }
}

var main = function(){
    var pages = fs.readFileSync(program.network, 'utf-8');

    var dataStore = {
        other: {total:0, dedup:0, keys:[]},
        js: {total:0, dedup:0, keys:[]}
    }

    pages.split('\n').forEach((p)=>{
        if (p == '') return;
        try {
            updateDataStore(p, dataStore);
        } catch (e){
            program.verbose && console.log(`error while parsing network file: ${e}`);
        }

    })
    console.log(dataStore.js.total, dataStore.js.dedup, dataStore.other.total, dataStore.other.dedup);
}

main();
