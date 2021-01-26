const falafel = require('falafel');

var getNodes = function(src, arr){
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

    /**
     * Construct AST from the source string
     */

    var ASTNodes = [];
    var instSrc = getNodes(src, ASTNodes);

    try {
        ASTNodes.forEach((node)=>{
            if (node.type == 'FunctionDeclaration' || node.type == 'FunctionExpression'){
                node.body.update(`
                    {//inserting comment\n
                    ${node.source()}\n
                    } 
                `)
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