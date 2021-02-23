const falafel = require('falafel'),
    beautifier = require('js-beautify');

var getNodes = function(src, arr){
    src = beautifier.js(src);
    return falafel(src, {
        locations: true, 
        ranges: true
    }, function(node){
        arr.push(node);
    });
}

var makeId = function (path, node) {
    var loc = node.loc;
    if (!loc) {
        console.error(`No location for node`);
        return;
    }
    // console.log(loc)
    return `${path}-${loc.start.line}-${loc.start.column}-${loc.end.line}-${loc.end.column}`;
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
                node.body.update(`{\n//fnId: ${makeId(filename,node)}. fn inside file: ${filename}\n${nodeBody}}`)
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