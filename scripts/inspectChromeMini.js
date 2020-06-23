const CDP = require('chrome-remote-interface');
const fs = require('fs');
const program = require('commander');
const chromeLauncher = require('chrome-launcher');

program
    .option('-u, --url [url]', 'url to be loaded')
    .parse(process.argv);

function navigate(launcher){
    console.log("calling chrome remote interface")
    CDP({port:9899},async (client) => {
        try {
            const {Page, Tracing} = client;
            // enable Page domain events
            await Page.enable();
            // trace a page load
            const events = [];
            // Tracing.dataCollected(({value}) => {
            //     events.push(...value);
            // });
            // await Tracing.start();
            var url = `https://web.archive.org/web/${program.url}`
            await Page.navigate({url: url});
            await Page.loadEventFired();
            // await Tracing.end();
            // await Tracing.tracingComplete();
            // save the tracing data
            fs.writeFileSync('/tmp/timeline.json', JSON.stringify(events));
        } catch (err) {
            console.error(err);
        } finally {
            await client.close();
            await launcher.kill();
        }
    }).on('error', (err) => {
        console.error(err);
    });
}

var chromeUserDirExt = (new Date).getTime();
chromeLauncher.launch({
     port:Number(9899),
     chromeFlags: [
        '--ignore-certificate-errors',
        '--disable-web-security',
        '--disable-extensions ',
        // '--js-flags="--expose-gc"',
        // '--auto-open-devtools-for-tabs',
        // '--enable-devtools-experiments',
        '--disable-features=IsolateOrigins,site-per-process,CrossSiteDocumentBlockingAlways,CrossSiteDocumentBlockingIfIsolating',
        '--disable-site-isolation-trials',
        '--allow-running-insecure-content',
         // '--headless',
         // '--v8-cache-options=off',
         // '--js-flags="--compilation-cache false"',
         // '--user-data-dir=/tmp/chromeProfiles/' + program.url.split('//')[1]
         '--user-data-dir=/tmp/nonexistent' + chromeUserDirExt,
    ]
}).then(chrome => {
    console.log("chrome is launched, navigating page");
    navigate(chrome);
});