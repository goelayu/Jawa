/**
 * Compares event handler state
 * accesses with respect to both
 * heap and DOM state
 */

/**
 * Rules when state overlap doesn't matter
 * 1) If the events are paired events, i.e, they always trigger together
 * 2) q
 */

const { RSA_X931_PADDING, RSA_SSLV23_PADDING } = require('constants');
var fs = require('fs'),
    program = require('commander');

program
    .option('-s, --state [state]', 'path to the state access')
    .option('-h, --handlers [handlers]', ' path to the list of handlers')
    .parse(process.argv);


var parseHandlers = function(){
    var handlers = JSON.parse(fs.readFileSync(program.handlers));
    var eventToHandler = {};
    handlers.forEach((h)=>{
        var [elem, evtDict] = h;
        Object.keys(evtDict).forEach((evt)=>{
            var fn = evtDict[evt][0];
            var key = `${elem}_on${evt}`;
            eventToHandler[key]=fn;
        })
    });
    return eventToHandler;
}
var pruneReadsAfterWrites = function(state){
    var scopesMem = {}, final = [];
    state.forEach((st)=>{
        if (st[0].indexOf('_reads') > 0 ) return;
        var scope = st[0].split('_writes')[0];
        if (!(scope in scopesMem))
            scopesMem[scope] = [];
        scopesMem[scope].push(st[1]);
        final.push(st);
    })
    state.forEach((st)=>{
        if (st[0].indexOf('_reads') < 0 ) return;

        var scope = st[0].split('_reads')[0];
        if (scope in scopesMem && 
            scopesMem[scope].indexOf(st[1])>=0)
            return;
        final.push(st);
    })
    return final;
}

var _parseState = function(state){
    var pState = {DOMS:[], global:[], closure:[]},
        pRW = pruneReadsAfterWrites;
    state.forEach((st)=>{
        if (st[0].indexOf('jquery')>=0) return;
        if (typeof st[1] != "string" || st[1].indexOf('undefined')>=0) return;
        if (st[0].indexOf('DOMS')==0) pState.DOMS = st[1].filter(e=>e[1].indexOf('dispatch')<0);
        if (st[0].indexOf('global_')>=0) pState.global.push(st)
        if (st[0].indexOf('closure_')>=0) pState.closure.push(st);

    });
    // pState.global = pRW(pState.global);
    // pState.closure = pRW(pState.closure);
    return pState;
}

var parseState = function(state){
    var fState = {};
    Object.keys(state).forEach((elem)=>{
        fState[elem] = _parseState(state[elem]);
    });
    return fState;
}

var isRWConflict = function(type1, type2){
    if ((type1.indexOf('_read')>=0 && type2.indexOf('_write')>=0) ||
        (type2.indexOf('_read')>=0 && type1.indexOf('_write')>=0))
        return true;

    return false;
}

var isRWConflictDOM = function(type1, type2){
    if ((type1.indexOf('get')>=0 && type2.indexOf('set')>=0) ||
        (type2.indexOf('get')>=0 && type1.indexOf('set')>=0))
        return true;

    return false;
}


var getClosureScope = function(closureLog){
    var read = "_read", write = "_write";
    if (closureLog.indexOf(read)>=0)
        return closureLog.split(read)[0]
    else return closureLog.split(write)[0];
}

var overlapHeap = function(h1, h2){
    //compare global    
    for (var g1 of h1.global){
        for (var g2 of h2.global){
            if (g1[1] == g2[1] && isRWConflict(g1[0], g2[0])){
                console.log(g1, g2)
                return true;
            }
        }
    }

    for (var c1 of h1.closure){
        var cs1 = getClosureScope(c1[0]);
        for (var c2 of h2.closure){
            var cs2 = getClosureScope(c2[0]);
            if (c1[1] == c2[1] && cs1 == cs2 && isRWConflict(c1[0], c2[0])){
                console.log(c1, c2)
                return true;
            }
        }
    }
    return false;
}

var overlapDOM = function(s1, s2){
    for (var d1 of s1.DOMS){
        for (var d2 of s2.DOMS){
            if (d1[0] == d2[0] && d1[2] == d2[2] && isRWConflictDOM(d1[1], d2[1])){
                // console.log(d1, d2)
                return true;
            }
        }
    }
    return false;
}

var isPairedEvent = function(e1, e2){
    var pairs = [["mouseup", "mousedown"],["mouseleave","mousemove"], ["mousemove", "mouseup"]]
    for (p of pairs){
        if ((e1.indexOf(p[0])>=0 && e2.indexOf(p[1])>=0) ||
        (e1.indexOf(p[1])>=0 && e2.indexOf(p[0])>=0))
            return true;
    }
    return false;
}

var compareState = function(state){
    var elems = Object.keys(state);
    var eventToHandler = parseHandlers();
    for (var _e1 = 0; _e1 < elems.length-1; _e1++){
        var e1 = elems[_e1];
        if (e1.indexOf('#document_')>=0) continue;
        if (overlapHeap(state[e1], state[e1])){
            console.log(e1, e1)
            console.log(`Heap overlap`)
            return true;
        }
        for (var _e2 = _e1+1; _e2 < elems.length;_e2++){
            var e2 = elems[_e2];
            if (e2.indexOf('#document_')>=0) continue;
            if (isPairedEvent(e1,e2)) continue;
            var e1key = e1.split("_count")[0], e2key = e2.split("_count")[0];
            if (eventToHandler[e1key] == eventToHandler[e2key]) {
                // console.log('same fn')
                continue;
            }
            if (overlapHeap(state[e1], state[e2])){
                console.log(e1, e2)
                console.log(`Heap overlap`)
                return true;
            }

            if (overlapDOM(state[e1], state[e2])){
                // console.log('DOM overlap')
                return true;
            }
        }
    }
    return false;
}

var main = function(){
    var state = parseState(JSON.parse(fs.readFileSync(program.state, 'utf-8')));
    console.log(compareState(state));
}

main();
