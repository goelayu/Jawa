/**
 * This code executes at runtime and captures dynamic information
 * a.k.a. the dynamic analyser
 */

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
        captureMode = 'preload' // can be either preload or postload

    this.__enter__ = function(id){
        if (!TM) return;
        // if (!(id in executionCounter))
        //     executionCounter[id] = -1;
        // executionCounter[id]++

        // var invocId = `${id}_count${executionCounter[id]}`;
        // callGraph[invocId] = [];
        // callStack.push(invocId);
        callStack.push(id);
        // if (shadowStackHead)
            // callGraph[shadowStackHead].push(invocId);
        // shadowStackHead = invocId;
        if (captureMode == 'preload'){
            allFns[captureMode].add(id);
            return;
        }

        allFns[captureMode].add(id);
        // Store functions reachable from event handlers
        if (callStack.length == 1 && !(id in evtFns))
            evtFns[id] = new Set;
        else {
            var rootEvt = callStack[0].split('_count')[0];
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
 })

window.addEventListener('load',()=>{
    // Turn tracing on 
    window.__tracer.setTracingMode(false);
})