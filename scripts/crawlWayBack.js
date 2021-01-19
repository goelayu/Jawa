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
    .option('--chrome-cli [value]','flags to pass to chrome via cli')
    .parse(process.argv)


const WAYBACK_CDX="https://web.archive.org/cdx/search/cdx",
    CC_API="https://web.archive.org/__wb/calendarcaptures/2"
    CHROME_LOADER="/home/goelayu/research/webArchive/scripts/inspectChrome.js",
    // mmwebreplay="mm-webreplay",
    // mmwebrecord="mm-webrecord",
    mmwebreplay="/home/goelayu/research/mahimahi/build/bin/mm-webreplay",
    mmwebrecord="/home/goelayu/research/mahimahi/build/bin/mm-webrecord";
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
    return url.replace(/https?:\/\//,'').replace(/\//g,'_')
    // var surl = url.split('www')[1].replace('/','_');
    // return `www${surl}`;
}

var getRSPID = function(path, grp){
    var pidCMD = `ps aux | grep '${grp}' | grep -v 'grep' | head -n 1 | awk '{print $2}'`;
    var _pid = spawnSync(pidCMD, {shell:true}).stdout.toString();
    if (!_pid) return 0;
    // console.log(_pid.stderr.toString())
    // console.log('pid is ',_pid)
    var pid = _pid.trim();
    return pid ? pid : 0;
}

var replayServerCleanup = async function(serverProc, procPath){
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
    var pathSuffix = `${sn(url)}/`;
    var outputDir = `${program.output}/${pathSuffix}`;
    fs.ensureDirSync(outputDir,{recursive:true});
    switch(program.mahimahi){
        case 'record':
            var pathSuffix = `${sn(url)}//`;
            var outputDir = `${program.output}/${pathSuffix}`;
            console.log('making directory', outputDir)
            fs.ensureDirSync(outputDir,{recursive:true});
            program.path && (mahimahipath = `${path.resolve(program.path)}/${pathSuffix}`);
            fs.ensureDirSync(`${path.resolve(program.path)}/`);
            chromeCMD += `${mahimahiConf[program.mahimahi]} ${mahimahipath} `;
            break;
        case 'replay':
            var outputDir = `${program.output}/${sanitizeUrlToDir(url)}/`
            var mahimahipath = `${program.path}/${sn(url)}//`
            console.log('making directory', outputDir)
            fs.ensureDirSync(outputDir,{recursive:true});
            // Start the nginx server separately
            replayServer = process.env.REPLAYSERVER;
            if (replayServer == 'nginx') {
                var serverScript="startChrome.sh",
                serverCMD = `/home/goelayu/research/mahimahi/build/bin/mm-noop bash ${serverScript} \
                ${wUrl} ${outputDir} ${mahimahipath} ${process.env.SERVERFLAGS}`
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
                while (true){
                    // check if blaze replay is still running? 
                    var pid = getRSPID(null, 'blaze replay');
                    if (!pid) {
                        console.log('blaze exited, killing process')
                        process.exit();
                    } else{
                        await new Promise(r => setTimeout(r, 2000));
                    }
                }
            } else {
                chromeCMD += `${mahimahiConf[program.mahimahi]} ${mahimahipath} `;
            }
    }
    // var chromeCMD = program.mahimahi ? `${mahimahiConf[program.mahimahi]} ${program.path} ` : "";
    if (program.mahimahi == "replay"){
        chromeCMD = `mm-delay ${WAYBACK_SERVER_RTT/2} ` + chromeCMD;
    }

    // chromeCMD += `node ${CHROME_LOADER} -u ${wUrl} -l -o ${outputDir} -n --log --mode std -p ${port} --chrome-conf chromeConfigs/${program.chromeCli} ` 
    //     + (program.chromeFlags ? parseFlags(program.chromeFlags) : "")
    chromeCMD += `node chrome-launcher.js -u ${wUrl} -l -o ${outputDir} -j -n --timeout 200000 --screenshot ${(program.chromeFlags ? parseFlags(program.chromeFlags) : "")}`;
    console.log(chromeCMD);
    var chromeps = spawnSync(chromeCMD,{shell:true});

    console.log(chromeps.stdout.toString());
    console.error(chromeps.stderr.toString());
}

var randomizer = function(arr, n){
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len){
        return arr;
        // throw new RangeError("getRandom: more elements taken than available");
    }
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

var fillTS = function(ts, len){
    var ts = ''+ts;
    return '0'.repeat(len - ts.length) + ts;
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
        var procRes_ok = procRes.items.filter(e=>e[1]==200);
        var nEntries = randomizer(procRes_ok, 1);
        for (var entry of nEntries){
            // if (!Number.isInteger(Number.parseInt(entry[1])))
            //     continue;
            var ts = `202011${fillTS(entry[0], 8)}`
            // var ts = (''+entry[0]).length == 9 ? `0${entry[0]}` : entry[0];
            var waybackurl = `https://web.archive.org/web/${ts}/${program.url}`;
            console.log(`Timestamp is ${ts}`);
            // continue;
            // var ts = entry[1], url = entry[2];
            // console.log(ts, url);
            // continue;
            // var waybackurl = `https://web.archive.org/web/${ts}/${url}`;
            await loadChrome(waybackurl, ts, program.url);
        }
    })
}


async function crawlWayBack(url){
    var apiEndPoint = `${CC_API}?url=${url}&${process.env.QUERY}`
    // var apiEndPoint = `${WAYBACK_CDX}?url=${url}&${process.env.QUERY}`;
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
        var ts = program.url.split('/')[4], 
            _url = program.url.split('/')[5]
        console.log(ts,_url)
        loadChrome(program.url,ts, _url)
    }
};

main();


