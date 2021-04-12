
const program = require('commander'),
    moment = require('moment'),
    http = require('https'),
    util = require('util');

const WAYBACK_CDX="https://web.archive.org/cdx/search/cdx",
    CC_API="https://web.archive.org/__wb/calendarcaptures/2",
    TIMEFORMAT='YYYYMMDDhhmmss';

program
    .option('-u, --url [url]','url to be queried')
    .option('--dur [value]','time gap between url snapshots')
    .parse(process.argv);


var timeSince = function(cur, prev, dur){
    if (!prev) return true;
    var curTime = moment(Number.parseInt(cur), TIMEFORMAT),
        prevTime = moment(Number.parseInt(prev), TIMEFORMAT);

    return curTime.diff(prevTime,'hours') > dur;
}

var collapseUrls = function(data, dur){
    var finUrls = [],
        lastSeen = {};// last seen for every url
    for (var entry of data){
        var ts = entry[1], url = entry[2];
        if (!Number.isInteger(Number.parseInt(ts)))
            continue;
        
        var ls = lastSeen[url];
        var validUrl = timeSince(ts, ls, dur);
        if (validUrl){
            finUrls.push([ts,url]);
            lastSeen[url]= ts;
        }
    }

    // console.log(data.length, finUrls.length)
    process.stdout.write(util.format(finUrls.length + ' '));
    console.log(JSON.stringify(finUrls));

}

var parseResponse = async function(res){
    // console.log(res);
    var {statusCode} = res;
    if (statusCode != 200){
        console.error(`Error: Request returned status code ${statusCode}`);
        return;
    }

    var rawData = '';
    res.on('data',(chunk)=>{rawData+=chunk});
    res.on('end',async ()=>{
        var procRes = JSON.parse(rawData);
        program.debug && console.log(`Data retrieved: ${procRes} `)
        process.stdout.write(util.format(program.url + ' ' + procRes.length + ' '));
        collapseUrls(procRes,);
        console.log('');
    })
}


function crawlWayBack(url){
    var apiEndPoint = `${WAYBACK_CDX}?url=${url}&${process.env.QUERY}`
    // var apiEndPoint = `${WAYBACK_CDX}?url=${url}&${process.env.QUERY}`;
     console.log(apiEndPoint);
    http.get(apiEndPoint, parseResponse);
    // await parseResponse(res);
    // .on('error',(e)=>{
    //     console.error(`Error: Request Failed ${url} -- ${e.message}`);
    // });
}

crawlWayBack(program.url)
