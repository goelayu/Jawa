/*
Crawls wayback machine
*/

const http = require('https'),
    program = require('commander'),
    {spawnSync} = require('child_process'),
    {spawn} = require('child_process'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    fs = require('fs-extra');


program
    .option("-u, --url [url]","url of the site to crawl")
    .option("-o, --output [output]", "output directory to store data")
    .option("-d, --debug",'verbose logging')
    .option("-s, --skip","skip the cdx server inquiry")
    .option("-m , --mahimahi [mahimahi]", "record or replay sites")
    .option("-p, --path [value]","Path to be recorded or replayed")
    .option("-c, --chrome-flags [value]","Flags to be passed to the inspectChrome script")
    .option("-v, --verbose", 'enable verbose logging')
    .option('--pac-url [value]', 'path to the pac url file')
    .parse(process.argv)


const WAYBACK_CDX="https://web.archive.org/cdx/search/cdx",
    CHROME_LOADER="/home/goelayu/research/webArchive/scripts/chrome-launcher.js",
    CHROME_LOADER_OLD="/home/goelayu/research/webArchive/scripts/inspectChrome.js"
    mmwebreplay="mm-webreplay",
    mmwebrecord="mm-webrecord",
    // mmwebreplay="/home/goelayu/research/mahimahi/build/bin/mm-webreplay",
    // mmwebrecord="/home/goelayu/research/mahimahi/build/bin/mm-webrecord";
/*
wayback api response format: [["urlkey","timestamp","original","mimetype","statuscode","digest","length"]
*/

WAYBACK_SERVER_RTT=80
 
var parseFlags = function(f){
    var validFlags = "";
    f.split(' ').forEach((_f)=>{
        validFlags += ` --${_f}`;
    })
    return validFlags;
}
 

var sanitizeUrlToDir = function(url){
    if (url[url.length - 1] == "/")
        url = url.slice(0,-1);
    return url.replace(/https?:\/\//,'').replace(/\//g,'_').replace(/\&/g,'-');
    // var surl = url.split('www')[1].replace('/','_');
    // return `www${surl}`;
}

var getRSPID = function(path, grp){
    var pidCMD = `ps aux | grep '${grp}' | grep -v 'grep' | head -n 1 | awk '{print $2}'`;
    var _pid = spawnSync(pidCMD, {shell:true}).stdout.toString();
    if (!_pid) return 0;
    // console.log(_pid.stderr.toString())
    console.log('pid is ',_pid)
    var pid = _pid.trim();
    return pid ? pid : 0;
}

var replayServerCleanup = async function(serverProc, procPath){
    // console.log('Cleaning up', serverProc.pid)
    // spawnSync('sudo pkill dnsmasq',{shell:true});
    // spawnSync('sudo pkill nginx',{shell:true});
    var _p  = getRSPID(procPath, 'blaze replay');
    if (!_p) {
        serverProc.kill('SIGKILL');
        return;
    }
    // var replayServerPID = Number.parseInt(fs.readFileSync(process.env.SERVERPID));
    spawnSync('sudo',['kill','-SIGINT', _p]);
    await new Promise(r => setTimeout(r, 2000));
    _p  = getRSPID(procPath, 'blaze replay');
    if (_p){
        spawnSync('sudo',['kill','-SIGKILL', _p]);
    }
    serverProc.kill('SIGKILL');
}


var loadChrome = async function(wUrl,ts, url){
    var sn = sanitizeUrlToDir;
    var mahimahiConf = {
        record:mmwebrecord,
        replay:mmwebreplay
    }, chromeCMD = '';
    var mahimahipath, replayServer,
    port = 9222 + Math.round(Math.random()*9222);
    var pathSuffix = `${sn(url)}/${ts}/`;
    var outputDir = `${program.output}/${pathSuffix}`;
    // fs.ensureDirSync(outputDir,{recursive:true});
    switch(program.mahimahi){
        case 'record':
            var pathSuffix = `${program.url}/${sn(url)}/${ts}/`;
            var outputDir = `${program.output}/${pathSuffix}`;
            console.log('making directory', outputDir)
            fs.ensureDirSync(outputDir,{recursive:true});
            program.path && (mahimahipath = `${path.resolve(program.path)}/${pathSuffix}`);
            fs.ensureDirSync(`${path.resolve(program.path)}/${program.url}/${sn(url)}`);
            chromeCMD += `${mahimahiConf[program.mahimahi]} ${mahimahipath} `;
            break;
        case 'replay':
            var outputDir = `${program.output}/${sanitizeUrlToDir(url)}/${ts}/`
            var mahimahipath = `${program.path}/${sn(url)}//`
            console.log('making directory', outputDir)
            fs.ensureDirSync(outputDir,{recursive:true});
            // Start the nginx server separately
            replayServer = process.env.REPLAYSERVER;
            if (replayServer == 'nginx') {
                var serverScript="startNgnxServer.sh",
                serverCMD = `sudo bash ${serverScript} ${mahimahipath} ${process.env.SERVERFLAGS}`
                console.log(`Running replay server \n${serverCMD}`);
                var serverProc = spawn(serverCMD,{shell:true});
                if (program.verbose){
                    serverProc.stdout.on('data', (data) => {
                        console.log(`${data}`);
                    });
                    
                    serverProc.stderr.on('data', (data) => {
                        console.error(`${data}`);
                    });
                }

                await new Promise(r => setTimeout(r, 4000));
            } else 
                chromeCMD += `${mahimahiConf[program.mahimahi]} ${mahimahipath} `;
    }
    // var chromeCMD = program.mahimahi ? `${mahimahiConf[program.mahimahi]} ${program.path} ` : "";
    if (program.mahimahi == "replay"){
        if (replayServer == 'nginx' && !getRSPID(mahimahipath, 'nginx')){
            console.log('Replay server failed to start');
            await replayServerCleanup(serverProc, mahimahipath);
            spawnSync('sudo pkill dnsmasq',{shell:true});
            return;
        }
        chromeCMD = `mm-delay ${WAYBACK_SERVER_RTT/2} ` + chromeCMD;
    }

    // chromeCMD += `node ${CHROME_LOADER_OLD} -u ${wUrl} -l -o ${outputDir} -n --log --mode std -p ${port} --chrome-conf ../chromeConfigs/debug ` + (program.chromeFlags ? parseFlags(program.chromeFlags) : "")
    chromeCMD += `node ${CHROME_LOADER} -u '${wUrl}' -l -o '${outputDir}' -n --timeout 200000 --screenshot`;
    console.log(chromeCMD);
    var chromeps = spawnSync(chromeCMD,{shell:true});

    console.log(chromeps.stdout.toString());
    console.log(chromeps.stderr.toString());

    if (program.mahimahi == "replay" && replayServer == 'nginx')
        await replayServerCleanup(serverProc, mahimahipath);
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
        var finalRes = procRes.sort((a,b)=>{return a[1] - b[1]}).slice(0,500);
        console.log(procRes.length);
        // return;
        for (var entry of finalRes){
            if (!Number.isInteger(Number.parseInt(entry[1])))
                continue;
            console.log(entry[2]);
            // console.log(entry[1],entry[2]);
            // continue;
            var ts = entry[1], url = entry[2];
            var waybackurl = `https://web.archive.org/web/${ts}/${url}`;
            // console.log(waybackurl)
            await loadChrome(waybackurl, ts, url);
        }
    })
}


async function crawlWayBack(url){
    var apiEndPoint = `${WAYBACK_CDX}?url=${url}&from=202011&to=202011&output=json&matchType=prefix&filter=mimetype:text/html&filter=statuscode:200`;
    console.log(apiEndPoint);
    http.get(apiEndPoint, parseResponse);
    // await parseResponse(res);
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
        var delim = program.url.indexOf('https')>=0 ? '/https://' : '/http://'
        var [ts,_url] = program.url.split(delim);
        console.log(ts,_url)
        // program.url = `http${_url}`;
        loadChrome(wayBackUrl,ts, _url)
    }
};

main();

