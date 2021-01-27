/**
 * This module takes in a list of event handlers
 * and a list of potential file names containing these event handlers
 * and the mahimahi directory containing all the files 
 * Then it runs the following toolchain
 * 1) Extract the JS files from the mahimahi directory
 * 2) Extract identifiers for event handlers and all functions
 * 3) Build static cfg for all the functions from the files
 * 4) Traverse the static cfg and slice out functions reachable by event handlers
 */

const fs = require('fs'),
    program = require('commander'),
    {spawnSync} = require('child_process'),
    path = require("path");

const JSSRCFILES = `${__dirname}/../../JS_FILES`;

program
    .option('--evt [evt]', 'path to list of event handlers')
    .option('--filenames [filenames]','filenames containing event handlers')
    .option('-d, --directory [directory]','mahimahi directory')
    .option('-v, --verbose', 'verbose logging')
    .parse(process.argv);

var cleanJSDir = function(){
    var cleanCMD = `rm -r ${JSSRCFILES}/*`
    program.verbose && console.log(`cleaning ${cleanCMD}`);
    spawnSync(cleanCMD,{shell:true});
}

var extractSrcFiles = function(dir, evtfile){
    var res = path.resolve;
    var relativePyPath = `${__dirname}/../../`
    var pythonCMD = `cd ${relativePyPath}; python -m pyutils/get_mm_files ${res(dir)} ${res(evtfile)}`
    program.verbose && console.log(`creating js src files: ${pythonCMD}`)
    var cmdOut = spawnSync(pythonCMD, {shell:true});
    console.error(cmdOut.stderr.toString());
}

function main(){
    cleanJSDir();
    extractSrcFiles(program.directory, program.evt);
}

main();


