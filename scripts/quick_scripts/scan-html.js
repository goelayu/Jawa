/**
 * This script scans html source code
 * to detect cricial event handlers using a series
 * of keywords
 */

const fs = require('fs'),
    program = require('commander');

program
    .option('-f, --file <file>', 'File to scan')
    .parse(process.argv);

const KEYWORDS = ['button', 'menu', 'navbar', 'slider', 'dropdown', 'carousel', 'slider', 'swiper', 'tab', 'select', 'picker', 'slider', 'scroll', 'toggle']

var containsCriticalEventHandler = function () {
    var src = fs.readFileSync(program.file, 'utf8');
    return KEYWORDS.some(key => src.search(key) > -1);
}

console.log(containsCriticalEventHandler());