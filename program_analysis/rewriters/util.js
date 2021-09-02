

var javascriptReservedWords = ['__tracer','__tracerPROXY','console','amzn_aps_csm','Promise','XMLHttpRequest','Array','abstract','arguments','await','boolean','break','byte','case','catch','char','class','const','continue','Date','debugger','default','delete','do','double','else','enum','eval','export','extends','false','Function','final','finally','float','for','Function','function','goto','if','implements','iframe','import','in','instanceof','int','interface','let','long','location','Map','native','new','null','Object','package','private','protected','public','RegExp','return','short','static','super','String','switch','Scanner','synchronized','throw','throws','transient','true','try','typeof','Uint8Array','var','void','volatile','while','with','yield', 'Maps', 'Sets','Set', 'WeakMaps', 'WeakSets', 'Int8Array', 'Uint8Array','Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array','Number', 'Math','Date', 'JSON', 'PROXY','Reflect', 'ArrayBuffer','Symbol','Error'];
var uncacheableFunctions ={"RTI":[], "antiLocal":[], "DOM":[], "ND":[]};
var options;

const COND_TO_IF_FN = "__transformed_if__";

var getArgs = function (node) {
    var args = [];
    if (node.params.length > 0){
        node.params.forEach(function (param) {
            args.push(param.source())
        });
    }
    return args;
}



/* MAJOR TODO 
don't put the entire base variable in the logs 
only put the exact variable being modified
also do alias replacement and local variable replacement before 
creating the log array*/

var matchASTNodewithRTINode = function(rtiNode, AST, options, srcMap){
    options = options;
    console.log("Trying to match rtiNode" + JSON.stringify(rtiNode),__filename);
    if (!rtiNode) return;
    var matchingNodesWithLocation = [], matchingNodesWithFnNames = [];

    var _getNameFromASTNode = function(astNode){
        if (astNode.type == "FunctionDeclaration"){
                return astNode.id.name;
        } else if(astNode.type == "FunctionExpression" || astNode.type == "ArrowFunctionExpression" || astNode.type == "NewExpression"){
                var fnName;

                //Even an expression might have an identifier
                if (astNode.id)
                    return astNode.id.name;
                //The parent could be declaration or an assignment
                if (astNode.parent.type == "VariableDeclarator"){
                    return astNode.parent.id.name;
                } else if (astNode.parent.type == "AssignmentExpression"){
                    return astNode.parent.left.name;
                } else {
                    // console.log("[matchASTNodewithRTINode] Assuming this function to be anonymous" + srcMap.get(astNode),__filename);
                    return null;
                }
                
        }
    }

    var locationCondition = function(astNode){
        //rti loc is zero based hence starts with 1
        var rtiLoc = {ln:1+rtiNode.raw.lineNumber, cn:rtiNode.raw.columnNumber},
        astLoc = {ln:0, cn:0};

        if (astNode.id){
            astLoc.ln+=astNode.id.loc.start.line;
            astLoc.cn+=astNode.id.loc.end.column;
        } else{
            //If there is no id, and it is a function expression 
            //append "function" length to column number
            astLoc.ln+=astNode.loc.start.line;
            astLoc.cn+=astNode.loc.start.column;
            astLoc.cn+=astNode.type=="FunctionExpression"?"function".length:0 
            // if (astNode.parent.type == "Property")
            //     astLoc.cn+=1;
        }
        if (options.scriptOffset)
            astLoc.ln += options.scriptOffset.offset;
        if (JSON.stringify(astLoc) == JSON.stringify(rtiLoc) && rtiNode.url.endsWith(options.origPath))
            return true;
        else {
            // console.log("[matchASTNodewithRTINode][locationCondition] No match against"  + JSON.stringify(astLoc),__filename);
            return false;
        }
    }

    var matchLocation = function(){
        var foundMatch = false;
        AST.forEach((astNode)=>{
            if (astNode.type == "FunctionExpression" || astNode.type == "FunctionDeclaration" || astNode.type == "ArrowFunctionExpression"){
                if (locationCondition(astNode)) {
                    foundMatch = true;

                    var matchedFnName = matchFunctionName(astNode);
                    if (!matchedFnName)
                        console.error("[matchASTNodewithRTINode] no fn name match despite location match for " + JSON.stringify(rtiNode.functionName));
                    else {
                        //Only add to the list of matches once both name and location match
                        matchingNodesWithLocation.push(astNode);
                        console.log("[matchASTNodewithRTINode] MATCH FOUND for rti Node "+ JSON.stringify(rtiNode.functionName),__filename);
                    }
                } 
            }
        })
        //options.path and options.origPath are same when the file is a JS file
        if (!foundMatch && options.path == options.origPath) 
            console.error("[matchASTNodewithRTINode] MATCH NOT FOUND for rti node" + JSON.stringify(rtiNode.functionName));
    
    }

    var matchFunctionName = function(astNode){
        var fnName = _getNameFromASTNode(astNode);
        if (!fnName) {
            if (rtiNode.functionName.indexOf("anonymous")>=0)
                return true;
            else {
                // console.log("[matchASTNodewithRTINode][matchFunctionName]  ast node is null, but rti node is not anonymous " +
                //  JSON.stringify(rtiNode.functionName) + " " + srcMap.get(astNode),__filename);
                return true;
            }
        }
        if (rtiNode.functionName == fnName)
            return fnName;
        else return false;
    }

    matchLocation();
    if (!matchingNodesWithLocation.length)
        return null;
    else if (matchingNodesWithLocation.length == 1)
        return matchingNodesWithLocation[0]
    else {
        console.error("[matchASTNodewithRTINode] Multiple ASTs matched with same location and function Name " + matchingNodesWithLocation.length);
        return matchingNodesWithLocation[0];
    }
}
var logReadsHelper = function(read, alias) {
    var outputArray = [];
    outputArray.push("`" + escapeRegExp(alias) + "`");
    outputArray.push(read.source());
    return outputArray;
}

var logWritesHelper = function(node, aliasValue) {
    /*Special handle for sequence expressions as their parenthesis get removed during source-ing. */
    if (node.right.type == "SequenceEpxression")
        var outputString = ",(" + node.right.source() + '),' + '\`' + aliasValue.replace(/[\`]/g, "\\$&") + '\`'; 
    var outputString = ",(" + node.right.source() + '),' + '\`' + aliasValue.replace(/[\`]/g, "\\$&") + '\`';
    return outputString;
}

/*If notCacheable is false, only returns identifiers
for cacheable functions, otherwise returns the identifier
of the first parent function*/
var getFunctionIdentifier = function(node, notCacheable) {
    if (node == null) return null;
    parent = node;
    while (parent != undefined){
        if (parent.type == "FunctionDeclaration" || parent.type == "FunctionExpression") {
            if (parent.id && parent.id.name == COND_TO_IF_FN) {
                parent = parent.parent;
                continue;
            }
            if (uncacheableFunctions["RTI"] && uncacheableFunctions["RTI"].indexOf(parent)>=0 && !notCacheable) return null
            else return parent;
        } else if (parent.type == "ArrowFunctionExpression")
        return null;
        parent = parent.parent;
    }
    return null;
}

var rewriteLogicalExprToIf = function(leNode){
    var andTemplate = `
    (function __transformed_if__(){
        var __le__ = LEFT;
        if (__le__){
            return RIGHT;
        }
        else {
            return __le__;
        }
    })BIND()
    `;
    var orTemplate = `
    (function __transformed_if__(){
        var __le__ = LEFT;
        if (!__le__){
            return RIGHT;
        }
        else {
            return __le__;
        }
    })BIND()
    `;
    var left = leNode.left.source(),
        right = leNode.right.source(),
        template = andTemplate;

    if (leNode.operator == "||")
        template = orTemplate;

    if (leNode.source().indexOf("this")>=0)
        template = template.replace('BIND','.bind(this)');
    else 
        template = template.replace('BIND','');

    return template.replace('LEFT', left).replace('RIGHT', right);
}

/*Returns the final variable which is the actual
function inside a call expresson
eg: a.b -> b
(a+b).s[2].d -> d*/
var getFinalObjectFromCallee = function(node){
    if (node.type == "Identifier" || node.type == "thisexpression")
        return node;
    if (node.type == "MemberExpression")
        return getFinalObjectFromCallee(node.object);
    return null;
}

/*
Returns identifiers or thisexpression
*/
var getIdentifierFromGenericExpression = function (node) {
    if (node == null) return null;
    else if (node.type == "Identifier") {
        return node;
    }
    else if (node.type == "MemberExpression") return getIdentifierFromGenericExpression(node.object);
    else if (node.type == "AssignmentExpression") {
            return getIdentifierFromGenericExpression(node.right);
    }
    else if (node.type == "CallExpression") return getIdentifierFromGenericExpression(node.callee);
    else if (node.type == "UnaryExpression" || node.type == "UpdateExpression") return getIdentifierFromGenericExpression(node.argument);



}

var getAllIdentifiersFromMemberExpression = function(node) {
    if (!node && node.type != "MemberExpression" && node.type != "CallExpression") return [];
    var properties = [];
    var recurseThroughProps = function(node){
        if (!node) return;
        if (node.type == "Identifier")
            properties.push(node);
        else if (node.type == "MemberExpression") {
            recurseThroughProps(node.object); 
            recurseThroughProps(node.property);
        } else if (node.type == "CallExpression") {
            recurseThroughProps(node.callee);
            node.arguments.forEach(function(arg){
                recurseThroughProps(arg);
            })
        }
    }
    recurseThroughProps(node);
    return properties;
}

/*
Returns true for member expression which are child of call expression
for example, a.b(), the node a.b returns true
however, a(b.c), here b.c doesn't return true, even though
it is a child of a call expression
*/
var isChildOfCallExpression = function(node){
    if (node == null) return;
    if (node.type == "CallExpression") return true;
    if (node.parent.type == "MemberExpression")
        return isChildOfCallExpression(node.parent)
    if (node.parent.type == "CallExpression" && !isArgofCallExpression(node))
        return isChildOfCallExpression(node.parent);
    return false;
}

/*node -> input node, x -> array of types*/
var isChildOfX = function(node,...x){
    if (node == null) return false;
    var parent = node.parent;
    while (parent != null) {
        if (x.filter(e=>e == parent.type).length > 0)
            return parent;
        parent = parent.parent;
    }
    return false
}

var isChildOfNode = function(node,p){
    if (node == null) return false;
    var parent = node;
    while (parent != null) {
        if (parent == p)
            return true;
        parent = parent.parent;
    }
    return false
}

var isChildOfVarDecl = function(node){
    if (node == null) return false;
    var parent = node;
    while (parent != null && parent.type != "BlockStatement") {
        if (parent.type == "VariableDeclarator")
            return true;
        parent = parent.parent;
    }
    return false
}

var isChildOfSeqCondExpression = function(node){
    if (node == null) return false;
    var parent = node;
    while (parent != null && parent.type != "BlockStatement") {
        if (parent.type == "SequenceExpression" || parent.type == "ConditionalExpression")
            return true;
        parent = parent.parent;
    }
    return false
}

var isArgOfFunction = function(node){
    if (node.parent.type != "FunctionDeclaration" && node.parent.type != "FunctionExpression")
        return false;

    var params = node.parent.params; 
    if (!params.length) return false;
    if (params.indexOf(node)>=0) return true;
    return false;
}

var isArgOfCE = function(node){
    if (node.parent.type != "CallExpression")
        return false;

    if (node.parent.arguments.indexOf(node)>=0)
        return true;
    return false;
}

var isChildOfFor = function(node){
    if (node == null) return false;
    var parent = node;
    while (parent != null && parent.type != "BlockStatement") {
        if (parent.type == "ForStatement")
            return true;
        parent = parent.parent;
    }
    return false
}

var isArgofCallExpression = function(node){
    var ce = node;
    var findCE = function(n){
        if (!n) return null;
        if (n.type == "CallExpression") return n;
        if (n.parent.type == "MemberExpression" || n.parent.type == "CallExpression")
            return findCE(n.parent);
        return null;
    }

    ce = findCE(node);
    if (!ce) return false;
    if (ce.arguments && ce.arguments.indexOf(node)>=0) return true;

    return false;
}

var checkForWindowObject = function(arrayOfIdentifiers){
    if (arrayOfIdentifiers == null) return 0;
    if (arrayOfIdentifiers.length == 0 ) return 0;
    arrayOfIdentifiers.forEach(function(identifier){
        if (identifier.source() == "window") return 1;
    });
    return 0;
}

var checkIfReservedWord = function(node){
    if (!node) return 0;
    return  javascriptReservedWords.includes(node.source());
}

/* fetches the identifier from the node
 by recursively referencing the object in case of member expression
 or returns null if no identifier is found
 */
var getIdentifierFromMemberExpression = function (node) {
    // console.log("Finding indentifier from member " + node.source());
    if (node.type == "Identifier"){
        return node;
    }
    else if (node.type == "MemberExpression"){
        return getIdentifierFromMemberExpression(node.object)
    } else {
        return node;
    }
}

/*Node is of the type functionDeclaration*/
var isClosureFunction = function(node){
    var parent = node.parent;
    while (parent != null){
        if (parent.type == "FunctionDeclaration" || parent.type == "FunctionExpression")
            return true;
        parent = parent.parent;
    }
    return false;
}

// var LHSContainsCall = function(node){
//     if (node.type == "MemberExpression" && node.object.type 
//         == "CallExpression") return true;

//     if (node.type == "MemberExpression" && 
//         node.object.type == "SequenceExpression" ){
//         for (var n of node.object.expressions){
//             if (n.type == "CallExpression")
//                 return true;
//         }
//     }
// }

var LHSContainsCall = function(node){
    if (!node || !node.children) return;
    var result = false;
    for (var c of node.children){
        result = result || LHSContainsCall(c);
        if (result) return result;
        if (c.type == "CallExpression"){
            result = true;
            return result;
        }
    }
    return result;
}

var nodeContainsCall = LHSContainsCall;

var getNameFromFunction = function(node){
    if (node.type == "FunctionDeclaration" && node.id)
        return node.id.source();
    if (node.parent.type == "AssignmentExpression"){
        /*if lhs contains a function call, doing it again will 
        either alter the cfg, or result in an incorrect lhs
        eg: (b,a()).i = function(){} -> might result in b.i to be set as the function
        However if you rewrite it to (b,a()).i.__getScope__ =  something. then the second invocation of 
        a() might return true, and you would have a().i.__getScope__, when a().i doesn't exist
        => Error*/
        if (LHSContainsCall(node.parent.left))
            return null;
        return node.parent.left.source();
    }
    if (node.parent.id)
        return node.parent.id.source()
    // if (node.id){
    //     if (node.type == "FunctionExpression"){
    //         Func exp node.id isn't declared in the scope
    //         example: a = function b(){}; here b is not a valid declaration, only a is
    //     }
    //     return node.id.source();
    // }
    return null;

}

var getIdentifierFromAssignmentExpression = function (node) {
    // console.log("Finding Identifier from AssignmentExpression " + node.source());
    if (node.type == "Identifier"){
        return node;
    }
    if (node.type == "AssignmentExpression"){
        return getIdentifierFromAssignmentExpression(node.right)
    }
    return null;
}

var escapeRegExp2 = function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|\']/g, "\\$&");
}

var escapeRegExp = function(str) {
    return str.replace(/[\`{}]/g, "\\$&");
}

var overWriteToString = function () {
    var s = [];
    for (var k in this) {
        if (this.hasOwnProperty(k) && typeof this[k] != 'function') s.push(k + ':' + this[k]);
    }
    return '{' + s.join() + '}';
};

/** comparator for positions in the form { line: XXX, column: YYY } */
var comparePositions = function (a, b) {
    if (a.line !== b.line) {
        return a.line < b.line ? -1 : 1;
    }
    if (a.column !== b.column) {
        return a.column < b.column ? -1 : 1;
    }
    return 0;
};

function contains(start, end, pos) {
    var startsBefore = comparePositions(start, pos) <= 0;
    var endsAfter    = comparePositions(end,   pos) >= 0;
    return startsBefore && endsAfter;
}

var containsRange = function (start1, end1, start2, end2) {
    return contains(start1, end1, start2) && contains(start1, end1, end2);
}

var customMergeDeep = function (signature1, signature2) {
    // console.log("calling custom deep merge with keys: " + Object.keys(signature1));
    for (let key in signature1){
        // console.log("iterating through the key: " + key + Object.keys(signature1));;
        if (signature1[key] && signature1[key].constructor == Array) {
            if (signature2[key]) {
                for (let elem in signature2[key]) {
                    signature1[key].push(signature2[key][elem]);
                }
            }
        } else if (signature1[key] && signature1[key].constructor == Object){
            if (signature2[key]) {
                for (let elem in signature2[key]) {
                    signature1[key][elem] = signature2[key][elem];
                }
            }
        }
    }
}

var fnContainsBranch = function(src, falafel){
    var removeInnerFunctions = function(src){
        return falafel(src, function(node){
            if ((node.type == 'FunctionDeclaration' || node.type == 'FunctionExpression') && node.parent.type != 'Program'){
                node.body.update('{}');
            }
        }).toString();
    }
    var containsCallExpression = function(src){
        try {
            var hasCallExpression = false;
            return falafel(`function a(){${src}}`, function(node){
                if (node.type == 'CallExpression') hasCallExpression = true;
            });
            return hasCallExpression;
        } catch (e){
            return false;
            }
    }
    src = removeInnerFunctions(src);
    var branches = ["IfStatement","ConditionalExpression"];
    var astNodes = [], res = [];
    falafel(src, function(node){
        astNodes.push(node);
    });
    for (var n of astNodes){
        var br = branches.find(e=>n.type == e);
        if (br){
            if ((n.consequent && containsCallExpression(n.consequent.source())) ||
                (n.alternate && containsCallExpression(n.alternate.source())))
                res.push(br);
        } 
    }
    return res;

}


var zip= rows=>rows[0].map((_,c)=>rows.map(row=>row[c]));


module.exports = {
    getArgs: getArgs,
    logReadsHelper: logReadsHelper,
    logWritesHelper: logWritesHelper,
    getAllIdentifiersFromMemberExpression:getAllIdentifiersFromMemberExpression,
    getIdentifierFromAssignmentExpression: getIdentifierFromAssignmentExpression,
    getIdentifierFromMemberExpression: getIdentifierFromMemberExpression,
    getIdentifierFromGenericExpression: getIdentifierFromGenericExpression,
    getFunctionIdentifier: getFunctionIdentifier,
    escapeRegExp2: escapeRegExp2,
    escapeRegExp: escapeRegExp,
    containsRange: containsRange,
    customMergeDeep: customMergeDeep,
    checkForWindowObject: checkForWindowObject,
    checkIfReservedWord:checkIfReservedWord,
    matchASTNodewithRTINode:matchASTNodewithRTINode,
    uncacheableFunctions: uncacheableFunctions,
    isChildOfCallExpression:isChildOfCallExpression,
    isArgofCallExpression: isArgofCallExpression,
    getFinalObjectFromCallee:getFinalObjectFromCallee,
    isClosureFunction: isClosureFunction,
    getNameFromFunction:getNameFromFunction,
    isArgOfFunction:isArgOfFunction,
    isChildOfX: isChildOfX,
    isArgOfCE:isArgOfCE,
    isChildOfNode: isChildOfNode,
    nodeContainsCall: nodeContainsCall,
    rewriteLogicalExprToIf: rewriteLogicalExprToIf,
    fnContainsBranch:fnContainsBranch
}