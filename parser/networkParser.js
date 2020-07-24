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
                    netObject.redirectResponse = payLoad.redirectResponse;
                    if (!netObject.redirectResponse.headers.location)
                        netObject.redirectResponse.headers.location = netObject.redirectResponse.headers.Location
                    netObject.redirectStart_o = payLoad.timestamp;
                    netObject.requestStart = payLoad.redirectResponse.timing.requestTime;
                    netObject.requestCS = payLoad.redirectResponse.timing.sslEnd == -1 ? 0 : payLoad.redirectResponse.timing.sslEnd/1000
                    netObject.requestFetch = netObject.requestStart + payLoad.redirectResponse.timing.sendStart/1000;


                    // netObject.fetchRedirectStart = netObject.redirectStartTime + payLoad.redirectResponse.timing.sendStart/1000
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
                netObject.ttfb = payLoad.timestamp;
                if (netObject.redirectResponse){
                    netObject.redirectStart = payLoad.response.timing.requestTime;
                    netObject.redirectCS = payLoad.response.timing.sslEnd == -1 ? 0 : payLoad.response.timing.sslEnd/1000
                    netObject.redirectFetch = netObject.redirectStart + payLoad.response.timing.sendStart/1000;
                } else {
                    netObject.requestStart = payLoad.response.timing.requestTime;
                    netObject.requestCS = payLoad.response.timing.sslEnd == -1 ? 0 : payLoad.response.timing.sslEnd/1000
                    netObject.requestFetch = netObject.requestStart + payLoad.response.timing.sendStart/1000;
                }
                // netObject.fetchStart = netObject.startTime + payLoad.response.timing.sendStart/1000
                netObject.protocol = payLoad.response.protocol;
                netObject.response = payLoad.response;
                break;
            case 'Network.dataReceived':
                if (!(requestId in requestIdToObject))
                    continue;
                var netObject = requestIdToObject[requestId];
                netObject.endTime = payLoad.timestamp;
                break;
            // case 'Network.loadingFinished':
            //     if (!(requestId in requestIdToObject))
            //         continue;
            //     var netObject = requestIdToObject[requestId];
            //     netObject.endTime = payLoad.timestamp;
        }

    }

    var sortedNetworkEntries = Object.entries(requestIdToObject).map(e=>e[1]).sort((a,b)=>{return a.startTime - b.startTime});
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
    this.url = isRequest ? data.request.url : data.response.url
    this.redirectResponse = data.redirectResponse;
}

module.exports = {
    parseNetworkLogs: parseNetworkLogs
}