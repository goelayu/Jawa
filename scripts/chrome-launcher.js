/**
 * New chrome launcher based on puppeeteer instead
 * of CDP (as used inside chrome-remote-interface)
 */

 const puppeteer = require('puppeteer'),
    program = require('commander'),
    fs = require('fs');
const { createDeflate } = require('zlib');

program
    .option('-o, --output [output]','path to the output directory')
    .option('-l, --logs', 'capture console logs')
    .option('-n, --network', 'capture network logs')
    .option('-j, --js-profile', 'capture jsProfile')
    .option('-u, --url [url]','url of the page')
    .option('--timeout [value]', 'timeout value for page navigation')
    .option('--response-body','capture network response body')
    .option('--screenshot', 'capture screenshot')
    .option('--pac-url [value]', 'path to the proxy pac url file')
    .parse(process.argv);

async function launch(){
    const options = {
        executablePath: "/usr/bin/google-chrome",
        headless: false,
        args : [ '--ignore-certificate-errors']
        // '--no-first-run'],
        // ignoreDefaultArgs: true,
    }
    var outDir = program.output;
    const browser = await puppeteer.launch(options);
    let page = await browser.newPage();
    var nLogs = [], cLogs = [], jProfile;
    var cdp = await page.target().createCDPSession();
    await initCDP(cdp);
    console.log(await browser.userAgent());
    await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36");
    if (program.network){
        initNetHandlers(cdp, nLogs)
    }
    if (program.logs){
        initConsoleHandlers(cdp, cLogs);
    }

    if (program.jsProfile){
        await cdp.send('Profiler.start');
    }

    //Set global timeout to force kill the browser
    var globalTimer = globalTimeout(browser, cdp);
    await page.goto(program.url,{
        timeout: program.timeout,
    }).catch(err => {
        console.log('Timer fired before page could be loaded')
    })

    if (program.network){
        dump(nLogs, `${outDir}/network`);
    }
    if (program.logs){
        dump(cLogs, `${outDir}/logs`);
    }
    if (program.jsProfile){
        var prof = await cdp.send('Profiler.stop');
        dump(prof.profile, `${outDir}/jsProfile`);
    }

    await extractPLT(page);
    if (program.screenshot)
        await page.screenshot({path: `${outDir}/screenshot.png`, fullPage: true});
    browser.close();

    //delete the timeout and exit script
    clearTimeout(globalTimer);
}

var globalTimeout = function(browser,cdp){
    return setTimeout(function(){
        console.log('Site navigation did not time out. Force KILL.');
        // cdp.detach();
        browser.close();
    },220000)
}

var initCDP = async function(cdp){
    await cdp.send('Page.enable');
    await cdp.send('Network.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Profiler.enable');
}

var initNetHandlers = function(cdp, nLogs){
    const network_observe = [
        'Network.requestWillBeSent',
        'Network.requestServedFromCache',
        'Network.dataReceived',
        'Network.responseReceived',
        'Network.resourceChangedPriority',
        'Network.loadingFinished',
        'Network.loadingFailed',
    ];

    network_observe.forEach((method)=>{
        cdp.on(method, params=>{
            nLogs.push({[method]:params})
        })
    })
}

var initConsoleHandlers = function(cdp, cLogs){
    cdp.on('Runtime.exceptionThrown', params=>{
        cLogs.push(params);
    })
}

var extractPLT = async function(page){
    var _runtime = await page.evaluateHandle(() => performance.timing)
    var _startTime = await page.evaluateHandle(timing => timing.navigationStart, _runtime);
    var _endTime = await page.evaluateHandle(timing => timing.loadEventEnd, _runtime);
    var startTime = await _startTime.jsonValue(), 
        endTime = await _endTime.jsonValue();
    dump(endTime - startTime, `${program.output}/plt`);
}

var dump = function(data, file){
    fs.writeFileSync(file, JSON.stringify(data));
}

launch()
    .catch(err =>{
        console.log(`error while launchig ${err}`);
        process.exit();
    });