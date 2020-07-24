/*
Crawls wayback machine
*/

const http = require('http'),
    program = require('commander'),
    {spawnSync} = require('child_process'),
    {spawn} = require('child_process'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    fs = require('fs');


program
    .option("-u, --url [url]","url of the site to crawl")
    .option("-o, --output [output]", "output directory to store data")
    .option("-d, --debug",'verbose logging')
    .option("-s, --skip","skip the cdx server inquiry")
    .option("-m , --mahimahi [mahimahi]", "record or replay sites")
    .option("-p, --path [value]","Path to be recorded or replayed")
    .option("-c, --chrome-flags [value]","Flags to be passed to the inspectChrome script")
    .parse(process.argv)


const WAYBACK_CDX="http://web.archive.org/cdx/search/cdx",
    CHROME_LOADER="/home/goelayu/research/webArchive/scripts/inspectChrome.js",
    mmwebreplay="/home/goelayu/research/hotOS/Mahimahi/buildDir/bin/mm-webreplay",
    mmwebrecord="/home/goelayu/research/hotOS/Mahimahi/buildDir/bin/mm-webrecord";
/*
wayback api response format: [["urlkey","timestamp","original","mimetype","statuscode","digest","length"]
*/

WAYBACK_SERVER_RTT=190
 
var parseFlags = function(f){
    var validFlags = "";
    f.split(' ').forEach((_f)=>{
        validFlags += ` --${_f}`;
    })
    return validFlags;
}
 

var sanitizeUrl = function(url){
    var surl = url.split('www')[1];
    return `www${surl}`;
}

var getRSPID = function(){
    var pidCMD = "ps aux | grep 'blaze replay' | grep -v 'grep' | head -n 1 | awk '{print $2}'";
    var _pid = spawnSync(pidCMD, {shell:true}).stdout.toString();
    // console.log(_pid.stderr.toString())
    console.log('pid is ',_pid)
    var pid = _pid.trim();
    return pid ? pid : 0;
}

var replayServerCleanup = function(serverProc){
    console.log('Cleaning up', serverProc.pid)
    spawnSync('sudo pkill dnsmasq',{shell:true});
    spawnSync('sudo pkill nginx',{shell:true});
    // var replayServerPID = Number.parseInt(fs.readFileSync(process.env.SERVERPID));
    spawnSync('kill',['-SIGINT', getRSPID()]);
    // serverProc.kill('SIGKILL');
}

var loadChrome = async function(url,ts){
    var outputDir = `${program.output}/${sanitizeUrl(program.url)}/${ts}/`,
        port = 9222 + Math.round(Math.random()*9222)
    await mkdirp(outputDir);
    var mahimahiConf = {
        record:mmwebrecord,
        replay:mmwebreplay
    };
    var chromeCMD = '', mahimahipath;
    program.path && (mahimahipath = path.resolve(program.path));
    switch(program.mahimahi){
        case 'record':
            chromeCMD += `${mahimahiConf[program.mahimahi]} ${mahimahipath} `;
            break;
        case 'replay':
            // Start the nginx server separately
            var serverScript="startNgnxServer.sh",
            serverCMD = `bash ${serverScript} ${mahimahipath} ${process.env.SERVERFLAGS}`
            console.log(`Running replay server \n${serverCMD}`);
            var serverProc = spawn(serverCMD,{shell:true});
            // serverProc.stdout.on('data', (data) => {
            //     console.log(`${data}`);
            //   });
              
            //   serverProc.stderr.on('data', (data) => {
            //     console.error(`${data}`);
            //   });

            await new Promise(r => setTimeout(r, 2000));
            // if (serverProc.status !== 0){
            //     console.error(`Replay server failed to start`)
            //     return;
            // }
    }
    // var chromeCMD = program.mahimahi ? `${mahimahiConf[program.mahimahi]} ${program.path} ` : "";
    if (program.mahimahi == "replay"){
        if (!getRSPID()){
            console.log('Replay server failed to start');
            return;
        }
        chromeCMD = `mm-delay ${WAYBACK_SERVER_RTT/2} ` + chromeCMD;
    }

    chromeCMD += `node ${CHROME_LOADER} -u ${url} -l -o ${outputDir} -c -n --log --mode std -p ${port} -t ` + (program.chromeFlags ? parseFlags(program.chromeFlags) : "")
    console.log(chromeCMD);
    var chromeps = spawnSync(chromeCMD,{shell:true});

    console.log(chromeps.stdout.toString());
    console.error(chromeps.stderr.toString());

    if (program.mahimahi == "replay")
        replayServerCleanup(serverProc);
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


async function crawlWayBack(url){
    var apiEndPoint = `${WAYBACK_CDX}?url=${url}&output=json&limit=1&from=2010`;
    var res = await http.get(apiEndPoint);
    await parseResponse(res);
    // .on('error',(e)=>{
    //     console.error(`Error: Request Failed ${url} -- ${e.message}`);
    // });
}

async function main(){
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


