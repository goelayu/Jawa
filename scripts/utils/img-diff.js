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
    .option('-v, --verbose','enable verbose loggging')
    .parse(process.argv);


var comparePixels = function(){
    var img1, img2;
    try {
        img1 = PNG.sync.read(fs.readFileSync(program.first));
        img2 = PNG.sync.read(fs.readFileSync(program.second));
    } catch {
        console.log(-1);
        return;
    }
    const {width, height} = img1;
    const diff = new PNG({width, height});

    try {
        var diffPixels = 0;
        diffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, {threshold: 0, diffMask:true});
        console.log(`res: ${diffPixels} ${width*height}`);
        program.verbose && fs.writeFileSync('diff.png', PNG.sync.write(diff));
    } catch (e){
        console.log(1);
    }
}

comparePixels();
