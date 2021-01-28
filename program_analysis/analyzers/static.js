const falafel = require('falafel'),
    beautifier = require('js-beautify');

var getNodes = function(src, arr){
    src = beautifier.js(src);
    return falafel(src, {
        loc: true, 
        range: true
    }, function(node){
        arr.push(node);
    });
}

var makeId = function(path, node){
    var loc = node.id ? node.id.loc : node.loc;
    if (!loc){
        console.error(`No location for node`);
        return;
    }
    return `${path}-${loc.start.row}-${loc.start.column}-${node.end.row}-${node.end.column}`;
}

function instrument(src, options){
    var filename = options.filename;
    var rewrite = options.rewrite;
    /**
     * Construct AST from the source string
     */

    var ASTNodes = [];
    var instSrc = getNodes(src, ASTNodes);

    try {
        ASTNodes.forEach((node)=>{
            if (node.type == 'FunctionDeclaration' || node.type == 'FunctionExpression'){
                var nodeBody = node.body.source().substring(1, node.body.source().length-1);
                node.body.update(`{\n//fn inside file: ${filename}\n${nodeBody}}`)
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