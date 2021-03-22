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

    // var _plt_super = {
    //     "addEventListener": Element.prototype.addEventListener,
    //     "removeEventListener": Element.prototype.removeEventListener,
    // };
    
    // var plt_handlerFieldName = "plt-handlers";

    // elem_with_events = new Set;
    
    // // Update element state when a listener is added.
    // // For each element, we keep track of all unique functions (determined by the function's toString())
    // // for each type and useCapture option, which matches what the browser does.
    // // 'replace' is true if the existing handler(s) should be replaced with this one.
    // function plt_registerListener(el, type, listener, useCapture, replace=false) {
    //     elem_with_events.add(el);
    //     var handlers = el[plt_handlerFieldName];
    //     if (!handlers) {
    //         handlers = {};
    //     }
    //     var uc = useCapture ? "1" : "0";
    //     if (!handlers[uc]) {
    //         handlers[uc] = {};
    //     }
    //     if (!handlers[uc][type]) {
    //         handlers[uc][type] = [];
    //     }
    //     for (var ix in handlers[uc][type]) {
    //         if (handlers[uc][type][ix] == listener) {
    //             return;
    //         }
    //     }
    //     if (replace) {
    //         handlers[uc][type] = [listener];
    //     } else {
    //         handlers[uc][type].push(listener);
    //     }
    //     el[plt_handlerFieldName] = handlers;
    //     Object.defineProperty(el, plt_handlerFieldName, {enumerable: false});
    // }
    
    // // Update element state when a listener is removed.
    // // 'clearAll' is true if we should wipe all event handlers for this event type (in which case 'listeners' is never used).
    // function plt_deregisterListener(el, type, listener, useCapture, clearAll=false) {
    //     var handlers = el[plt_handlerFieldName];
    //     if (!handlers) {
    //         return;
    //     }
    //     var uc = useCapture ? "1" : "0";
    //     if (handlers && handlers[uc] && handlers[uc][type]) {
    //         if (clearAll) {
    //             handlers[uc].delete(type);
    //         } else {
    //             for (var i = 0; i < handlers[uc][type].length; i++) {
    //                 if (handlers[uc][type][i] == listener) {
    //                     handlers[uc][type].splice(i, 1);
    //                 }
    //             }
    //         }
    //     }
    //     el[plt_handlerFieldName] = handlers;
    // }
    
    // // All possible handler-triggering events. Don't modify.
    // // Source: https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers and some from
    // // https://developer.mozilla.org/en-US/docs/Web/Events.
    // var plt_allEventHandlers = ["onabort", "onblur", "onchange", "onclick", "onclose", "oncontextmenu", "ondblclick", "onerror", "onfocus",
    //     "oninput", "onkeydown", "onkeypress", "onkeyup", "onload", "onmouseenter", "onmousedown", "onmouseleave", "onmousemove", "onmouseout",
    //     "onmouseover", "onmouseup", "onreset", "onresize", "onscroll", "onselect", "onsubmit" ];
    
    // EventTargetProtos = [Element.prototype, Document.prototype]
    
    // // Override addEventListener and removeEventListener to use our register / deregister functions first.
    // EventTargetProtos.forEach((proto)=>{
    //     proto["addEventListener"] = function(type, listener, useCapture) {
    //         plt_registerListener(this, type, listener, useCapture);
    //         _plt_super["addEventListener"].apply(this, arguments);
    //     }
        
    //     proto["removeEventListener"] = function(type, listener, useCapture) {
    //         plt_deregisterListener(this, type, listener, useCapture);
    //         _plt_super["removeEventListener"].apply(this, arguments);
    //     }
        
    // });
  
    // // Manually override the event listeners set by assigning to object fields.
    // // Note that 'evt' in this case is of the form "onclick" instead of the "click" argument of
    // // addEventListener, so the map entries for these two ways to add event listeners will not overlap.
    // plt_allEventHandlers.forEach(function(evt) {
    //     [HTMLElement.prototype, Document.prototype].forEach(function(prt) {
    //         var oldSetter = Object.getOwnPropertyDescriptor(prt, evt).set;
    //         Object.defineProperty(prt, evt, {
    //             set: function(h) {
    //                 if (h != null) {
    //                     plt_registerListener(this, evt, h, false, true);
    //                 } else {
    //                     // Wipe all listeners for this event type.
    //                     plt_deregisterListener(this, evt, h, false, true);
    //                 }
    //                 oldSetter.call(this, h);
    //             }});
    //     });
    // });
})();

if (!window.top.__tracer){
    __declareTracer__();
} else {
    window.__tracer = window.top.__tracer;
}

function __declareTracer__(){
    window.__tracer = new (function(){
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
            callStack.push(`${curEvt};;;;${id}`);
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
                evtFns[`${curEvt};;;;${id}`] = new Set;
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
            var res =  _getEvtFns(evtFns);
            //empty event dict
            evtFns = {};
            return res;
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
}

if (window == window.top){
    window.addEventListener('load',()=>{
        // Turn tracing off
        window.__tracer.setTracingMode(false);
    })

    window.addEventListener('beforeunload', function(e){
        e.preventDefault();
        console.log(`cancelling navigation`);
        return "";
    })
}