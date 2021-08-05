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

var isValidUrl = function(n){
    // const VALID_MIMES = ["image", "document", "script", "stylesheet"];
    const VALID_MIMES = ["image", "html", "script", "css","json",""];
    return n.request.method == "GET" &&
        n.url.indexOf('data')!=0 && 
        VALID_MIMES.some(e=>n.type.toLowerCase().indexOf(e)>=0 ) && 
        n.type.indexOf('gif')<0;

}

var getNetErrors = function(data){
    var net = netParser.parseNetworkLogs(data);
    var count = 0;
    for (var n of net){
        if (!isValidUrl(n)) continue;
        if (!n.response) continue;
        if (n.response && n.response.status > 400){
            count++;
        }
    }
    console.log(count);
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
            /*|| !isCriticalReq(n)*/) continue;
        var type;
        // var mainTypes = ['Image', 'Script','Document', 'Stylesheet'];
        const mainTypes = ["image", "html", "script", "css","json",""];
        for (var t of mainTypes){
            if (n.type.indexOf(t)>=0){
                type = t;
                break;
            }
        }
        if (mainTypes.indexOf(type)<0)
            type = 'Other';
        if (!(type in type2size))
            type2size[type] = 0;
        type2size[type] += n.size;
    };
    var totalSize = Object.values(type2size).reduce((acc,cur)=>{return acc + cur;},0);
    // Object.keys(type2size).forEach((t)=>{
    //     (t == 'Script') && console.log(`${type2size[t]/totalSize},${t}`);
    // });
    // console.log(type2size)
    if (totalSize < 1000){
        //hack, usually a page should contain more than 1000 bytes
        return;
    }
    console.log(type2size)
    console.log(type2size.script/totalSize)
    return type2size;
}

var getNumPerType = function(data){
    var net = netParser.parseNetworkLogs((data));
    var type2num = {};
    for (var n of net){
        if (!n.type || !isCriticalReq(n)) continue;

        if (!(n.type in type2num))
            type2num[n.type] = 0;
        type2num[n.type] += 1+ n.redirects.length;
    };
    var totalSize = Object.values(type2num).reduce((acc,cur)=>{return acc + cur;},0);
    // Object.keys(type2size).forEach((t)=>{
    //     console.log(`${t} ${type2size[t]/totalSize}`);
    // });
    console.log(type2num['Script'], totalSize);
    // return type2size;
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

var _getQueryParamsLen = function(url){
    return url.split('&').length
}  

var ignoreUrl = function(n, net){
    const VALID_MIMES = ["image", "document", "script", "stylesheet","xhr"];
    const INVALID_URL_DOMAINS = ["googletag", "archiveteam", "ping-meta-prd.jwpltx.com","prd.jwpltx.com","eproof.drudgereport.com","idsync.rlcdn.com","cdn.filestackcontent.com","connect.facebook.net","e.cdnwidget.com","nr-events.taboola.com","pixel.quantserve.com","pixel.wp.com","res.akamaized.net","sync.adkernel.com","certify.alexametrics.com","pixel.adsafeprotected.com","px.ads.linkedin.com","s.w-x.co","bat.bing.com","beacon.krxd.net","googleads.g.doubleclick.net","metrics.brightcove.com","ping.chartbeat.net","www.google-analytics.com","trc-events.taboola.com","px.moatads.com","www.facebook.com","sb.scorecardresearch.com","nexus.ensighten.com","odb.outbrain.com"];
    const QUERY_PARAMS_LIMIT = 10;
    var type = n.type;
    // return false
    return n.request.method != "GET"
        || n.frameId != net[0].frameId
        || !VALID_MIMES.filter(e=>type.toLowerCase() == e).length
        || INVALID_URL_DOMAINS.filter(e=>n.url.indexOf(e)>=0).length
        ||  n.url.indexOf('data') == 0
        || _getQueryParamsLen(n.url) > QUERY_PARAMS_LIMIT;
        
}

var getResOnPage = function(data){
    var net = netParser.parseNetworkLogs(parse(data)),
        total = 0, size=0;
    var urlSeen = [], typePrefix = ["js_","im_","cs_","if_"];
    for (var n of net){
        if (ignoreUrl(n, net)){
            continue;
        }
        if (program.siteType == "archive"){
            if (!isCriticalReq(n))
                continue;
            var _oUrl = n.url; 
            for (var t of typePrefix){
                _oUrl = _oUrl.replace(t,'');
            }
            if (urlSeen.indexOf(_oUrl)>=0)
                continue;
            urlSeen.push(_oUrl);
        }

        if (n.response && n.response.status == 200){
            // console.log(n.url, n.type)
            var encoding = n.response.headers['Content-Encoding'];
            total++;
            size+= encoding ? n.size : n.size/3;
            // else if(program.siteType != "live"){
            //     console.log(n.url)
            //     total++;
            // }
        }
    }
    console.log(size);
}

switch (program.type){
    case "prune": pruneDB(parse(program.input)); break
    case "netSize": getNetSize(parse(program.input)); break;
    case "netLen": getNumPerType(parse(program.input)); break;
    case "stall": getStallTime(program.input); break;
    case "queue" : getQueueTime(program.input); break;
    case "len": getNetLen(program.input); break;
    case "discovery": discoverTime(program.input); break;
    case "sp" : estimateSPTime(program.input);break;
    case "st": getSizePerType(program.input); break;
    case 'ss': estimateSnapshotSize(program.input); break;
    case 'res': getResOnPage(program.input);break;
    case 'fil': filler(program.input);break;
    case 'sum': console.log(Object.values(JSON.parse(fs.readFileSync(program.input,'utf-8'))).reduce((acc,cur)=>{return acc+cur},0)); break;
    case 'error' : getNetErrors(parse(program.input));
}