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
    util = require('../utils/util'),
    CFA = require('./static/control-flow-analysis');
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
        if (filenames.indexOf(_filename)<0 && _filename != '')
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

var getControlFlowFns  = function(dynamicCG, filenames){
    var paths = filenames.map(e=>`${program.jsSrc}/${e}/${e}`);
    var options = {
        filepaths:paths, filenames:filenames, fns:dynamicCG
    };
    var controlFlowFns = CFA.analyze(options);
    program.verbose && console.log(`only ${controlFlowFns.length} have control flow stmnts in them`);
    return controlFlowFns
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
    var baseCMD = `node --max-old-space-size=2048 ${STATICANALYSER} `;
    var cmdArgs = ' ';
    // var filenames = fs.readdirSync(program.jsSrc)
    filenames.forEach((file)=>{
        if (file == '' || file.indexOf('-script-')>=0) return;
        cmdArgs += ` ${program.jsSrc}/${file}/${file}`;
    });
    var cfgCMD = baseCMD + `--cg --fg${cmdArgs} 2> ${program.jsSrc}/cg 1>${program.jsSrc}/fg`;
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

var getMissingCallers = function(completeCg, fns){
    var missingCallers = new Set;

    fns.forEach((f)=>{
        var callers = completeCg[f];
        if (!callers) return;
        if (callers.filter(e=>e==null).length) missingCallers.add(f);
    });
    console.log(`Missing callers: ${missingCallers.size}`)
}

var buildEvtCFG = function(completeCg, handlers){
    // parse evt handlers as a list of ids
    var missingCallers = new Set;

    // dCg = cvtToDictCG(completeCg);
    dCg = completeCg;

    var handlerCFG = {};

    var traverseCFG = function(handler, callers, parentCaller){
        if (!callers) return;
        
        callers.forEach((c)=>{
            if (!c) {
                !missingCallers.has(parentCaller) && missingCallers.add(parentCaller);
                return; // if missing edge, ignore for now TODO handle missing edges
            }
            var fnType = isNativeFn(c) ? 'native' : 'user';
            if (handlerCFG[handler][fnType].has(c)) return;
            handlerCFG[handler][fnType].add(c);
            var childCallers = dCg[c];
            traverseCFG(handler,childCallers, c);
        });
    }

    handlers.forEach((h)=>{
        // var [evt, id] = h.split(';;;;');
        var id = h;
        handlerCFG[h] = {native: new Set, user: new Set};
        traverseCFG(h, dCg[id]);
    });
    program.verbose && console.log(`Found ${missingCallers.size} missing edges`)
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

var cgStats = function(completeCG, static, dynamicDict, allFns, allIds){
    var total = new Set, evtAll = new Set, evtNoXml = new Set, 
        staticSizeAll = staticSizeNoXml = dynamicSize  = preloadSize = 0;
    
    var idSrcLen = getIdLen(allIds);

    Object.keys(completeCG).forEach((caller)=>{
        total.add(caller);
        completeCG[caller].forEach((callee)=>{
            total.add(callee)
        })
    });

    var xmlFns = util.getXMLFns(dynamicDict);
    Object.entries(static).forEach((f)=>{
        if (xmlFns.indexOf(f[0])>=0){
            console.log(`${f} is a xml function`);
            f[1].user.forEach(evtAll.add, evtAll);
            return;
        }
        f[1].user.forEach(evtAll.add, evtAll);
        // if (f.user.has('xml')) return;
        // f[1].user.forEach(evtNoXml.add, evtNoXml);
    });

    
    // evtAll.forEach((val)=>{
    //     staticSizeAll += idSrcLen[val][1];
    // });

    // evtNoXml.forEach((val)=>{
    //     staticSizeNoXml += idSrcLen[val][1];
    // });
    
    var dynamicAll = util.mergeValsArr(dynamicDict, false);
    // var dynamicNoXml = util.mergeValsArr(dynamicDict, true);

    var preLoadSize = util.sumFnSizes(allFns.preload, idSrcLen);

    //union values
    var preloadStaticAll = util.unionArray(allFns.preload, [...evtAll]);
    // var preloadStaticNoXml = util.unionArray(allFns.preload, [...evtNoXml]);
    var preloadStaticSizeAll = util.sumFnSizes(preloadStaticAll, idSrcLen);
    // var preloadStaticSizeNoXml = util.sumFnSizes(preloadStaticNoXml, idSrcLen);
    var preloadDynamicAll = util.unionArray(allFns.preload, dynamicAll);
    // var preloadDynamicNoXml = util.unionArray(allFns.preload, dynamicNoXml);
    var preloadDynamicSizeAll = util.sumFnSizes(preloadDynamicAll, idSrcLen);
    // var preloadDynamicSizeNoXml = util.sumFnSizes(preloadDynamicNoXml, idSrcLen);
    var totalJS = util.getFileSize(program.jsSrc);

    // console.log('Res:', preLoadSize, preloadDynamicSizeAll, preloadDynamicSizeNoXml, preloadStaticSizeAll, preloadStaticSizeNoXml, totalJS)
    console.log('Res:', preLoadSize, preloadDynamicSizeAll, preloadStaticSizeAll, totalJS)
    // console.log('Total and static lengths: ', total.size, evt.size);

}

var patchCFG = function(allIds){
    var cg = `${program.jsSrc}/cg`,
        fg = `${program.jsSrc}/fg`;
    
    var completeCg = cgPatcher.findMissingCallees(cg, fg, allIds);
    return completeCg;
}

function main(){
    program.verbose && console.log(`----------Parsing dynamic CFG----------- `)
    var dynamicCfgDict = JSON.parse(fs.readFileSync(`${program.performance}/cg`,'utf-8'));
    var allFns = JSON.parse(fs.readFileSync(`${program.performance}/allFns`,'utf-8'));
    var dynamicCfg = util.mergeValsArr(dynamicCfgDict);
    var ret = false;
    !dynamicCfg.length && program.verbose && console.log(`Empty evt CG; Exiting..`);
    if (!dynamicCfg.length)
        return;
    console.log(`dynamic cfg nodes: ${dynamicCfg.length}`)
    program.verbose && console.log(`----------Extracting evt handlers and filenames----------- `)
    // var evtFile = `${program.performance}/handlers`
    // var handlers = extractEvtHandlers(evtFile);
    var filenames = extractFileNames(dynamicCfg);
    var handlerIds = Object.keys(dynamicCfgDict);
    console.log(`number of handlers: ${handlerIds.length}`)
    var allIds = getAllIds();
    var controlFlowFns =  getControlFlowFns(dynamicCfg, filenames);
    program.verbose && console.log(`-------Build static call graph--------------`)
    execCFGModule(filenames);
    // program.verbose && console.log(`----------Patch CG with missing edges------------`)
    var completeCg = patchCFG(allIds);
    // program.verbose && console.log(`----------Build final evt CG------------`)
    var staticCfg = buildEvtCFG(completeCg, controlFlowFns);
    getMissingCallers(completeCg, controlFlowFns)
    // return;
    // cgStats(null, null, dynamicCfg, allIds);
    cgStats(completeCg, staticCfg, dynamicCfgDict, allFns, allIds);
}

main();


