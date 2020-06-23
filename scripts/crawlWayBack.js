/*
Crawls wayback machine
*/

const http = require('http'),
    program = require('commander'),
    {spawnSync} = require('child_process'),
    mkdirp = require('mkdirp');


program
    .option("-u, --url [url]","url of the site to crawl")
    .option("-o, --output [output]", "output directory to store data")
    .option("-d, --debug",'verbose logging')
    .option("-s, --skip","skip the cdx server inquiry")
    .option("-m , --mahimahi [mahimahi]", "record or replay sites")
    .option("-p, --path [path]","Path to be recorded or replayed")
    .parse(process.argv)


const WAYBACK_CDX="http://web.archive.org/cdx/search/cdx",
    CHROME_LOADER="/home/goelayu/research/webArchive/scripts/inspectChrome.js",
    mmwebreplay="/home/goelayu/research/hotOS/Mahimahi/buildDir/bin/mm-webreplay",
    mmwebrecord="/home/goelayu/research/hotOS/Mahimahi/buildDir/bin/mm-webrecord";
/*
wayback api response format: [["urlkey","timestamp","original","mimetype","statuscode","digest","length"]
*/

WAYBACK_SERVER_RTT=190
 

var sanitizeUrl = function(url){
    var surl = url.split('www')[1];
    return `www${surl}`;
}

var loadChrome = function(url,ts){
    var outputDir = `${program.output}/${sanitizeUrl(program.url)}/${ts}/`,
        port = 9222 + Math.round(Math.random()*9222)
    mkdirp.sync(outputDir);
    var mahimahiConf = {
        record:mmwebrecord,
        replay:mmwebreplay
    };
    var chromeCMD = program.mahimahi ? `${mahimahiConf[program.mahimahi]} ${program.path} ` : "";
    if (program.mahimahi == "replay"){
        chromeCMD = `mm-delay ${WAYBACK_SERVER_RTT/2} ` + chromeCMD;
    }

    chromeCMD += `node ${CHROME_LOADER} -u ${url} -l -o ${outputDir} -c -n --log --mode std -p ${port} -t`
    console.log(chromeCMD);
    var chromeps = spawnSync(chromeCMD,{shell:true});

    console.log(chromeps.stdout.toString());
    console.error(chromeps.stderr.toString());
}

var parseResponse = function(res){
    // console.log(res);
    var {statusCode} = res;
    if (statusCode != 200){
        console.error(`Error: Request returned status code ${statusCode}`);
        return;
    }

    var rawData = '';
    res.on('data',(chunk)=>{rawData+=chunk});
    res.on('end',()=>{
        var procRes = JSON.parse(rawData);
        program.debug && console.log(`Data retrieved: ${procRes} `)
        for (var entry of procRes){
            if (!Number.isInteger(Number.parseInt(entry[1])))
                continue;

            var ts = entry[1];
            var waybackurl = `https://web.archive.org/web/${ts}/${program.url}`;
            loadChrome(waybackurl, ts);
        }
    })
}


function crawlWayBack(url){
    var apiEndPoint = `${WAYBACK_CDX}?url=${url}&output=json&limit=1`;
    http.get(apiEndPoint,
        parseResponse)
    .on('error',(e)=>{
        console.error(`Error: Request Failed ${url} -- ${e.message}`);
    });
}

function main(){
    if (!program.skip)
        crawlWayBack(program.url);
    else {
        /*Directly load the site in chrome*/
        var wayBackUrl = `https://web.archive.org/web/${program.url}`;
        var [ts,_url] = program.url.split('/http');
        program.url = `http${_url}`;
        loadChrome(wayBackUrl,ts)
    }
};

main();


