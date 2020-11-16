/**
 * This module is used to detect whether 
 * a page is broken by simply looking at the network log
 */

 var program = require('commander'),
    fs = require('fs'),
    netParser = require('parser/networkParser');

program
    .option('-n, --network [network]','path to the network file')
    .option('-l, --log [log]', 'path to the log file')
    .parse(process.argv);

var parse = function(f){
    return JSON.parse(fs.readFileSync(f));
}

const VALID_DOMAINS  = ['web.archive.org', 'archive.org','analytics.archive.org'];

var isCriticalReq = function(n){
    var parsedTs = timeStampInURL(n.url);
    if (!parsedTs || (n.url.indexOf(`https://web.archive.org/web/${parsedTs}`)<0))
        return false;
    return true;
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

// returns broken urls with reason
var _checkBrokenNet = function(n){
    /**
     * Only checking the MIME types (js/html/image) for the following
     * - returns a 404
     * - empty response
     * - No response ( either blocked or pending?)
     */
    const reasons = {
        'CSP' : 'CSP',
        'NF': ' NOT FOUND',
        'EMPTY' : 'EMPTY'
    };
    const EMPTY_THRESHOLD=500;
    //First check for CSP violation
    var isValidDomain = VALID_DOMAINS.filter(e=> (n.url.indexOf(`http://${e}`)==0 || 
        n.url.indexOf(`https://${e}`)== 0) ).length == 1;
    
    if (!isValidDomain){
        return reasons.CSP
    }

    // Now eliminate non page resources
    if (!isCriticalReq(n)) return false;
    
    if (n.response && Number.parseInt(n.response.status/100)*100 != 200)
        return reasons.NF;
    
    if (n.size < EMPTY_THRESHOLD )
        return reasons.EMPTY;

    return false;
}

var _getQueryParamsLen = function(url){
    return url.split('&').length
}   

var ignoreUrl = function(n, net){
    const VALID_MIMES = ["image", "document", "script", "stylesheet"];
    const INVALID_URL_DOMAINS = ["googletag", "archiveteam", "ping-meta-prd.jwpltx.com","prd.jwpltx.com","eproof.drudgereport.com","idsync.rlcdn.com","cdn.filestackcontent.com","connect.facebook.net","e.cdnwidget.com","nr-events.taboola.com","pixel.quantserve.com","pixel.wp.com","res.akamaized.net","sync.adkernel.com","certify.alexametrics.com","pixel.adsafeprotected.com","px.ads.linkedin.com","s.w-x.co","bat.bing.com","beacon.krxd.net","googleads.g.doubleclick.net","metrics.brightcove.com","ping.chartbeat.net","www.google-analytics.com","trc-events.taboola.com","px.moatads.com","www.facebook.com","sb.scorecardresearch.com","nexus.ensighten.com","odb.outbrain.com"];
    const QUERY_PARAMS_LIMIT = 10;
    var type = n.type;
    return n.request.method != "GET"
        || n.frameId != net[0].frameId
        || !VALID_MIMES.filter(e=>type.toLowerCase() == e).length
        || INVALID_URL_DOMAINS.filter(e=>n.url.indexOf(e)>=0).length
        ||  n.url.indexOf('data') == 0
        || _getQueryParamsLen(n.url) > QUERY_PARAMS_LIMIT;
        
}

var checkBrokenNet = function(data){
    var net = netParser.parseNetworkLogs(parse(data));
    var bCount = 0;
    for (var n of net){
        if (ignoreUrl(n, net))
            continue;
        var isBroken = _checkBrokenNet(n);
        if (isBroken){
            bCount++;
            // console.log(n.url, isBroken, n.request.method, n.type);
        }
    }
    console.log(bCount);
}

checkBrokenNet(program.network)


