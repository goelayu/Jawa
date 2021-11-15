const falafel = require('falafel'),
    astutils = require('../utils/astutils'),
    fs = require('fs');

var getNodes = function(src, arr){
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
    var keepFns = options.fns;
    var offset = options.offset ? options.offset : 0;
    /**
     * Construct AST from the source string
     */

    if (!keepFns.length)
        return src;

    var ASTNodes = [], 
     instSrc = getNodes(src, ASTNodes);

    // var prgNode = ASTNodes[ASTNodes.length - 1];
    // prgNode.attr = {filename: filename};
    // astutils.addMetadata(prgNode);

    try {
        ASTNodes.forEach((node)=>{
            if (node.type == 'FunctionDeclaration' || node.type == 'FunctionExpression'){
                var nodeBody = node.body.source().substring(1, node.body.source().length-1);
                var id = makeId(filename,node, offset);

                if (keepFns.indexOf(id)<0 && id.indexOf('jquery')<0){
                    /**Eliminate this function */
                    node.body.update('{}');
                }

                // var idLen = id.split('-').length;
                // var ln = Number.parseInt(id.split('-')[idLen - 4])
                // var nodeAttr = node.attr;
                // allFnIds[id] =[nodeAttr.totalLen, nodeAttr.selfLen];
                // node.body.update(
                //     `{
                //         try{
                //             __tracer.__enter__('${id}');
                //             ${nodeBody}
                //         } finally {
                //             __tracer.__exit__();
                //         }
                //     }`
                //     )
            }
        });
    } catch (e) {
        console.error(`Error while instrumenting source: ${e}`);
        return src;
    }

    return instSrc.toString();
}


module.exports = {
    instrument: instrument
}