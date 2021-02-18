/**
 * Contains utility functions for program analysis
 */
const fs = require('fs');

var mergeValsArr = function(dict){
    /**
     * Takes a dictionary where values are arrays
     * and merges them together in a single array
     */

    var arr = [];
    Object.values(dict).forEach((val)=>{
        // if (excludeXML && val.indexOf('xml')>=0) return;
        // val.forEach((v)=>{
        //     arr.push(v);
        // })
        arr = arr.concat(val);
    });
    //add the keys as well since they are the root of the call gaphs
    arr = arr.concat(Object.keys(dict).map(e=>e.split(';;;;')[1]));
    return unique(arr);
}

var unique = function(arr){
    return [...new Set(arr)];
}

var getXMLFns = function(d){
    var res = [];
    Object.keys(d).forEach((k)=>{
        if (d[k].indexOf('xml')>=0)
            res.push(k);
    });
    return res;
}

var unionArray = function(ar1, ar2){
    return [...new Set([...ar1, ...ar2])];
}

var getFileSize = function(dir){
    var filenames = fs.readdirSync(dir);
    var res = 0;
    filenames.forEach((file)=>{
        try {    
            var idFile = `${dir}/${file}/${file}`;
            res += fs.readFileSync(idFile, 'utf-8').length
        } catch (e) {
            console.log(`Error while readings ids for ${file}`);
        }
    });
    return res;
}

var categorizeFns = function(fns){
    var filenameFns = {};
    
}

var addFnBytes = function(allIds, fnIds){
    /**
     * Takes in allIds as a input which has the following type
     * { filename: {
     *      ln: [id, length]
     *  }
     * }
     */


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

var sumFnSizes = function(fns, sizes, filesToExclude){
    var res = 0;
    fns.forEach((f)=>{
        if (!sizes[f]) {
            console.error(`${f} not found`)
            return;
        }
        if (filesToExclude){
            var fnFile = f.split('-').slice(0,f.split('-').length - 4).join('-');
            if (filesToExclude.indexOf(fnFile)>=0)
                return;
        }
        res += sizes[f][1];
    });
    return res;
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
module.exports = {
    mergeValsArr : mergeValsArr,
    unionArray : unionArray,
    sumFnSizes : sumFnSizes,
    getFileSize : getFileSize,
    getXMLFns : getXMLFns
}