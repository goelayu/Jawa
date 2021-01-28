/**
 * This code executes at runtime and captures dynamic information
 * a.k.a. the dynamic analyser
 */

 var __tracer = new (function(){
     var TM = false;
     var shadowStackHead = null, 
        callStack = [];
        callGraph = {},
        executionCounter = {},
        evtFns = {};

    this.__enter__ = function(id){
        if (!TM) return;
        if (!(id in executionCounter))
            executionCounter[id] = -1;
        executionCounter[id]++

        var invocId = `${id}_count${executionCounter[id]}`;
        callGraph[invocId] = [];
        callStack.push(invocId);
        if (shadowStackHead)
            callGraph[shadowStackHead].push(invocId);
        shadowStackHead = invocId;

        // Store functions reachable from event handlers
        if (callStack.length == 1)
            evtFns[id] = new Set;
        else {
            var rootEvt = callStack[0].split('_count')[0];
            evtFns[rootEvt].add(id);
        }
    }

    this.__exit__ = function(){
        if (!TM) return;
        var _id = callStack.pop();
        var csLen = callStack.length;
        shadowStackHead = csLen ? callStack[csLen - 1] : null;

        //convert set to array for stringification
        if (!shadowStackHead){
            var id = _id.split('_count')[0];
            evtFns[id] = [...evtFns[id]];
        }
    }

    this.getCallGraph = function(){
        return callGraph;
    }

    this.getEvtFns = function(){
        return evtFns;
    }

    this.setTracingMode = function(mode){
        TM = mode;
    }
 })

// window.addEventListener('load',()=>{
//     // Turn tracing on 
//     window.__tracer.setTracingMode(true);
// })