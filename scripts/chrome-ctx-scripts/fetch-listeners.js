/**
 * This script fetches all event handlers registered 
 *
 */

var getElemId = function(elem){
    return elem.nodeName + (elem.id ? `#${elem.id}` : '') +
     (elem.className ? `.${elem.className}` :'');
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
  
  