MITMProxy = require('/home/goelayu/research/webArchive/jawa-proto/mitmproxy-node/dist/index.js')

// Returns Promise<MITMProxy>
async function makeProxy() {
    // Note: Your interceptor can also be asynchronous and return a Promise!
    return MITMProxy.default.Create(function (interceptedMsg) {
        const req = interceptedMsg.request;
        const res = interceptedMsg.response;
        if (req.rawUrl.contains("target.js") && res.getHeader('content-type').indexOf("javascript") !== -1) {
            interceptedMsg.setResponseBody(Buffer.from(`Hacked!`, 'utf8'));
        }
    }, ['/eval'] /* list of paths to directly intercept -- don't send to server */,
        true /* Be quiet; turn off for debug messages */,
        true /* Only intercept text or potentially-text requests (all mime types with *application* and *text* in them, plus responses with no mime type) */
    );
}

async function main() {
    const proxy = await makeProxy();
    // when done:
    await proxy.shutdown();
}

main();