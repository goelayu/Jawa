

/*
This file contains code snippet which would be executed using the runtime
interface
It will also contain the corresponding handler

*/

var fs = require('fs');
const SERIALIZESTYLES="/home/goelayu/research/webArchive/scripts/serializeWithStyle.js"


var getCustomStat = async function(fetchCommand, Runtime, outputFile){
    var _result = await Runtime.evaluate({expression : fetchCommand, returnByValue: true});
    var result = _result.result;

    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
    console.log("Done fetching cache statistics");

}
var getCacheStats = async function(Runtime, outDir){
    var fetchCommand = '__tracer.getCacheStats()';
    var _cacheStats = await Runtime.evaluate({expression : fetchCommand, returnByValue: true});
    var cacheStats = _cacheStats.result;

    fs.writeFileSync(outDir +"/cacheStats", JSON.stringify(cacheStats, null, 2));
    console.log("Done fetching cache statistics");
}

var getNonCacheable = async function(Runtime, outDir){
    var fetchCommand = '__tracer.getNonCacheableFunctions()';
    var _cacheStats = await Runtime.evaluate({expression : fetchCommand, returnByValue: true});
    var cacheStats = _cacheStats.result;

    fs.writeFileSync(outDir +"/noncache", JSON.stringify(cacheStats, null, 2));
    console.log("Done fetching non-cache statistics");
}

var getMinHeap = function getMinHeap(){
    var minHeap = {};
    for (i in window){
        minHeap[i] = window[i] + "";
    }
    return minHeap;
}

var processLeafNodes = function(cg){
    var leafGraph = [];
    var nonLeafs = [];
    if (!cg) return leafGraph;
    Object.keys(cg).forEach((nodeId)=>{
        var node = cg[nodeId];
        var fnName = nodeId.split("_count")[0];
        if (nonLeafs.indexOf(fnName)>=0) return;
        if (!node.length && leafGraph.indexOf(fnName)<0)
            leafGraph.push(fnName);
        else nonLeafs.push(fnName);
    })

    return leafGraph;
}

var getNodeTimingInfo = function(leafNodes){
    var timeEntries = performance.getEntriesByType("mark");
    node2time = {};
    leafNodes.forEach((lg)=>{
        var pair = timeEntries.filter(e=>e.name.indexOf(lg)>=0);
        node2time[lg] = pair[1].startTime = pair[0].startTime;
    })
    expensiveNodes = Object.entries(node2time).sort((a,b)=>{return b[1] - a[1]}).slice(0,10);
}

var runCodeOnClient = async function(Runtime){
    var cmd = `
        // var timingInfo = performance.getEntriesByType("mark").filter(e=>e.name.indexOf("-function-")>=0).map((e)=>{return { n:e.name, t:e.startTime} });
        var timingInfo = performance.getEntriesByType("mark").map((e)=>{return { n:e.name, t:e.startTime} });

        var node2reads = {};
        var _a = __tracer.getCustomCache();
        Object.keys(_a).forEach((node)=>{
            node2reads[node] = Object.entries(_a[node]).filter(e=>e[0].indexOf("reads")>=0).map(e=>e[1]).reduce((acc, curr)=>{return acc + curr.length},0)
        })
    `;
    await Runtime.evaluate({expression : cmd, returnByValue: true});
    // console.log(ret);
    console.log("Done computing expensive leaf nodes")

}

var getFunctionStats = async function(Runtime, outDir) {
    var stats = {};
    var fetchCommand = '__tracer.getFunctionStats()';
    var _fnStats = await Runtime.evaluate({expression : fetchCommand, returnByValue: true});
    stats['fnStats'] = _fnStats.result;

    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    fetchCommand = `Object.values(__tracer.getInvocations()).reduce(${reducer})`
    var _invocations = await Runtime.evaluate({expression : fetchCommand, returnByValue: true});
    stats['invocations'] = _invocations.result;

    fs.writeFileSync(outDir +"/fnStats", JSON.stringify(stats, null, 2));
    console.log("Done fetching function statistics");    
    // fetchCommand = '__tracer.geInvocations()';
    // var _fnStats = await Runtime.evaluate({expression : fetchCommand, returnByValue: true});

}

var getDOM = async function(Runtime, outFile){
    var script = fs.readFileSync(SERIALIZESTYLES,"utf-8");
    await Runtime.evaluate({ expression: script });
    let html = await Runtime.evaluate({
        expression: 'document.documentElement.serializeWithStyles();'
    });
    // console.log(html)
    fs.writeFileSync(outFile,html.result.value);
}

var getInvocationProperties = async function(Runtime, outFile, fetchCommand, preProcess){
    if (preProcess)
        await runCodeOnClient(Runtime);
    if (fetchCommand == "minHeap") {
        fetchCommand=getMinHeap.toString()+";getMinHeap()"
    }
    var _fnStats = await Runtime.evaluate({expression : fetchCommand, returnByValue: true});
    var stats = _fnStats.result;
    if (_fnStats.code || _fnStats.exceptionDetails){
        fs.appendFileSync("./fetchErrors",outFile + "\n");
    }

    fs.writeFileSync(outFile, JSON.stringify(stats, null, 2));
    console.log("Done fetching " + fetchCommand);    
}

function escapeBackSlash(str){
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\^\$\|\'\_]/g, "\\$&");
}

var runPostLoadScripts = async function(Runtime){
    console.log("Running postload scripts..");
    //process final signature
    var processCommand = `
    var accSig = {};
    for (i=0;i<window.frames.length;i++){
    win = window.frames[i];
        if (win.__tracer && win.__tracer != window.top.__tracer) {
                win.__tracer.processFinalSignature();
                __ = Object.assign(accSig, win.__tracer.getProcessedSignature())
                // win.__tracer.storeSignature();
    }}
    __tracer.processFinalSignature();
    __ = Object.assign(accSig, __tracer.getProcessedSignature())
    accSig;
    // __tracer.storeSignature();

`;
    var cmdOutput = await Runtime.evaluate({expression : processCommand, returnByValue: true});

    if (cmdOutput.exceptionDetails){
        console.error("Error while processing final signature: " + 
            cmdOutput.exceptionDetails.exception.description);
        // errors.push(outDir);
        return cmdOutput.exceptionDetails.exception.description;
    }

    //stringify the final signature
    // processCommand = '__tracer.storeSignature()'
    // var cmdOutput = await Runtime.evaluate({expression : processCommand, returnByValue: true});

    // if (cmdOutput.exceptionDetails){
    //     console.error("Error while processing final signature: " + 
    //         cmdOutput.exceptionDetails.exception.description);
    //     // errors.push(outDir);
    //     return cmdOutput.exceptionDetails.exception.description;
    // }

    console.log("successfully ran the post load scripts");

    return cmdOutput;
}

var getProcessedSignature = async function(Runtime, outDir){
    

    var keys = [];
    var errors = [];
    var processedSignature = {};
    // var expression = '__tracer.getInvocations();';
    var expression = 'Object.keys(__tracer.getStoredSignature())';
    var cachedSignature;

    var _query = await Runtime.evaluate({expression:expression, returnByValue: true});
    if (_query.code || _query.exceptionDetails) {
        console.error("Error while fetching processed Signature length");
        errors.push(outDir);
        return;
    }

    keys = _query.result.value;
   
   if (!keys.length) {
    fs.writeFileSync(outDir + "/Signature", JSON.stringify({}, null, 4));
    console.log("No entry in processed Signature");
    return;
   }

    console.log("Starting to extract custom data of length "  + keys.length );

    for (var index in keys){
        var key = keys[index];
        key  = escapeBackSlash(key);
        var _query;
        try {
           _query = await Runtime.evaluate({expression:`__tracer.getStoredSignature()['${key}']`, returnByValue: true});
        } catch (e) {
            console.log("error while fetching key " + key);
            continue;
        }

        if (_query.code) {
            errors.push(_query.exceptionDetails);
            console.log("error while fetching key " + key);
            return;
        }

        processedSignature[key] = _query["result"]["value"];

        // if (processedSignature[key] && processedSignature[key].reads instanceof Set)
        //     processedSignature[key].reads = [...processedSignature[key].reads]
        // if (processedSignature[key] && processedSignature[key].writes instanceof Set)
        //     processedSignature[key].writes = [...processedSignature[key].writes]

        if ( (index/keys.length*100) % 10 == 0) {
            console.log(index/keys.length*100, "% done...");
        }

    }

    fs.writeFileSync(outDir+ "/Signature", JSON.stringify(processedSignature, null, 4));
    fs.writeFileSync(outDir + "/errors", JSON.stringify(errors));

}

var roughSizeOfObject = function( object ) {

    var objectList = [];
    var stack = [ object ];
    var bytes = 0;

    while ( stack.length ) {
        var value = stack.pop();

        if ( typeof value === 'boolean' ) {
            bytes += 4;
        }
        else if ( typeof value === 'string' ) {
            bytes += value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes += 8;
        }
        else if
        (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        )
        {
            objectList.push( value );

            for( var i in value ) {
                stack.push( value[ i ] );
            }
        }
    }
    return bytes;
}
var getCacheSize = async function(Runtime, outDir) {
    var fetchCommand = `
        var roughSizeOfObject = ${roughSizeOfObject};
        roughSizeOfObject(__tracer.getProcessedSignature());
    `
    var _cacheSize = await Runtime.evaluate({expression : fetchCommand, returnByValue: true});
    var cacheSize = _cacheSize.result ? _cacheSize.result.value : 0;
    fs.writeFileSync(outDir + "/cacheSize_orig", JSON.stringify(cacheSize));
    fetchCommand = "roughSizeOfObject(__tracer.getStoredSignature());"
    var _cacheSize = await Runtime.evaluate({expression : fetchCommand, returnByValue: true});
    var cacheSize = _cacheSize.result ? _cacheSize.result.value : 0;
     fs.writeFileSync(outDir + "/cacheSize_proc", JSON.stringify(cacheSize));
    console.log("Done fetching the cache size");

}

var getStorageOverhead = async function(Runtime,outFile){
    var overHead = 0;
    var sigSize = await Runtime.evaluate({expression : "localStorage.getItem('signature')", returnByValue: true});
    overHead += sigSize.result.value.length*2;
    var mapSize = await  Runtime.evaluate({expression : "localStorage.getItem('keyMap')", returnByValue: true});
    overHead += mapSize.result.value.length*2;
    fs.writeFileSync(outFile, overHead);
}


module.exports = {
    getCacheStats : getCacheStats,
    getCacheSize : getCacheSize,
    getFunctionStats: getFunctionStats,
    getCustomStat: getCustomStat,
    getInvocationProperties: getInvocationProperties,
    getProcessedSignature : getProcessedSignature,
    runPostLoadScripts: runPostLoadScripts,
    getStorageOverhead:getStorageOverhead,
    getDOM: getDOM
}