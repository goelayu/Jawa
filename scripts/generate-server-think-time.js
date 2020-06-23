/*
Process chrome network logs and outputs
a map of resource to server think time 

- For resources which were redirected, only the second round trip
time is taken into account as the server-think time
*/

const netParser = require('parser/networkParser'),
    fs = require('fs'),
    program = require('commander');


program
    .option('-i, --input [input]','path to the input network file')
    .option('-o, --output [output]', 'path to the output file')
    .option('-d, --data [data]','type of data to be extracted')
    .parse(process.argv);



var getDirectTTFB = function(net){
    for (var n of net){
        if (!n.ttfb || !n.requestFetch) continue;

        var tag = n.redirectResponse ? "redirect" : "direct";
        
        if (tag == "direct") {
            var url = n.url;
            var ttfb = (n.ttfb - (n.requestFetch))*1000; //requestFetch gets rid of both stalling and connection setup, we still need to mimic the cs part
        } else {
            var ttfb = (n.ttfb - (n.redirectFetch) )*1000;
            // var url = n.redirectResponse.headers.Location;
            var url = n.url; // The patched mahimahi files have the original url with the response of the redirected content, ie the redirected location is completely removed
        };
        console.log(url, ttfb, n.response.status);
    }
}

var removeTrailingSlash = function(url){
    var l = url.length;
    if (url[l-1] == "/")
        return url.substr(0,l-1).replace("https://web.archive.org","");
    else return url.replace("https://web.archive.org","");
}

var getRedirectURLMap = function(net){
    var urlMap = {};
    for (var n of net){
        var rr, rts = removeTrailingSlash;
        if (rr = n.redirectResponse){
            urlMap[rts(rr.url)] = rts(rr.headers.location);
            // console.log(rts(rr.url), rts(rr.headers.location));
            fs.writeFileSync(program.output,JSON.stringify(urlMap))
        }
    }
}

function main(){
    var netLog = JSON.parse(fs.readFileSync(program.input),"utf-8"),
         processNetLogs = netParser.parseNetworkLogs(netLog);

    // getDirectTTFB(processNetLogs);
    if (program.data == "ttfb")
        getDirectTTFB(processNetLogs);
    else getRedirectURLMap(processNetLogs);
}

main();