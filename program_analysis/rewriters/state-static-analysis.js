

var falafel = require('falafel');
console.log(require.resolve('falafel'));
// var falafelMap = require('falafel-map');
var fs = require('fs');
var basename = require('path').basename;
var esprima = require('esprima');
var mergeDeep = require('deepmerge');
var scope = require('./scopeAnalyzer.js');
var util = require('./util.js');
var signature = require('./signature.js');
var properties = require ("properties");
var e2eTesting = false;
var path = require('path');
var babel = require('babel-core');
var globalWrapper = require('./global-code-wrapper.js');
var scriptName = path.basename(__filename);
var functionCounter = 0;
var minFunctionTime = 2;// Minimum function time worth replaying is 2ms -> emperically decided
// Use to store simple function names indexed by their complex counterparts
var simpleFunctions = {};
var uncacheableFunctions = util.uncacheableFunctions;
var propertyObj = {};
const PATH_TO_PROPERTIES = __dirname + "/DOMHelper.ini",
	 COND_TO_IF_FN = "__transformed_if__";
properties.parse(PATH_TO_PROPERTIES, {path: true, sections: true}, function(err, obj){ propertyObj = obj ;})

var logPrefix;
var _oldLogger = console;
var staticInfo = {};
staticInfo.rtiDebugInfo = {totalNodes:[], matchedNodes:[], ALLUrls : [], matchedUrls: []};
staticInfo.uncacheableFunctions = uncacheableFunctions;


var IIFE_NAME="__HORCRUX__";

// console.error = function(){
// 	var args = [scriptName];
// 	args = args.concat(Array.from(arguments));
// 	_oldLogger.error.apply(this, args);
// }
// adds keys from options to defaultOptions, overwriting on conflicts & returning defaultOptions
function mergeInto(options, defaultOptions) {
	for (var key in options) {
		if (options[key] !== undefined) {
			defaultOptions[key] = options[key];
		}
	}
	return defaultOptions;
}

function template(s, vars) {
	for (var p in vars) {
		s = s.replace(new RegExp('{' + p + '}', 'g'), vars[p]);
	}
	return s;
}

function topKFromRTI(rti, k){
	var ignoreRTI = ["program", "idle", "garbage collector"]
	var ignoreURLS = ["extensions::"]
	var sortedRTI = rti.sort((a,b)=>{return b.self - a.self});
	var relevantRTI = [], percent =0, rtiLength = sortedRTI.length, rtiCounter =0;
	for (var rtiIter = 0; rtiIter < rtiLength && percent <= k ; rtiIter++) {
		var curFn = sortedRTI[rtiIter]
		if (ignoreRTI.filter(fn => curFn.functionName.indexOf(fn)>=0).length > 0 || 
			ignoreURLS.filter(url => curFn.url.indexOf(url)>=0).length>0)
			continue;
		relevantRTI.push(curFn);
		rtiCounter++;
		percent = (rtiCounter/rtiLength)*100;
	}
	// console.log(rtiCounter +  "of " rtiLength + "gives us " + JSON.stringify(relevantRTI));
	return relevantRTI;
}	

function userDefinedFunctions(rti){
	return rti.map((node)=>{if (node.url.startsWith("http")) return node}).filter((node=>{ if (node) return node}));
}


/**
 * options:
 *   name (__tracer): name for the global tracer object
 *   nodejs (false): true to enable Node.js-specific functionality
 *   maxInvocationsPerTick (4096): stop collecting trace information for a tick
 *       with more than this many invocations
 **/
function instrumentationPrefix(options, pattern) {
	options = mergeInto(options, {
		name: '__tracer',
		nodejs: false,
		maxInvocationsPerTick: 28192,
	});

	var tracerFile = pattern == "cg" ? "/tracer.js" : "/tracer.js";
	// the inline comments below are markers for building the browser version of fondue
	var tracerSource = /*tracer.js{*/fs.readFileSync(__dirname + tracerFile, 'utf8')/*}tracer.js*/;
	// if (!options.proxyName){
	// 	// options.proxyName = options.name +"PROXY";
	// 	options.proxyName = ""
	// }
	var s = template(tracerSource, {
		name: options.name,
		version: JSON.stringify(require('./package.json').version),
		nodejs: options.nodejs,
		maxInvocationsPerTick: options.maxInvocationsPerTick,
		e2eTesting: options.e2eTesting,
		proxyName: options.proxyName,
		pageLoaded: options.pageLoaded,
		invocation_limit:options.invocation_limit,
		instrumentationPattern:JSON.stringify(options.pattern)
	});

	// Object.keys(uncacheableFunctions).forEach((reason)=>{
	// 	s = s.replace(new RegExp('{'+reason+'}', 'g'), JSON.stringify(staticInfo.staticUncacheableFunctions[reason]));
	// });

	return s;
}

var unique = function(arr){
    return [...new Set(arr) ]; 
}

/**
 * options:
 *   path (<anonymous>): path of the source being instrumented
 *       (should be unique if multiple instrumented files are to be run together)
 *   include_prefix (true): include the instrumentation thunk
 *   tracer_name (__tracer): name for the global tracer object
 *   nodejs (false): true to enable Node.js-specific functionality
 *   maxInvocationsPerTick (4096): stop collecting trace information for a tick
 *       with more than this many invocations
 **/
function instrument(src, options) {
	// Since the fondue module is loaded once, re initialize the counter for every new src file
	functionCounter = 0;
	logPrefix = options.origPath;
	// The following code snippet incorporates runtime information if provided
	if (options.rti) {
		var percent = 20;
		console.log("[instrument] List of functions to be instrumented " + JSON.stringify(options.rti.map(el=> el.functionName)));
		//Need exact url match, hence append path with ".com"
		var urlMatchEndRegex = new RegExp("\\..{2,3}" + util.escapeRegExp2(options.origPath),'g');
		var urlMatchExactRegex = new RegExp("https?\:\/\/" + options.origPath);
		var _logStringRTI = options.rti.map((el)=>{ if(el.url.match(urlMatchEndRegex) || el.url.match(urlMatchExactRegex))return el.functionName}).filter(fn => fn != null);
		options.myRti = options.rti.map((el)=>{ if(el.url.match(urlMatchEndRegex) || el.url.match(urlMatchExactRegex)) return el}).filter(fn => fn != null);
		console.log("[instrument] Only instrumenting the following functions from the current script: " + options.origPath + " : " + JSON.stringify(_logStringRTI));

		// Logging matching information
		staticInfo.rtiDebugInfo.totalNodes = (options.myRti);
		var ALLUrls = options.rti.map((el)=>{return el.url}).filter((el,ind,self)=>self.indexOf(el)==ind);
		var matchedUrls = options.myRti.map((el)=>{return el.url}).filter((el,ind,self)=>self.indexOf(el)==ind);
		staticInfo.rtiDebugInfo.ALLUrls = ALLUrls;
		staticInfo.rtiDebugInfo.matchedUrls = staticInfo.rtiDebugInfo.matchedUrls.concat(matchedUrls);
	} else if (options.cg){
		console.log("List of functions to be instrumented: " + options.cg.length);
		options.myCg = options.cg.filter(node=>node.indexOf(options.path+"-")>=0);
		options.myCg = unique(options.myCg)
		if (options.e2eTesting) options.myCg = options.cg;
		staticInfo.rtiDebugInfo.totalNodes = staticInfo.rtiDebugInfo.totalNodes.concat(options.myCg);
		console.log("Only instrumenting the following functions from the current script " + options.myCg);
	}

	var defaultOptions = {
		useProxy: true,
		tracer_name: '__tracer',
		e2eTesting: false,
	};
	options.path = options.filename;
	e2eTesting = options.e2eTesting;
	options = mergeInto(options, defaultOptions);
	var prefix = '', shebang = '', output, m;

	if (m = /^(#![^\n]+)\n/.exec(src)) {
		shebang = m[1];
		src = src.slice(shebang.length);
	}
	// console.log(options);
	options.proxyName = '__tracerPROXY'
	if (options.include_prefix) {
		prefix += instrumentationPrefix(options);
		options.prefix = prefix;
		// console.log(options.prefix);
	}

	if (src.indexOf("/*theseus" + " instrument: false */") !== -1) {
		output = shebang + prefix + src;
	} else {
		var m = traceFilter(src, options);
		output = {
			map: m.map,
			toString: function () {
				return shebang + m.toString();
			},
		};
	}

	return output.toString();
}



var makeId = function (type, path, node) {
	if (node.id)
		var loc = node.id.loc;
	else var loc = node.loc
	if (e2eTesting) {
		// console.log(functionCounter);
		var origPath = path + '-'
	     + type + '-'
	     + loc.start.line + '-'
	     + loc.start.column + '-'
	     + loc.end.line + '-'
	     + loc.end.column;
	    if (simpleFunctions[origPath])
	    	return simpleFunctions[origPath];
	    var name = node.id != undefined ? node.id.name : "function"
		
		// functionCounter = functionCounter + 1;
		// console.log( " function counter is " + functionCounter)
		// simpleFunctions[origPath] = id;
		return name;
	}

	return path + '-'
	     + type + '-'
	     + loc.start.line + '-'
	     + loc.start.column + '-'
	     + loc.end.line + '-'
	     + loc.end.column;
};

RegExp.escape= function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

var traceFilter = function (content, options) {
	// console.log(options)
	if (content.trim() === '') {
		return content;
	}
	var defaultOptions = {
		path: '<anonymous>',
		prefix: '',
		tracer_name: '__tracer',
		trace_function_entry: true,
		trace_function_creation: false,
		trace_function_calls: false,
		trace_branches: false,
		trace_switches: false,
		trace_loops: false,
		source_map: false,
		execution_cache_toggle : 0,
	};
	options = mergeInto(options, defaultOptions);

	var processed = content;

	try {
		var fala, update, sourceNodes, functionNameToLocation = {}; // Dictionary: key is function name, value is an array containing all the locations it was defined. 
		var inBuiltOverrides = ["tostring", "tojson", "toprimitive","typeof"];
		var isInBuiltFunction = function(fn){
			if (!fn)
				return false;
			try {
				var _e = eval(fn);
				if (typeof _e == "function")
					return true;
				return false;
			} catch (e){
				return false;
			}
		}
		var ASTNodes = []; // List of all the nodes in the abstract syntax tree
		var ASTSourceMap = new Map();
		var functionToCallees = {};
		var functionsContainingThis = [];
		var functionToNonLocals = {}, functionAliasMap = {}, functionIBFArgs = {}, functionIBFArgsCounter = 0,
			functionsVarDecl = {}, ceToFinalExpression = new Map()
			functionToDOMtracking = {},
			nodeFutureModified = null;
		var fala = function () {
			var m = falafel.apply(this, arguments);
			return {
				map: function () { return '' },
				chunks: m.chunks,
				toString: function () { return m.toString() },
			};
		};
		var update = function (node) {
			node.update(Array.prototype.slice.call(arguments, 1).join(''));
		};
		var sourceNodes = function (node) {
			return node.source();
		};

		var addCalleesToCaller = function(node){

			// This scenario will be handled in the second pass itself, as this function is declared and invoked at the same time. 
			if (node.callee.type == "FunctionExpression")
				return

			parent = node.parent;
			while (parent != undefined ) {
				if ((parent.type == "FunctionDeclaration" || parent.type == "FunctionExpression")){
					var functionName;
					if (parent.id) functionName = parent.id.name;
					else {
						if (parent.parent.type == "VariableDeclarator")
							functionName = parent.parent.id.name;
						else if (parent.parent.type == "AssignmentExpression") {
							functionName = parent.parent.left.source();
						}				
					}
					if (functionName){
						if (functionToCallees[functionName] == undefined)
							functionToCallees[functionName] = [];
						if (functionToCallees[functionName].indexOf(node.callee.source()) < 0)
							functionToCallees[functionName].push(node.callee.source());
					}
					return;
				}
				parent = parent.parent;
			}
		}

		var childrenOfConditionalExpression = function(node) {
			parent = node.parent;
			while (parent != undefined ) {
				if (parent.type == "ConditionalExpression") return true;
				parent = parent.parent;
			}
			return false;
		}

		// Handle propagation for those callees with multiple declaration sites TODO
		var propogateSignature = function (node) {
			if (node == undefined || node == null) return;

			var functionName;
			if (node.id) functionName = node.id.name;
			else {
				if (node.parent.type == "VariableDeclarator")
					functionName = node.parent.id.name;
				else if (node.parent.type == "AssignmentExpression") {
					functionName = node.parent.left.source();
				}				
			}
			_propogateSignature(functionName, node);
		}

		var _propogateSignature = function(functionName, node) {
			if (functionName && functionToCallees[functionName]){
				functionToCallees[functionName].forEach(function(callee){
					if (functionName != callee && !( functionToCallees[callee] && functionToCallees[callee].indexOf(functionName) >= 0) ) {
						var metadata;
						if (functionNameToLocation[callee]){
							metadata = makeId('function', options.path, functionNameToLocation[callee][0]);
						}
						// console.log("metadata is " + metadata + " propogating: " + functionToMetadata[metadata]);
						if (metadata) {
							util.customMergeDeep(functionToMetadata[makeId('function', options.path, node.loc)],functionToMetadata[metadata])
						}
						_propogateSignature(callee, node);
					}
				})
			}
		}

		var printFriendlyAlias = function(obj) {
			var output = {};
			for (let key in obj){
				output[key] = obj[key].source();
			}

			return output;
		}

		var isNonDeterminist = function(src) {
			return ((src.indexOf("random") >= 0) || (src.indexOf("Date") >= 0));
		}

		var rewriteArguments = function(argReads){
			argReads.forEach((arg)=>{
				var proxyPrefix = "argumentProxy[";
				var argIndex = arg.ind;
				var argNode = arg.val;
				update(argNode, proxyPrefix+argIndex+ "]");
			})
		}

		var rewriteGlobals = function(globalArr){
			globalArr.forEach(function(read){
				if (options.useProxy){
					if (read.source() == "arguments"){
						return;
					}
					if (util.checkIfReservedWord(read) || read.source()=="this") return;
					if (read.source() == "window")
						update(read, options.proxyName)
					else
						update(read, options.proxyName, '.', read.source());
				}
					
			});
		}

		var rewriteClosure = (function(){
				var scopeCounter = 0,
					scopeToNId = new Map,
					scopeToPathId = new Map,
					idToVars = new Map; //indexed by the function which accesses the anti local variables
					scopeToVars = new Map; // same as above, however directly indexed by the scope
				var _fn = function(closureArr, fId){
					closureArr.forEach((c)=>{
						var [node, scope] = c;
						var _s = scopeToNId.get(scope);
						if (!_s){
							var _idx_path = makeId('function', options.path, scope);
							scopeToNId.set(scope,'closureScope'+scopeCounter++);
							_s = scopeToNId.get(scope);
							scopeToPathId.set(_s, _idx_path);
						}
						var __s;
						if (!(__s = scopeToVars.get(scope))){
							scopeToVars.set(scope, new Set);
							__s = scopeToVars.get(scope);
						}
						__s.add(node.source());
						var _fnVars;
						if (!(_fnVars = idToVars.get(fId))){
							idToVars.set(fId ,{});
							_fnVars = idToVars.get(fId);
						}

						var _vars = _fnVars[_s];
						if (!_vars){
							_vars = idToVars.get(fId)[_s] = [];
						}
						_vars.push(node);
						update(node, _s,'.',node.source());
					});
				};

				_fn.insertClosureProxy = function(fId,src){
					var _idToVars = idToVars.get(fId);
					var closureDecl = "", closureObjStr = "";
					if (!_idToVars) return 0;
					_idToVars &&  Object.keys(_idToVars).forEach((s)=>{
						var _idx = s.split('closureScope')[1];
						var _idx_path = scopeToPathId.get(s);
						closureDecl += `var ${s} =  ${options.tracer_name}.createClosureProxy(__closureObj${_idx} ,'${_idx_path}');\n`;
						var closureVars = _idToVars[s].map((el)=>{return ASTSourceMap.get(el)});
						closureObjStr += `var __closureObj${_idx} = {__isClosureObj:true,`;
						closureVars.forEach((v)=>{
							closureObjStr += `${v} : ${v},`
							closureObjStr += `set_${v} : function(o){${v} = o},`
						});
						closureObjStr += '};\n'
					});
					
					update(fId.body, closureObjStr, closureDecl, src);
                    update(fId.body, '{', fId.body.source(), '}');
					return 1;
				}

				_fn.insertClosureObj = function(fId, src){
					var vars = scopeToVars.get(fId);
					if (!vars) return 0;
					var arrVars = [...vars],
						_id = scopeToNId.get(fId),
						id = _id.split('closureScope')[1];
						closureObjStr = `var __closureObj${id} = {`;

					arrVars.forEach((v)=>{
						closureObjStr += `${v} : ${v},`;
						closureObjStr += `set_${v} : function(o){${v} = o},`
					});
					closureObjStr += '};\n'
					update(fId.body, src, closureObjStr);
					return 1;
				}
				return _fn;
			})();

		var _insertArgumentProxy = function(argumentObj){
			var outStr ='var argumentProxy = ' + options.tracer_name +'.createArgumentProxy(arguments);\n';
			// for (var i=0;i<argumentObj.length;i++){
			// 	let argProxyStr =  argumentObj[i].source() + " = argumentProxy[" + i + "];\n"
			// 	outStr+=argProxyStr;
			// }
			return outStr;
		}

		var insertArgumentProxy = function(fnNode){
			var nodeBody = fnNode.body.source().substring(1, fnNode.body.source().length-1);
			var argProxyStr = _insertArgumentProxy(fnNode.params);
			update(fnNode.body, argProxyStr, nodeBody);
		}

		var insertThisProxy = function(){
			var proxyStr = 'var thisProxy = ' + options.tracer_name + '.createThisProxy(this);\n';

		}

		/*
		Marks the function containing the node provided as argument, as uncacheable
		*/
		var markFunctionUnCacheable = function(node, reason){
			var functionNode = util.getFunctionIdentifier(node);
			if (functionNode){
				if(!uncacheableFunctions[reason])
					uncacheableFunctions[reason]=[];
				if (uncacheableFunctions[reason].indexOf(functionNode)<0)
					uncacheableFunctions[reason].push(functionNode);
			}
		}

		var insertClosureProxy = function(fnNode, fnIndex){
			var closurePrefixStr = "var closureProxy = " + options.tracer_name + 
				'.createClosureProxy(';
			var closureObjStr = "var __closureObj = { __isClosureObj: true,";
			var closureVarStr = "";
			var closureArray = [];
			//Remove duplocates
			var nonLocalsSrc = functionToNonLocals[fnIndex].map((el)=>{return ASTSourceMap.get(el)});
			var uniqIdsSet = new Set(nonLocalsSrc);
			var uniqIdsArr = [...uniqIdsSet];
			uniqIdsArr.forEach((idsrc, ind)=>{
				// idsrc = ASTSourceMap.get(id);
				closureObjStr += idsrc;
				closureObjStr += ":"
				closureObjStr += idsrc;
				closureArray.push(idsrc);
				closureObjStr += ",";
				closureObjStr += "set" + idsrc + ": function(o){" + idsrc + "=o},"

				closureVarStr += idsrc + " = closureProxy." + idsrc + "\n";
			})
			closureObjStr += "}\n"
			closurePrefixStr += "__closureObj);\n";

			// update(fnNode.body, closureObjStr, closurePrefixStr , closureVarStr, fnNode.body.source());
			return [closureObjStr,closurePrefixStr, closureArray];

		}

		/*
		Arguments: <AST node, string>
		returns <AST node> 
		*/
		var origSeenBefore = [];
        var getOriginalFromAlias = function(alias, functionId){
            if (!functionAliasMap[functionId]) return alias;
            var original = functionAliasMap[functionId][alias.source()];
            if (!original) return alias;
            origSeenBefore.push(alias.source());
            if (original.source() != alias.source() && original.source() in functionAliasMap[functionId]
                && origSeenBefore.indexOf(original.source())<0)
                return getOriginalFromAlias(original, functionId);
            return original;
        }

		var ASTFromString = function(str){
			var astArr = [];
			fala({
				source: str
			}, function(node){
				astArr.push(node);
			})

			return astArr;
		}

		var modifyNode = function(ceNode, srcStr, dstStr){
			try {	
				return fala({
						source:ceNode
					}, function(node){
						if (node.source() == srcStr && !util.isArgOfFunction(node))
							update(node, dstStr)
					});
			}catch (e) {
				// console.error("Error while trying to modify callee, can't parse " + ceNode);
				return {toString:function(){
					return ceNode;
				}}
			}
		}

		/*
		Arguments: CENode: Node to be statically analysed
		localDeclHolder: local declarations 
		isAA: Is alias analysis or not, if yes, also statically analysis the arguments
		if not, they would be taken care as a part of the dynamic analysis at runtime. 
		*/
		var getCompleteExpression = function(CENode, localDeclHolder, isAA){
			var localDecls = "";
			if (!localDeclHolder) localDeclHolder = "";
			var callee = CENode.source();
			var _functionId = util.getFunctionIdentifier(CENode);
			if (_functionId){
				var functionId = makeId('function', options.path, _functionId);
				var id = util.getIdentifierFromGenericExpression(CENode);
				var {readArray, local,argReads, antiLocal} = signature.handleReads(CENode, false, 1, isAA);
				if (!functionsVarDecl[functionId])
					functionsVarDecl[functionId] = []
				//Add arguments to local variable list
				local = local.concat(argReads.map(e=>e.val));
				//Add this object to local variable list
				// [...new Set(readArray)].forEach((read)=>{
				// 	if (read.source() == "this")
				// 		local = local.concat(modifyNode(callee, read,"thisObj"));
				// })
				local.forEach((l)=>{
					var _l = getOriginalFromAlias(l, functionId);origSeenBefore=[];
						if (l.source() != _l.source() && localDeclHolder.indexOf(l.source() + " = ")<0) {
							functionsVarDecl[functionId].push(ASTSourceMap.get(l));
							localDeclHolder += l.source() + " = ; "
							var _cmpltAliasExpression = getCompleteExpression(_l, localDeclHolder,true);
							var cmpltAliasExpression = _cmpltAliasExpression.join("") === _l.source() ? ["",_l.source()] : _cmpltAliasExpression;
							localDecls += cmpltAliasExpression[0] + " if (typeof  " + l.source() + " == 'undefined' || ( window." + l.source() + "==" + l.source()+ ")) var " +
							 l.source() + " = " + cmpltAliasExpression[1] + ";\n";
						}
 						// update(_cloneNode, getOriginalFromAlias(_cloneNode.source(), functionId));
				});
				[...new Set(readArray.map(e=>e.source()))].forEach((read)=>{
					if (read == "this")
						callee = modifyNode(callee, read,"thisObj").toString();
				});
				// [...new Set(argReads.map((e)=>{e.val = e.val.source(); return e}))].forEach((arg)=>{
				// 	callee = modifyNode(callee, arg.val, "arg["+arg.ind+"]");
				// });

				[...new Set(antiLocal.map(e=>e.source()))].forEach((cl)=>{
					callee = modifyNode(callee, cl, "closure."+cl).toString();
				});

				/*This is specially for handling dom arguments statically
				 and also arguments which are a part of the alias analysis*/
				if (CENode.type == "CallExpression" && CENode.arguments){
					CENode.arguments.forEach((argument)=>{
						var {readArray, local,argReads, antiLocal} = signature.handleReads(argument, false, 1,isAA);
						// local = local.concat(argReads.map(e=>e.val));
						local.forEach((l)=>{
							var _l = getOriginalFromAlias(l, functionId);origSeenBefore=[];
							if (l.source() != _l.source() && localDeclHolder.indexOf(l.source() + " = ")<0 && (_l.source().indexOf("create")>=0) ) {
								functionsVarDecl[functionId].push(ASTSourceMap.get(l));
								localDeclHolder += l.source() + " = ; "
								var _cmpltAliasExpression = getCompleteExpression(_l, localDeclHolder, true);
								var cmpltAliasExpression = _cmpltAliasExpression.join("") === _l.source() ? ["",_l.source()] : _cmpltAliasExpression;
								localDecls += cmpltAliasExpression[0] + " if (typeof  " + l.source() + " == 'undefined' || ( window." + l.source() + "==" + l.source()+ ")) var " +
								 l.source() + " = " + cmpltAliasExpression[1] + ";\n";
								 //Check if the local declared is a dom local, in which case, assign properties
							}
						});
						[...new Set(readArray.map(e=>e.source()))].forEach((read)=>{
							if (read == "this")
								callee = modifyNode(callee, read,"thisObj").toString();
						});
						// [...new Set(argReads.map((e)=>{e.val = e.val.source(); return e}))].forEach((arg)=>{
						// 	callee = modifyNode(callee, arg.val, "arg["+arg.ind+"]").toString();
						// });

						[...new Set(antiLocal.map(e=>e.source()))].forEach((cl)=>{
							callee = modifyNode(callee, cl, "closure."+cl).toString();
						});
					})
				}
				if (callee.indexOf("setTimeout")>=0)
					return ["",""];
				return [localDecls,callee];

				// functionEvalList[functionId].push(cloneNodeArr[cePos].source());
			}
			return ["",""];
		}

		/*
		Function declaration: Simply add accessors
		eg: Function a(){}, a.__get__ = function(){}.....
		Function Expression, check if call expression, add accessors after call expression
		eg: var a = function(){}(), a.__get__ = function(), var _n00p (and then the comma gets added)

		*/

		var insertClosureAccessors = function(node, nodeName, closureObjStr, onlyGetScope){

			var getScope = nodeName + '= (' + nodeName + `.__getScope__  = function(key, value){
					${closureObjStr}
					return __closureObj;
				},
			` + nodeName + ')\n';
			var getter = nodeName + `.__get__ = function(key, value){
					${closureObjStr}
					var result = __tracer.traverseToTarget(__closureObj, key, value, true);
					return result;
				},\n
			`;
			var setter = nodeName + `.__set__ = function(key,value){
					${closureObjStr}
					var result = __tracer.traverseToTarget(__closureObj, key, value, false);
					return result;
				},\n
			`;

			var replayIBF = nodeName + `.__replayIBF__ = function(IBFs){
				${closureObjStr}
				var result = __tracer.replay_IBF(IBFs, null, __closureObj, null);
				return result;
			} \n`
			var startComma = "", endComma = "";
			var groupStart = "", groupEnd = "";
			if (node.type == "FunctionExpression") {
				var p;
				if (p = util.isChildOfX(node, "LogicalExpression")) {
					/*If immediate parent is logical expression*/
					if (p == node.parent)
						groupStart="(", groupEnd=")";
				}

				/*If nodeName has assignment operator, then bail out
				eg: (r={}).a = function(){}, now you can't simply write to (r={}).on.__get__ = {}, because, you end up redefining r*/
				if (nodeName.indexOf("=")>=0) return;
				var _h, forcedBS = false;
				/*If inside if statement, check if blockstatement exists, if not, add blocks*/
				if (_h = util.isChildOfX(node, "IfStatement")){
					/*make sure the function declaration is inside the consequent*/
					if (_h.consequent.type != "BlockStatement" && _h.consequent.source().indexOf(node.source())>=0) {
						forcedBS = _h.consequent;
						// update(_h.consequent, "{", _h.consequent.source(), "}"); 
					} else if (_h.alternate && _h.alternate.type != "BlockStatement" && _h.alternate.source().indexOf(node.source())>=0)
						forcedBS = _h.alternate;
				}
				//TODO, handle function assignments inside object expression
				if (node.parent.type == "Property" || node.parent.type == "ConditionalExpression"
					|| util.isChildOfX(node,"ForStatement") || util.isChildOfX(node, "ReturnStatement") 
					|| util.isChildOfX(node, "ConditionalExpression"))
					return;
				/*Different way to do the above thing: (a=function(){})(), now function inside callee*/
				if (node.parent.parent.type == "CallExpression" && node.parent == node.parent.parent.callee) return;
				if (node.parent.type == "CallExpression") {

					/*if self invoked function, then not defined*/
					if (node.parent.callee == node) return;
					/*Special case: When function declared and invoked with a unary expression, the function is actuallly
					not declared, therefore the functionName will be not be defined
					!function a(){}(); typeof a == undefined*/
					if (node.parent.parent && ( node.parent.parent.type == "UnaryExpression" || node.parent.parent.type == "ConditionalExpression"))
						return;
					if (util.isArgOfCE(node))
						return;
					node = node.parent;
				}
				var postDecl = content.slice(node.range[1],);
				var regex = /[^\w]*/
				var commaExists = regex.exec(postDecl);
				if (commaExists && commaExists[0].indexOf(",")>=0 || util.isChildOfX(node.parent,"VariableDeclaration")){
					if (util.isChildOfX(node,"SequenceExpression","ConditionalExpression")){
						startComma = ","
					} else if (commaExists && commaExists[0].indexOf(")")>=0){
						startComma = ",";
					}
					/* Either parent is var decl, or parent is a unary operator of some kind, and then the parent is var decl*/
					else if (util.isChildOfX(node.parent,"VariableDeclaration")) {
						//rewrite the grandparent;
						startComma = ";";endComma += "var __N00P"
						//replace the comma with a blank
					}
					else {
						startComma = ",";
					}
				} else if (commaExists && commaExists[0].indexOf(")")>=0){
					startComma = ",";
				} else {
					startComma = ",";
				}
			} else if (node.type == "FunctionDeclaration"){
				endComma=";"
			}
			var preserveCommaReturn = ""
			/*if comma introduced then make sure the original variable is returned, not the new functions*/
			if (startComma == "," && endComma == "")
				preserveCommaReturn = "," + nodeName
			if (onlyGetScope){
				update(node, groupStart, node.source(), '\n',startComma,getScope,endComma,preserveCommaReturn, groupEnd);
				if (forcedBS){
					// update(forcedBS, "{", forcedBS.source(), "}");
					nodeFutureModified = forcedBS;
				}
				return;
			}
			update(node, groupStart,node.source(), '\n',startComma,getter, setter, replayIBF,endComma,preserveCommaReturn, groupEnd);
			if (node.type == "FunctionExpression" && startComma == ""){
				console.log(ASTSourceMap.get(node.parent.parent) + " got rewritten to " + node.source() );
			}
		}

		var constructCFGTag = function(node){
			const IF="IfStatement";
			var cfgTag = "-";

			function traverseParents(parent, node){
				if (!parent) return;
				traverseParents(parent.parent, parent);
				if (node == parent.consequent){
					cfgTag+=`if-`;
				} else if (node == parent.alternate){
					cfgTag+='else-';
				}
			};

			//get nesting information
			traverseParents(node.parent, node);

			return cfgTag;
		}

		var insertCFGTrackingSC = function(node, functionId, cfgTag){
			// var bodySrc = node.map(e=>e.source()).join("");
			update(node, options.tracer_name,'.logBranchTaken(',JSON.stringify(functionId),',',JSON.stringify(cfgTag),')\n',node.source());
		}

		var insertCFGTrackingIF = function(node, functionId,cfgTag){
			// var cfgTag = constructCFGTag(node);
			var cfgTagStart = `${cfgTag}-s`, cfgTagEnd = `${cfgTag}-e`;
			if (node.type != "BlockStatement"){
				update(node, '{',options.tracer_name,'.logBranchTaken(',JSON.stringify(functionId),',',JSON.stringify(cfgTagStart),')\n',node.source(),'\n',
					options.tracer_name,'.logBranchTaken(',JSON.stringify(functionId),',',JSON.stringify(cfgTagEnd),')}');
			} else {
				var bodySrc = node.body.map(e=>e.source()).join("");
				update(node,'{', options.tracer_name,'.logBranchTaken(',JSON.stringify(functionId),',',JSON.stringify(cfgTagStart),')\n',bodySrc, '\n',
					options.tracer_name,'.logBranchTaken(',JSON.stringify(functionId),',',JSON.stringify(cfgTagEnd),')}');
			}
		}

		// content = globalWrapper.wrap(content, fala);

		// console.log(esprima.parse(content));
		var instrumentedNodes = [];
		m = fala({
			source: content,
			locations: true,
			ranges: true,
			sourceFilename: options.sourceFilename || options.path,
			generatedFilename: options.generatedFilename || options.path,
			// tolerant: true,
		}, function (node) {
			var loc = {
				path: options.path,
				start: node.loc.start,
				end: node.loc.end
			};
			// Add every node to the list
			ASTNodes.push(node);
			ASTSourceMap.set(node, node.source());
		})

		if (options.rti) {
			var remainingRTINodes =[];
			options.myRti.forEach((rtiNode)=>{
				var matchedNode = util.matchASTNodewithRTINode(rtiNode, ASTNodes, options, ASTSourceMap);
				if (matchedNode){
					instrumentedNodes.push(matchedNode);
					// staticInfo.rtiDebugInfo.matchedNodes.push(rtiNode);
				} 
			})

			ASTNodes.forEach((node)=>{
				if (node.type == "FunctionDeclaration" || node.type == "FunctionExpression") {
					if (instrumentedNodes.indexOf(node)<0){
						markFunctionUnCacheable(node,"RTI");
					}
				}
			})

			// if (remainingRTINodes.length){
			// 	//Throw error since not all rti nodes found a match. 
			// 	console.error("Match not found for " + remainingRTINodes.length + " number of RTI nodes");
			// 	console.error("Quiting instrumentation");
			// 	return processed;
			// }
		} else if (options.cg) {
			var remainingRTINodes =[];
			ASTNodes.forEach((node)=>{
				if (node.type == "FunctionDeclaration" || node.type == "FunctionExpression") {
					var index = makeId('function', options.path, node);
					if (options.myCg.indexOf(index)>=0){
						// staticInfo.rtiDebugInfo.matchedNodes.push(node);
						console.log("[Static analyzer] Function matching reported a match")
						/*Check if node time is enough for the node to be worth
						instrumented*/
						var origCgInd = options.cg.indexOf(index);
						// var nodeTime = options.cgTime[origCgInd];
						// console.log("[Matched node]: ", index, " with time: ", nodeTime );
						// if (nodeTime == null || nodeTime < minFunctionTime){
						// 	node.nullTimeNode = true
						// }
						// node.time = nodeTime;
						instrumentedNodes.push(node);
					} else {
						// if (!node.id || (node.id && node.id.name != COND_TO_IF_FN))
							markFunctionUnCacheable(node,"RTI");
					}
				}

			});
		}

		ASTNodes.forEach((node) => {

			if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
				if (options.timing) {
					var index = makeId('function', options.path, node);
				}
				// console.log(node.parent.source());
				var functionName;
				if (node.id) { 
					functionName = node.id.name;

					// also add as local variable for the parent scope. 
					// Hacky code: modifying the parent link, should never do that. 
					node.id.parent = node.parent;
					scope.addLocalVariable(node);
				}
				else {
					if (node.parent.type == "VariableDeclarator")
						functionName = node.parent.id.name;
					else if (node.parent.type == "AssignmentExpression") {
						functionName = node.parent.left.source();
					}				
				}

				/*
				function name to location is used during signature propogation 
				and there can be commented out as long as the code
				for enabling signature propagation is commented out.
				*/
				// if (functionName){
				// 	if (!(functionNameToLocation[functionName]))
				// 		functionNameToLocation[functionName] = [];
				// 	console.log(functionNameToLocation[functionName])
				// 	functionNameToLocation[functionName].push(node.loc);
				// }	

			} else if (node.type == "ForInStatement" || node.type == "ForOfStatement"){
				if (node.left.type == "Identifier"){
					scope.addLocalVariable(node.left);
				}

			} else if (node.type == "ClassDeclaration"){
				scope.addLocalVariable(node);
			} 
			else if (node.type == "TryStatement") {
				if (node.handler)
					scope.addLocalVariable(node.handler.param);
			} else if (node.type == "IfStatement") {
					var readArray = [];
					var {readArray, local, argReads, antiLocal} = signature.handleReads(node.test);
					if (antiLocal.length){
						markFunctionUnCacheable(node, "antiLocal");
					}
					scope.addGlobalReads(readArray);


			} else if (node.type === 'VariableDeclarator') {
						scope.addLocalVariable(node);
						var _functionId = util.getFunctionIdentifier(node);
						if (_functionId ){
							if (node.init){
								var functionId = makeId('function', options.path, _functionId);
								if (!functionAliasMap[functionId])
									functionAliasMap[functionId] = {};
								if (!functionToDOMtracking[functionId])
									functionToDOMtracking[functionId] = {};
								functionAliasMap[functionId][node.id.source()] = node.init;
								if (node.init.source().indexOf("create")>=0)
									functionToDOMtracking[functionId][node.id.source()] = "";
							} 
						}

			// Handles any global variable being assigned any value
			// or a local variable becoming an alias of a global variable
			} else if (node.type == "AssignmentExpression" || node.type == "LogicalExpression" || node.type == "BinaryExpression"){
				/*
				if an argument is redefined inside a function, it is no longer an argument and only a 
				local variable and hence not to be tracked
				*/
				/*
				Store a map of every alias assignment
				*/
				if (node.type == "AssignmentExpression") {
					var _functionId = util.getFunctionIdentifier(node);
					if (_functionId){
						var functionId = makeId('function', options.path, _functionId);
						if (!functionAliasMap[functionId])
							functionAliasMap[functionId] = {};
						// if (!functionAliasMap[functionId][node.id.source()])
						functionAliasMap[functionId][node.left.source()] = node.right;

					}
				}
				// if (node.type == "AssignmentExpression" && node.left.type == "Identifier" && scope.IsLocalVariable(node.left)>=0)
				// 	scope.addLocalVariable(node.left);
				var {readArray,local,argReads, antiLocal} = signature.handleReads(node.right);
				if (antiLocal.length)
					markFunctionUnCacheable(node,"antiLocal");
				var {readArray,local,argReads, antiLocal} = signature.handleReads(node.left);
				if (antiLocal.length)
					markFunctionUnCacheable(node, "antiLocal");

				scope.addGlobalReads(signature.handleReads(node.right).readArray);
			} else if (node.type == "UpdateExpression"){
				var {readArray,local,argReads, antiLocal} = signature.handleReads(node.argument);
				if (antiLocal.length)
					markFunctionUnCacheable(node, "antiLocal");
			} else if (node.type == "CallExpression") {
				
				// Check if the arguments passed are global or not
				if (node.arguments) {
					var globalReads = [];
					node.arguments.forEach(function(param){
						var {readArray, local, argReads, antiLocal} = signature.handleReads(param);
						if (antiLocal.length)
							markFunctionUnCacheable(node, "antiLocal");
						globalReads = globalReads.concat(readArray);
					});
					// add global arguments to read set
					scope.addGlobalReads(globalReads);
				}

				// var globalDOMMethods = Object.keys(propertyObj.global);
				// var localDOMMethods = Object.keys(propertyObj.local);
				// var isLocal = false;

				// if (node.parent.type == "SequenceExpression" || node.parent.type == "ExpressionStatement") {

				// 	// First check if a local DOM method
				// 	localDOMMethods.forEach(function(DOMMethod){
				// 		if (node.callee.source().toLowerCase().includes(DOMMethod.toLowerCase()))
				// 			isLocal = true;
				// 	});
				// 	globalDOMMethods.forEach(function(DOMMethod){
				// 		if (!isLocal && node.callee.source().toLowerCase().includes(DOMMethod.toLowerCase())) {
				// 			scope.addGlobalWrites(node);
				// 			markFunctionUnCacheable(node,"DOM");
				// 			}
				// 	});
				// }
				// if ( (node.parent.type == "ExpressionStatement" || node.parent.type == "SequenceExpression" || node.parent.type == "ConditionalExpression")
				// 		&& node.callee.type != "FunctionExpression" ) {
				// 	var _functionId = util.getFunctionIdentifier(node);
				// 	if (_functionId) {
				// 		var functionId = makeId('function', options.path, _functionId);
				// 		var evalString = getCompleteExpression(node);
				// 		ceToFinalExpression.set(node, evalString);
				// 	}
				// }
			} else if (node.type == "MemberExpression") {
				var _functionId = util.getFunctionIdentifier(node);
				//Either the member expression is inside a function, or passed as an argument to a call expression outside function
				if (_functionId) {
					if ( (node.object.type == "Identifier" || node.object.type == "ThisExpression")) {
						var functionId = makeId('function', options.path, _functionId);
						//check if the member expression object is defined using DOM create methods
						if (functionToDOMtracking[functionId] && functionToDOMtracking[functionId][node.object.source()]!= null
							&& node.parent.type == "AssignmentExpression"){


						}
					}
				}
			}
		});

		/* In this second iteration of the AST we will freeze the debug info 
		ie all the global writes, reads and aliases 
		*/
		ASTNodes.forEach(function(node) {

			if (node.type == "FunctionDeclaration" || node.type == "FunctionExpression") {
				if (node.globalReads) node.globalReads = node.globalReads.map(function(e){ return e.source();});
				if (node.globalWrites) node.globalWrites = node.globalWrites.map(function(e){ return e.source();});
				if (node.globalAlias) node.globalAlias = printFriendlyAlias(node.globalAlias);
				var index = makeId('function', options.path, node);

				//create Indexes for storing nonlocals
				functionToNonLocals[index] = [];

				if (isNonDeterminist(node.source()) && uncacheableFunctions["ND"].indexOf(node) < 0)
					markFunctionUnCacheable(node, "ND");

				var fnName = util.getNameFromFunction(node)
				if  ((options.rti || options.cg) && instrumentedNodes.indexOf(node)>=0 && ((fnName && inBuiltOverrides.filter(e=>fnName.toLowerCase().indexOf(e)>=0).length)
					|| isInBuiltFunction(fnName)) ) {
					console.log("[Static Analyzer] Unhandled: in built overrides in source code," + fnName);
					markFunctionUnCacheable(node,"RTI");
				}

				if (node.source().indexOf("this")>=0)
					functionsContainingThis.push(index);
				/*Moved this in the second loop, so that the first loop can take care of hoisting first, before you analyse IBF*/
			} else if (node.type == "CallExpression"){
				var getIBFSource = ["get",".push"];
				if ( (node.parent.type == "ExpressionStatement" || node.parent.type == "SequenceExpression" || node.parent.type == "LogicalExpression" || node.parent.type == "ConditionalExpression")
						&& node.callee.type != "FunctionExpression" && getIBFSource.filter(e=>node.source().indexOf(e)<0).length > 1) {
					var _functionId = util.getFunctionIdentifier(node);
					if (_functionId) {
						var functionId = makeId('function', options.path, _functionId);
						if (node.source().indexOf("setTimeout")>=0){
							markFunctionUnCacheable(_functionId,"RTI");
							console.log("[Static Analyzer] Unhandled: setTimeout in source code");
							return;
						}
						// var evalString = getCompleteExpression(node);
						// ceToFinalExpression.set(node, evalString);
					}
				}
			} else if (node.type == "AssignmentExpression"){
				if (node.parent.type == "AssignmentExpression" || (node.parent.type == "VariableDeclarator") || node.parent.type == "ConditionalExpression"){

				}
					// var _functionId = util.getFunctionIdentifier(node);
					// if (_functionId) {
					// 	markFunctionUnCacheable(_functionId, "RTI");
					// 	console.log("[Static Analyzer] Unhandled: multi assignment in source code");
					// }
			}
		});

		/*
			The 3rd and final iteration over the AST to actually instrument
			logging code
		*/
		ASTNodes.forEach(function(node) {

			/*If a node is marked to be notified, do that*/
			if (nodeFutureModified && node == nodeFutureModified){
				/*While inserting closure accessors, if the node modified is inside if else
				without braces, then explicit braces need to be added in order to preserve scope*/
				update(node, "{",node.source(),"}")
				nodeFutureModified=null;
			}
			if (node.type === "Program") { 
				/*
				Some JS files don't have access to the global execution context and they have a dynamically generated
				html file, therefore create dummy tracer functions, just to avoid runtime errors. 
				*/

				if (options.jsInHTML){
                    update(node, node.source().replace(/^\s+|\s+$/g, ''));
                }

				var tracerCheck = `\n(function(){if (typeof __tracer == 'undefined' && typeof window != 'undefined')
				 { __tracer = new window.top.__declTracerObject__(window);
				    }
				   if (self.window != self){
				   	__tracer = {isProxy:function(e){return e}, handleProtoAssignments: function(e){return e}}
				   }
                //    if (__tracer && __tracer.cacheInit){
                //        __tracer.cacheInit("${options.filename}")
                //    }
				})();\n`;
                var programEnd = `\n
                    if (__tracer && __tracer.exitFunction)
                        __tracer.exitFunction();
                `
				if (node.source().indexOf("__tracer") >=0)
					update(node, options.prefix,tracerCheck,sourceNodes(node))
				else 
					update(node, options.prefix,sourceNodes(node))
			} 
			/*
			Log all non locals and prepend every global with the proxy object. 
			Special case
			- if you read a property of the arguments keyword, replace it with the argumentProxy object
			- Do the same for the "this" keyword
			*/
			else if ( (node.type === 'VariableDeclaration' || node.type === 'VariableDeclarator')) {
				if (node.type == "VariableDeclarator"){
					var _functionId = util.getFunctionIdentifier(node,true);
					if (node.init){
						if (_functionId) {
							var {readArray, local, argReads, antiLocal} = signature.handleReads(node.init);
							if (options.useProxy) {
								// antiLocal.length && Array.prototype.push.apply(functionToNonLocals[makeId('function', options.path, _functionId)], antiLocal);
								// antiLocal.forEach(function(read){
								// 	if (options.useProxy){
								// 			update(read, 'closureProxy.',read.source());
								// 	}
								// });
								// argReads.length && node.init.type != "FunctionExpression" && rewriteArguments(argReads);
								rewriteGlobals(readArray);
								rewriteClosure(antiLocal, _functionId);
							}
						}  
					}

			    }
			    // update(node, sourceNodes(node));
			
			// Handles any global variable being assigned any value
			// or a local variable becoming an alias of a global variable
			} else if (node.type == "AssignmentExpression" || node.type == "LogicalExpression" || node.type == "BinaryExpression"){
				var _functionId = util.getFunctionIdentifier(node, true);
				var {readArray,local,argReads, antiLocal} = signature.handleReads(node.right);
				rewriteGlobals(readArray);
				rewriteClosure(antiLocal,_functionId);

				var {readArray,local,argReads, antiLocal} = signature.handleReads(node.left);
				rewriteGlobals(readArray);
				rewriteClosure(antiLocal,_functionId);
				
				// if (_functionId) {

				// 	

				// 	argReads.length && rewriteArguments(argReads);
					// antiLocal.length && Array.prototype.push.apply(functionToNonLocals[makeId('function', options.path, _functionId)], antiLocal);
				// 	antiLocal.forEach(function(read){
				// 		if (options.useProxy){
				// 				update(read, 'closureProxy.',read.source());
				// 		}
				// 	});
				// 	readArray.forEach(function(read){
				// 		var newRead = util.logReadsHelper(read, scope.checkAndReplaceAlias(read));
				// 		// console.log(read.source());
				// 		if (options.caching)
				// 			update(read, options.tracer_name, '.logRead(', JSON.stringify(functionId),',[', newRead, '],[', util.getAllIdentifiersFromMemberExpression(read),'])');
				// 		if (options.useProxy) {
				// 			if (read.source() == "arguments"){
				// 				if (_functionId)
				// 					update(read, "argumentProxy")
				// 				return;
				// 			}
				// 			if (util.checkIfReservedWord(read)) return;
				// 			//update this as long as it is not a simple assignment to this expression
				// 			if (read.source() == "this") {
				// 				if (node.right.source() != "this")
				// 					update(read, "thisProxy");
				// 				return;
				// 			}
				// 			if (read.source() == "window")
				// 					update(read, options.proxyName)
				// 				else
				// 					update(read, options.proxyName, '.', read.source());
				// 		}
				// 	});

				// 	/*
				// 	if assignment expressions and the right hand side is identifier then skip
				// 	*/
				// 	// if (node.type == "AssignmentExpression" && node.left.type == "Identifier") return;
				// 	var {readArray, local,argReads, antiLocal} = signature.handleReads(node.left);
					
				// 	Don't rewrite arguments if the argument gets rewritten, because then the reference is broken. 
				// 	Can;t really do this, because the subsequent uses have been modified, and therefore will result in error
				// 	The real reason this would fail is if the argument is not passed during invocation, then subsequent 
				// 	changes won't be same as the actual variable being modified in this assignment expression
					
				// 	// if (!(node.type == "AssignmentExpression" && node.left.type == "Identifier")) {
				// 	// 	argReads.length && rewriteArguments(argReads);
				// 	// }
				// 	// 
				// 	var argReWritten = false
				// 	argReads.forEach((arg)=>{
				// 		if (arg.val == node.left && node.type == "AssignmentExpression"){
				// 			scope.addLocalVariable(node.left);
				// 			argReWritten = true;
				// 		}
				// 	})
				// 	!argReWritten && argReads.length && rewriteArguments(argReads);
				// 	antiLocal.length && Array.prototype.push.apply(functionToNonLocals[makeId('function', options.path, _functionId)], antiLocal);
				// 	antiLocal.forEach(function(read){
				// 		/*FIX
				// 		 If the entire closure variable gets rewritten, no way
				// 		 to currently track the changes and apply them propery 
				// 		 Read up about javascript pass by reference, for variables*/
				// 		if (options.useProxy){
				// 			// if (read.type == "Identifier") {
				// 			// 	update(read,read.source(),'=','closureProxy.',read.source());
				// 			// 	return;
				// 			// }
				// 			update(read, 'closureProxy.',read.source());
				// 		}
				// 	});
				// 	readArray.forEach(function(read){
				// 		if (util.checkIfReservedWord(read)) return;
				// 		if (read.source() == "this") {
				// 			update(read, "thisProxy");
				// 			return
				// 		}
				// 		if (read.source() == "window")
				// 			update(read, options.proxyName)
				// 		else
				// 			update(read, options.proxyName, '.', read.source());
				// 	});

				// }


				if (node.operator == "==" || node.operator == "===" || node.operator == "!==" || node.operator == "!="
					|| node.operator == "instanceof"){
					if (node.left.type != "Literal" || node.right.type != "Literal"){
						if (node.left.type != "Literal" && node.right.type != "Literal"){
							update(node.left, ' ',options.tracer_name,'.isProxy(', node.left.source(), ')');
							update(node.right, ' ',options.tracer_name,'.isProxy(', node.right.source(), ')');
						} else {
							var ident = node.left.type == "Literal" ? node.right : node.left;
							var lit = ident == node.left ? node.right.value : node.left.value;
							if (typeof lit == "string" || lit == null)
								lit = JSON.stringify(lit);
							var _functionId = util.getFunctionIdentifier(node);
							if (_functionId){
								// update(ident, options.tracer_name,'.handleComparison(',ident.source(),',',JSON.stringify(node.operator), ',',lit,')');
							}
							else 
								update(ident, ' ',options.tracer_name,'.isProxy(', ident.source(), ')');
						}
					}
					// if (node.left.type != "Literal") update(node.left, ' ',options.tracer_name,'.isProxy(', node.left.source(), ')');
					// if (node.right.type != "Literal") update(node.right, ' ',options.tracer_name,'.isProxy(', node.right.source(), ')');
				}

				// Detect if the __proto__ is being set to a proxy object
				var groupingRegex = new RegExp("\\s*=\\s*\\(");
				var containsParens = groupingRegex.exec(node.source());
				if (node.type == "AssignmentExpression") {
					if ( ( node.left.source().indexOf("__proto__") >= 0  || node.left.source().indexOf("prototype") >= 0 )
						&& node.right.type != "FunctionExpression") {
						// if (containsParens)
						// 	update(node, options.tracer_name,'.handleAssignments(' ,node.left.source(), node.operator, options.tracer_name, '.handleProtoAssignments((', node.right.source(), '))',',',node.left.source(),')');
						// else update(node, options.tracer_name,'.handleAssignments(' ,node.left.source(), node.operator, options.tracer_name, '.handleProtoAssignments(', node.right.source(), ')',',',node.left.source(),')');
						if (containsParens)
							update(node, node.left.source(), node.operator, options.tracer_name, '.handleProtoAssignments((', node.right.source(), '))');
						else update(node, node.left.source(), node.operator, options.tracer_name, '.handleProtoAssignments(', node.right.source(), ')');
					} else if (_functionId) {
						// update(node, options.tracer_name, '.handleAssignments(',node.source(),',',node.left.source(),')');
					}
				}
				// Handle object comparisons if one of the object is wrapped in a proxy
				// if (node.type == "BinaryExpression" && (node.operator == "==" || node.operator == "!=" || node.operator == "===" || node.operator == "!==")){
				// 	update(node ,'(',options.tracer_name,'.handleProxyComparisons(', node.left.source(), '))',node.operator, '(' ,options.tracer_name, '.handleProxyComparisons(', node.right.source(), '))');
				// }
				// dont' handle those assignment expressions which are a child of conditional expressions as they 
				// may or may not get executed
				if (scope.IsLocalVariable(node.left) > 0){
					var newWrite = util.logWritesHelper(node, scope.checkAndReplaceAlias(node.left));
					if (options.caching)
						update(node,node.left.source(),node.operator, options.tracer_name,'.logWrite(',JSON.stringify(functionId),newWrite,',[', util.getAllIdentifiersFromMemberExpression(node.left),'])');
					if (options.useProxy) {
			
					}
				} else if (scope.IsLocalVariable(node.right) > 0){
					
				}

			}  else if (node.type == "ConditionalExpression") {
				var _functionId = util.getFunctionIdentifier(node,true);
				var readArrayT = [], localT = [], argReadsT = [], antiLocalT = [];
				if (_functionId) {
					var {readArray,local,argReads, antiLocal} = signature.handleReads(node.test);
					readArrayT = readArrayT.concat(readArray),  argReadsT = argReadsT.concat(argReads)
						antiLocalT = antiLocalT.concat(antiLocal);
					var {readArray,local,argReads, antiLocal} = signature.handleReads(node.consequent);
					readArrayT = readArrayT.concat(readArray),  argReadsT = argReadsT.concat(argReads)
						antiLocalT = antiLocalT.concat(antiLocal);
					var {readArray,local,argReads, antiLocal} = signature.handleReads(node.alternate);
					readArrayT = readArrayT.concat(readArray),  argReadsT = argReadsT.concat(argReads)
						antiLocalT = antiLocalT.concat(antiLocal);

					// argReadsT.length && rewriteArguments(argReadsT);
					// antiLocalT.length && Array.prototype.push.apply(functionToNonLocals[makeId('function', options.path, _functionId)], antiLocalT);
					// antiLocalT.forEach(function(read){
					// 	if (options.useProxy){
					// 			update(read, 'closureProxy.',read.source());
					// 	}
					// });
					readArrayT.forEach((read) => {
						if (util.checkIfReservedWord(read)) return;
						if (read.source() == "this") {
							return
						}
						if (read.source() == "window")
							update(read, options.proxyName)
						else
							update(read, options.proxyName, '.', read.source());
					});
					rewriteClosure(antiLocalT, _functionId);
				}

			} else if (node.type == "UpdateExpression") {
				var _functionId = util.getFunctionIdentifier(node,true);
				if (_functionId) {
					var {readArray,local,argReads, antiLocal} = signature.handleReads(node.argument);
					// var functionId = makeId('function', options.path, _functionId);
					// if (antiLocal.length) {
					// 	uncacheableFunctions.push(functionId);
					// 	return;
					// }
					// argReads.length && rewriteArguments(argReads);
					// antiLocal.length && Array.prototype.push.apply(functionToNonLocals[makeId('function', options.path, _functionId)], antiLocal);
					// antiLocal.forEach(function(read){
					// 	if (options.useProxy){
					// 			update(read, 'closureProxy.',read.source());
					// 	}
					// });
					readArray.forEach((read) => {
						if (util.checkIfReservedWord(read)) return;
						if (read.source() == "this") {
							// update(read, "thisProxy");
							return
						}
						if (read.source() == "window")
							update(read, options.proxyName)
						else
							update(read, options.proxyName, '.', read.source());
					});
					rewriteClosure(antiLocal, _functionId);
				}
			} else if (node.type == "UnaryExpression" && node.operator == "typeof") {
				var _functionId = util.getFunctionIdentifier(node,true), argType;
				if (_functionId){
					var functionId = makeId('function', options.path, _functionId);
					var {readArray,local, argReads, antiLocal} = signature.handleReads(node.argument);
					rewriteGlobals(readArray);
					rewriteClosure(antiLocal,_functionId);
					return;
					argReads.forEach(function(read){
						if (options.useProxy){
								update(read.val, 'argumentProxy[',read.ind, ']');
						}
					});
					antiLocal.length && Array.prototype.push.apply(functionToNonLocals[makeId('function', options.path, _functionId)], antiLocal);
					antiLocal.forEach(function(read){
						if (options.useProxy){
								update(read, 'closureProxy.',read.source());
						}
					});

					// update(node.argument,' ', options.tracer_name, '.handleTypeOf(',node.argument.source(),')');
				} 

			} else if (node.type == "MemberExpression") {
				var _functionId = util.getFunctionIdentifier(node,true);
				//Either the member expression is inside a function, or passed as an argument to a call expression outside function
				if (_functionId /*|| util.isArgofCallExpression(node)*/) {
					// only instrument the final memberexpression where object is identifier
					//and the member expression is not a child of callexpression.
					if ( (node.object.type == "Identifier" || node.object.type == "ThisExpression") /*&& !util.isChildOfCallExpression(node)*/) {
						var {readArray,local, argReads, antiLocal} = signature.handleReads(node.object);
						// if (_functionId) argReads.length && rewriteArguments(argReads);
						// if (_functionId){ 
						// 	antiLocal.length && Array.prototype.push.apply(functionToNonLocals[makeId('function', options.path, _functionId)], antiLocal);
						// 	// antiLocal.forEach(function(read){
						// 	// 	if (options.useProxy){
						// 	// 			update(read, 'closureProxy.',read.source());
						// 	// 	}
						// 	// });
						// }
						rewriteGlobals(readArray);
						rewriteClosure(antiLocal,_functionId);
					}
					if (_functionId && node.computed){
						var {readArray,local, argReads, antiLocal} = signature.handleReads(node.property);
						// argReads.length && rewriteArguments(argReads);
						rewriteGlobals(readArray);
						rewriteClosure(antiLocal, _functionId);
						// antiLocal.length && Array.prototype.push.apply(functionToNonLocals[makeId('function', options.path, _functionId)], antiLocal);
						// antiLocal.forEach(function(read){
						// 	if (options.useProxy){
						// 			update(read, 'closureProxy.',read.source());
						// 	}
						// });
					}
				} else {
					// var _functionId = util.getFunctionIdentifier(node, true);
					// if (!_functionId)
					// 	return;
					// var {readArray, local, argReads, antiLocal} = signature.handleReads(node.object);
					// antiLocal.length && Array.prototype.push.apply(functionToNonLocals[makeId('function', options.path, _functionId)], antiLocal);
					// if (node.computed){
					// 	var {readArray,local, argReads, antiLocal} = signature.handleReads(node.property);
					// 	antiLocal.length && Array.prototype.push.apply(functionToNonLocals[makeId('function', options.path, _functionId)], antiLocal);
					// }
				}
			} else if (node.type == "SwitchStatement"){
				var {readArray,local, argReads, antiLocal} = signature.handleReads(node.discriminant);
					var _functionId = util.getFunctionIdentifier(node,true);
					if (_functionId) {
						// var functionId = makeId('function', options.path, _functionId);
						// 	if (uncacheableFunctions.indexOf(functionId) >= 0) return;
						// argReads.length && rewriteArguments(argReads);
						// antiLocal.length && Array.prototype.push.apply(functionToNonLocals[makeId('function', options.path, _functionId)], antiLocal);
						// antiLocal.forEach(function(read){
						// 	if (options.useProxy){
						// 			update(read, 'closureProxy.',read.source());
						// 	}
						// });
						readArray.forEach(function(read){
							var newRead = util.logReadsHelper(read,scope.checkAndReplaceAlias(read));
							if (options.caching)
								update(read, options.tracer_name, '.logRead(', JSON.stringify(functionId),',[', newRead, '],[', util.getAllIdentifiersFromMemberExpression(read),'])');
							if (options.useProxy){
								if (util.checkIfReservedWord(read)) return;
								if (read.source() == "this") {
									// update(read, "thisProxy");
									return
								}
								if (read.source() == "window")
									update(read, options.proxyName)
								else
									update(read, options.proxyName, '.', read.source());
							}

						});
						rewriteClosure(antiLocal,_functionId);

						// node.cases.forEach((cs)=>{
						// 	var _t = cs.test
						// 	var cfgTag = `sc-${_t ? _t.source() : ''}`;
						// 	//only prepend the logging statement before the very first expression
						// 	cs.consequent.length && insertCFGTrackingSC(cs.consequent[0], functionId, cfgTag);
						// });
							
					}
			} else if (node.type == "ForStatement"){
				if (node.test.type == "Identifier"){
					var {readArray,local, argReads, antiLocal} = signature.handleReads(node.test);
					var _functionId = util.getFunctionIdentifier(node,true);
					if (_functionId) {
						readArray.forEach(function(read){
							var newRead = util.logReadsHelper(read,scope.checkAndReplaceAlias(read));
							if (options.caching)
								update(read, options.tracer_name, '.logRead(', JSON.stringify(functionId),',[', newRead, '],[', util.getAllIdentifiersFromMemberExpression(read),'])');
							if (options.useProxy){
								if (util.checkIfReservedWord(read)) return;
								if (read.source() == "this") {
									// update(read, "thisProxy");
									return
								}
								if (read.source() == "window")
									update(read, options.proxyName)
								else
									update(read, options.proxyName, '.', read.source());
							}
								
						});
						rewriteClosure(antiLocal,_functionId);
							
					} 
					// scope.addGlobalReads(readArray);
				}
			} else if (node.type == "IfStatement") {
					var {readArray,local, argReads, antiLocal} = signature.handleReads(node.test);
					var _functionId = util.getFunctionIdentifier(node,true);
					if (_functionId) {
						// var functionId = makeId('function', options.path, _functionId);
						// 	if (uncacheableFunctions.indexOf(functionId) >= 0) return;
						// argReads.length && rewriteArguments(argReads);
						// antiLocal.length && Array.prototype.push.apply(functionToNonLocals[makeId('function', options.path, _functionId)], antiLocal);
						// antiLocal.forEach(function(read){
						// 	if (options.useProxy){
						// 			update(read, 'closureProxy.',read.source());
						// 	}
						// });
						readArray.forEach(function(read){
							var newRead = util.logReadsHelper(read,scope.checkAndReplaceAlias(read));
							if (options.caching)
								update(read, options.tracer_name, '.logRead(', JSON.stringify(functionId),',[', newRead, '],[', util.getAllIdentifiersFromMemberExpression(read),'])');
							if (options.useProxy){
								if (util.checkIfReservedWord(read)) return;
								if (read.source() == "this") {
									// update(read, "thisProxy");
									return
								}
								if (read.source() == "window")
									update(read, options.proxyName)
								else
									update(read, options.proxyName, '.', read.source());
							}
								
						});
						rewriteClosure(antiLocal,_functionId);

						// if (node.consequent){
						// 	var cfgTag = "if";
						// 	insertCFGTrackingIF(node.consequent,functionId, cfgTag)
						// }
						// if (node.alternate && node.alternate.type != "IfStatement") {
						// 	var cfgTag = "else";
						// 	insertCFGTrackingIF(node.alternate,functionId, cfgTag);
						// }
							
					} 
					// scope.addGlobalReads(readArray);


			} else if (node.type == "CallExpression") {

				// check if the define/require/requirejs expression from requireJS is used or not
				// special case: lightningjs is a 3rd party library which creates a separate execution context
				// therefore let's ignore instrumenting any such member expression
				// var ignoreCallees = ["require", "define", "requirejs"]
				// if (ignoreCallees.includes(node.callee.source())) {
				// 	// console.log(node.callee.source());
				// 	update(node, ASTSourceMap.get(node));
				// 	return;
				// }

				var invocationIsRead = true;
				var {readArray, local, argReads, antiLocal} = invocationIsRead || node.callee.source().includes("window")? signature.handleReads(node.callee) : {readArray: [], local:[], argReads: [], antiLocal:{}};
				// console.log(readArray)
				//Arguments read don't depend on whether we consider invocations as read or not, 
				// because the replacement logic needs to be consistent
				// var {argReads} = signature.handleReads(node.callee);
				var _functionId = util.getFunctionIdentifier(node,true);

				if (_functionId) {

					// var functionId = makeId('function', options.path, _functionId);

					// argReads.length && node.callee.type != "FunctionExpression" && rewriteArguments(argReads);
					readArray.forEach(function(read){
						if (options.useProxy){
							if (util.checkIfReservedWord(read)) return;
							if (read.source() == "this") {
								// update(read, "thisProxy");
								return
							}
							if (read.source() == "window") {
								update(read, options.proxyName)
							}
							else{
								update(read, options.proxyName, '.', read.source());
							}
						}
					});
					rewriteClosure(antiLocal,_functionId);
					// antiLocal.length && Array.prototype.push.apply(functionToNonLocals[functionId], antiLocal);
					// antiLocal.forEach(function(read){
					// 	if (options.useProxy){
					// 			update(read, 'closureProxy.',read.source());
					// 	}
					// });

					var globalReads = [], args = [], antiLocals = [], locals = [], IBFlocals = [];
					node.arguments && node.arguments.forEach(function(param){
						/*if param is of the type function, then don't analyze*/
						if (param.type == "FunctionExpression") return;
						var {readArray, local,argReads, antiLocal} = signature.handleReads(param,null,1);
						IBFlocals = IBFlocals.concat(local);
						/*Adding arguments to list of locals so that propagation is easier*/
						IBFlocals = IBFlocals.concat(argReads.map(e=>e.val))
						var {readArray, local,argReads, antiLocal} = signature.handleReads(param);

						globalReads = globalReads.concat(readArray);
						args = args.concat(argReads);
						antiLocals = antiLocals.concat(antiLocal);
						locals = locals.concat(local);
					});
					/* Either the call expression is inside a function or it is a self invoking call expression in the global scope*/
					if (_functionId) {
						// args.length && rewriteArguments(args);
					}
					// antiLocals.length && Array.prototype.push.apply(functionToNonLocals[functionId], antiLocals);
					// antiLocals.forEach(function(read){
					// 	if (options.useProxy){
					// 			update(read, 'closureProxy.',read.source());
					// 	}
					// });
					globalReads.forEach(function(read){
						var newRead = util.logReadsHelper(read,scope.checkAndReplaceAlias(read));
						if (options.caching)
							update(read, options.tracer_name, '.logRead(', JSON.stringify(functionId),',[', newRead, '],[', util.getAllIdentifiersFromMemberExpression(read),'])');
						if (options.useProxy){
							if (util.checkIfReservedWord(read)) return;
							if (read.source() == "this") {
								// update(read, "thisProxy");
								return
							}
							if (read.source() == "window") {
								// update(read, options.proxyName)
							}
							else{
								// console.log(read.source());
								// console.log(node.callee.source());
								update(read, options.proxyName, '.', read.source());
							}
						}
					});
					rewriteClosure(antiLocals,_functionId);
					
					if (!functionIBFArgs[functionId])
						functionIBFArgs[functionId] = {};
					if (!functionIBFArgs[functionId][functionIBFArgsCounter])
						functionIBFArgs[functionId][functionIBFArgsCounter] = [];

					if (!functionsVarDecl[functionId])
						functionsVarDecl[functionId] = [];
					var varsDecl = functionsVarDecl[functionId];


					/*
					If an inbuilt function is a part of conditional expression, only log it if its not the test part of the expression
					because the test returns a value which is used to make future decisions. Same as my logic for not logging call expressions
					which are child of variable declarations. 
					Also make sure that despite being inside conditional expression, it is not a child of the return statement, because it was would redundant
					*/
					/*
					Certain functions should not be tracked, for example if the function has a getter, or if the function is a method of an array 
					objects, because it will be tracked anyway. 
					*/
					return;
					var getIBFSource = ["get",".push"];
					if ( (node.parent.type == "ExpressionStatement" || node.parent.type == "SequenceExpression" || node.parent.type == "LogicalExpression" || (
						node.parent.type == "ConditionalExpression" && node.parent.test != node && (!node.parent.parent || node.parent.parent.type != "ReturnStatement")) )
						&& node.callee.type != "FunctionExpression" && getIBFSource.filter(e=>node.source().indexOf(e)<0).length > 1) {
						var evalString = ceToFinalExpression.get(node)

						if (evalString.join("") != "") {
							var ibfArgs = [], ibfArgStrs, ibfArgVals = [];
							functionIBFArgs[functionId][functionIBFArgsCounter] = 
									functionIBFArgs[functionId][functionIBFArgsCounter].concat(IBFlocals.map((e)=>{ if (varsDecl.indexOf(ASTSourceMap.get(e))<0) return ASTSourceMap.get(e)}).filter(e=>e));
							functionsVarDecl[functionId] = functionsVarDecl[functionId].concat(IBFlocals.map(e=>e.source())); 
							ibfArgs = functionIBFArgs[functionId][functionIBFArgsCounter];
							ibfArgVals = ibfArgVals.concat(ibfArgs);

							ibfArgStrs = JSON.stringify(ibfArgs);

							 /*
							sometimes node.callee.source is not a valid function, example b.parentNode.removeChild(b), now b.parentNode.removeChild doesn't exist
							*/
							var nodeCalleeSource = node.callee.source();
							if (node.callee.type == "CallExpression" || util.nodeContainsCall(node.callee)){
								/*two calls happening at the same time. Can't correctly do signature propagation meta data handling
								send empty callee name*/
								nodeCalleeSource = "null";
							}
							else {
								if (node.callee.source().indexOf("parentNode.removeChild")>=0)
									nodeCalleeSource = "document.removeChild"
								else if (node.callee.type == "SequenceExpression")
									nodeCalleeSource = "(" + nodeCalleeSource + ")";
							}
						// console.log("Node before IBF update", node.source());
						// update(node, options.tracer_name,".logIBF(",JSON.stringify(functionId),',', node.source(),',',nodeCalleeSource,',`',util.escapeRegExp(evalString[0]), '`,`',
						// 		 util.escapeRegExp(evalString[1]),'`,',ibfArgStrs, ',[', ...(ibfArgVals.map(e=>e+",")) ,'])');
							functionIBFArgsCounter++;
						}
						// console.log("Node after IBF update", node.source());
					}
					if (node.parent.type == "CallExpression" || node.parent.type == "MemberExpression"){
						functionIBFArgs[functionId][functionIBFArgsCounter] = 
								functionIBFArgs[functionId][functionIBFArgsCounter].concat(IBFlocals.map((e)=>{ if (varsDecl.indexOf(ASTSourceMap.get(e))<0) return ASTSourceMap.get(e)}).filter(e=>e)); 
						functionsVarDecl[functionId] = varsDecl.concat(IBFlocals.map(e=>ASTSourceMap.get(e)));
					}

				} else {
					var _functionId = util.getFunctionIdentifier(node, true);
					if (!_functionId)
						return;
					var {readArray, local, argReads, antiLocal} = signature.handleReads(node.callee);
					antiLocal.length && Array.prototype.push.apply(functionToNonLocals[makeId('function', options.path, _functionId)], antiLocal);
					node.arguments && node.arguments.forEach(function(param){
						/*if param is of the type function, then don't analyze*/
						if (param.type == "FunctionExpression") return;
						var {readArray, local,argReads, antiLocal} = signature.handleReads(param);
						antiLocal.length && Array.prototype.push.apply(functionToNonLocals[makeId('function', options.path, _functionId)], antiLocal);
					});
				}

				var globalDOMMethods = Object.keys(propertyObj.global);
				var localDOMMethods = Object.keys(propertyObj.local);
				var isLocal = false;


				if (node.parent.type == "SequenceExpression" || node.parent.type == "ExpressionStatement") {

					// First check if a local DOM method
					localDOMMethods.forEach(function(DOMMethod){
						if (node.callee.source().toLowerCase().includes(DOMMethod.toLowerCase()))
							isLocal = true;
					});
					globalDOMMethods.forEach(function(DOMMethod){
						if (!isLocal && node.callee.source().toLowerCase().includes(DOMMethod.toLowerCase())) {
							// checkAndReplaceAlias(node);
							var _functionId = util.getFunctionIdentifier(node);
							if (_functionId) {
								// var functionId = makeId('function', options.path, _functionId);
								// if (uncacheableFunctions.indexOf(functionId) == -1) {
								// 	// uncacheableFunctions.push(functionId);
								// }
								// update(node, options.tracer_name,'.setMutationContext(', node.source(),',', JSON.stringify(functionId), ')');
							}
						}
					});
				}
			} else if (node.type == "ThrowStatement"){
				var _functionId = util.getFunctionIdentifier(node);
				if (_functionId) {
					// update(node, "throw ", options.tracer_name,'.logThrowStatement(',node.argument.source(),');',);
				}
			} else if (node.type == "ReturnStatement") {
				var _functionId = util.getFunctionIdentifier(node,true);
				if (_functionId) {
					node.containsReturn = true;
					// var functionId = makeId('function', options.path, _functionId);
					var _traceEnd = options.tracer_name + ".exitFunction(";
					if (node.argument){
						// var functionId = makeId('function', options.path, _functionId);
						var {readArray,local, argReads, antiLocal} = signature.handleReads(node.argument);
						readArray.forEach(function(read){
							if (options.useProxy){
								if (util.checkIfReservedWord(read) || read.source() == "this") return;
								if (read.source() == "window") {
									update(read, options.proxyName)
								}
								else{
									update(read, options.proxyName, '.', read.source());
								}
							}
						});
						rewriteClosure(antiLocal,_functionId);
						// argReads.forEach(function(read){
						// 	if (options.useProxy){
						// 			update(read.val, 'argumentProxy[',read.ind, ']');
						// 	}
						// });
						// antiLocal.length && Array.prototype.push.apply(functionToNonLocals[makeId('function', options.path, _functionId)], antiLocal);
						// antiLocal.forEach(function(read){
						// 	if (options.useProxy){
						// 			update(read, 'closureProxy.',read.source());
						// 	}
						// });
					}
					if (node.argument && node.argument.type == "SequenceExpression" ) {
						var returnValue = node.argument.expressions[node.argument.expressions.length - 1];
						var preReturns = node.argument.expressions.slice(0,-1).map(function(e){return e.source()}).join();
						if (options.caching || options.useProxy) {
							// update(node, 'return ',preReturns ,',', options.tracer_name, 
							// '.logReturnValue(', JSON.stringify(functionId), ',',returnValue.source() ,',arguments',');');
							// update(node,  _traceEnd, JSON.stringify(functionId),',arguments', ');\n', node.source())
						}
						// if (options.useProxy)
							// update(node, 'return ',preReturns ,',', options.tracer_name, 
							// '.logReturnValue(', JSON.stringify(functionId), ',', returnValue.source(),
							// 	',',options.proxyName,'.',returnValue.source(),");");
					} else {
						if (options.caching || options.useProxy) {
							// update(node, "return ", options.tracer_name, '.logReturnValue(', JSON.stringify(functionId),
							//  ',', node.argument ? node.argument.source() : "null",',arguments',");");
							// update(node,  _traceEnd, JSON.stringify(functionId),',arguments', ');\n', node.source());
						}
						// if (options.useProxy)
						// 	update(node, "return ", options.tracer_name, '.logReturnValue(', JSON.stringify(functionId), ',', node.argument.source(),
						// 		',',options.proxyName,'.',node.argument.source(),");");
					}
				} else {
					var _functionId = util.getFunctionIdentifier(node, true);
					if (!_functionId)
						return;
					var {readArray, local, argReads, antiLocal} = signature.handleReads(node.argument);
					antiLocal.length && Array.prototype.push.apply(functionToNonLocals[makeId('function', options.path, _functionId)], antiLocal);
				}
				// } else {console.log("ERROR analyses says return is outside function " + ASTSourceMap.get(node))}
			/* This function expression might be a part of the call expression as well however that will be taken care of inside the call expression check itself. */
			} else if ((node.type == "FunctionDeclaration" || node.type == "FunctionExpression")) {
				functionIBFArgsCounter = 0;
				var containsReturn = false, closures = [];
				var index = makeId('function', options.path, node);
				if (node.containsReturn) containsReturn = true;
				if (functionToNonLocals[index].length) {
					// closures = insertClosureProxy(node, index);
				}
				var nodeBody = node.body.source().substring(1, node.body.source().length-1);
				if ( (options.rti || options.myCg)){
					if (uncacheableFunctions["RTI"].indexOf(node)>=0) {
						var ret = rewriteClosure.insertClosureProxy(node, nodeBody); // for both root and non-root functions
						if (ret){
							//closure object was inserted 
							nodeBody = node.body.source();
						}
						// rewriteClosure.insertClosureObj(node, nodeBody); //only for non-root functions
						//insert braces manually
						update(node.body, '{', node.body.source(), '}');
						return
					}
				}

				// var isRoot = node.id && node.id.name.indexOf(IIFE_NAME)>=0 ? true : false;
    //             if (!isRoot)
    //                 return;

                // if (node.id && node.id.name.indexOf("____")>=0){
                //     update(node.id, node.id.source().split('____')[1]);
                // }

				var isCacheable = true,
					enableRecord = node.nullTimeNode == null ? true : false;

				// Make sure the length of the source is atleast 
				//Start modifiying the function 
				staticInfo.rtiDebugInfo.matchedNodes.push([index,node.time]);

				var replayObjects = ",arguments,";
				if (functionToNonLocals[index].length)
					replayObjects+="__closureObj,";
				else replayObjects += "null,";
				if (functionsContainingThis.indexOf(index)>=0)
					replayObjects+="this";
				else replayObjects += "null";
				var _traceBegin = "" + options.tracer_name + ".cacheAndReplay(";
				// update(node.body, '\n', ' var __tracerRet; \nif ( __tracerRet = ', _traceBegin, JSON.stringify(index) ,replayObjects,
				// 	 ')) \n return __tracerRet; \n',
				// 	 nodeBody,' \n');

				// insertArgumentProxy(node);
				if (functionsContainingThis.indexOf(index)>=0) {
					var proxyStr = 'var thisProxy = ' + options.tracer_name + '.createThisProxy(this);\n';
					// update(node.body, '\n',proxyStr, node.body.source());
				}

				rewriteClosure.insertClosureProxy(node, node.body.source());

				// update(node.body, '{ \ntry {\n',options.tracer_name,'.cacheInit(', JSON.stringify(index),',arguments, new.target',',',JSON.stringify(enableRecord),');\n',
				// 	node.body.source());

				var args = node;
				var serializedArgs = {};
				var returnValue = node.returnValue ? node.returnValue.source() : "null";
				if (args.globalWrites) serializedArgs.globalWrites = args.globalWrites;
				if (args.globalReads) serializedArgs.globalReads = args.globalReads;
				if (args.localVariables) serializedArgs.localVariables = args.localVariables.map(function(elem){return elem.source()});
				if (args.globalAlias) serializedArgs.globalAlias = args.globalAlias;
				serializedArgs.returnValue = returnValue;
				// serializedArgs = {};
				var _traceEnd = options.tracer_name + ".exitFunction(";// + args + ");";
				
				var closureRestoreStr = "";
				closures[2] && closures[2].forEach((obj)=>{
					closureRestoreStr += "if (!(" + obj + " instanceof Object)) " 
					+ obj  + "= __closureObj." + obj + ";\n";
				})
				var argumentRestoreStr = "";
				node.params.length && node.params.forEach((obj,ind)=>{
					argumentRestoreStr += "if (!(" + ASTSourceMap.get(obj) + " instanceof Object)) " 
					+ ASTSourceMap.get(obj)  + "= arguments[" + ind + "];\n";
				})

				// update(node.body, node.body.source(),' \n} catch (e){ throw e} finally {',
				// 	// closureRestoreStr ?  closureRestoreStr :null, 
				// 	// argumentRestoreStr ? argumentRestoreStr :null,
				// 	 _traceEnd, JSON.stringify(index),',',JSON.stringify(enableRecord), ');\n }}');
				var nodeName;
				/*Closure scope needs a getter and setter only during*/
				// closures[1] && (nodeName = util.getNameFromFunction(node)) && insertClosureAccessors(node, nodeName, closures[0], false)
			}
		});
		processed = m;

	} catch (e) {
		console.error('[PARSING EXCEPTION]' + options.path + ": " + e + e.stack);
		// mostly exception imples that it is a json file. 
		return content;
	}

	return processed;
};


module.exports = {
	instrument: instrument,
	instrumentationPrefix: instrumentationPrefix,
	staticInfo: staticInfo,
	makeId:makeId
};