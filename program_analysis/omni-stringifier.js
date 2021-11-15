
/*

This omni stringifier works in a multi step way

Reads: This is handled in a single step way, mostly like JSON.stringify, only difference being, it also handles functions, symbols and custom objects
Writes: 
This has two steps 
step 1: You don't actually stringify the object, you replace every reference inside the object with an object id, and return a new object 
example: {1:d} => {1:{__dynId: 2}}, a = > {__dynId: 4};

step 2: You iterate through the object, and convert every id into the actual path, or if no id is there, you simply stringify it like before

*/


(function() {
    var scope,
      __hasProp = {}.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };
  
    scope = this;
  
    var objectToId = new WeakMap();
    var idToObject = new Map();
  
  
    var tracer; 
    var objectUID = 1;
  
  function createXPathFromElement(elm) { 
      // var allNodes = document.getElementsByTagName('*'); 
      for (var segs = []; elm && (elm.nodeType == 1 || elm.nodeType == 3); elm = elm.parentNode) 
      { 
          /*if (elm.hasAttribute && elm.hasAttribute('id')) { 
                  var uniqueIdCount = 0; 
                  for (var n=0;n < allNodes.length;n++) { 
                      if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++; 
                      if (uniqueIdCount > 1) break; 
                  }; 
                  if ( uniqueIdCount == 1) { 
                      segs.unshift('id("' + elm.getAttribute('id') + '")'); 
                      return segs.join('/'); 
                  } else { 
                      segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]'); 
                  } 
          } else if (elm.hasAttribute && elm.hasAttribute('class')) { 
              segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]'); 
          } else { */
            if (elm.localName) {
              for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) { 
                  if (sib.localName == elm.localName)  i++; }; 
                  segs.unshift(elm.localName.toLowerCase() + '[' + i + ']'); 
            } else {
              for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) { 
                  if (sib.nodeType == 3)  i++; }; 
                  segs.unshift("text()" + '[' + i + ']'); 
            }
          // }; 
      }; 
      return segs.length ? '/' + segs.join('/') : null; 
  }; 
  
  function lookupElementByXPath(path) { 
      var evaluator = new XPathEvaluator(); 
      var result = evaluator.evaluate(path, document.documentElement, null,XPathResult.FIRST_ORDERED_NODE_TYPE, null); 
      return  result.singleNodeValue; 
  } 
  
  
    function stringify(obj) {
          try {
              return JSON.stringify(obj, function (key, value) {
                if (value && value.__isProxy)
                      value = value.__target;
                var fnBody;
                if (value instanceof Function || typeof value == 'function') {
  
                  if ((/\{\s*\[native code\]\s*\}/).test(value.toString())) {
                      return value.name;
                  }
                  fnBody = value.toString();
  
                  if (fnBody.length < 8 || fnBody.substring(0, 8) !== 'function') { /*this is ES6 Arrow Function*/
                    return '_NuFrRa_' + fnBody;
                  }
                  return fnBody;
                }
                if (value instanceof RegExp) {
                  return '_PxEgEr_' + value;
                }
                return value;
              });
          } catch(e){
              return e;
          }
      };
  
    (function(definition) {
        return scope.Omni = definition();
    })(function() {
      var ContextResolver, Omni, MultiResolver, Resolver, Util;
      Util = {
        d2h: function(d) {
          return d.toString(16);
        },
        h2d: function(h) {
          return window.__tracerParseInt(h, 16);
        },
        supportsProto: {}.__proto__ != null,
        supportsFunctionNames: typeof (function() {}).name === "string"
      };
      Util.functionName = Util.supportsFunctionNames ? function(func) {
          if (func)
              return func.name;
          else return func
      } : function(func) {
        var _ref;
        return (_ref = func.toString().match(/function ([^(]*)/)) != null ? _ref[1] : void 0;
      };
      Util.isArray = Array.isArray ? Array.isArray : function(arr) {
        return Object.prototype.toString.call(arr) === "[object Array]";
      };
      Omni = (function() {
  
        Omni.name = 'Omni';
  
        Omni.NonPrototypeFunctionError = (function(_super) {
  
          __extends(NonPrototypeFunctionError, _super);
  
          NonPrototypeFunctionError.name = 'NonPrototypeFunctionError';
  
          function NonPrototypeFunctionError(object, name) {
            this.object = object;
            this.name = name;
            this.message = "[OMNI] Couldn't serialize object; had non-prototype function '" + this.name + "'";
          }
  
          return NonPrototypeFunctionError;
  
        })(Error);
  
        Omni.PrototypeNotFoundError = (function(_super) {
  
          __extends(PrototypeNotFoundError, _super);
  
          PrototypeNotFoundError.name = 'PrototypeNotFoundError';
  
          function PrototypeNotFoundError(object, cons_id) {
            this.object = object;
            this.cons_id = cons_id;
            this.message = "[OMNI] Prototype not found for object; looked for " + this.cons_id;
          }
  
          return PrototypeNotFoundError;
  
        })(Error);
  
        Omni.AnonymousConstructorError = (function(_super) {
  
          __extends(AnonymousConstructorError, _super);
  
          AnonymousConstructorError.name = 'AnonymousConstructorError';
  
          function AnonymousConstructorError(object) {
            this.object = object;
            this.message = "[OMNI]Couldn't resolve constructor name; seems it has an anonymous constructor and object's prototype has no #constructor_name property to provide hints";
          }
  
          return AnonymousConstructorError;
  
        })(Error);
  
        Omni.VersionInstancePropertyError = (function(_super) {
  
          __extends(VersionInstancePropertyError, _super);
  
          VersionInstancePropertyError.name = 'VersionInstancePropertyError';
  
          function VersionInstancePropertyError(object) {
            this.object = object;
            this.message = "[OMNI]Objects can't have versions on the instances; can only be on the prototype";
          }
  
          return VersionInstancePropertyError;
  
        })(Error);
  
        Omni.DOMConstructorError = (function(_super) {
  
          __extends(DOMConstructorError, _super);
  
          DOMConstructorError.name = 'DOMConstructorError';
  
          function DOMConstructorError(object) {
            this.object = object;
            this.message = "[OMNI] can't serialize dom|cssom objects";
          }
  
          return DOMConstructorError;
  
        })(Error);
  
        Omni.DOMXMLPathError = (function(_super) {
          __extends(DOMXMLPathError,_super);
  
          DOMXMLPathError.name = 'DOMXMLPathError';
          function DOMXMLPathError(object){
            this.object = object;
            this.message = "[OMNI] can't find dom using xml path";
          }
          return DOMXMLPathError;
        })(Error)
  
        function Omni(resolver) {
          this.resolver = resolver != null ? resolver : null;
          if (!(this.resolver != null)) {
            if (typeof window === "undefined") {
              throw new Error("[OMNI] A context-resolver is required in non-browser environments");
            }
            this.resolver = new ContextResolver(scope);
          }
          this.errorHandler = function(e) {
            throw e;
          };
          this.migrations = {};
        }
  
        var isDOMInheritedProperty = function(method){
          return method && (method instanceof EventTarget || method instanceof HTMLCollection || method instanceof NodeList || method.readState
              /*|| method.click || method.appendData*/) /*&& (method && method.self != method)*/
        }
  
  
        Omni.prototype.assignId = function(obj){
          if (!obj) return;
          var _id = objectToId.get(obj);
          if (!_id) {
              // Object.defineProperty(obj, "__Omni_id", {
              //     value : Util.d2h(this.counter++),
              //     writable: false,
              //     configurable: false, 
              //     enumerable: false
              // })
              _id = Util.d2h(this.counter++);
              objectToId.set(obj, _id);
          }
          return _id;
        }
  
        var handleProxyObjs = function(obj){
          var objId = __tracer.getIdFromProxy(obj);
          if (objId == null) return;
          var nodeId = obj.__debug || __tracer.getShadowStackHead();
          if (!nodeId) return;
          var writeLog = __tracer.getInvocationToWrites();
          if (!writeLog[nodeId])
            writeLog[nodeId] = [];
          var isBrokenReference;
          if (writeLog[nodeId]){
            writeLog[nodeId].forEach((entry)=>{
              if (entry[0] == "broken-reference" && entry[1]== objId)
                isBrokenReference = true;
            })
          }
          if (isBrokenReference)
            return null;
          writeLog[nodeId].push([obj.__isProxy, objId]);
          return {__dynId:objId, state: obj.__isProxy, nodeId: obj.__debug};
        }
  
        var handleProxyIds = function(id,state,nodeId){
          var path = __tracer.getPathFromProxyId(id,state,nodeId);
          if (path)
             return {__dynPath: path};
        }
  
        Omni.prototype.counter = 0;
  
        var OMNI_SIZE_LIMIT=10000;
        Omni.prototype.size = 0;
  
        var customStringify = function(input){
          var ignoreLSKeys = ["fnCacheExists","keyMap","signature"]
          return JSON.stringify(input, function(key, value){
              if (ignoreLSKeys.indexOf(key)<0)
                return value;
          })
        }
  
        function isNative(fn) {
          return (/\{\s*\[native code\]\s*\}/).test('' + fn);
        }
  
        function exposeClosureScope(input, closureStringifier, seen_objs){
          var clObj = input.__getScope__ && input.__getScope__();
          if (!clObj){
            //If global function, then alright to not have scope exposed since it
            // is not a closure function. Otherwise, error 
            if (input.name && window[input.name] == input)
              return "";
            else throw new Error("Closure scope could not be exposed"); 
          }
          var closureStr = {};
          Object.keys(clObj).forEach((k)=>{
            if (k.indexOf("set")>=0 || k == "__isClosureObj"
              || input == clObj[k]) return;
            closureStr[k] = clObj[k];
            // closureStr += " var " + k + " = " + stringifier(clObj[k],"read",2) + ";";
          })
          return closureStringifier.stringify(closureStr,"write",2, seen_objs);
        }
  
        /*
          Returns a an array where the first index is the stringified value is non primitive
          otherwise the value itself. The second indicates whether the input was a primitive data
          type
        */
        Omni.prototype.stringify = function(input,state,stage, seen_objs) {
          try {
              state = "read"
  
            var arr, i, result, output,_id;
  
            var seen_objs;
            if (!seen_objs)
              seen_objs = new Set();
            else seen_objs = seen_objs;
            this.size = 0;
            this.processed_inputs = [];
  
            var emptyFn = function(a){return a};
            var stringify = state == "read" || stage == 2 ? function(o,skipMD){
              var str = JSON.stringify(o);
              if (state != "read" || skipMD)
                return str;
              var strDelim = ";;&;;", finalStr;
              if (o && Array.isArray(o))
                finalStr = str + strDelim + "array" + strDelim + Object.keys(o).length;
              else if( o && typeof o == "object")
                finalStr = str + strDelim + typeof o + strDelim + Object.keys(o).length;
              else finalStr = str;
  
              return finalStr;
            }: emptyFn; 
            var primStringify = state == "read" || stage == 2 ? function (a){
              return [a,true];
            } : function (a){
              return a;
            };
            var _encodeURI = state == "read" || stage == 2 ? encodeURI : emptyFn; 
  
            if (state == "write" && stage == 1 && input && input.__isProxy){
              var _ret = handleProxyObjs(input);
              if (_ret) return stringify(_ret);
            } else if (state == "write" && stage == 2 && input && input.__dynId){
              var _ret = handleProxyIds(input.__dynId, input.state, input.nodeId);
              if (_ret) return stringify(_ret);
            }
  
            if (input && input.__isProxy)
                input = input.__target;
  
            if (input && input instanceof Storage)
              return customStringify(input);
  
            result = (function() {
              var _i, _len;
              switch (typeof input) {
                case "number":
                case "boolean":
                  return primStringify(input);
                case "string":
                  return primStringify((input));
                case "symbol":
                  if (state == "write") 
                    throw new Error("[OMNI] can't serialize symbols");
                  else return "";
                  break;
                case "function":
                  // if (state == "write") 
                  //   throw new Error("[OMNI] can't serialize functions");
                  if (state == "read") return "__func__source";
                default:
                  if (state == "write")
                    _id = this.assignId(input);
                  if (isDOMInheritedProperty(input)){
                    __tracer.updateDC();
                    var dom2json = {};
                    // dom2json.xpath = createXPathFromElement(input);
                    /*Not an accurate check since some documents objects don't
                     satisfy this condition, hence commenting*/
                    if (input.__proto__.constructor.name == "HTMLDocument") {
                      // dom2json = domJSON.toJSON(input,{
                      //   deep: false,
                      //   attributes : ['id'],
                      //   domProperties: false,
                      // });
                      if (state == "write") 
                        dom2json.document = true;
                    }
                    if (state == "write") {
                      dom2json.__Omni_id = _id;
                      dom2json.__Omni_type = "DOM";
                    }
                  
                    return stringify(dom2json,true);
                  }
                  // try {
                  //   var __s =  JSON.stringify(input);
                  // } catch (e){
                  //   if (e.name == "TypeError")
                  //     throw new Error("circular Object error");
                  // }
                  if (Util.isArray(input)) {
                    seen_objs.add(input);
                    arr = [];
                    for (_i = 0, _len = input.length; _i < _len; _i++) {
                      i = input[_i];
                      arr.push(this.analyze(i,state,seen_objs,stage));
                    }
                    // if (state == "write") 
                      // arr.push({__Omni_id:_id});
                    // arr.__Omni_id = input.__Omni_id;
                    return stringify(arr);
                  } else {
                    // seen_objs.add(input);
                    output = this.analyze(input,state,seen_objs,stage);
                    if (output == null)
                      return primStringify(output);
                    return stringify(output);
                  }
              }
            }).call(this);
            return result;
          } catch (e){
              return e;
          }
        };
  
        Omni.prototype.cleanAfterStringify = function() {
          var input, _i, _len, _ref;
          _ref = this.processed_inputs;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            input = _ref[_i];
            if (input) {
              delete input.__Omni_id;
            } 
            // if (Util.isArray(input)){
            //   input.pop();
            // }
          }
          return true;
        };
  
        Omni.prototype.analyze = function(input,state,seen_objs,stage) {
          if (this.size>OMNI_SIZE_LIMIT){
            throw new Error("[OMNI] Object size exceeded omni limit");
          }
          if (state == "write" && stage == 1 && input && input.__isProxy){
              var _ret = handleProxyObjs(input);
              if (_ret) return _ret;
            } else if (state == "write" && stage == 2 && input && input.__dynId != null){
              var _ret = handleProxyIds(input.__dynId,input.state, input.nodeId);
              if (_ret) return _ret;
          }
          if (input && input.__isProxy)
                input = input.__target;
          var cons, i, k, output, v, _i, _len,_id;
          switch (typeof input) {
            case "number":
               this.size += 8;
              return input;
            case "string":
              this.size+=input.length*2;
              return input
            case "boolean":
              this.size += 4;
              return input;
            case "symbol":
              if (state == "write") 
                return this.errorHandler(new Error("[OMNI] can't serialize symbols"));
              else return "";
            case "undefined":
              return void 0;
            case "function":
              // if (state == "write") 
              //   return this.errorHandler(new Error("[OMNI] can't serialize functions"));
              if (state == "read") return "__func__source";
            default:
              if (input === null) {
                return null;
              } else {
                if (isDOMInheritedProperty(input)){
                    if (state == "write") 
                      _id = this.assignId(input);
                    __tracer.updateDC();
                    var dom2json = {};
                    // dom2json.xpath = createXPathFromElement(input);
                    if (input.__proto__.constructor.name == "HTMLDocument") {
                      // dom2json = domJSON.toJSON(input,{
                      //   deep: false,
                      //   attributes : ['id'],
                      //   domProperties: false,
                      // });
                      if (state == "write")
                        dom2json.document = true;
                    } 
                    if (state == "write") {
                      dom2json.__Omni_id = _id;
                      dom2json.__Omni_type = "DOM";
                    }
                  
                    return (dom2json);
                } else if (Util.isArray(input)) {
                if (seen_objs.has(input))
                  throw new Error("circular Object error");
                seen_objs.add(input);
                if (state == "write")
                  _id = this.assignId(input);
                output = [];
                for (i = _i = 0, _len = input.length; _i < _len; i = ++_i) {
                  v = input[i];
                  output[i] = this.analyze(v,state,seen_objs,stage);
                }
                seen_objs.delete(input);
                // if (state == "write") 
                  // output.push({__Omni_id : _id});
                // output.__Omni_id == input.__Omni_id;
                return output;
              } else { 
                      if (seen_objs.has(input))
                        throw new Error("circular object error");
                      seen_objs.add(input);
                      if (state == "write")
                        _id = this.assignId(input);
                      // input.__Omni_id = _id;
                      // this.processed_inputs.push(input);
                      output = new Object;
                      for (k in input) {
                        v = input[k];
                        if (Object.hasOwnProperty.call(input, k) && k != "__getScope__") {
                          output[k] = this.analyze(v,state,seen_objs,stage);
                        }
                      }
                      seen_objs.delete(input);
                      // if (state == "write") 
                        // output.__Omni_id = _id;
                      cons = Util.functionName(input.constructor);
                      if (cons === "" && !Object.hasOwnProperty.call(input, "constructor_name")) {
                        cons = input.constructor_name;
                      }
                      if (!(cons != null)) {
                        this.errorHandler(new Omni.AnonymousConstructorError(input));
                      }
                      if (cons != null && ( cons.indexOf("CSS")>=0 || cons.indexOf("HTML")>=0))
                          this.errorHandler(new Omni.DOMConstructorError(input))
                      if (cons !== "Object") {
                        if (state == "write") {
                          output.__Omni_cons = cons;
                          if (cons == "Function") {
                            /*If serializing function, store the function body*/
                            if (isNative(input))
                              return this.errorHandler(new Error("[OMNI] can't serialize native functions"));
                            output.__body__ = input.toString()
                            // output.__scope__ = exposeClosureScope(input, this, seen_objs);
                            // if (output.__scope__ && output.__scope__.stack)
                            //   throw new Error("Closure scope could not be exposed");
                          }
                        } else {
                          switch (cons){
                            case "Map": output =  Array.from(input.entries()); break;
                            case "Set": output =  Array.from(input.values()); break;
                            case "RegExp": output =  input.source; break;
                          }
                        }
                      }
                      // if (input.hasOwnProperty("version")) {
                      //   this.errorHandler(new Omni.VersionInstancePropertyError(input));
                      // }
                      // if (input.version != null) {
                      //   output.version = input.version;
                      // }
                      return output;
                  }
              }
          }
        };
  
        Omni.prototype.setErrorHandler = function(errorHandler) {
          this.errorHandler = errorHandler;
        };
  
        Omni._refMatcher = /__Omni_ref_(.*)/;
  
        Omni.prototype.parse = function(input, params) {
          try {
            var l, o,_o, obj, obj_key, ref_id, reference, _i, _len, _ref;
            this.identified_objects = [];
            this.references_to_resolve = [];
            try {
             _o = JSON.parse(input);
           } catch (e){
              return input;
           }
            o = this.fixTree(_o,params);
            if (Util.isArray(o) || ((o != null) && typeof o === "object") && !_o.__Omni_type) {
              l = o.length;
              if (o != null) {
                _ref = this.references_to_resolve;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                  reference = _ref[_i];
                  obj = reference[0], obj_key = reference[1], ref_id = reference[2];
                  // obj[obj_key] = this.identified_objects[ref_id];
                  obj[obj_key] = idToObject.get(ref_id);
                }
                // this.clean(o);
              }
            }
            return o;
          } catch (e){
            throw e;
          }
        };
  
        Omni.prototype.fixTree = function(obj,params) {
          var k, k2, m, proto, t, tmp, v, v2, _i, _len;
          if (obj && obj.__Omni_id) {
              var corObj = idToObject.get(Util.h2d(obj.__Omni_id));
              if (corObj)
                  return corObj;
          }
  
          if (params && obj && obj.__dynPath){
            var obj = __tracer.traversePath(obj.__dynPath,params);
            return obj;
          }
  
          if (obj && obj.__Omni_type == "DOM"){
            if (obj.document)
              return document;
            // var o = domJSON.toDOM(obj);
            var o = lookupElementByXPath(obj.xpath);
            if (!o){
              this.errorHandler(new Omni.DOMXMLPathError(obj));
            }
            // idToObject.set(Util.h2d(obj.__Omni_id), o);
            return o;
          }
  
          if (Util.isArray(obj)) {
              // if (obj[obj.length - 1].__Omni_id){
              //     var _id = obj[obj.length - 1].__Omni_id;
              //     var corObj = idToObject.get(Util.h2d(_id));
              //     if (corObj)
              //         return corObj;
              //     else {
              //         idToObject.set(Util.h2d(_id), obj);
              //     }
              //     obj.pop();
              // }
            for (k = _i = 0, _len = obj.length; _i < _len; k = ++_i) {
              v = obj[k];
              v = this.fixTree(v,params);
              if (v === "__Omni_undef") {
                obj[k] = void 0;
              /*} else if (typeof v === "string" && (m = v.match(Omni._refMatcher))) {
                k2 = Util.h2d(m[1]);
                this.references_to_resolve.push([obj, k, k2]);
              } else if ( (k == _len -1) && v.__Omni_id) {
                  idToObject.set(Util.h2d(v.__Omni_id), obj);
              */} else {
                obj[k] = v;
              }
            }
          } else if (obj === "__Omni_undef") {
            obj = void 0;
          } else if ((obj != null) && typeof obj === "object") {
            __id = obj.__Omni_id;
            if (obj && (obj.__Omni_cons != null)) {
              proto = this.resolvePrototype(obj.__Omni_cons);
              if (proto != null) {
                if (Util.supportsProto) {
                  if (obj.__Omni_cons != "Function")
                    t = new proto;
                  else {
                    var body = obj.__body__;
                    var scopeObj = __tracer.omni.parse(obj.__scope__);
                    with (scopeObj){
                      // t = new Function(' return ' + body)()
                      eval("t=" + body);
                    }
                  }
                  for (k in obj) {
                    v = obj[k];
                    if (obj.hasOwnProperty(k) && k != "__Omni_cons" && k != "__body__" 
                      && k != "__scope__") {
                      t[k] = v;
                    }
                  }
                  // idToObject.set(Util.h2d(obj.__Omni_id), t);
                  obj = t;
                }
              } else {
                this.errorHandler(new Omni.PrototypeNotFoundError(obj, obj.__Omni_cons));
              }
            }
            for (k in obj) {
              v = obj[k];
              if (obj.hasOwnProperty(k)) {
                v = this.fixTree(v,params);
                if (k === "__Omni_id") {
                  v2 = Util.h2d(v);
                  // this.identified_objects[v2] = obj;
                  // idToObject.set(v2, obj);
                } else if (v === "__Omni_undef") {
                  obj[k] = void 0;
                } else if (typeof v === "string" && (m = v.match(Omni._refMatcher))) {
                  k2 = Util.h2d(m[1]);
                  this.references_to_resolve.push([obj, k, k2]);
                } else {
                  obj[k] = v;
                }
              }
            }
          // idToObject.set(Util.h2d(__id), obj);
          } else if (typeof obj == "string")
              return (obj);
          return obj;
        };
  
        Omni.prototype.resolvePrototype = function(cons_id) {
          if (!(this.resolver != null)) {
            throw new Error("No Omni resolver found -- you should specify one in the Omni constructor!");
          }
          return this.resolver.resolve(cons_id);
        };
  
        Omni.prototype.clean = function(o, cleaned) {
          var i, k, migrations, num, v, _i, _j, _len, _ref, _ref1;
          // if (cleaned == null) {
          //   cleaned = [];
          // }
          if (o === null || typeof o !== "object") {
            return true;
          }
          // if (!Util.isArray(o) && cleaned.indexOf(o) > -1) {
          //   return true;
          // }
          /*migrations = this.migrations[o.__Omni_cons];
          if ((o.version != null) && (migrations != null) && o.version < migrations.length) {
            for (num = _i = _ref = o.version, _ref1 = migrations.length - 1; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; num = _ref <= _ref1 ? ++_i : --_i) {
              migrations[num].call(o);
            }
            // delete o.version;
          }*/
  
          if (o && o.__Omni_type){
            delete o.__Omni_type;
            return;
          }
  
          // cleaned.push(o);
          if (Util.isArray(o)) {
            // if (o.find(el=>el.__Omni_id))
            //   o.pop();
            for (_j = 0, _len = o.length; _j < _len; _j++) {
              i = o[_j];
              this.clean(i);
            }
          } else {
            for (k of Object.getOwnPropertyNames(o)) {
              v = o[k];
              if (k === "__Omni_id" || k === "__Omni_cons" || k == "__body__") {
                delete o[k];
              } else {
                this.clean(v);
              }
            }
          }
          return true;
        };
  
        Omni.prototype.migration = function(klass, index, callback) {
          var all_versions;
          switch (typeof klass) {
            case "function":
              klass = klass.name;
              if (klass === "") {
                this.errorHandler(new Omni.AnonymousConstructorError(klass));
              }
              break;
            case "string":
              null;
  
              break;
            default:
              throw new Error("invalid class passed in; pass a function or a string");
          }
          all_versions = this.migrations[klass];
          if (!(all_versions != null)) {
            all_versions = this.migrations[klass] = [];
          }
          all_versions[index - 1] = callback;
          return true;
        };
  
        return Omni;
  
      })();
      Resolver = (function() {
  
        Resolver.name = 'Resolver';
  
        function Resolver() {}
  
        Resolver.prototype.resolve = function(cons_id) {
          throw new Error("abstract");
        };
  
        return Resolver;
  
      })();
      ContextResolver = (function(_super) {
  
        __extends(ContextResolver, _super);
  
        ContextResolver.name = 'ContextResolver';
  
        function ContextResolver(context) {
          this.context = context;
        }
  
        ContextResolver.prototype.resolve = function(cons_id) {
          var v;
          v = this.context[cons_id];
          if (v != null) {
            return v;
          } else {
            return null;
          }
        };
  
        return ContextResolver;
  
      })(Resolver);
      MultiResolver = (function(_super) {
  
        __extends(MultiResolver, _super);
  
        MultiResolver.name = 'MultiResolver';
  
        function MultiResolver(resolvers) {
          this.resolvers = resolvers != null ? resolvers : [];
        }
  
        MultiResolver.prototype.resolve = function(cons_id) {
          var proto, res, _i, _len, _ref;
          _ref = this.resolvers;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            res = _ref[_i];
            proto = res.resolve(cons_id);
            if (proto != null) {
              return proto;
            }
          }
          return null;
        };
  
        return MultiResolver;
  
      })(Resolver);
      Omni.Util = Util;
      Omni.Resolver = Resolver;
      Omni.ContextResolver = ContextResolver;
      Omni.MultiResolver = MultiResolver;
      return Omni;
    });
  
  }).call(this);