/*
Parses the chrome network logs and create a list of
network events with the following attributes 
 - startTime
 - endTime
 - TTFB (time to first byte)
*/

var fs = require('fs')


function parseNetworkv2(netLog){

    var requestIdToObject = {};
    for (var log of netLog){
        var payLoad = Object.values(log)[0];
        if ('Network.requestWillBeSent' in log){

        }
    }

}

var getPreviousReq = function(n){
    if (!n.redirects.length) return n;
    var lastRedirect = n.redirects[n.redirects.length - 1];
    return lastRedirect;
}


function parseNetworkLogs(netLog){

    var requestIdToObject = {};
    for (var log of netLog){
        var payLoad = Object.values(log)[0];
        var requestId = payLoad.requestId;
        var method = Object.keys(log)[0]; //Every log entry only has a single key, which is the log type
        switch (method) {
            case "Network.requestWillBeSent":
                if (requestId in requestIdToObject){
                   /*requestId observed before*/
                   if (!('redirectResponse' in payLoad)){
                    /*Unclear as to how multiple responseIds without redirection*/
                    // console.error('Duplicate request Id', requestId);
                    var dummyStatement = null;
                   } else {
                    /*
                    Is a redirect response
                    */
                    var netObject = requestIdToObject[requestId];
                    var redirect = new Object;
                    redirect.response = payLoad.redirectResponse;
                    if (!redirect.response.headers.location)
                        redirect.response.headers.location = redirect.response.headers.Location
                    redirect.requestStart_o = payLoad.timestamp;
                    redirect.url = redirect.response.headers.location;

                    //update the timing of the previous network request
                    var prevReq = getPreviousReq(netObject);
                    prevReq.responseTime = payLoad.timestamp;
                    prevReq.requestStart = payLoad.redirectResponse.timing.requestTime;
                    prevReq.requestCS = payLoad.redirectResponse.timing.sslEnd == -1 ? 0 : payLoad.redirectResponse.timing.sslEnd/1000
                    prevReq.requestFetch = prevReq.requestStart + payLoad.redirectResponse.timing.sendStart/1000;

                    prevReq.timing = payLoad.redirectResponse.timing;

                    netObject.redirects.push(redirect);
                   }
                   continue;
                }
                var netObject = new NetworkEvent(log);
                requestIdToObject[requestId] = netObject;
                netObject.initiator = payLoad.initiator;
                break;
            case "Network.responseReceived":
                var url = payLoad.response.url;
                if (!url.startsWith("http"))
                    continue;
                var netObject;
                if (!(requestId in requestIdToObject)){
                    netObject = new NetworkEvent(log);
                    requestIdToObject[requestId] = netObject;
                }
                var netObject = requestIdToObject[requestId];
                var timing = payLoad.response.timing;
                var prevReq = getPreviousReq(netObject);
                prevReq.responseTime = payLoad.timestamp;
                prevReq.requestStart = timing.requestTime;
                prevReq.requestCS = timing.sslEnd == -1 ? 0 : timing.sslEnd/1000
                prevReq.requestFetch = prevReq.requestStart + timing.sendStart/1000;  
                prevReq.timing = timing;          
                netObject.protocol = payLoad.response.protocol;
                netObject.response = payLoad.response;
                break;
            case 'Network.dataReceived':
                if (!(requestId in requestIdToObject))
                    continue;
                var netObject = requestIdToObject[requestId];
                netObject.endTime = payLoad.timestamp;
                break;
            case 'Network.loadingFinished':
                if (!(requestId in requestIdToObject))
                    continue;
                var netObject = requestIdToObject[requestId];
                netObject.size = payLoad.encodedDataLength;
        }

    }

    var sortedNetworkEntries = Object.entries(requestIdToObject).map(e=>e[1]).sort((a,b)=>{
        var aStart = a.redirectResponse ? a.redirectFetch : a.requestFetch;
        var bStart = b.redirectResponse ? b.redirectFetch : b.requestFetch;
        return aStart - bStart;
    });
    return sortedNetworkEntries;
}

function NetworkEvent(data){
    var isRequest = data['Network.requestWillBeSent'] ? true : false;
    data = isRequest ? data['Network.requestWillBeSent'] : data['Network.responseReceived']
    this.requestStart_o = isRequest ? data.timestamp : null;
    this.responseEnd = null;
    this.ttfb = 0;
    this.sendStart = 0;
    this.requestId = data.requestId;
    this.protocol = "";
    this.request = isRequest ? data.request : null;
    this.url = isRequest ? data.request.url : data.response.url
    this.redirectResponse = data.redirectResponse;
    this.initiator = isRequest ? data.initiator : null;
    this.documentURL = isRequest ? data.documentURL : null;
    this.redirects = [];
    this.frameId = data.frameId;
    this.type = data.type;
}

module.exports = {
    parseNetworkLogs: parseNetworkLogs
}