/*
Computes the network events on the critical path
*/

const netParser = require('parser/networkParser'),
    fs = require('fs'),
    program = require('commander'),
    util = require('util');
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

var scanTTFB = function (net, url, plt, ts) {
    var mainReq = computeMainFileReq(net, url);
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
    var own = script = 0;
    var typeToSize = {};
    for (var n of net) {
        if (!n.ttfb) continue;
        // if (n == mainReq){
        //     ttfb = (n.ttfb - n.redirectFetch)*1000;
        //     endTime = (n.endTime - n.redirectFetch)*1000;
        //     var delay = 190 + endTime;
        //     console.log(n.url, delay);
        //     return
        //     // ttfb = _ttfb = (n.redirectStart_o - n.requestFetch)*1000;
        // }
        var tag = n.redirectResponse ? "redirect" : "direct";

        // var reason = n.redirectResponse.headers["x-archive-redirect-reason"];
        // var newLoc = reason.split('at ')[1];
        //     if (n.redirectResponse.url.indexOf(newLoc)>=0){
        //         console.log(n.redirectResponse.url, n.redirectResponse.headers.location
        //             , n.redirectResponse.url+'/' ==  n.redirectResponse.headers.location);
        //     }
        //     totalDirect++;   
        //     var t =  (n.ttfb - n.fetchStart)*1000;
        //     if (t>=mainReqTime)
        //         slowInDirect++;  
        // }

        // var resST =  n.response.headers["server-timing"];
        // var st = slowestST(resST);
        var parsedTs = timeStampInURL(n.url);
        if (!parsedTs)
            console.log(n.url, url);
        continue;
        if (tag == "direct") {
            // continue;

            var ttfb = (n.ttfb - n.requestFetch) * 1000;

            if (!parsedTs) {
                console.log(n.url);
                // console.log(ttfb, "no_ts");
            } else {
                // if (parsedTs in seen){
                //     console.log(ttfb, "seen",n.url);
                // }
                // else {
                //     console.log(ttfb, "unseen", n.url)
                //     seen[parsedTs] = true;
                // }
            }
            continue;
            // tag += `_${n.response.status}`
            // var ttfb = (n.ttfb - n.requestFetch)*1000;
            // total++;
            // // console.log((n.requestStart - (n.requestStart_o ))*1000, n.protocol)
            // if (tag.indexOf("200")>=0)
            //     console.log(ttfb, tag, n.url);
        } else {
            console.log(n.url);
            continue;
            // if (n == mainReq){
            //     var redirectTime = (n.redirectStart_o - n.requestFetch)*1000;
            //     console.log(redirectTime, n.url, "first")
            // }
            var redirectTime = (n.redirectStart_o - n.requestFetch) * 1000;
            var ttfb = (n.ttfb - n.redirectFetch) * 1000;
            var firstTs = timeStampInURL(n.url);
            var firstTag = firstTs ? (seen[firstTs] ? "seen" : "unseen") : "no_ts"
            if (firstTag == "unseen") {
                //mainReq has an expensive 2nd rtt, even though the same ts was seen. Therefore to eliminate that from the median number, don't 
                //mark it as seen
                if (n != mainReq)
                    seen[firstTs] = true;
            }
            console.log(redirectTime, firstTag, n.url);

            var secondTs = timeStampInURL(n.redirectResponse.headers.location);
            var secondTag = secondTs ? (seen[secondTs] ? "seen" : "unseen") : "no_ts"
            if (secondTag == "unseen")
                seen[secondTs] = true;
            console.log(ttfb, secondTag, n.redirectResponse.headers.location);
            // console.log((n.requestStart - (n.requestStart_o ))*1000, n.protocol)
            // console.log((n.redirectStart - (n.redirectStart_o))*1000, n.protocol)
            // console.log(redirectTime,`redirect_302_${Number.parseInt(n.response.status/100)*100}`, n.url);
            // console.log(ttfb, `redirect_${Number.parseInt(n.response.status/100)*100}`,n.redirectResponse.headers.location);
        }
        // total++;

    }
    process.stdout.write(util.format(script / totalSize));
}

function main() {

    var netLog = JSON.parse(fs.readFileSync(program.network), "utf-8"),
        processNetLogs = netParser.parseNetworkLogs(netLog);

    if (program.plt)
        var plt = JSON.parse(fs.readFileSync(program.plt), "utf-8").loadTime;
    program.debug && fs.writeFileSync(DEBUG_FILE, JSON.stringify(processNetLogs));


    getSizePerType(processNetLogs);
    // console.log(processNetLogs.length);
    // scanTTFB(processNetLogs, program.url, plt, program.ts);
    // printTTFB(processNetLogs);
    // console.log(isMainReqSlowest(processNetLogs, program.url))
    // computeTTFBPercentage(processNetLogs);
    // var [criticalEvents, criticalNetTime] = computeCriticalNetworkEvents(processNetLogs, plt);
    // var criticalTTBF = computeTTBF(criticalEvents);
    // console.log(plt, criticalNetTime);
}

main();