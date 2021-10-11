/**
 * This module contains utility functions
 */

 const { ENETUNREACH } = require('constants');
const fs = require('fs'),
    program = require('commander'),
    netParser = require('parser/networkParser');
    fuzz = require('fuzzball');


program
    .option('-i, --input [input]','path to the input file')
    .option('-a, --anotherin [anotherin]','path to the second input file')
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
    // identify 302 not found 
    var JSERRORCOUNT = 426697 //426698(2000) 
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
    // console.log(type2size)
    type2size.script != JSERRORCOUNT && console.log(type2size.script/totalSize)
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

var matchNetwork = function(net1, net2){
    /**
     * returns the number of matching urls between two network logs
     */
     var ignoreUrl = function(n){
        var type = n.type;
        return n.request.method != "GET"
            ||  n.url.indexOf('data') == 0
            || !n.type
            || !n.size;
            
    }
    var isBestMatch = function(u1, u2){
        u1 = u1.split('?')[0],
            u2 = u2.split('?')[0];
        
        if (u1 == u2) return true;
        return false;
    }

    var fuzzMatch = function(src, options){
        var bestMatch, bestScore = 0;
        options.forEach((target)=>{
            var score;
            if ((score = fuzz.ratio(src, target)) > bestScore){
                bestScore = score;
                bestMatch = target; 
            }
        })
        // console.log(bestScore, bestMatch)
        // return bestScore > 95 ? bestMatch : null;
        return bestMatch;
    }

    net1 = netParser.parseNetworkLogs(parse(net1)),
        net2 = netParser.parseNetworkLogs(parse(net2));
    var total = match = 0,bestMatchCache = [],
        filtern2 = net2.filter(e=>!ignoreUrl(e)).map(e=>e.url);
    if (!filtern2.length){
        // console.log(total, match);
        return;
    }
    for (var n1 of net1){
        if (ignoreUrl(n1)) continue;
        total += n1.size/1000;
        // total++
        var foundIdentical = false;
            
        // console.log(n1.url)
        for (var n2 of net2){
            if (ignoreUrl(n2)) continue;
            // console.log('comparing with ', n2.url)
            if (isBestMatch(n1.url, n2.url)){
                foundIdentical = true;
                // console.log(n1.url, n2.url)
                match += n1.size/1000;
                break;
            }
        }
        // if (foundIdentical) continue;
        // var bestMatch = fuzzMatch(n1.url, filtern2);
        // // console.log(bestMatch)
        // if (bestMatchCache.indexOf(bestMatch)>=0){
        //     // console.log(n1.url, bestMatch)
        //     match += n1.size/1000;
        // }
        // else bestMatchCache.push(bestMatch)
        // if (bestMatch){
        //     if (bestMatch != n1.url) console.log(bestMatch, n1.url)
        //     match += n1.size/1000;
        // } else {
        //     console.log(`no match for ${n1.url}`)
        // }
        // console.log(n1.url, bestMatch);
    }
    console.log(total, match)
    // var sum = (total, cur) => {return total + cur.size}
    // console.log(net1.filter(e=>!ignoreUrl(e)).reduce(sum,0), net2.filter(e=>!ignoreUrl(e)).reduce(sum, 0));
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

var ignoreUrl = function(n){
    var type = n.type;
    return n.request.method != "GET"
        ||  n.url.indexOf('data') == 0
        || !n.type
        || !n.size
        || n.response.status != 200
        || n.size < 1000;
        
}

var allInitiatedFiltered = function(n){
    var allurls = new Set;
    var mem = [];
    var url = n.url;
    var _inits = function(url){
        if (mem.indexOf(url)>=0) return;
        mem.push(url)
        if (initDict[url]){
            initDict[url].forEach((u)=>{
                // console.log(n.url, n.type)
                allurls.add(u);
                _inits(u);
            });
        }
    }
    _inits(url)
    return allurls;
}

var getFilteredUrls = function(data){
    var net = netParser.parseNetworkLogs(parse(data));
    var urls = new Set;
    for (var n of net){
        if (n.isFiltered){
            // console.log(n.url)
            gfiltered++;
            if (n.initiator.type == 'script') gfilteredFromScripts++
            else filteredURLs.push(n.url);
            urls.add(n.url)
            // console.log(n.url, n.type)
            if (initDict[n.url]){
                var allurls = [...allInitiatedFiltered(n)]
                allurls.forEach(urls.add, urls);
                // count += initDict[n.url].length
            }
        }
    }
    return urls;
}

var isInitiatedBy = function(src, target){
    if (target.initiator && target.initiator.type == 'script'){
        for (var cs of target.initiator.stack.callFrames){
            if (cs.url == src || 
                cs.url.split('?')[0] == src.split('?')[0])
                return true;
        }
    };
    return false;
}


// // ABPFilterParser.parse(someOtherListOfFilters, parsedFilterData);

// function filter(){
//     // console.log(`domain is ${program.domain}`)
//     var urls = getURLs(program.network)
//     var count = 0;
//     urls.forEach((u)=>{
//         if (ABPFilterParser.matches(parsedFilterData,u, {
//             domain: program.domain
//         } )) {
//             // console.log(`filtering ${u}`)
//             count++;
//         }
//     });
//     console.log(count);
// }

// filter();

// if (ABPFilterParser.matches(parsedFilterData, urlToCheck, {
//       domain: currentPageDomain,
//       elementTypeMaskMap: ABPFilterParser.elementTypes.SCRIPT,
//     })) {
//   console.log('You should block this URL!');
// } else {
//   console.log('You should NOT block this URL!');
// }

var initiatedRequests = function(allNet, filterNet){

    let ABPFilterParser = require('abp-filter-parser');

let easyListTxt = fs.readFileSync('/vault-home/goelayu/webArchive/filter-lists/final.txt', 'utf-8');
let parsedFilterData = {};

ABPFilterParser.parse(easyListTxt, parsedFilterData);
    allNet = netParser.parseNetworkLogs(parse(allNet)),
        filterNet = netParser.parseNetworkLogs(parse(filterNet));
    
    var resInitiated = {};
    var unfilteredScripts = filterNet.filter(e=>!ignoreUrl(e) && e.type.toLowerCase().indexOf('script')>=0);
    unfilteredScripts.forEach((sc)=>{
        resInitiated[sc.url] = {all:[], filtered:[]}; //track res initiated during original and filtered run
    })
    // console.log(unfilteredScripts.map(e=>[e.url, e.type]))
    var filteredUrls = [], filterDomains = new Set;
    for (var f of filterNet){
        if (f.isFiltered){
            // console.log(f.url)
            filteredUrls.push(f.url.split('?')[0]);
            continue;
        }
        if (ignoreUrl(f)) continue;
        if (!f.initiator || f.initiator.type != "script") continue;
        var stack = f.initiator.stack.callFrames,
            src = stack[stack.length - 1].url;
        
        // console.log(src)
        var domain = f.url.split('/')[2];
        filterDomains.add(domain);
        resInitiated[src] && resInitiated[src].filtered.push(f.url);
    }
    filterDomains = [...filterDomains];
    var domain = allNet[0].documentURL;
    for (var a of allNet){
        if (ignoreUrl(a)) continue;
        if (a.url.indexOf('amazon')>=0 || a.url.indexOf('beacon')>=0 || a.url.indexOf('ntv')>=0) continue;
        if (filteredUrls.indexOf(a.url.split('?')[0])>=0) continue;
        if (filteredUrls.filter(e=>isInitiatedBy(e, a)).length){
            filteredUrls.push(a.url);
            continue;
        }
        if (ABPFilterParser.matches(parsedFilterData,a.url, {
            domain: domain
        } )) continue;
        if (!a.initiator || a.initiator.type != "script") continue;
        if (!filterDomains.find(e=>a.url.indexOf(e)>=0)) continue;
        var stack = a.initiator.stack.callFrames,
            src = stack[stack.length - 1].url;
        resInitiated[src] && resInitiated[src].all.push(a.url);
    };
    var allInit = Object.values(resInitiated).reduce((acc, cur)=>{return cur.all.length + acc;},0),
        filInit = Object.values(resInitiated).reduce((acc, cur)=>{return cur.filtered.length + acc;},0);
    console.log(resInitiated)
    console.log(allInit, filInit);
}

var total = 0;
var _combineCoverage = function(cvgArr){
    // for (const entry of jsCoverage) {

    //     if (entry.url.indexOf('.js') > 0) {
    //         fileUrls.push(entry.url);
    //         totalBytes += entry.text.length;
    //         let singleUsedBytes = 0
    //         for (const range of entry.ranges) {
    //             usedBytes += range.end - range.start - 1;
    //             singleUsedBytes += range.end - range.start - 1;
    //         }
    //     }
    // }
    var urlToRanges = []// for the same URL across multiple runs store the list of ranges
    var sameRange = function(r1, r2){
        if (!r1 || !r2) return false;
        return r1.start == r2.start && r1.end == r2.end;
    }
    cvgArr.forEach((coverage)=>{
        for (var entry of coverage){
            if (entry.url.indexOf('.js')>0){
                if (!(entry.url in urlToRanges)){
                    urlToRanges[entry.url] = entry.ranges;
                    total += entry.text.length;
                    continue;
                }
                for (var range of entry.ranges){
                    if (!urlToRanges[entry.url].find(e=>sameRange(range,e)))
                        urlToRanges[entry.url].push(range)
                }
                // if (cvgArr.length == 1)
                //     total += entry.text.length;
            }
        }
    });
    var totalBytes = 0;
    Object.keys(urlToRanges).forEach((url)=>{
        for (var range of urlToRanges[url]){
            totalBytes += range.end - range.start - 1;
        }
    })
    return totalBytes;
}

var combineCoverage = function(first, second){
    first = parse(first);
    second = parse(second);
    var f = _combineCoverage([first]);
    var union = _combineCoverage([first, second]);
    console.log(f, union, total)
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
    case 'error' : getNetErrors(parse(program.input)); break;
    case 'matchNet' : matchNetwork(program.input,program.anotherin); break;
    case 'initiator': initiatedRequests(program.input, program.anotherin); break;
    case 'coverage' : combineCoverage(program.input, program.anotherin); break;

}