/**
 * This script parses network logs 
 * and checks what fraction of snapshots 
 * have the exact same set of JavaScript files
 */
var fs = require('fs'),
    program = require('commander'),
    netParser = require('parser/networkParser');

program
    .option('-p, --path <path>', 'path to network log snapshots')
    .option('-n, --network [network]', 'list of network files')
    .parse(process.argv);

var getOrigUrl = function (n) {
    if (ignoreUrl(n)) return null;
    var timeStamp = timeStampInURL(n.url);
    if (!timeStamp) return null;
    if (n.redirects.length) {
        return n.redirects[n.redirects.length - 1].url;
    }
    return n.url;
    var urlPrefix = `https://web.archive.org/web/${timeStamp}`;
    var _origUrl = n.url.split(urlPrefix)
    if (_origUrl.length > 1)
        return _origUrl[1];
}

var ignoreUrl = function (n) {
    return n.request.method != "GET"
        || n.url.indexOf('data') == 0
        || !n.type
        || !n.size
        || n.response.status != 200;
    // || n.size < 1000;

}

var timeStampInURL = function (url) {
    // Only extract timestamp from the main part of the url
    var idx = url.indexOf('?');
    url = idx >= 0 ? url.slice(0, idx) : url;
    var hasNumbers = url.match(/\d+/g);
    if (hasNumbers) {
        for (var num of hasNumbers) {
            if (num.length == 14)
                return num;
        }
    }
    return false
}

var getDataFromNet = function (n) {
    try {
        var net = netParser.parseNetworkLogs(JSON.parse(fs.readFileSync(n, 'utf-8')));
        var netData = [];
        for (var n of net) {
            var origUrl = getOrigUrl(n);
            if (!origUrl) continue;
            var type = n.type.indexOf('script') >= 0 ? 'js' : 'other';
            if (type != 'js') continue;
            netData.push(origUrl)
        }
        return netData;
    } catch (e) {
        console.error(e)
        return {};
    }
}

var main = function () {
    var pages = fs.readFileSync(program.network, 'utf-8');

    // var dataStore = {
    //     other: { total: 0, dedup: 0, keys: [] },
    //     js: { total: 0, dedup: 0, filter_adblk: 0, filter_custom: 0, filter_both: 0, keys: [] }
    // }

    var [engineADBL, engineCUSTOM] = /*initBlockerEngines();*/[null, null];

    var netFiles = { all: [], unique: [] };

    pages.split('\n').forEach((p) => {
        if (p == '') return;
        try {
            program.verbose && console.log(p);
            var curNetFiles = getDataFromNet(`${program.path}/${p}/network`).toString();
            console.log(curNetFiles)
            if (netFiles.unique.indexOf(curNetFiles) < 0) {
                netFiles.unique.push(curNetFiles);
            }
            netFiles.all.push(curNetFiles);

            // program.verbose && console.log(dataStore.other.total, dataStore.other.dedup, dataStore.js.total, dataStore.js.dedup, dataStore.js.filter_adblk, dataStore.js.filter_custom, dataStore.js.filter_both);
        } catch (e) {
            program.verbose && console.log(`error while parsing network file: ${e}`);
        }

    })
    console.log(netFiles.all.length, netFiles.unique.length);
}

main();
