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

// var getElemId = function(el){
//     try {
//         var stack = [];
//         while ( el.parentNode != null ) {
//         console.log(el.nodeName);
//         var sibCount = 0;
//         var sibIndex = 0;
//         for ( var i = 0; i < el.parentNode.childNodes.length; i++ ) {
//             var sib = el.parentNode.childNodes[i];
//             if ( sib.nodeName == el.nodeName ) {
//             if ( sib === el ) {
//                 sibIndex = sibCount;
//             }
//             sibCount++;
//             }
//         }
//         if ( el.__hasAttribute('id') && el.id != '' ) {
//             stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
//         } else if ( sibCount > 1 ) {
//             stack.unshift(el.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');
//         } else {
//             stack.unshift(el.nodeName.toLowerCase());
//         }
//         el = el.parentNode;
//         }
    
//         return stack.slice(1).join('>'); // removes the html element
//     } catch (e){
//         return '#'
//     }
// }

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
    var eventListeners = getEventListeners(document);
    Object.keys(eventListeners).length != 0 && (elemId = getElemId(document)) && (__l = pl(eventListeners)) &&
    (listeners.push([elemId, __l]))
    console.log('returning the following', listeners)
    return listeners;
  })();
  
var verbose_listeners = (function listAllEventListeners() {
    let listeners = [], pl = processListeners;
    var allElements = document.querySelectorAll('*');
    const types = [];
  
    for (let i = 0; i < allElements.length; i++) {
      const currentElement = allElements[i];
      var eventListeners = getEventListeners(currentElement);
      Object.keys(eventListeners).length != 0 &&
      (listeners.push([currentElement, eventListeners]))
  
    }
    var eventListeners = getEventListeners(document);
    Object.keys(eventListeners).length != 0 &&
    (listeners.push([document, eventListeners]))
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
    ,'INPUT','FORM','HTML']

function getEventId(el, evt){
    //construct event id from element and event information
    return `${getElemId(el)}_on${evt}`;
}

function _triggerEvent(el, evt){
    var event = new Event(evt);
    // window.__tracer.setEventId(getEventId(el,evt));
    window.__tracer.cacheInit(getEventId(el,evt ));
    el.dispatchEvent && el.dispatchEvent(event);
    window.__tracer.exitFunction();
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
}

function triggerEvents(elems){
    //shuffle elements array
    shuffle(elems);

    // turn on the tracer logging
    // window.__tracer.setTracingMode(true);
    // window.__tracer.setCaptureMode('postload');

    //clear custom storage
    window.__tracer.clearCustomStorage();
    elems.forEach((_e)=>{
        try {
            var [elem, handlers] = _e;
            handlers.forEach((h)=>{
                _triggerEvent(elem, h);
                // if (h == 'click')
                //     _triggerEvent(elem, h);
            })
        } catch (e) {
            /**no op */
        }
    });
    // window.__tracer.setTracingMode(false);
}

function getCandidateElements(listeners){
    var elems = []; // each entry is a two-tupe [1st,2nd] where 1st is element, and 2nd is list of events
    listeners.forEach((l)=>{
        var [el, handler] = l;
        if (IGNORE_ELEMENTS.filter(e=>el.nodeName == e).length == 0){
            if (el && el.href && el.href != "" && !el.href.endsWith("#")) return;
        
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

var _final_elems = getCandidateElements(verbose_listeners);
// triggerEvents(elems);
// var elems = getClickableElements(verbose_listeners);
// elems.forEach((e)=>{
//     e.click();
// });

  