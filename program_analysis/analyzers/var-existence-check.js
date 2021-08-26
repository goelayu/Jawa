const falafel = require('falafel'),
    utils = require('../rewriters/util');
const util = require('../rewriters/util');

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

function instrument(src, options){
    var filename = options.filename;
    var target = options.target;

    /**
     * Construct AST from the source string
     */

    var ASTNodes = [], isSafeRead = false;
    
    getNodes(src, ASTNodes);

    var existenceNodes = ["IfStatement", "LogicalExpression", "ConditionalExpression","SwitchStatement","TryStatement","WhileStatement"];
    try {
        ASTNodes.forEach((node)=>{
            if (node.type != 'Identifier') return;
            if (node.source() == target){
                console.log(node.source())
                if (util.isChildOfX(node, ...existenceNodes))
                    isSafeRead = true;
            }

        });
    } catch (e) {
        console.error(`Error while instrumenting source: ${e}`);
        return false;
    }

    metadata.isSafeRead = isSafeRead;
    return isSafeRead;
}


module.exports = {
    instrument: instrument,
    metadata : metadata
}