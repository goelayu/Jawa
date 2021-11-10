/**
 * uses pixelmatch library to compute number of pixels that are different
 */

const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const program = require('commander')

program
    .option('-f, --first [first]','path to the first image')
    .option('-s, --second [second]','path to the second image')
    .parse(process.argv);


var comparePixels = function(){
    try {
        const img1 = PNG.sync.read(fs.readFileSync(program.first));
        const img2 = PNG.sync.read(fs.readFileSync(program.second));
    } catch {
        console.log(-1);
        return;
    }
    const {width, height} = img1;
    const diff = new PNG({width, height});

    try {
        console.log(`${pixelmatch(img1.data, img2.data, diff.data, width, height, {threshold: 1})}`);
    } catch (e){
        console.log(1);
    }
}
