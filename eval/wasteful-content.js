/**
 * This script 
 * determine what resources are stored on Internet archive
 * but never successfully fetched.
 */

 var fs = require('fs'),
    program = require('commander'),
    netParser = require('parser/networkParser'),
    fetch = require('node-fetch');

program
    .option('-l, --live [live]','path to the live network file')
    .option('-a, --archive [archive]', 'path to the archive network file')
    .parse(process.argv);


var parse = function(f){
    return JSON.parse(fs.readFileSync(f));
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

var stripArchiveURL = function(url){
    var _u = url.split('/');
    return _u.slice(5,).join('/');
}

var isCriticalReq = function(n){
    var parsedTs = timeStampInURL(n.url);
    if (!parsedTs || (n.url.indexOf(`https://web.archive.org/web/${parsedTs}`)<0))
        return false;
    return true;
}



var getURLs = function(netData, isArchive){
    var urls = [];
    var net = netParser.parseNetworkLogs((netData));
    for (var n of net){
        if (!n.type || (isArchive && !isCriticalReq(n))) continue;

        if (n.response && n.response.status == 200){
            if (isArchive)
                urls.push(stripArchiveURL(n.url))
            else urls.push(n.url);
        }
    }
    return [...new Set(urls)];
}

var _wastefulContent = async function(live, archive){
    var fetched = stored = 0; // fetched are also stored 
    for (var l of live){
        console.log(`checking url: ${l}`);
        if (archive.indexOf(l)>=0){
            console.log('fetched')
            fetched++;
            continue;
        } else {
            var IAUrl = `https://web.archive.org/web/20201109050505/${l}`
            try{
                var r = await fetch(IAUrl);
            if (r.status == 200)
                stored++;
            console.log(`stored: ${IAUrl} ${r.status}`)
            } catch (e){
                // pass 
            }
        }
    }
    console.log(`fetched: ${fetched} stored: ${stored}`);
}

var wastefulContent = function(){
    var liveNet = parse(program.live);
    var archiveNet = parse(program.archive);

    var liveURLs = getURLs(liveNet, false);
    var archiveURLs = getURLs(archiveNet, true);
    // console.log(JSON.stringify(archiveURLs));
    console.log(liveURLs.length, archiveURLs.length)
    _wastefulContent(liveURLs, archiveURLs);
}

wastefulContent();