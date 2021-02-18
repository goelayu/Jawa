/*
This module wraps all the 
global javascript code in iife (immediately
invoking javascript expressions)
*/

const util = require('./util.js'),
  signature = require('./signature.js'),
  falafel = require('falafel');

var IIFE_NAME="__ARCHIVE__"


var nonExpressionsNonStmts = ["Identifier","Literal","Element","Property","Import","Export",
"Pattern","Definition","Super","Clause", "Block"];

var stmnts = ["DoWhileStatement","ForStatement","ForInStatement","ForOfStatement","IfStatement",
"LabeledStatement","SwitchStatement","TryStatement","WhileStatement","WithStatement"];

var isChildOfStmnts = function(node){
    return util.isChildOfX(node, ...stmnts);
}

var isGlobalCode = function(node){
    return !util.isChildOfX(node, ...fnTypes);
}

var update = function (node) {
    node.update(Array.prototype.slice.call(arguments, 1).join(''));
};

var getFnFromExprs = function(node){
    if (node.type == "FunctionExpression") return node;
    if (node.type == "ExpressionStatement") return getFnFromExprs(node.expression);
    if (node.type == "CallExpression") return getFnFromExprs(node.callee);
    if (node.type == "MemberExpression") return getFnFromExprs(node.object);
    if (node.type == "UnaryExpression") return getFnFromExprs(node.argument);
}

var addNameToFn = function(node){
    var newSrc = node.source().replace(/function\s*\(/,`function ${IIFE_NAME}(`);
    update(node, newSrc);

}


var isArrayGlobalInvocs = function(arr){
    var ret = true;
    arr.forEach((exprsn)=>{
        ret && (
            ret = isGlobalInvocation(exprsn))
    });
    return ret;
}

var isGlobalInvocation = function(node){
    var _ret =  (node.expression && node.expression.type == "CallExpression" && (
        node.expression.callee.type == "FunctionExpression" || (node.expression.callee.type == "MemberExpression"
            && node.expression.callee.object.type == "FunctionExpression")
        )) || 
    (node.expression && node.expression.type == "UnaryExpression" && node.expression.argument.type == "CallExpression"
        && (
        node.expression.argument.callee.type == "FunctionExpression" || (node.expression.argument.callee.type == "MemberExpression"
            && node.expression.argument.callee.object.type == "FunctionExpression")
        )
        ); 
    // || (node.expression && node.expression.type == "SequenceExpression" && isArrayGlobalInvocs(node.expression.expressions))
    if (_ret){
        var fn = getFnFromExprs(node);
        if (fn.id)
            update(fn.id, IIFE_NAME,'__',fn.id.source());
        else addNameToFn(fn);
    }

    return false;
}

var isGlobalCodeStart = function(node){ 
    return !util.isChildOfX(node, ...fnTypes) && node.type != "FunctionDeclaration"
    // && !isGlobalInvocation(node)
    && node.type != "EmptyStatement"
    && node.type != "Program";
}

var isGlobalCodeEnd = function(node){
    return node.type == "FunctionDeclaration"
     // || isGlobalInvocation(node) || 
     || node.type == "Program";
};

var fnTypes = ["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"];

function wrap(content){
    var globalCodeRange = {s:null, e:null},
    globalStart = false;
    try {
        content = falafel(content, {
            locations:true,
            ranges:true
        }, function(node){
            if (node.type == "VariableDeclarator"){
                if (!util.isChildOfX(node, "FunctionDeclaration", "FunctionExpression","ArrowFunctionExpression")){
                    var readArray = signature.handleReads(node.init, false, true).readArray;
                    readArray.forEach((read)=>{
                        if (read.source() == node.id.source())
                            update(read, "window.",read.source());
                    })
                    if (!node.init){
                        update(node,"window.",node.id.source(),' = undefined');
                    }
                    else 
                        update(node.id,"window.",node.id.source());

                }
            }
            if (node.type == "VariableDeclaration"){
                if (!util.isChildOfX(node, "FunctionDeclaration", "FunctionExpression","ArrowFunctionExpression")){
                    update(node, node.source().replace(node.kind,""));
                }
            }
        }).toString();

        content = falafel(content,{
            locations: true,
            ranges:true
        }, function(node){
            if (!isGlobalCode(node) || nonExpressionsNonStmts.filter(e=>node.type.indexOf(e)>=0).length) return;
            if (util.isChildOfX(node, ...stmnts)) return;
            if (node.type.indexOf("Expression")>=0 && (
                node.type != "ExpressionStatement")) return;
            if (!globalStart && isGlobalCodeStart(node)){
                globalStart = true && (globalCodeRange.s = globalCodeRange.e = node)
            } else if (globalStart){
                if (isGlobalCodeEnd(node)){
                    update(globalCodeRange.s, `(function ${IIFE_NAME}(){ `,globalCodeRange.s.source());
                    update(globalCodeRange.e, globalCodeRange.e.source(), ' })();');
                    globalStart = false;
                } else 
                    globalCodeRange.e = node;
            }
        }).toString();
    } catch (e){
        console.error('error while parsing',e);
    }

    return content;
}

module.exports = {
    wrap:wrap
}