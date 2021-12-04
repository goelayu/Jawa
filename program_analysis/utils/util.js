/**
 * Contains utility functions for program analysis
 */
const fs = require('fs');
// beautifier = require('js-beautify');

var mergeValsArr = function (dict) {
    /**
     * Takes a dictionary where values are arrays
     * and merges them together in a single array
     */

    var arr = [];
    Object.values(dict).forEach((val) => {
        // if (excludeXML && val.indexOf('xml')>=0) return;
        // val.forEach((v)=>{
        //     arr.push(v);
        // })
        arr = arr.concat(val);
    });
    //add the keys as well since they are the root of the call gaphs
    arr = arr.concat(Object.keys(dict).map(e => e.split(';;;;')[1]));
    return unique(arr);
}

var unique = function (arr) {
    return [...new Set(arr)];
}

var getXMLFns = function (d) {
    var res = [];
    Object.keys(d).forEach((k) => {
        if (d[k].indexOf('xml') >= 0)
            res.push(k);
    });
    return res;
}

var unionArray = function (ar1, ar2) {
    return [...new Set([...ar1, ...ar2])];
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

/**
 * 
 * @param {string} dir
 * @returns {dictionary} allIds
 *          {
 *             fileName: {
 *                          lineNumber: [fnId, totalLen, selfLen]
 *                        }
 *          } 
 */
var getAllIds = function (dir) {
    var filenames = fs.readdirSync(dir);
    var allIds = {};
    filenames.forEach((file) => {
        try {
            var idFile = `${dir}/${file}/ids`;
            var ids = JSON.parse(fs.readFileSync(idFile, 'utf-8'));
            allIds[file] = ids;
        } catch (e) {
            console.error(`Error while readings ids for ${file}`);
        }
    });
    return allIds;
}

var getFileSize = function (dir, filenames, excluded) {
    /**
     * Returns two sizes; one some total of all the content in a file
     * Second sum total of the self lengths of all the functions in the file
     */

    var resTotal = 0, idSelfLen = 0, excludedTotal = 0;
    // console.log(`Reading # files ${filenames.length}`)
    var filenames = fs.readdirSync(dir).filter(e => e != '__metadata__');
    filenames.forEach((file) => {
        try {
            var _fileInfo = `${dir}/${file}/${file}`;
            var _idFile = `${dir}/${file}/ids`;
            var fileInfo = JSON.parse(fs.readFileSync(_fileInfo, 'ascii')); //read with ascii encoding to for consistency reasons
            var _idSelfLen = JSON.parse(fs.readFileSync(_idFile, 'utf-8'));
            idSelfLen += Object.values(_idSelfLen).reduce((acc, cur) => { return acc + cur[1] }, 0);
            resTotal += fileInfo.length;

            if (excluded && excluded.indexOf(file) >= 0)
                excludedTotal += fileInfo.length;
        } catch (e) {
            console.error(`Error while reading file: ${file}`, e);
        }
    });
    return idSelfLen;
    // return [idSelfLen, excludedTotal];
}

var getIdLen = function (allIds) {
    // returns all ids an array
    var idSrcLen = {};
    Object.values(allIds).forEach((idDict) => {
        //idDict is a dict with key as ln and values as 3-tuple (id, totalLen, selfLen)
        Object.values(idDict).forEach((idLen) => {
            idSrcLen[idLen[0]] = [idLen[1], idLen[2]];
        });
    });
    return idSrcLen;
}

var sumFnSizes = function (fns, idLen, filesToInclude, filesToExclude) {
    var res = 0, t = 0;
    fns.forEach((f) => {
        if (!idLen[f]) {
            console.error(`${f} not found`)
            return;
        }
        var endIndx = 4;
        if (f.indexOf('-script-') >= 0)
            endIndx = 6;
        var fnFile = f.split('-').slice(0, f.split('-').length - endIndx).join('-');
        if (filesToInclude) {
            if (filesToInclude.indexOf(fnFile) < 0)
                return;
        }
        if (filesToExclude) {
            if (filesToExclude.indexOf(fnFile) >= 0) {
                t += idLen[f][1];
                return;
            }
        }
        res += idLen[f][1];
        t += idLen[f][1];
    });
    // if (total){
    //     t = Object.values(idLen).reduce((acc, cur)=>{acc += cur[1]; return acc},0)
    //     return [res,t]
    // }

    // return [res,t];
    return t;
}

var all_handlers = ["abort", "blur", "change", "click", "close", "contextmenu", "dblclick", "focus",
    "input", "keydown", "keypress", "keyup", "mouseenter", "mousedown", "mouseleave", "mousemove", "mouseout",
    "mouseover", "mouseup", "reset", "resize", "scroll", "select", "submit"];

var IGNORE_ELEMENTS = ['SCRIPT', 'IFRAME', 'BODY', 'LINK', 'IMG'
    , 'INPUT', 'FORM', 'A', 'HTML']

function getCandidateElements(listeners) {
    var elems = []; // each entry is a two-tupe [1st,2nd] where 1st is element, and 2nd is list of events
    listeners.forEach((l) => {
        var [el, handler] = l;
        if (IGNORE_ELEMENTS.filter(e => el.startsWith(e)).length == 0) {
            var e = [el, []];
            Object.keys(handler).forEach((h) => {
                if (all_handlers.indexOf(h) >= 0)
                    e[1] = e[1].concat(handler[h]);
            });
            if (!e[1].length) return;
            elems.push(e);
        }
    })
    return elems;
}

var extractEvtHandlers = function (evtFile) {
    var handlers = [],
        handlerInfo = JSON.parse(fs.readFileSync(evtFile));

    var candidateHandlers = getCandidateElements(handlerInfo);
    candidateHandlers.forEach((hndls) => {
        handlers = handlers.concat(hndls[1]);
    });
    return handlers;
}
module.exports = {
    mergeValsArr: mergeValsArr,
    unionArray: unionArray,
    sumFnSizes: sumFnSizes,
    getFileSize: getFileSize,
    getXMLFns: getXMLFns,
    getAllIds: getAllIds,
    getIdLen: getIdLen
}