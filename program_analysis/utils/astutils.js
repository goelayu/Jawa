function visit(root, visitor) {
    function doVisit(nd, parent, childProp) {
        if (!nd || typeof nd !== 'object')
            return;

        if (nd.type) {
            var res = visitor(nd, doVisit, parent, childProp);
            if (res === false)
                return;
        }

        for (var p in nd) {
            // skip over magic properties
            if (!nd.hasOwnProperty(p) || p.match(/^(range|loc|attr|comments|raw|source|sourceType|parent|update|start|end)$/))
                continue;
            doVisit(nd[p], nd, p);
        }
    }

    doVisit(root);
}

var addLengthAttr = function(fn){
    fn.attr.totalLen = fn.source().length;
    var childLen = 0;
    fn.attr.childFns.forEach((c)=>{
        childLen += c.attr.totalLen;
    });
    fn.attr.selfLen = fn.attr.totalLen - childLen;
}

/* Set up `attr` field that can be used to attach attributes to
 * nodes, and fill in `enclosingFunction` and `enclosingFile`
 * attributes. */
function addMetadata(root) {
    var enclosingFunction = null, enclosingFile = null;
    // global collections containing all functions and all call sites
    root.attr.functions = [];
    root.attr.calls = [];
    visit(root, function (nd, visit, parent, childProp) {
        if (nd.type && !nd.attr)
            nd.attr = {childFns:[]};

        if (enclosingFunction)
            nd.attr.enclosingFunction = enclosingFunction;
        if (enclosingFile)
            nd.attr.enclosingFile = enclosingFile;

        if (nd.type === 'Program')
            enclosingFile = nd.attr.filename;

        if (nd.type === 'FunctionDeclaration' || nd.type === 'FunctionExpression'
            || nd.type === 'ArrowFunctionExpression') {
            root.attr.functions.push(nd);
            nd.attr.parent = parent;
            nd.attr.childProp = childProp;
            enclosingFunction && enclosingFunction.attr.childFns.push(nd);
            var old_enclosingFunction = enclosingFunction;
            enclosingFunction = nd;
            visit(nd.id);
            visit(nd.params);
            visit(nd.body);
            enclosingFunction = old_enclosingFunction;
            addLengthAttr(nd);
            return false;
        }

        if (nd.type === 'CallExpression' || nd.type === 'NewExpression')
            root.attr.calls.push(nd);
    });
}

module.exports = {
    addMetadata : addMetadata
}
