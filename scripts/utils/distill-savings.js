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
    return res[2][1].length > MINLENGTH;
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
            n.type != 'Image') continue;

        imageSizes[n.url] = n.size;
    }
    return imageSizes;
}

var calcSavings = function (mainImgs, imageSizes) {
    var mainImageSize = totalImageSize = 0;
    mainImgs.forEach((img) => {
        if (!(img in imageSizes)) return;
        mainImageSize += imageSizes[img];
    });

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






