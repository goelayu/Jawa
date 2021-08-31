/*
 * Copyright (c) 2012 Massachusetts Institute of Technology, Adobe Systems
 * Incorporated, and other contributors. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/*
The source of source-map is included below on the line beginning with "var sourceMap",
and its license is as follows:

Copyright (c) 2009-2011, Mozilla Foundation and contributors
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the names of the Mozilla Foundation nor the names of project
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED T, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*
Keywords to manage code base better 

TODO - code sections need to be reimplemented or handled better
SUPPRESS - caught exceptions which our suppressed - need to be handled better
LOG - log statements which are used to debug

TODO 

    - Fine tracking of arguments
        - Instead of stringifying the entire argument object, only track object level changes (read, write) to the individual object
    - Signature Propagation
        - While trying to build the call graph, some nodes are not found: Is it because I am deleting nodes while stringifying? 
*/

if (typeof window != "undefined"){
    if (typeof window.top.setupStateTime == "undefined") {
        window.top.setupStateTime = {};
        window.top.setupStateCounter=0;
    }
}

if (typeof window.__tracer === 'undefined') {
__tracer = new __declTracerObject__(window);
function __declTracerObject__(window) {
    var setupStateStartTime = performance.now();
    var e2eTesting = false;
    var trackOnlyLeaf = false;
    var functions = new Set();
    var invocations = {};
    var customLocalStorage = {}; /* Use this in place of the localstorage API for faster access. */
    var counter = 0;
    var shadowStack = [];
    var _shadowStackHead;
    var processedSignature = {};
    var callGraph = {};
    var parentNodes = [];
    var nonLeafNodes = [];
    var functionsSeen = [];
    var pageRecorded = false;
    var simpleReplay = true;
    var cacheStats = {hits: [], misses: {error:[], empty:[], mismatch:[]}}; 
    var functionStats = {noarg:[], prim: [], prim_objects:[], function: []};
    var nonCacheableNodes = {};
    var invocationsIndName = {};
    var invocationsIndState = {};
    var invocationToArgProxy = {};
    var invocationToThisProxy = {}
    var invocationToClosureProxy = {};
    var keysToStdKeys = {};
    var cacheableSignature = {};
    var pageLoaded = false;
    var oldPageLoaded = [];
    var INVOCATION_LIMIT = 100000;
    var domCounter =0;
    var invocationToWrites = {};
    var ND = [];
    var curRoot = null;
    var functionToScopes = {};
    // var omniStringifier = Omni ? new Omni() : "";
    // var parse = omniStringifier.parse;
    var rootInvocs = [];
    var sigSizeLimit = 500; // Number of reads and writes allowed per invocations
    var OMNI_SIZE_LIMIT=10000; //Length of string allowed to be read or written
    var instrumentationPattern = "record";
    var invocationList = [];
    var timingInfo = {};
    var sigSizes = {};
    var PMD = {};
    var runTimePurged = 0;
    var writeStateProcessed = new Map();

    /*
    For efficient recording, constraint the size of certain objects
    - signature length should be less than 50 entries
    - during stringification the object length should be less than certain bytes*TODO
    */

    window.objStrCount = {
        argument_reads:0,
        argument_writes:0,
        closure_reads:0, 
        closure_writes:0,
        global_writes:0,
        global_reads:0,
        this_reads:0,
        this_writes:0
    };

    //Define all your custom methods, before they are overwritten
    //by user javascript
    // Declare all the custom prototype methods here
    var customMethods = {getOwnPropertyDescriptor: Object.getOwnPropertyDescriptor, getOwnProperyNames: Object.getOwnProperyNames, ownKeys: Reflect.ownKeys}

    //temporary hack to store non stringifiable functions
    // var nodesByProperties = {
    //     "NOGSNOARG":[], "GS_f":[], "GS":[],
    //     "Function":{}, "RTI":{RTI}, 
    //     "antiLocal":{antiLocal},"ND":{ND}, "DOM":{DOM}
    // };

    var eraseCookies = function () {
        var cookies = document.cookie.split("; ");
        for (var c = 0; c < cookies.length; c++) {
            var d = window.location.hostname.split(".");
            while (d.length > 0) {
                var cookieBase = encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' + d.join('.') + ' ;path=';
                var p = location.pathname.split('/');
                document.cookie = cookieBase + '/';
                while (p.length > 0) {
                    document.cookie = cookieBase + p.join('/');
                    p.pop();
                };
                d.shift();
            }
        }
    }

    var fnCacheExists = false;
    try {
        if (fnCacheExists = localStorage.getItem("fnCacheExists")){
            console.log("Fn cache exists, skippping function executions..");
            keysToStdKeys = JSON.parse(localStorage.getItem("keyMap"));

            var _processedSignature = JSON.parse(localStorage.getItem("signature"));
            Object.keys(_processedSignature).forEach((key)=>{
                processedSignature[key] = JSON.parse(_processedSignature[key], true);
            })
            console.log("Function signatures loaded..");
            pageLoaded = true;

            //Restore cookies
            eraseCookies();
            var prevCookie = localStorage.getItem("cookieVal");
            document.cookie = prevCookie;
        } else {
            localStorage.setItem("cookieVal",document.cookie);
        }
    } catch (e){
        console.error("error while reading local storage " + e);
    }

    window.addEventListener("load", function(){
        if (!pageRecorded) {
            console.log("PROXY STATS");
            console.log(window.proxyReadCount, window.proxyWriteCount);
            /*Delete performance shims since we need all the entries now
            However only do this when the top level page fires
            Some iframe with a sep*/
            // delete window.performance.getEntries 
            // delete window.performance.getEntriesByType
        } else {
            console.log("Page successfully replayed");
        }  
        // if (window.top == window)
        //     debugger;
        // if (instrumentationPattern == "replay")
        //     debugger;

    })

    var processFinalSignature = function(){
        // First process the global state of every function
        var proxyPrivates = globalProxyHandler.accessToPrivates();
        // Process the signature to construct meaningful paths
        var sigProcessor = new SignatureProcessor(customLocalStorage, proxyPrivates.ObjectTree, callGraph, "global");
        sigProcessor.process();
        // sigProcessor.postProcess();
        // sigProcessor.signaturePropogate();
        processedSignature = sigProcessor.processedSig;

        Object.keys(customLocalStorage).forEach((invocationId)=>{
            var invocationSignature = {};
            invocationSignature[invocationId] = processedSignature[invocationId];
            if (!invocationSignature[invocationId]) return;
            //For each invocation get all the scopes it touches
            functionToScopes[invocationId] && functionToScopes[invocationId].forEach((i_scope)=>{
                var closureProxyHandler = invocationToClosureProxy[i_scope];
                if (!closureProxyHandler) return;
                var proxyPrivates = closureProxyHandler.accessToPrivates();
                var sigProcessor = new SignatureProcessor(invocationSignature, proxyPrivates.ObjectTree, callGraph, `closure_${i_scope}`);
                sigProcessor.process();
                // sigProcessor.postProcess();
                processedSignature[invocationId] = sigProcessor.processedSig[invocationId];
            })
        })

        //Now individual iterate the invocations and convert object ids to strings
        // Object.keys(invocationToArgProxy).forEach((invocationId)=>{
        //      // Return if not leaf node
        //     if (trackOnlyLeaf &&  callGraph[invocationId].length) {
        //         nonCacheableNodes[invocationId] = "non-leaf";
        //         return;
        //     }
        //     if (invocationId in nonCacheableNodes) return;
        //     var argProxyHandler = invocationToArgProxy[invocationId];
        //     var proxyPrivates = argProxyHandler.accessToPrivates();
        //     var invocationSignature = {};
        //     invocationSignature[invocationId] = processedSignature[invocationId];
        //     if (!invocationSignature[invocationId]) return;
        //     var sigProcessor = new SignatureProcessor(invocationSignature, proxyPrivates.ObjectTree, callGraph, "argument");
        //     sigProcessor.process();
        //     // sigProcessor.postProcess();
        //     processedSignature[invocationId] = sigProcessor.processedSig[invocationId];
        // })

        // Object.keys(invocationToThisProxy).forEach((invocationId)=>{
        //     // Return if not leaf node
        //     if (trackOnlyLeaf && callGraph[invocationId].length) return;
        //     if (invocationId in nonCacheableNodes) return;
        //     var thisProxyHandler = invocationToThisProxy[invocationId];
        //     var proxyPrivates = thisProxyHandler.accessToPrivates();
        //     var invocationSignature = {};
        //     invocationSignature[invocationId] = processedSignature[invocationId];
        //     if (!invocationSignature[invocationId]) return;
        //     var sigProcessor = new SignatureProcessor(invocationSignature, proxyPrivates.ObjectTree, callGraph, "this");
        //     sigProcessor.process();
        //     // sigProcessor.postProcess();
        //     processedSignature[invocationId] = sigProcessor.processedSig[invocationId];
        // })

        // Object.keys(invocationToClosureProxy).forEach((invocationId)=>{
        //     // Return if not leaf node
        //     if (trackOnlyLeaf && callGraph[invocationId].length) return;
        //     if (invocationId in nonCacheableNodes) return;
        //     var closureProxyHandler = invocationToClosureProxy[invocationId];
        //     var proxyPrivates = closureProxyHandler.accessToPrivates();
        //     var invocationSignature = {};
        //     invocationSignature[invocationId] = processedSignature[invocationId];
        //     if (!invocationSignature[invocationId]) return;
        //     var sigProcessor = new SignatureProcessor(invocationSignature, proxyPrivates.ObjectTree, callGraph, "closure");
        //     sigProcessor.process();
        //     // sigProcessor.postProcess();
        //     processedSignature[invocationId] = sigProcessor.processedSig[invocationId];
        // })

        // constructCacheReadKey();

        console.log("Done processing final signature\nStarting propagation...\n")

        //garbage cleaning
        // delete invocationToArgProxy;
        // delete globalProxyHandler;
        delete customLocalStorage;
        // delete invocationToClosureProxy;

        // sigProcessor.setPropagationData(PMD, {i2a:invocationToArgProxy, i2c:invocationToClosureProxy
        //     ,i2t: invocationToThisProxy, gph:globalProxyHandler}, processedSignature, nonCacheableNodes);
        // sigProcessor.signaturePropagate()

        console.log("Done propagating signatures..\nPurging expensive signatures");
        // purgeExpensiveSignatures();

    }


    var purgeExpensiveSignatures = function(){
        var topNodeInfo = runtimeInfo.filter(e=>e[2]>=0);
        var topNodes = topNodeInfo.map(e=>e[0]);
        var PERBYTEOVERHEAD = 1; //microsecond
        var node2invocations = {}, perInvocationTime = {};
        Object.keys(processedSignature).forEach((invoc)=>{
            var [n,count] = invoc.split("_count");
            if ( !(n in node2invocations) )
                node2invocations[n] = [];
            node2invocations[n].push(invoc);
        })

        topNodes.forEach((tN,ind)=>{
            var invocs = node2invocations[tN];
            if (!invocs){
                //the function never got instrumented for some reason
                return;
            }
            perInvocationTime[tN] = topNodeInfo[ind][2]*1000/invocs.length; //convert to microseconds
            invocs.forEach((i)=>{
                var sig = processedSignature[i];
                var sigSize = sig.reduce((acc, cur)=>{
                        var len =0; 
                        if (typeof cur[1] == "string")
                            len += cur[1].length
                        if (cur[2] && typeof cur[2] == "string")
                            len += cur[2].length;
                        return len + acc},0);
                var predictedTime = PERBYTEOVERHEAD*sigSize;
                if (predictedTime > perInvocationTime[tN]){
                    runTimePurged += perInvocationTime[tN];
                    delete processedSignature[i];
                }
            })
        })
    }

    var _constructCacheReadKey = function(signature){
        var readString = "";
        // var readKeys = Object.keys(signature).filter(e=>e.indexOf("reads")>=0);
        var readKeys = [...new Set(signature.filter(e=>e[0].indexOf("reads")>0).map(e=>e[0]))];

        var constructReadKey = function(root, readArr){
            var key = "[`", props=readArr[1].split(";;;;"), value = readArr[2];
            props.forEach((p, ind)=>{
                if (ind === 0) return;
                key += p + "`]";
                if (ind != props.length-1) key +="[`"
            })
            //Special case window read
            if (readArr[0].indexOf(readArr[1])>=0){
                return "JSON.stringify(" + root + key + ") == " + ((root + key).split("[`self")[0]);
            }
            return "JSON.stringify(" + root + key + ") == " + value;
        }

        readKeys.forEach((readType,ind) =>{
            var _type = readType.split("_")[0];
            var root = "";
            switch(_type){
                case "argument":
                    root = "arg";
                    break;
                case "closure":
                    root = "closure";
                    break;
                case "this":
                    root = "thisObj";
                    break;
                case "global":
                    root = "window";
                    break;
            }
            signature.filter(e=>e[0]==readType).forEach((readArr,ind)=>{
                var r = constructReadKey(root, readArr);
                readString += r + " && ";
            })

        })

        return readString + " true";
    }

    var constructCacheReadKey = function(){
        Object.keys(processedSignature).forEach((invocId)=>{
            if (invocId in nonCacheableNodes) return;
            processedSignature[invocId].push(["finalRead", _constructCacheReadKey(processedSignature[invocId])]);
        })
    }

    var combineMultiSigs = function(sig, keyMap){
        var prevSig = JSON.parse(localStorage.getItem("signature"));
        var prevKeyMap = JSON.parse(localStorage.getItem("keyMap"));

        Object.keys(prevSig).forEach((key)=>{
            sig[key] = prevSig[key];
        })
        Object.keys(prevKeyMap).forEach((key)=>{
            keyMap[key] = prevKeyMap[key];
        })

    }

    var createSigProcWorker = function(procSig){
        var WORKERLIMIT = 8, workerList = [], workloads = [], len=Object.keys(procSig).length;
        var workloadSize = Math.floor(len/WORKERLIMIT), workerId=1;
        if (!workloadSize) {
            workloadSize = len, WORKERLIMIT=1;
        }
        console.log("Preparing data for workers...");
        for (var i=0;i<WORKERLIMIT*workloadSize;i+=workloadSize){
            var _wl = {}, _wlkeys;
            if ( i + workloadSize < WORKERLIMIT*workloadSize)
                _wlkeys = Object.keys(procSig).slice(i,i+workloadSize);
            else _wlkeys = Object.keys(procSig).slice(i, len);
            _wlkeys.forEach((k)=>{
                _wl[k] = procSig[k];
            })
            workloads.push(_wl);
        
            var worker  = new Worker("http://goelayu4929.eecs.umich.edu:99/hostSrc/signatureWorker.js");
            worker.addEventListener('message', function(e){
                var _id = workerId++;
                console.log("Data processed by worker " + _id);
                Object.keys(e.data.keymap).forEach((k)=>{
                    keysToStdKeys[k] = e.data.keymap[k];
                })
                // keysToStdKeys = keysToStdKeys.concat(e.data.keymap);
                Object.keys(e.data.sig).forEach((k)=>{
                    cacheableSignature[k] = e.data.sig[k];
                })

                if (_id == WORKERLIMIT){

                    var cacheExists = localStorage.getItem("fnCacheExists");
                    if (cacheExists){
                        combineMultiSigs(cacheableSignature, keysToStdKeys);
                    }
                    //Store the signature in local storage
                    localStorage.setItem("signature", JSON.stringify(cacheableSignature));
                    //store the uniq keys map 
                    localStorage.setItem("keyMap", JSON.stringify(keysToStdKeys));
                    //store a small key to check whether a signature is available or not
                    localStorage.setItem("fnCacheExists",1);

                    //only the top window object should send the final alert
                    if (window.top == window)
                        console.log("Cache saved..");
                }
            })
            workerList.push(worker);
        }
        console.log("Data prepared, launching workers");
        workerList.forEach((w,i)=>{
            w.postMessage(workloads[i]);
        });


    }

    var storeSignature = function(){
        var strSignature = {};
        Object.keys(processedSignature).forEach((invocId)=>{
            if (invocId in nonCacheableNodes) return;
            processedSignature[invocId].IBF && (processedSignature[invocId].push(["IBF"].concat(processedSignature[invocId].IBF)) );
            (processedSignature[invocId].returnValue != null) && (processedSignature[invocId].push(["returnValue"].concat(processedSignature[invocId].returnValue)) );
            var strSig = JSON.stringify(processedSignature[invocId]);
            if (strSig && strSig instanceof Error) {
                nonCacheableNodes[invocId] = strSig.message;
                return;
            }
            else if (processedSignature[invocId] == "NonLeafNode") return;

            //convert the original signature in the string format, to do a memory comparison
            strSignature[invocId] = strSig;
            
        })

        createSigProcWorker(strSignature);

        // console.log(Object.keys(processedSignature).length + " coalesced into " + Object.keys(cacheableSignature).length);
    }

    this.storeSignature = storeSignature;

    this.processFinalSignature = processFinalSignature;

    // this.omni = omniStringifier;

    this.getKeysToStdKeys = function(){
        return keysToStdKeys;
    }

    this.getPMD = function(){
        return PMD;
    }

    this.getND = function(){
        return ND;
    }

    this.getCurRoot = function(){
        return curRoot;
    }

    this.addND = function(f){
        ND.push(f);
    }

    this.getRootInvocs = function(){
        return rootInvocs;
    }

    this.getRuntimePurged = function(){
        return runTimePurged;
    }

    this.getStoredSignature = function(){
        return cacheableSignature;
    }

    this.getInvocationToWrites = function(){
        return invocationToWrites;
    }

    var processInvocationProperties = function(){
        //Iterate processed signature instead of customLocalStorage object
        Object.keys(processedSignature).forEach((nodeId)=>{
            var propertyObj = processedSignature[nodeId];
            // if (!propertyObj.reads.length && !propertyObj.writes.length && !propertyObj.argProp) {
            //     // if (nodesByProperties.DOM.indexOf(nodeId)<0 && nodesByProperties.antiLocal.indexOf(nodeId)<0)
            //         nodesByProperties.NOGSNOARG.push(nodeId);
            // } else if ( (propertyObj.reads && propertyObj.reads.length) || ( propertyObj.writes && propertyObj.writes.length) ) {
            //     if (propertyObj.argProp && getFunctionStat(propertyObj.argProp) == "function")
            //         nodesByProperties.GS_f.push(nodeId);
            //     else nodesByProperties.GS.push(nodeId);
            // }
            // else {
            //     var argType = getFunctionStat(propertyObj.argProp);
            //     nodesByProperties.Function[argType].push(nodeId);
            // }
            if (nodesByProperties.antiLocal.indexOf(nodeId) < 0) {
                if (propertyObj.isFunction)
                    nodesByProperties.function.push(nodeId)
                else nodesByProperties.nonFunction.push(nodeId);
            }
        });
    }

    /* Proxy object handler */
    window.proxyReadCount =0; window.proxyWriteCount = 0;

    /*
    Declare your own inbuilt functions 
    so that your instrumentation, doesn't end up calling the 
    actual user defined code in cases when the user defined code
    has rewritten the in built functions 
    */

    window.__tracerEval = window.eval;
    window.__tracerParseInt = window.parseInt;
    window.__tracerParseFloat = window.parseFloat;
    window.__WeakMap = window.WeakMap;


    /*
    Rewrite inbuilt javascript APIs
    to support the use of proxy objects. 
    Since lots of objects are wrapped in proxy, 
    these objects can end up inside function calls outside my instrumented code 
    And therefore we need to rewrite these definitions 

    However, we don't need to rewrite these definitions during replay, when the page is
    replaying function signature from cache, since there are no proxy objects in memory

    */

    if (!pageLoaded) {


        function customShims(self){
            let _setProtoTypeof = Object.setPrototypeOf;
            self.Object.setPrototypeOf = function (obj, prototype) {
                if (prototype && prototype.__isProxy)
                    prototype = prototype.__target;
                return _setProtoTypeof(obj, prototype);
            }

            var _create = Object.create;
            self.Object.create = function(){
                var thisObj = this;
                for (var i=0;i<arguments.length;i++){
                    var arg = arguments[i];
                    if (arg && arg.__isProxy)
                        arguments[i] = arg.__target;
                }
                if (thisObj && thisObj.__isProxy)
                    thisObj = thisObj.__target;
                return _create.apply(thisObj,arguments);
            }

            var _encodeURI = window.encodeURI;
            self.window.encodeURI = function(uri){
                var _t;
                if (uri && (_t = uri.__target))
                    uri = _t;
                return _encodeURI.call(this, uri);
            }

            var _encodeURIComponent = window.encodeURIComponent;
            self.window.encodeURIComponent = function(uri){
                var _t;
                if (uri && (_t = uri.__target))
                    uri = _t;
                return _encodeURIComponent.call(this, uri);
            };

            var _getComputedStyle = window.getComputedStyle;
            self.window.getComputedStyle = function(){
                var thisObj = this;
                for (var i=0;i<arguments.length;i++){
                    var arg = arguments[i];
                    if (arg && arg.__isProxy)
                        arguments[i] = arg.__target;
                }
                if (thisObj && thisObj.__isProxy)
                    thisObj = thisObj.__target;
                return _getComputedStyle.apply(thisObj,arguments);
            };

            var _defineProperty = Object.defineProperty;
            self.Object.defineProperty = function(){
                for (var i=0;i<arguments.length;i++){
                    var arg = arguments[i];
                    if (arg && arg.value && arg.value.__isProxy)
                        arg.value = arg.value.__target;
                    if (arg && arg.__isProxy)
                        arguments[i] = arg.__target;
                }
                return _defineProperty.apply(this, arguments);
            }

            // var _toString = Object.prototype.toString;
            // self.Object.prototype.toString = function(){
            //     var thisObj = this;
            //     for (var i=0;i<arguments.length;i++){
            //         var arg = arguments[i];
            //         if (arg && arg.__isProxy)
            //             arguments[i] = arg.__target;
            //     }
            //     if (thisObj && thisObj.__isProxy)
            //         thisObj = thisObj.__target;
            //     return _toString.apply(thisObj,arguments);
            // }


            window.___ranCUSTOMSHIMS___ = true;
        };

        customShims(window);

        function getDomPath(el) {
            try {
                var stack = [];
                while ( el.parentNode != null ) {
                console.log(el.nodeName);
                var sibCount = 0;
                var sibIndex = 0;
                for ( var i = 0; i < el.parentNode.childNodes.length; i++ ) {
                    var sib = el.parentNode.childNodes[i];
                    if ( sib.nodeName == el.nodeName ) {
                    if ( sib === el ) {
                        sibIndex = sibCount;
                    }
                    sibCount++;
                    }
                }
                if ( el.__hasAttribute('id') && el.id != '' ) {
                    stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
                } else if ( sibCount > 1 ) {
                    stack.unshift(el.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');
                } else {
                    stack.unshift(el.nodeName.toLowerCase());
                }
                el = el.parentNode;
                }
            
                return stack.slice(1).join('>'); // removes the html element
            } catch (e){
                return '#'
            }
          }


        /*Creates shim for every dom methods
        The purpose of the shim is to check for proxy argument types*/
        function createShimForDOMMethods(self){
            var HTMLNames = [
                "HTMLDocument", "HTMLLinkElement", "HTMLElement", "HTMLHtmlElement", 
                "HTMLDivElement", "HTMLAnchorElement", "HTMLSelectElement", 
                "HTMLOptionElement", "HTMLInputElement", "HTMLHeadElement", 
                "HTMLSpanElement", "XULElement", "HTMLBodyElement", "HTMLTableElement", 
                "HTMLTableCellElement", "HTMLTextAreaElement", "HTMLScriptElement", 
                "HTMLAudioElement", "HTMLMediaElement", "HTMLParagraphElement", "DOMImplementation",
                "HTMLButtonElement", "HTMLLIElement", "HTMLUListElement", "HTMLIFrameElement",
                "HTMLFormElement", "HTMLHeadingElement", "HTMLImageElement", "IntersectionObserver",
                "HTMLStyleElement", "HTMLTableRowElement", "HTMLTableSectionElement", "PerformanceObserver",
                "HTMLBRElement","Node","EventTarget","HTMLCollection","MutationObserver","Document",
                "HTMLCanvasElement", "CanvasRenderingContext2D","CanvasGradient","CanvasPattern",
                "ImageBitMap","ImageData","TextMetrics","Path2D","CSSCounterStyleRule","Element","RegExp","Crypto","Object","Map",
                "MediaDevices","StorageManager","CacheStorage"
            ];

            HTMLNames.forEach((_class)=>{
                self[_class] && self[_class].prototype && Object.getOwnPropertyNames(self[_class].prototype).forEach((classKey)=>{
                    try {    
                         if (typeof self[_class].prototype[classKey] == "function") {
                            var origMethod = self[_class].prototype[classKey];
                            if (classKey == "constructor") return;
                            self[_class].prototype[classKey] = function(){
                                var thisObj = this;
                                for (var i=0;i<arguments.length;i++){
                                    var arg = arguments[i];
                                    if (arg && arg.__isProxy)
                                        arguments[i] = arg.__target;
                                }
                                if (thisObj && thisObj.__isProxy)
                                    thisObj = thisObj.__target;
                                /*If regex testing, return the original method*/
                                if ( (origMethod.name == "test" || origMethod.name =="exec") && arguments[0] && arguments[0].__isShimmed__)
                                    arguments[0] = arguments[0].__orig__;

                                // track DOM element and the corresponding class key
                                if (_shadowStackHead){
                                    var dompath = getDomPath(thisObj);
                                    if (dompath.length > 1)
                                        customLocalStorage[_shadowStackHead].DOMS.push([dompath, classKey, JSON.stringify(arguments)])
                                }
                                return origMethod.apply(thisObj,arguments);
                            };
                            self[_class].prototype[classKey].__isShimmed__ = true
                            self[_class].prototype[classKey].__orig__ = origMethod;
                            if (classKey == 'hasAttribute')
                                self[_class].prototype['__hasAttribute'] = origMethod;
                            
                         }
                    } catch (e){};
                });
            });
        };
        createShimForDOMMethods(window);

        this.createShimForDOMMethods = createShimForDOMMethods;
        this.customShims = customShims;

        // Since we are modifying content of scripts, if scripts have dynamically created integrity attribute
        // the script won't be fetch as the hash match would fail, therefore make the integrity field non writable
        Object.defineProperty(HTMLScriptElement.prototype, "integrity",{value:"", writable:false})

        if (Error.captureStackTrace){
            var _captureStackTrace = Error.captureStackTrace;
            Error.captureStackTrace = function(){
                var args = arguments;
                if (args[0] && args[0].__target)
                    args[0] = args[0].__target;
                if (args[1] && args[1].__target)
                    args[1] = args[1].__target;
                return _captureStackTrace.apply(this, args);
            }
        }

        var _xmlSend = XMLHttpRequest.prototype.send;
            // override the native send()
        XMLHttpRequest.prototype.send = function(){
            if (_shadowStackHead){
                nonCacheableNodes[_shadowStackHead] = "xml";
                // console.log("xml request sent from " + _shadowStackHead);
            }
            // call the native send()
            _xmlSend.apply(this, arguments);
        }

        var origSetTimeout = window.setTimeout;
        // window.setTimeout = function(){
        //     if (arguments.length > 1 && !isNaN(Number.parseFloat(arguments[1]))){
        //         if (arguments[1] === 0){
        //             arguments[1] = 500;
        //         }
        //         arguments[1] = arguments[1]*4;
        //     }
        //     var thisArg = this;
        //     if (this && this.__isProxy){
        //         thisArg = this.__target;
        //     }
        //     return origSetTimeout.apply(thisArg, arguments);
        // }


        /*
        This takes care of every inbuild api invocation where 
        the argument causes a different behavior due to the proxy wrapping
        for example: Object.prototype.toString.call(o);
        here if o is wrapped in proxy, it will always return object type 
        */

        /*Not sure why we need these call exceptions*/
        var callExceptions = [/*"hasOwnProperty","toString","toLocaleString","isPrototypeOf"*/];
        var origCall = Function.prototype.call;
        Function.prototype.call = function() {
            var _t,n = this.__isProxy ? this.__target.name : this.name;
            if (arguments[0] && arguments[0].__isProxy)
                arguments[0] = arguments[0].__target;
            return origCall.apply(this, arguments);
        }
    } else {
        /*
        Even if the page is not loaded, increase the setTimeout value
        This is specially useful for the callgraph generation, where every function is instrumented
        Not needed anymore, since callgraph generation only uses tentative leaf nodes now

        */
        // var origSetTimeout = window.setTimeout;
        // window.setTimeout = function(){
        //     if (arguments.length > 1 && !isNaN(Number.parseFloat(arguments[1]))){
        //         if (arguments[1] === 0){
        //             arguments[1] = 500;
        //         }
        //         arguments[1] = arguments[1]*4;
        //     }
        //     return origSetTimeout.apply(this, arguments);
        // }
    }

    /*Create shim for performance entries so that all the other timers values are not returned*/

    // var _pGetEntries = window.performance.getEntries;
    // window.performance.getEntries = function() {
    //     var entries = _pGetEntries.apply(this, arguments);
    //     var relevantEntries = entries.filter(e=>e.name.indexOf("_count")<0);
    //     return relevantEntries;
    // }

    // var _pGetEntriesByType = window.performance.getEntriesByType;
    // window.performance.getEntriesByType = function(type){
    //     var entries = _pGetEntriesByType.apply(this, arguments);
    //     var relevantEntries = entries.filter(e=>e.name.indexOf("_count")<0);
    //     return relevantEntries;
    // }

    this.isPageLoaded = function(){
            return pageLoaded;
    }

    // use hacks to detect if a method is a DOM object or not 
    // as sometimes even document objets are not instances of these parent objects
    // for reasons unknown
    // Despite window satisfying this criteria have this function return false for window
    // object specifically
    // Sometimes Node instances like character data or other nodes don't satisfy the instanceof check
    // therefore use specific methods like click and appendata
    var isDOMInheritedProperty = function(method){
        return method && (method instanceof EventTarget || method instanceof HTMLCollection || method instanceof NodeList || method.readState
            || method.click || method.appendData) &&  !(method instanceof HTMLDocument) /*&& (method && method.self != method)*/
    }

    /*Proxyobj is either a proxy object, or the window object when the this refers to window*/
    var handlePropagatedProxy = function(proxyObj,argInd, transferState, stackHead){
        var state = proxyObj.__isProxy || "global";
        var parentNodeId = proxyObj.__debug, proxyMap;
        switch (state) {
            case "argument" : 
                proxyMap = invocationToArgProxy; break;
            case "global" :
                proxyMap = globalProxyHandler; break;
            case "this" :
                proxyMap = invocationToThisProxy; break;
            case "closure":
                proxyMap = invocationToClosureProxy; break;
        }
        var proxyPrivates = state == "global" ? globalProxyHandler : proxyMap[parentNodeId];
        if (!proxyPrivates) {
            /*Maybe the parent exists in different iframe*/
            nonCacheableNodes[parentNodeId] = "propagation error | can't store metadata"
            return;
        }
        var objId = proxyObj.__target != null ? proxyPrivates.accessToPrivates().getObjectId(proxyObj.__target) : [0]
        if (objId == null){
            console.error("Error while trying to propagate object from " + stackHead + " to " + parentNodeId);
            nonCacheableNodes[parentNodeId] = "propagation error | can't store metadata"
        }
        PMD[stackHead][transferState].push([argInd,objId[0],state]) // transferState(arguments or this) -> [objId of parent Object, argInd in case the object was passed as a specific index, state (which parent state it belonged to)]
    }

    // closure_id is only applicable when the type is closure
    var proxyEncapsulation =  function(rootObject, type, closure_id) {

        var ObjectTree = {};
        var objectIdCounter = 1;
        var methodToProxy = new window.__WeakMap();
        var proxyToMethod = new window.__WeakMap();
        var ObjectToId = new window.__WeakMap();
        var idToObject = {};
        var objectToPath;
        var parentFunctionId = null;
        var rootType = type;
        if (rootType == "argument" || rootType == "this" || rootType == "closure")
            parentFunctionId = _shadowStackHead;
        /* Initialize the object tree with window as the root object*/
        ObjectToId.set(rootObject,0);
        idToObject[0] = rootObject;
        ObjectTree[0] = {};

        var closureScope;
        if (type == "closure"){
            closureScope = `closure_${closure_id}`;
        }

        var appendObjectTree = function(rootId, key, childId){
            var _edge = ObjectTree[rootId];
            if (typeof key == "symbol")
                var ekey = "e_" + key.toString();
            else var ekey = "e_" + key;
            if (_edge) {
                if (!_edge[ekey])
                    _edge[ekey] = [];
                if (_edge[ekey].indexOf(childId)<0)
                    _edge[ekey].push(childId);
            }
            else {
                ObjectTree[rootId]  = {};
                var edge = ObjectTree[rootId];
                edge[ekey] = [];
                edge[ekey].push(childId);
            }
        }

        var stateAlreadyLogged = function(nodeId, logTup, logType){
            var otherLogType = logType.indexOf("reads")>=0 ? rootType+"_writes" : rootType +"_reads";
            var stateLogged = false;
            if (logType.indexOf("reads")>=0){
                //Test whether the value read is written inside the current function itself
                if (customLocalStorage[nodeId][otherLogType]) {
                    customLocalStorage[nodeId][otherLogType].forEach((el)=>{
                        if (el[0] == logTup[0] && el[1] == logTup[1])
                            stateLogged = true;
                    });
                    if (stateLogged) return stateLogged;
                }
            }

            customLocalStorage[nodeId][logType].forEach((tupEntry)=>{
                if (JSON.stringify(tupEntry) == JSON.stringify(logTup))
                    stateLogged = true;
            })
            return stateLogged;
        }

        var hasObjectId = function(obj){
            return ObjectToId.get(obj);
        }

        var getObjectId = function(obj){
            if (obj.__isClosureObj){
                return [0, false];
            }
            var rootId = ObjectToId.get(obj);
            if (rootId != null) return [rootId, false];
            rootId = objectIdCounter;
            objectIdCounter++;
            ObjectToId.set(obj, rootId);
            idToObject[rootId] =  obj;
            return [rootId,true];
        }

        var redundantStateConsumed = ["__isProxy", "top", "parent","toString","toJSON"];

        var loggerFunction = function(target, key, value, logType){
            var retCode = 0;

            var nodeId = _shadowStackHead ? _shadowStackHead : null;
            
            var state = logType.split("_")[1] == "reads"  ? "read" : "write";
            if ( (!nodeId && logType.indexOf("global")<0 ) || (nodeId && 
                nonCacheableNodes[nodeId]) ) 
                return 1;

            var rootId = getObjectId(target)[0];

            if (state == "read"){
                if (value && value.__isProxy)
                    value = value.__target;
            }

            // if (logType.indexOf("argument")>=0 || logType.indexOf("this")>=0 || logType.indexOf("closure")>=0)
            //     nodeId = parentFunctionId;

            //This check implies that the function where the proxy is being accessed
            // is different from where it was created
            // therefore, add the log in both function signatures
            var currentObjectTree = null;
            var remoteLogType = "";
            // if (_shadowStackHead != nodeId) {
            //     // console.error("shadow stack head doesn't point to proxy creating head");
            //     //Check how in the current function, it is being accessed: as closure,argument, or this
            //     if ( invocationToArgProxy[_shadowStackHead] ){
            //         var remotePrivates = invocationToArgProxy[_shadowStackHead].accessToPrivates();
            //         if (remotePrivates.hasObjectId(target)) {
            //             currentObjectTree = remotePrivates.getObjectId;
            //             var remoteRootId = currentObjectTree(target);
            //             remoteLogType += "argument_" + logType.split('_')[1];
            //         }
            //     } 
            //     if (!currentObjectTree && invocationToClosureProxy[_shadowStackHead]) {
            //         var remotePrivates = invocationToClosureProxy[_shadowStackHead].accessToPrivates();
            //         if (remotePrivates.hasObjectId(target)) {
            //             currentObjectTree = remotePrivates.getObjectId;
            //             var remoteRootId = currentObjectTree(target);
            //             remoteLogType += "closure_" + logType.split('_')[1];
            //         }
            //     }
            //     if (!currentObjectTree && invocationToThisProxy[_shadowStackHead]){
            //         var remotePrivates = invocationToThisProxy[_shadowStackHead].accessToPrivates();
            //         if (remotePrivates.hasObjectId(target)) {
            //             currentObjectTree = remotePrivates.getObjectId;
            //             var remoteRootId = currentObjectTree(target);
            //             remoteLogType += "this_" + logType.split('_')[1];
            //         }
            //     }
            // }
            
            var childId, childLogStr;
            if ((value instanceof Object) || (typeof value == "object" && value != null) || typeof value == "function") {
                var _childId = getObjectId(value);
                childId = _childId[0];
            
                // Only add to tree if the value is type object and it is a new object
                _childId[1] && appendObjectTree(rootId, key, childId);
                // if (currentObjectTree) {
                //     var remoteChildId = currentObjectTree(value);
                //     remotePrivates.appendObjectTree(remoteRootId, key, remoteChildId);
                // }

                if ( (logType.indexOf("reads")>=0) && typeof value != "function") {
                    childLogStr = childId;
                } 

                if (state == "write"){
                    if (_shadowStackHead && (!value || !value.__isProxy)){
                        if (!invocationToWrites[_shadowStackHead])
                            invocationToWrites[_shadowStackHead] = []
                        invocationToWrites[_shadowStackHead].push(["broken-reference", childId ]);
                    }
                }
            }

            if (redundantStateConsumed.indexOf(key)>=0 || typeof key == "symbol")
                return 0;

            //HACK
            if (state == "write" && logType.indexOf("argument")>=0 && rootId === 0 
                && value === null)
                return;

               
            // The only time when not having a nodeId is allowed, is when the logger function is closed for a 
            // global read or write. However since the nodeId is not there, we won't be adding to any signature
            //only appending the object in the tree. 
            //update: reads are important even when the value is undefined
            if (!nodeId ||  (_shadowStackHead != nodeId)) return 0;

            //if the value is the window object itself, log a special signature
            if (value && value.self == value) {
                customLocalStorage[nodeId].push([logType, rootId, key, childLogStr,0 ]);
                return 0;
            }

            // if (customLocalStorage[nodeId].length > sigSizeLimit){
            //     nonCacheableNodes[nodeId] = "signature size exceeds limit";
            // }

            // if (childLogStr == null) {

            //     childLogStr = stringifier.stringify(value,state,1);
            //     if (childLogStr && childLogStr instanceof Error){
            //         nonCacheableNodes[nodeId] = childLogStr.message;
            //         // _shadowStackHead = null;
            //         return 1;
            
            //      } //else if (!childLogStr && logType.indexOf("reads")>=0 && childLogStr != "")
            //         // childLogStr = "void 0";
            // }


            // Doesn't make sense to log function reads, as I currently don't have a correct way of stringifying them
            if (!customLocalStorage[nodeId][logType])
                customLocalStorage[nodeId][logType]=[];
            if (logType.indexOf("reads")>=0) {
                if (logType.indexOf('closure')>=0)
                    logType = `${closureScope}_reads`;
                var log = [logType, rootId, key, childLogStr,childId ];
                // customLocalStorage[nodeId].readKeys.add(logType);
                customLocalStorage[nodeId].push(log);
                // customLocalStorage[nodeId][logType].push(log);
            } else { 
                if (logType.indexOf('closure')>=0)
                    logType = `${closureScope}_writes`;
                // customLocalStorage[nodeId].writeKeys.add(logType);
                var log = [logType, rootId, key, childLogStr ];
                customLocalStorage[nodeId].push(log);
                // customLocalStorage[nodeId][logType].push(log);
                // if (customLocalStorage[nodeId].filter(e=>e[0].indexOf("reads")>=0 && e[3] === rootId).length)
                //     freezeReadState(nodeId);
            }
            return 0;
        }
            

        var _handleSymbolKey = function(target, key){
            if (!Reflect.get(target, key)){
                switch (key.toString()){
                    case 'Symbol(Symbol.toPrimitive)':
                        if (+target) return +target;
                        if (''+target) return ''+target;
                }
            }
        }

        var handleNonConfigurableProperty = function(target, key){
            var method = Reflect.get(target,key);
            // if (typeof method == "function")
            //     method = method.bind
            // if (_shadowStackHead)
            //     nonCacheableNodes[_shadowStackHead] = "non-configurable;" + key;
             return method;
        } 

        var handleMetaProperties = function(target, key){
            switch(key){
                case 'apply' :
                    return Reflect.get(target, key);
                    break;
                case 'call':
                    return Reflect.get(target, key);
                    break;
                case 'bind':
                    return Reflect.get(target, key);
                    break;            
            }
        }

        /*You can set the prototype of an object, there fore you need to track changes to prototype*/
        var outOfScopeProperties = [/*"location", "body", */"Promise", "top", "parent", "__proto__", "self",
        "getRegistration","digest", "query","getBattery"];

        var specialSetKets = ["prototype", "constructor","__proto__"];

        var applyTargetSpcl = ["RegExp", "DOMTokenList", "Performance", "CSSStyleDeclaration" ,"FontFace","Storage","String"];

        var nonConfigurableOnly = ["window"];

        var isWindow = function(obj,cors){
            if (obj && obj.self == obj){
                try{
                    if (obj.__isProxy) return obj;
                    var proxyPrivates = globalProxyHandler.accessToPrivates();
                    var _proxyMethod = proxyPrivates.methodToProxy.get(obj);
                    if (_proxyMethod) return _proxyMethod;
                    var proxyMethod = new Proxy(obj, handler);
                    proxyPrivates.methodToProxy.set(obj, proxyMethod);
                    return proxyMethod;
                } catch (e){
                    cors.v = true;
                    return obj;
                }
            }
        }

        // function isArguments( item ) {
        //     if (item && item.__isProxy)
        //         item = item.__target;
        //     return Object.prototype.toString.call( item ) === '[object Arguments]';
        // }

        function isArguments(thisArg, target){
            if (thisArg && thisArg.__target)
                thisArg = thisArg.__target;

            if (!thisArg.length) return false;


            return Array.from(thisArg).indexOf(target)>=0;
        }

        var handler = {
          get(target, key, receiver) {

            if (key == "__isProxy") return rootType;
            if (key == "__target") return target;
            if (key == "__debug") return parentFunctionId;
            if (key == "__isClosureObj") return target[key];

            var method = Reflect.get(target,key);

            /*Overwrites the custom toJson implementation, which might be doing something else
            instead of simply returning the original object*/
            if (key == "toJSON") return method;

            if (outOfScopeProperties.includes(key)) return method;
            var desc = customMethods.getOwnPropertyDescriptor(target, key);
            if (desc && desc.configurable == false && desc.writable == false/*&& nonConfigurableOnly.indexOf(key)>=0*/) {
                return handleNonConfigurableProperty(target, key);
            }
            var isWinObj,cors={};
            // if (isWinObj = isWindow(method,cors)){
            //     // if (!cors.v) loggerFunction(target, key, method, rootType+"_reads");
            //     return isWinObj;
            // }

            _ret = loggerFunction(target, key, method, rootType + "_reads");

            if (method && method.__isProxy) {
                // if (rootType == "global" || method.__isProxy == "global") 
                //     return method;

                // method = method.__target;
                // Sometimes the toString method doesn't exist on certain objects
                if (Object.prototype.toString.call(target).indexOf("Arguments")>=0 && _shadowStackHead)
                    handlePropagatedProxy(method,key, "argument",_shadowStackHead)
                method = method.__target
                //     return method;
                //     var actualMethod = method.__target;
                //     var childId = getObjectId(actualMethod);
                //     appendObjectTree(0, key, childId, ObjectTree);
                // } else if (target.__isClosureProxy) {
                //     var actualMethod = method.__target;
                //     var childId = getObjectId(actualMethod);
                //     appendObjectTree(0, key, childId, ObjectTree);
                
                // return method;
            }
            /* If method type if function, don't wrap in proxy for now */
            if (method && (typeof method === 'object' || typeof method=== "function") && !outOfScopeProperties.includes(key) ) {
              if (isDOMInheritedProperty(method)){
                // if (_shadowStackHead)
                //     nonCacheableNodes[_shadowStackHead] = "DOM";
                // return method;
              }
              var desc = customMethods.getOwnPropertyDescriptor(target, key);
              if (desc && ! desc.configurable && !desc.writable) return handleNonConfigurableProperty(target, key);
              window.proxyReadCount++;
              // if (window.proxyReadCount % 1000000 == 0)
              //   alert("window.Proxyreadcount is " + window.proxyReadCount);
              // if (typeof method == "function") {
              //   var _method = method._bind(target);
              //   Object.setPrototypeOf(_method, method);
              //   if (!isNative(method))
              //       Object.assign(_method, method);
              //   return new Proxy(_method,);
              // }
              /*
              The following check is kind of inconsequental, cause even if you have a proxy around the method call or apply, the apply handler 
              will be anyway called
              */
              if (key == "apply" || key == "call") return method;
              // console.log("Calling get of " + key + " and setting this to ");
              // console.log(target);
              var _proxyMethod = methodToProxy.get(method);
              if (_proxyMethod) return _proxyMethod;
              // var proxyHandler = rootType == "global"  ? handler : _shadowStackHead ? invocationToProxy[_shadowStackHead][1] : handler;
              var proxyMethod = new Proxy(method, handler);
              methodToProxy.set(method, proxyMethod);
              return proxyMethod;
            } else {
              return method;
            }
          },
          set (target, key, value, receiver) {
            var cors={}, method;
            if (!isWindow(value,cors))
                loggerFunction(target, key, value,rootType + "_writes");
            window.proxyWriteCount++;
            if (specialSetKets.indexOf(key)>=0 && value && value.__isProxy){
                value = value.__target;
                return Reflect.set(target, key, value);
            }
            /*The final value set should always be the actual value*/
            if (value && value.__isProxy)
                value = value.__target;
            /*if rewriting closure object, rewrite the underlying object as well*/
            if (target.__isClosureObj){
                var setter = "set_"+key;
                target[setter](value);
            }
            return Reflect.set(target, key, value);
          },

          /*
          Let p be a proxy object. The following event handler will be called :
           - if p if a function itself, p(arg) : target -> p, thisArg -> window, args = args
           - if you do p.call or p.apply, first you go inside the get handler, read the value, and then go inside the apply handler

           We need function calls to be wrapped in proxy so that the thisArg can be properly handled. 
           if target.name exists, then simply call the target using thisArg[target](...args) // Doesn't work because target.name might not a property of thisArg, 
           otherwise follow the already implemented routine
          */

          apply (target, thisArg, args) {
                /*
                    If no thisArg, call it in the context of window ( this happens by default )
                    If the thisArg is a proxy object however it has no corresponding target method, call apply on the proxy object itself.
                    If the thisArg is not a proxy object, call the method on the thisArg itself. 
                */

                // if (thisArg && (thisArg.__isClosureObj || isArguments(thisArg) ))
                //     thisArg = window
                // TODO
                // only remove proxies if the target is an inbuilt function
                // cause otherwise the propagation metadata would be incorrect
                if (args.length){
                        args.forEach((arg,_i)=>{
                            if (arg && arg.__isProxy)
                                args[_i] = arg.__target;
                        })
                }

                // if (target && target.name && thisArg[target.name])
                //     return thisArg[target.name](...args);

                if (thisArg && thisArg.__proto__ && ((thisArg.__proto__.constructor && 
                    applyTargetSpcl.indexOf(thisArg.__proto__.constructor.name)>=0) ||
                     thisArg.__target && thisArg.self == thisArg.__target) ){
                    // if (args.length){
                    //     args.forEach((arg,_i)=>{
                    //         if (arg && arg.__isProxy)
                    //             args[_i] = arg.__target;
                    //     })
                    // }
                    if (thisArg && thisArg.__target)
                        thisArg = thisArg.__target;
                }

                if (Reflect.apply.__isProxy)
                    Reflect.apply = Reflect.apply.__target;

                /*If target is indexed inside arguments, that means arguments was set as the 
                thisObj due to instrumentation*/
                if (thisArg && (thisArg.__isClosureObj ))
                    thisArg = window

                /*Try catch can't catch certain errors, handle separately
                - thisArg of type permissions*/
                /*Permissions object*/
                if (thisArg && thisArg.__isProxy && thisArg.query)
                    thisArg = thisArg.__target;
                if (thisArg && thisArg.__isProxy && thisArg.getRegistration)
                    thisArg = thisArg.__target;
                if (thisArg && thisArg.__isProxy && thisArg.getBattery)
                    thisArg = thisArg.__target;
                if (thisArg && thisArg.__isProxy && thisArg.digest)
                    thisArg = thisArg.__target;

                if ( (target.name == "valueOf"  || target.name == "toString"  || 
                    target == Function.prototype.toString) && thisArg && thisArg.__target)
                    thisArg = thisArg.__target;

                try {
                    return Reflect.apply(target, thisArg, args);
                } catch (e){
                    if (thisArg && thisArg.__target)
                        return Reflect.apply(target, thisArg.__target, args);
                    throw e;
                }
          },
          construct (target, args, newPrototype) {
              if (newPrototype && newPrototype.__target)
                newPrototype = newPrototype.__target;
              return Reflect.construct(target, args, newPrototype);
          },
          setPrototypeOf (target, prototype) {
            if (prototype && prototype.__isProxy)
                prototype = prototype.__target;
            return Reflect.setPrototypeOf(target, prototype);
          },
          getPrototypeOf (target) {
            return Reflect.getPrototypeOf(target);
          },
          // getOwnPropertyDescriptor (target, propertyKey) {
          //   var r =  Reflect.getOwnPropertyDescriptor(target, propertyKey);
          //   loggerFunction(target, propertyKey, r, rootType + "_reads");
          //   return r;
          // },
          ownKeys (target) {
            return Reflect.ownKeys(target)
          },
          has (target, propertyKey) {
            return Reflect.has(target, propertyKey);
          },
          isExtensible (target) {
            return Reflect.isExtensible(target)
          },
          defineProperty (target, propertyKey, attributes) {
            if (attributes && attributes.__isProxy)
                attributes = attributes.__target;
            return Reflect.defineProperty(target, propertyKey, attributes);
          },
          deleteProperty (target, propertyKey) {
            return Reflect.deleteProperty(target, propertyKey);
          },
          preventExtensions (target) {
            return  Reflect.preventExtensions(target);
          },
          accessToPrivates (){
            return {ObjectTree: ObjectTree,getObjectId:getObjectId, appendObjectTree:appendObjectTree, hasObjectId:hasObjectId,
                    methodToProxy:methodToProxy, idToObject: idToObject}
          },

          getProcessedSignature (){
            var sigProcessor = new SignatureProcessor();
            sigProcessor.process();
            sigProcessor.postProcess();

            // // //Commenting out signature propogation for now
            // // //TODO
            sigProcessor.signaturePropogate();
            return sigProcessor.processedSig;
          }

        }

        return handler;
    }

    var globalProxyHandler = proxyEncapsulation(window,"global");

    var {proxy, revoke} = Proxy.revocable(window, globalProxyHandler);
    // Flag to disable proxy
    window.__tracerPROXY = proxy;
    // window.{proxyName} = window;
    globalProxyHandler.accessToPrivates().methodToProxy.set(window, proxy);

    if (pageLoaded){
        window.__tracerPROXY = window;
    }

    this.getShadowStackHead = function(){
        return _shadowStackHead;
    }

    this.getNonCacheableFunctions = function() {
        // return Array.from(new Set(nonCacheableNodes));
        return nonCacheableNodes;
    }

    this.getCallGraph = function() {
        return callGraph;
    }

    this.getParentNodes = function(){
        return parentNodes;
    }

    this.getNonLeafNodes=function(){
        return nonLeafNodes;
    }

    this.getDC = function(){
        return domCounter;
    }

    this.updateDC = function(){
        domCounter++;
    }
    this.getInvocationProperties = function() {
        return nodesByProperties;
    }

    this.getTimingInfo = function(){
        return timingInfo;
    }

    this.getSigSizes = function(){
        return sigSizes;
    }
    
    this.setMutationContext = function(command, nodeId) {
        currentMutationContext = nodeId;
    }

	this.setGlobal = function (gthis) {
		globalThis = gthis;
	}

    this.getFunctions = function () {
        return functions;
    }

    this.getInvocations = function() {
        return invocationList;
    }

    this.getCacheStats = function () {
        return cacheStats;
    }

    this.getCustomCache = function() {
        return customLocalStorage;
    }

    this.getProcessedSignature = function() {
        return processedSignature;
    }

    this.setCustomCache = function(customCache) {
        this.customLocalStorage = customCache;
    }

    this.getObjectTree = function(){
        return ObjectTree;
    }

    this.getObjectToPath = function() {
        return objectToPath;
    }

    this.getObjectToId = function(){
        return ObjectToId;
    }

    var accumulateCache = function(nodeId) {
        var aggrCache = {};
        var lCallees = calleeMap[nodeId];

        var traverseChildren = function(nodeId) {
            var lCallees = calleeMap[nodeId];
            if (lCallees) {
                lCallees.forEach(function(callee){
                    
                });
            }
        }
    }

    this.handleProtoAssignments = function(targetPrototype) {
        if (pageLoaded) return targetPrototype;
        if (targetPrototype && targetPrototype.__isProxy)
            return targetPrototype.__target;
        else return targetPrototype;
    }

    this.handleAssignments = function(assignment, assignee){
        return assignee;
    }

    this.handleTypeOf = function(obj){
        if (pageLoaded || _shadowStackHead in nonCacheableNodes)  return obj;
        var state,proxyMap,readInd, type;
        // return type;
        if (!pageLoaded && _shadowStackHead && obj && (state = obj.__isProxy)){
            switch (state) {
                case "argument" : 
                    proxyMap = invocationToArgProxy; break;
                case "global" :
                    proxyMap = globalProxyHandler; break;
                case "this" :
                    proxyMap = invocationToThisProxy; break;
                case "closure":
                    proxyMap = invocationToClosureProxy; break;
            };
            var proxyPrivates = state == "global" ? globalProxyHandler : proxyMap[_shadowStackHead];
            if (!proxyPrivates) return obj;
            var objId = proxyPrivates.accessToPrivates().getObjectId(obj.__target);
            // if (objId[1]) throw new Error("typeof argument has no object id");
            if (objId[1]) return obj;
            type = typeof obj;
            customLocalStorage[_shadowStackHead].push([state+"_reads",objId[0], "typeof", type, type]);
            // if ( (readInd = customLocalStorage[_shadowStackHead].findIndex(e=>e[3]===objId[0])) >= 0)
                // customLocalStorage[_shadowStackHead].splice(readInd,1);

            return obj;
        }
        return obj;
    }

    this.handleComparison = function(obj, operator, value){
        if (pageLoaded || _shadowStackHead in nonCacheableNodes) return obj;
        var state, proxymap, type, readInd,cmpDelim = ";&;";
        if (_shadowStackHead && obj && (state = obj.__isProxy)){
            switch (state) {
                case "argument" : 
                    proxyMap = invocationToArgProxy; break;
                case "global" :
                    proxyMap = globalProxyHandler; break;
                case "this" :
                    proxyMap = invocationToThisProxy; break;
                case "closure":
                    proxyMap = invocationToClosureProxy; break;
            };
            var proxyPrivates = state == "global" ? globalProxyHandler : proxyMap[_shadowStackHead];
            if (!proxyPrivates) return obj;
            var objId = proxyPrivates.accessToPrivates().getObjectId(obj.__target);
            if (objId[1]) return obj;

            var result;
            switch (operator){
                case "==": result = obj == value; break;
                case "===": result = obj === value; break;
                case "!=": result = obj != value; break;
                case "!==": result = obj !== value; break;
                case "instanceof": obj = target instanceof value; break;
                case "in": result = obj in value; break;
            }
            customLocalStorage[_shadowStackHead].push([state+"_reads",objId[0], operator+cmpDelim+result, value, value]);
            // if ( (readInd = customLocalStorage[_shadowStackHead].findIndex(e=>e[3]===objId[0])) >= 0)
            //     customLocalStorage[_shadowStackHead].splice(readInd,1);

            if (obj && obj.__isProxy) return obj.__target;
            else return obj;
        }
        if (obj && obj.__isProxy) return obj.__target;
        else return obj;
    }

    this.traversePath = function(path,params){
        var param,
            pathDelim = ";;;;";
        var state = path.split(pathDelim)[0],proxyMap;
            switch (state) {
                case "argument" : 
                    param = params[0];break;
                case "global" :
                     param = window; break;
                case "this" :
                     param = params[2]; break;
                case "closure":
                    param = params[1];break;
            }
        path.split(pathDelim).forEach((prop, ind)=>{
            if (ind === 0) return;
            var len = path.split(pathDelim).length;
            if (param)
                param = param[prop];
        })
        return param;
    }

    this.getIdFromProxy = function(obj){
        if (pageLoaded) return null;
        var state, proxyMap;
        if (state = obj.__isProxy){
            switch (state) {
                case "argument" : 
                    proxyMap = invocationToArgProxy; break;
                case "global" :
                    proxyMap = globalProxyHandler; break;
                case "this" :
                    proxyMap = invocationToThisProxy; break;
                case "closure":
                    proxyMap = invocationToClosureProxy; break;
            };
            var proxyPrivates = state == "global" ? globalProxyHandler : proxyMap[_shadowStackHead];
            if (!proxyPrivates) return;
            var objId = proxyPrivates.accessToPrivates().getObjectId(obj.__target);
            if (objId[1]) return null;

            return objId[0];
        }
    }

    this.getPathFromProxyId = function(id,state,nodeId){
        var proxyMap;
        switch (state) {
            case "argument" : 
                proxyMap = invocationToArgProxy; break;
            case "global" :
                proxyMap = globalProxyHandler; break;
            case "this" :
                proxyMap = invocationToThisProxy; break;
            case "closure":
                proxyMap = invocationToClosureProxy; break;
        };
        var proxyPrivates = state == "global" ? globalProxyHandler : proxyMap[nodeId];
        var objectTree = proxyPrivates.accessToPrivates().ObjectTree;
        var objectToPath = {0:state};

        var constructPath = function(objectId){
            if (objectToPath[objectId]) return objectToPath[objectId];
            var path = "",  pathDelim = ";;;;";
            for (var nodeId in objectTree){
                for (var edge in objectTree[nodeId]) {
                    var _id = objectTree[nodeId][edge].indexOf(parseInt(objectId));
                    if (_id>=0) {
                        var parentPath = constructPath(nodeId);
                        path = parentPath + pathDelim + edge.substr(2);
                        objectToPath[objectId] = path;
                        return path;
                    }
                }
            }
            return path;
        }
        return constructPath(id);
    }

    this.handleProxyComparisons = function(...rhs){
        if (!rhs[0]) return rhs[0];
        if (rhs.length > 1 ) return rhs[rhs.length - 1];
        else if (rhs[0] && rhs[0].__isProxy) return rhs[0].__target;
        else return rhs[0];
    }

    this.isProxy = function(obj){
        if (pageLoaded) return obj;
        try {
            if (!obj || (typeof obj != "function" && typeof obj !="object")) return obj;
            if (obj.__isProxy) return obj.__target
            else return obj;
        } catch (e){
            return obj;
        } 
    }

    this.logWrite = function(functionIdentifier, rhs, variableName, listOfProperties ){
        var key = variableName;
        if (listOfProperties.length > 0)
            key = _patchLogString(variableName, listOfProperties);
        customLocalStorage[functionIdentifier]["writes"][key] = rhs;
        return rhs;
    }

    var _patchLogString = function(input, varArray){
        var count = 0;
        var output = input.replace(/(\[).(\])/g, function(match, g1, g2, offset, string){
            var replaceString = varArray[count]
            if (typeof varArray[count] == "symbol")
                replaceString = varArray[count].toString();
            count++;
            return g1 + replaceString + g2;
        });
        return output
    }

    this.logRead = function(functionIdentifier, readArray, listOfProperties){
        var key = readArray[0]
        if (listOfProperties.length > 0)
            key = _patchLogString(readArray[0],listOfProperties)
        customLocalStorage[functionIdentifier]["reads"][key] = readArray[1];
        return readArray[1];
    }

    this.logThrowStatement = function(throwArg){
        var cacheIndex = _shadowStackHead ? _shadowStackHead : null;
        if (pageLoaded || !cacheIndex || nonCacheableNodes[cacheIndex]) return throwArg;
        var evalArg="";
        if (throwArg instanceof Error){
            evalArg += "new Error(" + JSON.stringify(escapeRegExp(throwArg.message)) + ")";
        } else evalArg = throwArg;
        var throwString = "throw " + evalArg;
        customLocalStorage[cacheIndex]["IBF"] += "\n" + throwString + "\n";
        return throwArg;
    }

    var cleanUpReturnValue = function(ret,ind, seenObjs){
        try {
            switch (typeof ret) {
                case "object" :
                    if (!ret || seenObjs.indexOf(ret)>=0)
                        return;
                    /*check for window object*/
                    if (ret && ret.self == ret)
                        return;
                    if (ind === -1) {
                        seenObjs.push(ret);
                    } else {
                        if (!ret[ind] || ret[ind].self == ret[ind]){
                            return;
                        }
                        else if (ret[ind].__isProxy)
                            ret[ind] = ret[ind].__target;
                        seenObjs.push(ret[ind]);
                        ret = ret[ind];
                    }
                        if (Array.isArray(ret)){
                        for (var _i = 0, _len = ret.length; _i < _len; _i++) {
                            cleanUpReturnValue(ret,_i, seenObjs);
                        }
                    } else {
                        /*o.keys returns enumerable properties only
                        not sure if we need to rewrite non enumerable properties as well*/
                        var propNames = Object.keys(ret);
                        for (var k of propNames ){
                            cleanUpReturnValue(ret,k, seenObjs);
                        }
                    }
                    break;
                case "function":
                    if (ind === -1) {
                    } else if (ret[ind] && ret[ind].__isProxy)
                        ret[ind] = ret[ind].__target;
                default: break;
            }
            return;
        } catch (e){
            return;
        }
    }

    this.logReturnValue = function(functionIdentifier, returnValue, params) {
        var cacheIndex = functionIdentifier + "_count" + invocationsIndName[functionIdentifier];
        var cacheIndex = _shadowStackHead ? _shadowStackHead : null;
        if (pageLoaded || !cacheIndex || nonCacheableNodes[cacheIndex]) return returnValue;
        // if (isDOMInheritedProperty(returnValue)){
        //     nonCacheableNodes[cacheIndex] = "DOM";
        //     //Don't need to reset shadow stack head as the exit function is already called
        //     // hence the shadow stack head no longer points to the current function
        //     // _shadowStackHead = null;
        //     // this.exitFunction(functionIdentifier, params);
        //     return returnValue;
        // }
        // return returnValue;
        // var _retString = omniStringifier.stringify(returnValue,"read",2);
        // if (_retString && _retString instanceof Error) {
        //         nonCacheableNodes[cacheIndex] = _retString.message;
        // }
        // /*If the return value couldn't be stringified, doesn't matter. The function is marked as uncacheable anyway*/
        // if (customLocalStorage[cacheIndex]) customLocalStorage[cacheIndex]["returnValue"] = _retString;

        var seenObjs = [];
        if (returnValue && returnValue.__isProxy)
            returnValue = returnValue.__target;
        return cleanUpReturnValue(returnValue, -1,seenObjs), returnValue;
    }

    var logNonProxyParams = function(nodeId,params){
        for(var i in params) {
                if (params[i] != null && !params[i].__isProxy && typeof params[i] != "function")
                    var strParam =  stringify(params[i]);
                 if (strParam && strParam.__proto__.__proto__ == "Error") return
                 customLocalStorage[nodeId].arguments.before[i] = strParam;
        }
    }


    var mergeObjects = function(src, dst){
        for (var property in src) {
            dst[property] = src[property];
        }
    }

    var replay_arg = (log, arg,cmp,params) => {
        var result = true;
        var prop = log[1], value = log[2];
        // if (!cmp){
        //     if (typeof value == "object")
        //         value = value[0];
        //     else value = omniStringifier.parse(value,params);
        // }
        result = result && traverseToTarget(arg, prop, value,cmp);
        return result;
    };

    var getChildAccessor = function(log, params, path2function){
        var fnRoot;
        var fnScope = path2function.split(';;;;')[0],fnKey = path2function.split(';;;;').slice(1,);
        switch (fnScope){
            case "global": fnRoot = window; break;
            case "argument":fnRoot = params[0];break;
            case "closure":fnRoot = params[1];break;
            case "this": fnRoot = params[2];break;
        }
        var fnkeyLen = fnKey.length;
        fnKey.forEach((key)=>{
            fnRoot = fnRoot[key];
        })
        return fnRoot;
    }

    var replay_childClosure = function(log,arg,cmp,params){
        var tokens = log[1].split(";&;")
        var [path2function,prop] = [tokens.slice(0,tokens.length-1),tokens[tokens.length-1]],
            value = log[2], fnRoot;
        // if (!cmp) {
        //     if (typeof value != "object")
        //         throw new Error("Can't replay child closure where value is a reference");
        //     value = value[0]
        // }
        var newParams = [...params];
        var fnRoot;
        path2function.forEach((path)=>{
            fnRoot = getChildAccessor(log, newParams, path);
            var scopeObj = fnRoot.__getScope__();
            //update the closure scope 
            //if path2function has more than 2 entries, then the second one
            // has to be a closure, so update the closure params 
            newParams[1] = scopeObj
        })
        var accessor = cmp ? "__get__" : "__set__";
        return fnRoot[accessor](prop,value)
    }  

    var replay_childIBF = function(log, params){
        var fnRoot = getChildAccessor(log, params);
        fnRoot["__replayIBF__"](log[2]);
    }

    var replay_closure = (write_array, closure,cmp) => {
        var result = true;
        write_array.forEach((write_log)=>{
            var prop = write_log[0], value = write_log[1];
            result = result &&  traverseToTarget(closure, prop, value,cmp);
            // target = omniStringifier.parse(value);
            // eval(write_log);
        })
        return result;
    };
    var replay_this = (write_array, thisObj,cmp) => {
        var result = true;
        write_array.forEach((write_log)=>{
            var prop = write_log[0], value = write_log[1];
            result = result &&  traverseToTarget(thisObj, prop, value,cmp);
            // target = omniStringifier.parse(value);
            // eval(write_log);
        })
        return result;
    }
    var replay_global = (write_array, global,cmp) => {
        var result = true;
        write_array.forEach((write_log)=>{
            var prop = write_log[0], value = write_log[1];
            result = result &&  traverseToTarget(global, prop, value,cmp);
            // target = omniStringifier.parse(value);
            // eval(write_log);
        })
        return result;
    }

    var replay_IBF = (IBFs, arg, closure, thisObj) => {
        eval(IBFs);
    }

    this.replay_IBF = replay_IBF;

    var comparisonOperators = ["==","!=","===","!==","instanceof","in"]

    var specialMatchingPaths = ["localStorage","cookie"]

    var traverseToTarget  = function(root, path,value,cmp){
        var target = root,
            pathDelim = ";;;;", result = !cmp, opIndex = -1,
            cmpDelim = ";&;";
        path.split(pathDelim).forEach((prop, ind)=>{
            if (ind==0) return;
            var len = path.split(pathDelim).length;
            if ( target && (ind == len-1 || prop == "typeof")) {
                if (cmp){
                    if (specialMatchingPaths.indexOf(prop)>=0) 
                        result = true;
                    else if (prop == "typeof")
                        result = typeof target == value;
                    else if (prop == "self")
                        result = target[prop] == target;
                    else if (prop.indexOf(cmpDelim)>=0) { 
                        if ((opIndex = comparisonOperators.indexOf(prop.split(cmpDelim)[0]))>=0) {
                            var cmpOut = prop.split(cmpDelim)[1] === 'true';
                            switch (comparisonOperators[opIndex]){
                                case "==": result = (target == value) == cmpOut; break;
                                case "===": result = (target === value) == cmpOut; break;
                                case "!=": result = (target != value) == cmpOut; break;
                                case "!==": result = (target !== value) == cmpOut; break;
                                case "instanceof": result = (target instanceof value) == cmpOut; break;
                                case "in": result = (target in value) == cmpOut; break;
                            }
                        }
                    }
                    else { 
                        if (typeof value == "string"){
                            var [Ovalue, Otype, Olen] = value.split(';;&;;');
                            if (Otype){
                                Olen = Number.parseInt(Olen);
                                if (Otype == "array" ) {
                                    if (!Array.isArray(target[prop]))
                                        result = false;
                                    else if (Olen != target[prop].length)
                                        result = false;
                                    else {
                                        var [tval,_,__] = omniStringifier.stringify(target[prop],"read").split(';;&;;');
                                        result = tval == Ovalue;
                                    }
                                } else if (Otype == "object"){
                                    if (typeof target[prop] != "object")
                                        result = false;
                                    else if (target[prop] && Object.keys(target[prop]).length != Olen)
                                        result = false;
                                    else {
                                        var [tval,_,__] = omniStringifier.stringify(target[prop],"read").split(';;&;;');
                                        result = tval == Ovalue;
                                    }
                                }
                            }
                            else {
                                var tval = omniStringifier.stringify(target[prop],"read")
                                if (typeof tval == "string")
                                    result = tval.split(';;&;;')[0] == Ovalue;
                                else result = target[prop] == Ovalue;
                            }
                        }
                        else {
                            result = target[prop] == value[0];
                        }
                    }
                }
                else {
                    if (target.__isClosureObj){
                        target["set"+prop](value)

                    } else {
                        target[prop] = (value);
                    }
                    result = true;
                }
            } else if (target)
                target = target[prop];
        })
        return result;
    }

    this.traverseToTarget = traverseToTarget;

    var verifyAndReplayCache = function(cacheIndex,writeObj) {
        //Replay all the non global writes speculatively
        var sig = processedSignature[cacheIndex];
        if (Object.prototype.toString.call(writeObj).indexOf("Arguments")>=0)
            replay_arg(sig.argument_writes, writeObj);
        else if (writeObj.__isClosureProxy)
            replay_closure(sig.closure_writes, writeObj);
        else replay_this(sig.this_writes, writeObj);
    }

    var getArgTypes = function(args, delim){
        var argTypes = "";
        for (var a of args) 
            argTypes += typeof a + delim;
        return argTypes;
    }

    var exceedsInvocationLimit = function(nodeId){
        return nodeId.split("_count")[1] > INVOCATION_LIMIT;
    }

    this.cacheInit = function(nodeId, isRoot){
        if (invocationsIndName[nodeId] != null)
            invocationsIndName[nodeId]++;
        else invocationsIndName[nodeId] = 0;

        var cacheIndex = nodeId + "_count" + invocationsIndName[nodeId];
        // invocationList.push(cacheIndex);


        // if (instrumentationPattern == "cg"){
        //     var _e = new Error;
        //     var sd = _e.stack.split('\n');
        //     if (sd.length == 4)
        //         isRoot = true;
        // }
        // if (isRoot)
        //     rootInvocs.push(cacheIndex);

        // timingInfo[cacheIndex].push(window.performance.now());
        if (instrumentationPattern == "record" || instrumentationPattern == "replay") {

            callGraph[cacheIndex] = [];
            customLocalStorage[cacheIndex] = []

            if (_shadowStackHead) {
                callGraph[_shadowStackHead].push(cacheIndex)
                // insert placeholder for children signature
                // if (customLocalStorage[_shadowStackHead])
                customLocalStorage[_shadowStackHead].push(cacheIndex)
                // Before entering child function, freeze the state of the parent function
                // freezeReadState(_shadowStackHead);
            } else {
                parentNodes.push(cacheIndex);
            }

            shadowStack.push(cacheIndex);
            _shadowStackHead = cacheIndex;

            PMD[cacheIndex] = {argument:[],this:[],closure:[]}

            // if (invocationsIndName[nodeId] > INVOCATION_LIMIT ){
            //     nonCacheableNodes[cacheIndex] = "INVOCLIMIT";
            //     // _shadowStackHead = null;
            //     // window.performance.mark(cacheIndex);
            //     // timingInfo[cacheIndex].push(window.performance.now());
            //     return;
            // } 
            customLocalStorage[cacheIndex]["IBF"] = "";
            customLocalStorage[cacheIndex].CFG = [];
            customLocalStorage[cacheIndex]["ec"] = window && window.document ? 
                window.document.location.href : null;
            customLocalStorage[cacheIndex].readKeys = new Set();
            customLocalStorage[cacheIndex].writeKeys = new Set();
            customLocalStorage[cacheIndex].DOMS = [];
            // customLocalStorage[cacheIndex].startTime = window.performance.now();
        } else {
            // if (!(cacheIndex in callGraph))
            // callGraph[cacheIndex] = [];
            if (_shadowStackHead) {
                // callGraph[_shadowStackHead].push(cacheIndex)
            } else {
                timingInfo[cacheIndex] = [];
                rootInvocs.push(cacheIndex);
                curRoot = cacheIndex;
                timingInfo[cacheIndex].push(window.performance.now());
            }

            
            // shadowStack.push(cacheIndex);
            _shadowStackHead = cacheIndex;
        }
        // window.performance.mark(cacheIndex);
    }

    var checkForCacheHit = function(sig,arg,closure,thisObj){
        try {
            var evalString = sig.filter(e=>e[0]=="finalRead")[0][1];
            // evalString = evalString.split("&&").slice(0,2).join("&&");
            var CHF = new Function('arg,closure,thisObj','return ' + evalString);
            return CHF(arg,closure,thisObj) && false;
            return false;
        } catch (e) {
            throw new Error("Error while determining cache hit status");
        }
    }

    /*
    Depending on value of cmp, will compare of execute the given state
    if cmp is true will compare and return the result otherwise execute
    state : Signature of the function who's state has to be compared
    Returns true when executing state, and for compare will return the result of comparing the state
    */
    var compareOrExecuteState = function(sig,cmp, ...params){
        var fn = replay_arg, param = null
            result = true;
        var delim = cmp ? "_reads" : "_writes";
        // var sig = sig.filter(e=>e[0].indexOf(delim)>=0);
        var keys = [...new Set(sig.map(e=>e[0]))];
        var scInd = 0, ind=0; //short-circuit index;
        for (entry of sig){
        // sig.forEach((entry,ind)=>{
            var type = entry[0];
            var state = entry[0].split(delim)[0],proxyMap;
            fn = replay_arg;
            switch (state) {
                case "argument" : 
                    param = params[0];break;
                case "global" :
                     param = window; break;
                case "this" :
                     param = params[2]; break;
                case "closure":
                    param = params[1];break;
                case "childClosure":
                    fn = replay_childClosure;break
            }
            result = result && fn(entry,param, cmp,params);
            ind++;
            scInd = ind;
            if (cmp && !result)
                return [result,scInd];
        }

        return [result,scInd];
    }

    var preProcessWrites = function(writeSig, returnValue, params){
        writeSig.forEach((entry)=>{
            if (typeof entry[2] == "object")
                entry[2] = entry[2][0];
            else entry[2] = omniStringifier.parse(entry[2],params);
        })

        if (returnValue && returnValue.length != 3){
            returnValue[1] =  omniStringifier.parse(returnValue[1],params);
        }
    }

    /*
    Returns an array 
    [cacheHit, return value]
    params : argument, closure, this
    */

    this.cacheAndReplay = function(nodeId, ...params){
        // return [false,null];
        // var cacheIndex = _shadowStackHead ? _shadowStackHead : null;
        var cacheIndex = nodeId + "_count" + invocationsIndName[nodeId];
        // if (skipReplay){
        //     cacheStats.misses.empty.push(cacheIndex);
        //     return [false, null]
        // }
        if (invocationsIndName[nodeId] > INVOCATION_LIMIT){
            cacheStats.misses.empty.push(cacheIndex);
            return [false,null];
        }
        var sig, returnValue = [];
        // return [false,null];
        // timingInfo[cacheIndex]=[];
        // timingInfo[cacheIndex].push(window.performance.now());
        if (sig = processedSignature[keysToStdKeys[cacheIndex]]) {
            // return []
            if (!sig.length){
                cacheStats.misses.empty.push(cacheIndex);
                // timingInfo[cacheIndex].push(window.performance.now());
                return [false, null];
            }
            try {
                /*Iterate sig once and seperate different parts*/
                var ibf, childIBF, _ret, readSig=[], writeSig=[],ret;
                for (_e of sig){
                    if (_e[0].indexOf("_reads")>=0)
                        readSig.push(_e);
                    else if (_e[0].indexOf("_writes")>=0)
                        writeSig.push(_e);
                    else if (_e[0] == "IBF")
                        ibf = _e;
                    else if (_e[0]== "childIBF")
                        childIBF = _e;
                    else if (_e[0] == "returnValue")
                        _ret = _e;
                }
                var readStateMatch = compareOrExecuteState(readSig,true,...params);
                if (readStateMatch[0]) {
                    // cacheStats.hits.push(cacheIndex);
                    // timingInfo[cacheIndex].push(window.performance.now());
                    var _wP = writeStateProcessed.get(sig); 
                    if (_wP === undefined){
                        try {
                            preProcessWrites(writeSig, _ret, params);
                        } catch (e){
                            writeStateProcessed.set(sig, false);
                            throw e;
                        }
                    } else if (_wP === false){
                        cacheStats.misses.mismatch.push(cacheIndex);
                        return [false, null];
                    }
                    writeStateProcessed.set(sig, true);
                    compareOrExecuteState(writeSig,false,...params)
                    // _i = sig.filter(e=>e[0] == "IBF");
                    if (ibf){
                        // return [false, null];
                        replay_IBF(ibf[1],...params);
                    }
                    // _i = sig.filter(e=>e[0] == "childIBF")
                    if (childIBF)
                        replay_childIBF(childIBF[1],params)
                    // compareOrExecuteState(sig,false,...params)
                    // var _ret = sig.filter(e=>e[0] == "returnValue"),ret;
                    if (_ret){
                        // if (_ret.length == 3)
                        ret = _ret[1];
                        // else ret = omniStringifier.parse(_ret[1],params);
                    }
                    cacheStats.hits.push(cacheIndex);
                    // timingInfo[cacheIndex].push(window.performance.now());
                    // sigSizes[cacheIndex]=sig.reduce((acc, cur)=>{
                    //     var len =0; 
                    //     if (typeof cur[1] == "string")
                    //         len += cur[1].length
                    //     if (cur[2] && typeof cur[2] == "string")
                    //         len += cur[2].length;
                    //     return len + acc},0);
                    return [true,ret];
                } else {
                    cacheStats.misses.mismatch.push(cacheIndex);
                    // timingInfo[cacheIndex].push(window.performance.now());
                    // var _ind = readStateMatch[1];
                    // sigSizes[cacheIndex]=sig.slice(0,_ind).reduce((acc, cur)=>{
                    //     var len =0; 
                    //     if (typeof cur[1] == "string")
                    //         len += cur[1].length
                    //     if (cur[2] && typeof cur[2] == "string")
                    //         len += cur[2].length;
                    //     return len + acc},0);
                    return [false, null];
                }
            } catch (e) {
                if (ibf && ibf.length && ibf[0][1].indexOf("throw ")>=0){
                    cacheStats.hits.push(cacheIndex);
                    // timingInfo[cacheIndex].push(window.performance.now());
                    // sigSizes[cacheIndex]=sig.reduce((acc, cur)=>{
                    //     var len =0; 
                    //     if (typeof cur[1] == "string")
                    //         len += cur[1].length
                    //     if (cur[2] && typeof cur[2] == "string")
                    //         len += cur[2].length;
                    //     return len + acc},0);
                    throw e;
                }
                cacheStats.misses.error.push([cacheIndex,e.message]);
                
                // if (e.message && e.message.indexOf("OMNI")<0) throw e;
                // cacheStats.hits.pop();
                // timingInfo[cacheIndex].push(window.performance.now());
                return [false,null];
            }
        }
        cacheStats.misses.empty.push(cacheIndex);
        // timingInfo[cacheIndex].push(window.performance.now());
        return [false,null];
    }

    var getRootIds = function(readArr){
        var ids = [];
        /*If the 4th index is string, it means the read has been processed already 
        however if the logType is write, then add it regardless*/
        readArr.forEach((read)=>{
            if (typeof read[3] != "string" || 
                read[3].indexOf("__func__source")>=0 || 
                read[0].indexOf("_write")>=0)
                ids.push(read[1]);
        })
        // return [...new Set(ids)];
        return ids;
    }

    var filterSignature = function(e, roots, writes, key){
        if (e[0] != key) return true;
        var rootInd = roots.indexOf(e[4]);
        if (rootInd>=0){
            roots.splice(rootInd, 1);
            return false;
        }
        var writeInd = writes.indexOf(e[4]);
        if (writeInd>=0){
            writes.splice(writeInd,1);
            return false;
        }
        return true;
    }

    var uniqueSignature = function(sig){
        var strSig = sig.map(e=>JSON.stringify(e));
        var uS = new Set(strSig);
        var uniqueArr = [...uS].map(e=>JSON.parse(e));
        return uniqueArr;
    }

    var freezeReadState = function(nodeId){
        if (nodeId in nonCacheableNodes) return;
        var signature = customLocalStorage[nodeId];
        if (signature == null) return;
        if (signature.length > sigSizeLimit) {
            nonCacheableNodes[nodeId]="signature size exceeded capacity";
            return;
        }
        // signature = uniqueSignature(signature);
        // var readKeys = [...new Set(signature.filter(e=>e[0].indexOf("reads")>0).map(e=>e[0]))];
        var readKeys = signature.readKeys;
        readKeys.forEach((key)=>{
            var state = key.split("_reads")[0],proxyMap;
            var currStateWrites = invocationToWrites[nodeId] ? invocationToWrites[nodeId].filter(e=>e[0]==state).map(e=>e[1]) : [];
            switch (state) {
                case "argument" : 
                    proxyMap = invocationToArgProxy; break;
                case "global" :
                    proxyMap = globalProxyHandler; break;
                case "this" :
                    proxyMap = invocationToThisProxy; break;
                case "closure":
                    proxyMap = invocationToClosureProxy; break;
            }
            var rootObjects = getRootIds(signature.filter(e=>e[0].split("_")[0]==state));
            // customLocalStorage[nodeId] = signature.filter((e)=> { return e[0] != key || 
            //     (rootObjects.indexOf(e[4])<0 && currStateWrites.indexOf(e[4])<0)} );
            //Disable filtering of signature entriesinde
            // customLocalStorage[nodeId] = signature.filter((e)=>{return filterSignature(e, rootObjects, currStateWrites, key)});
            (signature.returnValue != null) && (customLocalStorage[nodeId].returnValue = signature.returnValue)
            signature.IBF && (customLocalStorage[nodeId].IBF = signature.IBF)
            customLocalStorage[nodeId].ec = signature.ec
            customLocalStorage[nodeId].readKeys = signature.readKeys;
            customLocalStorage[nodeId].writeKeys = signature.writeKeys;
            signature = customLocalStorage[nodeId];
            signature.forEach((readArr,ind)=>{
                if (typeof readArr[3] == "number" && readArr[0] == key){
                    var proxyPrivates = state == "global" ? globalProxyHandler : proxyMap[nodeId];
                    var obj = proxyPrivates.accessToPrivates().idToObject[readArr[3]];
                    if (!obj) console.error("Object not found during freezing read state");
                    var str = omniStringifier.stringify(obj,"read",1);
                    if (str){
                        if (str instanceof Error){
                            nonCacheableNodes[nodeId] = str.message;
                            return 1;
                        }
                        if (str.length > OMNI_SIZE_LIMIT){
                            nonCacheableNodes[nodeId] = "Value exceeded OMNI_SIZE_LIMIT";
                            return 1;
                        }
                    }
                    signature[ind] = [readArr[0], readArr[1], readArr[2], str, null];
                }
            })
        })
    }

    this.exitFunction = function(nodeId, enableRecord){
        // var cacheIndexExp = nodeId + "_count" + invocationsIndName[nodeId];
        var cacheIndex = _shadowStackHead ? _shadowStackHead : null;
        if (!cacheIndex) return;
        _shadowStackHead = null;
        return;
        
        if (instrumentationPattern == "replay")
            return;
        shadowStack.pop();
        if (shadowStack.length) 
            _shadowStackHead = shadowStack[shadowStack.length - 1];
        else {
            if (instrumentationPattern == "cg")
                timingInfo[cacheIndex].push(window.performance.now());
            _shadowStackHead = null;
        }
        
    }

    this.logBranchTaken = function(nodeId, branchInfo){
        var cacheIndex = _shadowStackHead ? _shadowStackHead : null;
        if (!cacheIndex) return;
        customLocalStorage[cacheIndex].CFG.push(branchInfo);
    }

    this.updateClosureCache = function(cacheIndex, closureObj){
        Object.keys(closureObj).forEach((k)=>{
            if (typeof closureObj[k] != "object"){
                var writeAr = [0, k, closureObj[k]];
                customLocalStorage[cacheIndex]["closure_writes"].push(writeAr);
            }
        })
        return;
    }

    this.dumpArguments = function(nodeId, params) {
        // functionTimerE[nodeId] = performance.now();
        // window.sigStack[nodeId].push(functionTimerE[nodeId] - functionTimerS[nodeId]);
        // return;
        if (customLocalStorage[nodeId]["arguments"])
            customLocalStorage[nodeId]["arguments"]["after"] = params;
        shadowStack.pop();
    }

    this.logCallee = function(callee, calleeRes){
        if (callee && callee.toString){
            var _isNative = isNative(callee.toString());
            if(!_isNative){
                if (!_shadowStackHead)
                    throw new Error("no shadow stack found");
                nonLeafNodes.push(_shadowStackHead);
            }
        } else {
            console.error(callee + " no toString method for object");
        }
        return calleeRes;
    }

    this.logIBF = function(functionId, IBF, callee, IBFStrDecl, IBFStrCall, argStrs, argVals){
        if (callee && callee.toString){
            var actualCallee = callee;
            if (callee.__isProxy) actualCallee = callee.__target;
            var _isNative = isNative(Object.prototype.toString.call(actualCallee));
            if (!_isNative && !actualCallee.__isShimmed__) {
                if (callee.__isProxy){
                    var childLen = callGraph[_shadowStackHead].length;
                    if (childLen) {
                        var stackHead = callGraph[_shadowStackHead][childLen-1]
                        handlePropagatedProxy(callee, null, "closure",stackHead)
                    }
                }
                return IBF;
            }
        } else {
            // TODO callee has no string method, can't store metedata information
            // console.error("Callee has no toString method")
        }
        var ibfStr = IBFStrCall, argsConverted = [],val;
        // var cacheIndex = functionId + "_count" + invocationsIndName[functionId];
        var cacheIndex = _shadowStackHead ? _shadowStackHead : null;
        if (!cacheIndex || nonCacheableNodes[cacheIndex] || pageLoaded) 
            return IBF;

        // if ((IBFStrDecl != null && IBFStrDecl.indexOf("createElement")>=0 )){
        //     nonCacheableNodes[cacheIndex] = "DOM element being created";
        //     return IBF;
        // }
        /*
        Commented the bottom part, because all the arguments are being statically handled
        However moving forward, we need to dynamically handle these, as static analysis 
        doesn't completely create everything we need. 
        */
        var stringificationErr = false;
        // argVals.forEach((arg,i)=>{
        //     var _argStr = omniStringifier.stringify(arg,"write",2);
        //     if (_argStr && _argStr instanceof Error){
        //         nonCacheableNodes[cacheIndex] = _argStr.message;
        //         stringificationErr = true;
        //     }
        //     if (typeof _argStr == "object") {
        //         val = _argStr[0];
        //     } else val  = " omniStringifier.parse(\"" + escapeRegExp(_argStr) + "\");\n"; 

        //     if (typeof arg == "string" && (arg.indexOf("arg[")>=0 || arg.indexOf("closure.")>=0))
        //         ibfStr += argStrs[i] + " = " + arg + ";\n"
        //     else ibfStr +=  argStrs[i]+ ' = ' + val + ";\n";
        // })
        // if (stringificationErr)
        //     return IBF;

        // ibfStr += IBFStrCall;
        if (customLocalStorage[cacheIndex]["IBF"] == null)
            customLocalStorage[cacheIndex]["IBF"] = ""
        customLocalStorage[cacheIndex]["IBF"] += "\n" + ibfStr + "\n";

        return IBF;
    }

    this.createArgumentProxy = function(argObj){
        if (pageLoaded || _shadowStackHead in nonCacheableNodes) return argObj;
        var nodeId = _shadowStackHead ? _shadowStackHead : null;
        if (!nodeId) return argObj;
        if (!argObj.length) return argObj;
        if (argObj.__isProxy) argObj = argObj.__target;
        var proxyHandler = proxyEncapsulation(argObj,"argument");
        var argProxy = new Proxy(argObj, proxyHandler);
        // proxyHandler.accessToPrivates().proxyToMethod.set(argProxy, argObj);
        if (invocationToArgProxy[nodeId]) console.error("invocation already has a previous proxy");
        invocationToArgProxy[nodeId] = proxyHandler;
        return argProxy
    }

    this.createClosureProxy = function(closureObj, scopeId){
        if (pageLoaded || _shadowStackHead in nonCacheableNodes) return closureObj;
        var nodeId = _shadowStackHead ? _shadowStackHead : null;
        if (!nodeId ) return closureObj;
        if (!Object.keys(closureObj).length) return closureObj;
        if (closureObj.__isProxy) closureObj = closureObj.__target;
        var proxyHandler;
        if (!(nodeId in functionToScopes))
            functionToScopes[nodeId] = [];
        if (functionToScopes[nodeId].indexOf(scopeId)<0)
            functionToScopes[nodeId].push(scopeId);
        if (scopeId in invocationToClosureProxy)
            proxyHandler = invocationToClosureProxy[scopeId];
        else {
            proxyHandler = proxyEncapsulation(closureObj,"closure", scopeId);
            invocationToClosureProxy[scopeId] = proxyHandler;
        }
        var closureProxy = new Proxy(closureObj, proxyHandler);
        // proxyHandler.accessToPrivates().proxyToMethod.set(closureProxy, closureObj);
        return closureProxy;
    }

    /*
    thisProxy is separate from argument Proxy, as the target object itself could
    be a proxy object, and we don't want to wrap a proxy on top a proxy
    therefore, first we check if it already is a proxy and get rid of it, before wrapping
    it up in a proxy. 
    */
    this.createThisProxy = function(thisObj){
        if (pageLoaded || !thisObj || (typeof thisObj != "function" && typeof thisObj != "object")
         || _shadowStackHead in nonCacheableNodes ) return thisObj;
        if (thisObj.withCredentials != null) {
            nonCacheableNodes[_shadowStackHead] = "This: XMLHttpRequest"
            return thisObj;
        }
        var nodeId = _shadowStackHead ? _shadowStackHead : null;
        if (!nodeId) return thisObj;
        if (thisObj.__isProxy || thisObj == window) {
            handlePropagatedProxy(thisObj, null, "this",_shadowStackHead)
            thisObj = thisObj.__target != null ? thisObj.__target : window
        }
        var proxyHandler = proxyEncapsulation(thisObj,"this");
        var thisProxy = new Proxy(thisObj, proxyHandler);
        // proxyHandler.accessToPrivates().proxyToMethod.set(thisProxy, thisObj);
        if (invocationToThisProxy[nodeId]) console.error("invocation already has a previous proxy");
        invocationToThisProxy[nodeId] =   proxyHandler;
        return thisProxy;
    }

    var escapeRegExp = function(str) {
        return str.replace(/[\"]/g, "\\$&");
    }

    function isNative(fn) {
        return (/\{\s*\[native code\]\s*\}/).test('' + fn);
    }

    function stringify(obj) {
        try {
            return JSON.stringify(obj, function (key, value) {
              if (value && value.__isProxy)
                    value = value.__target;
              var fnBody;
              if (value instanceof Function || typeof value == 'function') {
                return "";
                if ((/\{\s*\[native code\]\s*\}/).test(value.toString())) {
                    return value.name;
                }
                fnBody = value.toString();

                if (fnBody.length < 8 || fnBody.substring(0, 8) !== 'function') { /*this is ES6 Arrow Function*/
                  return '_NuFrRa_' + fnBody;
                }
                return fnBody;
              }
              if (value instanceof RegExp) {
                return '_PxEgEr_' + value;
              }
              return value;
            });
        } catch(e){
            return e;
        }
    };

    function parse(str, date2obj) {

    var iso8061 = date2obj ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/ : false;

    return JSON.parse(str, function (key, value) {
        var prefix;

        if (typeof value != 'string') {
        return value;
        }
        if (value.length < 8) {
        return value;
        }

        prefix = value.substring(0, 8);

        if (iso8061 && value.match(iso8061)) {
            return new Date(value);
        }
        if (prefix === 'function') {
            // if ((/\{\s*\[native code\]\s*\}/).test(value))
            //     return nativeObjectsStore[key]
            return eval('(' + value + ')');
        }
        if (prefix === '_PxEgEr_') {
            return eval(value.slice(8));
        }
        if (prefix === '_NuFrRa_') {
            return eval(value.slice(8));
        }

        return value;
        });
    };

    class SignatureProcessor{

            //ptype - specifies the type of processing to do, by pointing to the node
            ///TODO
            // Clean the logic with objecttopathPerOT , since we aren't keeping it per ot
            constructor(signature, ObjectTree, callGraph, pType){
                this.signature = signature;
                this.objectTree = ObjectTree;
                this.processedSig = {};
                this.objectToPathPerOT = {"this":{}};
                this.callGraph = callGraph;
                this.logType = pType;
                this.pathDelim = ";;;;";
            }

            process(){
                var objectToPathPerOT = this.objectToPathPerOT;
                var objectTreeThis = this.objectTree;
                var signature = this.signature;
                var processedSig = this.processedSig;
                var reverseObjectToId = {};
                var logType = this.logType;
                var callGraph = this.callGraph;
                var pathDelim = this.pathDelim;

                var init = function(){
                    // switch(logType){
                    //     case  "global" :
                    //         objectToPathPerOT.this[0] = "window";
                    //         break;
                    //     case "argument" :
                    //         objectToPathPerOT.this[0] = "arg"
                    //         break;
                    //     case "closure":
                    //         objectToPathPerOT.this[0] = "closure"
                    //         break;
                    //     case "this" :
                    //         objectToPathPerOT.this[0] = "thisObj";
                    //         break;
                    // }
                    objectToPathPerOT.this[0] = "";
                }

                var stringify = function (obj) {

                    return JSON.stringify(obj, function (key, value) {
                      if (value.__isProxy)
                        value = value.__target;
                      var fnBody;
                      if (value instanceof Function || typeof value == 'function') {
                        return "";
                      //   return value.toString();

                      //   if ((/\{\s*\[native code\]\s*\}/).test(value.toString())) {
                      //       return {};
                      //   }
                      //   fnBody = value.toString();

                      //   if (fnBody.length < 8 || fnBody.substring(0, 8) !== 'function') { //this is ES6 Arrow Function
                      //     return '_NuFrRa_' + fnBody;
                      //   }
                      //   return fnBody;
                      // }
                      // if (value instanceof RegExp) {
                      //   return '_PxEgEr_' + value;
                      }
                      return value;
                    });
                };

                var _removeRedundantReads = function(nodeId, writeArray){
                    var readLength = signature[nodeId].reads.length;
                    if (readLength) {
                        while (readLength--){
                            if ( signature[nodeId].reads[readLength][0] == writeArray[0] && signature[nodeId].reads[readLength][1] == writeArray[1] )
                                signature[nodeId].reads.splice(readLength, 1);
                        }
                    }
                }
                var removeReduntantReads = function(){
                    for (var nodeId in signature){
                        if (signature[nodeId].writes.length) {
                            signature[nodeId].writes.forEach(function(write){
                                _removeRedundantReads(nodeId, write);
                            })
                        }
                    }
                }

                /*
                While constructing paths instead of using the dot operator for properties
                we use the bracket operators for two reasons
                - If the property is a number
                - if the property has special symbols like dot itlelf or spaces
                */

                var constructPath = function(objectId, OT="this"){
                    if (!objectToPathPerOT[OT]) objectToPathPerOT[OT] = {0:"arguments"};
                    if (objectToPathPerOT[OT][objectId] == "" || objectToPathPerOT[OT][objectId]) return objectToPathPerOT[OT][objectId];
                    var path = "";
                    var objectTree = OT == "this" ? objectTreeThis : invocationToArgProxy[OT].accessToPrivates().ObjectTree;
                    for (var nodeId in objectTree){
                        for (var edge in objectTree[nodeId]) {
                            var _id = objectTree[nodeId][edge].indexOf(parseInt(objectId));
                            if (_id>=0) {
                                var parentPath = constructPath(nodeId, OT);
                                // path = parentPath + "['" + edge.substr(2) + "']";
                                path = parentPath + pathDelim + edge.substr(2);
                                objectToPathPerOT[OT][objectId] = path;
                                return path;
                            }
                        }
                    }
                    console.error("NO PATH FOUND FOR OBJECT ID: " + objectId);
                }

                var reverseLookup = function(objectId) {
                    if (reverseObjectToId[objectId]) return reverseObjectToId[objectId];

                }

                var preProcess = function(OT){
                    var objectTree = OT == "this" ? objectTreeThis : invocationToArgProxy[OT].accessToPrivates().ObjectTree;
                    for (var nodeId in objectTree) {
                        var parentPath = constructPath(nodeId, OT);
                        if (!parentPath && parentPath != "") console.error("NO PARENT PATH FOUND WHILE PREPROCESSING " + nodeId );
                        for (var edge in objectTree[nodeId]) {
                            objectTree[nodeId][edge].forEach(function(objectId){
                                 if (!objectToPathPerOT.this[objectId]) {
                                    // var path = parentPath + "['" + edge.substr(2) + "']";
                                    var path = parentPath + pathDelim + edge.substr(2);
                                    objectToPathPerOT.this[objectId] = path;
                                }
                            })
                        }
                    }
                }

                var fetchValue = function(log){
                    var _id = parseInt(log);
                    if (!isNaN(_id))
                        return idToObject.get(_id);
                    else
                        return log.substr(2);
                }

                var getRootIds = function(readArr){
                    var ids = [];
                    readArr.forEach((read)=>{
                        ids.push(read[1]);
                    })
                    return [...new Set(ids)];
                }

                var getAllChildren = function(rootId,key){
                    var objectTreeNode = objectTreeThis[rootId];
                    if (!objectTreeNode) return [];

                    var children = objectTreeNode['e_' + key];
                    // FIX 
                    /*all future reads from this object should be removed*/
                    return children || [];
                    return [];
                }

                var process = function(nodeId){
                    var arr = signature[nodeId], roots = [];
                    var writeObjs = {}, prunedInds = [], readsSeen = [],
                        writeObjsCh = [], readObjs = {};
                    arr.forEach(function(entry,ind){
                        //skip child placeholders
                        if (typeof entry == "string") return;
                        var type = entry[0];
                        if (type.indexOf(logType)<0) return;
                        var isWrite = type.indexOf("_reads")<0
                        var state = isWrite ? "write" : "read";
                        if (isWrite){
                            if (!writeObjs[entry[1]]){
                                writeObjs[entry[1]] = [];
                            }
                            writeObjs[entry[1]].push(entry[2]);
                            writeObjsCh = writeObjsCh.concat(getAllChildren(entry[1],entry[2]));
                        }
                        else if (writeObjs[entry[1]] && (writeObjs[entry[1]].indexOf(entry[2])>=0)
                            || writeObjsCh.indexOf(entry[1])>=0) {
                            prunedInds.push(ind);
                            return;
                        }
                        var sig = [type];
                        var OT = "this"
                        if (OT != "this")
                            preProcess(OT);
                        var parentPath = objectToPathPerOT[OT][entry[1]]
                        if (!parentPath && parentPath != "") console.log("no parent path found for object id:" + JSON.stringify(entry) + " " + nodeId);
                        try {
                            var str;
                            if (typeof entry[2] == 'symbol')
                                str = entry[2].toString()
                            else str = entry[2] + '';
                            var path = parentPath + pathDelim + str;
                            var val = entry[3];
                            // if (state == "write")
                            //     val = omniStringifier.stringify(val, state, 2);
                            sig[1] = path;
                            sig[2] = val;

                            //Special case while reading window
                            if (entry[4] === 0 && !isWrite) {
                                sig[1] += pathDelim + "self";
                                sig[2] = path;
                            }
                        } catch (e) {
                            //TODO
                            //suppressing for now
                            //SUPPRESS
                            throw e;
                            console.log("Error while trying to stringify path: " + e + e.stack);
                        }
                        if (sig) {
                            // if (sig[0].indexOf("reads")>=0){
                            //     if (readsSeen.indexOf(sig[1])>=0)
                            //         prunedInds.push(ind);
                            //     else readsSeen.push(sig[1]);
                            // }
                            // if (detectProperty(readVal)) processedSig[nodeId].isFunction = true;
                            processedSig[nodeId][ind] = sig;
                        }
                    })
                    // for (var i=prunedInds.length - 1;i>=0;i--)
                    //     processedSig[nodeId].splice(prunedInds[i],1);
                }

                var processWrite = function(nodeId){
                    var writeArray = signature[nodeId].filter(e=>e[0]==logType+"_writes");
                    writeArray.forEach(function(write){
                        var writeSignature = [logType+"_writes"];
                        var OT = "this"
                        if (OT != "this")
                            preProcess(OT);
                        var parentPath = objectToPathPerOT[OT][write[1]];
                        if (!parentPath && parentPath != "") console.log("no parent path found for object id:" + JSON.stringify(write) + " " + nodeId);
                        if (typeof write[2] == "symbol")
                            var path = parentPath + pathDelim + write[2].toString(); 
                        else var path = parentPath + pathDelim + write[2]; 
                        try {
                            var writeVal = write[3];
                            // writeSignature = path + " = omniStringifier.parse(`" + escapeRegExp(writeVal) +"`)";
                            writeSignature[1] = path;
                            writeSignature[2] = writeVal;
                        } catch (e) {
                            //TODO
                            //suppressing for now
                            //SUPPRESS
                            console.log("Error while stringifying path: " + e + e.stack);
                        }
                        if (writeSignature) {
                            // if (detectProperty(writeVal)) processedSig[nodeId].isFunction = true;
                            processedSig[nodeId].push(writeSignature);
                        }
                    })

                }

                //Generic function to detect a specific property of the signature
                var detectProperty = function(obj, property="function"){
                    if (typeof obj == "string")
                        return obj.split(';;').indexOf(property) >=0;
                    else if (typeof obj == property) return true;
                    else return false;
                }

                init();
                preProcess("this");
                //cleanup signatures ie remove a read after write
                // removeReduntantReads();

                Object.keys(this.signature).forEach(function(nodeId){
                    // Return if not leaf node
                    if (trackOnlyLeaf &&  callGraph[nodeId].length) {
                        // processedSig[nodeId] = "NonLeafNode";
                        return;
                    }
                    if (nodeId in nonCacheableNodes) return;
                    processedSig[nodeId] = signature[nodeId];
                    if (signature[nodeId].length)
                        process(nodeId)

                    //Remove redundant reads, ie reads with same keys 

                    if (logType == "global"){
                        if (signature[nodeId].returnValue !== undefined) { 
                            // var _ret = omniStringifier.stringify(signature[nodeId].returnValue,"write",2);
                            var _ret = signature[nodeId].returnValue
                            if (!(_ret instanceof Error)) {
                                processedSig[nodeId].push(['returnValue',_ret]);
                                // processedSig[nodeId].returnValue = _ret;
                            }
                            else delete processedSig[nodeId];

                        }
                        signature[nodeId] &&  signature[nodeId].IBF && processedSig[nodeId] && (
                            processedSig[nodeId].push(['IBF',signature[nodeId].IBF]));

                        signature[nodeId] &&  signature[nodeId].DOMS && processedSig[nodeId] && (
                            processedSig[nodeId].push(['DOMS',signature[nodeId].DOMS]));

                        // signature[nodeId] &&  signature[nodeId].ec && processedSig[nodeId] && (
                        //     processedSig[nodeId].push(['ec', signature[nodeId].ec]));

                        // signature[nodeId] &&  signature[nodeId].CFG && processedSig[nodeId] && (
                        //     processedSig[nodeId].push(['CFG', signature[nodeId].CFG]));
                        // signature[nodeId] &&  signature[nodeId].startTime && processedSig[nodeId] && (
                        //     processedSig[nodeId].push(['startTime', signature[nodeId].startTime]));
                        // signature[nodeId] &&  signature[nodeId].endTime && processedSig[nodeId] && (
                        //     processedSig[nodeId].push(['endTime', signature[nodeId].endTime]));
                    }

                    // Object.keys(signature[nodeId]).forEach((key)=>{
                    //     if (!processedSig[nodeId][key]) {
                    //         // if (detectProperty(signature[nodeId][key])) processedSig[nodeId].isFunction = true;
                    //         processedSig[nodeId][key] = signature[nodeId][key];
                    //     }
                    // })
                });

            }

            postProcess() {
                var processedSig = this.processedSig;
                var callGraph = this.callGraph;
                var logType = this.logType;
                var _removeRedundantReads = function(keyArray){
                    var redundantIndices = [];
                    keyArray.forEach(key => {
                        var indices = keyArray.keys();
                        for (var i of indices) {
                            if (key.trim().indexOf(keyArray[i].trim()) >= 0 && keyArray[i].trim() != key.trim())
                                redundantIndices.push(i);
                        }
                    });

                    return [...(new Set(redundantIndices))]
                }

                var removeReduntantReads = function(nodeId){
                    var readArray = processedSig[nodeId][logType+"_reads"];
                    var keys = readArray.map(key => key.split('=')[0].trim());
                    var redundantIndices = _removeRedundantReads(keys);
                    for (var index = redundantIndices.length-1; index >= 0; index--)
                        readArray.splice(redundantIndices[index],1);
                    // redundantIndices.forEach(index => {
                    //     readArray.splice(index, 1);
                    // });
                }

                var removeReduntantReadsSimple = function(nodeId){
                    var readArray = processedSig[nodeId][logType+"_reads"];
                    processedSig[nodeId][logType+"_reads"] = [...new Set(readArray.map(e=>JSON.stringify(e)))].map(e=>JSON.parse(e));
                }

                Object.keys(processedSig).forEach(function(nodeId){
                    if (trackOnlyLeaf && callGraph[nodeId].length) return;
                    if (processedSig[nodeId][logType+"_reads"])
                        removeReduntantReadsSimple(nodeId);
                    // var readArray = processedSig[nodeId].reads;
                    // if (readArray && readArray.length) {
                    //     readArray = new Set(readArray);
                    //     processedSig[nodeId].reads = readArray;
                    // }
                    // var writeArray = processedSig[nodeId].writes;
                    // if (writeArray && writeArray.length) {
                    //     writeArray = new Set(writeArray);
                    //     processedSig[nodeId].writes = writeArray;
                    // }

                });
            }

            setPropagationData(pmd, proxyData, processedSig, nonCacheableNodes){
                this.PMD = pmd;
                this.proxyData = proxyData;
                this.processedSig = processedSig
                this.nonCacheableNodes = nonCacheableNodes;
            }
            /*
            Pseudo code
            - Traverse bottom up, for 
            */
            signaturePropagate() {
                //Copy the call graph since we will be mutating it
                var callGraph = Object.assign({},this.callGraph);
                var processedSig = this.processedSig;
                var logType = this.logType;
                var pmd = this.PMD;
                var proxyData = this.proxyData;
                var nonCacheableNodes = this.nonCacheableNodes;

                var object2pathmem;
                var _getPathFromId = function(objectId, objectTree){
                    if (object2pathmem[objectId] != null) return object2pathmem[objectId];
                    for (var nodeId in objectTree){
                        for (var edge in objectTree[nodeId]) {
                            var _id = objectTree[nodeId][edge].indexOf(parseInt(objectId));
                            if (_id>=0) {
                                var parentPath = _getPathFromId(nodeId, objectTree);
                                // path = parentPath + "['" + edge.substr(2) + "']";
                                var path = parentPath + ";;;;" + edge.substr(2);
                                object2pathmem[objectId] = path;
                                return path;
                            }
                        }
                    }
                }

                var getPathFromId = function(objectId, functionId, stateType){
                    var proxyMap, newPath;
                    switch (stateType) {
                        case "argument" : 
                            proxyMap = proxyData.i2a; break;
                        case "global" :
                            proxyMap = proxyData.gph; break;
                        case "this" :
                            proxyMap = proxyData.i2t; break;
                        case "closure":
                            proxyMap = proxyData.i2c; break;
                    }
                    var _proxyPrivates = (stateType == "global" ? globalProxyHandler : proxyMap[functionId])
                    if (!_proxyPrivates)
                        return new Error("Path not found while translating signature")
                    var proxyPrivates = _proxyPrivates.accessToPrivates();
                    object2pathmem = {0:""};
                    newPath = _getPathFromId(objectId, proxyPrivates.ObjectTree);
                    if (newPath == null){
                        return new Error("Path not found while translating signature")
                    }
                    return newPath
                }


                var translateSigInParentScope = function(parentNode, childNode, sigEntry, sigType){
                    var metadata = pmd[childNode];
                    var sigCat = sigEntry[0].split("_")[1];
                    if (sigType == "global" || sigType == "IBF") return Object.assign([],sigEntry);
                    if (!metadata[sigType] || !metadata[sigType].length)
                        return null;
                    var translatedEntry = [];
                    if (sigType == "argument") {
                        var mainArg = sigEntry[1].split(';;;;')[1];
                        var _matchMD = metadata[sigType].find(e=>e[0]==mainArg)
                        if (!_matchMD) return null;
                    } else 
                        var _matchMD = metadata[sigType][0]
                    var newPath = getPathFromId(_matchMD[1],parentNode, _matchMD[2])
                    if (newPath && newPath.stack)
                        return newPath;
                    var newArg = _matchMD[2] + "_" + sigCat,
                        newKey = sigType == "argument" ? [newPath].concat(sigEntry[1].split(';;;;').slice(2,)).join(";;;;") : 
                            newPath + sigEntry[1] 
                    return [newArg, newKey, sigEntry[2]];
                }

                var rewriteKey = function(translatedSig, origSig, alreadyChildClosure){
                    var newKey = translatedSig[1].replace(origSig[1],"");
                    if (!alreadyChildClosure)
                        newKey = translatedSig[0].split("_")[0]  +  newKey   + ";&;" + origSig[1];
                    else newKey = translatedSig[0].split("_")[0]  +  newKey 
                    return newKey;
                }

                //sigType = read or write
                var insertClosureSig = function(parentSig, insertInd, translatedSig, sigType, origSig, alreadyChildClosure){
                    var newSigType = sigType == "reads" ? "childClosure_reads" : 
                        sigType == "IBF" ? "childIBF" : "childClosure_writes";
                    var newKey = rewriteKey(translatedSig, origSig,alreadyChildClosure);
                    var finalSig = [newSigType,newKey,translatedSig[2]];
                    parentSig.splice(insertInd,0,finalSig);
                }


                var _propagateHelper = function(sigEntry, parentNode, insertInd, childNode){
                    var sigType = sigEntry[0].split("_")[0],
                        parentSig = processedSig[parentNode];
                    switch(sigType){
                        case "global": parentSig.splice(insertInd, 0, sigEntry); break;
                        case "argument":
                        case "this": 
                        case "closure":
                        case "IBF":
                            /*Handling IBF propagation similar to closure propagation*/
                            if (sigType == "IBF") 
                                var translatedSig = translateSigInParentScope(parentNode, childNode, sigEntry, "closure")
                            else var translatedSig = translateSigInParentScope(parentNode, childNode, sigEntry, sigType)
                            if (translatedSig && !translatedSig.stack){
                                if (sigType == "closure"){
                                    insertClosureSig(parentSig, insertInd, translatedSig, sigEntry[0].split("_")[1], sigEntry)
                                    break;
                                } else if (sigType == "IBF"){
                                    insertClosureSig(parentSig, insertInd, translatedSig, "IBF", sigEntry)
                                    break;
                                }
                                parentSig.splice(insertInd, 0, translatedSig); 
                            } else if (translatedSig && translatedSig.stack)
                                nonCacheableNodes[parentNode] = "translatedSig.message"
                            break;
                        case "childClosure":
                        case "childIBF":
                            var [childRef, actualKey] = sigEntry[1].split(';&;');
                            var dummySigType = childRef.split(';;;;')[0]+"_"+sigEntry[0].split("_")[1];
                            /*
                            if child accessed it through closure, simply append the key 
                            however if the child accessed it through arguments or global, translate it accordingly
                            */
                            var childAccessor = "closure"; 
                            if (dummySigType.indexOf("argument")>=0 || dummySigType.indexOf("global")>=0){
                                childAccessor = "argument";
                                var dummySigEntry = [dummySigType, childRef.replace(childRef.split(';;;;')[0],""), sigEntry[2]];
                            }
                            else 
                                var dummySigEntry = [dummySigType, "", sigEntry[2]];
                            var translatedSig = translateSigInParentScope(parentNode, childNode, dummySigEntry, childRef.split(';;;;')[0])
                            if (translatedSig && !translatedSig.stack){
                                    //fix the original reference part and the key part
                                    // translatedSig[1] = rewriteKey(translatedSig, dummySigEntry);
                                    //mimic the closure category, modify the key to include actualKey, without the state part
                                    if (childAccessor == "closure")
                                        translatedSig[1] += ';&;' + sigEntry[1];
                                    else dummySigEntry[1] = actualKey;
                                    //tweak the originalSig to simply reuse the insertClosureSig function
                                    // dummySigEntry[1]= actua.lKey
                                    var rwType = sigEntry[0].split("_")[1];
                                    if (sigType == "childIBF")
                                        rwType = "IBF"

                                    if (childAccessor == "closure")
                                        insertClosureSig(parentSig, insertInd, translatedSig, rwType, dummySigEntry, true)
                                    else 
                                        insertClosureSig(parentSig, insertInd, translatedSig, rwType, dummySigEntry)
                            }   

                    }
                }

                var propagateSig = function(parentNode, childNode){
                    var parentSig = processedSig[parentNode],
                        childSig = processedSig[childNode];
                    if (!parentSig || !childSig) return;
                    var phInd = parentSig.findIndex(e=>e==childNode),
                        cpPhInd = phInd;

                    if (phInd<0){
                        console.error("Parent node: " + parentNode + " has no placeholder for " + childNode );
                        return;
                    } 
                    //Make space to insert childsig into parent sig
                    parentSig.splice(phInd,1)
                    childSig.forEach((sigEntry)=>{
                        var inserted = _propagateHelper(sigEntry,parentNode, phInd, childNode);
                        if (inserted)
                            phInd++
                    })
                    if (childSig.IBF){
                        var sigEntry = ["IBF", "", childSig.IBF]
                        var inserted = _propagateHelper(sigEntry,parentNode, phInd, childNode);
                        if (inserted)
                            phInd++
                    }
                    //Run optimizer after updating parent sig
                    // RWOpt(parentSig, cpPhInd);
                }

                var RWOpt = function(parentSig){
                    var cat2w = {}, //category to write
                        prunedInds = [],
                        readsSeen = {};
                    parentSig.forEach((entry,indx)=>{
                        var state = entry[0].split("_")[0];
                        if (!readsSeen[state])
                            readsSeen[state] = []
                        if (entry[0].indexOf("writes")>=0 ){
                            readsSeen[state].push(entry[1])
                            if (!cat2w[state])
                                cat2w[state] = [];
                            cat2w[state].push([entry[1],indx]) // state -> [key written to, index of the signature]
                        } else {
                            if (readsSeen[state].indexOf(entry[1])>=0 && prunedInds.indexOf(indx)<0)
                                prunedInds.push(indx)
                            else readsSeen[state].push(entry[1]);
                        }
                    })

                    parentSig.forEach((entry, indx)=>{
                            if (entry[0].indexOf("reads")>=0) {
                                var state = entry[0].split("_")[0];
                                if (!(state in cat2w)) return;
                                for (var write of cat2w[state]) {
                                    if (write[1] < indx && write[0].indexOf(entry[1])>=0 && prunedInds.indexOf(indx) < 0) {
                                        prunedInds.push(indx)
                                        break
                                    }
                                }
                            }
                    })
                    // Removing all the reads after writes
                    prunedInds = prunedInds.sort((b,a)=>{return b-a})
                    for (var i=prunedInds.length - 1;i>=0;i--)
                        parentSig.splice(prunedInds[i],1);

                }

                var updatedNodes = [];
                var visitChildren = function(parentNode){
                    if (updatedNodes.indexOf(parentNode)>=0) return;
                    var children = callGraph[parentNode];

                    for (var child of children){
                        visitChildren(child);
                        // console.log("Propagating " + child + " signature to " + parentNode)
                        if (child in nonCacheableNodes){
                            var childReason = nonCacheableNodes[child],
                                parentReason = "";
                            if (childReason.indexOf(";;")>=0){
                                parentReason = childReason;
                            } else {
                                parentReason += childReason + ";;parent-of-nc";
                            }
                            nonCacheableNodes[parentNode]=parentReason;
                            delete processedSig[parentNode]
                            updatedNodes.push(parentNode)
                            return;
                        }
                        propagateSig(parentNode,child);
                    }
                    updatedNodes.push(parentNode)
                }

                Object.keys(processedSig).forEach((parentNode)=>{
                    visitChildren(parentNode);
                })
                Object.keys(processedSig).forEach((parentNode)=>{
                    RWOpt(processedSig[parentNode]);
                })


            }
    }
    var setupStateEndTime = performance.now();
    window.top.setupStateTime[window.top.setupStateCounter++] = setupStateEndTime - setupStateStartTime;

    /*Set page loaded to true, since the initialization has happened
    and we need to turn off tracking for unnecessary functions*/
    // pageLoaded = false;
};

} /*else {
    {name} = window.top.{name}
}*/

/*if (typeof {proxyName} === "undefined"){
    var globalProxyHandler = window.top.proxyEncapsulation(window,"global");

    var {proxy, revoke} = Proxy.revocable(window, globalProxyHandler);
    // Flag to disable proxy
    {proxyName} = proxy;*
}*/

// (function () { {name}.setGlobal(this); })();

