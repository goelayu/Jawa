/**
 * This module contains utility functions
 */

 const fs = require('fs'),
    program = require('commander'),
    netParser = require('parser/networkParser');


program
    .option('-i, --input [input]','path to the input file')
    .option('-t, --type [type]','type of run')
    .option('--site-type [value]',' type of sites, live or archive')
    .option('-o, --output [output]','path to output file')
    .parse(process.argv);

const RTT_DELAY = 80;

var parse = function(f){
    return JSON.parse(fs.readFileSync(f));
}

var pruneDB = function(d){
    var critera = "Top/News"
    d.forEach((entry)=>{
        if (entry.category.indexOf(critera)>=0)
            console.log(entry.url);
    });
}

var getQueueTime = function(data){
    var net = netParser.parseNetworkLogs(parse(data));
    for (var n of net){
        var startTime = n.requestStart_o;
        if (n.redirectResponse){
            console.log( (n.redirectResponse.timing.requestTime - n.requestStart_o)*1000 );
            startTime = n.redirectStart_o;
        } 
        if (n.response)
            console.log(( n.response.timing.requestTime - startTime)*1000);
    }
}

var getStallTime = function(data){
    var net = netParser.parseNetworkLogs(parse(data));
    for (var n of net){
        if (!n.response) continue;
        if (n.redirectResponse){
            console.log(n.redirectResponse.timing.sendStart - n.redirectResponse.timing.sslEnd);
        } 
        if (n.response)
            console.log(n.response.timing.sendStart - n.response.timing.sslEnd);
    }
}

var getNetSize = function(data){
    var net = netParser.parseNetworkLogs(data);
    var total = 0;
    for (var n of net){
        if (!n.size) continue;
        total += n.size;
    }
    console.log(total);
}

var getNetLen = function(data){
    var net = netParser.parseNetworkLogs(parse(data));
    console.log(net.length);
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

var isCriticalReq = function(n){
    var parsedTs = timeStampInURL(n.url);
    if (!parsedTs || (n.url.indexOf(`https://web.archive.org/web/${parsedTs}`)<0))
        return false;
    return true;
}

/*
Ignore all requests that don't have a valid response
since they can't be a frame for other resources to be loaded
inside
 */
var getReceivedTime = function(n){
    var lastReq = n.redirects.length ? n.redirects[n.redirects.length - 1] : 
        n;
    if (!lastReq.response) return null;
    var t = lastReq.response.timing;
    return t.requestTime + t.receiveHeadersEnd/1000;
}

var firstNonNegative = function(a,b,c){
    return a>=0 ? a : (b >= 0 ? b : c)
}

var getFinalUrl = function(n){
    var lastReq = n.redirects.length ? n.redirects[n.redirects.length - 1] : 
        n;
    return lastReq.url;
}

var getWaitTime = function(n){
    var timing = n.timing;
    var wait = timing.receiveHeadersEnd - timing.sendEnd;
    // var queued = n.requestStart - n.requestStart_o
    var stalled = firstNonNegative(timing.dnsStart, timing.connectStart, timing.sendStart);
    var ttfb = wait  + (stalled > -1 ? stalled : 0);
    return (ttfb - RTT_DELAY) >= 0 ? (ttfb - RTT_DELAY) : 0;
}

var getServerThinkTime = function(n){
    var lastReq = n.redirects.length ? n.redirects[n.redirects.length - 1] : 
        n;
    if (!lastReq.response) return 0;
    return getWaitTime(n);
}

var getSizePerType = function(data){
    var net = netParser.parseNetworkLogs(parse(data));
    var type2size = {};
    for (var n of net){
        if (!n.type || !n.size
            || !isCriticalReq(n)) continue;

        if (!(n.type in type2size))
            type2size[n.type] = 0;
        type2size[n.type] += n.size;
    };
    var totalSize = Object.values(type2size).reduce((acc,cur)=>{return acc + cur;},0);
    // Object.keys(type2size).forEach((t)=>{
    //     console.log(`${t} ${type2size[t]/totalSize}`);
    // });
    return type2size;
}

var estimateSnapshotSize = function(dir){
    var dom = `${dir}/DOM`;
    var net = `${dir}/network`;
    var type2size = getSizePerType(net);
    var domStr = fs.readFileSync(dom, "utf-8");
    var ssSize = 
        // domStr.length + 
        (type2size['Image'] ? type2size['Image'] : 0) + 
        (type2size['Document'] ? type2size['Document'] : 0) + 
        (type2size['Stylesheet'] ? type2size['Stylesheet'] : 0);
    var totalSize = Object.values(type2size).reduce((acc,cur)=>{return acc + cur;},0);
    // console.log(type2size)
    // console.log(ssSize, totalSize)
    console.log(ssSize,totalSize);
}

var estimateSPTime = function(data){
    var net = netParser.parseNetworkLogs(parse(data));
    var frameOrigTime = {},_g=getFinalUrl;
    var frameMaxResTime = {};
    var frames = new Set;
    for (var n of net){
        var frameUrl = n.documentURL;
        frames.add(frameUrl);
        var time = getServerThinkTime(n);
        frameOrigTime[_g(n)] = time;
        frameMaxResTime[_g(n)] = 0;
        if (n.url == frameUrl){
            continue;
        }
        if (!(frameUrl in frameMaxResTime)){
            // If the current request is same as the frame and it doesn't have
            //time entry -- ignore it
            console.error(`frameUrl ${frameUrl} has no minimum time entry`);
            continue;
        };

        var waitTime = getServerThinkTime(n);
        if (waitTime > frameMaxResTime[frameUrl])
            frameMaxResTime[frameUrl] = waitTime;

    }
    var plt = 0, baseFrame = Array.from(frames)[0];
    frames.forEach((f)=>{
        if (!frameOrigTime[f] || !frameMaxResTime[f]) return;
        if (f == baseFrame)
            plt = Math.max(plt, frameOrigTime[f] + frameMaxResTime[f])
        else 
            plt = Math.max(plt, frameOrigTime[baseFrame] + frameOrigTime[f] + frameMaxResTime[f])
    });
    console.log(plt);

}

var discoverTime = function(data){
    var net = netParser.parseNetworkLogs(parse(data));
    var urlToTime = {}, _g=getFinalUrl;
    for (var n of net){
        var frameUrl = n.documentURL;
        var time = getReceivedTime(n);
        if (time)
            urlToTime[_g(n)] = time;
        if (n.url == frameUrl){
            continue;
        }
        // console.log(ref); continue;
        if (!(frameUrl in urlToTime)){
            // If the current request is same as the frame and it doesn't have
            //time entry -- ignore it
            console.error(`frameUrl ${frameUrl} has not timing entry`);
            continue;
        };

        var frameRecTime = urlToTime[frameUrl];
        var startTime = n.requestStart_o;
        var discoveryTime = startTime - frameRecTime;
        // console.log(frameUrl, frameRecTime, startTime)
        console.log(n.url, discoveryTime);                
    }
}

var isMainFrame = function(n, firstReq){
    return true
    return n.frameId == firstReq.frameId;
    // var frameUrl = program.site.replace('www.','').replace('.com',''),
    //     ref = n.request.headers.Referer;
    // return !ref
    //     || (ref.indexOf(frameUrl)>=0);
}

var filler = function(data){
    // NO specific purpose, just for running queries on the network log
    var net = netParser.parseNetworkLogs(parse(data));
    for (var n of net){
        if (!n.response)
            console.log(n.url);
    }
}

var getResOnPage = function(data){
    var net = netParser.parseNetworkLogs(parse(data)),
        total = 0;
    var isfirstReq = true, firstReq;
    for (var n of net){
        if (isfirstReq){
            firstReq = n;
            isfirstReq = false;
        }
        if (program.siteType == "archive" && !isCriticalReq(n))
            continue;

        if (n.response && n.response.status == 200){
            if (program.siteType == "live" && isMainFrame(n, firstReq)){
                console.log(n.url);
                total++;
            }
            else if(program.siteType != "live"){
                console.log(n.url)
                total++;
            }
        }
    }
    console.log(total);
}

switch (program.type){
    case "prune": pruneDB(parse(program.input)); break
    case "netSize": getNetSize(parse(program.input)); break;
    case "stall": getStallTime(program.input); break;
    case "queue" : getQueueTime(program.input); break;
    case "len": getNetLen(program.input); break;
    case "discovery": discoverTime(program.input); break;
    case "sp" : estimateSPTime(program.input);break;
    case "st": getSizePerType(program.input); break;
    case 'ss': estimateSnapshotSize(program.input); break;
    case 'res': getResOnPage(program.input);break;
    case 'fil': filler(program.input);break;
}