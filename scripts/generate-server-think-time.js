/*
Process chrome network logs and outputs
a map of resource to server think time 

- For resources which were redirected, only the second round trip
time is taken into account as the server-think time
*/

const netParser = require('parser/networkParser'),
    fs = require('fs'),
    program = require('commander'),
    util = require('util'),
    moment = require('moment');

const DIRECT_STT="/home/goelayu/research/webArchive/data/processed/median-seen-ts-time/"


program
    .option('-i, --input [input]','path to the input network file')
    .option('-o, --output [output]', 'path to the output file')
    .option('-d, --data [data]','type of data to be extracted')
    .option('-u, --url [url]','url of the site')
    .parse(process.argv);

const RTT_DELAY=80;

var getMedianDirectST = function(url){
    try {
        return Number.parseFloat(fs.readFileSync(`${DIRECT_STT}/${url}`));
    } catch (e){
        console.error("Error while parsing median server think time",e)
        return 0;
    }
}

var computeMainFileReq = function(net, url){
    var mainUrl = `http://${url}`, mainUrlS = `https://${url}`;
    for (var n of net){
        if (n.url.endsWith(mainUrl) || n.url.endsWith(mainUrlS))
            return n;
    }
    return null;
}

var timeStampInURL = function(url){
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

var getResponseHeader = function(n,h){
    return n.headers[h];
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

var firstNonNegative = function(a,b,c){
    return a>=0 ? a : (b >= 0 ? b : c)
}

var getWaitTime = function(n){
    var timing = n.timing;
    var wait = timing.receiveHeadersEnd - timing.sendEnd;
    // var queued = n.requestStart - n.requestStart_o
    var stalled = firstNonNegative(timing.dnsStart, timing.connectStart, timing.sendStart);
    var ttfb = wait  + (stalled > -1 ? stalled : 0);
    return (ttfb - RTT_DELAY) >= 0 ? (ttfb - RTT_DELAY) : 0;
}

var validNet = function(n){
    return n.response && !n.response.fromDiskCache && 
    n.responseTime && n.requestFetch;
}

var getWaitTimes = function(n){
    var urlTimeAr = [];
    if (validNet(n)){
        urlTimeAr.push([n.url, getWaitTime(n)]);
    }
    n.redirects.forEach((r)=>{
        validNet(r) && urlTimeAr.push([r.url, getWaitTime(r)]);
    });
    return urlTimeAr;
}

var getWaitTimesRedirect = function(n){
    var urlTimeAr = [];
    var lastReq = n.redirects.length ? n.redirects[n.redirects.length - 1] : 
        n;
    if (validNet(n)){
        urlTimeAr.push([n.url, getWaitTime(lastReq)]);
    }
    return urlTimeAr;
}

var cacheData = [];
var getWaitTimesRedirectWarm = function(n){
    var urlTimeAr = [];
    var lastReq = n.redirects.length ? n.redirects[n.redirects.length - 1] : 
        n;
    if (!validNet(lastReq)) return [];
    var ts = timeStampInURL(lastReq.url);
    var _warcSrc = getResponseHeader(n.response, 'x-archive-src');
    if (_warcSrc) {
        var warcSrc = _warcSrc.split('/')[0];
        var cacheKey = [warcSrc, ts];
        if (!(fromSamePage(cacheData, cacheKey))){
            cacheData.push(cacheKey);
            urlTimeAr.push([n.url, getWaitTime(lastReq)]);
        }
    } else {
        urlTimeAr.push([n.url, getWaitTime(lastReq)]);
    }
    return urlTimeAr;
}

var getUrlSuffix = function(u, host){
    return u.replace(`https://${host}`,'');
}

var getHost = function(n){
    var response = n.response ? n.response : (
        n.redirects.length ? n.redirects[0].response : null
    );
    if (!response) return;
    return response.requestHeaders[":authority"] ? 
    response.requestHeaders[":authority"] : response.requestHeaders.Host ? response.requestHeaders.Host : null;
}

var getDirectTTFB = function(net,url, dType){
    var mainReq = computeMainFileReq(net, url);
    // var medDirect = getMedianDirectST(url);
    var seen = {},
        resLatencyMap = {}, type, count=0, allResData = [];
    for (var n of net){

        var curTs = timeStampInURL(n.url);
        if (curTs && (n.url.indexOf(`https://web.archive.org/web/${curTs}`) == 0) ){
            type = "critical";
        }

        var host = getHost(n);
        if (!host){
            continue;
        }
        if (!(host in resLatencyMap))
            resLatencyMap[host]={};

        // if (!count){
        //     var ttfb2 = n.response.timing.receiveHeadersEnd - n.response.timing.sendEnd;
        //     var ttfb2_fin = ttfb2-RTT_DELAY > 0 ? ttfb2-RTT_DELAY : 0;
        //     resLatencyMap[host][urlSuffix]= ttfb2_fin;
        //     process.stdout.write(util.format(ttfb2_fin));
        //     break;
        // }

        var timeFn;
        switch(dType){
            case "ttfb_orig": timeFn = getWaitTimes;break;
            case "ttfb_redirect": timeFn = getWaitTimesRedirect; break;
            case "ttfb_redirect_warm": timeFn = getWaitTimesRedirectWarm; break;
            case "ttfb_dup": timeFn:getWaitTimesDup;break;
        }

        var urlTimeAr = timeFn(n);
        urlTimeAr.forEach((i)=>{
            var urlSuffix = getUrlSuffix(i[0], host);
            resLatencyMap[host][urlSuffix] = i[1];
        });
        continue;

        if (tag == "direct") {
            var url = n.url;
            var ttfb = getWaitTime(n);
            resLatencyMap[host][urlSuffix]=ttfb-RTT_DELAY > 0 ? ttfb-RTT_DELAY : 0;
            count++;
            // if (type == "critical")
            //     resLatencyMap[host][urlSuffix] = 0; 
            // else resLatencyMap[host][urlSuffix]=ttfb-RTT_DELAY > 0 ? ttfb-RTT_DELAY : 0;
            // console.log(n.url, ttfb);
        } else {
            var [ttfb1,ttfb2] = getWaitTime(n);

            var ttfb1_fin = ttfb1 -RTT_DELAY > 0 ? ttfb1-RTT_DELAY : 0;
            
            var urlRedirect = n.redirectResponse.headers.location.replace(`https://${host}`,'');

            var ttfb2_fin = ttfb2-RTT_DELAY > 0 ? ttfb2-RTT_DELAY : 0;
            var secondTs = timeStampInURL(n.redirectResponse.headers.location);
            var _origFile = getResponseHeader(n.response, 'x-archive-src');
            // // console.log(_origFile)
            // if (!_origFile) continue;
            // var origFile = _origFile.split('/')[0];
            // var resData = [origFile,secondTs];
            // if (!(fromSamePage(allResData, resData))) {
            //     allResData.push(resData);
            //     // age = "cold";
            //     // coldcount++;
            //     // console.log(`${resData} is cold`)
            //     // resLatencyMap[host][urlSuffix]= ttfb2_fin;
            // } else {
            //     // console.log(`${resData} is hot`)
            //     // hotcount++;
            //     // var cold_time = seen[key];
            //     // age = "hot";
            // }

            resLatencyMap[host][urlSuffix]= ttfb1_fin;
            resLatencyMap[host][urlRedirect]= ttfb2_fin;
            // count+=2;
            // var url = n.url; // The patched mahimahi files have the original url with the response of the redirected content, ie the redirected location is completely removed
        };
        // if (n==mainReq) break;
        // console.log(url, ttfb, _ttfb);
    }
    // console.log(count)
    program.output && fs.writeFileSync(program.output, JSON.stringify(resLatencyMap));
}

var removeTrailingSlash = function(url, host){
    var l = url.length;
    if (url[l-1] == "/")
        return (url.substr(0,l-1).split(host).splice(1,)).join("");
    else return (url.split(host).splice(1,)).join("");
}

var removeHost = function(url,host){
    //for some reason newline inside location
    if (url.indexOf('\n')>=0)
        url = url.split('\n')[0];
    return url.replace(`https://${host}`,'');
    // return url.split(host).slice(1,).join("");
}

var getRedirectURLMap = function(net){
    var urlMap = {};
    for (var n of net){
        var lastReq = n.redirects.length ? n.redirects[n.redirects.length - 1] : 
        n;
        if (!lastReq.response || lastReq.response.fromDiskCache
            || lastReq == n) continue;
        var rr, rh = removeHost;
        var host = lastReq.response.requestHeaders[":authority"] ? 
        lastReq.response.requestHeaders[":authority"] : lastReq.response.requestHeaders.Host ? lastReq.response.requestHeaders.Host : null;
        if (!host) {
            console.log(`${n.url} has no host information`);
            continue;
        }
        urlMap[rh(n.url,host)] = rh(lastReq.url,host);
    }
    fs.writeFileSync(program.output,JSON.stringify(urlMap))
}

var _getInitialRequestUrl = function(net, finalReqUrl){
    var initReq;
    for (var n of net){
        if (!n.redirectResponse){
            if (n.url == finalReqUrl)
                return finalReqUrl;
        } else {
            if (n.redirectResponse.headers.location == finalReqUrl)
                return n.url;
        }
    }
}

var getAllUrls = function(net){
    var allUrls = {},
        defaultFrame,
        _orig = _getInitialRequestUrl;
    var typeDict = { "document":"document", "font":"font", "image":"image","script":"script","styleSheet":"style","xhr":"fetch"}
    net.forEach((n,ind)=>{
        if (ind == 0){
            defaultFrame = n.url;
            return;
        }
        if (!n.type) return;
        var srcFrame = n.request.headers.Referer ? _orig(net, n.request.headers.Referer) : defaultFrame;
        if (!srcFrame){
            console.error(`No src frame found`);''
            return;
        }
        if (!(srcFrame in allUrls))
            allUrls[srcFrame] = [];
        var type = n.type.toLowerCase();
        if (!(type in typeDict)) return;
        allUrls[srcFrame].push([n.url,typeDict[type]]);
    });
    fs.writeFileSync(program.output, JSON.stringify(allUrls));
}

function main(){
    var netLog = JSON.parse(fs.readFileSync(program.input),"utf-8"),
         processNetLogs = netParser.parseNetworkLogs(netLog);

    // getDirectTTFB(processNetLogs);
    if (program.data.indexOf("ttfb")>=0)
        getDirectTTFB(processNetLogs, program.url, program.data);
    else if (program.data == "map") 
        getRedirectURLMap(processNetLogs);
    else if (program.data == "all")
        getAllUrls(processNetLogs)
}

main();