/**
 * This code executes at runtime and captures dynamic information
 * a.k.a. the dynamic analyser
 */

(function Intercepts(){

    var _fetchSend = window.fetch;
        // override the native send()
    window.fetch = function(){
        var intercept = __tracer.getCaptureMode() == 'postload' ? 
            (__tracer.getTracingMode() ? true : false) : false;
        if (!intercept){
            return _fetchSend.apply(this, arguments);
        }
        __tracer.logXMLCall();
        // call the native send()
        _fetchSend.apply(this, arguments);
    }

    var _xmlSend = XMLHttpRequest.prototype.send;
        // override the native send()
    XMLHttpRequest.prototype.send = function(){
        var intercept = __tracer.getCaptureMode() == 'postload' ? 
            (__tracer.getTracingMode() ? true : false) : false;
        if (!intercept){
            return _xmlSend.apply(this, arguments);
        }
        __tracer.logXMLCall();
        // call the native send()
        _xmlSend.apply(this, arguments);
    }
})();

var __tracer = new (function(){
     var TM = true, //tracing turned on by default
        shadowStackHead = null, 
        callStack = [];
        callGraph = {},
        executionCounter = {},
        evtFns = {},
        allFns = {
            preload: new Set,
            postload: new Set
        },
        captureMode = 'preload', // can be either preload or postload
        curEvt = null;

    this.__enter__ = function(id){
        if (!TM) return;
        // if (!(id in executionCounter))
        //     executionCounter[id] = -1;
        // executionCounter[id]++

        // var invocId = `${id}_count${executionCounter[id]}`;
        // callGraph[invocId] = [];
        // callStack.push(invocId);
        callStack.push(`${curEvt}_${id}`);
        // if (shadowStackHead)
            // callGraph[shadowStackHead].push(invocId);
        // shadowStackHead = invocId;
        if (captureMode == 'preload'){
            allFns[captureMode].add(id);
            return;
        }

        allFns[captureMode].add(id);
        // Store functions reachable from event handlers
        if (callStack.length == 1)
            evtFns[`${curEvt}_${id}`] = new Set;
        else {
            var rootEvt = callStack[0];
            evtFns[rootEvt].add(id);
        }
    }

    this.__exit__ = function(){
        if (!TM) return;
        var _id = callStack.pop();
        // var csLen = callStack.length;
        // shadowStackHead = csLen ? callStack[csLen - 1] : null;

        //convert set to array for stringification
        // if (!shadowStackHead){
        //     var id = _id.split('_count')[0];
        //     evtFns[id] = [...evtFns[id]];
        // }
    }

    this.setCaptureMode = function(mode){
        captureMode = mode;
    }

    this.getCaptureMode = function(){
        return captureMode;
    }

    this.getCallGraph = function(){
        return callGraph;
    }

    this.getAllFns = function(){
        allFns.preload = [...allFns.preload];
        allFns.postload = [...allFns.postload];
        return allFns;
    }

    var _getEvtFns = function(fns){
        //convert sets to array for stringification by fetch API
        Object.keys(fns).forEach((id)=>{
            fns[id] = [...fns[id]];
        });
        return fns;
    }

    this.getEvtFns = function(){
        return _getEvtFns(evtFns);
    }

    this.setTracingMode = function(mode){
        TM = mode;
    }

    this.getTracingMode = function(){
        return TM;
    }

    this.setEventId = function(id){
        curEvt = id;
    }

    this.logXMLCall = function(){
        var rootEvt = callStack[0];
        evtFns[rootEvt].add("xml");
    }
    
})

window.addEventListener('load',()=>{
    // Turn tracing off
    window.__tracer.setTracingMode(false);
})