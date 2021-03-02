const falafel = require('falafel'),
    beautifier = require('js-beautify'),
    astutils = require('../utils/astutils'),
    globalWrapper = require('./global-code-wrapper'),
    fs = require('fs');

var metadata = {allFnIds:{}};

var getNodes = function(src, arr){
    // src = globalWrapper.wrap(src);
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
                var tracerCheck = `\n(function(){if (typeof __tracer == 'undefined' && typeof window != 'undefined')
                    { __tracer = window.top.__tracer;
                    }
                    })();\n`;
                node.update(`${tracerCheck} ${node.source()}`);
            } else if (node.type == 'FunctionDeclaration' || node.type == 'FunctionExpression'){
                var nodeBody = node.body.source().substring(1, node.body.source().length-1);
                var id = makeId(filename,node, offset);
                var idLen = id.split('-').length;
                var ln = Number.parseInt(id.split('-')[idLen - 4])
                var nodeAttr = node.attr;
                allFnIds[ln] =[id,nodeAttr.totalLen, nodeAttr.selfLen];
                node.body.update(
                    `{
                        try{
                            __tracer.__enter__('${id}');
                            ${nodeBody}
                        } finally {
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