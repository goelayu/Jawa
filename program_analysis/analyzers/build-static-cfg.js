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
    path = require("path"),
    fnIds = require('../utils/fn-ids'),
    cgPatcher = require('../utils/patch-cfg'),
    util = require('../utils/util');
const { getDefaultSettings } = require('http2'); 
const dynamicCfg = require('./rewriters/dynamic-cfg');

const JSSRCFILES = `${__dirname}`;
const STATICANALYSER = `${__dirname}/javascript-call-graph/main.js`

program
    .option('-p , --performance [performance]', 'path to performance directory')
    .option('-d, --directory [directory]','mahimahi directory')
    .option('-s, --js-src [jsSrc]','javascript source file directory')
    .option('-v, --verbose', 'verbose logging')
    .parse(process.argv);

var cleanJSDir = function(){
    var cleanCMD = `rm -r ${JSSRCFILES}/*`
    program.verbose && console.log(`cleaning ${cleanCMD}`);
    spawnSync(cleanCMD,{shell:true});
}

var extractSrcFiles = function(dir, filenames){
    var res = path.resolve;
    var relativePyPath = `${__dirname}/../../`
    var pythonCMD = `cd ${relativePyPath}; python -m pyutils/get_mm_files ${res(dir)} ${res(filenames)}`
    program.verbose && console.log(`creating js src files: ${pythonCMD}`)
    var cmdOut = spawnSync(pythonCMD, {shell:true});
    console.error(cmdOut.stderr.toString());
}


var extractFileNames = function(dynamicCfg){
    /**
     * Parses the dynamic cfg and creates a filename array
     */
    var filenames = [];
    dynamicCfg.forEach((id)=>{
        var _filename =  id.split('-').slice(0,id.split('-').length - 4).join('-');
        if (filenames.indexOf(_filename)<0)
            filenames.push(_filename);
    })
    return filenames;
}

var escapefilename = function(fn){
    return fn.replace(/\//g,';;');
}

var unescapefilename = function(fn){
    return fn.replace(/;;/g,'/');
}

var getAllIds = function(){
    var filenames = fs.readdirSync(program.jsSrc);
    var allIds = {};
    filenames.forEach((file)=>{
        try {    
            var idFile = `${program.jsSrc}/${file}/ids`;
            var ids = JSON.parse(fs.readFileSync(idFile, 'utf-8'));
            allIds[file] = ids;
        } catch (e) {
            program.verbose && console.log(`Error while readings ids for ${file}`);
        }

        // if (file == 'filenames') return;
        // var content = fs.readFileSync(`${JSSRCFILES}/${escapefilename(file)}`,'utf-8');

        // var _allIds = [];
        // try {
        //     _allIds  = fnIds.parse(content, {filename:unescapefilename(file)});
        // } catch (e){
        //     program.verbose && console.error(`Error while parsing file: ${file}\nError: ${e}`);
        // }
        
        // allIds[escapefilename(file)] = _allIds;
    });
    return allIds;
}

var execCFGModule = function(filenames){
    var baseCMD = `node ${STATICANALYSER} `;
    var cmdArgs = ' ';
    // var jsSrcs = fs.readdirSync(JSSRCFILES);
    filenames.forEach((file)=>{
        cmdArgs += ` ${program.jsSrc}/${file}/${file}`;
    });
    var cfgCMD = baseCMD + `--cg ${cmdArgs} > ${JSSRCFILES}/cg`;
    var fgCMD = baseCMD + `--fg ${cmdArgs} > ${JSSRCFILES}/fg`;
    //create cfg
    program.verbose && console.log(`creating cfg: ${cfgCMD}`)
    var _cmdOut = spawnSync(cfgCMD, {shell:true} );
    
    program.verbose && console.log(_cmdOut.stderr.toString())
    return;
    //create fg
    program.verbose && console.log(`creating fg: ${fgCMD}`)
    _cmdOut = spawnSync(fgCMD, {shell:true} );
    program.verbose && console.log(_cmdOut.stderr.toString())

}

var cvtToDictCG = function(cg){
    // converts the given cg to a dict
    var dCg = {};
    cg.forEach((entry)=>{
        var [caller, callee] = entry;
        if (!(caller in dCg))
            dCg[caller] = [];
        dCg[caller].push(callee);
    });
    return dCg;
}

var isNativeFn = function(fnId){
    return fnId.split('-').length < 4;
}

var buildEvtCFG = function(completeCg, handlers){
    // parse evt handlers as a list of ids
    var missingEdges = 0;

    // dCg = cvtToDictCG(completeCg);
    dCg = completeCg;

    var handlerCFG = {};

    var traverseCFG = function(handler, callers){
        if (!callers) return;
        
        callers.forEach((c)=>{
            if (!c) {
                missingEdges++;
                return; // if missing edge, ignore for now TODO handle missing edges
            }
            var fnType = isNativeFn(c) ? 'native' : 'user';
            if (handlerCFG[handler][fnType].has(c)) return;
            handlerCFG[handler][fnType].add(c);
            var childCallers = dCg[c];
            traverseCFG(handler,childCallers);
        });
    }

    handlers.forEach((h)=>{
        handlerCFG[h] = {native: new Set, user: new Set};
        traverseCFG(h, dCg[h]);
    });
    program.verbose && console.log(`Found ${missingEdges} missing edges`)
    return handlerCFG;
}

var getIdLen = function(allIds){
    // returns all ids an array
    var idSrcLen = {};
    Object.values(allIds).forEach((idDict)=>{
        //idDict is a dict with key as ln and values as id, source length tuple
        Object.values(idDict).forEach((idLen)=>{
            idSrcLen[idLen[0]] = [idLen[1],idLen[2]];
        });
    });
    return idSrcLen;
}

var cgStats = function(completeCG, static, dynamic, allFns, allIds){
    var total = new Set, evt = new Set, 
        staticSize = dynamicSize  = preloadSize = 0;
    
    var idSrcLen = getIdLen(allIds);

    dynamic.forEach((d)=>{
        dynamicSize += idSrcLen[d][1];
    });

    allFns.preload.forEach((f)=>{
        if (!idSrcLen[f]) {
            console.log(`${f} not found`)
            return;
        }
        preloadSize += idSrcLen[f][1];
    });

    console.log(`dynamic size: ${dynamicSize} ${preloadSize}`)

    Object.keys(completeCG).forEach((caller)=>{
        total.add(caller);
        completeCG[caller].forEach((callee)=>{
            total.add(callee)
        })
    });
    // Object.values(completeCG).forEach((f)=>{
    //     total.add(f);
    // })

    Object.values(static).forEach((f)=>{
        f.user.forEach(evt.add, evt);
    });

    
    evt.forEach((val)=>{
        staticSize += idSrcLen[val][1];
    });

    console.log(total.size, evt.size, staticSize);

}

var patchCFG = function(allIds){
    var cg = `${JSSRCFILES}/cg`,
        fg = `${JSSRCFILES}/fg`;
    
    var completeCg = cgPatcher.findMissingCallees(cg, fg, allIds);
    return completeCg;
}

function main(){
    program.verbose && console.log(`----------Parsing dynamic CFG----------- `)
    var dynamicCfgDict = JSON.parse(fs.readFileSync(`${program.performance}/cg`,'utf-8'));
    var allFns = JSON.parse(fs.readFileSync(`${program.performance}/allFns`,'utf-8'));
    var dynamicCfg = util.mergeValsArr(dynamicCfgDict);
    console.log(`dynamic cfg nodes: ${dynamicCfg.length}`)
    program.verbose && console.log(`----------Extracting evt handlers and filenames----------- `)
    // var evtFile = `${program.performance}/handlers`
    // var handlers = extractEvtHandlers(evtFile);
    var filenames = extractFileNames(dynamicCfg);
    var handlerIds = Object.keys(dynamicCfgDict);
    console.log(`number of handlers: ${handlerIds.length}`)
    // fs.writeFileSync(`${JSSRCFILES}/filenames`,JSON.stringify(filenames));
    // program.verbose && console.log(`---------Parsing mm directory to get JS src files-----------`);
    // extractSrcFiles(program.directory, `${JSSRCFILES}/filenames`);
    var allIds = getAllIds();
    // cgStats(null, null, dynamicCfg, allFns, allIds);
    // return;
    program.verbose && console.log(`-------Build static call graph--------------`)
    // execCFGModule(filenames);
    // program.verbose && console.log(`----------Patch CG with missing edges------------`)
    var completeCg = patchCFG(allIds);
    // program.verbose && console.log(`----------Build final evt CG------------`)
    var staticCfg = buildEvtCFG(completeCg, handlerIds);
    
    // cgStats(null, null, dynamicCfg, allIds);
    cgStats(completeCg, staticCfg, dynamicCfg, allFns, allIds);
}

main();


