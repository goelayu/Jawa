/**
 * This script fetches all event handlers registered 
 *
 */

var getElemId = function(elem){
    var id =  elem.nodeName + (elem.id ? `#${elem.id}` : '') +
     (elem.className ? `.${elem.className}` :'');
    if (elem.nodeName == 'A')
        id += `#href:${elem.href}`;
    return id;
}

/**
 * Takes in the listeners and returns only the source of each handler
 * @param { response from getEventListeners} listeners 
 */
var processListeners = function(listeners){
    var pr = {};
    Object.keys(listeners).forEach((evt)=>{
        pr[evt] = [];
        var evtHndlr = listeners[evt];
        evtHndlr.forEach((h)=>{
            pr[evt].push(h.listener.toString());
        });
    })
    return pr;
}

var archive_listeners = (function listAllEventListeners() {
    let listeners = [], pl = processListeners;
    const allElements = document.querySelectorAll('*');
    const types = [];
  
    for (let i = 0; i < allElements.length; i++) {
      const currentElement = allElements[i];
      var eventListeners = getEventListeners(currentElement);
      Object.keys(eventListeners).length != 0 && (elemId = getElemId(currentElement)) && (__l = pl(eventListeners)) &&
      (listeners.push([elemId, __l]))
  
    }
    console.log('returning the following', listeners)
    return listeners;
  })();
  
var verbose_listeners = (function listAllEventListeners() {
    let listeners = [], pl = processListeners;
    const allElements = document.querySelectorAll('*');
    const types = [];
  
    for (let i = 0; i < allElements.length; i++) {
      const currentElement = allElements[i];
      var eventListeners = getEventListeners(currentElement);
      Object.keys(eventListeners).length != 0 &&
      (listeners.push([currentElement, eventListeners]))
  
    }
    return listeners;
  })();

function isHidden(elem){
    try {
        var rect = elem.getBoundingClientRect()
        return elem.style.display == 'none'
            || elem.style.visibility == 'hidden'
            || rect.left >= window.innerWidth 
            || rect.right <= 0
            || rect.top >= window.innerHeight 
            || rect.bottom <= 0
    } catch (e) {
        return true;
    }
}

var all_handlers = ["abort", "blur", "change", "click", "close", "contextmenu", "dblclick", "focus",
    "input", "keydown", "keypress", "keyup", "mouseenter", "mousedown", "mouseleave", "mousemove", "mouseout",
    "mouseover", "mouseup", "reset", "resize", "scroll", "select", "submit" ];

var IGNORE_ELEMENTS = ['SCRIPT', 'IFRAME', 'BODY','LINK','IMG'
    ,'INPUT','FORM','A','HTML']

function _triggerEvent(el, evt){
    var event = new Event(evt);
    el.dispatchEvent && el.dispatchEvent(event);
}

function triggerEvents(elems){
    // turn on the tracer logging
    window.__tracer.setTracingMode(true);
    elems.forEach((_e)=>{
        try {
            var [elem, handlers] = _e;
            handlers.forEach((h)=>{
                _triggerEvent(elem, h);
            })
        } finally {
            /**no op */
        }
    });
    window.__tracer.setTracingMode(false);
}

function getCandidateElements(listeners){
    var elems = []; // each entry is a two-tupe [1st,2nd] where 1st is element, and 2nd is list of events
    listeners.forEach((l)=>{
        var [el, handler] = l;
        if (IGNORE_ELEMENTS.filter(e=>el.nodeName == e).length == 0){
            var e = [el, []];
            Object.keys(handler).forEach((h)=>{
                if (all_handlers.indexOf(h)>=0)
                    e[1].push(h);
            });
            if (!e[1].length) return;
            elems.push(e);
        }
    })
    return elems;
}

function getClickableElements(listeners){
    var elems = [];
    listeners.forEach((l)=>{
        var [el, handler] = l;
        if (el.click && Object.keys(handler).indexOf('click')>=0
            && el.nodeName != "A" && !isHidden(el))
            elems.push(el);
    });
    return elems;
}

var elems = getCandidateElements(verbose_listeners);
triggerEvents(elems);
// var elems = getClickableElements(verbose_listeners);
// elems.forEach((e)=>{
//     e.click();
// });

  