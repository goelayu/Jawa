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
    cgPatcher = require('../utils/patch-cfg');
const { getDefaultSettings } = require('http2');

const JSSRCFILES = `${__dirname}/../../JS_FILES`;
const STATICANALYSER = `${__dirname}/javascript-call-graph/main.js`

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

var extractSrcFiles = function(dir, filenames){
    var res = path.resolve;
    var relativePyPath = `${__dirname}/../../`
    var pythonCMD = `cd ${relativePyPath}; python -m pyutils/get_mm_files ${res(dir)} ${res(filenames)}`
    program.verbose && console.log(`creating js src files: ${pythonCMD}`)
    var cmdOut = spawnSync(pythonCMD, {shell:true});
    console.error(cmdOut.stderr.toString());
}

var all_handlers = ["abort", "blur", "change", "click", "close", "contextmenu", "dblclick", "focus",
    "input", "keydown", "keypress", "keyup", "mouseenter", "mousedown", "mouseleave", "mousemove", "mouseout",
    "mouseover", "mouseup", "reset", "resize", "scroll", "select", "submit" ];

var IGNORE_ELEMENTS = ['SCRIPT', 'IFRAME', 'BODY','LINK','IMG'
    ,'INPUT','FORM','A','HTML']

function getCandidateElements(listeners){
    var elems = []; // each entry is a two-tupe [1st,2nd] where 1st is element, and 2nd is list of events
    listeners.forEach((l)=>{
        var [el, handler] = l;
        if (IGNORE_ELEMENTS.filter(e=>el.startsWith(e)).length == 0){
            var e = [el, []];
            Object.keys(handler).forEach((h)=>{
                if (all_handlers.indexOf(h)>=0)
                    e[1] = e[1].concat(handler[h]);
            });
            if (!e[1].length) return;
            elems.push(e);
        }
    })
    return elems;
}

var extractEvtHandlers = function(evtFile){
    var handlers = [],
        handlerInfo = JSON.parse(fs.readFileSync(evtFile));
    
    var candidateHandlers = getCandidateElements(handlerInfo);
    candidateHandlers.forEach((hndls)=>{
            handlers = handlers.concat(hndls[1]);
        });
    return handlers;
}

var extractFileNames = function(handlers){
    var filenames = {};
    handlers.forEach((h)=>{
        var file;
        var hlines = h.split('\n');
        for (var i=0;i<hlines.length;i++){
            var line = hlines[i];
            if (line.indexOf('fn inside file')>=0){
                file = line.split(':')[1].trim();
                break;
            }
        }
        !file && program.verbose && console.log(`No filename found inside handler: ${h}`);
        if (file){
            if (!(file in filenames))
                filenames[file] = [];
            filenames[file].push(h);
        }
    });
    return filenames;
}

var escapefilename = function(fn){
    return fn.replace(/\//g,'_');
}

var buildHandlersId = function(handlers, filenames){
    var jsSrcs = fs.readdirSync(JSSRCFILES);
    var handlerIds = {}, allIds = {};
    // TODO unique handlers are different by their location
    // not by their source code
    Object.keys(filenames).forEach((file)=>{
        var noIdHandlers = [...new Set(filenames[file])];
        program.verbose && console.log(`finding ids for ${noIdHandlers.length} handlers`);
        var content = fs.readFileSync(`${JSSRCFILES}/${escapefilename(file)}`,'utf-8');

        var [_handlerIds, _allIds] = [[],[]];
        try {
            [_handlerIds, _allIds]  = fnIds.parse(content, {filename:file, fns:noIdHandlers});
        } catch (e){
            program.verbose && console.error(`Error while parsing file: ${jsSrc}`);
        }
        
        //update list of ids
        handlerIds[escapefilename(file)] = _handlerIds;
        allIds[escapefilename(file)] = _allIds;

        //update noHandlerId list to remove the handlers already found
        // noIdHandlers = noIdHandlers.filter(e=>!e.found);
    });
    return [handlerIds, allIds];
}

var buildCFG = function(filenames){
    var baseCMD = `node ${STATICANALYSER} `;
    var cmdArgs = ' ';
    // var jsSrcs = fs.readdirSync(JSSRCFILES);
    Object.keys(filenames).forEach((file)=>{
        cmdArgs += ` ${JSSRCFILES}/${escapefilename(file)}`;
    });
    var cfgCMD = baseCMD + `--cg ${cmdArgs} > ${JSSRCFILES}/cg`;
    var fgCMD = baseCMD + `--fg ${cmdArgs} > ${JSSRCFILES}/fg`;
    //create cfg
    program.verbose && console.log(`creating cfg: ${cfgCMD}`)
    var _cmdOut = spawnSync(cfgCMD, {shell:true} );
    
    program.verbose && console.log(_cmdOut.stderr.toString())
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

var buildEvtCFG = function(completeCg, evtHandlers){
    // parse evt handlers as a list of ids
    var handlers = [],
        missingEdges = 0;
    Object.values(evtHandlers).forEach((h)=>{
        //h is a dict with key as ln and values as id
        handlers = handlers.concat(Object.values(h));
    });

    dCg = cvtToDictCG(completeCg);

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
            idSrcLen[idLen[0]] = idLen[1];
        });
    });
    return idSrcLen;
}

var cgStats = function(completeCG, evtCG, allIds){
    var total = new Set, evt = new Set, 
        evtSrcSize = 0;

    completeCG.forEach((f)=>{
        total.add(f[0]);
        total.add(f[1]);
    });
    // Object.values(completeCG).forEach((f)=>{
    //     total.add(f);
    // })

    Object.values(evtCG).forEach((f)=>{
        f.user.forEach(evt.add, evt);
    });

    var idSrcLen = getIdLen(allIds);
    evt.forEach((val)=>{
        evtSrcSize += idSrcLen[val];
    });

    console.log(total.size, evt.size, evtSrcSize);

}

var patchCFG = function(allIds){
    var cg = `${JSSRCFILES}/cg`,
        fg = `${JSSRCFILES}/fg`;
    
    var completeCg = cgPatcher.findMissingCallees(cg, fg, allIds);
    return completeCg;
}

function main(){
    // 1) clean JS dir
    program.verbose && console.log(`----------Cleaning the JS dir ${JSSRCFILES}-------------`)
    cleanJSDir();
    program.verbose && console.log(`----------Extracting evt handlers and filenames----------- `)
    var handlers = extractEvtHandlers(program.evt);
    var filenames = extractFileNames(handlers);
    fs.writeFileSync(`${JSSRCFILES}/filenames`,JSON.stringify(Object.keys(filenames)))
    program.verbose && console.log(`---------Parsing mm directory to get JS src files-----------`);
    extractSrcFiles(program.directory, `${JSSRCFILES}/filenames`);
    var [handlerIds, allIds] = buildHandlersId(handlers, filenames);
    program.verbose && console.log(`-------Build static call graph--------------`)
    buildCFG(filenames);
    program.verbose && console.log(`----------Patch CG with missing edges------------`)
    var completeCg = patchCFG(allIds);
    program.verbose && console.log(`----------Build final evt CG------------`)
    var evtCG = buildEvtCFG(completeCg, handlerIds);

    cgStats(completeCg, evtCG, allIds);
}

main();


