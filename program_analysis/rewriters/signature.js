var scope = require('./scopeAnalyzer.js');

//Takes in a special case flag 
// when it would also consider certain expresssions 
// which have already been taken care of in the outside main AST loop

var extractIdentifiers = function(node){
        /*
    The following read types are available for the assignment expression RHS:
    - Identifier
    - Literal (ignored)
    - CallExpression
    - Object Expression 
    - Logical Expression
    - Binary Expression
    - Unary expression
    - New expression
    - Array expression
    - Memberexpression
      Function Expression
      New Expression
      updateExpression

   */
    var readArray = [];

    var readRecursively = function(node){
        // console.log("checking for " + node.source() + "with type " + node.type)
        if (node == null || node.type == "Literal")
            return;
        if (node.type == "Identifier" || node.type == "ThisExpression") {
            readArray.push(node)
            return;
        } else if (node.type == "ObjectPattern") {
            node.properties.forEach((prop)=>{
                readRecursively(prop.key);
            })

        } else if (node.type == "UnaryExpression" && node.operator != "typeof") {
                readRecursively(node.argument);
        } else if (node.type == "ConditionalExpression") {
            // readRecursively(node.test);
            // readRecursively(node.consequent);
            // readRecursively(node.alternate);
        } else if (node.type == "ObjectExpression") {
            node.properties.forEach(function(elem){
                !elem.shorthand && readRecursively(elem.value);
            });
            // readArray.push(node);
        } else if (node.type == "ArrayExpression") {
            node.elements.forEach(function (elem) {
                readRecursively(elem);
            });
            //Excluding call expression check here because it is already accounted for the in the main loop index.js
        } else if (/*node.type == "CallExpression" ||*/ node.type == "NewExpression") {
            node.arguments.forEach(function(arg){
                readRecursively(arg);
            });
            readRecursively(node.callee)
            //WTF am I doing this?
        } /*else if (node.type == "FunctionExpression") {
            node.params.forEach(function(arg){
                readRecursively(arg);
            })
        } */ else if (node.type == "AssignmentExpression"){
            /* DOn't need to handle this case, as the right hand side assignment expression will handle it's own reads during the assignment expression node type callback*/
            // readArray = handleAssignmentExpressions(node);
        } else if (node.type == "SequenceExpression"){
            node.expressions.forEach(function(exp){
                readRecursively(exp);
            })
        }
    }

    readRecursively(node);
    return readArray; 
}

var extractAllIdentifiers = function(node, isAA){
    var readArray = [];

    var readRecursively = function(node){
        // console.log("checking for " + node.source() + "with type " + node.type)
        if (node == null || node.type == "Literal")
            return;
        if (node.type == "Identifier" || node.type == "ThisExpression") {
            readArray.push(node)
            return;
        } else if (node.type == "ObjectPattern") {
            node.properties.forEach((prop)=>{
                readRecursively(prop.key);
            })

        } else if (node.type == "UnaryExpression" && node.operator != "typeof") {
                readRecursively(node.argument);
        } else if (node.type == "ConditionalExpression") {
            readRecursively(node.test);
            readRecursively(node.consequent);
            readRecursively(node.alternate);
        } else if (node.type == "ObjectExpression") {
            node.properties.forEach(function(elem){
                !elem.shorthand && (readRecursively(elem.value));
            });
            // readArray.push(node);
        } else if (node.type == "ArrayExpression") {
            node.elements.forEach(function (elem) {
                readRecursively(elem);
            });
            //Excluding call expression check here because it is already accounted for the in the main loop index.js
        } else if (node.type == "NewExpression") {
            node.arguments.forEach(function(arg){
                readRecursively(arg);
            });
            readRecursively(node.callee);
        } else if (node.type == "CallExpression"){
            /*
            Not traversing arguments, because already doing that separately inside the main loop
            This traveral is during static analysis, the one in the main loop is for the dynamic
            analysis. DA is the right way to go.
            */
            readRecursively(node.callee);
            if (isAA) {
                node.arguments.forEach(function(arg){
                    readRecursively(arg);
                });
            }
        } else if (node.type == "FunctionExpression") {
            node.params.forEach(function(arg){
                readRecursively(arg);
            })
            /*Don't need to extract anything from inside the function body*/
            // node.body.body.forEach(function(arg){
            //     readRecursively(arg);
            // });
        }  else if (node.type == "AssignmentExpression" || node.type == "BinaryExpression" || node.type == "LogicalExpression"){
            readRecursively(node.left);
            readRecursively(node.right);
            /* DOn't need to handle this case, as the right hand side assignment expression will handle it's own reads during the assignment expression node type callback*/
            // readArray = handleAssignmentExpressions(node);
        } else if (node.type == "SequenceExpression"){
            node.expressions.forEach(function(exp){
                readRecursively(exp);
            })
        } else if (node.type == "CallExpression"){
            readRecursively(node.callee);
            node.arguments.forEach(function(arg){
                readRecursively(arg);
            });
        } else if (node.type == "MemberExpression"){
            readRecursively(node.object);
            if (node.computed)
                readRecursively(node.property);
        } else if (node.type == "ExpressionStatement")
            readRecursively(node.expression);
    }

    readRecursively(node);
    return readArray; 
}

var isParamOfFunction = function(node){
    //Find the first parent of the type function expression or declaration
    // and test whether it is a param of that immediate function parent
    var parent = node;
    var isParam = false;
    while (parent != null && parent.type != "FunctionExpression" && parent.type != "FunctionDeclaration")
        parent = parent.parent;
    if (parent != null) {
        parent.params.forEach((param)=>{
            if (param == node)
                isParam = true;
        })
    }
    return isParam;
}
var handleReads = function(node, haveIds, all, isAA) {
    // console.log("handling for reads: " +  node.source() + " " + node.type);
    var readArray;
    if (haveIds)
        readArray = [node];
    else if (!all) readArray = extractIdentifiers(node);
    else readArray = extractAllIdentifiers(node, isAA);
    if (readArray == null) return {readArray: [], local: [], argReads: [], antiLocal: []};
    var globalReads = [];
    var argReads = [];
    var antiLocal = [];
    var localReads = [];
    readArray.forEach(function(read){
        if (!read) return;
        var _isLocal = scope.IsLocalVariable(read)
        if (typeof _isLocal == "object")
            antiLocal.push([read, _isLocal]);
        else if (_isLocal == -3  )
            globalReads.push(read);
        else if (_isLocal >= 0) {
            if (!isParamOfFunction(read))
                argReads.push({ind:_isLocal,val:read});
        } else if (_isLocal == -2)
            localReads.push(read);
    });
    return {readArray: globalReads, local: localReads, argReads: argReads, antiLocal: antiLocal};
}

module.exports = {
    handleReads: handleReads,
    extractIdentifiers: extractIdentifiers
}