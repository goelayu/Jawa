/**
 * New chrome launcher based on puppeeteer instead
 * of CDP (as used inside chrome-remote-interface)
 */

 const puppeteer = require('puppeteer'),
    program = require('commander'),
    fs = require('fs'),
    chromeFns = require('./chrome-ctx-scripts/fns');
    // AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
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
    .option('--testing', 'debug mode')
    .option('-c, --custom [value]','fetch custom data')
    .option('--mhtml', 'capture the mhtml version of the page')
    .option('--memory','get the total memory footprint of the JS heap')
    .option('--coverage', 'get the js coverage information')
    .option('--load-iter [value]', 'page loading iteration count')
    .option('--chrome-dir [value]', 'path to the chrome user directory, only useful if loadIter is present')
    .option('--wait', 'waits before exiting chrome')
    .parse(process.argv);

const SERIALIZESTYLES=`${__dirname}/chrome-ctx-scripts/serializeWithStyle.js`
const DISTILLDOM=`${__dirname}/../dom-distill/lib/domdistiller.js`
const HANDLERS=`${__dirname}/chrome-ctx-scripts/fetch-listeners.js`

async function launch(){
    const options = {
        executablePath: "/usr/bin/google-chrome-stable",
        headless: program.testing ? false : true,
        defaultViewport: null,
        args : [ '--ignore-certificate-errors'/*, '--blink-settings=scriptEnabled=false'*/, '--auto-open-devtools-for-tabs', '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process,CrossSiteDocumentBlockingAlways,CrossSiteDocumentBlockingIfIsolating'],
        // '--no-first-run'],
        // ignoreDefaultArgs: true,
    }
    
    var outDir = program.output;

    if (program.loadIter){
        options.userDataDir = program.chromeDir;
    }
    // puppeteer.use(AdblockerPlugin({blockTrackers: true}))
    const browser = await puppeteer.launch(options);
    let page = await browser.newPage();
    var nLogs = [], cLogs = [], jProfile;
    var cdp = await page.target().createCDPSession();

    if (program.loadIter){
        console.log(`Part of a series of page loads`)
        var count = program.loadIter, agent = 'desktop';
        if (count == 0 || count == 1)
            agent = 'desktop'
        await emulateUserAgent(page, agent);
    }

    // console.log(`User agent is: ${await browser.userAgent()}`);
    await initCDP(cdp);
    if (program.network){
        initNetHandlers(cdp, nLogs)
    }
    if (program.logs){
        initConsoleHandlers(cdp, cLogs);
    }

    if (program.jsProfile){
        await cdp.send('Profiler.start');
    }

    if (program.coverage)
        await page.coverage.startJSCoverage();

    //Set global timeout to force kill the browser
    var gTimeoutValue = program.testing ? Number.parseInt(program.timeout)*100 : Number.parseInt(program.timeout) + 20000;
    console.log('global time out value', gTimeoutValue, program.timeout);
    var globalTimer = globalTimeout(browser, cdp, gTimeoutValue);
    await page.goto(program.url,{
        timeout: program.timeout,
    }).catch(err => {
        console.log('Timer fired before page could be loaded', err)
        clearTimeout(globalTimer);
        return;
    })

    console.log('Site loaded');

    if (program.coverage){
        await getCoverage(page, 'preload');
    //     await page.coverage.startJSCoverage();
    //     await extractHandlers(page,cdp); 
    //     await getCoverage(page, 'postLoad', true);
    }

    if (program.wait){
        //turn on logging
        // await page.evaluateHandle(()=> window.__tracer.setTracingMode(true));
        // await page.evaluateHandle(()=> window.__tracer.setCaptureMode('postload'));
        // await sleep(5000)
    }


    // await autoScroll(page);

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

    // await extractPLT(page);
    if (program.screenshot)
        await page.screenshot({path: `${outDir}/screenshot.png`, fullPage: true});

    if (program.custom){
        let cstmEntries =  program.custom.split(',');
        for (var c of cstmEntries){
            switch (c) {
                 case 'Handlers': await extractHandlers(page,cdp,50); break;
                 case 'DOM' : await extractDOM(page); break; 
                 case 'Distill' : await distillDOM(page); break;
                 case 'CG' : await chromeFns.getAllFns(page, program); break; 
                 case 'dynAPI': await getDynCount(page); break;
            }
        }
    }
        // await extractDOM(page);
    
    if (program.mhtml)
        await getMhtml(cdp);

    if (program.memory)
        await getMemory(page);
    
    if (!program.testing)
        browser.close();

    //delete the timeout and exit script
    if (!program.testing)
        clearTimeout(globalTimer);
}

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 500;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 200);
        });
    });
}

var sleep = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var globalTimeout = function(browser,cdp, timeout){
    return setTimeout(function(){
        console.log('Site navigation did not time out. Force KILL.');
        // cdp.detach();
        browser.close();
    },timeout)
}

var initCDP = async function(cdp){
    await cdp.send('Page.enable');
    await cdp.send('Network.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Profiler.enable');
}

var emulateUserAgent = async function(page, agent){
    /**
     * If agent value not provided, randomly chooses an agent from the list; 
     */
    var devices = puppeteer.devices;
    if (!agent){
        var deviceNames = Object.keys(devices);
        // deviceNames.push('desktop');
        agent = deviceNames[Math.floor(Math.random() * deviceNames.length)];
    }
    console.log('found agent', agent)
    if (agent == 'desktop'){
        await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36");
        return
    }
    
    var agentSettings = devices[agent];
    await page.emulate(agentSettings);
}

var getCoverage = async function(page, f, extractFileNames){
    var jsCoverage = await page.coverage.stopJSCoverage();
    let totalBytes = 0;
    let usedBytes = 0;
    let fileUrls = [];
    dump(jsCoverage, `${program.output}/coverage`);
    return;
    for (const entry of jsCoverage) {

        if (entry.url.indexOf('.js') > 0) {
            fileUrls.push(entry.url);
            totalBytes += entry.text.length;
            let singleUsedBytes = 0
            for (const range of entry.ranges) {
                usedBytes += range.end - range.start - 1;
                singleUsedBytes += range.end - range.start - 1;
            }
        }
    }
    extractFileNames && dump(fileUrls, `${program.output}/coverage_files`);
    dump({used:usedBytes, total: totalBytes},`${program.output}/coverage_${f}`);
}

var getMemory = async function(page){
    var _mem = await page.evaluateHandle(() => performance.memory.usedJSHeapSize);
    var mem = await _mem.jsonValue();
    dump(mem, `${program.output}/memory`)
}

var getDynCount = async function(page){
    var _dyn = await page.evaluateHandle(() => window.__getDynAPI());
    var dyn = await _dyn.jsonValue();
    dump(dyn, `${program.output}/dynAPI`)
}

var getMhtml = async function(cdp){
    var { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
    dump(data, `${program.output}/mhtml`);
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

var distillDOM = async function(page){
    var distillCode = fs.readFileSync(DISTILLDOM,'utf-8');
    var runCmd=`var __distill_res__ = org.chromium.distiller.DomDistiller.apply();`
    var evalDC = await page.evaluateHandle((s) => eval(s), distillCode + runCmd);
    var _dcResFull = await page.evaluateHandle(()=> org.chromium.distiller.DomDistiller.apply())
    var _dcResTrim = await page.evaluateHandle((s) => window.finalResult = {2:s[2], 10:s[10]},_dcResFull);
    var dcRes = await _dcResTrim.jsonValue();
    dump(dcRes, `${program.output}/distill_dom`);
}

var extractHandlers = async function(page,cdp, nTimes){
    //eval the handler script
    console.log('extracting handlers')
    var handlerCode = fs.readFileSync(HANDLERS, 'utf-8');
    await cdp.send('Runtime.evaluate',{expression:handlerCode, includeCommandLineAPI:true})
    var _handlers = await page.evaluateHandle(()=> archive_listeners);
    var handlers = await _handlers.jsonValue();
    var _fhandlers = await page.evaluateHandle(()=> _final_elems.map(e=>e[0].nodeName));
    var fhandlers = await _fhandlers.jsonValue();
    dump(handlers, `${program.output}/handlers`);
    dump(fhandlers, `${program.output}/handlersFinal`);
    //extract event handler call graph
    if (!nTimes) nTimes = 1;
    for (var i = 0;i<nTimes;i++){
        //trigger event handlers
        await page.evaluateHandle(()=> triggerEvents(_final_elems))
        await chromeFns.getCallGraph(page, program, i);
    } 
}

var extractDOM = async function(page){
    var inlineStyles = fs.readFileSync(SERIALIZESTYLES, 'utf-8');
    var evalStyles = await page.evaluateHandle((s) => eval(s),inlineStyles);
    var domHandler = await page.evaluateHandle(() => document.documentElement.serializeWithStyles());
    var domString = await domHandler.jsonValue();
    dump(domString, `${program.output}/DOM`);
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