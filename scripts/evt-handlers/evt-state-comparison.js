/**
 * Compares event handler state
 * accesses with respect to both
 * heap and DOM state
 */

var fs = require('fs'),
    program = require('commander');

program
    .option('-s, --state [state]', 'path to the state access')
    .parse(process.argv);

var _parseState = function(state){
    var pState = {DOMS:[], global:[], closure:[]};
    state.forEach((st)=>{
        if (st[0].indexOf('DOMS')==0) pState.DOMS = st[1].filter(e=>e[1].indexOf('dispatch')<0);
        if (st[0].indexOf('global_')>=0) pState.global.push(st)
        if (st[0].indexOf('closure_')>=0) pState.closure.push(st);

    });
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
            if (g1[1] == g2[1] && isRWConflict(g1[0], g2[0]))
                return true;
        }
    }

    for (var c1 of h1.closure){
        var cs1 = getClosureScope(c1[0]);
        for (var c2 of h2.closure){
            var cs2 = getClosureScope(c2[0]);
            if (c1[1] == c2[1] && cs1 == cs2 && isRWConflict(c1[0], c2[0]))
                return true;
        }
    }
    return false;
}

var overlapDOM = function(s1, s2){
    for (var d1 of s1.DOMS){
        for (var d2 of s2.DOMS){
            if (d1[0] == d2[0] && d1[2] == d2[2] && isRWConflictDOM(d1[1], d2[1])){
                console.log(d1, d2)
                return true;
            }
        }
    }
    return false;
}

var compareState = function(state){
    var elems = Object.keys(state);
    for (var e1 of elems){
        for (var e2 of elems){
            if (e1 == e2) continue;

            if (overlapHeap(state[e1], state[e2])){
                console.log(`Heap overlap`)
                return true;
            }

            if (overlapDOM(state[e1], state[e2])){
                console.log('DOM overlap')
                return true;
            }
        }
    }
    console.log('false')
}

var main = function(){
    var state = parseState(JSON.parse(fs.readFileSync(program.state, 'utf-8')));
    compareState(state);
}

main();
