/**
 * This module calculates the storage savings we get by eliminating
 * boiler plate code from the page
 */

/**
 * Output of domdistiller
 * {
 *  1: Title
 *  2: 1: Article content
 *  10: [] list of images
 * }
 */

const fs = require('fs'),
    program = require('commander'),
    netParser = require('parser/networkParser');
const { exception } = require('console');

const INVALID_URL_DOMAINS = ["google","analytics","pubmatic","doubleclick","adsrvr","googletag", "archiveteam", "ping-meta-prd.jwpltx.com","prd.jwpltx.com","eproof.drudgereport.com","idsync.rlcdn.com","cdn.filestackcontent.com","connect.facebook.net","e.cdnwidget.com","nr-events.taboola.com","pixel.quantserve.com","pixel.wp.com","res.akamaized.net","sync.adkernel.com","certify.alexametrics.com","pixel.adsafeprotected.com","px.ads.linkedin.com","s.w-x.co","bat.bing.com","beacon.krxd.net","googleads.g.doubleclick.net","metrics.brightcove.com","ping.chartbeat.net","www.google-analytics.com","trc-events.taboola.com","px.moatads.com","www.facebook.com","sb.scorecardresearch.com","nexus.ensighten.com","odb.outbrain.com"];
const TRACKER_IMAGE_SIZE = 1000; //1000 BYTES
program
    .option('-d, --distilled-dom [input]', 'path to the input file')
    .option('-n, --network [input]', 'path to network file')
    .option('-v, --verbose ', 'enable verbose logging')
    .parse(process.argv);

var parse = function (f) {
    return JSON.parse(fs.readFileSync(f));
}

var makeUnique = function (arr) {
    return [
        ...new Set(arr)
    ];
}

var validResponse = function (res) {
    try {
        return typeof res[2][1] == 'string'
            && typeof res[10] == 'object';
    } catch (e) {
        program.verbose && console.error(`Invalid Response Object: ${e}`)
        return false;
    }
}

var validDistillation = function (res) {
    /**
     * If article isn't greater than threshold length then invalid distillation
     */
    const MINLENGTH = 50;
    program.verbose && console.log(`article content length: ${res[2][1].length}`)
    return res[2][1].length > MINLENGTH;
}

var _getQueryParamsLen = function(url){
    return url.split('&').length
}  

var extractImageUrls = function (res) {
    /**
     * res[10] is an array of url strings
     */
    var _urls = res[10];
    return makeUnique(
        Object.values(_urls).map(e => e[1])
    );
}

var getImageSizes = function (netData) {
    var net = netParser.parseNetworkLogs((netData));
    var imageSizes = {};
    for (var n of net) {
        if (!n.type || !n.size ||
            n.type != 'Image' || 
        _getQueryParamsLen(n.url)>10 ||
        INVALID_URL_DOMAINS.filter(e=>n.url.toLowerCase().indexOf(e.toLowerCase())>=0).length ||
        n.size < TRACKER_IMAGE_SIZE) continue;

        imageSizes[n.url] = n.size;
    }
    return imageSizes;
}

var calcSavings = function (mainImgs, imageSizes) {
    var mainImageSize = totalImageSize = 0;
    // var images = Object.keys(imageSizes);
    mainImgs.forEach((img) => {
        if (!(img in imageSizes)) return;
        mainImageSize += imageSizes[img];
    //     var matchImg = null;
    //     images.forEach((i,)=>{
    //         if (i.indexOf(img)>=0)
    //             matchImg = i;
    //     })
    //     if (!matchImg) return;
    //     mainImageSize += imageSizes[matchImg];
    });
    !mainImageSize && mainImgs.length && console.error(`image size is zero and number of images is non zero`);
    totalImageSize = Object.values(imageSizes).reduce((acc, cur) => { return acc + cur; }, 0);
    console.log(mainImageSize, totalImageSize);
}

function main() {
    var dom = parse(program.distilledDom),
        network = parse(program.network);

    if (!validResponse(dom) || !validDistillation(dom)) {
        console.log(`invalid`);
        return;
    }

    var imageSizes = getImageSizes(network);
    var mainImages = extractImageUrls(dom);
    program.verbose && console.log(mainImages);
    program.verbose && console.log(imageSizes);
    calcSavings(mainImages, imageSizes);

}

main();






