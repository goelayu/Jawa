const falafel = require('falafel'),
    beautifier = require('js-beautify'),
    astutils = require('../../utils/astutils'),
    fs = require('fs');

var metadata = {allFnIds:{}};
var _astCache = {}; // a cache which stores functions per file

var getNodes = function(src, arr){
    src = beautifier.js(src);
    return falafel(src, {
        locations: true, 
        ranges: true
    }, function(node){
        arr.push(node);
    });
}

var makeId = function (path, node, offset) {
    var loc = node.loc;
    if (!loc) {
        console.error(`No location for node`);
        return;
    }
    // console.log(loc)
    return `${path}-${loc.start.line+offset}-${loc.start.column}-${loc.end.line+offset}-${loc.end.column}`;
}

function getFnsWithControlFlow(allNodes, srcFns, filename){
    var controlFlowFns = [];
    var controlFlowTypes = ["IfStatement","SwitchExpression","ConditionalExpression"];
    allNodes.forEach((node)=>{
        if (!node.attr) return //TODO fix this. All nodes should have attributes
        var type = node.type;
        if (controlFlowTypes.filter(e=>e == type).length){
            var _enclosingFn = node.attr.enclosingFunction;
            var enclosingFn = _enclosingFn ? makeId(filename, _enclosingFn,0) : null;
            if (enclosingFn && controlFlowFns.indexOf(enclosingFn)<0){
                var ind = srcFns.indexOf(enclosingFn);
                if (ind>=0)
                    controlFlowFns.push(enclosingFn);
            }
        }

    });
    return controlFlowFns;
}

function analyze(options){
    var filenames = options.filenames;
    var filepaths = options.filepaths;
    var fns = options.fns;

    /**
     * Construct AST from the source string
     */

    var controlFlowFns = [];

    filenames.forEach((filename,ind)=>{
        var fileFns = fns.filter(e=>e.indexOf(filename)>=0);
        var ASTNodes;
        // check file cache
        if (_astCache[filename])
            ASTNodes = _astCache[filename]
        else {
            var content = fs.readFileSync(filepaths[ind],'utf-8');
            ASTNodes = [],src = getNodes(content, ASTNodes);
            var prgNode = ASTNodes[ASTNodes.length - 1];
            prgNode.attr = {filename: filename};
            astutils.addMetadata(prgNode);
            _astCache[filename] = ASTNodes;
        }
        //get control flow functions
        var _controlFlowFns = getFnsWithControlFlow(ASTNodes, fileFns, filename);
        controlFlowFns = controlFlowFns.concat(_controlFlowFns);
    });
    return controlFlowFns;
}


module.exports = {
    analyze: analyze,
    metadata : metadata
}