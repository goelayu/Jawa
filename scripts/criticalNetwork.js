/*
Computes the network events on the critical path
*/

const netParser = require('parser/networkParser'),
    fs = require('fs'),
    program = require('commander'),
    util = require('util'),
    moment = require('moment');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');

program
    .option('-n, --network [network]', 'path to the network log')
    .option('-p, --plt [plt]', 'page load time')
    .option('-d, --debug', 'verbose logging, data dumped in debug file')
    .option('-u, --url [url]]', 'url of the site')
    .option('-t, --ts [ts]', 'timestamp of the current site')
    .parse(process.argv);


const DEBUG_FILE = ".debug";

var _oldLog = console.log;
var newLog = function(msg){
    _oldLog(`${program.url}: ${msg}`);
}
/*
Computes the total TTFB time across all network events
*/
var computeTTFB = function (netEvents) {
    var totalNetTime = totalTTFBTime
        = totalSSTime = 0;

    for (var n of netEvents) {
        if (!n.ttfb) continue;

        totalNetTime += n.endTime - n.startTime;
        totalTTFBTime += n.ttbf - n.startTime;
        if (!n.url.endsWith(".js"))
            totalSSTime += n.ttfb - n.startTime;
    }

    return [totalTTFBTime * 1000, totalNetTime * 1000];
}


/*
Computes the list of network events which are on the critical path, 
ie, isn't completely subsumed by other network requests.
*/
var computeCriticalNetworkEvents = function (net, plt) {
    var criticalEvents = [],
        firstEventTime = net[0].startTime,
        criticalNetTime = 0,
        timeLineMarker = firstEventTime,
        cutOff = firstEventTime + plt / 1000;

    for (var n of net) {

        if (!n.startTime || !n.endTime) continue;
        if (n.endTime > cutOff) continue;
        if (n.endTime >= timeLineMarker) {
            var relT = n.startTime >= timeLineMarker ? n.endTime - n.startTime :
                n.endTime - timeLineMarker;

            criticalNetTime += relT;
            timeLineMarker = n.endTime;
            criticalEvents.push(n);
        }

    }

    return [criticalEvents, criticalNetTime];
}

var computeTTFBPercentage = function (net) {
    for (var n of net) {
        if (!n.ttfb || !n.fetchStart) continue;

        var t = n.endTime - n.startTime,
            fb = n.ttfb - n.fetchStart;

        console.log(fb / t);
    }
}

/*
Computes the TTFB of the main document, or the first ttfb
*/
var computeMainFileTTFB = function (net, url) {
    var mainUrl = `http://${url}`, mainUrlS = `https://${url}`;
    for (var n of net) {
        if (n.url.endsWith(mainUrl) || n.url.endsWith(mainUrlS))
            return (n.ttfb - n.fetchStart) * 1000;
    }
    return null;
}

var computeMainFileReq = function (net, url) {
    var mainUrl = `http://${url}`, mainUrlS = `https://${url}`;
    for (var n of net) {
        if (n.url.endsWith(mainUrl) || n.url.endsWith(mainUrlS))
            return n;
    }
    return null;
}

var removeTrailingSlash = function (url) {
    var l = url.length;
    if (url[l - 1] == "/")
        return url.substr(0, l - 1);
    else return url;
}


/*
Checks if the first (main) TTFB was the slowest response
*/
var isMainReqSlowest = function (net, url) {
    var mainReqTime = computeMainFileTTFB(net, url);
    if (mainReqTime === null) return false;

    for (var n of net) {
        if (!n.ttfb || !n.fetchStart) continue;

        var fb = (n.ttfb - n.fetchStart) * 1000;
        if (fb > mainReqTime)
            return false;
    }

    return true;

}

var computeSlowestTTFB = function (net) {
    var slowestTTFB = 0;
    for (n of net) {
        if (!n.ttfb) continue;

        if ((n.ttfb - n.startTime) > slowestTTFB) {
            slowestTTFB = n.ttfb - n.startTime;
        }
    }
    return slowestTTFB;
}

var slowestST = function (st) {
    if (!st) return;
    var slowest = 0;
    st.split('\n').forEach((s) => {
        var [_, t] = s.split('dur=');
        if (t > slowest)
            slowest = t;
    });
    return slowest;
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

var getSizePerType = function(net){
    var type2size = {};
    for (var n of net){
        if (!n.type || !n.size) continue;

        if (!(n.type in type2size))
            type2size[n.type] = 0;
        type2size[n.type] += n.size;
    };
    var totalSize = Object.values(type2size).reduce((acc,cur)=>{return acc + cur;},0);
    Object.keys(type2size).forEach((t)=>{
        newLog(`${t} ${type2size[t]/totalSize}`);
    });
}

var smallUtil = function(net){
    var total = 0;
    for (var n of net){
        if (n.redirectResponse)
            total+=2
        else total++;
    };
    process.stdout.write(util.format(total + " "));
}

var getResponseHeader = function(n,h){
    return n.headers[h];
}

var serverTimingEntry = function(resp, entry){
    var serverTiming = getResponseHeader(resp, 'Server-Timing');
    if (!serverTiming) return null;
    var ret;
    var entries = serverTiming.split(',');
    entries.forEach((e,idx)=>{
        var [r,t] = e.split(';dur=');
        if (r.trim() == entry)
            ret = t;
    });
    return ret;
}

var getTopKExpensive = function(k, resp){
    var serverTiming = getResponseHeader(resp, 'Server-Timing');
    if (!serverTiming) return [];
    var entries = serverTiming.split(',');
    entries.forEach((e,idx)=>{
        entries[idx] = e.split(';dur=');
    });
    entries = entries.sort((a,b)=>{ return b[1] - a[1]});
    return entries.length >= k ? entries.slice(0,k) : entries;
}

var fromSamePage = function(resSrcs, res){
    var [crawl,ts] = res,
        tsFmt = "YYYYMMDDhhmmss",
        SAMEPAGEDUR = 1;
    var srcTs = moment(ts,tsFmt)
    var matchCrawls = resSrcs.filter(e=>e[0]==crawl);
    var foundMatch = false
    matchCrawls.forEach((m)=>{
        var dstTs = moment(m[1],tsFmt);
        if (Math.abs(
            srcTs.diff(dstTs,'minute')
        )<=SAMEPAGEDUR)
            foundMatch = true;
    });
    return foundMatch;
}

var scanTTFB = function (net, url, plt, ts) {
    // var mainReq = computeMainFileReq(net, url);
    // var ts = removeTrailingSlash;
    // if (mainReq.redirectResponse){
    //     var rr = mainReq.redirectResponse;
    //     // console.log(rr);
    //     console.log(true, ts(rr.url) == ts(rr.headers.location),rr.url, rr.headers.location);
    // }
    // else console.log(false);
    // return;
    // if (mainReqTime === null) return false;
    // console.log((mainReqTime.ttfb - mainReqTime.fetchRedirectStart)*1000)
    // console.log(mainReqTime.redirectResponse == null);
    var server2count = {}, count2latency = {};
    var allResData = [], nlen = 0, coldcount = hotcount = 0;
    var nARCFiles = new Set();
    for (var n of net) {
        if (!n.ttfb) continue;
        var tag = n.redirectResponse ? "redirect" : "direct", 
            type; 
        var parsedTs = timeStampInURL(n.url);
        if (!parsedTs){
            type = "toolbar"
            continue;
        }
        else if (n.url.indexOf(`https://web.archive.org/web/${parsedTs}`)<0){
            type = "toolbar"
            continue;
        }
        else type = "critical"   

        var status = Number.parseInt(n.response.status/100)*100;
        // if (status == 400)
        //     continue;
        if (tag == "direct") {

            var ld_resource = serverTimingEntry(n.response, "load_resource");
            var ttfb = (n.ttfb - n.requestFetch) * 1000;

            tag += `_${n.response.status}`
            // var ttfb = (n.ttfb - n.requestFetch)*1000;
            // total++;
            // // console.log((n.requestStart - (n.requestStart_o ))*1000, n.protocol)
            // if (tag.indexOf("200")>=0)
            var age;
            // if (!(parsedTs in seen)) {
            //     // seen[parsedTs] = true;
            //     age = "cold";
            // } else age = "hot"; 
            // console.log(ttfb, age, n.url, program.url);
            var _origFile = getResponseHeader(n.response, 'X-Archive-Src');
            // console.log(ttfb, `direct_${Number.parseInt(n.response.status/100)*100}`,n.url, ts, parsedTs, type);
            // console.log(parsedTs, getResponseHeader(n.response, 'x-app-server'))
            // if (!(parsedTs in server2count))
            //     server2count[parsedTs] = 0;
            // server2count[parsedTs]++;
            // var expST = getTopKExpensive(3, n.response);
            // expST.forEach((e)=>{
            //     console.log(ttfb, parsedTs, server2count[parsedTs], ...e, program.url);
            // });
        } else {
            var ld_resource = serverTimingEntry(n.redirectResponse, "load_resource");
            var redirectTime = (n.redirectStart_o - n.requestFetch) * 1000;
            var ttfb = (n.ttfb - n.redirectFetch) * 1000;
            var _origFile = getResponseHeader(n.redirectResponse, 'X-Archive-Src');
            // var firstTs = timeStampInURL(n.url);
            // var firstTag = firstTs ? (seen[firstTs] ? "seen" : "unseen") : "no_ts"
            // if (firstTag == "unseen") {
            //     //mainReq has an expensive 2nd rtt, even though the same ts was seen. Therefore to eliminate that from the median number, don't 
            //     //mark it as seen
            //     if (n != mainReq)
            //         seen[firstTs] = true;
            // }
            var age = "cold";
            var secondTs = timeStampInURL(n.redirectResponse.headers.location);
            // if (!(parsedTs in seen)){
            //     if (secondTs != parsedTs)
            //         seen[parsedTs] = true;
            //     age = "cold";
            // } else age = "hot"; 
            // console.log(redirectTime, age, ts, parsedTs, n.url ,program.url );

            tag += `_${n.response.status}`;
            if (!(parsedTs in server2count))
                server2count[parsedTs] = 0;
            server2count[parsedTs]++;
            if (!(secondTs in server2count))
                server2count[secondTs] = 0;
            server2count[secondTs]++;
            // var expST = getTopKExpensive(3, n.response);
            // expST.forEach((e)=>{
            //     console.log(redirectTime, parsedTs, server2count[parsedTs], ...e, program.url);
            // });
            // // console.log(redirectTime, parsedTs, server2count[parsedTs], getResponseHeader(n.redirectResponse, 'server-timing'));
            // var expST = getTopKExpensive(3, n.redirectResponse);
            // expST.forEach((e)=>{
            //     console.log(ttfb, secondTs, server2count[secondTs], ...e, program.url);
            // });
            // console.log(ttfb, secondTs, server2count[secondTs]);
            // console.log(secondTs, getResponseHeader(n.redirectResponse, 'x-app-server'))
            // console.log(parsedTs, getResponseHeader(n.response, 'x-app-server'))
            // console.log(ttfb, tag, n.redirectResponse.headers.location);
            // console.log((n.requestStart - (n.requestStart_o ))*1000, n.protocol)
            // console.log((n.redirectStart - (n.redirectStart_o))*1000, n.protocol)
            var age;
            var _origFile = getResponseHeader(n.response, 'x-archive-src');
            var appServer = getResponseHeader(n.response, 'X-App-Server')
            if (!_origFile) continue;
            var origFile = _origFile.split('/')[0];
            var resData = [origFile,secondTs];
            if (!(fromSamePage(allResData, resData))) {
                allResData.push(resData);
                age = "cold";
                coldcount++;
                ttfb2 = n.response.timing.receiveHeadersEnd - n.response.timing.sendEnd;
                // console.log(ttfb2);
            } else {
                hotcount++;
                // var cold_time = seen[key];
                age = "hot";
            }
            // console.log(redirectTime, 'direct_302', n.url, secondTs, parsedTs, age, age);
            // console.log(ttfb, age, n.redirectResponse.headers.location, program.url);
            // if (!secondTs)
            //     continue;
            var st = getResponseHeader(n.response, 'Server-Timing');
            var ld_resource = serverTimingEntry(n.response, "load_resource");
            var server = getResponseHeader(n.response, 'Server');
            // console.log(ttfb, `redirect_${Number.parseInt(n.response.status/100)*100}`,n.redirectResponse.headers.location, ts, secondTs, key, age, ld_resource, server);
        }
        // total++;

    }
    process.stdout.write(util.format(coldcount/(coldcount+hotcount)));
}

function main() {

    var netLog = JSON.parse(fs.readFileSync(program.network), "utf-8"),
        processNetLogs = netParser.parseNetworkLogs(netLog);

    if (program.plt)
        var plt = JSON.parse(fs.readFileSync(program.plt), "utf-8").loadTime;
    program.debug && fs.writeFileSync(DEBUG_FILE, JSON.stringify(processNetLogs));


    // smallUtil(processNetLogs);
    scanTTFB(processNetLogs, program.url, plt, program.ts);
    // printTTFB(processNetLogs);
    // console.log(isMainReqSlowest(processNetLogs, program.url))
    // computeTTFBPercentage(processNetLogs);
    // var [criticalEvents, criticalNetTime] = computeCriticalNetworkEvents(processNetLogs, plt);
    // var criticalTTBF = computeTTBF(criticalEvents);
    // console.log(plt, criticalNetTime);
}

main();