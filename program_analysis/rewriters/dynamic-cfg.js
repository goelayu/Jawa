const falafel = require('falafel'),
    astutils = require('../utils/astutils'),
    globalWrapper = require('./global-code-wrapper'),
    fs = require('fs');

var metadata = {allFnIds:{}};

var getNodes = function(src, arr){
    // src = globalWrapper.wrap(src);
    // src = beautifier.js(src);
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

function instrument(src, options){
    var filename = options.filename;
    var rewrite = options.rewrite;
    var offset = options.offset ? options.offset : 0;
    /**
     * Construct AST from the source string
     */

    var ASTNodes = [], 
        allFnIds = metadata.allFnIds;
    var instSrc = getNodes(src, ASTNodes);

    var prgNode = ASTNodes[ASTNodes.length - 1];
    prgNode.attr = {filename: filename};
    astutils.addMetadata(prgNode);

    try {
        ASTNodes.forEach((node)=>{
            if (node.type == 'Program'){
                var tracerCheck = `\n(function(){if (typeof __tracer == 'undefined')
                    { 
                        if (typeof window != 'undefined') __tracer = window.top.__tracer;
                        else {__tracer = {__enter__:function(){}, __exit__:function(){}}}
                    }
                    })();\n`;
                node.update(`${tracerCheck} ${node.source()}`);
            } else if (node.type == 'FunctionDeclaration' || node.type == 'FunctionExpression'){
                var nodeBody = node.body.source().substring(1, node.body.source().length-1);
                var hackForTDecl = 'The "original" argument must be of type Function';
                if (nodeBody.indexOf(hackForTDecl)>=0) return;
                var id = makeId(filename,node, offset);
                if (id.indexOf('vendor')>=0) return;
                var idLen = id.split('-').length;
                var ln = Number.parseInt(id.split('-')[idLen - 4])
                var nodeAttr = node.attr;
                allFnIds[id] =[nodeAttr.totalLen, nodeAttr.selfLen];
                node.body.update(
                    `{
                        try{
                            __tracer.__enter__('${id}');
                            ${nodeBody}
                        } catch (e){}
                        finally {
                            __tracer.__exit__();
                        }
                    }`
                    )
            }
        });
    } catch (e) {
        console.error(`Error while instrumenting source: ${e}`);
        return src;
    }

    return instSrc.toString();
}


module.exports = {
    instrument: instrument,
    metadata : metadata
}