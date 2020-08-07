/*
Process chrome network logs and outputs
a map of resource to server think time 

- For resources which were redirected, only the second round trip
time is taken into account as the server-think time
*/

const netParser = require('parser/networkParser'),
    fs = require('fs'),
    program = require('commander'),
    util = require('util');

const DIRECT_STT="/home/goelayu/research/webArchive/data/processed/median-seen-ts-time/"


program
    .option('-i, --input [input]','path to the input network file')
    .option('-o, --output [output]', 'path to the output file')
    .option('-d, --data [data]','type of data to be extracted')
    .option('-u, --url [url]','url of the site')
    .parse(process.argv);


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
    var hasNumbers = url.match(/\d+/g);
    if (hasNumbers){
        for (var num of hasNumbers){
            if (num.length == 14)
                return num;
        }
    }
    return false
}

var getDirectTTFB = function(net,url, dType){
    var mainReq = computeMainFileReq(net, url);
    // var medDirect = getMedianDirectST(url);
    var seen = {},
        resLatencyMap = {}
    for (var n of net){
        if (!n.ttfb || !n.requestFetch) continue;

        var tag = n.redirectResponse ? "redirect" : "direct";
        var curTs = timeStampInURL(n.url);

        // if (!curTs) continue;
        
        var ttfb;
        if (n == mainReq && dType == "ttfb_sp"){
            seen[curTs] = true;
            ttfb = (n.ttfb - n.redirectFetch)*1000;
            var dl = (n.endTime - n.ttfb)*2200;
            var delay = 190 + ttfb + dl;
            process.stdout.write(util.format(n.url, delay));
            return
            // ttfb = _ttfb = (n.redirectStart_o - n.requestFetch)*1000;
        }
        var host = n.response.requestHeaders.Host;
        if (!(host in resLatencyMap))
            resLatencyMap[host]={};

        var urlSuffix = n.url.split(host).slice(1,).join("");

        if (tag == "direct") {
            var url = n.url;
            var ttfb,_ttfb;
            if (!curTs || seen[curTs])
                ttfb = _ttfb = (n.ttfb - (n.requestFetch))*1000;
            else {
                // ttfb = medDirect;
                ttfb = (n.ttfb - (n.requestFetch))*1000;
                // ttfb = Math.min(ttfb, _ttfb);
            }
            resLatencyMap[host][urlSuffix]=ttfb;
            console.log(n.url, ttfb);
        } else {
            var ttfb1,_ttfb,ttfb2;
            ttfb1 = (n.redirectStart_o - n.requestFetch)*1000;
            // console.log(n.url, ttfb1);
            // resLatencyMap[host][urlSuffix]= ttfb1;
            var urlRedirect = n.redirectResponse.headers.Location.split(host).slice(1,).join("");
            ttfb2 = (n.ttfb - (n.redirectFetch))*1000;
            console.log(n.url, ttfb2);
            resLatencyMap[host][urlSuffix]= ttfb2;
            // var url = n.url; // The patched mahimahi files have the original url with the response of the redirected content, ie the redirected location is completely removed
        };
        // if (n==mainReq) break;
        // console.log(url, ttfb, _ttfb);
    }
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
    return url.split(host).slice(1,).join("");
}

var getRedirectURLMap = function(net){
    var urlMap = {};
    for (var n of net){
        if (!n.response) continue;
        var rr, rh = removeHost;
        var host = n.response.requestHeaders.Host;
        if (rr = n.redirectResponse){
            urlMap[rh(n.url,host)] = rh(rr.headers.location,host);
            // console.log(rts(rr.url), rts(rr.headers.location))
        }
    }
    fs.writeFileSync(program.output,JSON.stringify(urlMap))
}

var getAllUrls = function(net){
    var allUrls = [];
    var typeDict = { "Document":"document", "Font":"font", "Image":"image","Script":"script","StyleSheet":"style","XHR":"fetch"}
    net.forEach((n,ind)=>{
        if (ind == 0 || !n.type) return;
        // if (!timeStampInURL(n.url)) return;
        var type = n.type;
        if (!(type in typeDict)) return;
        allUrls.push([n.url,typeDict[type]]);
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