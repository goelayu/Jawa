/**
 * New chrome launcher based on puppeeteer instead
 * of CDP (as used inside chrome-remote-interface)
 */

 var puppeteerOg = require('puppeteer'),
    puppeteer = require('puppeteer'),
    program = require('commander'),
    fs = require('fs'),
    chromeFns = require('./chrome-ctx-scripts/fns');
    AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

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
    .option('--filter', 'filters all the archive-irrelevant files')
    .option('--deterministic', 'turn deterministic execution mode')
    .option('--wait', 'waits before exiting chrome')
    .parse(process.argv);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const SERIALIZESTYLES=`${__dirname}/chrome-ctx-scripts/serializeWithStyle.js`
const DISTILLDOM=`${__dirname}/../dom-distill/lib/domdistiller.js`
const HANDLERS=`${__dirname}/chrome-ctx-scripts/fetch-listeners.js`

var intercepts = fs.readFileSync('../program_analysis/runtime/dynamic-api-intercepts.js','utf-8');

async function launch(){
    const options = {
        executablePath: "/usr/bin/google-chrome-stable",
        headless: program.testing ? false : true,
        args : [ '--ignore-certificate-errors'/*, '--blink-settings=scriptEnabled=false'*/, '--auto-open-devtools-for-tabs', '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process,CrossSiteDocumentBlockingAlways,CrossSiteDocumentBlockingIfIsolating',
        '--no-sandbox',
        '--disable-setuid-sandbox'],
        // '--no-first-run'],
        // ignoreDefaultArgs: true,
    }
    // program.testing && options.args.push(
    //         `--window-size=600,600`
    // )
    console.log(options);
    if (program.dimension){
        console.log('custom dimensions')
        // options.args.push(` --window-size=700,1000`);
        // options.args.push(' --lang=es-ES');
    }
    
    var outDir = program.output;

    if (program.loadIter){
        options.userDataDir = program.chromeDir;
    }
    if (program.filter){
        puppeteer = require('puppeteer-extra');
        puppeteer.use(AdblockerPlugin({blockTrackers: true, useCache: false}))
    }
    
    const browser = await puppeteer.launch(options);
    let page = await browser.newPage();
    var nLogs = [], cLogs = [], jProfile;
    var cdp = await page.target().createCDPSession();
    console.log(await browser.userAgent());
    var _height = await page.evaluateHandle(()=> window.screen.height);
    var _width = await page.evaluateHandle(()=> window.screen.height);
    var height = await _height.jsonValue(), width = await _width.jsonValue();
    // console.log(height, width)
    if (program.deterministic){
        // await emulateUserAgent(page, 'iPhone 6');
        // await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4182.0 Safari/537.36");
        //   console.log(await browser.userAgent());
        // await page.setViewport({ width: 1261, height: 3816 })
        await page.evaluateOnNewDocument((intercepts) => {
            var origSetTimeout = window.setTimeout;
            window.setTimeout = function(){
                // if (arguments.length > 1 && !isNaN(Number.parseFloat(arguments[1]))){
                //     arguments[1] = 0;
                // }
                // return origSetTimeout.apply(this, arguments);
            }
            window.setInterval = function(){
                
            }

            window.requestAnimationFrame = function(){

            }

            window.setImmediate = function(){
                
            }

            var observers = ['MutationObserver', 'ResizeObserver','IntersectionObserver','PerformanceObserver'];
            observers.forEach((o)=>{
                window[o] = function(){};
            })
            // Object.defineProperty(navigator, "language", {
            //     get: function() {
            //         return "en-US";
            //     }
            // });
            // Object.defineProperty(navigator, "languages", {
            //     get: function() {
            //         return ["en-US"];
            //     }
            // });
            Date=function(r){function n(n,t,a,u,i,f,o){var c;switch(arguments.length){case 0:case 1:c=new r(e);break;default:a=a||1,u=u||0,i=i||0,f=f||0,o=o||0,c=new r(e)}return c}var e=1619575609705;return n.parse=r.parse,n.UTC=r.UTC,n.toString=r.toString,n.prototype=r.prototype,n.now=function(){return e},n}(Date),Math.exp=function(){function r(r){var n=new ArrayBuffer(8);return new Float64Array(n)[0]=r,0|new Uint32Array(n)[1]}function n(r){var n=new ArrayBuffer(8);return new Float64Array(n)[0]=r,new Uint32Array(n)[0]}function e(r,n){var e=new ArrayBuffer(8);return new Uint32Array(e)[1]=r,new Uint32Array(e)[0]=n,new Float64Array(e)[0]}var t=[.5,-.5],a=[.6931471803691238,-.6931471803691238],u=[1.9082149292705877e-10,-1.9082149292705877e-10];return function(i){var f,o=0,c=0,w=0,y=r(i),v=y>>31&1;if((y&=2147483647)>=1082535490){if(y>=2146435072)return isNaN(i)?i:0==v?i:0;if(i>709.782712893384)return 1/0;if(i<-745.1332191019411)return 0}if(y>1071001154){if(y<1072734898){if(1==i)return Math.E;c=i-a[v],w=u[v],o=1-v-v}else o=1.4426950408889634*i+t[v]|0,f=o,c=i-f*a[0],w=f*u[0];i=c-w}else{if(y<1043333120)return 1+i;o=0}f=i*i;var s=i-f*(.16666666666666602+f*(f*(6613756321437934e-20+f*(4.1381367970572385e-8*f-16533902205465252e-22))-.0027777777777015593));if(0==o)return 1-(i*s/(s-2)-i);var A=1-(w-i*s/(2-s)-c);return o>=-1021?A=e((o<<20)+r(A),n(A)):(A=e((o+1e3<<20)+r(A),n(A)),A*=9.332636185032189e-302)}}(),/*Math.random=function(){var r,n,e,t;return r=.8725217853207141,n=.520505596883595,e=.22893249243497849,t=1,function(){var a=2091639*r+2.3283064365386963e-10*t;return r=n,n=e,t=0|a,e=a-t}}()*/Math.random = function(){return 0.9322873996837797},Object.keys=function(r){return function(n){var e;return e=r(n),e.sort(),e}}(Object.keys);

            // var oldRandom = Math.random;
            // Math.random = function(){
            //     oldRandom.apply(this, arguments);
            // }
            // eval(intercepts);
        }, intercepts);
    } else {
        // await page.evaluateOnNewDocument(() => {
        //     Date=function(r){function n(n,t,a,u,i,f,o){var c;switch(arguments.length){case 0:case 1:c=new r(e);break;default:a=a||1,u=u||0,i=i||0,f=f||0,o=o||0,c=new r(e)}return c}var e=1619575609705;return n.parse=r.parse,n.UTC=r.UTC,n.toString=r.toString,n.prototype=r.prototype,n.now=function(){return e},n}(Date),Math.exp=function(){function r(r){var n=new ArrayBuffer(8);return new Float64Array(n)[0]=r,0|new Uint32Array(n)[1]}function n(r){var n=new ArrayBuffer(8);return new Float64Array(n)[0]=r,new Uint32Array(n)[0]}function e(r,n){var e=new ArrayBuffer(8);return new Uint32Array(e)[1]=r,new Uint32Array(e)[0]=n,new Float64Array(e)[0]}var t=[.5,-.5],a=[.6931471803691238,-.6931471803691238],u=[1.9082149292705877e-10,-1.9082149292705877e-10];return function(i){var f,o=0,c=0,w=0,y=r(i),v=y>>31&1;if((y&=2147483647)>=1082535490){if(y>=2146435072)return isNaN(i)?i:0==v?i:0;if(i>709.782712893384)return 1/0;if(i<-745.1332191019411)return 0}if(y>1071001154){if(y<1072734898){if(1==i)return Math.E;c=i-a[v],w=u[v],o=1-v-v}else o=1.4426950408889634*i+t[v]|0,f=o,c=i-f*a[0],w=f*u[0];i=c-w}else{if(y<1043333120)return 1+i;o=0}f=i*i;var s=i-f*(.16666666666666602+f*(f*(6613756321437934e-20+f*(4.1381367970572385e-8*f-16533902205465252e-22))-.0027777777777015593));if(0==o)return 1-(i*s/(s-2)-i);var A=1-(w-i*s/(2-s)-c);return o>=-1021?A=e((o<<20)+r(A),n(A)):(A=e((o+1e3<<20)+r(A),n(A)),A*=9.332636185032189e-302)}}(),/*Math.random=function(){var r,n,e,t;return r=.8725217853207141,n=.520505596883595,e=.22893249243497849,t=1,function(){var a=2091639*r+2.3283064365386963e-10*t;return r=n,n=e,t=0|a,e=a-t}}()*/Math.random = function(){return 0.9322873996837797},Object.keys=function(r){return function(n){var e;return e=r(n),e.sort(),e}}(Object.keys);

        //     Object.defineProperty(navigator, "language", {
        //         get: function() {
        //             return "en-GB";
        //         }
        //     });
        //     Object.defineProperty(navigator, "languages", {
        //         get: function() {
        //             return ["en-GB"];
        //         }
        //     });

        // });
    }

    // await emulateUserAgent(page, 'iPhone 6');

    if (program.loadIter){
        console.log(`Part of a series of page loads`)
        var count = program.loadIter, agent = 'desktop';
        if (count == 0 || count == 1)
            agent = 'desktop'
        await emulateUserAgent(page, agent);
    }

    // if (program.filter){
    //     await page.setRequestInterception(true);
    //     var customFilters  = getCustomFilters();
    //     page.on('request', (request) => {
    //         console.log(`request: ${request.url()}`)
    //         try {
    //             if (customFilters.some(e=>request.url().indexOf(e)>=0)){
    //                 console.log(`Blocking: ${request.url()}`)
    //                 request.abort();
    //             }
    //             else
    //                 request.continue();
    //         } catch (err){
    //             //pass 
    //         }
    //     });
    // }

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

    // if (program.coverage)
    //     await page.coverage.startJSCoverage();

    //Set global timeout to force kill the browser
    var gTimeoutValue = program.testing ? Number.parseInt(program.timeout)*100 : Number.parseInt(program.timeout) + 20000;
    console.log('global time out value', gTimeoutValue, program.timeout);
    var globalTimer = globalTimeout(browser, cdp, gTimeoutValue);
    await page.goto(program.url,{
        timeout: program.timeout
    }).catch(err => {
        console.log('Timer fired before page could be loaded', err)
        browser.close();
        clearTimeout(globalTimer);
        return;
    })

    console.log('Site loaded');

    if (program.coverage)
        await page.coverage.startJSCoverage();
    
    // await page.reload();
    // console.log('page reloaded')

    // page.evaluate(() => {
    //     debugger;
    //   });

    console.log('page paused')

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
        await sleep(2000)
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

    await extractPLT(page);
    if (program.screenshot)
        await page.screenshot({path: `${outDir}/screenshot.png`, fullPage: false});

    if (program.custom){
        let cstmEntries =  program.custom.split(',');
        for (var c of cstmEntries){
            switch (c) {
                 case 'Handlers': await extractHandlers(page,cdp,1); break;
                 case 'DOM' : await extractDOM(page); break; 
                 case 'Distill' : await distillDOM(page); break;
                 case 'CG' : await chromeFns.getAllFns(page, program); break; 
                 case 'dynAPI': await getDynCount(page); break;
                 case 'state' : await getJSState(page); break;
                 case 'heap' : await getHeapObject(page,'getCustomCache'); break;
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

var getCustomFilters = function(){
    var path = `${__dirname}/../filter-lists/archive-filter.txt`;
    var _filters = fs.readFileSync(path, 'utf-8');
    return _filters.split('\n').filter(e=>e!='');
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
    var devices = puppeteerOg.devices;
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

var getHeapObject = async function(page, obj){
    var _dyn = await page.evaluateHandle((obj) => __tracer[obj](), obj);
    var dyn = await _dyn.jsonValue();
    dump(dyn, `${program.output}/heapObj`)
}

var getJSState = async function(page){
    await page.evaluateHandle(() => window.__tracer.processFinalSignature());
    var _state = await page.evaluateHandle( () => window.__tracer.getProcessedSignature()),
        state = await _state.jsonValue();
    console.log(`dumping state: ${Object.keys(state).length}`)
    dump(state, `${program.output}/jsstate`);

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
    var cgStart = process.hrtime();
    await cdp.send('Runtime.evaluate',{expression:handlerCode, includeCommandLineAPI:true})
    var _handlers = await page.evaluateHandle(()=> archive_listeners);
    var handlers = await _handlers.jsonValue();
    var _fhandlers = await page.evaluateHandle(()=> _final_elems.map(e=>[e[0].nodeName,JSON.stringify(e[1])]));
    var fhandlers = await _fhandlers.jsonValue();
    dump(handlers, `${program.output}/handlers`);
    dump(fhandlers, `${program.output}/handlersFinal`);
    //extract event handler call graph
    if (!nTimes) nTimes = 1;
    for (var i = 0;i<nTimes;i++){
        //trigger event handlers
        await page.evaluateHandle(()=> triggerEvents(_final_elems))
        // await chromeFns.getCallGraph(page, program, i);
    } 
    // var cgEnd = process.hrtime(cgStart);
    // console.log(`${program.url} Time EVT ${cgEnd[0]} ${cgEnd[1]/(1000*1000)}`)
}

var extractDOM = async function(page){
    // var inlineStyles = fs.readFileSync(SERIALIZESTYLES, 'utf-8');
    // var evalStyles = await page.evaluateHandle((s) => eval(s),inlineStyles);
    // var domHandler = await page.evaluateHandle(() => document.documentElement.serializeWithStyles());
    // var domString = await domHandler.jsonValue();
    const html = await page.content();
    dump(html, `${program.output}/DOM`);
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
    // dump(endTime - startTime, `${program.output}/plt`);
    console.log(`${program.url} Time PLT ${endTime - startTime}`)
}

var dump = function(data, file){
    fs.writeFileSync(file, JSON.stringify(data));
}

launch()
    .catch(err =>{
        console.log(`error while launching ${err}`);
        process.exit();
    });