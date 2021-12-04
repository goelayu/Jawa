/**
 * Statically determine
 * whether a given call stack is reading any of the given values or not
 */

const falafel = require('falafel');
var fs = require('fs'),
    program = require('commander'),
    zlib = require('zlib');

program
    .option('-s, --state [state]', 'path to the js state file')
    .option('-i, --info [info]', 'path to instOutput dir containing file infos')
    .parse(process.argv);

var getCallStack = function () {
    var state = JSON.parse(fs.readFileSync(program.state, 'utf-8'));
    var callStack = {};
    Object.keys(state).forEach((elem) => {
        // var _allst = state[elem].map(e=>e[3]).filter(e=>e && typeof e == 'string'),
        //     allSt = [...new Set(_allst)];
        // callStack[elem] = allSt;
        var allst = state[elem].filter(e => e.indexOf('hash') >= 0);
        callStack[elem] = allst;
    })
    return callStack;
}

var getAllFiles = function (callStack) {
    var allFiles = new Set;
    Object.keys(callStack).forEach((elem) => {
        var cs = callStack[elem].map((f) => {
            if (f.indexOf('-hash-') < 0) return;
            var endIndx = 4;
            if (f.indexOf('-script-') >= 0)
                endIndx = 6;
            return f.split('-').slice(0, f.split('-').length - endIndx).join('-');
        });
        cs.forEach(allFiles.add, allFiles)
    });
    return [...allFiles];
}

var parseJS = function (fileStore, src, file) {
    // console.log(`parsing file of length ${src.length}`)
    var makeId = function (node) {
        var loc = node.loc;
        if (node.id) loc = node.id.loc;
        return file + '-' + loc.start.line + '-'
            + loc.start.column + '-'
            + loc.end.line + '-'
            + loc.end.column;
    }
    falafel({ source: src, locations: true }, function (node) {
        if (node.type == 'FunctionDeclaration' || node.type == 'FunctionExpression') {
            var id = makeId(node);
            fileStore[id] = node.source();
        }
    });
}

var initializeFileData = function (files) {
    var fileStore = {};
    files.forEach((file) => {
        try {
            var fileDir = `${program.info}/${file}`;
            var fileInfo = JSON.parse(fs.readFileSync(`${fileDir}/${file}`));
            // console.log(fileDir, file)
            var content = fs.readFileSync(`${fileDir}/content_full`, 'utf-8');
            // console.log(fileInfo.zip)
            // if (fileInfo.zip)
            //     content = zlib.gunzipSync(content).toString();
            parseJS(fileStore, content, file);
        } catch (e) {
            // console.log(e)
        }
    })
    return fileStore;
}

var grepCallStack = function (cs, fileStore) {
    var tokens = ["offsetX", "offsetY", "pageX", "pageY", "screenX", "screenY"],
        found = false;
    // console.log(cs);
    for (var fn of cs) {
        var fnSrc = fileStore[fn];
        // console.log(fnSrc)
        if (fnSrc && (found = tokens.find(e => fnSrc.indexOf(e) >= 0))) {
            console.log(fnSrc);
            break;
        }
    }
    return found;

}

var main = function () {
    var callStack = getCallStack();
    var allFiles = getAllFiles(callStack);
    var fileStore = initializeFileData(allFiles);
    for (var elem of Object.keys(callStack)) {
        // console.log(elem, callStack)
        // if (elem.indexOf('onmouse') < 0) continue;
        var grepRes;
        // console.log(elem)
        if (grepRes = grepCallStack(callStack[elem], fileStore)) {
            console.log(grepRes)
            return;
        }
    }
    console.log(false)
}

main();