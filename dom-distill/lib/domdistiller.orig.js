
(function () {var $gwt_version = "2.7.0";var $wnd = window;var $doc = $wnd.document;var $moduleName, $moduleBase;var $stats = $wnd.__gwtStatsEvent ? function(a) {$wnd.__gwtStatsEvent(a)} : null;var $strongName = '5D9DE0E3B8192BB468D6AF8CAA032C5D';var $intern_0 = 2147483647, $intern_1 = {3:1, 12:1}, $intern_2 = {3:1, 15:1, 12:1}, $intern_3 = {3:1, 4:1}, $intern_4 = {3:1, 5:1, 6:1, 4:1}, $intern_5 = {10:1, 19:1, 3:1, 11:1, 9:1}, $intern_7 = {3:1, 5:1, 14:1, 6:1, 4:1, 13:1}, $intern_8 = {46:1}, $intern_9 = {25:1}, $intern_10 = {3:1, 30:1}, $intern_11 = {3:1, 11:1, 9:1, 29:1}, $intern_12 = {3:1, 5:1, 4:1}, _, initFnList_0, prototypesByTypeId_0 = {};
function typeMarkerFn() {
}
function portableObjCreate(obj) {
  function F() {
  }
  F.prototype = obj || {};
  return new F;
}
function emptyMethod() {
}
function defineClass(typeId, superTypeId, castableTypeMap) {
  var prototype_0 = prototypesByTypeId_0[typeId], clazz = prototype_0 instanceof Array ? prototype_0[0] : null;
  prototype_0 && !clazz ? _ = prototype_0 : (_ = prototypesByTypeId_0[typeId] = superTypeId ? portableObjCreate(prototypesByTypeId_0[superTypeId]) : {}, _.castableTypeMap$ = castableTypeMap, _.constructor = _, !superTypeId && (_.typeMarker$ = typeMarkerFn));
  for (prototype_0 = 3;prototype_0 < arguments.length;++prototype_0) {
    arguments[prototype_0].prototype = _;
  }
  clazz && (_.___clazz$ = clazz);
}
function Object_0() {
}
function equals_Ljava_lang_Object__Z__devirtual$(this$static, other) {
  return isJavaString(this$static) ? this$static === other : hasJavaObjectVirtualDispatch(this$static) ? this$static.equals$(other) : (isJavaArray(this$static), this$static === other);
}
function getClass__Ljava_lang_Class___devirtual$(this$static) {
  return isJavaString(this$static) ? Ljava_lang_String_2_classLit : hasJavaObjectVirtualDispatch(this$static) ? this$static.___clazz$ : isJavaArray(this$static) ? this$static.___clazz$ : Lcom_google_gwt_core_client_JavaScriptObject_2_classLit;
}
function hashCode__I__devirtual$(this$static) {
  if (isJavaString(this$static)) {
    $clinit_String$HashCache();
    var key = ":" + this$static, result = front[key];
    if (null != result) {
      this$static = result;
    } else {
      result = back_0[key];
      if (null == result) {
        var hashCode, n, nBatch;
        hashCode = 0;
        n = this$static.length;
        nBatch = n - 4;
        for (result = 0;result < nBatch;) {
          hashCode = this$static.charCodeAt(result + 3) + 31 * (this$static.charCodeAt(result + 2) + 31 * (this$static.charCodeAt(result + 1) + 31 * (this$static.charCodeAt(result) + 31 * hashCode))), hashCode = ~~hashCode, result += 4;
        }
        for (;result < n;) {
          hashCode *= 31, nBatch = result++, nBatch = this$static.charCodeAt(nBatch), hashCode += nBatch;
        }
        result = ~~hashCode;
      }
      256 == count_0 && (back_0 = front, front = {}, count_0 = 0);
      ++count_0;
      this$static = front[key] = result;
    }
  } else {
    this$static = hasJavaObjectVirtualDispatch(this$static) ? this$static.hashCode$() : (isJavaArray(this$static), this$static.$H || (this$static.$H = ++sNextHashId));
  }
  return this$static;
}
defineClass(1, null, {}, Object_0);
_.equals$ = function(other) {
  return this === other;
};
_.getClass$ = function() {
  return this.___clazz$;
};
_.hashCode$ = function() {
  return this.$H || (this.$H = ++sNextHashId);
};
_.toString$ = function() {
  var JSCompiler_temp_const = $getName(getClass__Ljava_lang_Class___devirtual$(this)) + "@", JSCompiler_inline_result;
  JSCompiler_inline_result = (hashCode__I__devirtual$(this) >>> 0).toString(16);
  return JSCompiler_temp_const + JSCompiler_inline_result;
};
_.toString = function() {
  return this.toString$();
};
stringCastMap = {3:1, 221:1, 11:1, 2:1};
!Array.isArray && (Array.isArray = function(vArg) {
  return "[object Array]" === Object.prototype.toString.call(vArg);
});
function toStringSimple(obj) {
  return obj.toString ? obj.toString() : "[JavaScriptObject]";
}
function hasJavaObjectVirtualDispatch(src_0) {
  return!Array.isArray(src_0) && src_0.typeMarker$ === typeMarkerFn;
}
function instanceOf(src_0, dstId) {
  return null != src_0 && (isJavaString(src_0) && !!stringCastMap[dstId] || src_0.castableTypeMap$ && !!src_0.castableTypeMap$[dstId]);
}
function isJavaArray(src_0) {
  return Array.isArray(src_0) && src_0.typeMarker$ === typeMarkerFn;
}
function isJavaString(src_0) {
  return "string" === typeof src_0;
}
function maskUndefined(src_0) {
  return null == src_0 ? null : src_0;
}
function round_int(x_0) {
  return~~Math.max(Math.min(x_0, $intern_0), -2147483648);
}
var stringCastMap;
function $ensureNamesAreInitialized(this$static) {
  if (null == this$static.typeName) {
    if (this$static.isArray_0()) {
      var componentType = this$static.componentType;
      componentType.isPrimitive() ? this$static.typeName = "[" + componentType.typeId : componentType.isArray_0() ? this$static.typeName = "[" + componentType.getName() : this$static.typeName = "[L" + componentType.getName() + ";";
      this$static.canonicalName = componentType.getCanonicalName() + "[]";
      this$static.simpleName = componentType.getSimpleName() + "[]";
    } else {
      var componentType = this$static.packageName, compoundName = this$static.compoundName, compoundName = compoundName.split("/");
      this$static.typeName = join_0(".", [componentType, join_0("$", compoundName)]);
      this$static.canonicalName = join_0(".", [componentType, join_0(".", compoundName)]);
      this$static.simpleName = compoundName[compoundName.length - 1];
    }
  }
}
function $getName(this$static) {
  $ensureNamesAreInitialized(this$static);
  return this$static.typeName;
}
function $getSimpleName(this$static) {
  $ensureNamesAreInitialized(this$static);
  return this$static.simpleName;
}
function Class() {
  this.sequentialId = nextSequentialId++;
  this.arrayLiterals = this.typeId = this.canonicalName = this.compoundName = this.packageName = this.simpleName = this.typeName = null;
}
function createClassObject(typeId) {
  var clazz;
  clazz = new Class;
  clazz.typeName = "Class$" + (typeId ? "S" + typeId : "" + clazz.sequentialId);
  clazz.canonicalName = clazz.typeName;
  clazz.simpleName = clazz.typeName;
  return clazz;
}
function createForClass(typeId) {
  var clazz;
  clazz = createClassObject(typeId);
  maybeSetClassLiteral(typeId, clazz);
  return clazz;
}
function createForEnum(typeId, enumConstantsFunc) {
  var clazz;
  clazz = createClassObject(typeId);
  maybeSetClassLiteral(typeId, clazz);
  clazz.modifiers = enumConstantsFunc ? 8 : 0;
  clazz.enumConstantsFunc = enumConstantsFunc;
  return clazz;
}
function createForInterface() {
  var clazz;
  clazz = createClassObject(null);
  clazz.modifiers = 2;
  return clazz;
}
function getClassLiteralForArray_0(leafClass, dimensions) {
  var arrayLiterals = leafClass.arrayLiterals = leafClass.arrayLiterals || [];
  return arrayLiterals[dimensions] || (arrayLiterals[dimensions] = leafClass.createClassLiteralForArray(dimensions));
}
function join_0(separator, strings) {
  for (var i = 0;!strings[i] || "" == strings[i];) {
    i++;
  }
  for (var result = strings[i++];i < strings.length;i++) {
    strings[i] && "" != strings[i] && (result += separator + strings[i]);
  }
  return result;
}
function maybeSetClassLiteral(typeId, clazz) {
  if (typeId) {
    clazz.typeId = typeId;
    var prototype_0 = clazz.isPrimitive() ? null : prototypesByTypeId_0[clazz.typeId];
    prototype_0 ? prototype_0.___clazz$ = clazz : prototypesByTypeId_0[typeId] = [clazz];
  }
}
defineClass(77, 1, {}, Class);
_.createClassLiteralForArray = function(dimensions) {
  var clazz;
  clazz = new Class;
  clazz.modifiers = 4;
  1 < dimensions ? clazz.componentType = getClassLiteralForArray_0(this, dimensions - 1) : clazz.componentType = this;
  return clazz;
};
_.getCanonicalName = function() {
  $ensureNamesAreInitialized(this);
  return this.canonicalName;
};
_.getName = function() {
  return $getName(this);
};
_.getSimpleName = function() {
  return $getSimpleName(this);
};
_.isArray_0 = function() {
  return 0 != (this.modifiers & 4);
};
_.isPrimitive = function() {
  return 0 != (this.modifiers & 1);
};
_.toString$ = function() {
  return(0 != (this.modifiers & 2) ? "interface " : 0 != (this.modifiers & 1) ? "" : "class ") + ($ensureNamesAreInitialized(this), this.typeName);
};
_.modifiers = 0;
_.sequentialId = 0;
var nextSequentialId = 1, Ljava_lang_Object_2_classLit = createForClass(1), Lcom_google_gwt_core_client_JavaScriptObject_2_classLit = createForClass(0);
createForClass(77);
defineClass(12, 1, $intern_1);
_.getMessage = function() {
  return this.detailMessage;
};
_.toString$ = function() {
  var className, msg;
  className = $getName(this.___clazz$);
  msg = this.getMessage();
  return null != msg ? className + ": " + msg : className;
};
createForClass(12);
function Exception(message) {
  this.detailMessage = message;
  captureStackTrace(this, this.detailMessage);
}
defineClass(15, 12, $intern_2, Exception);
createForClass(15);
defineClass(20, 15, $intern_2);
createForClass(20);
defineClass(102, 20, $intern_2);
createForClass(102);
function $clinit_JavaScriptException() {
  $clinit_JavaScriptException = emptyMethod;
  NOT_SET = new Object_0;
}
function JavaScriptException(e) {
  $clinit_JavaScriptException();
  this.detailMessage = null;
  this.description = "";
  this.e = e;
  this.description = "";
}
defineClass(39, 102, {39:1, 3:1, 15:1, 12:1}, JavaScriptException);
_.getMessage = function() {
  var exception;
  null == this.message_0 && (exception = maskUndefined(this.e) === maskUndefined(NOT_SET) ? null : this.e, this.name_0 = null == exception ? "null" : null == exception || isJavaString(exception) || exception.typeMarker$ === typeMarkerFn ? isJavaString(exception) ? "String" : $getName(getClass__Ljava_lang_Class___devirtual$(exception)) : null == exception ? null : exception.name, this.description = this.description + ": " + (null == exception || isJavaString(exception) || exception.typeMarker$ === 
  typeMarkerFn ? exception + "" : null == exception ? null : exception.message), this.message_0 = "(" + this.name_0 + ") " + this.description);
  return this.message_0;
};
_.getThrown = function() {
  return maskUndefined(this.e) === maskUndefined(NOT_SET) ? null : this.e;
};
var NOT_SET;
createForClass(39);
defineClass(197, 1, {});
createForClass(197);
function reportToBrowser(e) {
  $wnd.setTimeout(function() {
    throw e;
  }, 0);
}
function watchdogEntryDepthRun() {
  0 != entryDepth && (entryDepth = 0);
  watchdogEntryDepthTimerId = -1;
}
var entryDepth = 0, sNextHashId = 0, watchdogEntryDepthLastScheduled = 0, watchdogEntryDepthTimerId = -1;
function $clinit_SchedulerImpl() {
  $clinit_SchedulerImpl = emptyMethod;
  INSTANCE = new SchedulerImpl;
}
function SchedulerImpl() {
}
function runScheduledTasks(tasks, rescheduled) {
  var e, i, j;
  i = 0;
  for (j = tasks.length;i < j;i++) {
    e = tasks[i];
    try {
      if (e[1]) {
        if (e[0].nullMethod()) {
          var queue = rescheduled;
          !queue && (queue = []);
          queue[queue.length] = e;
          rescheduled = queue;
        }
      } else {
        e[0].nullMethod();
      }
    } catch ($e0) {
      if ($e0 = wrap($e0), instanceOf($e0, 12)) {
        e = $e0, reportToBrowser(instanceOf(e, 39) ? e.getThrown() : e);
      } else {
        throw unwrap($e0);
      }
    }
  }
  return rescheduled;
}
defineClass(146, 197, {}, SchedulerImpl);
var INSTANCE;
createForClass(146);
function $clinit_StackTraceCreator() {
  $clinit_StackTraceCreator = emptyMethod;
  var c, enforceLegacy;
  enforceLegacy = !(Error.stackTraceLimit || "stack" in Error());
  c = new StackTraceCreator$CollectorModernNoSourceMap;
  collector = enforceLegacy ? new StackTraceCreator$CollectorLegacy : c;
}
function captureStackTrace(throwable, reference) {
  $clinit_StackTraceCreator();
  collector.collect(throwable, reference);
}
var collector;
defineClass(209, 1, {});
createForClass(209);
function StackTraceCreator$CollectorLegacy() {
}
defineClass(112, 209, {}, StackTraceCreator$CollectorLegacy);
_.collect = function(t, thrownIgnored) {
  var seen = {};
  t.fnStack = [];
  for (var callee = arguments.callee.caller;callee;) {
    $clinit_StackTraceCreator();
    var JSCompiler_temp;
    if (!(JSCompiler_temp = callee.name)) {
      JSCompiler_temp = callee;
      var match_0 = /function(?:\s+([\w$]+))?\s*\(/.exec(callee.toString());
      JSCompiler_temp = JSCompiler_temp.name = match_0 && match_0[1] || "anonymous";
    }
    t.fnStack.push(JSCompiler_temp);
    JSCompiler_temp = ":" + JSCompiler_temp;
    if (match_0 = seen[JSCompiler_temp]) {
      var i, j;
      i = 0;
      for (j = match_0.length;i < j;i++) {
        if (match_0[i] === callee) {
          return;
        }
      }
    }
    (match_0 || (seen[JSCompiler_temp] = [])).push(callee);
    callee = callee.caller;
  }
};
createForClass(112);
function $clinit_StackTraceCreator$CollectorModern() {
  $clinit_StackTraceCreator$CollectorModern = emptyMethod;
  Error.stackTraceLimit = 64;
}
defineClass(210, 209, {});
_.collect = function(t, jsThrown) {
  function fixIE(e) {
    if (!("stack" in e)) {
      try {
        throw e;
      } catch (ignored) {
      }
    }
    return e;
  }
  var backingJsError;
  "string" == typeof jsThrown ? backingJsError = fixIE(Error(jsThrown)) : jsThrown instanceof Object && "stack" in jsThrown ? backingJsError = jsThrown : backingJsError = fixIE(Error());
  t.__gwt$backingJsError = backingJsError;
};
createForClass(210);
function StackTraceCreator$CollectorModernNoSourceMap() {
  $clinit_StackTraceCreator$CollectorModern();
}
defineClass(113, 210, {}, StackTraceCreator$CollectorModernNoSourceMap);
createForClass(113);
function checkArrayType(expression, errorMessage) {
  if (!expression) {
    throw new ArrayStoreException("" + errorMessage);
  }
}
function checkCriticalElement(expression) {
  if (!expression) {
    throw new NoSuchElementException;
  }
}
function checkElementIndex(index_0, size_0) {
  if (0 > index_0 || index_0 >= size_0) {
    throw new IndexOutOfBoundsException_0("Index: " + index_0 + ", Size: " + size_0);
  }
}
function checkNotNull(reference) {
  if (null == reference) {
    throw new NullPointerException;
  }
}
function checkPositionIndex(index_0, size_0) {
  if (0 > index_0 || index_0 > size_0) {
    throw new IndexOutOfBoundsException_0("Index: " + index_0 + ", Size: " + size_0);
  }
}
function format(template, args) {
  var builder, i, placeholderStart, templateStart;
  template = "" + template;
  builder = new StringBuilder_0;
  for (i = templateStart = 0;i < args.length;) {
    placeholderStart = template.indexOf("%s", templateStart);
    if (-1 == placeholderStart) {
      break;
    }
    templateStart = template.substr(templateStart, placeholderStart - templateStart);
    builder.string += templateStart;
    templateStart = args[i++];
    builder.string += templateStart;
    templateStart = placeholderStart + 2;
  }
  placeholderStart = template.substr(templateStart, template.length - templateStart);
  builder.string += placeholderStart;
  if (i < args.length) {
    builder.string += " [";
    placeholderStart = args[i++];
    for (builder.string += placeholderStart;i < args.length;) {
      builder.string += ", ", placeholderStart = args[i++], builder.string += placeholderStart;
    }
    builder.string += "]";
  }
  return builder.string;
}
function $getPropertyString(this$static, name_0) {
  return null == this$static[name_0] ? null : String(this$static[name_0]);
}
function $getAttribute(elem, name_0) {
  return elem.getAttribute(name_0) || "";
}
function $getParentElement(node) {
  (node = node.parentNode) && 1 == node.nodeType || (node = null);
  return node;
}
function Enum(name_0, ordinal) {
  this.name_0 = name_0;
  this.ordinal = ordinal;
}
defineClass(9, 1, {3:1, 11:1, 9:1});
_.compareTo = function(other) {
  return this.ordinal - other.ordinal;
};
_.equals$ = function(other) {
  return this === other;
};
_.hashCode$ = function() {
  return this.$H || (this.$H = ++sNextHashId);
};
_.toString$ = function() {
  return null != this.name_0 ? this.name_0 : "" + this.ordinal;
};
_.ordinal = 0;
createForClass(9);
function $clinit_Style$Cursor() {
  $clinit_Style$Cursor = emptyMethod;
  DEFAULT = new Style$Cursor$1;
  AUTO = new Style$Cursor$2;
  CROSSHAIR = new Style$Cursor$3;
  POINTER = new Style$Cursor$4;
  MOVE = new Style$Cursor$5;
  E_RESIZE = new Style$Cursor$6;
  NE_RESIZE = new Style$Cursor$7;
  NW_RESIZE = new Style$Cursor$8;
  N_RESIZE = new Style$Cursor$9;
  SE_RESIZE = new Style$Cursor$10;
  SW_RESIZE = new Style$Cursor$11;
  S_RESIZE = new Style$Cursor$12;
  W_RESIZE = new Style$Cursor$13;
  TEXT = new Style$Cursor$14;
  WAIT = new Style$Cursor$15;
  HELP = new Style$Cursor$16;
  COL_RESIZE = new Style$Cursor$17;
  ROW_RESIZE = new Style$Cursor$18;
}
function values_0() {
  $clinit_Style$Cursor();
  return initValues(getClassLiteralForArray_0(Lcom_google_gwt_dom_client_Style$Cursor_2_classLit, 1), $intern_4, 10, 0, [DEFAULT, AUTO, CROSSHAIR, POINTER, MOVE, E_RESIZE, NE_RESIZE, NW_RESIZE, N_RESIZE, SE_RESIZE, SW_RESIZE, S_RESIZE, W_RESIZE, TEXT, WAIT, HELP, COL_RESIZE, ROW_RESIZE]);
}
defineClass(10, 9, $intern_5);
var AUTO, COL_RESIZE, CROSSHAIR, DEFAULT, E_RESIZE, HELP, MOVE, NE_RESIZE, NW_RESIZE, N_RESIZE, POINTER, ROW_RESIZE, SE_RESIZE, SW_RESIZE, S_RESIZE, TEXT, WAIT, W_RESIZE, Lcom_google_gwt_dom_client_Style$Cursor_2_classLit = createForEnum(10, values_0);
function Style$Cursor$1() {
  Enum.call(this, "DEFAULT", 0);
}
defineClass(161, 10, $intern_5, Style$Cursor$1);
createForEnum(161, null);
function Style$Cursor$10() {
  Enum.call(this, "SE_RESIZE", 9);
}
defineClass(170, 10, $intern_5, Style$Cursor$10);
createForEnum(170, null);
function Style$Cursor$11() {
  Enum.call(this, "SW_RESIZE", 10);
}
defineClass(171, 10, $intern_5, Style$Cursor$11);
createForEnum(171, null);
function Style$Cursor$12() {
  Enum.call(this, "S_RESIZE", 11);
}
defineClass(172, 10, $intern_5, Style$Cursor$12);
createForEnum(172, null);
function Style$Cursor$13() {
  Enum.call(this, "W_RESIZE", 12);
}
defineClass(173, 10, $intern_5, Style$Cursor$13);
createForEnum(173, null);
function Style$Cursor$14() {
  Enum.call(this, "TEXT", 13);
}
defineClass(174, 10, $intern_5, Style$Cursor$14);
createForEnum(174, null);
function Style$Cursor$15() {
  Enum.call(this, "WAIT", 14);
}
defineClass(175, 10, $intern_5, Style$Cursor$15);
createForEnum(175, null);
function Style$Cursor$16() {
  Enum.call(this, "HELP", 15);
}
defineClass(176, 10, $intern_5, Style$Cursor$16);
createForEnum(176, null);
function Style$Cursor$17() {
  Enum.call(this, "COL_RESIZE", 16);
}
defineClass(177, 10, $intern_5, Style$Cursor$17);
createForEnum(177, null);
function Style$Cursor$18() {
  Enum.call(this, "ROW_RESIZE", 17);
}
defineClass(178, 10, $intern_5, Style$Cursor$18);
createForEnum(178, null);
function Style$Cursor$2() {
  Enum.call(this, "AUTO", 1);
}
defineClass(162, 10, $intern_5, Style$Cursor$2);
createForEnum(162, null);
function Style$Cursor$3() {
  Enum.call(this, "CROSSHAIR", 2);
}
defineClass(163, 10, $intern_5, Style$Cursor$3);
createForEnum(163, null);
function Style$Cursor$4() {
  Enum.call(this, "POINTER", 3);
}
defineClass(164, 10, $intern_5, Style$Cursor$4);
createForEnum(164, null);
function Style$Cursor$5() {
  Enum.call(this, "MOVE", 4);
}
defineClass(165, 10, $intern_5, Style$Cursor$5);
createForEnum(165, null);
function Style$Cursor$6() {
  Enum.call(this, "E_RESIZE", 5);
}
defineClass(166, 10, $intern_5, Style$Cursor$6);
createForEnum(166, null);
function Style$Cursor$7() {
  Enum.call(this, "NE_RESIZE", 6);
}
defineClass(167, 10, $intern_5, Style$Cursor$7);
createForEnum(167, null);
function Style$Cursor$8() {
  Enum.call(this, "NW_RESIZE", 7);
}
defineClass(168, 10, $intern_5, Style$Cursor$8);
createForEnum(168, null);
function Style$Cursor$9() {
  Enum.call(this, "N_RESIZE", 8);
}
defineClass(169, 10, $intern_5, Style$Cursor$9);
createForEnum(169, null);
function $clinit_Style$Cursor$Map() {
  $clinit_Style$Cursor$Map = emptyMethod;
  var enumConstants = values_0(), result, value_0, value$index, value$max;
  result = {};
  value$index = 0;
  for (value$max = enumConstants.length;value$index < value$max;++value$index) {
    value_0 = enumConstants[value$index], result[":" + (null != value_0.name_0 ? value_0.name_0 : "" + value_0.ordinal)] = value_0;
  }
  $MAP = result;
}
var $MAP;
function cloneSubrange(array, toIndex) {
  var result;
  result = array.slice(0, toIndex);
  initValues(getClass__Ljava_lang_Class___devirtual$(array), array.castableTypeMap$, array.__elementTypeId$, array.__elementTypeCategory$, result);
  return result;
}
function createFrom(array, length_0) {
  var result;
  result = initializeArrayElementsWithDefaults(0, length_0);
  initValues(getClass__Ljava_lang_Class___devirtual$(array), array.castableTypeMap$, array.__elementTypeId$, array.__elementTypeCategory$, result);
  return result;
}
function initDim(leafClassLiteral, castableTypeMap, elementTypeId, length_0, elementTypeCategory) {
  length_0 = initializeArrayElementsWithDefaults(elementTypeCategory, length_0);
  initValues(getClassLiteralForArray_0(leafClassLiteral, 1), castableTypeMap, elementTypeId, elementTypeCategory, length_0);
  return length_0;
}
function initDims(dimExprs) {
  return initDims_0(Ljava_lang_String_2_classLit, [$intern_12, $intern_7], [13, 2], 4, dimExprs, 0, 2);
}
function initDims_0(leafClassLiteral, castableTypeMapExprs, elementTypeIds, leafElementTypeCategory, dimExprs, index_0, count) {
  var elementTypeCategory, isLastDim, length_0, result;
  length_0 = dimExprs[index_0];
  elementTypeCategory = (isLastDim = index_0 == count - 1) ? leafElementTypeCategory : 0;
  result = initializeArrayElementsWithDefaults(elementTypeCategory, length_0);
  initValues(getClassLiteralForArray_0(leafClassLiteral, count - index_0), castableTypeMapExprs[index_0], elementTypeIds[index_0], elementTypeCategory, result);
  if (!isLastDim) {
    for (++index_0, elementTypeCategory = 0;elementTypeCategory < length_0;++elementTypeCategory) {
      result[elementTypeCategory] = initDims_0(leafClassLiteral, castableTypeMapExprs, elementTypeIds, leafElementTypeCategory, dimExprs, index_0, count);
    }
  }
  return result;
}
function initValues(arrayClass, castableTypeMap, elementTypeId, elementTypeCategory, array) {
  array.___clazz$ = arrayClass;
  array.castableTypeMap$ = castableTypeMap;
  array.typeMarker$ = typeMarkerFn;
  array.__elementTypeId$ = elementTypeId;
  array.__elementTypeCategory$ = elementTypeCategory;
  return array;
}
function initializeArrayElementsWithDefaults(elementTypeCategory, length_0) {
  var array = Array(length_0), initValue;
  switch(elementTypeCategory) {
    case 6:
      initValue = {l:0, m:0, h:0};
      break;
    case 7:
      initValue = 0;
      break;
    case 8:
      initValue = !1;
      break;
    default:
      return array;
  }
  for (var i = 0;i < length_0;++i) {
    array[i] = initValue;
  }
  return array;
}
function nativeArraySplice(src_0, srcOfs, dest, destOfs, len, overwrite) {
  src_0 === dest && (src_0 = src_0.slice(srcOfs, srcOfs + len), srcOfs = 0);
  var batchStart = srcOfs;
  for (srcOfs += len;batchStart < srcOfs;) {
    var batchEnd = Math.min(batchStart + 1E4, srcOfs);
    len = batchEnd - batchStart;
    Array.prototype.splice.apply(dest, [destOfs, overwrite ? len : 0].concat(src_0.slice(batchStart, batchEnd)));
    batchStart = batchEnd;
    destOfs += len;
  }
}
function unwrap(e) {
  return instanceOf(e, 39) && maskUndefined(e.e) !== maskUndefined(($clinit_JavaScriptException(), NOT_SET)) ? maskUndefined(e.e) === maskUndefined(NOT_SET) ? null : e.e : e;
}
function wrap(e) {
  var jse;
  if (instanceOf(e, 12)) {
    return e;
  }
  jse = e && e.__gwt$exception;
  if (!jse && (jse = new JavaScriptException(e), captureStackTrace(jse, e), e && "object" == typeof e)) {
    try {
      e.__gwt$exception = jse;
    } catch (ignored) {
    }
  }
  return jse;
}
function assertCompileTimeUserAgent() {
  var runtimeValue;
  runtimeValue = navigator.userAgent.toLowerCase();
  var docMode = $doc.documentMode;
  runtimeValue = -1 != runtimeValue.indexOf("webkit") ? "safari" : -1 != runtimeValue.indexOf("msie") && 10 <= docMode && 11 > docMode ? "ie10" : -1 != runtimeValue.indexOf("msie") && 9 <= docMode && 11 > docMode ? "ie9" : -1 != runtimeValue.indexOf("msie") && 8 <= docMode && 11 > docMode ? "ie8" : -1 != runtimeValue.indexOf("gecko") || 11 <= docMode ? "gecko1_8" : "unknown";
  if ("safari" !== runtimeValue) {
    throw new UserAgentAsserter$UserAgentAssertionError(runtimeValue);
  }
}
defineClass(59, 12, $intern_1);
createForClass(59);
defineClass(22, 59, $intern_1);
createForClass(22);
function UserAgentAsserter$UserAgentAssertionError(runtimeValue) {
  this.detailMessage = "" + ("Possible problem with your *.gwt.xml module file.\nThe compile time user.agent value (safari) does not match the runtime user.agent value (" + runtimeValue + ").\nExpect more errors.");
  captureStackTrace(this, this.detailMessage);
}
defineClass(101, 22, $intern_1, UserAgentAsserter$UserAgentAssertionError);
createForClass(101);
defineClass(60, 1, {});
_.toString$ = function() {
  return this.string;
};
createForClass(60);
function IndexOutOfBoundsException() {
  captureStackTrace(this, this.detailMessage);
}
function IndexOutOfBoundsException_0(message) {
  Exception.call(this, message);
}
defineClass(31, 20, $intern_2, IndexOutOfBoundsException, IndexOutOfBoundsException_0);
createForClass(31);
function ArrayIndexOutOfBoundsException() {
  captureStackTrace(this, this.detailMessage);
}
defineClass(181, 31, $intern_2, ArrayIndexOutOfBoundsException);
createForClass(181);
function ArrayStoreException(message) {
  Exception.call(this, message);
}
defineClass(36, 20, $intern_2, ArrayStoreException);
createForClass(36);
function $clinit_Boolean() {
  $clinit_Boolean = emptyMethod;
  FALSE = new Boolean_0(!1);
  TRUE = new Boolean_0(!0);
}
function Boolean_0(value_0) {
  this.value_0 = value_0;
}
defineClass(47, 1, {3:1, 47:1, 11:1}, Boolean_0);
_.compareTo = function(b) {
  var x_0 = this.value_0;
  return x_0 == b.value_0 ? 0 : x_0 ? 1 : -1;
};
_.equals$ = function(o) {
  return instanceOf(o, 47) && o.value_0 == this.value_0;
};
_.hashCode$ = function() {
  return this.value_0 ? 1231 : 1237;
};
_.toString$ = function() {
  return "" + this.value_0;
};
_.value_0 = !1;
var FALSE, TRUE;
createForClass(47);
function Character(value_0) {
  this.value_0 = value_0;
}
defineClass(37, 1, {3:1, 37:1, 11:1}, Character);
_.compareTo = function(c) {
  return this.value_0 - c.value_0;
};
_.equals$ = function(o) {
  return instanceOf(o, 37) && o.value_0 == this.value_0;
};
_.hashCode$ = function() {
  return this.value_0;
};
_.toString$ = function() {
  return String.fromCharCode(this.value_0);
};
_.value_0 = 0;
var Ljava_lang_Character_2_classLit = createForClass(37);
function $clinit_Character$BoxedValues() {
  $clinit_Character$BoxedValues = emptyMethod;
  boxedValues_0 = initDim(Ljava_lang_Character_2_classLit, $intern_4, 37, 128, 0);
}
var boxedValues_0;
defineClass(76, 1, {3:1, 76:1});
createForClass(76);
function IllegalArgumentException(message) {
  Exception.call(this, message);
}
defineClass(23, 20, {3:1, 15:1, 23:1, 12:1}, IllegalArgumentException);
createForClass(23);
function IllegalStateException() {
  captureStackTrace(this, this.detailMessage);
}
defineClass(182, 20, $intern_2, IllegalStateException);
createForClass(182);
function Integer(value_0) {
  this.value_0 = value_0;
}
function valueOf_2(i) {
  var rebase, result;
  return-129 < i && 128 > i ? (rebase = i + 128, result = ($clinit_Integer$BoxedValues(), boxedValues_1)[rebase], !result && (result = boxedValues_1[rebase] = new Integer(i)), result) : new Integer(i);
}
defineClass(38, 76, {3:1, 11:1, 38:1, 76:1}, Integer);
_.compareTo = function(b) {
  var x_0 = this.value_0;
  b = b.value_0;
  return x_0 < b ? -1 : x_0 > b ? 1 : 0;
};
_.equals$ = function(o) {
  return instanceOf(o, 38) && o.value_0 == this.value_0;
};
_.hashCode$ = function() {
  return this.value_0;
};
_.toString$ = function() {
  return "" + this.value_0;
};
_.value_0 = 0;
var Ljava_lang_Integer_2_classLit = createForClass(38);
function $clinit_Integer$BoxedValues() {
  $clinit_Integer$BoxedValues = emptyMethod;
  boxedValues_1 = initDim(Ljava_lang_Integer_2_classLit, $intern_4, 38, 256, 0);
}
var boxedValues_1;
function min_0(x_0, y_0) {
  return x_0 < y_0 ? x_0 : y_0;
}
function NullPointerException() {
  captureStackTrace(this, this.detailMessage);
}
function NullPointerException_0(message) {
  Exception.call(this, message);
}
defineClass(53, 20, $intern_2, NullPointerException, NullPointerException_0);
createForClass(53);
function $endsWith(this$static, suffix) {
  var suffixlength;
  suffixlength = suffix.length;
  return this$static.substr(this$static.length - suffixlength, suffixlength) === suffix;
}
function $equalsIgnoreCase(this$static, other) {
  return null == other ? !1 : this$static == other ? !0 : this$static.length == other.length && this$static.toLowerCase() == other.toLowerCase();
}
function $isEmpty(this$static) {
  return!this$static.length;
}
function $lastIndexOf(this$static, codePoint, startIndex) {
  var loSurrogate;
  65536 <= codePoint ? (loSurrogate = 56320 + (codePoint - 65536 & 1023) & 65535, codePoint = String.fromCharCode(55296 + (codePoint - 65536 >> 10 & 1023) & 65535) + String.fromCharCode(loSurrogate)) : codePoint = String.fromCharCode(codePoint & 65535);
  return this$static.lastIndexOf(codePoint, startIndex);
}
function $regionMatches(this$static, toffset, other, ooffset, len) {
  if (null == other) {
    throw new NullPointerException;
  }
  if (0 > toffset || 0 > ooffset || 0 >= len || toffset + len > this$static.length || ooffset + len > other.length) {
    return!1;
  }
  this$static = this$static.substr(toffset, len);
  other = other.substr(ooffset, len);
  return this$static === other;
}
function $replace_0(this$static) {
  var hex = (160).toString(16), hex = "\\u" + "0000".substring(hex.length) + hex;
  return this$static.replace(RegExp(hex, "g"), String.fromCharCode(32));
}
function $replaceAll(this$static, regex) {
  var replace;
  replace = __translateReplaceString("");
  return this$static.replace(RegExp(regex, "g"), replace);
}
function $replaceFirst(this$static, regex) {
  var replace;
  replace = __translateReplaceString("");
  return this$static.replace(RegExp(regex), replace);
}
function $split(this$static, regex) {
  for (var compiled = RegExp(regex, "g"), out = [], count = 0, trail = this$static, lastTrail = null;;) {
    var matchObj = compiled.exec(trail);
    if (null == matchObj || "" == trail) {
      out[count] = trail;
      break;
    } else {
      out[count] = trail.substring(0, matchObj.index), trail = trail.substring(matchObj.index + matchObj[0].length, trail.length), compiled.lastIndex = 0, lastTrail == trail && (out[count] = trail.substring(0, 1), trail = trail.substring(1)), lastTrail = trail, count++;
    }
  }
  if (0 < this$static.length) {
    for (compiled = out.length;0 < compiled && "" == out[compiled - 1];) {
      --compiled;
    }
    compiled < out.length && out.splice(compiled, out.length - compiled);
  }
  compiled = initDim(Ljava_lang_String_2_classLit, $intern_7, 2, out.length, 4);
  for (count = 0;count < out.length;++count) {
    compiled[count] = out[count];
  }
  return compiled;
}
function $startsWith(this$static, prefix) {
  return this$static.substr(0, prefix.length) === prefix;
}
function $substring(this$static, beginIndex) {
  return this$static.substr(beginIndex, this$static.length - beginIndex);
}
function $substring_0(this$static, beginIndex, endIndex) {
  return this$static.substr(beginIndex, endIndex - beginIndex);
}
function $trim(this$static) {
  return 0 == this$static.length || " " < this$static[0] && " " < this$static[this$static.length - 1] ? this$static : this$static.replace(/^[\u0000-\u0020]*|[\u0000-\u0020]*$/g, "");
}
function __translateReplaceString(replaceStr) {
  var pos;
  for (pos = 0;0 <= (pos = replaceStr.indexOf("\\", pos));) {
    36 == replaceStr.charCodeAt(pos + 1) ? replaceStr = replaceStr.substr(0, pos) + "$" + $substring(replaceStr, ++pos) : replaceStr = replaceStr.substr(0, pos) + $substring(replaceStr, ++pos);
  }
  return replaceStr;
}
var Ljava_lang_String_2_classLit = createForClass(2);
function $clinit_String$HashCache() {
  $clinit_String$HashCache = emptyMethod;
  back_0 = {};
  front = {};
}
var back_0, count_0 = 0, front;
function StringBuilder() {
  this.string = "";
}
function StringBuilder_0() {
  this.string = "";
}
function StringBuilder_1(s) {
  this.string = s;
}
defineClass(40, 60, {221:1}, StringBuilder, StringBuilder_0, StringBuilder_1);
createForClass(40);
function UnsupportedOperationException(message) {
  Exception.call(this, message);
}
defineClass(54, 20, $intern_2, UnsupportedOperationException);
createForClass(54);
function $addAll(this$static, c) {
  var changed, e, e$iterator;
  checkNotNull(c);
  changed = !1;
  for (e$iterator = c.iterator();e$iterator.hasNext();) {
    e = e$iterator.next_0(), changed |= this$static.add_0(e);
  }
  return changed;
}
function $toString(this$static) {
  var comma, e, e$iterator, sb;
  sb = new StringBuilder_1("[");
  comma = !1;
  for (e$iterator = this$static.iterator();e$iterator.hasNext();) {
    e = e$iterator.next_0(), comma ? sb.string += ", " : comma = !0, sb.string += e === this$static ? "(this Collection)" : "" + e;
  }
  sb.string += "]";
  return sb.string;
}
defineClass(212, 1, {});
_.add_0 = function() {
  throw new UnsupportedOperationException("Add not supported on this collection");
};
_.addAll = function(c) {
  return $addAll(this, c);
};
_.contains_0 = function(o) {
  a: {
    var e, iter;
    for (iter = this.iterator();iter.hasNext();) {
      if (e = iter.next_0(), maskUndefined(o) === maskUndefined(e) || null != o && equals_Ljava_lang_Object__Z__devirtual$(o, e)) {
        o = !0;
        break a;
      }
    }
    o = !1;
  }
  return o;
};
_.isEmpty = function() {
  return 0 == this.size_1();
};
_.toArray = function() {
  return this.toArray_0(initDim(Ljava_lang_Object_2_classLit, $intern_3, 1, this.size_1(), 3));
};
_.toArray_0 = function(a) {
  var i, it, size_0;
  size_0 = this.size_1();
  a.length < size_0 && (a = createFrom(a, size_0));
  it = this.iterator();
  for (i = 0;i < size_0;++i) {
    a[i] = it.next_0();
  }
  a.length > size_0 && (a[size_0] = null);
  return a;
};
_.toString$ = function() {
  return $toString(this);
};
createForClass(212);
function $containsEntry(this$static, entry) {
  var key, ourValue, value_0;
  key = entry.getKey();
  value_0 = entry.getValue();
  ourValue = this$static.get_0(key);
  return!(maskUndefined(value_0) === maskUndefined(ourValue) || null != value_0 && equals_Ljava_lang_Object__Z__devirtual$(value_0, ourValue)) || null == ourValue && !this$static.containsKey(key) ? !1 : !0;
}
function $implFindEntry(this$static, key) {
  var entry, iter, k;
  for (iter = this$static.entrySet().iterator();iter.hasNext();) {
    if (entry = iter.next_0(), k = entry.getKey(), maskUndefined(key) === maskUndefined(k) || null != key && equals_Ljava_lang_Object__Z__devirtual$(key, k)) {
      return entry;
    }
  }
  return null;
}
function $toString_0(this$static, o) {
  return o === this$static ? "(this Map)" : "" + o;
}
function getEntryValueOrNull(entry) {
  return entry ? entry.getValue() : null;
}
defineClass(211, 1, $intern_8);
_.containsEntry = function(entry) {
  return $containsEntry(this, entry);
};
_.containsKey = function(key) {
  return!!$implFindEntry(this, key);
};
_.equals$ = function(obj) {
  var entry$iterator;
  if (obj === this) {
    return!0;
  }
  if (!instanceOf(obj, 46) || this.size_1() != obj.size_1()) {
    return!1;
  }
  for (entry$iterator = obj.entrySet().iterator();entry$iterator.hasNext();) {
    if (obj = entry$iterator.next_0(), !this.containsEntry(obj)) {
      return!1;
    }
  }
  return!0;
};
_.get_0 = function(key) {
  return getEntryValueOrNull($implFindEntry(this, key));
};
_.hashCode$ = function() {
  return hashCode_10(this.entrySet());
};
_.size_1 = function() {
  return this.entrySet().size_1();
};
_.toString$ = function() {
  var comma, entry, entry$iterator, sb;
  sb = new StringBuilder_1("{");
  comma = !1;
  for (entry$iterator = this.entrySet().iterator();entry$iterator.hasNext();) {
    entry = entry$iterator.next_0();
    comma ? sb.string += ", " : comma = !0;
    var x_0 = $toString_0(this, entry.getKey());
    sb.string += x_0;
    sb.string += "\x3d";
    sb.string += $toString_0(this, entry.getValue());
  }
  sb.string += "}";
  return sb.string;
};
createForClass(211);
function $containsKey(this$static, key) {
  return isJavaString(key) ? $hasStringValue(this$static, key) : !!$getEntry(this$static.hashCodeMap, key);
}
function $get(this$static, key) {
  return isJavaString(key) ? $getStringValue(this$static, key) : getEntryValueOrNull($getEntry(this$static.hashCodeMap, key));
}
function $getStringValue(this$static, key) {
  return null == key ? getEntryValueOrNull($getEntry(this$static.hashCodeMap, null)) : this$static.stringMap.get_2(key);
}
function $hasStringValue(this$static, key) {
  return null == key ? !!$getEntry(this$static.hashCodeMap, null) : void 0 !== this$static.stringMap.get_2(key);
}
function $put(this$static, key, value_0) {
  return isJavaString(key) ? $putStringValue(this$static, key, value_0) : $put_1(this$static.hashCodeMap, key, value_0);
}
function $putStringValue(this$static, key, value_0) {
  return null == key ? $put_1(this$static.hashCodeMap, null, value_0) : this$static.stringMap.put(key, value_0);
}
function $reset(this$static) {
  $clinit_InternalJsMapFactory$BackwardCompatibleJsMapFactory();
  this$static.hashCodeMap = delegate.createJsHashCodeMap();
  this$static.hashCodeMap.host_0 = this$static;
  this$static.stringMap = delegate.createJsStringMap();
  this$static.stringMap.host_0 = this$static;
  this$static.size_0 = 0;
  structureChanged(this$static);
}
defineClass(63, 211, $intern_8);
_.containsKey = function(key) {
  return $containsKey(this, key);
};
_.entrySet = function() {
  return new AbstractHashMap$EntrySet(this);
};
_.get_0 = function(key) {
  return $get(this, key);
};
_.size_1 = function() {
  return this.size_0;
};
_.size_0 = 0;
createForClass(63);
defineClass(213, 212, $intern_9);
_.equals$ = function(o) {
  if (o === this) {
    o = !0;
  } else {
    if (instanceOf(o, 25) && o.size_1() == this.size_1()) {
      a: {
        var e$iterator;
        checkNotNull(o);
        for (e$iterator = o.iterator();e$iterator.hasNext();) {
          if (o = e$iterator.next_0(), !this.contains_0(o)) {
            o = !1;
            break a;
          }
        }
        o = !0;
      }
    } else {
      o = !1;
    }
  }
  return o;
};
_.hashCode$ = function() {
  return hashCode_10(this);
};
createForClass(213);
function AbstractHashMap$EntrySet(this$0) {
  this.this$01 = this$0;
}
defineClass(64, 213, $intern_9, AbstractHashMap$EntrySet);
_.contains_0 = function(o) {
  return instanceOf(o, 24) ? $containsEntry(this.this$01, o) : !1;
};
_.iterator = function() {
  return new AbstractHashMap$EntrySetIterator(this.this$01);
};
_.size_1 = function() {
  return this.this$01.size_0;
};
createForClass(64);
function $hasNext(this$static) {
  if (this$static.current.hasNext()) {
    return!0;
  }
  if (this$static.current != this$static.stringMapEntries) {
    return!1;
  }
  this$static.current = this$static.this$01.hashCodeMap.entries();
  return this$static.current.hasNext();
}
function $next(this$static) {
  if (this$static._gwt_modCount != this$static.this$01._gwt_modCount) {
    throw new ConcurrentModificationException;
  }
  return checkCriticalElement($hasNext(this$static)), this$static.current.next_0();
}
function AbstractHashMap$EntrySetIterator(this$0) {
  this.this$01 = this$0;
  this.current = this.stringMapEntries = this.this$01.stringMap.entries();
  this._gwt_modCount = this$0._gwt_modCount;
}
defineClass(65, 1, {}, AbstractHashMap$EntrySetIterator);
_.hasNext = function() {
  return $hasNext(this);
};
_.next_0 = function() {
  return $next(this);
};
createForClass(65);
defineClass(214, 212, {30:1});
_.add_1 = function() {
  throw new UnsupportedOperationException("Add not supported on this list");
};
_.add_0 = function(obj) {
  this.add_1(this.size_1(), obj);
  return!0;
};
_.equals$ = function(o) {
  var elem$iterator, elemOther, iterOther;
  if (o === this) {
    return!0;
  }
  if (!instanceOf(o, 30) || this.size_1() != o.size_1()) {
    return!1;
  }
  iterOther = o.iterator();
  for (elem$iterator = this.iterator();elem$iterator.hasNext();) {
    if (o = elem$iterator.next_0(), elemOther = iterOther.next_0(), !(maskUndefined(o) === maskUndefined(elemOther) || null != o && equals_Ljava_lang_Object__Z__devirtual$(o, elemOther))) {
      return!1;
    }
  }
  return!0;
};
_.hashCode$ = function() {
  var e, e$iterator, hashCode;
  hashCode = 1;
  for (e$iterator = this.iterator();e$iterator.hasNext();) {
    e = e$iterator.next_0(), hashCode = 31 * hashCode + (null != e ? hashCode__I__devirtual$(e) : 0), hashCode = ~~hashCode;
  }
  return hashCode;
};
_.iterator = function() {
  return new AbstractList$IteratorImpl(this);
};
_.remove = function() {
  throw new UnsupportedOperationException("Remove not supported on this list");
};
createForClass(214);
function $remove(this$static) {
  if (-1 == this$static.last) {
    throw new IllegalStateException;
  }
  this$static.this$01_0.remove(this$static.last);
  this$static.i = this$static.last;
  this$static.last = -1;
}
function AbstractList$IteratorImpl(this$0) {
  this.this$01_0 = this$0;
}
defineClass(7, 1, {}, AbstractList$IteratorImpl);
_.hasNext = function() {
  return this.i < this.this$01_0.size_1();
};
_.next_0 = function() {
  return checkCriticalElement(this.i < this.this$01_0.size_1()), this.this$01_0.get_1(this.last = this.i++);
};
_.remove_0 = function() {
  $remove(this);
};
_.i = 0;
_.last = -1;
createForClass(7);
function AbstractList$ListIteratorImpl(this$0, start_0) {
  this.this$01_0 = this.this$01 = this$0;
  checkPositionIndex(start_0, this$0.array.length);
  this.i = start_0;
}
defineClass(43, 7, {}, AbstractList$ListIteratorImpl);
createForClass(43);
function $get_0(this$static, index_0) {
  checkElementIndex(index_0, this$static.size_0);
  return $get_2(this$static.wrapped, this$static.fromIndex + index_0);
}
function AbstractList$SubList(wrapped, fromIndex, toIndex) {
  var size_0 = wrapped.array.length;
  if (0 > fromIndex) {
    throw new IndexOutOfBoundsException_0("fromIndex: " + fromIndex + " \x3c 0");
  }
  if (toIndex > size_0) {
    throw new IndexOutOfBoundsException_0("toIndex: " + toIndex + " \x3e size " + size_0);
  }
  if (fromIndex > toIndex) {
    throw new IllegalArgumentException("fromIndex: " + fromIndex + " \x3e toIndex: " + toIndex);
  }
  this.wrapped = wrapped;
  this.fromIndex = fromIndex;
  this.size_0 = toIndex - fromIndex;
}
defineClass(50, 214, {30:1}, AbstractList$SubList);
_.add_1 = function(index_0, element) {
  checkPositionIndex(index_0, this.size_0);
  $add(this.wrapped, this.fromIndex + index_0, element);
  ++this.size_0;
};
_.get_1 = function(index_0) {
  return $get_0(this, index_0);
};
_.remove = function(index_0) {
  checkElementIndex(index_0, this.size_0);
  index_0 = this.wrapped.remove(this.fromIndex + index_0);
  --this.size_0;
  return index_0;
};
_.size_1 = function() {
  return this.size_0;
};
_.fromIndex = 0;
_.size_0 = 0;
createForClass(50);
function $iterator(this$static) {
  this$static = new AbstractHashMap$EntrySetIterator((new AbstractHashMap$EntrySet(this$static.this$01)).this$01);
  return new AbstractMap$1$1(this$static);
}
function AbstractMap$1(this$0) {
  this.this$01 = this$0;
}
defineClass(66, 213, $intern_9, AbstractMap$1);
_.contains_0 = function(key) {
  return $containsKey(this.this$01, key);
};
_.iterator = function() {
  return $iterator(this);
};
_.size_1 = function() {
  return this.this$01.size_0;
};
createForClass(66);
function AbstractMap$1$1(val$outerIter) {
  this.val$outerIter2 = val$outerIter;
}
defineClass(114, 1, {}, AbstractMap$1$1);
_.hasNext = function() {
  return $hasNext(this.val$outerIter2);
};
_.next_0 = function() {
  return $next(this.val$outerIter2).getKey();
};
createForClass(114);
function $setValue(this$static, value_0) {
  var oldValue;
  oldValue = this$static.value_0;
  this$static.value_0 = value_0;
  return oldValue;
}
defineClass(48, 1, {48:1, 24:1});
_.equals$ = function(other) {
  return instanceOf(other, 24) ? equals_9(this.key, other.getKey()) && equals_9(this.value_0, other.getValue()) : !1;
};
_.getKey = function() {
  return this.key;
};
_.getValue = function() {
  return this.value_0;
};
_.hashCode$ = function() {
  return hashCode_12(this.key) ^ hashCode_12(this.value_0);
};
_.setValue = function(value_0) {
  return $setValue(this, value_0);
};
_.toString$ = function() {
  return this.key + "\x3d" + this.value_0;
};
createForClass(48);
function AbstractMap$SimpleEntry(key, value_0) {
  this.key = key;
  this.value_0 = value_0;
}
defineClass(49, 48, {48:1, 49:1, 24:1}, AbstractMap$SimpleEntry);
createForClass(49);
defineClass(217, 1, {24:1});
_.equals$ = function(other) {
  return instanceOf(other, 24) ? equals_9(this.getKey(), other.getKey()) && equals_9(this.getValue(), other.getValue()) : !1;
};
_.hashCode$ = function() {
  return hashCode_12(this.getKey()) ^ hashCode_12(this.getValue());
};
_.toString$ = function() {
  return this.getKey() + "\x3d" + this.getValue();
};
createForClass(217);
function $containsEntry_0(this$static, entry) {
  var key;
  key = entry.getKey();
  key = $getEntry_0(this$static, key);
  return!!key && equals_9(key.value_0, entry.getValue());
}
defineClass(219, 211, $intern_8);
_.containsEntry = function(entry) {
  return $containsEntry_0(this, entry);
};
_.containsKey = function(k) {
  return!!$getEntry_0(this, k);
};
_.entrySet = function() {
  return new AbstractNavigableMap$EntrySet(this);
};
_.get_0 = function(k) {
  return getEntryValueOrNull($getEntry_0(this, k));
};
createForClass(219);
function AbstractNavigableMap$EntrySet(this$0) {
  this.this$01 = this$0;
}
defineClass(98, 213, $intern_9, AbstractNavigableMap$EntrySet);
_.contains_0 = function(o) {
  return instanceOf(o, 24) && $containsEntry_0(this.this$01, o);
};
_.iterator = function() {
  return new TreeMap$EntryIterator(this.this$01);
};
_.size_1 = function() {
  return this.this$01.size_0;
};
createForClass(98);
function $iterator_0(this$static) {
  this$static = new TreeMap$EntryIterator((new TreeMap$EntrySet(this$static.map_0)).this$01);
  return new AbstractNavigableMap$NavigableKeySet$1(this$static);
}
function AbstractNavigableMap$NavigableKeySet(map_0) {
  this.map_0 = map_0;
}
defineClass(193, 213, $intern_9, AbstractNavigableMap$NavigableKeySet);
_.contains_0 = function(o) {
  return!!$getEntry_0(this.map_0, o);
};
_.iterator = function() {
  return $iterator_0(this);
};
_.size_1 = function() {
  return this.map_0.size_0;
};
createForClass(193);
function AbstractNavigableMap$NavigableKeySet$1(val$entryIterator) {
  this.val$entryIterator2 = val$entryIterator;
}
defineClass(194, 1, {}, AbstractNavigableMap$NavigableKeySet$1);
_.hasNext = function() {
  return this.val$entryIterator2.iter.hasNext();
};
_.next_0 = function() {
  return this.val$entryIterator2.iter.next_0().getKey();
};
createForClass(194);
function $get_1(this$static, index_0) {
  var iter;
  iter = $listIterator(this$static, index_0);
  try {
    return checkCriticalElement(iter.currentNode != iter.this$01.tail), iter.lastNode = iter.currentNode, iter.currentNode = iter.currentNode.next, ++iter.currentIndex, iter.lastNode.value_0;
  } catch ($e0) {
    $e0 = wrap($e0);
    if (instanceOf($e0, 55)) {
      throw new IndexOutOfBoundsException_0("Can't get element " + index_0);
    }
    throw unwrap($e0);
  }
}
defineClass(215, 214, {30:1});
_.add_1 = function(index_0, element) {
  var iter;
  iter = $listIterator(this, index_0);
  $addNode(iter.this$01, element, iter.currentNode.prev, iter.currentNode);
  ++iter.currentIndex;
  iter.lastNode = null;
};
_.get_1 = function(index_0) {
  return $get_1(this, index_0);
};
_.iterator = function() {
  return $listIterator(this, 0);
};
_.remove = function(index_0) {
  var iter, old;
  iter = $listIterator(this, index_0);
  try {
    return old = (checkCriticalElement(iter.currentNode != iter.this$01.tail), iter.lastNode = iter.currentNode, iter.currentNode = iter.currentNode.next, ++iter.currentIndex, iter.lastNode.value_0), $remove_3(iter), old;
  } catch ($e0) {
    $e0 = wrap($e0);
    if (instanceOf($e0, 55)) {
      throw new IndexOutOfBoundsException_0("Can't remove element " + index_0);
    }
    throw unwrap($e0);
  }
};
createForClass(215);
function $$init(this$static) {
  this$static.array = initDim(Ljava_lang_Object_2_classLit, $intern_3, 1, 0, 3);
}
function $add(this$static, index_0, o) {
  checkPositionIndex(index_0, this$static.array.length);
  this$static.array.splice(index_0, 0, o);
}
function $add_0(this$static, o) {
  this$static.array[this$static.array.length] = o;
  return!0;
}
function $addAll_0(this$static, c) {
  var cArray;
  cArray = c.toArray();
  if (0 == cArray.length) {
    return!1;
  }
  nativeArraySplice(cArray, 0, this$static.array, this$static.array.length, cArray.length, !1);
  return!0;
}
function $get_2(this$static, index_0) {
  checkElementIndex(index_0, this$static.array.length);
  return this$static.array[index_0];
}
function $indexOf_0(this$static, o) {
  for (var index_0 = 0;index_0 < this$static.array.length;++index_0) {
    if (equals_9(o, this$static.array[index_0])) {
      return index_0;
    }
  }
  return-1;
}
function $remove_0(this$static, index_0) {
  var previous;
  previous = (checkElementIndex(index_0, this$static.array.length), this$static.array[index_0]);
  this$static.array.splice(index_0, 1);
  return previous;
}
function $set(this$static, index_0, o) {
  checkElementIndex(index_0, this$static.array.length);
  this$static.array[index_0] = o;
}
function $toArray_0(this$static, out) {
  var i, size_0;
  size_0 = this$static.array.length;
  out.length < size_0 && (out = createFrom(out, size_0));
  for (i = 0;i < size_0;++i) {
    out[i] = this$static.array[i];
  }
  out.length > size_0 && (out[size_0] = null);
  return out;
}
function ArrayList() {
  $$init(this);
}
function ArrayList_0(c) {
  $$init(this);
  c = cloneSubrange(c.array, c.array.length);
  nativeArraySplice(c, 0, this.array, 0, c.length, !1);
}
defineClass(8, 214, $intern_10, ArrayList, ArrayList_0);
_.add_1 = function(index_0, o) {
  $add(this, index_0, o);
};
_.add_0 = function(o) {
  return $add_0(this, o);
};
_.addAll = function(c) {
  return $addAll_0(this, c);
};
_.contains_0 = function(o) {
  return-1 != $indexOf_0(this, o);
};
_.get_1 = function(index_0) {
  return $get_2(this, index_0);
};
_.isEmpty = function() {
  return 0 == this.array.length;
};
_.remove = function(index_0) {
  return $remove_0(this, index_0);
};
_.size_1 = function() {
  return this.array.length;
};
_.toArray = function() {
  return cloneSubrange(this.array, this.array.length);
};
_.toArray_0 = function(out) {
  return $toArray_0(this, out);
};
createForClass(8);
function mergeSort_0(temp, array, low, high, ofs, comp) {
  var tempHigh, tempLow, tempMid;
  if (7 > high - low) {
    for (temp = low, tempHigh = temp + 1;tempHigh < high;++tempHigh) {
      for (tempMid = tempHigh;tempMid > temp && 0 < comp.compare(array[tempMid - 1], array[tempMid]);--tempMid) {
        low = array[tempMid], array[tempMid] = array[tempMid - 1], array[tempMid - 1] = low;
      }
    }
  } else {
    if (tempLow = low + ofs, tempHigh = high + ofs, tempMid = tempLow + (tempHigh - tempLow >> 1), mergeSort_0(array, temp, tempLow, tempMid, -ofs, comp), mergeSort_0(array, temp, tempMid, tempHigh, -ofs, comp), 0 >= comp.compare(temp[tempMid - 1], temp[tempMid])) {
      for (;low < high;) {
        array[low++] = temp[tempLow++];
      }
    } else {
      for (ofs = tempLow, tempLow = tempMid;low < high;) {
        tempLow >= tempHigh || ofs < tempMid && 0 >= comp.compare(temp[ofs], temp[tempLow]) ? array[low++] = temp[ofs++] : array[low++] = temp[tempLow++];
      }
    }
  }
}
function Arrays$ArrayList(array) {
  this.array = array;
}
defineClass(115, 214, $intern_10, Arrays$ArrayList);
_.contains_0 = function(o) {
  a: {
    var i, n;
    i = 0;
    for (n = this.array.length;i < n;++i) {
      if (equals_9(o, (checkElementIndex(i, this.array.length), this.array[i]))) {
        o = i;
        break a;
      }
    }
    o = -1;
  }
  return-1 != o;
};
_.get_1 = function(index_0) {
  return checkElementIndex(index_0, this.array.length), this.array[index_0];
};
_.size_1 = function() {
  return this.array.length;
};
_.toArray = function() {
  var array = this.array;
  return cloneSubrange(array, array.length);
};
_.toArray_0 = function(out) {
  var i, size_0;
  size_0 = this.array.length;
  out.length < size_0 && (out = createFrom(out, size_0));
  for (i = 0;i < size_0;++i) {
    out[i] = this.array[i];
  }
  out.length > size_0 && (out[size_0] = null);
  return out;
};
createForClass(115);
function hashCode_10(collection) {
  var e$iterator, hashCode;
  hashCode = 0;
  for (e$iterator = collection.iterator();e$iterator.hasNext();) {
    collection = e$iterator.next_0(), hashCode += null != collection ? hashCode__I__devirtual$(collection) : 0, hashCode = ~~hashCode;
  }
  return hashCode;
}
function $clinit_Comparators() {
  $clinit_Comparators = emptyMethod;
  NATURAL = new Comparators$1;
}
var NATURAL;
function $compare(o1, o2) {
  checkNotNull(o1);
  checkNotNull(o2);
  return isJavaString(o1) ? o1 == o2 ? 0 : o1 < o2 ? -1 : 1 : o1.compareTo(o2);
}
function Comparators$1() {
}
defineClass(188, 1, {}, Comparators$1);
_.compare = function(o1, o2) {
  return $compare(o1, o2);
};
createForClass(188);
function structureChanged(map_0) {
  map_0._gwt_modCount = (map_0._gwt_modCount | 0) + 1;
}
function ConcurrentModificationException() {
  captureStackTrace(this, this.detailMessage);
}
defineClass(195, 20, $intern_2, ConcurrentModificationException);
createForClass(195);
function EmptyStackException() {
  captureStackTrace(this, this.detailMessage);
}
defineClass(89, 20, $intern_2, EmptyStackException);
createForClass(89);
function $get_3(this$static, k) {
  return $contains_1(this$static.keySet, k) ? this$static.values[k.ordinal] : null;
}
function $put_0(this$static, key, value_0) {
  $add_1(this$static.keySet, key);
  $set_0(this$static, key.ordinal, value_0);
}
function $set_0(this$static, ordinal, value_0) {
  var was;
  was = this$static.values[ordinal];
  this$static.values[ordinal] = value_0;
  return was;
}
function EnumMap(type_0) {
  var all;
  this.keySet = (all = type_0.enumConstantsFunc && type_0.enumConstantsFunc(), new EnumSet$EnumSetImpl(all, createFrom(all, all.length)));
  this.values = initDim(Ljava_lang_Object_2_classLit, $intern_3, 1, this.keySet.all.length, 3);
}
defineClass(186, 211, $intern_8, EnumMap);
_.containsKey = function(key) {
  return $contains_1(this.keySet, key);
};
_.entrySet = function() {
  return new EnumMap$EntrySet(this);
};
_.get_0 = function(k) {
  return $get_3(this, k);
};
_.size_1 = function() {
  return this.keySet.size_0;
};
createForClass(186);
function EnumMap$EntrySet(this$0) {
  this.this$01 = this$0;
}
defineClass(93, 213, $intern_9, EnumMap$EntrySet);
_.contains_0 = function(o) {
  return instanceOf(o, 24) ? $containsEntry(this.this$01, o) : !1;
};
_.iterator = function() {
  return new EnumMap$EntrySetIterator(this.this$01);
};
_.size_1 = function() {
  return this.this$01.keySet.size_0;
};
createForClass(93);
function EnumMap$EntrySetIterator(this$0) {
  this.this$01 = this$0;
  this.it = new EnumSet$EnumSetImpl$IteratorImpl(this.this$01.keySet);
}
defineClass(94, 1, {}, EnumMap$EntrySetIterator);
_.hasNext = function() {
  return $hasNext_0(this.it);
};
_.next_0 = function() {
  return this.key = $next_1(this.it), new EnumMap$MapEntry(this.this$01, this.key);
};
createForClass(94);
function EnumMap$MapEntry(this$0, key) {
  this.this$01 = this$0;
  this.key = key;
}
defineClass(95, 217, {24:1}, EnumMap$MapEntry);
_.getKey = function() {
  return this.key;
};
_.getValue = function() {
  return this.this$01.values[this.key.ordinal];
};
_.setValue = function(value_0) {
  return $set_0(this.this$01, this.key.ordinal, value_0);
};
createForClass(95);
defineClass(220, 213, $intern_9);
createForClass(220);
function $add_1(this$static, e) {
  var ordinal;
  checkNotNull(e);
  ordinal = e.ordinal;
  return this$static.set_0[ordinal] ? !1 : (this$static.set_0[ordinal] = e, ++this$static.size_0, !0);
}
function $contains_1(this$static, o) {
  return instanceOf(o, 9) && !!o && this$static.set_0[o.ordinal] == o;
}
function EnumSet$EnumSetImpl(all, set_0) {
  this.all = all;
  this.set_0 = set_0;
  this.size_0 = 0;
}
defineClass(196, 220, $intern_9, EnumSet$EnumSetImpl);
_.add_0 = function(e) {
  return $add_1(this, e);
};
_.contains_0 = function(o) {
  return $contains_1(this, o);
};
_.iterator = function() {
  return new EnumSet$EnumSetImpl$IteratorImpl(this);
};
_.size_1 = function() {
  return this.size_0;
};
_.size_0 = 0;
createForClass(196);
function $findNext(this$static) {
  var c;
  ++this$static.i;
  for (c = this$static.this$11.all.length;this$static.i < c && !this$static.this$11.set_0[this$static.i];++this$static.i) {
  }
}
function $hasNext_0(this$static) {
  return this$static.i < this$static.this$11.all.length;
}
function $next_1(this$static) {
  return checkCriticalElement(this$static.i < this$static.this$11.all.length), this$static.last = this$static.i, $findNext(this$static), this$static.this$11.set_0[this$static.last];
}
function EnumSet$EnumSetImpl$IteratorImpl(this$1) {
  this.this$11 = this$1;
  $findNext(this);
}
defineClass(100, 1, {}, EnumSet$EnumSetImpl$IteratorImpl);
_.hasNext = function() {
  return $hasNext_0(this);
};
_.next_0 = function() {
  return $next_1(this);
};
_.i = -1;
_.last = -1;
createForClass(100);
function $equals_0(value1, value2) {
  return maskUndefined(value1) === maskUndefined(value2) || null != value1 && equals_Ljava_lang_Object__Z__devirtual$(value1, value2);
}
function HashMap() {
  $reset(this);
}
function HashMap_0(ignored) {
  if (!(0 <= ignored)) {
    throw new IllegalArgumentException("Negative initial capacity");
  }
  $reset(this);
}
defineClass(18, 63, {3:1, 46:1}, HashMap, HashMap_0);
createForClass(18);
function $add_2(this$static, o) {
  return null == $put(this$static.map_0, o, this$static);
}
function $contains_2(this$static, o) {
  return $containsKey(this$static.map_0, o);
}
function HashSet() {
  this.map_0 = new HashMap;
}
function HashSet_0(c) {
  this.map_0 = new HashMap_0(c.array.length);
  $addAll(this, c);
}
defineClass(17, 213, {3:1, 25:1}, HashSet, HashSet_0);
_.add_0 = function(o) {
  return $add_2(this, o);
};
_.contains_0 = function(o) {
  return $contains_2(this, o);
};
_.isEmpty = function() {
  return 0 == this.map_0.size_0;
};
_.iterator = function() {
  return $iterator(new AbstractMap$1(this.map_0));
};
_.size_1 = function() {
  return this.map_0.size_0;
};
_.toString$ = function() {
  return $toString(new AbstractMap$1(this.map_0));
};
createForClass(17);
function $getEntry(this$static, key) {
  var entry, entry$array, entry$index, entry$max;
  entry = null == key ? "0" : "" + ~~hashCode__I__devirtual$(key);
  entry$array = this$static.backingMap[entry] || [];
  entry$index = 0;
  for (entry$max = entry$array.length;entry$index < entry$max;++entry$index) {
    if (entry = entry$array[entry$index], $equals_0(key, entry.getKey())) {
      return entry;
    }
  }
  return null;
}
function $put_1(this$static, key, value_0) {
  var chain, entry, entry$index, entry$max;
  chain = null == key ? "0" : "" + ~~hashCode__I__devirtual$(key);
  entry = this$static.backingMap;
  chain = entry[chain] || (entry[chain] = []);
  entry$index = 0;
  for (entry$max = chain.length;entry$index < entry$max;++entry$index) {
    if (entry = chain[entry$index], $equals_0(key, entry.getKey())) {
      return entry.setValue(value_0);
    }
  }
  chain[chain.length] = new AbstractMap$SimpleEntry(key, value_0);
  this$static = this$static.host_0;
  ++this$static.size_0;
  structureChanged(this$static);
  return null;
}
function InternalJsHashCodeMap() {
  this.backingMap = this.createMap();
}
defineClass(90, 1, {}, InternalJsHashCodeMap);
_.createMap = function() {
  return Object.create(null);
};
_.entries = function() {
  return new InternalJsHashCodeMap$1(this);
};
createForClass(90);
function $hasNext_1(this$static) {
  if (this$static.itemIndex < this$static.chain.length) {
    return!0;
  }
  if (this$static.chainIndex < this$static.keys_0.length - 1) {
    var hashCode = this$static.keys_0[++this$static.chainIndex];
    this$static.chain = this$static.this$01.backingMap[hashCode];
    this$static.itemIndex = 0;
    return!0;
  }
  return!1;
}
function InternalJsHashCodeMap$1(this$0) {
  this.this$01 = this$0;
  this.keys_0 = Object.getOwnPropertyNames(this.this$01.backingMap);
  this.chain = initDim(Ljava_util_Map$Entry_2_classLit, $intern_3, 24, 0, 0);
}
defineClass(145, 1, {}, InternalJsHashCodeMap$1);
_.hasNext = function() {
  return $hasNext_1(this);
};
_.next_0 = function() {
  return checkCriticalElement($hasNext_1(this)), this.lastEntry = this.chain[this.itemIndex++], this.lastEntry;
};
_.chainIndex = -1;
_.itemIndex = 0;
_.lastEntry = null;
createForClass(145);
function InternalJsHashCodeMap$InternalJsHashCodeMapLegacy() {
  InternalJsHashCodeMap.call(this);
}
defineClass(143, 90, {}, InternalJsHashCodeMap$InternalJsHashCodeMapLegacy);
_.createMap = function() {
  return{};
};
_.entries = function() {
  var list = this.newEntryList(), map_0 = this.backingMap, hashCode;
  for (hashCode in map_0) {
    if (hashCode == parseInt(hashCode, 10)) {
      for (var array = map_0[hashCode], i = 0, c = array.length;i < c;++i) {
        list.add_0(array[i]);
      }
    }
  }
  return list.iterator();
};
_.newEntryList = function() {
  return new InternalJsHashCodeMap$InternalJsHashCodeMapLegacy$1(this);
};
createForClass(143);
function InternalJsHashCodeMap$InternalJsHashCodeMapLegacy$1(this$1) {
  this.this$11 = this$1;
  $$init(this);
}
defineClass(144, 8, $intern_10, InternalJsHashCodeMap$InternalJsHashCodeMapLegacy$1);
_.remove = function(index_0) {
  index_0 = $remove_0(this, index_0);
  a: {
    var this$static = this.this$11, key = index_0.getKey(), chain, entry, hashCode, i;
    hashCode = null == key ? "0" : "" + ~~hashCode__I__devirtual$(key);
    chain = this$static.backingMap[hashCode] || [];
    for (i = 0;i < chain.length;i++) {
      if (entry = chain[i], $equals_0(key, entry.getKey())) {
        1 == chain.length ? delete this$static.backingMap[hashCode] : chain.splice(i, 1);
        this$static = this$static.host_0;
        --this$static.size_0;
        structureChanged(this$static);
        break a;
      }
    }
  }
  return index_0;
};
createForClass(144);
function InternalJsMapFactory() {
}
defineClass(140, 1, {}, InternalJsMapFactory);
_.createJsHashCodeMap = function() {
  return new InternalJsHashCodeMap;
};
_.createJsStringMap = function() {
  return new InternalJsStringMap;
};
createForClass(140);
function $clinit_InternalJsMapFactory$BackwardCompatibleJsMapFactory() {
  $clinit_InternalJsMapFactory$BackwardCompatibleJsMapFactory = emptyMethod;
  var map_0, JSCompiler_temp;
  if (JSCompiler_temp = Object.create && Object.getOwnPropertyNames) {
    JSCompiler_temp = Object.create(null), void 0 !== JSCompiler_temp.__proto__ || 0 != Object.getOwnPropertyNames(JSCompiler_temp).length ? JSCompiler_temp = !1 : (JSCompiler_temp.__proto__ = 42, JSCompiler_temp = 42 !== JSCompiler_temp.__proto__ ? !1 : !0);
  }
  delegate = JSCompiler_temp ? (map_0 = Object.create(null), map_0.__proto__ = 42, 0 == Object.getOwnPropertyNames(map_0).length) ? new InternalJsMapFactory$KeysWorkaroundJsMapFactory : new InternalJsMapFactory : new InternalJsMapFactory$LegacyInternalJsMapFactory;
}
var delegate;
function InternalJsMapFactory$KeysWorkaroundJsMapFactory() {
}
defineClass(142, 140, {}, InternalJsMapFactory$KeysWorkaroundJsMapFactory);
_.createJsStringMap = function() {
  return new InternalJsStringMap$InternalJsStringMapWithKeysWorkaround;
};
createForClass(142);
function InternalJsMapFactory$LegacyInternalJsMapFactory() {
}
defineClass(141, 140, {}, InternalJsMapFactory$LegacyInternalJsMapFactory);
_.createJsHashCodeMap = function() {
  return new InternalJsHashCodeMap$InternalJsHashCodeMapLegacy;
};
_.createJsStringMap = function() {
  return new InternalJsStringMap$InternalJsStringMapLegacy;
};
createForClass(141);
function $put_2(this$static, key, value_0) {
  var oldValue;
  oldValue = this$static.backingMap[key];
  if (void 0 === oldValue) {
    var this$static$$0 = this$static.host_0;
    ++this$static$$0.size_0;
    structureChanged(this$static$$0);
  }
  this$static.backingMap[key] = void 0 === value_0 ? null : value_0;
  return oldValue;
}
function $remove_2(this$static, key) {
  var value_0;
  value_0 = this$static.backingMap[key];
  if (void 0 !== value_0) {
    delete this$static.backingMap[key];
    var this$static$$0 = this$static.host_0;
    --this$static$$0.size_0;
    structureChanged(this$static$$0);
  }
  return value_0;
}
function InternalJsStringMap() {
  this.backingMap = this.createMap_0();
}
defineClass(72, 1, {}, InternalJsStringMap);
_.createMap_0 = function() {
  return Object.create(null);
};
_.entries = function() {
  var keys_0;
  keys_0 = this.keys_1();
  return new InternalJsStringMap$1(this, keys_0);
};
_.get_2 = function(key) {
  return this.backingMap[key];
};
_.keys_1 = function() {
  return Object.getOwnPropertyNames(this.backingMap);
};
_.newMapEntry = function(key) {
  return new InternalJsStringMap$2(this, key);
};
_.put = function(key, value_0) {
  return $put_2(this, key, value_0);
};
_.remove_1 = function(key) {
  return $remove_2(this, key);
};
createForClass(72);
function InternalJsStringMap$1(this$0, val$keys) {
  this.this$01 = this$0;
  this.val$keys2 = val$keys;
}
defineClass(132, 1, {}, InternalJsStringMap$1);
_.hasNext = function() {
  return this.i < this.val$keys2.length;
};
_.next_0 = function() {
  return checkCriticalElement(this.i < this.val$keys2.length), new InternalJsStringMap$2(this.this$01, this.val$keys2[this.i++]);
};
_.i = 0;
createForClass(132);
function InternalJsStringMap$2(this$0, val$key) {
  this.this$01 = this$0;
  this.val$key2 = val$key;
}
defineClass(84, 217, {24:1}, InternalJsStringMap$2);
_.getKey = function() {
  return this.val$key2;
};
_.getValue = function() {
  return this.this$01.get_2(this.val$key2);
};
_.setValue = function(object) {
  return this.this$01.put(this.val$key2, object);
};
createForClass(84);
function InternalJsStringMap$InternalJsStringMapLegacy() {
  InternalJsStringMap.call(this);
}
defineClass(129, 72, {}, InternalJsStringMap$InternalJsStringMapLegacy);
_.createMap_0 = function() {
  return{};
};
_.entries = function() {
  var list = this.newEntryList_0(), key;
  for (key in this.backingMap) {
    if (58 == key.charCodeAt(0)) {
      var entry = this.newMapEntry(key.substring(1));
      list.add_0(entry);
    }
  }
  return list.iterator();
};
_.get_2 = function(key) {
  return this.backingMap[":" + key];
};
_.newEntryList_0 = function() {
  return new InternalJsStringMap$InternalJsStringMapLegacy$1(this);
};
_.put = function(key, value_0) {
  return $put_2(this, ":" + key, value_0);
};
_.remove_1 = function(key) {
  return $remove_2(this, ":" + key);
};
createForClass(129);
function InternalJsStringMap$InternalJsStringMapLegacy$1(this$1) {
  this.this$11 = this$1;
  $$init(this);
}
defineClass(131, 8, $intern_10, InternalJsStringMap$InternalJsStringMapLegacy$1);
_.remove = function(index_0) {
  var removed;
  return removed = $remove_0(this, index_0), $remove_2(this.this$11, ":" + removed.getKey()), removed;
};
createForClass(131);
function InternalJsStringMap$InternalJsStringMapWithKeysWorkaround() {
  InternalJsStringMap.call(this);
}
defineClass(130, 72, {}, InternalJsStringMap$InternalJsStringMapWithKeysWorkaround);
_.keys_1 = function() {
  var keys_0;
  keys_0 = Object.getOwnPropertyNames(this.backingMap);
  void 0 !== this.backingMap.__proto__ && (keys_0[keys_0.length] = "__proto__");
  return keys_0;
};
createForClass(130);
function $add_3(this$static, o) {
  $addNode(this$static, o, this$static.tail.prev, this$static.tail);
  return!0;
}
function $addNode(this$static, o, prev, next) {
  var node;
  node = new LinkedList$Node;
  node.value_0 = o;
  node.prev = prev;
  node.next = next;
  next.prev = prev.next = node;
  ++this$static.size_0;
}
function $listIterator(this$static, index_0) {
  var i, node;
  checkPositionIndex(index_0, this$static.size_0);
  if (index_0 >= this$static.size_0 >> 1) {
    for (node = this$static.tail, i = this$static.size_0;i > index_0;--i) {
      node = node.prev;
    }
  } else {
    for (node = this$static.header.next, i = 0;i < index_0;++i) {
      node = node.next;
    }
  }
  return new LinkedList$ListIteratorImpl(this$static, index_0, node);
}
function LinkedList() {
  this.header = new LinkedList$Node;
  this.tail = new LinkedList$Node;
  this.header.next = this.tail;
  this.tail.prev = this.header;
  this.header.prev = this.tail.next = null;
  this.size_0 = 0;
}
defineClass(81, 215, $intern_10, LinkedList);
_.add_0 = function(o) {
  return $add_3(this, o);
};
_.size_1 = function() {
  return this.size_0;
};
_.size_0 = 0;
createForClass(81);
function $remove_3(this$static) {
  var nextNode;
  if (!this$static.lastNode) {
    throw new IllegalStateException;
  }
  nextNode = this$static.lastNode.next;
  var this$static$$0 = this$static.this$01, node = this$static.lastNode;
  node.next.prev = node.prev;
  node.prev.next = node.next;
  node.next = node.prev = null;
  node.value_0 = null;
  --this$static$$0.size_0;
  this$static.currentNode == this$static.lastNode ? this$static.currentNode = nextNode : --this$static.currentIndex;
  this$static.lastNode = null;
}
function LinkedList$ListIteratorImpl(this$0, index_0, startNode) {
  this.this$01 = this$0;
  this.currentNode = startNode;
  this.currentIndex = index_0;
}
defineClass(116, 1, {}, LinkedList$ListIteratorImpl);
_.hasNext = function() {
  return this.currentNode != this.this$01.tail;
};
_.next_0 = function() {
  return checkCriticalElement(this.currentNode != this.this$01.tail), this.lastNode = this.currentNode, this.currentNode = this.currentNode.next, ++this.currentIndex, this.lastNode.value_0;
};
_.remove_0 = function() {
  $remove_3(this);
};
_.currentIndex = 0;
_.lastNode = null;
createForClass(116);
function LinkedList$Node() {
}
defineClass(67, 1, {}, LinkedList$Node);
createForClass(67);
var Ljava_util_Map$Entry_2_classLit = createForInterface();
function NoSuchElementException() {
  captureStackTrace(this, this.detailMessage);
}
defineClass(55, 20, {3:1, 15:1, 12:1, 55:1}, NoSuchElementException);
createForClass(55);
function equals_9(a, b) {
  return maskUndefined(a) === maskUndefined(b) || null != a && equals_Ljava_lang_Object__Z__devirtual$(a, b);
}
function hashCode_12(o) {
  return null != o ? hashCode__I__devirtual$(o) : 0;
}
function checkArrayElementIndex(index_0, size_0) {
  if (0 > index_0 || index_0 >= size_0) {
    throw new ArrayIndexOutOfBoundsException;
  }
}
defineClass(125, 214, $intern_10);
_.add_1 = function(index_0, o) {
  checkArrayElementIndex(index_0, this.arrayList.array.length + 1);
  $add(this.arrayList, index_0, o);
};
_.add_0 = function(o) {
  return $add_0(this.arrayList, o);
};
_.addAll = function(c) {
  return $addAll_0(this.arrayList, c);
};
_.contains_0 = function(elem) {
  return-1 != $indexOf_0(this.arrayList, elem);
};
_.get_1 = function(index_0) {
  return checkArrayElementIndex(index_0, this.arrayList.array.length), $get_2(this.arrayList, index_0);
};
_.isEmpty = function() {
  return 0 == this.arrayList.array.length;
};
_.iterator = function() {
  return new AbstractList$IteratorImpl(this.arrayList);
};
_.remove = function(index_0) {
  return checkArrayElementIndex(index_0, this.arrayList.array.length), this.arrayList.remove(index_0);
};
_.size_1 = function() {
  return this.arrayList.array.length;
};
_.toArray = function() {
  var this$static = this.arrayList;
  return cloneSubrange(this$static.array, this$static.array.length);
};
_.toArray_0 = function(a) {
  return $toArray_0(this.arrayList, a);
};
_.toString$ = function() {
  return $toString(this.arrayList);
};
createForClass(125);
function $pop(this$static) {
  var sz;
  sz = this$static.arrayList.array.length;
  if (0 < sz) {
    return checkArrayElementIndex(sz - 1, this$static.arrayList.array.length), this$static.arrayList.remove(sz - 1);
  }
  throw new EmptyStackException;
}
function Stack() {
  this.arrayList = new ArrayList;
}
defineClass(68, 125, $intern_10, Stack);
createForClass(68);
function $getEntry_0(this$static, key) {
  var c, tree;
  for (tree = this$static.root;tree;) {
    c = $compare(key, tree.key);
    if (0 == c) {
      return tree;
    }
    c = 0 > c ? 0 : 1;
    tree = tree.child[c];
  }
  return null;
}
function $inOrderAdd(this$static, list, type_0, current, fromKey, fromInclusive, toKey, toInclusive) {
  var leftNode;
  if (current) {
    (leftNode = current.child[0]) && $inOrderAdd(this$static, list, type_0, leftNode, fromKey, fromInclusive, toKey, toInclusive);
    leftNode = current.key;
    var compare, compare_0;
    type_0.fromKeyValid() && (compare = $compare(leftNode, fromKey), 0 > compare || !fromInclusive && 0 == compare) || type_0.toKeyValid() && (compare_0 = $compare(leftNode, toKey), 0 < compare_0 || !toInclusive && 0 == compare_0) || list.add_0(current);
    (current = current.child[1]) && $inOrderAdd(this$static, list, type_0, current, fromKey, fromInclusive, toKey, toInclusive);
  }
}
function $insert(this$static, tree, newNode, state) {
  var c, otherChildDir;
  if (tree) {
    c = $compare(newNode.key, tree.key);
    if (0 == c) {
      return state.value_0 = $setValue(tree, newNode.value_0), state.found = !0, tree;
    }
    c = 0 > c ? 0 : 1;
    tree.child[c] = $insert(this$static, tree.child[c], newNode, state);
    $isRed(tree.child[c]) && ($isRed(tree.child[1 - c]) ? (tree.isRed = !0, tree.child[0].isRed = !1, tree.child[1].isRed = !1) : $isRed(tree.child[c].child[c]) ? tree = $rotateSingle(tree, 1 - c) : $isRed(tree.child[c].child[1 - c]) && (tree = (otherChildDir = 1 - (1 - c), tree.child[otherChildDir] = $rotateSingle(tree.child[otherChildDir], otherChildDir), $rotateSingle(tree, 1 - c))));
  } else {
    return newNode;
  }
  return tree;
}
function $isRed(node) {
  return!!node && node.isRed;
}
function $rotateSingle(tree, rotateDirection) {
  var otherChildDir, save;
  otherChildDir = 1 - rotateDirection;
  save = tree.child[otherChildDir];
  tree.child[otherChildDir] = save.child[rotateDirection];
  save.child[rotateDirection] = tree;
  tree.isRed = !0;
  save.isRed = !1;
  return save;
}
function TreeMap() {
  var c = null;
  this.root = null;
  !c && (c = ($clinit_Comparators(), $clinit_Comparators(), NATURAL));
  this.cmp = c;
}
defineClass(97, 219, {3:1, 46:1}, TreeMap);
_.entrySet = function() {
  return new TreeMap$EntrySet(this);
};
_.size_1 = function() {
  return this.size_0;
};
_.size_0 = 0;
createForClass(97);
function TreeMap$EntryIterator(this$0) {
  var type_0 = ($clinit_TreeMap$SubMapType(), All), list;
  list = new ArrayList;
  $inOrderAdd(this$0, list, type_0, this$0.root, null, !1, null, !1);
  this.iter = new AbstractList$ListIteratorImpl(list, 0);
}
defineClass(75, 1, {}, TreeMap$EntryIterator);
_.hasNext = function() {
  return this.iter.hasNext();
};
_.next_0 = function() {
  return this.iter.next_0();
};
createForClass(75);
function TreeMap$EntrySet(this$0) {
  this.this$01 = this$0;
}
defineClass(99, 98, $intern_9, TreeMap$EntrySet);
createForClass(99);
function TreeMap$Node(key, value_0) {
  AbstractMap$SimpleEntry.call(this, key, value_0);
  this.child = initDim(Ljava_util_TreeMap$Node_2_classLit, $intern_3, 58, 2, 0);
  this.isRed = !0;
}
defineClass(58, 49, {48:1, 49:1, 24:1, 58:1}, TreeMap$Node);
_.isRed = !1;
var Ljava_util_TreeMap$Node_2_classLit = createForClass(58);
function TreeMap$State() {
}
defineClass(189, 1, {}, TreeMap$State);
_.toString$ = function() {
  return "State: mv\x3d" + this.matchValue + " value\x3d" + this.value_0 + " done\x3d" + this.done + " found\x3d" + this.found;
};
_.done = !1;
_.found = !1;
_.matchValue = !1;
createForClass(189);
function $clinit_TreeMap$SubMapType() {
  $clinit_TreeMap$SubMapType = emptyMethod;
  All = new TreeMap$SubMapType("All", 0);
  Head = new TreeMap$SubMapType$1;
  Range_0 = new TreeMap$SubMapType$2;
  Tail = new TreeMap$SubMapType$3;
}
function TreeMap$SubMapType(enum$name, enum$ordinal) {
  Enum.call(this, enum$name, enum$ordinal);
}
defineClass(29, 9, $intern_11, TreeMap$SubMapType);
_.fromKeyValid = function() {
  return!1;
};
_.toKeyValid = function() {
  return!1;
};
var All, Head, Range_0, Tail, Ljava_util_TreeMap$SubMapType_2_classLit = createForEnum(29, function() {
  $clinit_TreeMap$SubMapType();
  return initValues(getClassLiteralForArray_0(Ljava_util_TreeMap$SubMapType_2_classLit, 1), $intern_4, 29, 0, [All, Head, Range_0, Tail]);
});
function TreeMap$SubMapType$1() {
  Enum.call(this, "Head", 1);
}
defineClass(190, 29, $intern_11, TreeMap$SubMapType$1);
_.toKeyValid = function() {
  return!0;
};
createForEnum(190, null);
function TreeMap$SubMapType$2() {
  Enum.call(this, "Range", 2);
}
defineClass(191, 29, $intern_11, TreeMap$SubMapType$2);
_.fromKeyValid = function() {
  return!0;
};
_.toKeyValid = function() {
  return!0;
};
createForEnum(191, null);
function TreeMap$SubMapType$3() {
  Enum.call(this, "Tail", 3);
}
defineClass(192, 29, $intern_11, TreeMap$SubMapType$3);
_.fromKeyValid = function() {
  return!0;
};
createForEnum(192, null);
function TreeSet(c) {
  this.map_0 = new TreeMap;
  $addAll(this, c);
}
defineClass(91, 213, {3:1, 25:1}, TreeSet);
_.add_0 = function(o) {
  var this$static = this.map_0, value_0 = ($clinit_Boolean(), FALSE);
  o = new TreeMap$Node(o, value_0);
  value_0 = new TreeMap$State;
  this$static.root = $insert(this$static, this$static.root, o, value_0);
  value_0.found || ++this$static.size_0;
  this$static.root.isRed = !1;
  return null == value_0.value_0;
};
_.contains_0 = function(o) {
  return!!$getEntry_0(this.map_0, o);
};
_.iterator = function() {
  return $iterator_0(new AbstractNavigableMap$NavigableKeySet(this.map_0));
};
_.size_1 = function() {
  return this.map_0.size_0;
};
createForClass(91);
function $ensureTitleInitialized(this$static) {
  var title_0;
  if (!(0 < this$static.candidateTitles.size_0)) {
    title_0 = $getTitle(this$static.parser);
    !title_0.length || $add_3(this$static.candidateTitles, title_0);
    title_0 = this$static.candidateTitles;
    var JSCompiler_inline_result;
    var objTitle = $doc.title, root = $doc.documentElement, currTitle;
    JSCompiler_inline_result = currTitle = "";
    Ljava_lang_String_2_classLit == Ljava_lang_String_2_classLit ? currTitle = JSCompiler_inline_result = objTitle : root && (objTitle = root.getElementsByTagName("TITLE"), 0 < objTitle.length && (currTitle = JSCompiler_inline_result = javascriptTextContent(objTitle[0])));
    if (currTitle.length) {
      $clinit_StringUtil();
      if (/ [\|\-] /i.test(currTitle)) {
        currTitle = JSCompiler_inline_result.replace(RegExp("(.*)[\\|\\-] .*", "gi"), "$1"), 3 > sWordCounter.count(currTitle) && (currTitle = JSCompiler_inline_result.replace(RegExp("[^\\|\\-]*[\\|\\-](.*)", "gi"), "$1"));
      } else {
        if (-1 != currTitle.indexOf(": ")) {
          currTitle = JSCompiler_inline_result.replace(RegExp(".*:(.*)", "gi"), "$1"), 3 > sWordCounter.count(currTitle) && (currTitle = JSCompiler_inline_result.replace(RegExp("[^:]*[:](.*)", "gi"), "$1"));
        } else {
          if (root && (150 < currTitle.length || 15 > currTitle.length)) {
            currTitle = root.getElementsByTagName("H1");
            root = "";
            for (objTitle = 0;objTitle < currTitle.length && !root.length;objTitle++) {
              root = getInnerText(currTitle[objTitle]);
            }
            currTitle = root;
            !currTitle.length && (currTitle = JSCompiler_inline_result);
          }
        }
      }
      currTitle = jsTrim(currTitle);
      4 >= sWordCounter.count(currTitle) && (currTitle = JSCompiler_inline_result);
      JSCompiler_inline_result = currTitle;
    } else {
      JSCompiler_inline_result = "";
    }
    $add_3(title_0, JSCompiler_inline_result);
    Ljava_lang_String_2_classLit == Ljava_lang_String_2_classLit && $add_3(this$static.candidateTitles, $doc.title);
  }
}
function ContentExtractor(root) {
  var startTime, obj_0;
  this.documentElement_0 = root;
  this.candidateTitles = new LinkedList;
  this.mTimingInfo = (startTime = {}, startTime[6] = [], startTime);
  this.mStatisticsInfo = (obj_0 = {}, obj_0);
  startTime = getTime();
  this.parser = new MarkupParser(root, this.mTimingInfo);
  root = getTime() - startTime;
  if (void 0 == root) {
    throw new TypeError;
  }
  this.mTimingInfo[1] = root;
  this.textDirection = "";
}
defineClass(103, 1, {}, ContentExtractor);
createForClass(103);
function ContentExtractor$WebDocumentInfo() {
}
defineClass(104, 1, {}, ContentExtractor$WebDocumentInfo);
createForClass(104);
function applyWithOptions(options) {
  var content_0, contentExtractor, debugInfo, info, next, originalUrl, paramInfo, result, stPaging, startTime, timingInfo, url_0, url$iterator, obj, obj_0, res, parser, info_0, next_0, obj_1, log_0;
  startTime = getTime();
  var text_0 = javascriptTextContent($doc.documentElement), rFull, rLetter;
  $clinit_StringUtil();
  sWordCounter = (rFull = RegExp("[\\u3040-\\uA4CF]", "g"), rLetter = RegExp("[\\uAC00-\\uD7AF]", "g"), rFull.test(text_0) ? new StringUtil$FullWordCounter : rLetter.test(text_0) ? new StringUtil$LetterWordCounter : new StringUtil$FastWordCounter);
  result = (obj = {}, obj[10] = [], obj);
  contentExtractor = new ContentExtractor($doc.documentElement);
  var val = ($ensureTitleInitialized(contentExtractor), $get_1(contentExtractor.candidateTitles, 0));
  if (void 0 == val) {
    throw new TypeError;
  }
  result[1] = val;
  var JSCompiler_temp;
  if (void 0 != options[2]) {
    if (void 0 === options[2]) {
      throw new TypeError;
    }
    JSCompiler_temp = options[2];
  } else {
    JSCompiler_temp = 0;
  }
  sDebugLevel = JSCompiler_temp;
  logToConsole("DomDistiller debug level: " + sDebugLevel);
  content_0 = (obj_0 = {}, obj_0);
  var JSCompiler_temp$$0;
  if (JSCompiler_temp$$0 = void 0 != options[1]) {
    if (void 0 === options[1]) {
      throw new TypeError;
    }
    JSCompiler_temp$$0 = options[1];
  }
  var textOnly = JSCompiler_temp$$0, documentInfo, entry, html, i, now_0, info$$0, documentBuilder, mobileViewport, converter, walkerRoot;
  now_0 = getTime();
  info$$0 = new ContentExtractor$WebDocumentInfo;
  documentBuilder = new WebDocumentBuilder;
  mobileViewport = querySelectorAll(contentExtractor.documentElement_0, 'meta[name\x3d"viewport"][content*\x3d"width\x3ddevice-width"]');
  converter = new DomConverter(documentBuilder);
  converter.isMobileFriendly = 0 < mobileViewport.length;
  var JSCompiler_inline_result;
  var root = contentExtractor.documentElement_0;
  $clinit_DomUtil();
  var allArticles, visibleElements;
  allArticles = root.getElementsByTagName("ARTICLE");
  visibleElements = getVisibleElements(allArticles);
  1 == visibleElements.array.length ? JSCompiler_inline_result = (checkElementIndex(0, visibleElements.array.length), visibleElements.array[0]) : (allArticles = querySelectorAll(root, '[itemscope][itemtype*\x3d"Article"],[itemscope][itemtype*\x3d"Posting"]'), visibleElements = getVisibleElements(allArticles), JSCompiler_inline_result = 0 < visibleElements.array.length ? getNearestCommonAncestor_0(visibleElements) : null);
  documentInfo = (walkerRoot = JSCompiler_inline_result, converter.hasArticleElement = !!walkerRoot, walkerRoot ? 1 <= sDebugLevel && logToConsole("Extracted article element: " + walkerRoot) : walkerRoot = contentExtractor.documentElement_0, $walk(new DomWalker(converter), walkerRoot), info$$0.document_0 = ($flushBlock(documentBuilder, documentBuilder.groupNumber), documentBuilder.document_0), $ensureTitleInitialized(contentExtractor), info$$0);
  var val$$0 = getTime() - now_0;
  if (void 0 == val$$0) {
    throw new TypeError;
  }
  contentExtractor.mTimingInfo[2] = val$$0;
  now_0 = getTime();
  var document_0 = documentInfo.document_0, textDocument;
  var curBlock, curGroup, i$$0, prevGroup, textBlocks;
  textBlocks = new ArrayList;
  b: {
    var i$$1;
    for (i$$1 = 0;i$$1 < document_0.elements.array.length;i$$1++) {
      if (instanceOf($get_2(document_0.elements, i$$1), 35)) {
        i$$0 = i$$1;
        break b;
      }
    }
    i$$0 = document_0.elements.array.length;
  }
  if (i$$0 != document_0.elements.array.length) {
    prevGroup = curGroup = $get_2(document_0.elements, i$$0).groupNumber;
    curBlock = new TextBlock(document_0.elements, i$$0);
    for (++i$$0;i$$0 < document_0.elements.array.length;i$$0++) {
      instanceOf($get_2(document_0.elements, i$$0), 35) && (curGroup = $get_2(document_0.elements, i$$0).groupNumber, curGroup == prevGroup ? $mergeNext(curBlock, new TextBlock(document_0.elements, i$$0)) : (textBlocks.array[textBlocks.array.length] = curBlock, prevGroup = curGroup, curBlock = new TextBlock(document_0.elements, i$$0)));
    }
    textBlocks.array[textBlocks.array.length] = curBlock;
  }
  textDocument = new TextDocument(textBlocks);
  var candidateTitles = contentExtractor.candidateTitles, changed;
  $process_1(textDocument, !0, "Start");
  var doc = ($clinit_TerminatingBlocksFinder(), textDocument), tb, tb$iterator;
  for (tb$iterator = new AbstractList$IteratorImpl(doc.textBlocks);tb$iterator.i < tb$iterator.this$01_0.size_1();) {
    tb = (checkCriticalElement(tb$iterator.i < tb$iterator.this$01_0.size_1()), tb$iterator.this$01_0.get_1(tb$iterator.last = tb$iterator.i++));
    var JSCompiler_inline_result$$0;
    var tb$$0 = tb, text_0$$0 = void 0;
    14 < tb$$0.numWords ? JSCompiler_inline_result$$0 = !1 : (text_0$$0 = jsTrim(tb$$0.text_0), JSCompiler_inline_result$$0 = 8 <= text_0$$0.length ? REG_TERMINATING.test(text_0$$0) : 1 == tb$$0.linkDensity ? "Comment" === text_0$$0 : "Shares" === text_0$$0 ? !0 : !1);
    JSCompiler_inline_result$$0 && $add_2(tb.labels, "STRICTLY_NOT_CONTENT");
  }
  var this$static = new DocumentTitleMatchClassifier(candidateTitles), tb$$1, tb$iterator$$0, text_0$$1;
  if (this$static.potentialTitles) {
    for (tb$iterator$$0 = new AbstractList$IteratorImpl(textDocument.textBlocks);tb$iterator$$0.i < tb$iterator$$0.this$01_0.size_1();) {
      tb$$1 = (checkCriticalElement(tb$iterator$$0.i < tb$iterator$$0.this$01_0.size_1()), tb$iterator$$0.this$01_0.get_1(tb$iterator$$0.last = tb$iterator$$0.i++)), text_0$$1 = tb$$1.text_0, text_0$$1 = $replace_0(text_0$$1), text_0$$1 = $replaceAll(text_0$$1, "'"), text_0$$1 = $trim(text_0$$1).toLowerCase(), $contains_2(this$static.potentialTitles, text_0$$1) && $add_2(tb$$1.labels, "de.l3s.boilerpipe/TITLE"), text_0$$1 = $trim(text_0$$1.replace(REG_REMOVE_CHARACTERS, "")), $contains_2(this$static.potentialTitles, 
      text_0$$1) && $add_2(tb$$1.labels, "de.l3s.boilerpipe/TITLE");
    }
  }
  var currBlock, hasChanges, i$$2, nextBlock, prevBlock, textBlocks$$0, isContent;
  textBlocks$$0 = textDocument.textBlocks;
  if (0 == textBlocks$$0.array.length) {
    changed = !1;
  } else {
    hasChanges = !1;
    for (i$$2 = 0;i$$2 < textBlocks$$0.array.length;i$$2++) {
      prevBlock = 0 == i$$2 ? null : (checkElementIndex(i$$2 - 1, textBlocks$$0.array.length), textBlocks$$0.array[i$$2 - 1]), currBlock = (checkElementIndex(i$$2, textBlocks$$0.array.length), textBlocks$$0.array[i$$2]), nextBlock = i$$2 + 1 == textBlocks$$0.array.length ? null : (checkElementIndex(i$$2 + 1, textBlocks$$0.array.length), textBlocks$$0.array[i$$2 + 1]), hasChanges |= (0.333333 >= currBlock.linkDensity ? !prevBlock || 0.555556 >= prevBlock.linkDensity ? 16 >= currBlock.numWords ? !nextBlock || 
      15 >= nextBlock.numWords ? !prevBlock || 4 >= prevBlock.numWords ? isContent = !1 : isContent = !0 : isContent = !0 : isContent = !0 : 40 >= currBlock.numWords ? !nextBlock || 17 >= nextBlock.numWords ? isContent = !1 : isContent = !0 : isContent = !0 : isContent = !1, $setIsContent(currBlock, isContent));
    }
    changed = hasChanges;
  }
  $process_1(textDocument, changed, "Classification Complete");
  var this$static$$0 = ($clinit_LabelToBoilerplateFilter(), INSTANCE_STRICTLY_NOT_CONTENT), changes, label_0, label$array, label$index, label$max, tb$$2, tb$iterator$$1;
  changes = !1;
  tb$iterator$$1 = new AbstractList$IteratorImpl(textDocument.textBlocks);
  a: for (;tb$iterator$$1.i < tb$iterator$$1.this$01_0.size_1();) {
    if (tb$$2 = (checkCriticalElement(tb$iterator$$1.i < tb$iterator$$1.this$01_0.size_1()), tb$iterator$$1.this$01_0.get_1(tb$iterator$$1.last = tb$iterator$$1.i++)), tb$$2.isContent) {
      for (label$array = this$static$$0.labels, label$index = 0, label$max = label$array.length;label$index < label$max;++label$index) {
        if (label_0 = label$array[label$index], $contains_2(tb$$2.labels, label_0)) {
          $setIsContent(tb$$2, !1);
          changes = !0;
          continue a;
        }
      }
    }
  }
  changed = changes;
  $process_1(textDocument, changed, "Ignore Strictly Not Content blocks");
  var this$static$$1 = $allowCrossHeadings();
  this$static$$1.mMaxLinkDensity = 0.5;
  this$static$$1.mMaxBlockDistance = 10;
  changed = $process_11($build(this$static$$1), textDocument);
  $process_1(textDocument, changed, "SimilarSiblingContentExpansion: Cross headings");
  var this$static$$2 = $allowCrossHeadings();
  this$static$$2.mAllowMixedTags = !0;
  this$static$$2.mMaxLinkDensity = 0;
  this$static$$2.mMaxBlockDistance = 10;
  changed = $process_11($build(this$static$$2), textDocument);
  $process_1(textDocument, changed, "SimilarSiblingContentExpansion: Mixed tags");
  var changes$$0, currBlock$$0, headingWasContent, it, prevBlock$$0, textBlocks$$1;
  textBlocks$$1 = textDocument.textBlocks;
  if (2 > textBlocks$$1.array.length) {
    changed = !1;
  } else {
    changes$$0 = !1;
    it = new AbstractList$ListIteratorImpl(textBlocks$$1, 0);
    for (currBlock$$0 = it.next_0();it.hasNext();) {
      if (prevBlock$$0 = currBlock$$0, currBlock$$0 = it.next_0(), $contains_2(prevBlock$$0.labels, "de.l3s.boilerpipe/HEADING") && !($contains_2(prevBlock$$0.labels, "STRICTLY_NOT_CONTENT") || $contains_2(currBlock$$0.labels, "STRICTLY_NOT_CONTENT") || $contains_2(prevBlock$$0.labels, "de.l3s.boilerpipe/TITLE") || $contains_2(currBlock$$0.labels, "de.l3s.boilerpipe/TITLE"))) {
        if (currBlock$$0.isContent) {
          changes$$0 = !0;
          headingWasContent = prevBlock$$0.isContent;
          $mergeNext(prevBlock$$0, currBlock$$0);
          currBlock$$0 = prevBlock$$0;
          it.remove_0();
          var this$static$$3 = prevBlock$$0;
          $contains_2(this$static$$3.labels, "de.l3s.boilerpipe/HEADING") && this$static$$3.labels.map_0.stringMap.remove_1("de.l3s.boilerpipe/HEADING");
          headingWasContent || $add_2(prevBlock$$0.labels, "BOILERPLATE_HEADING_FUSED");
        } else {
          prevBlock$$0.isContent && (changes$$0 = !0, $setIsContent(prevBlock$$0, !1));
        }
      }
    }
    changed = changes$$0;
  }
  $process_1(textDocument, changed, "HeadingFusion");
  changed = $process_4(($clinit_BlockProximityFusion(), PRE_FILTERING), textDocument);
  $process_1(textDocument, changed, "BlockProximityFusion: Distance 1");
  var this$static$$4 = ($clinit_BoilerplateBlockFilter(), INSTANCE_KEEP_TITLE), hasChanges$$0, it$$0, tb$$3, textBlocks$$2;
  textBlocks$$2 = textDocument.textBlocks;
  hasChanges$$0 = !1;
  for (it$$0 = new AbstractList$IteratorImpl(textBlocks$$2);it$$0.i < it$$0.this$01_0.size_1();) {
    tb$$3 = (checkCriticalElement(it$$0.i < it$$0.this$01_0.size_1()), it$$0.this$01_0.get_1(it$$0.last = it$$0.i++)), tb$$3.isContent || null != this$static$$4.labelToKeep && $contains_2(tb$$3.labels, "de.l3s.boilerpipe/TITLE") || ($remove(it$$0), hasChanges$$0 = !0);
  }
  changed = hasChanges$$0;
  $process_1(textDocument, changed, "BlockFilter");
  changed = $process_4(POST_FILTERING, textDocument);
  $process_1(textDocument, changed, "BlockProximityFusion: Same level content-only");
  var this$static$$5 = ($clinit_KeepLargestBlockFilter(), INSTANCE_EXPAND_TO_SIBLINGS), i$$3, largestBlock, largestBlockIndex, maxNumWords, nw, tb$$4, tb$iterator$$2, tb$iterator0, textBlocks$$3;
  textBlocks$$3 = textDocument.textBlocks;
  if (2 > textBlocks$$3.array.length) {
    changed = !1;
  } else {
    maxNumWords = -1;
    largestBlock = null;
    i$$3 = 0;
    largestBlockIndex = -1;
    for (tb$iterator0 = new AbstractList$IteratorImpl(textBlocks$$3);tb$iterator0.i < tb$iterator0.this$01_0.size_1();) {
      tb$$4 = (checkCriticalElement(tb$iterator0.i < tb$iterator0.this$01_0.size_1()), tb$iterator0.this$01_0.get_1(tb$iterator0.last = tb$iterator0.i++)), tb$$4.isContent && (nw = tb$$4.numWords, nw > maxNumWords && (largestBlock = tb$$4, maxNumWords = nw, largestBlockIndex = i$$3)), ++i$$3;
    }
    for (tb$iterator$$2 = new AbstractList$IteratorImpl(textBlocks$$3);tb$iterator$$2.i < tb$iterator$$2.this$01_0.size_1();) {
      tb$$4 = (checkCriticalElement(tb$iterator$$2.i < tb$iterator$$2.this$01_0.size_1()), tb$iterator$$2.this$01_0.get_1(tb$iterator$$2.last = tb$iterator$$2.i++)), tb$$4 == largestBlock ? ($setIsContent(tb$$4, !0), $add_2(tb$$4.labels, "de.l3s.boilerpipe/VERY_LIKELY_CONTENT")) : ($setIsContent(tb$$4, !1), $add_2(tb$$4.labels, "de.l3s.boilerpipe/MIGHT_BE_CONTENT"));
    }
    if (this$static$$5.expandToSiblings && -1 != largestBlockIndex) {
      var largestBlockIndex$$0 = largestBlockIndex, candidate, candidateFirstTextElement, it$$1, lastTextElement;
      lastTextElement = $getParentElement($getLastNonWhitespaceTextNode_0($get_2(largestBlock.webElements, $get_2(largestBlock.textIndexes, largestBlock.textIndexes.array.length - 1).value_0)));
      for (it$$1 = new AbstractList$ListIteratorImpl(textBlocks$$3, largestBlockIndex$$0 + 1);it$$1.hasNext();) {
        candidate = it$$1.next_0(), candidateFirstTextElement = $getParentElement($getFirstNonWhitespaceTextNode_0($get_2(candidate.webElements, $get_2(candidate.textIndexes, 0).value_0))), $getParentElement(lastTextElement) == $getParentElement(candidateFirstTextElement) && ($setIsContent(candidate, !0), $add_2(candidate.labels, "SIBLING_OF_MAIN_CONTENT"), lastTextElement = $getParentElement($getLastNonWhitespaceTextNode_0($get_2(candidate.webElements, $get_2(candidate.textIndexes, candidate.textIndexes.array.length - 
        1).value_0))));
      }
      var largestBlockIndex$$1 = largestBlockIndex, candidate$$0, candidateLastTextElement, firstTextElement, it$$2;
      firstTextElement = $getParentElement($getFirstNonWhitespaceTextNode_0($get_2(largestBlock.webElements, $get_2(largestBlock.textIndexes, 0).value_0)));
      for (it$$2 = new AbstractList$ListIteratorImpl(textBlocks$$3, largestBlockIndex$$1);0 < it$$2.i;) {
        candidate$$0 = (checkCriticalElement(0 < it$$2.i), $get_2(it$$2.this$01, it$$2.last = --it$$2.i)), candidateLastTextElement = $getParentElement($getLastNonWhitespaceTextNode_0($get_2(candidate$$0.webElements, $get_2(candidate$$0.textIndexes, candidate$$0.textIndexes.array.length - 1).value_0))), $getParentElement(firstTextElement) == $getParentElement(candidateLastTextElement) && ($setIsContent(candidate$$0, !0), $add_2(candidate$$0.labels, "SIBLING_OF_MAIN_CONTENT"), firstTextElement = $getParentElement($getFirstNonWhitespaceTextNode_0($get_2(candidate$$0.webElements, 
        $get_2(candidate$$0.textIndexes, 0).value_0))));
      }
    }
    changed = !0;
  }
  $process_1(textDocument, changed, "Keep Largest Block");
  var changes$$1, contentStart, i$$4, tb$$5, tb$iterator$$3, tb$iterator0$$0, title_0;
  i$$4 = 0;
  contentStart = title_0 = -1;
  for (tb$iterator0$$0 = new AbstractList$IteratorImpl(textDocument.textBlocks);tb$iterator0$$0.i < tb$iterator0$$0.this$01_0.size_1();) {
    tb$$5 = (checkCriticalElement(tb$iterator0$$0.i < tb$iterator0$$0.this$01_0.size_1()), tb$iterator0$$0.this$01_0.get_1(tb$iterator0$$0.last = tb$iterator0$$0.i++)), -1 == contentStart && $contains_2(tb$$5.labels, "de.l3s.boilerpipe/TITLE") && (title_0 = i$$4, contentStart = -1), -1 == contentStart && tb$$5.isContent && (contentStart = i$$4), ++i$$4;
  }
  if (contentStart <= title_0 || -1 == title_0) {
    changed = !1;
  } else {
    changes$$1 = !1;
    for (tb$iterator$$3 = new AbstractList$IteratorImpl(new AbstractList$SubList(textDocument.textBlocks, title_0, contentStart));tb$iterator$$3.i < tb$iterator$$3.this$01_0.size_1();) {
      tb$$5 = (checkCriticalElement(tb$iterator$$3.i < tb$iterator$$3.this$01_0.size_1()), tb$iterator$$3.this$01_0.get_1(tb$iterator$$3.last = tb$iterator$$3.i++)), $contains_2(tb$$5.labels, "de.l3s.boilerpipe/MIGHT_BE_CONTENT") && (changes$$1 |= $setIsContent(tb$$5, !0));
    }
    changed = changes$$1;
  }
  $process_1(textDocument, changed, "Expand Title to Content");
  var changes$$2, tagLevel, tb$$6, tb$iterator$$4, tb$iterator0$$1;
  changes$$2 = !1;
  tagLevel = -1;
  for (tb$iterator0$$1 = new AbstractList$IteratorImpl(textDocument.textBlocks);tb$iterator0$$1.i < tb$iterator0$$1.this$01_0.size_1();) {
    if (tb$$6 = (checkCriticalElement(tb$iterator0$$1.i < tb$iterator0$$1.this$01_0.size_1()), tb$iterator0$$1.this$01_0.get_1(tb$iterator0$$1.last = tb$iterator0$$1.i++)), tb$$6.isContent && $contains_2(tb$$6.labels, "de.l3s.boilerpipe/VERY_LIKELY_CONTENT")) {
      tagLevel = tb$$6.tagLevel;
      break;
    }
  }
  if (-1 == tagLevel) {
    changed = !1;
  } else {
    for (tb$iterator$$4 = new AbstractList$IteratorImpl(textDocument.textBlocks);tb$iterator$$4.i < tb$iterator$$4.this$01_0.size_1();) {
      tb$$6 = (checkCriticalElement(tb$iterator$$4.i < tb$iterator$$4.this$01_0.size_1()), tb$iterator$$4.this$01_0.get_1(tb$iterator$$4.last = tb$iterator$$4.i++)), !tb$$6.isContent && 100 <= tb$$6.numWords && tb$$6.tagLevel == tagLevel && ($setIsContent(tb$$6, !0), changes$$2 = !0);
    }
    changed = changes$$2;
  }
  $process_1(textDocument, changed, "Largest Block Same Tag Level -\x3e Content");
  var changes$$3, tagLevel$$0, tb$$7, tb$iterator$$5;
  changes$$3 = !1;
  tagLevel$$0 = $intern_0;
  for (tb$iterator$$5 = new AbstractList$IteratorImpl(textDocument.textBlocks);tb$iterator$$5.i < tb$iterator$$5.this$01_0.size_1();) {
    tb$$7 = (checkCriticalElement(tb$iterator$$5.i < tb$iterator$$5.this$01_0.size_1()), tb$iterator$$5.this$01_0.get_1(tb$iterator$$5.last = tb$iterator$$5.i++)), tb$$7.isContent && $contains_2(tb$$7.labels, "de.l3s.boilerpipe/VERY_LIKELY_CONTENT") ? tagLevel$$0 = tb$$7.tagLevel : tb$$7.tagLevel > tagLevel$$0 && $contains_2(tb$$7.labels, "de.l3s.boilerpipe/MIGHT_BE_CONTENT") && $contains_2(tb$$7.labels, "de.l3s.boilerpipe/LI") && 0 == tb$$7.linkDensity ? ($setIsContent(tb$$7, !0), changes$$3 = !0) : 
    tagLevel$$0 = $intern_0;
  }
  changed = changes$$3;
  $process_1(textDocument, changed, "List at end filter");
  var JSCompiler_temp_const = contentExtractor.mStatisticsInfo, JSCompiler_inline_result$$1, numWords, tb$$8, tb$iterator$$6;
  numWords = 0;
  for (tb$iterator$$6 = new AbstractList$IteratorImpl(textDocument.textBlocks);tb$iterator$$6.i < tb$iterator$$6.this$01_0.size_1();) {
    tb$$8 = (checkCriticalElement(tb$iterator$$6.i < tb$iterator$$6.this$01_0.size_1()), tb$iterator$$6.this$01_0.get_1(tb$iterator$$6.last = tb$iterator$$6.i++)), tb$$8.isContent && (numWords += tb$$8.numWords);
  }
  JSCompiler_inline_result$$1 = numWords;
  if (void 0 == JSCompiler_inline_result$$1) {
    throw new TypeError;
  }
  JSCompiler_temp_const[1] = JSCompiler_inline_result$$1;
  var tb$$9, tb$iterator$$7;
  for (tb$iterator$$7 = new AbstractList$IteratorImpl(textDocument.textBlocks);tb$iterator$$7.i < tb$iterator$$7.this$01_0.size_1();) {
    var this$static$$6 = tb$$9 = (checkCriticalElement(tb$iterator$$7.i < tb$iterator$$7.this$01_0.size_1()), tb$iterator$$7.this$01_0.get_1(tb$iterator$$7.last = tb$iterator$$7.i++)), i$$5 = void 0, i$iterator = void 0, wt = void 0;
    if (this$static$$6.isContent) {
      for (i$iterator = new AbstractList$IteratorImpl(this$static$$6.textIndexes);i$iterator.i < i$iterator.this$01_0.size_1();) {
        i$$5 = (checkCriticalElement(i$iterator.i < i$iterator.this$01_0.size_1()), i$iterator.this$01_0.get_1(i$iterator.last = i$iterator.i++)), wt = $get_2(this$static$$6.webElements, i$$5.value_0), wt.isContent = !0, $contains_2(this$static$$6.labels, "de.l3s.boilerpipe/TITLE") && $add_2(wt.labels, "de.l3s.boilerpipe/TITLE");
      }
    }
  }
  var e, e$iterator, inContent;
  inContent = !1;
  for (e$iterator = new AbstractList$IteratorImpl(documentInfo.document_0.elements);e$iterator.i < e$iterator.this$01_0.size_1();) {
    e = (checkCriticalElement(e$iterator.i < e$iterator.this$01_0.size_1()), e$iterator.this$01_0.get_1(e$iterator.last = e$iterator.i++)), e.isContent ? inContent = !0 : instanceOf(e, 35) ? inContent = !1 : inContent && (e.isContent = !0);
  }
  var w = documentInfo.document_0, candidates, e$$0, e$iterator$$0, e$iterator0, firstContent, isWebImage, lastContent;
  candidates = new ArrayList;
  lastContent = firstContent = null;
  for (e$iterator0 = new AbstractList$IteratorImpl(w.elements);e$iterator0.i < e$iterator0.this$01_0.size_1();) {
    e$$0 = (checkCriticalElement(e$iterator0.i < e$iterator0.this$01_0.size_1()), e$iterator0.this$01_0.get_1(e$iterator0.last = e$iterator0.i++)), instanceOf(e$$0, 35) && e$$0.isContent && (!firstContent && (firstContent = e$$0), lastContent = e$$0);
  }
  if (lastContent) {
    for (e$iterator$$0 = new AbstractList$IteratorImpl(w.elements);e$iterator$$0.i < e$iterator$$0.this$01_0.size_1() && !(e$$0 = (checkCriticalElement(e$iterator$$0.i < e$iterator$$0.this$01_0.size_1()), e$iterator$$0.this$01_0.get_1(e$iterator$$0.last = e$iterator$$0.i++)), (isWebImage = instanceOf(e$$0, 32)) && e$$0.isContent || e$$0 == lastContent);) {
      isWebImage && $add_0(candidates, e$$0);
    }
    var bestImage, bestScore, contentElement, curScore, heuristics, i$$6, i$iterator$$0, heuristics_0;
    if (0 != candidates.array.length) {
      contentElement = null;
      firstContent && (contentElement = $get_2(firstContent.allTextNodes, firstContent.firstWordNode));
      heuristics = (heuristics_0 = new ArrayList, $add_0(heuristics_0, new AreaScorer), $add_0(heuristics_0, new DimensionsRatioScorer), $add_0(heuristics_0, new DomDistanceScorer(contentElement)), $add_0(heuristics_0, new HasFigureScorer), heuristics_0);
      bestImage = null;
      bestScore = 0;
      for (i$iterator$$0 = new AbstractList$IteratorImpl(candidates);i$iterator$$0.i < i$iterator$$0.this$01_0.size_1();) {
        i$$6 = (checkCriticalElement(i$iterator$$0.i < i$iterator$$0.this$01_0.size_1()), i$iterator$$0.this$01_0.get_1(i$iterator$$0.last = i$iterator$$0.i++));
        var e$$1 = void 0, ir = void 0, ir$iterator = void 0, score = void 0;
        if (i$$6) {
          score = 0;
          e$$1 = i$$6.imgElement;
          for (ir$iterator = new AbstractList$IteratorImpl(heuristics);ir$iterator.i < ir$iterator.this$01_0.size_1();) {
            ir = (checkCriticalElement(ir$iterator.i < ir$iterator.this$01_0.size_1()), ir$iterator.this$01_0.get_1(ir$iterator.last = ir$iterator.i++)), score += ir.getImageScore(e$$1);
          }
          2 > sDebugLevel || (e$$1 ? logToConsole("FINAL SCORE: " + score + " : " + $getAttribute(e$$1, "src")) : logToConsole("Null image attempting to be scored!"));
          curScore = score;
        } else {
          curScore = 0;
        }
        26 <= curScore && (!bestImage || bestScore < curScore) && (bestImage = i$$6, bestScore = curScore);
      }
      bestImage && (bestImage.isContent = !0);
    }
  }
  var document_0$$0 = documentInfo.document_0, e$$2, e$iterator$$1, isContent$$0, stack_0, stackMark, startWebTag, wasContent, webTag;
  isContent$$0 = !1;
  stackMark = -1;
  stack_0 = new Stack;
  for (e$iterator$$1 = new AbstractList$IteratorImpl(document_0$$0.elements);e$iterator$$1.i < e$iterator$$1.this$01_0.size_1();) {
    e$$2 = (checkCriticalElement(e$iterator$$1.i < e$iterator$$1.this$01_0.size_1()), e$iterator$$1.this$01_0.get_1(e$iterator$$1.last = e$iterator$$1.i++)), instanceOf(e$$2, 51) ? (webTag = e$$2, webTag.tagType == ($clinit_WebTag$TagType(), START) ? (webTag.isContent = isContent$$0, $add_0(stack_0.arrayList, webTag), isContent$$0 = !1) : (startWebTag = $pop(stack_0), (isContent$$0 |= stackMark >= stack_0.arrayList.array.length) && (stackMark = stack_0.arrayList.array.length - 1), wasContent = startWebTag.isContent, 
    startWebTag.isContent = isContent$$0, webTag.isContent = isContent$$0, isContent$$0 = wasContent)) : isContent$$0 || (isContent$$0 = e$$2.isContent);
  }
  var val$$1 = getTime() - now_0;
  if (void 0 == val$$1) {
    throw new TypeError;
  }
  contentExtractor.mTimingInfo[3] = val$$1;
  now_0 = getTime();
  var e$$3, e$iterator$$2, output;
  output = new StringBuilder;
  for (e$iterator$$2 = new AbstractList$IteratorImpl(documentInfo.document_0.elements);e$iterator$$2.i < e$iterator$$2.this$01_0.size_1();) {
    if (e$$3 = (checkCriticalElement(e$iterator$$2.i < e$iterator$$2.this$01_0.size_1()), e$iterator$$2.this$01_0.get_1(e$iterator$$2.last = e$iterator$$2.i++)), e$$3.isContent) {
      var x_0 = e$$3.generateOutput(textOnly);
      output.string += x_0;
      textOnly && (output.string += "\n");
    }
  }
  html = output.string;
  var val$$2 = getTime() - now_0;
  if (void 0 == val$$2) {
    throw new TypeError;
  }
  contentExtractor.mTimingInfo[4] = val$$2;
  var this$static$$7 = documentInfo.document_0, e$$4, e$iterator$$3, images, list;
  images = new ArrayList;
  for (e$iterator$$3 = new AbstractList$IteratorImpl(this$static$$7.elements);e$iterator$$3.i < e$iterator$$3.this$01_0.size_1();) {
    if (e$$4 = (checkCriticalElement(e$iterator$$3.i < e$iterator$$3.this$01_0.size_1()), e$iterator$$3.this$01_0.get_1(e$iterator$$3.last = e$iterator$$3.i++)), e$$4.isContent) {
      if (instanceOf(e$$4, 32)) {
        $addAll_0(images, (!e$$4.clonedImg && $cloneAndProcessNode(e$$4), list = new ArrayList, !e$$4.srcUrl.length || $add_0(list, e$$4.srcUrl), $addAll_0(list, getAllSrcSetUrls(e$$4.clonedImg)), list));
      } else {
        if (instanceOf(e$$4, 69)) {
          var JSCompiler_temp_const$$0 = images, this$static$$8 = e$$4, i$$7 = void 0, ie = void 0, imgUrls = void 0, imgs = void 0;
          !this$static$$8.cloned && (this$static$$8.cloned = ($clinit_DomUtil(), cloneAndProcessList(getOutputNodes(this$static$$8.tableElement))));
          imgUrls = new ArrayList;
          imgs = querySelectorAll(this$static$$8.cloned, "IMG, SOURCE");
          for (i$$7 = 0;i$$7 < imgs.length;i$$7++) {
            ie = imgs[i$$7], !ie.src.length || $add_0(imgUrls, ie.src), $addAll_0(imgUrls, getAllSrcSetUrls(ie));
          }
          $addAll_0(JSCompiler_temp_const$$0, imgUrls);
        }
      }
    }
  }
  contentExtractor.imageUrls = images;
  if (4 <= sDebugLevel) {
    for (i = 0;i < contentExtractor.mTimingInfo[6].length;i++) {
      var this$static$$9 = contentExtractor.mTimingInfo;
      if (i >= this$static$$9[6].length) {
        throw new RangeError;
      }
      entry = this$static$$9[6][i];
      if (void 0 === entry[1]) {
        throw new TypeError;
      }
      var JSCompiler_temp_const$$1 = "Timing: " + entry[1] + " \x3d ";
      if (void 0 === entry[2]) {
        throw new TypeError;
      }
      logToConsole(JSCompiler_temp_const$$1 + entry[2]);
    }
    var this$static$$10 = contentExtractor.mTimingInfo;
    if (void 0 === this$static$$10[1]) {
      throw new TypeError;
    }
    var JSCompiler_temp_const$$2 = "Timing: MarkupParsingTime \x3d " + this$static$$10[1] + "\nTiming: DocumentConstructionTime \x3d ", this$static$$11 = contentExtractor.mTimingInfo;
    if (void 0 === this$static$$11[2]) {
      throw new TypeError;
    }
    var JSCompiler_temp_const$$3 = JSCompiler_temp_const$$2 + this$static$$11[2] + "\nTiming: ArticleProcessingTime \x3d ", this$static$$12 = contentExtractor.mTimingInfo;
    if (void 0 === this$static$$12[3]) {
      throw new TypeError;
    }
    var JSCompiler_temp_const$$4 = JSCompiler_temp_const$$3 + this$static$$12[3] + "\nTiming: FormattingTime \x3d ", this$static$$13 = contentExtractor.mTimingInfo;
    if (void 0 === this$static$$13[4]) {
      throw new TypeError;
    }
    logToConsole(JSCompiler_temp_const$$4 + this$static$$13[4]);
  }
  if (void 0 == html) {
    throw new TypeError;
  }
  content_0[1] = html;
  if (void 0 == content_0) {
    throw new TypeError;
  }
  result[2] = content_0;
  var val$$3 = ((null == contentExtractor.textDirection || !contentExtractor.textDirection.length) && (contentExtractor.textDirection = "auto"), contentExtractor.textDirection);
  if (void 0 == val$$3) {
    throw new TypeError;
  }
  result[9] = val$$3;
  for (url$iterator = new AbstractList$IteratorImpl(contentExtractor.imageUrls);url$iterator.i < url$iterator.this$01_0.size_1();) {
    url_0 = (checkCriticalElement(url$iterator.i < url$iterator.this$01_0.size_1()), url$iterator.this$01_0.get_1(url$iterator.last = url$iterator.i++));
    var this$static$$14 = (res = {}, result[10].push(res), res);
    if (void 0 == url_0) {
      throw new TypeError;
    }
    this$static$$14[1] = url_0;
  }
  var JSCompiler_temp$$1;
  if (void 0 != options[3]) {
    if (void 0 === options[3]) {
      throw new TypeError;
    }
    JSCompiler_temp$$1 = options[3];
  } else {
    JSCompiler_temp$$1 = $doc.URL;
  }
  originalUrl = JSCompiler_temp$$1;
  timingInfo = contentExtractor.mTimingInfo;
  stPaging = getTime();
  var JSCompiler_temp$$2;
  if (void 0 != options[4]) {
    if (void 0 === options[4]) {
      throw new TypeError;
    }
    JSCompiler_temp$$2 = options[4];
  } else {
    JSCompiler_temp$$2 = "next";
  }
  if ("pagenum" === JSCompiler_temp$$2) {
    $clinit_PageParameterParser();
    parser = new PageParameterParser(timingInfo);
    var JSCompiler_inline_result$$2;
    var root$$0 = $doc.documentElement, allLinks, baseAnchor, idx, info$$1, link_0, pageInfoAndText, startTime$$0;
    startTime$$0 = getTime();
    parser.mDocUrl = originalUrl.replace(sHrefCleaner, "");
    parser.mParsedUrl = create_0(parser.mDocUrl);
    if (parser.mParsedUrl) {
      baseAnchor = createAnchorWithBase(getBaseUrlForRelative(root$$0, originalUrl));
      allLinks = root$$0.getElementsByTagName("A");
      for (idx = 0;idx < allLinks.length;) {
        link_0 = allLinks[idx], (pageInfoAndText = $getPageInfoAndText(parser, link_0, baseAnchor)) ? ($addGroup(parser.mAdjacentNumbersGroups), $findAndAddClosestValidLeafNodes(parser, link_0, !1, !0, null), $addPageInfo(parser.mAdjacentNumbersGroups, pageInfoAndText.mPageInfo), parser.mNumForwardLinksProcessed = 0, $findAndAddClosestValidLeafNodes(parser, link_0, !1, !1, baseAnchor), idx += 1 + parser.mNumForwardLinksProcessed) : ++idx;
      }
      var this$static$$15 = parser.mAdjacentNumbersGroups;
      0 != this$static$$15.mGroups.array.length && 0 == $get_2(this$static$$15.mGroups, this$static$$15.mGroups.array.length - 1).mList.array.length && this$static$$15.mGroups.remove(this$static$$15.mGroups.array.length - 1);
      addTimingInfo(startTime$$0, parser.mTimingInfo, "PageParameterParser");
      startTime$$0 = getTime();
      var adjacentNumbersGroups = parser.mAdjacentNumbersGroups, docUrl = parser.mDocUrl, bestPageParamInfo, detectionState, group, group$iterator, parsedDocUrl, state;
      if (parsedDocUrl = create_0(docUrl)) {
        parsedDocUrl.mUrl.username = "";
        parsedDocUrl.mUrl.password = "";
        detectionState = new PageParameterDetector$DetectionState;
        for (group$iterator = new AbstractList$IteratorImpl(adjacentNumbersGroups.mGroups);group$iterator.i < group$iterator.this$01_0.size_1();) {
          if (group = (checkCriticalElement(group$iterator.i < group$iterator.this$01_0.size_1()), group$iterator.this$01_0.get_1(group$iterator.last = group$iterator.i++)), !(2 > group.mList.array.length)) {
            for (var monotonicNumbers = group.mList, isDescending = 0 > group.mDeltaSign, parsedDocUrl$$0 = parsedDocUrl, acceptedPagePattern = detectionState.mBestPageParamInfo ? detectionState.mBestPageParamInfo.mPagePattern : "", outlinks = void 0, pageInfo = void 0, pageInfo$iterator = void 0, outlinks = 0, pageInfo$iterator = new AbstractList$IteratorImpl(monotonicNumbers);pageInfo$iterator.i < pageInfo$iterator.this$01_0.size_1();) {
              pageInfo = (checkCriticalElement(pageInfo$iterator.i < pageInfo$iterator.this$01_0.size_1()), pageInfo$iterator.this$01_0.get_1(pageInfo$iterator.last = pageInfo$iterator.i++)), !pageInfo.mUrl.length || ++outlinks;
            }
            if (0 == outlinks) {
              state = null;
            } else {
              if (isDescending) {
                for (var l = monotonicNumbers, iBack = void 0, iFront = void 0, t = void 0, iFront = 0, iBack = l.array.length - 1;iFront < iBack;++iFront, --iBack) {
                  t = (checkElementIndex(iFront, l.array.length), l.array[iFront]), $set(l, iFront, (checkElementIndex(iBack, l.array.length), l.array[iBack])), $set(l, iBack, t);
                }
              }
              2 == monotonicNumbers.array.length && 1 == outlinks && 1 == (checkElementIndex(0, monotonicNumbers.array.length), monotonicNumbers.array[0]).mPageNum && 2 == (checkElementIndex(1, monotonicNumbers.array.length), monotonicNumbers.array[1]).mPageNum && ($isEmpty((checkElementIndex(0, monotonicNumbers.array.length), monotonicNumbers.array[0]).mUrl) ? $set(monotonicNumbers, 0, new PageParamInfo$PageInfo(1, toStringSimple(parsedDocUrl$$0.mUrl))) : $set(monotonicNumbers, 1, new PageParamInfo$PageInfo(2, 
              toStringSimple(parsedDocUrl$$0.mUrl))), ++outlinks);
              var JSCompiler_temp$$3;
              if (2 <= outlinks) {
                for (var ascendingNumbers = monotonicNumbers, parsedDocUrl$$1 = parsedDocUrl$$0, acceptedPagePattern$$0 = acceptedPagePattern, docUrl$$0 = void 0, entry$$0 = void 0, entry$iterator = void 0, firstPage = void 0, firstPageUrl = void 0, i$$8 = void 0, i0 = void 0, info$$2 = void 0, page = void 0, pageCandidates = void 0, pageParamInfo = void 0, parsedUrls = void 0, patternStr = void 0, state$$0 = void 0, url_0$$0 = void 0, page$$0 = void 0, page$iterator = void 0, possibleDateNum = void 0, 
                possibleDateNum = 0, page$iterator = new AbstractList$IteratorImpl(ascendingNumbers);page$iterator.i < page$iterator.this$01_0.size_1();) {
                  page$$0 = (checkCriticalElement(page$iterator.i < page$iterator.this$01_0.size_1()), page$iterator.this$01_0.get_1(page$iterator.last = page$iterator.i++)), page$$0.mPageNum == possibleDateNum + 1 && ++possibleDateNum;
                }
                if (28 <= possibleDateNum && 31 >= possibleDateNum) {
                  JSCompiler_temp$$3 = null;
                } else {
                  firstPageUrl = "";
                  pageCandidates = new PageParameterDetector$PageCandidatesMap;
                  parsedUrls = initDim(Lorg_chromium_distiller_ParsedUrl_2_classLit, $intern_3, 70, ascendingNumbers.array.length, 0);
                  for (i0 = 0;i0 < ascendingNumbers.array.length;i0++) {
                    if (page = (checkElementIndex(i0, ascendingNumbers.array.length), ascendingNumbers.array[i0]), page.mUrl.length && (url_0$$0 = create_0(page.mUrl), parsedUrls[i0] = url_0$$0)) {
                      url_0$$0.mUrl.username = "";
                      url_0$$0.mUrl.password = "";
                      var url_0$$1 = url_0$$0, pageNum = page.mPageNum, posInAscendingNumbers = i0, pageCandidates$$0 = pageCandidates, i$$9 = void 0, nameValue = void 0, pattern = void 0, queryParams = void 0, this$static$$16 = url_0$$1, components = void 0, i$$10 = void 0, keyValuePair = void 0, query = void 0;
                      if (null == this$static$$16.mQueryParams) {
                        if (query = this$static$$16.mUrl.search, query.length) {
                          for (components = ($clinit_StringUtil(), $split(query.substr(1, query.length - 1), "\\\x26")), this$static$$16.mQueryParams = initDims([components.length, 2]), i$$10 = 0;i$$10 < components.length;i$$10++) {
                            keyValuePair = $split(components[i$$10], "\x3d"), this$static$$16.mQueryParams[i$$10][0] = keyValuePair[0], this$static$$16.mQueryParams[i$$10][1] = 1 < keyValuePair.length ? keyValuePair[1] : "";
                          }
                        } else {
                          this$static$$16.mQueryParams = initDims([0, 2]);
                        }
                      }
                      queryParams = this$static$$16.mQueryParams;
                      if (0 != queryParams.length) {
                        for (i$$9 = 0;i$$9 < queryParams.length;i$$9++) {
                          nameValue = queryParams[i$$9];
                          try {
                            pattern = new QueryParamPagePattern(url_0$$1, 0 == i$$9, nameValue[0], nameValue[1]);
                          } catch ($e0) {
                            if ($e0 = wrap($e0), instanceOf($e0, 23)) {
                              pattern = null;
                            } else {
                              throw unwrap($e0);
                            }
                          }
                          pattern && $add_4(pageCandidates$$0, pattern, new PageLinkInfo(pageNum, pattern.mPageNumber, posInAscendingNumbers));
                        }
                      }
                      1 == page.mPageNum && (firstPageUrl = page.mUrl);
                    }
                  }
                  if (0 == pageCandidates.map_0.size_0) {
                    for (i$$8 = 0;i$$8 < ascendingNumbers.array.length;i$$8++) {
                      if (page = (checkElementIndex(i$$8, ascendingNumbers.array.length), ascendingNumbers.array[i$$8]), parsedUrls[i$$8]) {
                        var url_0$$2 = parsedUrls[i$$8], pageNum$$0 = page.mPageNum, posInAscendingNumbers$$0 = i$$8, pageCandidates$$1 = pageCandidates, match_0 = void 0, matchEnd = void 0, matchStart = void 0, path = void 0, pathStart = void 0, pattern$$0 = void 0, urlStr = void 0, path = (null == url_0$$2.mTrimmedPath && (url_0$$2.mTrimmedPath = $getTrimmedPath_0(url_0$$2.mUrl)), url_0$$2.mTrimmedPath);
                        if (path.length && containsDigit(path)) {
                          for (urlStr = toStringSimple(url_0$$2.mUrl), pathStart = url_0$$2.mUrl.origin.length, !sDigitsRegExp && (sDigitsRegExp = RegExp("(\\d+)", "gi")), sDigitsRegExp.lastIndex = pathStart;;) {
                            match_0 = sDigitsRegExp.exec(urlStr);
                            if (!match_0) {
                              break;
                            }
                            matchEnd = sDigitsRegExp.lastIndex;
                            matchStart = matchEnd - match_0[1].length;
                            try {
                              pattern$$0 = new PathComponentPagePattern(url_0$$2, pathStart, matchStart, matchEnd);
                            } catch ($e0$$0) {
                              if ($e0$$0 = wrap($e0$$0), instanceOf($e0$$0, 23)) {
                                pattern$$0 = null;
                              } else {
                                throw unwrap($e0$$0);
                              }
                            }
                            pattern$$0 && $add_4(pageCandidates$$1, pattern$$0, new PageLinkInfo(pageNum$$0, pattern$$0.mPageNumber, posInAscendingNumbers$$0));
                          }
                        }
                      }
                    }
                  }
                  state$$0 = new PageParameterDetector$DetectionState;
                  for (entry$iterator = new AbstractHashMap$EntrySetIterator((new AbstractHashMap$EntrySet(pageCandidates.map_0)).this$01);$hasNext(entry$iterator);) {
                    if (entry$iterator._gwt_modCount != entry$iterator.this$01._gwt_modCount) {
                      throw new ConcurrentModificationException;
                    }
                    entry$$0 = (checkCriticalElement($hasNext(entry$iterator)), entry$iterator.current.next_0());
                    patternStr = entry$$0.getKey();
                    info$$2 = entry$$0.getValue();
                    if (!(patternStr === acceptedPagePattern$$0 || 100 < info$$2.mLinks.array.length) && info$$2.mPattern.isValidFor(parsedDocUrl$$1)) {
                      e: {
                        var pagePattern = info$$2.mPattern, allLinkInfo = info$$2.mLinks, ascendingNumbers$$0 = ascendingNumbers, firstPageUrl$$0 = firstPageUrl, allPageInfo = void 0, coefficient = void 0, delta = void 0, linearFormula = void 0, link_0$$0 = void 0, link$iterator = void 0, onlyLink = void 0, secondPageIsOutlink = void 0, state$$1 = void 0, thirdPageIsOutlink = void 0;
                        if (2 <= allLinkInfo.array.length) {
                          if (state$$1 = getPageNumbersState(allLinkInfo, ascendingNumbers$$0), state$$1.mIsAdjacent && state$$1.mIsConsecutive && isPageNumberSequence(ascendingNumbers$$0, state$$1)) {
                            linearFormula = getLinearFormula(allLinkInfo);
                            allPageInfo = new ArrayList;
                            for (link$iterator = new AbstractList$IteratorImpl(allLinkInfo);link$iterator.i < link$iterator.this$01_0.size_1();) {
                              link_0$$0 = (checkCriticalElement(link$iterator.i < link$iterator.this$01_0.size_1()), link$iterator.this$01_0.get_1(link$iterator.last = link$iterator.i++)), $add_0(allPageInfo, new PageParamInfo$PageInfo(link_0$$0.mPageNum, $get_2(ascendingNumbers$$0, link_0$$0.mPosInAscendingList).mUrl));
                            }
                            pageParamInfo = new PageParamInfo_0(($clinit_PageParamInfo$Type(), PAGE_NUMBER), pagePattern.toString$(), allPageInfo, linearFormula, state$$1.mNextPagingUrl);
                          } else {
                            pageParamInfo = null;
                          }
                        } else {
                          if (1 == allLinkInfo.array.length && firstPageUrl$$0.length && (onlyLink = (checkElementIndex(0, allLinkInfo.array.length), allLinkInfo.array[0]), secondPageIsOutlink = 2 == onlyLink.mPageNum && 1 == onlyLink.mPosInAscendingList, thirdPageIsOutlink = 3 == onlyLink.mPageNum && 2 == onlyLink.mPosInAscendingList && 2 == (checkElementIndex(1, ascendingNumbers$$0.array.length), ascendingNumbers$$0.array[1]).mPageNum, 1 == (checkElementIndex(0, ascendingNumbers$$0.array.length), 
                          ascendingNumbers$$0.array[0]).mPageNum && (secondPageIsOutlink || thirdPageIsOutlink) && pagePattern.isPagingUrl(firstPageUrl$$0))) {
                            delta = onlyLink.mPageParamValue - onlyLink.mPageNum;
                            0 == delta || 1 == delta ? coefficient = 1 : (coefficient = onlyLink.mPageParamValue, delta = 0);
                            allPageInfo = new ArrayList;
                            $add_0(allPageInfo, new PageParamInfo$PageInfo(1, firstPageUrl$$0));
                            $add_0(allPageInfo, new PageParamInfo$PageInfo(onlyLink.mPageNum, $get_2(ascendingNumbers$$0, onlyLink.mPosInAscendingList).mUrl));
                            pageParamInfo = new PageParamInfo_0(($clinit_PageParamInfo$Type(), PAGE_NUMBER), pagePattern.toString$(), allPageInfo, new PageParamInfo$LinearFormula(coefficient, delta), thirdPageIsOutlink ? (checkElementIndex(1, allPageInfo.array.length), allPageInfo.array[1]).mUrl : "");
                            break e;
                          }
                          pageParamInfo = null;
                        }
                      }
                      if (pageParamInfo) {
                        var docUrl$$0 = (!sHrefCleaner_0 && (sHrefCleaner_0 = /\/$/), parsedDocUrl$$1.mUrl.href.replace(sHrefCleaner_0, "")), JSCompiler_inline_result$$3;
                        e: {
                          var this$static$$17 = pageParamInfo, docUrl$$1 = docUrl$$0, ascendingNumbers$$1 = ascendingNumbers, i$$11 = void 0, link_0$$1 = void 0, link$iterator$$0 = void 0;
                          if (2 > this$static$$17.mAllPageInfo.array.length || 1 == $get_2(this$static$$17.mAllPageInfo, 0).mPageNum || docUrl$$1.length >= $get_2(this$static$$17.mAllPageInfo, 0).mUrl.length) {
                            JSCompiler_inline_result$$3 = !1;
                          } else {
                            for (i$$11 = 0;i$$11 < this$static$$17.mAllPageInfo.array.length;i$$11++) {
                              var JSCompiler_temp$$4;
                              (JSCompiler_temp$$4 = $get_2(this$static$$17.mAllPageInfo, i$$11).mPageNum != i$$11 + 2) || (JSCompiler_temp$$4 = $get_2(this$static$$17.mAllPageInfo, i$$11).mUrl === docUrl$$1);
                              if (JSCompiler_temp$$4) {
                                JSCompiler_inline_result$$3 = !1;
                                break e;
                              }
                            }
                            for (link$iterator$$0 = new AbstractList$IteratorImpl(ascendingNumbers$$1);link$iterator$$0.i < link$iterator$$0.this$01_0.size_1();) {
                              if (link_0$$1 = (checkCriticalElement(link$iterator$$0.i < link$iterator$$0.this$01_0.size_1()), link$iterator$$0.this$01_0.get_1(link$iterator$$0.last = link$iterator$$0.i++)), 1 == link_0$$1.mPageNum && link_0$$1.mUrl.length && link_0$$1.mUrl !== docUrl$$1) {
                                JSCompiler_inline_result$$3 = !1;
                                break e;
                              }
                            }
                            JSCompiler_inline_result$$3 = !0;
                          }
                        }
                        JSCompiler_inline_result$$3 ? $add(pageParamInfo.mAllPageInfo, 0, new PageParamInfo$PageInfo(1, docUrl$$0)) : info$$2.mPattern.isPagingUrl(docUrl$$0) && (firstPage = $get_2(pageParamInfo.mAllPageInfo, 0), 2 == firstPage.mPageNum && firstPage.mUrl !== docUrl$$0 && docUrl$$0.length < firstPage.mUrl.length && $add(pageParamInfo.mAllPageInfo, 0, new PageParamInfo$PageInfo(1, docUrl$$0)));
                        $compareAndUpdate(state$$0, new PageParameterDetector$DetectionState_0(pageParamInfo));
                      }
                    }
                  }
                  JSCompiler_temp$$3 = state$$0.mBestPageParamInfo ? state$$0 : null;
                }
              } else {
                JSCompiler_temp$$3 = null;
              }
              state = JSCompiler_temp$$3;
            }
            state && $compareAndUpdate(detectionState, state);
          }
        }
        if (detectionState.mBestPageParamInfo) {
          detectionState.mMultiPagePatterns && 3 <= sDebugLevel && logToConsole("Detected multiple page patterns");
          bestPageParamInfo = detectionState.mBestPageParamInfo;
          var hasDocUrl, page$$1, page$iterator$$0;
          if (!bestPageParamInfo.mNextPagingUrl.length && 0 != bestPageParamInfo.mAllPageInfo.array.length) {
            for (hasDocUrl = !1, page$iterator$$0 = new AbstractList$IteratorImpl(bestPageParamInfo.mAllPageInfo);page$iterator$$0.i < page$iterator$$0.this$01_0.size_1();) {
              page$$1 = (checkCriticalElement(page$iterator$$0.i < page$iterator$$0.this$01_0.size_1()), page$iterator$$0.this$01_0.get_1(page$iterator$$0.last = page$iterator$$0.i++));
              if (hasDocUrl) {
                bestPageParamInfo.mNextPagingUrl = page$$1.mUrl;
                break;
              }
              page$$1.mUrl === docUrl && (hasDocUrl = !0);
            }
          }
          info$$1 = bestPageParamInfo;
        } else {
          info$$1 = new PageParamInfo;
        }
      } else {
        info$$1 = new PageParamInfo;
      }
      addTimingInfo(startTime$$0, parser.mTimingInfo, "PageParameterDetector");
      JSCompiler_inline_result$$2 = info$$1;
    } else {
      JSCompiler_inline_result$$2 = new PageParamInfo;
    }
    paramInfo = JSCompiler_inline_result$$2;
    info = {};
    next = paramInfo.mNextPagingUrl;
    if (next.length) {
      if (void 0 == next) {
        throw new TypeError;
      }
      info[1] = next;
    }
    if (void 0 == info) {
      throw new TypeError;
    }
    result[3] = info;
    3 <= sDebugLevel && logToConsole("paging by pagenum: " + $toString_1(paramInfo));
  } else {
    3 <= sDebugLevel && logToConsole("paging by next");
    $clinit_PagingLinksFinder();
    info_0 = {};
    var root$$1 = $doc.documentElement, allLinks$$0, allowedPrefix, bannedUrls, baseAnchor$$0, diff, folderUrl, height, i$$12, link_0$$2, linkData, linkHref, linkHrefRemaining, linkObj, linkText, linkTextAsNumber, negativeMatch, pageObj, pageObj$iterator, pagingHref, parent_0, parentClassAndId, positiveMatch, possiblePages, regPrefixNum, topPage, width_0, wndLocationHref, linkHref_0;
    3 <= sDebugLevel && $reset(mLinkDebugInfo);
    folderUrl = ($clinit_StringUtil(), originalUrl.replace(RegExp("\\/[^/]*$", "gi"), ""));
    wndLocationHref = originalUrl.replace(RegExp("\\/$", "gi"), "");
    allLinks$$0 = root$$1.getElementsByTagName("A");
    possiblePages = new HashSet;
    bannedUrls = new HashSet;
    baseAnchor$$0 = createAnchorWithBase(getBaseUrlForRelative(root$$1, originalUrl));
    var JSCompiler_temp_const$$5 = $split(originalUrl, ":\\/\\/")[0] + "://", JSCompiler_inline_result$$4, url_0$$3 = originalUrl, url_0$$3 = ($clinit_StringUtil(), $split(url_0$$3, ":\\/\\/"))[1];
    JSCompiler_inline_result$$4 = -1 == url_0$$3.indexOf("/") ? url_0$$3 : $split(url_0$$3, "\\/")[0];
    allowedPrefix = JSCompiler_temp_const$$5 + JSCompiler_inline_result$$4 + "/";
    var pattern$$1 = "^" + allowedPrefix.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$\x26") + ".*\\d";
    regPrefixNum = RegExp(pattern$$1, "i");
    for (i$$12 = 0;i$$12 < allLinks$$0.length;i$$12++) {
      if (link_0$$2 = allLinks$$0[i$$12], linkHref_0 = $getAttribute(link_0$$2, "href"), baseAnchor$$0.setAttribute("href", linkHref_0), linkHref = baseAnchor$$0.href, regPrefixNum.test(linkHref)) {
        if (width_0 = (link_0$$2.offsetWidth || 0) | 0, height = (link_0$$2.offsetHeight || 0) | 0, 0 == width_0 || 0 == height) {
          appendDbgStrForLink(link_0$$2, "ignored: sz\x3d" + width_0 + "x" + height);
        } else {
          if (isVisible(link_0$$2)) {
            if (linkHref = linkHref.replace(REG_HREF_CLEANER, ""), appendDbgStrForLink(link_0$$2, "-\x3e " + linkHref), $equalsIgnoreCase(linkHref, wndLocationHref) || $equalsIgnoreCase(linkHref, folderUrl)) {
              appendDbgStrForLink(link_0$$2, "ignored: same as current or folder url " + folderUrl);
            } else {
              if (linkText = getInnerText(link_0$$2), 25 < linkText.length) {
                appendDbgStrForLink(link_0$$2, "ignored: link text too long");
              } else {
                if (REG_EXTRANEOUS.test(linkText)) {
                  appendDbgStrForLink(link_0$$2, "ignored: one of extra"), $add_2(bannedUrls, linkHref);
                } else {
                  if (linkHrefRemaining = linkHref, linkHref.substr(0, folderUrl.length) === folderUrl && (linkHrefRemaining = $substring(linkHref, folderUrl.length)), REG_NUMBER.test(linkHrefRemaining)) {
                    linkObj = new PagingLinksFinder$PagingLinkObj(i$$12, linkText, linkHref);
                    $add_2(possiblePages, linkObj);
                    0 != linkHref.indexOf(folderUrl) && (linkObj.mScore -= 25, appendDbgStrForLink(link_0$$2, "score\x3d" + linkObj.mScore + ": not part of folder url " + folderUrl));
                    linkData = linkText + " " + $getAttribute(link_0$$2, "class") + " " + link_0$$2.id;
                    appendDbgStrForLink(link_0$$2, "txt+class+id\x3d" + linkData);
                    REG_NEXT_LINK.test(linkData) && (linkObj.mScore += 50, appendDbgStrForLink(link_0$$2, "score\x3d" + linkObj.mScore + ": has next"));
                    REG_PAGINATION.test(linkData) && (linkObj.mScore += 25, appendDbgStrForLink(link_0$$2, "score\x3d" + linkObj.mScore + ": has pag* word"));
                    REG_FIRST_LAST.test(linkData) && !REG_NEXT_LINK.test(linkObj.mLinkText) && (linkObj.mScore -= 65, appendDbgStrForLink(link_0$$2, "score\x3d" + linkObj.mScore + ": has first|last but no next regex"));
                    if (REG_NEGATIVE.test(linkData) || REG_EXTRANEOUS.test(linkData)) {
                      linkObj.mScore -= 50, appendDbgStrForLink(link_0$$2, "score\x3d" + linkObj.mScore + ": has neg or extra regex");
                    }
                    REG_PREV_LINK.test(linkData) && (linkObj.mScore -= 200, appendDbgStrForLink(link_0$$2, "score\x3d" + linkObj.mScore + ": has opp of next regex"));
                    negativeMatch = positiveMatch = !1;
                    for (parent_0 = $getParentElement(link_0$$2);parent_0 && (!positiveMatch || !negativeMatch);) {
                      parentClassAndId = $getAttribute(parent_0, "class") + " " + parent_0.id, !positiveMatch && REG_PAGINATION.test(parentClassAndId) && (linkObj.mScore += 25, positiveMatch = !0, appendDbgStrForLink(link_0$$2, "score\x3d" + linkObj.mScore + ": posParent - " + parentClassAndId)), negativeMatch || !REG_NEGATIVE.test(parentClassAndId) || REG_POSITIVE.test(parentClassAndId) || (linkObj.mScore -= 25, negativeMatch = !0, appendDbgStrForLink(link_0$$2, "score\x3d" + linkObj.mScore + ": negParent - " + 
                      parentClassAndId)), parent_0 = $getParentElement(parent_0);
                    }
                    if (REG_LINK_PAGINATION.test(linkHref) || REG_PAGINATION.test(linkHref)) {
                      linkObj.mScore += 25, appendDbgStrForLink(link_0$$2, "score\x3d" + linkObj.mScore + ": has paging info");
                    }
                    REG_EXTRANEOUS.test(linkHref) && (linkObj.mScore -= 15, appendDbgStrForLink(link_0$$2, "score\x3d" + linkObj.mScore + ": has extra regex"));
                    10 < linkText.length && (linkObj.mScore -= linkText.length, appendDbgStrForLink(link_0$$2, "score\x3d" + linkObj.mScore + ": text too long"));
                    linkTextAsNumber = parseInt_0(linkText);
                    0 < linkTextAsNumber && (1 == linkTextAsNumber ? linkObj.mScore -= 10 : linkObj.mScore += 0 > 10 - linkTextAsNumber ? 0 : 10 - linkTextAsNumber, appendDbgStrForLink(link_0$$2, "score\x3d" + linkObj.mScore + ": linktxt is a num (" + linkTextAsNumber + ")"));
                    for (var url_0$$4 = originalUrl, linkHref$$0 = linkHref, link_0$$3 = link_0$$2, skip = allowedPrefix.length, i$$13 = void 0, linkAsNumber = void 0, urlAsNumber = void 0, url_0$$4 = decodeURIComponent_0(url_0$$4), linkHref$$0 = decodeURIComponent_0(linkHref$$0), i$$13 = skip;i$$13 < min_0(url_0$$4.length, linkHref$$0.length) && url_0$$4.charCodeAt(i$$13) == linkHref$$0.charCodeAt(i$$13);i$$13++) {
                    }
                    url_0$$4 = $substring_0(url_0$$4, i$$13, url_0$$4.length);
                    linkHref$$0 = $substring_0(linkHref$$0, i$$13, linkHref$$0.length);
                    appendDbgStrForLink(link_0$$3, "remains: " + url_0$$4 + ", " + linkHref$$0);
                    linkAsNumber = parseInt_0(linkHref$$0);
                    urlAsNumber = parseInt_0(url_0$$4);
                    appendDbgStrForLink(link_0$$3, "remains: " + urlAsNumber + ", " + linkAsNumber);
                    (diff = 0 < urlAsNumber && 0 < linkAsNumber ? valueOf_2(linkAsNumber - urlAsNumber) : null) && 1 == diff.value_0 && (linkObj.mScore += 25, appendDbgStrForLink(link_0$$2, "score\x3d" + linkObj.mScore + ": diff \x3d " + diff));
                  } else {
                    appendDbgStrForLink(link_0$$2, "ignored: no number beyond folder url " + folderUrl);
                  }
                }
              }
            }
          } else {
            appendDbgStrForLink(link_0$$2, "ignored: invisible");
          }
        }
      } else {
        appendDbgStrForLink(link_0$$2, "ignored: not prefix + num");
      }
    }
    topPage = null;
    if (0 != possiblePages.map_0.size_0) {
      for (pageObj$iterator = $iterator(new AbstractMap$1(possiblePages.map_0));$hasNext(pageObj$iterator.val$outerIter2);) {
        pageObj = $next(pageObj$iterator.val$outerIter2).getKey(), $contains_2(bannedUrls, pageObj.mLinkHref) || 50 <= pageObj.mScore && (!topPage || topPage.mScore < pageObj.mScore) && (topPage = pageObj);
      }
    }
    pagingHref = null;
    if (topPage) {
      var input_0 = topPage.mLinkHref;
      $clinit_StringUtil();
      pagingHref = input_0.replace(RegExp("\\/$", "gi"), "");
      appendDbgStrForLink(allLinks$$0[topPage.mLinkIndex], "found: score\x3d" + topPage.mScore + ", txt\x3d[" + topPage.mLinkText + "], " + pagingHref);
    }
    if (3 <= sDebugLevel) {
      var i$$14, link_0$$4, text_0$$2, w$$0, words;
      logToConsole("numLinks\x3d" + allLinks$$0.length + ", found next: " + (null != pagingHref ? pagingHref : "null"));
      for (i$$14 = 0;i$$14 < allLinks$$0.length;i$$14++) {
        link_0$$4 = allLinks$$0[i$$14];
        text_0$$2 = getInnerText(link_0$$4);
        words = ($clinit_StringUtil(), $split(text_0$$2, "\\s+"));
        text_0$$2 = "";
        for (w$$0 = 0;w$$0 < words.length;w$$0++) {
          text_0$$2 += words[w$$0], w$$0 < words.length - 1 && (text_0$$2 += " ");
        }
        logToConsole(i$$14 + ")" + link_0$$4.href + ", txt\x3d[" + text_0$$2 + "], dbg\x3d[" + $get(mLinkDebugInfo, link_0$$4) + "]");
      }
    }
    next_0 = pagingHref;
    if (null != next_0) {
      if (void 0 == next_0) {
        throw new TypeError;
      }
      info_0[1] = next_0;
    }
    if (void 0 == info_0) {
      throw new TypeError;
    }
    result[3] = info_0;
  }
  addTimingInfo(stPaging, timingInfo, "Pagination");
  var this$static$$18 = contentExtractor.parser, article, articleInfo, i$$15, i0$$0, image, imageInfo, images$$0, info$$3, obj$$0, obj_0$$0, res$$0;
  info$$3 = (obj$$0 = {}, obj$$0[9] = [], obj$$0);
  var i$$16, optOut;
  optOut = !1;
  for (i$$16 = 0;i$$16 < this$static$$18.mAccessors.array.length && !optOut;i$$16++) {
    optOut = $get_2(this$static$$18.mAccessors, i$$16).optOut();
  }
  if (!optOut) {
    var val$$4 = $getTitle(this$static$$18);
    if (void 0 == val$$4) {
      throw new TypeError;
    }
    info$$3[1] = val$$4;
    var JSCompiler_inline_result$$5, i$$17, type_0;
    type_0 = "";
    for (i$$17 = 0;i$$17 < this$static$$18.mAccessors.array.length && !type_0.length;i$$17++) {
      type_0 = $get_2(this$static$$18.mAccessors, i$$17).getType();
    }
    JSCompiler_inline_result$$5 = type_0;
    if (void 0 == JSCompiler_inline_result$$5) {
      throw new TypeError;
    }
    info$$3[2] = JSCompiler_inline_result$$5;
    var JSCompiler_inline_result$$6, i$$18, url_0$$5;
    url_0$$5 = "";
    for (i$$18 = 0;i$$18 < this$static$$18.mAccessors.array.length && !url_0$$5.length;i$$18++) {
      url_0$$5 = $get_2(this$static$$18.mAccessors, i$$18).getUrl();
    }
    JSCompiler_inline_result$$6 = url_0$$5;
    if (void 0 == JSCompiler_inline_result$$6) {
      throw new TypeError;
    }
    info$$3[3] = JSCompiler_inline_result$$6;
    var JSCompiler_inline_result$$7, description, i$$19;
    description = "";
    for (i$$19 = 0;i$$19 < this$static$$18.mAccessors.array.length && !description.length;i$$19++) {
      description = $get_2(this$static$$18.mAccessors, i$$19).getDescription();
    }
    JSCompiler_inline_result$$7 = description;
    if (void 0 == JSCompiler_inline_result$$7) {
      throw new TypeError;
    }
    info$$3[4] = JSCompiler_inline_result$$7;
    var JSCompiler_inline_result$$8, i$$20, publisher;
    publisher = "";
    for (i$$20 = 0;i$$20 < this$static$$18.mAccessors.array.length && !publisher.length;i$$20++) {
      publisher = $get_2(this$static$$18.mAccessors, i$$20).getPublisher();
    }
    JSCompiler_inline_result$$8 = publisher;
    if (void 0 == JSCompiler_inline_result$$8) {
      throw new TypeError;
    }
    info$$3[5] = JSCompiler_inline_result$$8;
    var JSCompiler_inline_result$$9, copyright, i$$21;
    copyright = "";
    for (i$$21 = 0;i$$21 < this$static$$18.mAccessors.array.length && !copyright.length;i$$21++) {
      copyright = $get_2(this$static$$18.mAccessors, i$$21).getCopyright();
    }
    JSCompiler_inline_result$$9 = copyright;
    if (void 0 == JSCompiler_inline_result$$9) {
      throw new TypeError;
    }
    info$$3[6] = JSCompiler_inline_result$$9;
    var JSCompiler_inline_result$$10, author, i$$22;
    author = "";
    for (i$$22 = 0;i$$22 < this$static$$18.mAccessors.array.length && !author.length;i$$22++) {
      author = $get_2(this$static$$18.mAccessors, i$$22).getAuthor();
    }
    JSCompiler_inline_result$$10 = author;
    if (void 0 == JSCompiler_inline_result$$10) {
      throw new TypeError;
    }
    info$$3[7] = JSCompiler_inline_result$$10;
    var article$$0, i$$23;
    article$$0 = null;
    for (i$$23 = 0;i$$23 < this$static$$18.mAccessors.array.length && !article$$0;i$$23++) {
      article$$0 = $get_2(this$static$$18.mAccessors, i$$23).getArticle();
    }
    if (article = article$$0) {
      articleInfo = (obj_0$$0 = {}, obj_0$$0[5] = [], obj_0$$0);
      var val$$5 = article.publishedTime;
      if (void 0 == val$$5) {
        throw new TypeError;
      }
      articleInfo[1] = val$$5;
      var val$$6 = article.modifiedTime;
      if (void 0 == val$$6) {
        throw new TypeError;
      }
      articleInfo[2] = val$$6;
      var val$$7 = article.expirationTime;
      if (void 0 == val$$7) {
        throw new TypeError;
      }
      articleInfo[3] = val$$7;
      var val$$8 = article.section;
      if (void 0 == val$$8) {
        throw new TypeError;
      }
      articleInfo[4] = val$$8;
      for (i0$$0 = 0;i0$$0 < article.authors.length;i0$$0++) {
        articleInfo[5].push(article.authors[i0$$0]);
      }
      if (void 0 == articleInfo) {
        throw new TypeError;
      }
      info$$3[8] = articleInfo;
    }
    var i$$24, images$$1;
    images$$1 = null;
    for (i$$24 = 0;i$$24 < this$static$$18.mAccessors.array.length && !(images$$1 = $get_2(this$static$$18.mAccessors, i$$24).getImages(), 0 < images$$1.length);i$$24++) {
    }
    images$$0 = images$$1;
    for (i$$15 = 0;i$$15 < images$$0.length;i$$15++) {
      image = images$$0[i$$15];
      imageInfo = (res$$0 = {}, info$$3[9].push(res$$0), res$$0);
      var val$$9 = image.url_0;
      if (void 0 == val$$9) {
        throw new TypeError;
      }
      imageInfo[1] = val$$9;
      var val$$10 = image.secureUrl;
      if (void 0 == val$$10) {
        throw new TypeError;
      }
      imageInfo[2] = val$$10;
      var val$$11 = image.type_0;
      if (void 0 == val$$11) {
        throw new TypeError;
      }
      imageInfo[3] = val$$11;
      var val$$12 = image.caption_0;
      if (void 0 == val$$12) {
        throw new TypeError;
      }
      imageInfo[4] = val$$12;
      var val$$13 = image.width_0;
      if (void 0 == val$$13) {
        throw new TypeError;
      }
      imageInfo[5] = val$$13;
      var val$$14 = image.height_0;
      if (void 0 == val$$14) {
        throw new TypeError;
      }
      imageInfo[6] = val$$14;
    }
  }
  if (void 0 == info$$3) {
    throw new TypeError;
  }
  result[5] = info$$3;
  var val$$15 = getTime() - startTime;
  if (void 0 == val$$15) {
    throw new TypeError;
  }
  timingInfo[5] = val$$15;
  if (void 0 == timingInfo) {
    throw new TypeError;
  }
  result[6] = timingInfo;
  var val$$16 = contentExtractor.mStatisticsInfo;
  if (void 0 == val$$16) {
    throw new TypeError;
  }
  result[8] = val$$16;
  debugInfo = (obj_1 = {}, obj_1);
  var val$$17 = (log_0 = sLogBuilder, sLogBuilder = "", log_0);
  if (void 0 == val$$17) {
    throw new TypeError;
  }
  debugInfo[1] = val$$17;
  if (void 0 == debugInfo) {
    throw new TypeError;
  }
  result[7] = debugInfo;
  return result;
}
defineClass(208, 1, {}, function() {
});
createForClass(208);
function $clinit_DomUtil() {
  $clinit_DomUtil = emptyMethod;
  attributeAllowlist = new HashSet_0(new Arrays$ArrayList(initValues(getClassLiteralForArray_0(Ljava_lang_String_2_classLit, 1), $intern_7, 2, 4, "abbr accept-charset accept accesskey action align alink allow allowfullscreen allowpaymentrequest alt archive as async autocapitalize autocomplete autocorrect autofocus autoplay autopictureinpicture axis background behavior bgcolor border bordercolor capture cellpadding cellspacing char challenge charoff charset checked cite class classid clear code codebase codetype color cols colspan compact content contenteditable controls controlslist conversiondestination coords crossorigin csp data datetime declare decoding default defer dir direction dirname disabled disablepictureinpicture disableremoteplayback disallowdocumentaccess download draggable elementtiming enctype end enterkeyhint event exportparts face for form formaction formenctype formmethod formnovalidate formtarget frame frameborder headers height hidden high href hreflang hreftranslate hspace http-equiv id imagesizes imagesrcset importance impressiondata impressionexpiry incremental inert inputmode integrity is ismap keytype kind invisible label lang language latencyhint leftmargin link list loading longdesc loop low lowsrc manifest marginheight marginwidth max maxlength mayscript media method min minlength multiple muted name nohref nomodule nonce noresize noshade novalidate nowrap object open optimum part pattern placeholder playsinline ping policy poster preload pseudo readonly referrerpolicy rel reportingorigin required resources rev reversed role rows rowspan rules sandbox scheme scope scrollamount scrolldelay scrolling select selected shadowroot shadowrootdelegatesfocus shape size sizes slot span spellcheck src srcset srcdoc srclang standby start step style summary tabindex target text title topmargin translate truespeed trusttoken type usemap valign value valuetype version vlink vspace virtualkeyboardpolicy webkitdirectory width wrap".split(" "))));
}
function cloneAndProcessList(outputNodes) {
  var visitor;
  $clinit_DomUtil();
  if (0 == outputNodes.array.length) {
    return null;
  }
  visitor = new NodeListExpander$Visitor(outputNodes);
  var n = (checkElementIndex(0, outputNodes.array.length), outputNodes.array[0]), next;
  for (next = n.parentNode;next && 9 != next.nodeType;n = next, next = next.parentNode) {
  }
  $walk(new DomWalker(visitor), n);
  visitor = visitor.subtree;
  for (outputNodes = (checkElementIndex(0, outputNodes.array.length), outputNodes.array[0]);1 == visitor.children.size_0 && visitor.node != outputNodes && 3 != $get_1(visitor.children, 0).node.nodeType;) {
    visitor = $get_1(visitor.children, 0);
  }
  outputNodes = $cloneSubtreeRetainDirection(visitor);
  if (1 != outputNodes.nodeType) {
    return null;
  }
  stripAttributeFromTags(outputNodes, "ID", initValues(getClassLiteralForArray_0(Ljava_lang_String_2_classLit, 1), $intern_7, 2, 4, ["*"]));
  makeAllLinksAbsolute(outputNodes);
  stripAttributeFromTags(outputNodes, "TARGET", initValues(getClassLiteralForArray_0(Ljava_lang_String_2_classLit, 1), $intern_7, 2, 4, ["A"]));
  stripAttributeFromTags(outputNodes, "COLOR", initValues(getClassLiteralForArray_0(Ljava_lang_String_2_classLit, 1), $intern_7, 2, 4, ["FONT"]));
  stripAttributeFromTags(outputNodes, "BGCOLOR", initValues(getClassLiteralForArray_0(Ljava_lang_String_2_classLit, 1), $intern_7, 2, 4, ["TABLE", "TR", "TD", "TH"]));
  stripAttributeFromTags(outputNodes, "STYLE", initValues(getClassLiteralForArray_0(Ljava_lang_String_2_classLit, 1), $intern_7, 2, 4, ["*"]));
  1 == outputNodes.nodeType && "IMG" === outputNodes.tagName && stripImageElement(outputNodes);
  n = querySelectorAll(outputNodes, "IMG");
  for (visitor = 0;visitor < n.length;visitor++) {
    stripImageElement(n[visitor]);
  }
  stripAllUnsafeAttributes(outputNodes);
  return outputNodes;
}
function getAllSrcSetUrls(root) {
  $clinit_DomUtil();
  var i, list;
  list = new ArrayList;
  root.hasAttribute("srcset") && $addAll_0(list, getSrcSetUrls(root));
  root = querySelectorAll(root, "[SRCSET]");
  for (i = 0;i < root.length;i++) {
    $addAll_0(list, getSrcSetUrls(root[i]));
  }
  return list;
}
function getArea(e) {
  $clinit_DomUtil();
  return e ? ((e.offsetHeight || 0) | 0) * ((e.offsetWidth || 0) | 0) : 0;
}
function getAttributes(elem) {
  $clinit_DomUtil();
  return elem.attributes;
}
function getComputedStyle_0(el) {
  $clinit_DomUtil();
  return getComputedStyle(el, null);
}
function getFirstElementByTagName(e, tagName) {
  $clinit_DomUtil();
  var elements;
  elements = e.getElementsByTagName(tagName);
  return 0 < elements.length ? elements[0] : null;
}
function getFirstElementByTagNameInc(e) {
  $clinit_DomUtil();
  return "IMG" == e.tagName ? e : getFirstElementByTagName(e, "IMG");
}
function getInnerText(node) {
  $clinit_DomUtil();
  return node.innerText;
}
function getNearestCommonAncestor(n1, n2) {
  $clinit_DomUtil();
  var parent_0;
  for (parent_0 = n1;parent_0 && !parent_0.contains(n2);) {
    parent_0 = parent_0.parentNode;
  }
  return parent_0;
}
function getNearestCommonAncestor_0(ns) {
  $clinit_DomUtil();
  var i, parent_0;
  if (0 == ns.size_1()) {
    return null;
  }
  parent_0 = ns.get_1(0);
  for (i = 1;i < ns.size_1();i++) {
    parent_0 = getNearestCommonAncestor(parent_0, ns.get_1(i));
  }
  return parent_0;
}
function getOutputNodes(root) {
  $clinit_DomUtil();
  var nodes;
  nodes = new ArrayList;
  $walk(new DomWalker(new DomUtil$1(nodes)), root);
  return nodes;
}
function getParentNodes(n) {
  $clinit_DomUtil();
  var result;
  for (result = new ArrayList;n;) {
    result.array[result.array.length] = n, n = n.parentNode;
  }
  return result;
}
function getSrcSetUrls(e) {
  var comp, list, sizes;
  list = new ArrayList;
  e = $getAttribute(e, "srcset");
  if (!e.length) {
    return list;
  }
  sizes = jsSplit(e);
  for (e = 0;e < sizes.length;e++) {
    comp = jsTrim(sizes[e]), comp.length && (comp = $split(comp, " "), $add_0(list, comp[0]));
  }
  return list;
}
function getTextFromTreeForTest(node) {
  $clinit_DomUtil();
  var output;
  $doc.body.appendChild(node);
  output = getInnerText(node);
  $doc.body.removeChild(node);
  return output;
}
function getTime() {
  $clinit_DomUtil();
  return "undefined" !== typeof distiller_on_ios && distiller_on_ios || !window.performance ? Date.now() : window.performance.now();
}
function getVisibleElements(nodeList) {
  var element, i, visibleElements;
  visibleElements = new ArrayList;
  for (i = 0;i < nodeList.length;i++) {
    element = nodeList[i], isVisible(element) && (element.offsetParent || 0 != ((element.offsetHeight || 0) | 0) || 0 != ((element.offsetWidth || 0) | 0)) && 0 < getArea(element) && (visibleElements.array[visibleElements.array.length] = element);
  }
  return visibleElements;
}
function hasRootDomain(url_0, root) {
  $clinit_DomUtil();
  var anchor;
  if (null == url_0) {
    return!1;
  }
  anchor = $doc.createElement("a");
  anchor.href = url_0;
  return $endsWith("." + $getPropertyString(anchor, "host"), "." + root);
}
function isVisible(e) {
  $clinit_DomUtil();
  var style;
  style = getComputedStyle_0(e);
  e = parseFloat(style.opacity);
  return!("none" === style.display || "hidden" === style.visibility || 0 == e);
}
function javascriptTextContent(node) {
  $clinit_DomUtil();
  return node.textContent;
}
function makeAllLinksAbsolute(rootNode) {
  $clinit_DomUtil();
  var allLinks, i0, link_0;
  "A" === rootNode.tagName && (link_0 = rootNode, link_0.href.length && (link_0.href = link_0.href));
  allLinks = rootNode.getElementsByTagName("A");
  for (i0 = 0;i0 < allLinks.length;i0++) {
    link_0 = allLinks[i0], link_0.href.length && (link_0.href = link_0.href);
  }
  "VIDEO" === rootNode.tagName && (i0 = rootNode, i0.poster.length && (i0.poster = i0.poster));
  link_0 = rootNode.getElementsByTagName("VIDEO");
  for (allLinks = 0;allLinks < link_0.length;allLinks++) {
    i0 = link_0[allLinks], i0.poster.length && (i0.poster = i0.poster);
  }
  makeAllSrcAttributesAbsolute(rootNode);
  makeAllSrcSetAbsolute(rootNode);
}
function makeAllSrcAttributesAbsolute(root) {
  $clinit_DomUtil();
  ("IMG" == root.tagName || "SOURCE" == root.tagName || "TRACK" == root.tagName || "VIDEO" == root.tagName) && root.src && (root.src = root.src);
  root = root.querySelectorAll("img,source,track,video");
  for (var key in root) {
    root[key].src && (root[key].src = root[key].src);
  }
}
function makeAllSrcSetAbsolute(root) {
  $clinit_DomUtil();
  var i;
  root.hasAttribute("srcset") && makeSrcSetAbsolute(root);
  root = querySelectorAll(root, "[SRCSET]");
  for (i = 0;i < root.length;i++) {
    makeSrcSetAbsolute(root[i]);
  }
}
function makeSrcSetAbsolute(ie) {
  var comp, holder, i, sizes;
  i = $getAttribute(ie, "srcset");
  if (i.length) {
    holder = $doc.createElement("img");
    sizes = jsSplit(i);
    for (i = 0;i < sizes.length;i++) {
      comp = jsTrim(sizes[i]), comp.length && (comp = $split(comp, " "), holder.src = comp[0], comp[0] = holder.src, sizes[i] = join_1(comp, " "));
    }
    holder = join_1(sizes, ", ");
    ie.setAttribute("srcset", holder);
  } else {
    ie.removeAttribute("srcset");
  }
}
function querySelectorAll(l, selectors) {
  $clinit_DomUtil();
  return l.querySelectorAll(selectors);
}
function splitUrlParams(query) {
  $clinit_DomUtil();
  var currentParam, currentParam$index, currentParam$max, paramMap;
  if (null == query || !query.length) {
    return new HashMap;
  }
  paramMap = new HashMap;
  query = $split(query, "\x26");
  for (currentParam$index = 0;currentParam$index < query.length;currentParam$index++) {
  }
  currentParam$index = 0;
  for (currentParam$max = query.length;currentParam$index < currentParam$max;++currentParam$index) {
    if (currentParam = query[currentParam$index], currentParam = $split(currentParam, "\x3d"), 1 < currentParam.length) {
      var JSCompiler_temp_const = paramMap, JSCompiler_temp_const$$0 = currentParam[0];
      if (null == currentParam[1]) {
        throw new NullPointerException_0("encodedURL cannot be null");
      }
      $putStringValue(JSCompiler_temp_const, JSCompiler_temp_const$$0, decodeURI(currentParam[1]));
    }
  }
  return paramMap;
}
function stripAllUnsafeAttributes(root) {
  $clinit_DomUtil();
  var i;
  1 == root.nodeType && stripAllUnsafeAttributesFromElement(root);
  root = querySelectorAll(root, "*");
  for (i = 0;i < root.length;i++) {
    stripAllUnsafeAttributesFromElement(root[i]);
  }
}
function stripAllUnsafeAttributesFromElement(element) {
  var attrName, attrs, j;
  attrs = getAttributes(element);
  for (j = 0;j < attrs.length;) {
    attrName = attrs[j].nodeName, $contains_2(attributeAllowlist, attrName) ? ++j : element.removeAttribute(attrName);
  }
}
function stripAttributeFromTags(rootNode, attribute, tagNames) {
  $clinit_DomUtil();
  var tag, tag$index0, tag$max0;
  tag$index0 = 0;
  for (tag$max0 = tagNames.length;tag$index0 < tag$max0;++tag$index0) {
    tag = tagNames[tag$index0], rootNode.tagName !== tag && "*" !== tag || rootNode.removeAttribute(attribute);
  }
  tag = 0;
  for (tag$index0 = tagNames.length;tag < tag$index0;++tag) {
  }
  tagNames = join_1(tagNames, ", ");
  tagNames = querySelectorAll(rootNode, tagNames);
  for (rootNode = 0;rootNode < tagNames.length;rootNode++) {
    tagNames[rootNode].removeAttribute(attribute);
  }
}
function stripImageElement(imgElement) {
  $clinit_DomUtil();
  var attrs, i, name_0;
  attrs = getAttributes(imgElement);
  for (i = 0;i < attrs.length;) {
    name_0 = attrs[i].nodeName, "src" === name_0 || "alt" === name_0 || "srcset" === name_0 || "dir" === name_0 || "width" === name_0 || "height" === name_0 || "title" === name_0 ? ++i : imgElement.removeAttribute(name_0);
  }
}
var attributeAllowlist;
function DomUtil$1(val$nodes) {
  this.val$nodes1 = val$nodes;
}
defineClass(106, 1, {}, DomUtil$1);
_.exit = function() {
};
_.visit = function(n) {
  switch(n.nodeType) {
    case 3:
      return $add_0(this.val$nodes1, n), !1;
    case 1:
      if (!isVisible(n)) {
        return!1;
      }
      $add_0(this.val$nodes1, n);
      return!0;
    default:
      return!1;
  }
};
createForClass(106);
function $walk(this$static, top_0) {
  var c, n;
  if (this$static.visitor.visit(top_0)) {
    if (n = top_0.firstChild) {
      for (;n != top_0;) {
        c = !1;
        if (this$static.visitor.visit(n)) {
          if (c = n.firstChild) {
            n = c;
            continue;
          }
          c = !0;
        }
        for (;n != top_0;) {
          c && this$static.visitor.exit(n);
          if (c = n.nextSibling) {
            n = c;
            break;
          }
          n = n.parentNode;
          c = !0;
        }
      }
    }
    this$static.visitor.exit(top_0);
  }
}
function DomWalker(v) {
  this.visitor = v;
}
defineClass(61, 1, {}, DomWalker);
createForClass(61);
function $findAuthor(this$static) {
  var elem;
  this$static.mAuthor = "";
  elem = this$static.mRoot;
  $clinit_DomUtil();
  (elem = elem.querySelector(".byline-name")) && (this$static.mAuthor = javascriptTextContent(elem));
}
function IEReadingViewParser(root) {
  this.mRoot = root;
}
defineClass(122, 1, {}, IEReadingViewParser);
_.getArticle = function() {
  var article, author;
  article = new MarkupParser$Article;
  if (null == this.mDate) {
    var meta;
    !this.mAllMeta && (this.mAllMeta = this.mRoot.getElementsByTagName("META"));
    this.mDate = "";
    author = this.mRoot;
    $clinit_DomUtil();
    if (author = author.querySelector(".dateline")) {
      this.mDate = javascriptTextContent(author);
    } else {
      for (author = 0;author < this.mAllMeta.length;author++) {
        if (meta = this.mAllMeta[author], $equalsIgnoreCase(meta.name, "displaydate")) {
          this.mDate = meta.content;
          break;
        }
      }
    }
  }
  article.publishedTime = this.mDate;
  author = (null == this.mAuthor && $findAuthor(this), this.mAuthor);
  article.authors = author.length ? initValues(getClassLiteralForArray_0(Ljava_lang_String_2_classLit, 1), $intern_7, 2, 4, [author]) : initDim(Ljava_lang_String_2_classLit, $intern_7, 2, 0, 4);
  return article;
};
_.getAuthor = function() {
  return null == this.mAuthor && $findAuthor(this), this.mAuthor;
};
_.getCopyright = function() {
  if (null == this.mCopyright) {
    var i, meta;
    !this.mAllMeta && (this.mAllMeta = this.mRoot.getElementsByTagName("META"));
    this.mCopyright = "";
    for (i = 0;i < this.mAllMeta.length;i++) {
      if (meta = this.mAllMeta[i], $equalsIgnoreCase(meta.name, "copyright")) {
        this.mCopyright = meta.content;
        break;
      }
    }
  }
  return this.mCopyright;
};
_.getDescription = function() {
  return "";
};
_.getImages = function() {
  if (!this.mImages) {
    var allImages, caption, i, image, imgElem;
    this.mImages = new ArrayList;
    allImages = this.mRoot.getElementsByTagName("IMG");
    for (i = 0;i < allImages.length;i++) {
      imgElem = allImages[i];
      var i$$0 = image = caption = void 0, numCaptions = void 0;
      caption = void 0;
      caption = $getParentElement(imgElem);
      if ($equalsIgnoreCase("FIGURE", caption.tagName)) {
        if (image = caption.getElementsByTagName("FIGCAPTION"), numCaptions = image.length, caption = "", 0 < numCaptions && 2 >= numCaptions) {
          for (i$$0 = 0;i$$0 < numCaptions && !caption.length;i$$0++) {
            caption = getInnerText(image[i$$0]);
          }
        }
      } else {
        caption = "";
      }
      (image = null != caption && caption.length) || (image = image = void 0, image = imgElem.width, 400 > image ? image = !1 : (image /= imgElem.height, image = 1.3 <= image && 3 >= image));
      image && (image = new MarkupParser$Image, image.url_0 = imgElem.src, image.caption_0 = caption, image.width_0 = imgElem.width, image.height_0 = imgElem.height, $add_0(this.mImages, image));
    }
  }
  return $toArray_0(this.mImages, initDim(Lorg_chromium_distiller_MarkupParser$Image_2_classLit, $intern_3, 27, this.mImages.array.length, 0));
};
_.getPublisher = function() {
  if (null == this.mPublisher) {
    var allElems, e, i;
    this.mPublisher = "";
    allElems = this.mRoot.getElementsByTagName("*");
    for (i = 0;i < allElems.length && !this.mPublisher.length;i++) {
      e = allElems[i], this.mPublisher = $getAttribute(e, "publisher"), !this.mPublisher.length && (this.mPublisher = $getAttribute(e, "source_organization"));
    }
  }
  return this.mPublisher;
};
_.getTitle = function() {
  if (null == this.mTitle) {
    var i, meta;
    !this.mAllMeta && (this.mAllMeta = this.mRoot.getElementsByTagName("META"));
    this.mTitle = "";
    if (0 != this.mAllMeta.length && (i = this.mRoot.getElementsByTagName("TITLE"), 0 != i.length)) {
      for (i = 0;i < this.mAllMeta.length;i++) {
        if (meta = this.mAllMeta[i], $equalsIgnoreCase(meta.name, "title")) {
          this.mTitle = meta.content;
          break;
        }
      }
    }
  }
  return this.mTitle;
};
_.getType = function() {
  return "";
};
_.getUrl = function() {
  return "";
};
_.optOut = function() {
  if (!this.mDoneOptOut) {
    var i, meta;
    !this.mAllMeta && (this.mAllMeta = this.mRoot.getElementsByTagName("META"));
    this.mDoneOptOut = !0;
    for (i = 0;i < this.mAllMeta.length;i++) {
      if (meta = this.mAllMeta[i], $equalsIgnoreCase(meta.name, "IE_RM_OFF")) {
        this.mOptOut = $equalsIgnoreCase(meta.content, "true");
        break;
      }
    }
  }
  return this.mOptOut;
};
_.mAllMeta = null;
_.mAuthor = null;
_.mCopyright = null;
_.mDate = null;
_.mDoneOptOut = !1;
_.mImages = null;
_.mOptOut = !1;
_.mPublisher = null;
_.mRoot = null;
_.mTitle = null;
createForClass(122);
function parseInt_0(s) {
  return parseInt(s, 10) | 0;
}
function addTimingInfo(startTime, timinginfo, name_0) {
  var res;
  if (timinginfo) {
    timinginfo = (res = {}, timinginfo[6].push(res), res);
    if (void 0 == name_0) {
      throw new TypeError;
    }
    timinginfo[1] = name_0;
    startTime = getTime() - startTime;
    if (void 0 == startTime) {
      throw new TypeError;
    }
    timinginfo[2] = startTime;
  }
}
function logToConsole(str) {
  null == str && (str = "");
  -1 == str.indexOf("[0;") && -1 == str.indexOf("[1;") || (str += "\u001b[0m");
  sSuppressConsoleOutput || null == $wnd.console || "function" != typeof $wnd.console.log && "object" != typeof $wnd.console.log || $wnd.console.log(str);
  sLogBuilder += str + "\n";
}
var sDebugLevel = 0, sLogBuilder = "", sSuppressConsoleOutput = !1;
function $getTitle(this$static) {
  var i, title_0;
  title_0 = "";
  for (i = 0;i < this$static.mAccessors.array.length && !title_0.length;i++) {
    title_0 = $get_2(this$static.mAccessors, i).getTitle();
  }
  return title_0;
}
function MarkupParser(root, timingInfo) {
  var startTime;
  this.mTimingInfo = timingInfo;
  this.mAccessors = new ArrayList;
  startTime = getTime();
  $add_0(this.mAccessors, new OpenGraphProtocolParserAccessor(root, this.mTimingInfo));
  addTimingInfo(startTime, this.mTimingInfo, "OpenGraphProtocolParser");
  startTime = getTime();
  $add_0(this.mAccessors, new SchemaOrgParserAccessor(root, this.mTimingInfo));
  addTimingInfo(startTime, this.mTimingInfo, "SchemaOrgParserAccessor");
  startTime = getTime();
  $add_0(this.mAccessors, new IEReadingViewParser(root));
  addTimingInfo(startTime, this.mTimingInfo, "IEReadingViewParser");
}
defineClass(111, 1, {}, MarkupParser);
createForClass(111);
function MarkupParser$Article() {
}
defineClass(62, 1, {}, MarkupParser$Article);
_.authors = null;
_.expirationTime = "";
_.modifiedTime = "";
_.publishedTime = "";
_.section = "";
createForClass(62);
function MarkupParser$Image() {
}
defineClass(27, 1, {27:1}, MarkupParser$Image);
_.caption_0 = "";
_.height_0 = 0;
_.secureUrl = "";
_.type_0 = "";
_.url_0 = "";
_.width_0 = 0;
var Lorg_chromium_distiller_MarkupParser$Image_2_classLit = createForClass(27);
function $addGroup(this$static) {
  if (0 == this$static.mGroups.array.length || 0 != $get_2(this$static.mGroups, this$static.mGroups.array.length - 1).mList.array.length) {
    $add_0(this$static.mGroups, new MonotonicPageInfosGroups$Group), this$static.mPrevPageInfo = null;
  }
}
function $addPageInfo(this$static, pageInfo) {
  var delta, group, group_0;
  group = $get_2(this$static.mGroups, this$static.mGroups.array.length - 1);
  0 == group.mList.array.length ? ($add_0(group.mList, pageInfo), this$static.mPrevPageInfo = pageInfo) : (delta = pageInfo.mPageNum - this$static.mPrevPageInfo.mPageNum, delta = 0 == delta ? 0 : 0 > delta ? -1 : 1, delta != group.mDeltaSign ? 0 != group.mDeltaSign && (group = (group_0 = new MonotonicPageInfosGroups$Group, $add_0(this$static.mGroups, group_0), group_0), 0 != delta && $add_0(group.mList, this$static.mPrevPageInfo)) : 0 == delta && (group.mList.array = initDim(Ljava_lang_Object_2_classLit, 
  $intern_3, 1, 0, 3)), $add_0(group.mList, pageInfo), this$static.mPrevPageInfo = pageInfo, group.mDeltaSign = delta);
}
function MonotonicPageInfosGroups() {
  this.mGroups = new ArrayList;
}
defineClass(126, 1, {}, MonotonicPageInfosGroups);
_.mPrevPageInfo = null;
createForClass(126);
function MonotonicPageInfosGroups$Group() {
  this.mList = new ArrayList;
}
defineClass(83, 1, {}, MonotonicPageInfosGroups$Group);
_.mDeltaSign = 0;
createForClass(83);
function NodeListExpander$Visitor(nodes) {
  this.nodeMatcher = new OrderedNodeMatcher(nodes);
  this.currentPath = new ArrayList;
  this.subtreePath = new ArrayList;
}
defineClass(183, 1, {}, NodeListExpander$Visitor);
_.exit = function() {
  this.currentPath.remove(this.currentPath.array.length - 1);
  this.subtreePath.remove(this.subtreePath.array.length - 1);
};
_.visit = function(n) {
  if (!this.nodeMatcher.nextNode) {
    return!1;
  }
  $add_0(this.currentPath, n);
  $add_0(this.subtreePath, null);
  1 == this.subtreePath.array.length && (this.subtree = new NodeTree(n), $set(this.subtreePath, 0, this.subtree));
  if ($match(this.nodeMatcher, n)) {
    for (n = 0;n < this.currentPath.array.length;n++) {
      if (null == $get_2(this.subtreePath, n)) {
        $set(this.subtreePath, n, new NodeTree($get_2(this.currentPath, n)));
        var this$static = $get_2(this.subtreePath, n - 1), child = $get_2(this.subtreePath, n);
        $add_3(this$static.children, child);
      }
    }
  }
  return!0;
};
createForClass(183);
function $cloneSubtree(this$static) {
  var child, clone;
  clone = this$static.node.cloneNode(!1);
  for (this$static = $listIterator(this$static.children, 0);this$static.currentNode != this$static.this$01.tail;) {
    child = (checkCriticalElement(this$static.currentNode != this$static.this$01.tail), this$static.lastNode = this$static.currentNode, this$static.currentNode = this$static.currentNode.next, ++this$static.currentIndex, this$static.lastNode.value_0), child = $cloneSubtree(child), clone.appendChild(child);
  }
  return clone;
}
function $cloneSubtreeRetainDirection(this$static) {
  var child, clone;
  clone = this$static.node.cloneNode(!1);
  1 == this$static.node.nodeType && (child = getComputedStyle_0(this$static.node).direction, !child.length && (child = "auto"), clone.setAttribute("dir", child));
  for (this$static = $listIterator(this$static.children, 0);this$static.currentNode != this$static.this$01.tail;) {
    child = (checkCriticalElement(this$static.currentNode != this$static.this$01.tail), this$static.lastNode = this$static.currentNode, this$static.currentNode = this$static.currentNode.next, ++this$static.currentIndex, this$static.lastNode.value_0), child = $cloneSubtreeRetainDirection(child), clone.appendChild(child);
  }
  return clone;
}
function NodeTree(root) {
  this.node = root;
  this.children = new LinkedList;
}
defineClass(74, 1, {}, NodeTree);
createForClass(74);
function $clinit_OpenGraphProtocolParser() {
  $clinit_OpenGraphProtocolParser = emptyMethod;
  sOgpNsPrefixRegExp = RegExp("((\\w+):\\s+(http:\\/\\/ogp.me\\/ns(\\/\\w+)*#))\\s*", "gi");
  sOgpNsNonPrefixNameRegExp = /^xmlns:(\w+)/i;
  sOgpNsNonPrefixValueRegExp = /^http:\/\/ogp.me\/ns(\/\w+)*#/i;
}
function $getPropertyContent(this$static, property) {
  return $hasStringValue(this$static.mPropertyTable, property) ? $getStringValue(this$static.mPropertyTable, property) : "";
}
function $setPrefixForObjectType(this$static, prefix, objTypeWithLeadingSlash) {
  null != objTypeWithLeadingSlash && objTypeWithLeadingSlash.length ? (objTypeWithLeadingSlash = objTypeWithLeadingSlash.substr(1, objTypeWithLeadingSlash.length - 1), "profile" === objTypeWithLeadingSlash ? $put_0(this$static.mPrefixes, ($clinit_OpenGraphProtocolParser$Prefix(), PROFILE), prefix) : "article" === objTypeWithLeadingSlash && $put_0(this$static.mPrefixes, ($clinit_OpenGraphProtocolParser$Prefix(), ARTICLE), prefix)) : $put_0(this$static.mPrefixes, ($clinit_OpenGraphProtocolParser$Prefix(), 
  OG), prefix);
}
function OpenGraphProtocolParser(root, timingInfo) {
  var prefix, startTime;
  this.mImageParser = new OpenGraphProtocolParser$ImageParser;
  this.mProfileParser = new OpenGraphProtocolParser$ProfileParser;
  this.mArticleParser = new OpenGraphProtocolParser$ArticleParser;
  this.mProperties = initValues(getClassLiteralForArray_0(Lorg_chromium_distiller_OpenGraphProtocolParser$PropertyRecord_2_classLit, 1), $intern_3, 21, 0, [new OpenGraphProtocolParser$PropertyRecord("title", ($clinit_OpenGraphProtocolParser$Prefix(), OG), null), new OpenGraphProtocolParser$PropertyRecord("type", OG, null), new OpenGraphProtocolParser$PropertyRecord("url", OG, null), new OpenGraphProtocolParser$PropertyRecord("description", OG, null), new OpenGraphProtocolParser$PropertyRecord("site_name", 
  OG, null), new OpenGraphProtocolParser$PropertyRecord("image", OG, this.mImageParser), new OpenGraphProtocolParser$PropertyRecord("image:", OG, this.mImageParser), new OpenGraphProtocolParser$PropertyRecord("first_name", PROFILE, this.mProfileParser), new OpenGraphProtocolParser$PropertyRecord("last_name", PROFILE, this.mProfileParser), new OpenGraphProtocolParser$PropertyRecord("section", ARTICLE, this.mArticleParser), new OpenGraphProtocolParser$PropertyRecord("published_time", ARTICLE, this.mArticleParser), 
  new OpenGraphProtocolParser$PropertyRecord("modified_time", ARTICLE, this.mArticleParser), new OpenGraphProtocolParser$PropertyRecord("expiration_time", ARTICLE, this.mArticleParser), new OpenGraphProtocolParser$PropertyRecord("author", ARTICLE, this.mArticleParser)]);
  this.mPropertyTable = new HashMap;
  this.mPrefixes = new EnumMap(Lorg_chromium_distiller_OpenGraphProtocolParser$Prefix_2_classLit);
  this.mTimingInfo = timingInfo;
  startTime = getTime();
  var attributeName, attributeValue, heads;
  prefix = "";
  $equalsIgnoreCase("HTML", root.tagName) && (prefix = $getAttribute(root, "prefix"));
  prefix.length || (heads = root.getElementsByTagName("HEAD"), 1 == heads.length && (prefix = $getAttribute(heads[0], "prefix")));
  if (prefix.length) {
    for (sOgpNsPrefixRegExp.lastIndex = 0;;) {
      heads = sOgpNsPrefixRegExp.exec(prefix);
      if (!heads) {
        break;
      }
      $setPrefixForObjectType(this, heads[2], heads[4]);
    }
  } else {
    for (prefix = getAttributes(root), heads = 0;heads < prefix.length;heads++) {
      if (attributeValue = prefix[heads], attributeName = attributeValue.nodeName.toLowerCase(), attributeName = sOgpNsNonPrefixNameRegExp.exec(attributeName)) {
        attributeValue = attributeValue.nodeValue, (attributeValue = sOgpNsNonPrefixValueRegExp.exec(attributeValue)) && $setPrefixForObjectType(this, attributeName[1], attributeValue[1]);
      }
    }
  }
  null == $get_3(this.mPrefixes, ($clinit_OpenGraphProtocolParser$Prefix(), OG)) && $put_0(this.mPrefixes, OG, "og");
  null == $get_3(this.mPrefixes, PROFILE) && $put_0(this.mPrefixes, PROFILE, "profile");
  null == $get_3(this.mPrefixes, ARTICLE) && $put_0(this.mPrefixes, ARTICLE, "article");
  addTimingInfo(startTime, this.mTimingInfo, "OpenGraphProtocolParser.findPrefixes");
  startTime = getTime();
  var addProperty, property;
  attributeName = "";
  for (heads = new EnumMap$EntrySetIterator((new EnumMap$EntrySet(this.mPrefixes)).this$01);$hasNext_0(heads.it);) {
    prefix = (heads.key = $next_1(heads.it), new EnumMap$MapEntry(heads.this$01, heads.key)), attributeName += 'meta[property^\x3d"' + prefix.this$01.values[prefix.key.ordinal] + '"],';
  }
  attributeName = $substring_0(attributeName, 0, attributeName.length - 1);
  prefix = querySelectorAll(root, attributeName);
  for (heads = 0;heads < prefix.length;heads++) {
    for (attributeValue = prefix[heads], property = $getAttribute(attributeValue, "property").toLowerCase(), attributeName = 0;attributeName < this.mProperties.length;attributeName++) {
      addProperty = $get_3(this.mPrefixes, this.mProperties[attributeName].mPrefix) + ":", $startsWith(property, addProperty + this.mProperties[attributeName].mName) && (property = $substring(property, addProperty.length), addProperty = !0, this.mProperties[attributeName].mParser && (addProperty = this.mProperties[attributeName].mParser.parse_0(property, attributeValue.content, this.mPropertyTable)), addProperty && $putStringValue(this.mPropertyTable, this.mProperties[attributeName].mName, attributeValue.content))
      ;
    }
  }
  addTimingInfo(startTime, this.mTimingInfo, "OpenGraphProtocolParser.parseMetaTags");
  startTime = getTime();
  prefix = this.mImageParser;
  if (0 != prefix.mImages.array.length) {
    for (heads = prefix.mImages.array.length - 1;0 <= heads;heads--) {
      attributeName = $get_2(prefix.mImages, heads)[0], null != attributeName && attributeName.length || prefix.mImages.remove(heads);
    }
  }
  addTimingInfo(startTime, this.mTimingInfo, "OpenGraphProtocolParser.imageParser.verify");
  startTime = getTime();
  prefix = $get_3(this.mPrefixes, OG) + ":";
  if (!($hasStringValue(this.mPropertyTable, "title") ? $getStringValue(this.mPropertyTable, "title") : "").length) {
    throw new Exception('Required "' + prefix + 'title" property is missing.');
  }
  if (!($hasStringValue(this.mPropertyTable, "type") ? $getStringValue(this.mPropertyTable, "type") : "").length) {
    throw new Exception('Required "' + prefix + 'type" property is missing.');
  }
  if (!($hasStringValue(this.mPropertyTable, "url") ? $getStringValue(this.mPropertyTable, "url") : "").length) {
    throw new Exception('Required "' + prefix + 'url" property is missing.');
  }
  if (0 == $getImages_0(this.mImageParser).length) {
    throw new Exception('Required "' + prefix + 'image" property is missing.');
  }
  addTimingInfo(startTime, this.mTimingInfo, "OpenGraphProtocolParser.checkRequired");
}
defineClass(147, 1, {}, OpenGraphProtocolParser);
var sOgpNsNonPrefixNameRegExp, sOgpNsNonPrefixValueRegExp, sOgpNsPrefixRegExp;
createForClass(147);
function OpenGraphProtocolParser$ArticleParser() {
  this.mIsArticleType = !1;
  this.mAuthors = new ArrayList;
}
defineClass(150, 1, {}, OpenGraphProtocolParser$ArticleParser);
_.parse_0 = function(property, content_0, propertyTable) {
  this.mIsArticleType || (propertyTable = propertyTable.stringMap.get_2("type"), this.mIsArticleType = null != propertyTable && $equalsIgnoreCase(propertyTable, "article"));
  return this.mIsArticleType ? "author" === property ? ($add_0(this.mAuthors, content_0), !1) : !0 : !1;
};
_.mIsArticleType = !1;
createForClass(150);
function $getImages_0(this$static) {
  var i, imageIn, imageOut, imagesOut;
  imagesOut = initDim(Lorg_chromium_distiller_MarkupParser$Image_2_classLit, $intern_3, 27, this$static.mImages.array.length, 0);
  for (i = 0;i < this$static.mImages.array.length;i++) {
    imageIn = $get_2(this$static.mImages, i), imageOut = new MarkupParser$Image, imagesOut[i] = imageOut, imageOut.url_0 = null != imageIn[1] && imageIn[1].length ? imageIn[1] : imageIn[0], null != imageIn[2] && (imageOut.secureUrl = imageIn[2]), null != imageIn[3] && (imageOut.type_0 = imageIn[3]), null != imageIn[4] && (imageOut.width_0 = parseInt_0(imageIn[4])), null != imageIn[5] && (imageOut.height_0 = parseInt_0(imageIn[5]));
  }
  return imagesOut;
}
function OpenGraphProtocolParser$ImageParser() {
  this.mProperties = initValues(getClassLiteralForArray_0(Ljava_lang_String_2_classLit, 1), $intern_7, 2, 4, "image image:url image:secure_url image:type image:width image:height".split(" "));
  this.mImages = new ArrayList;
}
defineClass(148, 1, {}, OpenGraphProtocolParser$ImageParser);
_.parse_0 = function(property, content_0) {
  var i, image;
  if ("image" === property) {
    image = initDim(Ljava_lang_String_2_classLit, $intern_7, 2, this.mProperties.length, 4), image[0] = content_0, $add_0(this.mImages, image);
  } else {
    for (0 == this.mImages.array.length ? (image = initDim(Ljava_lang_String_2_classLit, $intern_7, 2, this.mProperties.length, 4), $add_0(this.mImages, image)) : image = $get_2(this.mImages, this.mImages.array.length - 1), i = 1;i < this.mProperties.length;i++) {
      if (property === this.mProperties[i]) {
        image[i] = content_0;
        break;
      }
    }
  }
  return!1;
};
createForClass(148);
function $clinit_OpenGraphProtocolParser$Prefix() {
  $clinit_OpenGraphProtocolParser$Prefix = emptyMethod;
  OG = new OpenGraphProtocolParser$Prefix("OG", 0);
  PROFILE = new OpenGraphProtocolParser$Prefix("PROFILE", 1);
  ARTICLE = new OpenGraphProtocolParser$Prefix("ARTICLE", 2);
}
function OpenGraphProtocolParser$Prefix(enum$name, enum$ordinal) {
  Enum.call(this, enum$name, enum$ordinal);
}
defineClass(44, 9, {3:1, 11:1, 9:1, 44:1}, OpenGraphProtocolParser$Prefix);
var ARTICLE, OG, PROFILE, Lorg_chromium_distiller_OpenGraphProtocolParser$Prefix_2_classLit = createForEnum(44, function() {
  $clinit_OpenGraphProtocolParser$Prefix();
  return initValues(getClassLiteralForArray_0(Lorg_chromium_distiller_OpenGraphProtocolParser$Prefix_2_classLit, 1), $intern_4, 44, 0, [OG, PROFILE, ARTICLE]);
});
function OpenGraphProtocolParser$ProfileParser() {
  this.mIsProfileType = this.mCheckedType = !1;
}
defineClass(149, 1, {}, OpenGraphProtocolParser$ProfileParser);
_.parse_0 = function(property, content_0, propertyTable) {
  this.mCheckedType || (property = propertyTable.stringMap.get_2("type"), this.mIsProfileType = null != property && $equalsIgnoreCase(property, "profile"), this.mCheckedType = !0);
  return this.mIsProfileType;
};
_.mCheckedType = !1;
_.mIsProfileType = !1;
createForClass(149);
function OpenGraphProtocolParser$PropertyRecord(name_0, prefix, parser) {
  this.mName = name_0;
  this.mPrefix = prefix;
  this.mParser = parser;
}
defineClass(21, 1, {21:1}, OpenGraphProtocolParser$PropertyRecord);
_.mName = null;
_.mParser = null;
var Lorg_chromium_distiller_OpenGraphProtocolParser$PropertyRecord_2_classLit = createForClass(21);
function $init(this$static) {
  if (!this$static.initialized) {
    var JSCompiler_inline_result;
    var root = this$static.mRoot, timingInfo = this$static.mTimingInfo;
    $clinit_OpenGraphProtocolParser();
    var og, startTime;
    try {
      startTime = getTime(), og = new OpenGraphProtocolParser(root, timingInfo), addTimingInfo(startTime, timingInfo, "OpenGraphProtocolParser.parse"), JSCompiler_inline_result = og;
    } catch ($e0) {
      if ($e0 = wrap($e0), instanceOf($e0, 15)) {
        JSCompiler_inline_result = null;
      } else {
        throw unwrap($e0);
      }
    }
    this$static.mParser = JSCompiler_inline_result;
    this$static.initialized = !0;
  }
  return!!this$static.mParser;
}
function OpenGraphProtocolParserAccessor(root, timingInfo) {
  this.mRoot = root;
  this.mTimingInfo = timingInfo;
  this.initialized = !1;
}
defineClass(119, 1, {}, OpenGraphProtocolParserAccessor);
_.getArticle = function() {
  var article;
  if ($init(this)) {
    article = new MarkupParser$Article;
    article.publishedTime = $getPropertyContent(this.mParser, "published_time");
    article.modifiedTime = $getPropertyContent(this.mParser, "modified_time");
    article.expirationTime = $getPropertyContent(this.mParser, "expiration_time");
    article.section = $getPropertyContent(this.mParser, "section");
    var JSCompiler_inline_result;
    JSCompiler_inline_result = this.mParser.mArticleParser;
    JSCompiler_inline_result = $toArray_0(JSCompiler_inline_result.mAuthors, initDim(Ljava_lang_String_2_classLit, $intern_7, 2, JSCompiler_inline_result.mAuthors.array.length, 4));
    article.authors = JSCompiler_inline_result;
    return article.section.length || article.publishedTime.length || article.modifiedTime.length || article.expirationTime.length || 0 != article.authors.length ? article : null;
  }
  return null;
};
_.getAuthor = function() {
  var JSCompiler_temp;
  if ($init(this)) {
    var this$static = this.mParser;
    JSCompiler_temp = this$static.mPropertyTable;
    this$static.mProfileParser.mIsProfileType ? (this$static = JSCompiler_temp.stringMap.get_2("first_name"), null == this$static && (this$static = ""), JSCompiler_temp = JSCompiler_temp.stringMap.get_2("last_name"), null != JSCompiler_temp && this$static.length && JSCompiler_temp.length && (this$static += " "), JSCompiler_temp = this$static + JSCompiler_temp) : JSCompiler_temp = "";
  } else {
    JSCompiler_temp = "";
  }
  return JSCompiler_temp;
};
_.getCopyright = function() {
  return "";
};
_.getDescription = function() {
  return $init(this) ? $getPropertyContent(this.mParser, "description") : "";
};
_.getImages = function() {
  return $init(this) ? $getImages_0(this.mParser.mImageParser) : initDim(Lorg_chromium_distiller_MarkupParser$Image_2_classLit, $intern_3, 27, 0, 0);
};
_.getPublisher = function() {
  return $init(this) ? $getPropertyContent(this.mParser, "site_name") : "";
};
_.getTitle = function() {
  return $init(this) ? $getPropertyContent(this.mParser, "title") : "";
};
_.getType = function() {
  var type_0;
  type_0 = $init(this) ? $getPropertyContent(this.mParser, "type") : "";
  return $equalsIgnoreCase(type_0, "article") ? "Article" : "";
};
_.getUrl = function() {
  return $init(this) ? $getPropertyContent(this.mParser, "url") : "";
};
_.optOut = function() {
  return!1;
};
_.initialized = !1;
createForClass(119);
function $match(this$static, n) {
  if (n != this$static.nextNode) {
    return!1;
  }
  this$static.nextNode = this$static.nodeIter.hasNext() ? this$static.nodeIter.next_0() : null;
  return!0;
}
function OrderedNodeMatcher(nodes) {
  this.nodeIter = nodes.iterator();
  nodes.isEmpty() || (this.nextNode = this.nodeIter.next_0());
}
defineClass(96, 1, {}, OrderedNodeMatcher);
createForClass(96);
function PageLinkInfo(pageNum, pageParamValue, posInAscendingList) {
  this.mPageNum = pageNum;
  this.mPageParamValue = pageParamValue;
  this.mPosInAscendingList = posInAscendingList;
}
defineClass(92, 1, {}, PageLinkInfo);
_.mPageNum = 0;
_.mPageParamValue = 0;
_.mPosInAscendingList = 0;
createForClass(92);
function $toString_1(this$static) {
  var page, page$iterator, str;
  str = "Type: " + this$static.mType + "\nPageInfo: " + this$static.mAllPageInfo.array.length;
  str += "\npattern: " + this$static.mPagePattern;
  for (page$iterator = new AbstractList$IteratorImpl(this$static.mAllPageInfo);page$iterator.i < page$iterator.this$01_0.size_1();) {
    page = (checkCriticalElement(page$iterator.i < page$iterator.this$01_0.size_1()), page$iterator.this$01_0.get_1(page$iterator.last = page$iterator.i++)), str += "\n  " + ("pg" + page.mPageNum + ": " + page.mUrl);
  }
  return str += "\nformula: " + (this$static.mFormula ? $toString_2(this$static.mFormula) : "null") + "\nnextPagingUrl: " + this$static.mNextPagingUrl;
}
function PageParamInfo() {
  this.mType = ($clinit_PageParamInfo$Type(), UNSET);
  this.mAllPageInfo = new ArrayList;
}
function PageParamInfo_0(type_0, pagePattern, allPageInfo, formula, nextPagingUrl) {
  this.mType = ($clinit_PageParamInfo$Type(), UNSET);
  this.mType = type_0;
  this.mPagePattern = pagePattern;
  this.mAllPageInfo = allPageInfo;
  this.mFormula = formula;
  this.mNextPagingUrl = nextPagingUrl;
}
function getLinearFormula(allLinkInfo) {
  var coefficient, delta, deltaX, link_0;
  if (2 > allLinkInfo.array.length) {
    return null;
  }
  delta = (checkElementIndex(0, allLinkInfo.array.length), allLinkInfo.array[0]);
  coefficient = (checkElementIndex(1, allLinkInfo.array.length), allLinkInfo.array[1]);
  if (deltaX = 2 == allLinkInfo.array.length) {
    deltaX = delta.mPageNum, link_0 = coefficient.mPageNum, deltaX = 4 < (deltaX > link_0 ? deltaX : link_0);
  }
  if (deltaX) {
    return null;
  }
  deltaX = coefficient.mPageNum - delta.mPageNum;
  if (0 == deltaX) {
    return null;
  }
  coefficient = ~~((coefficient.mPageParamValue - delta.mPageParamValue) / deltaX);
  if (0 == coefficient) {
    return null;
  }
  delta = delta.mPageParamValue - coefficient * delta.mPageNum;
  if (0 != delta && delta != -coefficient) {
    return null;
  }
  for (deltaX = 2;deltaX < allLinkInfo.array.length;deltaX++) {
    if (link_0 = (checkElementIndex(deltaX, allLinkInfo.array.length), allLinkInfo.array[deltaX]), link_0.mPageParamValue != coefficient * link_0.mPageNum + delta) {
      return null;
    }
  }
  return new PageParamInfo$LinearFormula(coefficient, delta);
}
function getPageNumbersState(allLinkInfo, ascendingNumbers) {
  var currPageNum, currPos, firstPos, gapPos, linkInfo, linkInfo$iterator, pageParamSet, state;
  state = new PageParamInfo$PageNumbersState;
  gapPos = currPageNum = firstPos = -1;
  pageParamSet = new HashSet;
  for (linkInfo$iterator = new AbstractList$IteratorImpl(allLinkInfo);linkInfo$iterator.i < linkInfo$iterator.this$01_0.size_1();) {
    linkInfo = (checkCriticalElement(linkInfo$iterator.i < linkInfo$iterator.this$01_0.size_1()), linkInfo$iterator.this$01_0.get_1(linkInfo$iterator.last = linkInfo$iterator.i++));
    currPos = linkInfo.mPosInAscendingList;
    if (-1 == currPageNum) {
      firstPos = currPos;
    } else {
      if (currPos != currPageNum + 1) {
        if (currPos <= currPageNum || currPos != currPageNum + 2 || -1 != gapPos) {
          return state;
        }
        gapPos = currPos - 1;
      }
    }
    if (!$add_2(pageParamSet, valueOf_2(linkInfo.mPageParamValue))) {
      return state;
    }
    currPageNum = currPos;
  }
  state.mIsAdjacent = !0;
  if (-1 != gapPos) {
    if (0 >= gapPos || gapPos >= ascendingNumbers.array.length - 1) {
      return state;
    }
    currPageNum = (checkElementIndex(gapPos, ascendingNumbers.array.length), ascendingNumbers.array[gapPos]).mPageNum;
    (checkElementIndex(gapPos - 1, ascendingNumbers.array.length), ascendingNumbers.array[gapPos - 1]).mPageNum == currPageNum - 1 && (checkElementIndex(gapPos + 1, ascendingNumbers.array.length), ascendingNumbers.array[gapPos + 1]).mPageNum == currPageNum + 1 && (state.mIsConsecutive = !0, state.mNextPagingUrl = (checkElementIndex(gapPos + 1, ascendingNumbers.array.length), ascendingNumbers.array[gapPos + 1]).mUrl);
    return state;
  }
  if ((0 == firstPos || 1 == firstPos) && 1 == (checkElementIndex(0, ascendingNumbers.array.length), ascendingNumbers.array[0]).mPageNum && 2 == (checkElementIndex(1, ascendingNumbers.array.length), ascendingNumbers.array[1]).mPageNum || 2 == firstPos && 3 == (checkElementIndex(2, ascendingNumbers.array.length), ascendingNumbers.array[2]).mPageNum && $isEmpty((checkElementIndex(1, ascendingNumbers.array.length), ascendingNumbers.array[1]).mUrl) && !$isEmpty((checkElementIndex(0, ascendingNumbers.array.length), 
  ascendingNumbers.array[0]).mUrl)) {
    return state.mIsConsecutive = !0, state;
  }
  gapPos = ascendingNumbers.array.length;
  if ((currPageNum == gapPos - 1 || currPageNum == gapPos - 2) && (checkElementIndex(gapPos - 2, ascendingNumbers.array.length), ascendingNumbers.array[gapPos - 2]).mPageNum + 1 == (checkElementIndex(gapPos - 1, ascendingNumbers.array.length), ascendingNumbers.array[gapPos - 1]).mPageNum) {
    return state.mIsConsecutive = !0, state;
  }
  for (firstPos += 1;firstPos < currPageNum;firstPos++) {
    if ((checkElementIndex(firstPos - 1, ascendingNumbers.array.length), ascendingNumbers.array[firstPos - 1]).mPageNum + 2 == (checkElementIndex(firstPos + 1, ascendingNumbers.array.length), ascendingNumbers.array[firstPos + 1]).mPageNum) {
      state.mIsConsecutive = !0;
      break;
    }
  }
  return state;
}
function isPageNumberSequence(ascendingNumbers, state) {
  var currPage, hasPlainNum, page, page$iterator;
  if (1 >= ascendingNumbers.array.length) {
    return!1;
  }
  currPage = (checkElementIndex(0, ascendingNumbers.array.length), ascendingNumbers.array[0]);
  if (1 != currPage.mPageNum && !currPage.mUrl.length) {
    return!1;
  }
  hasPlainNum = !1;
  for (page$iterator = new AbstractList$IteratorImpl(ascendingNumbers);page$iterator.i < page$iterator.this$01_0.size_1();) {
    if (page = (checkCriticalElement(page$iterator.i < page$iterator.this$01_0.size_1()), page$iterator.this$01_0.get_1(page$iterator.last = page$iterator.i++)), page.mUrl.length) {
      hasPlainNum && !state.mNextPagingUrl.length && (state.mNextPagingUrl = page.mUrl);
    } else {
      if (hasPlainNum) {
        return!1;
      }
      hasPlainNum = !0;
    }
  }
  if (2 == ascendingNumbers.array.length) {
    return currPage.mPageNum + 1 == (checkElementIndex(1, ascendingNumbers.array.length), ascendingNumbers.array[1]).mPageNum;
  }
  for (hasPlainNum = 1;hasPlainNum < ascendingNumbers.array.length;hasPlainNum++) {
    if (currPage = (checkElementIndex(hasPlainNum, ascendingNumbers.array.length), ascendingNumbers.array[hasPlainNum]), page = (checkElementIndex(hasPlainNum - 1, ascendingNumbers.array.length), ascendingNumbers.array[hasPlainNum - 1]), 1 != currPage.mPageNum - page.mPageNum && (1 != hasPlainNum && hasPlainNum != ascendingNumbers.array.length - 1 || !currPage.mUrl.length || !page.mUrl.length)) {
      return!1;
    }
  }
  return!0;
}
defineClass(41, 1, {}, PageParamInfo, PageParamInfo_0);
_.toString$ = function() {
  return $toString_1(this);
};
_.mFormula = null;
_.mNextPagingUrl = "";
_.mPagePattern = "";
createForClass(41);
function $toString_2(this$static) {
  return "coefficient\x3d" + this$static.mCoefficient + ", delta\x3d" + this$static.mDelta;
}
function PageParamInfo$LinearFormula(coefficient, delta) {
  this.mCoefficient = coefficient;
  this.mDelta = delta;
}
defineClass(78, 1, {}, PageParamInfo$LinearFormula);
_.toString$ = function() {
  return $toString_2(this);
};
_.mCoefficient = 0;
_.mDelta = 0;
createForClass(78);
function PageParamInfo$PageInfo(pageNum, url_0) {
  this.mPageNum = pageNum;
  this.mUrl = url_0;
}
defineClass(26, 1, {}, PageParamInfo$PageInfo);
_.toString$ = function() {
  return "pg" + this.mPageNum + ": " + this.mUrl;
};
_.mPageNum = 0;
createForClass(26);
function PageParamInfo$PageNumbersState() {
}
defineClass(105, 1, {}, PageParamInfo$PageNumbersState);
_.mIsAdjacent = !1;
_.mIsConsecutive = !1;
_.mNextPagingUrl = "";
createForClass(105);
function $clinit_PageParamInfo$Type() {
  $clinit_PageParamInfo$Type = emptyMethod;
  UNSET = new PageParamInfo$Type("UNSET", 0);
  PAGE_NUMBER = new PageParamInfo$Type("PAGE_NUMBER", 1);
  UNKNOWN = new PageParamInfo$Type("UNKNOWN", 2);
}
function PageParamInfo$Type(enum$name, enum$ordinal) {
  Enum.call(this, enum$name, enum$ordinal);
}
defineClass(42, 9, {3:1, 11:1, 9:1, 42:1}, PageParamInfo$Type);
var PAGE_NUMBER, UNKNOWN, UNSET, Lorg_chromium_distiller_PageParamInfo$Type_2_classLit = createForEnum(42, function() {
  $clinit_PageParamInfo$Type();
  return initValues(getClassLiteralForArray_0(Lorg_chromium_distiller_PageParamInfo$Type_2_classLit, 1), $intern_4, 42, 0, [UNSET, PAGE_NUMBER, UNKNOWN]);
});
function initBadPageParamNames() {
  sBadPageParamNames || (sBadPageParamNames = new HashSet, $add_2(sBadPageParamNames, "baixar-gratis"), $add_2(sBadPageParamNames, "category"), $add_2(sBadPageParamNames, "content"), $add_2(sBadPageParamNames, "day"), $add_2(sBadPageParamNames, "date"), $add_2(sBadPageParamNames, "definition"), $add_2(sBadPageParamNames, "etiket"), $add_2(sBadPageParamNames, "film-seyret"), $add_2(sBadPageParamNames, "key"), $add_2(sBadPageParamNames, "keys"), $add_2(sBadPageParamNames, "keyword"), $add_2(sBadPageParamNames, 
  "label"), $add_2(sBadPageParamNames, "news"), $add_2(sBadPageParamNames, "q"), $add_2(sBadPageParamNames, "query"), $add_2(sBadPageParamNames, "rating"), $add_2(sBadPageParamNames, "s"), $add_2(sBadPageParamNames, "search"), $add_2(sBadPageParamNames, "seasons"), $add_2(sBadPageParamNames, "search_keyword"), $add_2(sBadPageParamNames, "search_query"), $add_2(sBadPageParamNames, "sortby"), $add_2(sBadPageParamNames, "subscriptions"), $add_2(sBadPageParamNames, "tag"), $add_2(sBadPageParamNames, 
  "tags"), $add_2(sBadPageParamNames, "video"), $add_2(sBadPageParamNames, "videos"), $add_2(sBadPageParamNames, "w"), $add_2(sBadPageParamNames, "wiki"));
}
var sBadPageParamNames = null, sDigitsRegExp = null;
function $compareAndUpdate(this$static, state) {
  var ret;
  if (this$static.mBestPageParamInfo) {
    ret = this$static.mBestPageParamInfo;
    var other = state.mBestPageParamInfo;
    ret = ret.mFormula && !other.mFormula ? 1 : !ret.mFormula && other.mFormula ? -1 : ret.mType == other.mType ? 0 : ret.mType == ($clinit_PageParamInfo$Type(), PAGE_NUMBER) ? 1 : other.mType == PAGE_NUMBER ? -1 : 0;
    -1 == ret ? (this$static.mBestPageParamInfo = state.mBestPageParamInfo, this$static.mMultiPagePatterns = state.mMultiPagePatterns) : 0 == ret && (this$static.mMultiPagePatterns = !0);
  } else {
    this$static.mBestPageParamInfo = state.mBestPageParamInfo, this$static.mMultiPagePatterns = state.mMultiPagePatterns;
  }
}
function PageParameterDetector$DetectionState() {
}
function PageParameterDetector$DetectionState_0(pageParamInfo) {
  this.mBestPageParamInfo = pageParamInfo;
}
defineClass(71, 1, {}, PageParameterDetector$DetectionState, PageParameterDetector$DetectionState_0);
_.mBestPageParamInfo = null;
_.mMultiPagePatterns = !1;
createForClass(71);
function $add_4(this$static, pattern, link_0) {
  var patternStr;
  patternStr = pattern.toString$();
  $hasStringValue(this$static.map_0, patternStr) ? $add_0($getStringValue(this$static.map_0, patternStr).mLinks, link_0) : $putStringValue(this$static.map_0, patternStr, new PageParameterDetector$PageCandidatesMap$Info(pattern, link_0));
}
function PageParameterDetector$PageCandidatesMap() {
  this.map_0 = new HashMap;
}
defineClass(127, 1, {}, PageParameterDetector$PageCandidatesMap);
createForClass(127);
function PageParameterDetector$PageCandidatesMap$Info(pattern, link_0) {
  this.mPattern = pattern;
  this.mLinks = new ArrayList;
  $add_0(this.mLinks, link_0);
}
defineClass(128, 1, {}, PageParameterDetector$PageCandidatesMap$Info);
createForClass(128);
function $clinit_PageParameterParser() {
  $clinit_PageParameterParser = emptyMethod;
  sHrefCleaner = /\/$/;
}
function $findAndAddClosestValidLeafNodes(this$static, start_0, checkStart, backward, baseAnchor) {
  var node;
  node = checkStart ? start_0 : backward ? start_0.previousSibling : start_0.nextSibling;
  if (!node) {
    return node = start_0.parentNode, !sInvalidParentWrapper && (sInvalidParentWrapper = /(BODY)|(HTML)/), sInvalidParentWrapper.test(node.nodeName) ? !1 : $findAndAddClosestValidLeafNodes(this$static, node, !1, backward, baseAnchor);
  }
  checkStart = !1;
  switch(node.nodeType) {
    case 3:
      start_0 = node.nodeValue;
      if (!start_0.length || ($clinit_StringUtil(), 0 == sWordCounter.count(start_0))) {
        break;
      }
      start_0 = node.nodeValue;
      var added, match_0, termWithDigits;
      if (containsDigit(start_0)) {
        sTermsRegExp ? sTermsRegExp.lastIndex = 0 : sTermsRegExp = RegExp("(\\S*[\\w\u00c0-\u1fff\u2c00-\ud7ff]\\S*)", "gi");
        !sSurroundingDigitsRegExp && (sSurroundingDigitsRegExp = /^[\W_]*(\d+)[\W_]*$/i);
        for (added = !1;;) {
          match_0 = sTermsRegExp.exec(start_0);
          if (!match_0) {
            break;
          }
          1 >= match_0.length || (match_0 = match_0[1], termWithDigits = sSurroundingDigitsRegExp.exec(match_0), match_0 = -1, termWithDigits && 1 < termWithDigits.length && (match_0 = toNumber(termWithDigits[1])), 0 <= match_0 && 100 >= match_0 ? ($addPageInfo(this$static.mAdjacentNumbersGroups, new PageParamInfo$PageInfo(match_0, "")), added = !0) : $addGroup(this$static.mAdjacentNumbersGroups));
        }
        start_0 = added;
      } else {
        $addGroup(this$static.mAdjacentNumbersGroups), start_0 = !1;
      }
      if (backward || !start_0) {
        return!1;
      }
      break;
    case 1:
      if (start_0 = node, $equalsIgnoreCase("A", start_0.tagName)) {
        if (backward) {
          return!1;
        }
        ++this$static.mNumForwardLinksProcessed;
        (start_0 = $getPageInfoAndText(this$static, start_0, baseAnchor)) ? ($addPageInfo(this$static.mAdjacentNumbersGroups, start_0.mPageInfo), start_0 = !0) : ($addGroup(this$static.mAdjacentNumbersGroups), start_0 = !1);
        if (!start_0) {
          return!1;
        }
        break;
      }
    ;
    default:
      if (!node.hasChildNodes()) {
        break;
      }
      checkStart = !0;
      backward ? node = node.lastChild : node = node.firstChild;
  }
  return $findAndAddClosestValidLeafNodes(this$static, node, checkStart, backward, baseAnchor);
}
function $getPageInfoAndText(this$static, link_0, baseAnchor) {
  var isEmptyHref, isJavascriptLink, linkHref, number;
  if (!isVisible(link_0)) {
    return null;
  }
  number = jsTrim(getInnerText(link_0));
  number = $replaceAll(number, "[()\\[\\]{}]");
  number = $trim(number);
  number = toNumber(number);
  if (!(0 <= number && 100 >= number)) {
    return null;
  }
  isEmptyHref = $getAttribute(link_0, "href");
  isEmptyHref.length ? (baseAnchor.setAttribute("href", isEmptyHref), linkHref = baseAnchor.href) : linkHref = "";
  isEmptyHref = !linkHref.length;
  isJavascriptLink = !1;
  baseAnchor = null;
  if (!isEmptyHref) {
    isJavascriptLink = "javascript:" === linkHref.substr(0, 11);
    baseAnchor = create_0(linkHref);
    if (!baseAnchor || !isJavascriptLink && !$equalsIgnoreCase(baseAnchor.mUrl.host, this$static.mParsedUrl.mUrl.host)) {
      return null;
    }
    baseAnchor.mUrl.hash = "";
  }
  if (!(this$static = isEmptyHref || isJavascriptLink)) {
    link_0 = getComputedStyle_0(link_0);
    link_0 = link_0.cursor.toUpperCase();
    $clinit_Style$Cursor();
    this$static = ($clinit_Style$Cursor$Map(), $MAP);
    checkNotNull(link_0);
    this$static = this$static[":" + link_0];
    link_0 = initValues(getClassLiteralForArray_0(Ljava_lang_Object_2_classLit, 1), $intern_3, 1, 3, [link_0]);
    if (!this$static) {
      throw new IllegalArgumentException(format("Enum constant undefined: %s", link_0));
    }
    this$static = this$static == ($clinit_Style$Cursor(), TEXT);
  }
  return this$static ? new PageParameterParser$PageInfoAndText(number, "") : new PageParameterParser$PageInfoAndText(number, toStringSimple(baseAnchor.mUrl).replace(sHrefCleaner, ""));
}
function PageParameterParser(timingInfo) {
  this.mAdjacentNumbersGroups = new MonotonicPageInfosGroups;
  this.mTimingInfo = timingInfo;
}
defineClass(109, 1, {}, PageParameterParser);
_.mDocUrl = "";
_.mNumForwardLinksProcessed = 0;
_.mParsedUrl = null;
var sHrefCleaner, sInvalidParentWrapper = null, sSurroundingDigitsRegExp = null, sTermsRegExp = null;
createForClass(109);
function PageParameterParser$PageInfoAndText(number, url_0) {
  this.mPageInfo = new PageParamInfo$PageInfo(number, url_0);
}
defineClass(80, 1, {}, PageParameterParser$PageInfoAndText);
createForClass(80);
function $clinit_PagingLinksFinder() {
  $clinit_PagingLinksFinder = emptyMethod;
  REG_NEXT_LINK = RegExp("(next|weiter|continue|\x3e([^\\|]|$)|\u00bb([^\\|]|$))", "i");
  REG_PREV_LINK = RegExp("(prev|early|old|new|\x3c|\u00ab)", "i");
  REG_POSITIVE = /article|body|content|entry|hentry|main|page|pagination|post|text|blog|story/i;
  REG_NEGATIVE = RegExp("combx|comment|com-|contact|foot|footer|footnote|masthead|media|meta|outbrain|promo|related|shoutbox|sidebar|sponsor|shopping|tags|tool|widget", "i");
  REG_EXTRANEOUS = RegExp("print|archive|comment|discuss|e[\\-]?mail|share|reply|all|login|sign|single|as one|article|post|\u7bc7", "i");
  REG_PAGINATION = /pag(e|ing|inat)/i;
  REG_LINK_PAGINATION = /p(a|g|ag)?(e|ing|ination)?(=|\/)[0-9]{1,2}$/i;
  REG_FIRST_LAST = /(first|last)/i;
  REG_HREF_CLEANER = /\/?(#.*)?$/;
  REG_NUMBER = /\d/;
  mLinkDebugInfo = new HashMap;
}
function appendDbgStrForLink(link_0, message) {
  var dbgStr;
  3 > sDebugLevel || (dbgStr = "", $containsKey(mLinkDebugInfo, link_0) && (dbgStr = $get(mLinkDebugInfo, link_0)), !dbgStr.length || (dbgStr += "; "), $put(mLinkDebugInfo, link_0, dbgStr + message));
}
function createAnchorWithBase(base_url) {
  $clinit_PagingLinksFinder();
  var base, doc;
  doc = $doc;
  $clinit_DomUtil();
  doc = doc.implementation.createHTMLDocument();
  base = doc.createElement("base");
  base.href = base_url;
  (doc.head || doc.getElementsByTagName("head")[0]).appendChild(base);
  base_url = doc.createElement("a");
  doc.body.appendChild(base_url);
  return base_url;
}
function getBaseUrlForRelative(root, original_url) {
  $clinit_PagingLinksFinder();
  var baseAnchor, bases;
  bases = root.getElementsByTagName("BASE");
  if (0 == bases.length) {
    return original_url;
  }
  baseAnchor = createAnchorWithBase(original_url);
  bases = $getAttribute(bases[0], "href");
  baseAnchor.setAttribute("href", bases);
  return baseAnchor.href;
}
var REG_EXTRANEOUS, REG_FIRST_LAST, REG_HREF_CLEANER, REG_LINK_PAGINATION, REG_NEGATIVE, REG_NEXT_LINK, REG_NUMBER, REG_PAGINATION, REG_POSITIVE, REG_PREV_LINK, mLinkDebugInfo;
function PagingLinksFinder$PagingLinkObj(linkIndex, linkText, linkHref) {
  this.mLinkIndex = linkIndex;
  this.mScore = 0;
  this.mLinkText = linkText;
  this.mLinkHref = linkHref;
}
defineClass(110, 1, {}, PagingLinksFinder$PagingLinkObj);
_.mLinkIndex = -1;
_.mScore = 0;
createForClass(110);
function $getPathComponents(this$static) {
  var path;
  null == this$static.mPathComponents && (path = (null == this$static.mTrimmedPath && (this$static.mTrimmedPath = $getTrimmedPath_0(this$static.mUrl)), this$static.mTrimmedPath), path.length ? this$static.mPathComponents = ($clinit_StringUtil(), $split(path, "\\/")) : this$static.mPathComponents = initDim(Ljava_lang_String_2_classLit, $intern_7, 2, 0, 4));
  return this$static.mPathComponents;
}
function ParsedUrl(url_0) {
  this.mUrl = url_0;
}
function create_0(urlStr) {
  var url_0;
  try {
    url_0 = new URL(urlStr);
  } catch (e) {
    url_0 = null;
  }
  return url_0 ? new ParsedUrl(url_0) : null;
}
defineClass(70, 1, {70:1}, ParsedUrl);
_.toString$ = function() {
  return toStringSimple(this.mUrl);
};
_.mPathComponents = null;
_.mQueryParams = null;
var sHrefCleaner_0 = _.mTrimmedPath = null, Lorg_chromium_distiller_ParsedUrl_2_classLit = createForClass(70);
function $getTrimmedPath_0(this$static) {
  this$static = this$static.pathname.replace(/;.*$/, "");
  this$static = this$static.replace(/^\//, "");
  return this$static.replace(/\/$/, "");
}
function $isCalendarPage(this$static) {
  var month, patternComponents;
  if (2 > this$static.mParamIndex) {
    return!1;
  }
  patternComponents = $getPathComponents(this$static.mUrl);
  if (4 != patternComponents[this$static.mParamIndex].length) {
    return!1;
  }
  month = toNumber(patternComponents[this$static.mParamIndex - 1]);
  return 0 < month && 12 >= month && (this$static = toNumber(patternComponents[this$static.mParamIndex - 2]), 1970 < this$static && 3E3 > this$static) ? !0 : !1;
}
function $isPagingUrlForNotStartOfPathComponent(this$static, url_0) {
  var firstDiffPos, maxPos, suffixStart, urlLen;
  urlLen = url_0.length;
  suffixStart = urlLen - this$static.mSuffix.length;
  if (!$startsWith(url_0, this$static.mPrefix)) {
    return!1;
  }
  firstDiffPos = this$static.mPlaceholderSegmentStart;
  for (maxPos = min_0(this$static.mPlaceholderStart, suffixStart);firstDiffPos < maxPos && url_0.charCodeAt(firstDiffPos) == this$static.mUrlStr.charCodeAt(firstDiffPos);firstDiffPos++) {
  }
  if (firstDiffPos == suffixStart) {
    if (maxPos = firstDiffPos + 1 == this$static.mPlaceholderStart) {
      maxPos = this$static.mUrlStr.charCodeAt(firstDiffPos), 128 > maxPos ? (suffixStart = ($clinit_Character$BoxedValues(), boxedValues_0)[maxPos], !suffixStart && (suffixStart = boxedValues_0[maxPos] = new Character(maxPos)), maxPos = suffixStart) : maxPos = new Character(maxPos), maxPos = /[-_;,]/.test(maxPos);
    }
    if (maxPos || firstDiffPos + this$static.mSuffix.length == urlLen) {
      return!0;
    }
  } else {
    if (firstDiffPos == this$static.mPlaceholderStart && 0 <= toNumber(url_0.substr(firstDiffPos, suffixStart - firstDiffPos))) {
      return!0;
    }
  }
  return!1;
}
function PathComponentPagePattern(url_0, pathStart, digitStart, digitEnd) {
  var valueStr;
  url_0 = toStringSimple(url_0.mUrl);
  a: {
    if (47 == url_0.charCodeAt(digitStart - 1) && pathStart < digitStart - 1 && (valueStr = url_0.substr(digitEnd, url_0.length - digitEnd).toLowerCase(), !sExtRegExp && (sExtRegExp = /(.s?html?)?$/i), sExtRegExp.test(valueStr) && (!sLastPathComponentRegExp && (sLastPathComponentRegExp = /([^/]*)\/$/i), pathStart = url_0.substr(pathStart + 1, digitStart - (pathStart + 1)), (pathStart = sLastPathComponentRegExp.exec(pathStart)) && 1 < pathStart.length && (initBadPageParamNames(), $contains_2(sBadPageParamNames, 
    pathStart[1].toLowerCase()))))) {
      pathStart = !0;
      break a;
    }
    pathStart = !1;
  }
  if (pathStart) {
    throw new IllegalArgumentException("Bad last numeric path component");
  }
  valueStr = url_0.substr(digitStart, digitEnd - digitStart);
  pathStart = toNumber(valueStr);
  if (0 > pathStart) {
    throw new IllegalArgumentException("Value in path component is an invalid number: " + valueStr);
  }
  digitEnd = url_0.substr(0, digitStart) + "[*!]" + url_0.substr(digitEnd, url_0.length - digitEnd);
  this.mUrl = create_0(digitEnd);
  if (!this.mUrl) {
    throw new IllegalArgumentException("Invalid URL: " + digitEnd);
  }
  this.mUrlStr = digitEnd;
  this.mPageNumber = pathStart;
  this.mPlaceholderStart = digitStart;
  this.mPlaceholderSegmentStart = $lastIndexOf(this.mUrlStr, 47, this.mPlaceholderStart);
  digitStart = $getPathComponents(this.mUrl);
  for (this.mParamIndex = 0;this.mParamIndex < digitStart.length && -1 == digitStart[this.mParamIndex].indexOf("[*!]");this.mParamIndex++) {
  }
  this.mPrefix = $substring_0(this.mUrlStr, 0, this.mPlaceholderSegmentStart);
  digitEnd = this.mUrlStr.length;
  digitStart = digitEnd - this.mPlaceholderStart - 4;
  0 != digitStart && (this.mSuffix = $substring(this.mUrlStr, digitEnd - digitStart));
}
defineClass(185, 1, {}, PathComponentPagePattern);
_.isPagingUrl = function(url_0) {
  if (this.mSuffix.length && !$endsWith(url_0, this.mSuffix)) {
    url_0 = !1;
  } else {
    if (47 == this.mUrlStr.charCodeAt(this.mPlaceholderStart - 1)) {
      a: {
        var acceptLen, suffixLen, suffixStart, urlLen;
        urlLen = url_0.length;
        suffixLen = this.mSuffix.length;
        suffixStart = url_0.length - suffixLen;
        acceptLen = $lastIndexOf(this.mUrl.mUrl.pathname, 47, this.mPlaceholderSegmentStart - 1 - this.mUrl.mUrl.origin.length);
        if (-1 != acceptLen && (acceptLen += this.mUrl.mUrl.origin.length, acceptLen + suffixLen == urlLen)) {
          url_0 = $regionMatches(url_0, 0, this.mUrlStr, 0, acceptLen);
          break a;
        }
        $startsWith(url_0, this.mPrefix) ? (acceptLen = this.mPlaceholderSegmentStart + suffixLen, url_0 = acceptLen == urlLen ? !0 : acceptLen > urlLen || 47 != url_0.charCodeAt(this.mPlaceholderSegmentStart) ? !1 : 0 <= toNumber($substring_0(url_0, this.mPlaceholderSegmentStart + 1, suffixStart))) : url_0 = !1;
      }
    } else {
      url_0 = $isPagingUrlForNotStartOfPathComponent(this, url_0);
    }
  }
  return url_0;
};
_.isValidFor = function(docUrl) {
  var commonPrefixLen, patternPathComponentsLen;
  commonPrefixLen = $getPathComponents(docUrl).length;
  patternPathComponentsLen = $getPathComponents(this.mUrl).length;
  if (commonPrefixLen > patternPathComponentsLen) {
    return!1;
  }
  if (1 == commonPrefixLen && 1 == patternPathComponentsLen) {
    patternPathComponentsLen = $getPathComponents(docUrl)[0];
    docUrl = $getPathComponents(this.mUrl)[0];
    var limit;
    if (patternPathComponentsLen.length && docUrl.length) {
      for (limit = min_0(patternPathComponentsLen.length, docUrl.length), commonPrefixLen = 0;commonPrefixLen < limit && patternPathComponentsLen.charCodeAt(commonPrefixLen) == docUrl.charCodeAt(commonPrefixLen);commonPrefixLen++) {
      }
    } else {
      commonPrefixLen = 0;
    }
    limit = commonPrefixLen;
    var commonSuffixLen, i, j;
    commonSuffixLen = 0;
    i = patternPathComponentsLen.length - 1;
    for (j = docUrl.length - 1;i > limit && j > limit && patternPathComponentsLen.charCodeAt(i) == docUrl.charCodeAt(j);--i, --j, commonSuffixLen++) {
    }
    return 2 * (commonSuffixLen + commonPrefixLen) >= patternPathComponentsLen.length;
  }
  a: {
    commonSuffixLen = $getPathComponents(docUrl);
    limit = $getPathComponents(this.mUrl);
    commonPrefixLen = !1;
    for (patternPathComponentsLen = docUrl = 0;docUrl < commonSuffixLen.length && patternPathComponentsLen < limit.length;++docUrl, patternPathComponentsLen++) {
      if (docUrl == this.mParamIndex && !commonPrefixLen) {
        commonPrefixLen = !0, commonSuffixLen.length < limit.length && --docUrl;
      } else {
        if (!$equalsIgnoreCase(commonSuffixLen[docUrl], limit[patternPathComponentsLen])) {
          docUrl = !1;
          break a;
        }
      }
    }
    docUrl = !0;
  }
  return!docUrl || $isCalendarPage(this) ? !1 : !0;
};
_.toString$ = function() {
  return this.mUrlStr;
};
_.mPageNumber = 0;
_.mParamIndex = -1;
_.mPlaceholderSegmentStart = 0;
_.mPlaceholderStart = 0;
_.mSuffix = "";
var sExtRegExp = null, sLastPathComponentRegExp = null;
createForClass(185);
function QueryParamPagePattern(url_0, isFirstQueryParam, queryName, queryValue) {
  var urlLen;
  if (!queryName.length) {
    throw new IllegalArgumentException("Empty query name");
  }
  if (!queryValue.length) {
    throw new IllegalArgumentException("Empty query value");
  }
  if (!isStringAllDigits(queryValue)) {
    throw new IllegalArgumentException("Query value has non-digits: " + queryValue);
  }
  initBadPageParamNames();
  if ($contains_2(sBadPageParamNames, queryName.toLowerCase())) {
    throw new IllegalArgumentException("Query name is bad page param name: " + queryName);
  }
  urlLen = toNumber(queryValue);
  if (0 > urlLen) {
    throw new IllegalArgumentException("Query value is an invalid number: " + queryValue);
  }
  isFirstQueryParam = (isFirstQueryParam ? "?" : "\x26") + queryName + "\x3d";
  url_0 = url_0.mUrl.href.replace(isFirstQueryParam + queryValue, isFirstQueryParam + "[*!]");
  this.mUrl = create_0(url_0);
  if (!this.mUrl) {
    throw new IllegalArgumentException("Invalid URL: " + url_0);
  }
  this.mUrlStr = url_0;
  this.mPageNumber = urlLen;
  this.mPlaceholderStart = url_0.indexOf("[*!]");
  this.mQueryStart = $lastIndexOf(this.mUrlStr, 63, this.mPlaceholderStart - 1);
  this.mPlaceholderSegmentStart = $lastIndexOf(this.mUrlStr, 38, this.mPlaceholderStart - 1);
  -1 == this.mPlaceholderSegmentStart && (this.mPlaceholderSegmentStart = this.mQueryStart);
  !sHrefCleaner_1 && (sHrefCleaner_1 = /\/$/);
  this.mPrefix = $substring_0(this.mUrlStr, 0, this.mPlaceholderSegmentStart).replace(sHrefCleaner_1, "");
  urlLen = this.mUrlStr.length;
  this.mSuffixLen = urlLen - this.mPlaceholderStart - 4;
  0 != this.mSuffixLen && (this.mSuffix = $substring(this.mUrlStr, urlLen - this.mSuffixLen + 1));
}
defineClass(184, 1, {}, QueryParamPagePattern);
_.isPagingUrl = function(url_0) {
  var diffPart, suffixStart;
  if (0 != this.mSuffixLen && !$endsWith(url_0, this.mSuffix)) {
    return!1;
  }
  suffixStart = url_0.length - this.mSuffixLen;
  if (!$startsWith(url_0, this.mPrefix)) {
    return!1;
  }
  if (this.mPlaceholderSegmentStart == suffixStart || suffixStart == this.mPlaceholderSegmentStart - 1 && 47 == this.mUrlStr.charCodeAt(suffixStart)) {
    return!0;
  }
  diffPart = $substring_0(url_0, this.mPlaceholderSegmentStart, suffixStart).toLowerCase();
  !sSlashOrHtmExtRegExp && (sSlashOrHtmExtRegExp = /^\/|(.html?)$/i);
  return sSlashOrHtmExtRegExp.test(diffPart) ? !0 : $regionMatches(url_0, this.mPlaceholderSegmentStart, this.mUrlStr, this.mPlaceholderSegmentStart, this.mPlaceholderStart - this.mPlaceholderSegmentStart) ? 0 <= toNumber($substring_0(url_0, this.mPlaceholderStart, suffixStart)) : !1;
};
_.isValidFor = function(docUrl) {
  docUrl = (null == docUrl.mTrimmedPath && (docUrl.mTrimmedPath = $getTrimmedPath_0(docUrl.mUrl)), docUrl.mTrimmedPath);
  var this$static = this.mUrl;
  null == this$static.mTrimmedPath && (this$static.mTrimmedPath = $getTrimmedPath_0(this$static.mUrl));
  return $equalsIgnoreCase(docUrl, this$static.mTrimmedPath);
};
_.toString$ = function() {
  return this.mUrlStr;
};
_.mPageNumber = 0;
_.mPlaceholderSegmentStart = 0;
_.mPlaceholderStart = 0;
_.mQueryStart = 0;
_.mSuffix = "";
_.mSuffixLen = 0;
var sHrefCleaner_1 = null, sSlashOrHtmExtRegExp = null;
createForClass(184);
function $clinit_SchemaOrgParser() {
  $clinit_SchemaOrgParser = emptyMethod;
  sTypeUrls = new HashMap;
  $putStringValue(sTypeUrls, "http://schema.org/ImageObject", ($clinit_SchemaOrgParser$Type(), IMAGE));
  $putStringValue(sTypeUrls, "http://schema.org/Article", ARTICLE_0);
  $putStringValue(sTypeUrls, "http://schema.org/BlogPosting", ARTICLE_0);
  $putStringValue(sTypeUrls, "http://schema.org/NewsArticle", ARTICLE_0);
  $putStringValue(sTypeUrls, "http://schema.org/ScholarlyArticle", ARTICLE_0);
  $putStringValue(sTypeUrls, "http://schema.org/TechArticle", ARTICLE_0);
  $putStringValue(sTypeUrls, "http://schema.org/Person", PERSON);
  $putStringValue(sTypeUrls, "http://schema.org/Organization", ORGANIZATION);
  $putStringValue(sTypeUrls, "http://schema.org/Corporation", ORGANIZATION);
  $putStringValue(sTypeUrls, "http://schema.org/EducationalOrganization", ORGANIZATION);
  $putStringValue(sTypeUrls, "http://schema.org/GovernmentOrganization", ORGANIZATION);
  $putStringValue(sTypeUrls, "http://schema.org/NGO", ORGANIZATION);
  sTagAttributeMap = new HashMap;
  $putStringValue(sTagAttributeMap, "IMG", "SRC");
  $putStringValue(sTagAttributeMap, "AUDIO", "SRC");
  $putStringValue(sTagAttributeMap, "EMBED", "SRC");
  $putStringValue(sTagAttributeMap, "IFRAME", "SRC");
  $putStringValue(sTagAttributeMap, "SOURCE", "SRC");
  $putStringValue(sTagAttributeMap, "TRACK", "SRC");
  $putStringValue(sTagAttributeMap, "VIDEO", "SRC");
  $putStringValue(sTagAttributeMap, "A", "HREF");
  $putStringValue(sTagAttributeMap, "LINK", "HREF");
  $putStringValue(sTagAttributeMap, "AREA", "HREF");
  $putStringValue(sTagAttributeMap, "META", "CONTENT");
  $putStringValue(sTagAttributeMap, "TIME", "DATETIME");
  $putStringValue(sTagAttributeMap, "OBJECT", "DATA");
  $putStringValue(sTagAttributeMap, "DATA", "VALUE");
  $putStringValue(sTagAttributeMap, "METER", "VALUE");
}
function $getArticleItems(this$static) {
  var articles, i, item_0;
  articles = new ArrayList;
  for (i = 0;i < this$static.mItemScopes.array.length;i++) {
    item_0 = $get_2(this$static.mItemScopes, i), item_0.mType == ($clinit_SchemaOrgParser$Type(), ARTICLE_0) && $add_0(articles, item_0);
  }
  return articles;
}
function $parseElement(this$static, e, parentItem) {
  var isItemScope, newItem, propertyNames, value_0, tagName;
  newItem = null;
  isItemScope = e.hasAttribute("ITEMSCOPE") && e.hasAttribute("ITEMTYPE");
  if (parentItem) {
    var splits;
    propertyNames = $getAttribute(e, "ITEMPROP");
    propertyNames.length ? (splits = ($clinit_StringUtil(), $split(propertyNames, "\\s+")), propertyNames = 0 < splits.length ? splits : initValues(getClassLiteralForArray_0(Ljava_lang_String_2_classLit, 1), $intern_7, 2, 4, [propertyNames])) : propertyNames = initDim(Ljava_lang_String_2_classLit, $intern_7, 2, 0, 4);
  } else {
    propertyNames = initDim(Ljava_lang_String_2_classLit, $intern_7, 2, 0, 4);
  }
  if (isItemScope) {
    a: {
      var type_1;
      switch((type_1 = $getAttribute(e, "ITEMTYPE"), $hasStringValue(sTypeUrls, type_1) ? $getStringValue(sTypeUrls, type_1) : ($clinit_SchemaOrgParser$Type(), UNSUPPORTED)).ordinal) {
        case 0:
          newItem = new SchemaOrgParser$ImageItem(e);
          break;
        case 1:
          newItem = new SchemaOrgParser$ArticleItem(e);
          break;
        case 2:
          newItem = new SchemaOrgParser$PersonItem(e);
          break;
        case 3:
          newItem = new SchemaOrgParser$OrganizationItem(e);
          break;
        case 4:
          newItem = new SchemaOrgParser$UnsupportedItem(e);
          break;
        default:
          newItem = null;
          break a;
      }
    }
    !newItem || newItem.mType == ($clinit_SchemaOrgParser$Type(), UNSUPPORTED) || parentItem && parentItem.mType == ($clinit_SchemaOrgParser$Type(), UNSUPPORTED) && 0 != propertyNames.length || ($add_0(this$static.mItemScopes, newItem), $put(this$static.mItemElement, e, newItem));
  }
  if (0 < propertyNames.length && parentItem.mType != ($clinit_SchemaOrgParser$Type(), UNSUPPORTED) && (!newItem || newItem.mType != ($clinit_SchemaOrgParser$Type(), UNSUPPORTED))) {
    for (this$static = 0;this$static < propertyNames.length;this$static++) {
      newItem ? $hasStringValue(parentItem.mItemProperties, propertyNames[this$static]) && $putStringValue(parentItem.mItemProperties, propertyNames[this$static], newItem) : (isItemScope = parentItem, type_1 = propertyNames[this$static], splits = (value_0 = "", tagName = e.tagName, $hasStringValue(sTagAttributeMap, tagName) && (value_0 = $getAttribute(e, $getStringValue(sTagAttributeMap, tagName))), !value_0.length && (value_0 = javascriptTextContent(e)), value_0), $hasStringValue(isItemScope.mStringProperties, 
      type_1) && !$getStringValue(isItemScope.mStringProperties, type_1).length && $putStringValue(isItemScope.mStringProperties, type_1, splits));
    }
  }
}
function SchemaOrgParser(root, timingInfo) {
  $clinit_SchemaOrgParser();
  var startTime;
  this.mItemScopes = new ArrayList;
  this.mItemElement = new HashMap;
  this.mTimingInfo = timingInfo;
  startTime = getTime();
  var allProp, e, i, author, tagName;
  allProp = querySelectorAll(root, "[ITEMPROP],[ITEMSCOPE]");
  $parseElement(this, root, null);
  for (i = 0;i < allProp.length;i++) {
    for (var JSCompiler_temp_const = e = allProp[i], parentElement = void 0, parentItem = void 0, parentItem = null, parentElement = e;parentElement;) {
      parentElement = $getParentElement(parentElement);
      if (!parentElement) {
        break;
      }
      if (parentElement.hasAttribute("ITEMSCOPE") && parentElement.hasAttribute("ITEMTYPE")) {
        $containsKey(this.mItemElement, parentElement) && (parentItem = $get(this.mItemElement, parentElement));
        break;
      }
    }
    $parseElement(this, JSCompiler_temp_const, parentItem);
  }
  allProp = querySelectorAll(root, "A[rel\x3dauthor],LINK[rel\x3dauthor]");
  for (i = 0;i < allProp.length;i++) {
    e = allProp[i], !this.mAuthorFromRel.length && (this.mAuthorFromRel = (author = "", tagName = e.tagName, ($equalsIgnoreCase(tagName, "A") || $equalsIgnoreCase(tagName, "LINK")) && $equalsIgnoreCase($getAttribute(e, "REL"), "author") && (author = javascriptTextContent(e)), author));
  }
  addTimingInfo(startTime, this.mTimingInfo, "SchemaOrgParser.parse");
}
function concat_0(first, second) {
  $clinit_SchemaOrgParser();
  var concat;
  concat = first;
  first.length && second.length && (concat += " ");
  return concat + second;
}
defineClass(28, 1, {}, SchemaOrgParser);
_.mAuthorFromRel = "";
var sTagAttributeMap, sTypeUrls;
createForClass(28);
function $getStringProperty(this$static, name_0) {
  return $hasStringValue(this$static.mStringProperties, name_0) ? $getStringValue(this$static.mStringProperties, name_0) : "";
}
function SchemaOrgParser$ThingItem(type_0, element) {
  this.mElement = element;
  this.mType = type_0;
  this.mStringProperties = new HashMap;
  this.mItemProperties = new HashMap;
  $putStringValue(this.mStringProperties, "name", "");
  $putStringValue(this.mStringProperties, "url", "");
  $putStringValue(this.mStringProperties, "description", "");
  $putStringValue(this.mStringProperties, "image", "");
}
defineClass(45, 1, {});
createForClass(45);
function $getPersonOrOrganizationName(this$static, propertyName) {
  var value_0, valueItem, name_0, name_1;
  value_0 = $hasStringValue(this$static.mStringProperties, propertyName) ? $getStringValue(this$static.mStringProperties, propertyName) : "";
  if (value_0.length) {
    return value_0;
  }
  (valueItem = $hasStringValue(this$static.mItemProperties, propertyName) ? $getStringValue(this$static.mItemProperties, propertyName) : null) && (valueItem.mType == ($clinit_SchemaOrgParser$Type(), PERSON) ? value_0 = (name_0 = $hasStringValue(valueItem.mStringProperties, "name") ? $getStringValue(valueItem.mStringProperties, "name") : "", name_0.length ? name_0 : concat_0($hasStringValue(valueItem.mStringProperties, "givenName") ? $getStringValue(valueItem.mStringProperties, "givenName") : "", 
  $hasStringValue(valueItem.mStringProperties, "familyName") ? $getStringValue(valueItem.mStringProperties, "familyName") : "")) : valueItem.mType == ORGANIZATION && (value_0 = (name_1 = $hasStringValue(valueItem.mStringProperties, "name") ? $getStringValue(valueItem.mStringProperties, "name") : "", name_1.length ? name_1 : $hasStringValue(valueItem.mStringProperties, "legalName") ? $getStringValue(valueItem.mStringProperties, "legalName") : "")));
  return value_0;
}
function SchemaOrgParser$ArticleItem(element) {
  SchemaOrgParser$ThingItem.call(this, ($clinit_SchemaOrgParser$Type(), ARTICLE_0), element);
  $putStringValue(this.mStringProperties, "headline", "");
  $putStringValue(this.mStringProperties, "publisher", "");
  $putStringValue(this.mStringProperties, "copyrightHolder", "");
  $putStringValue(this.mStringProperties, "copyrightYear", "");
  $putStringValue(this.mStringProperties, "dateModified", "");
  $putStringValue(this.mStringProperties, "datePublished", "");
  $putStringValue(this.mStringProperties, "author", "");
  $putStringValue(this.mStringProperties, "creator", "");
  $putStringValue(this.mStringProperties, "articleSection", "");
  $put(this.mItemProperties, "publisher", null);
  $put(this.mItemProperties, "copyrightHolder", null);
  $put(this.mItemProperties, "author", null);
  $put(this.mItemProperties, "creator", null);
  $put(this.mItemProperties, "associatedMedia", null);
  $put(this.mItemProperties, "encoding", null);
}
defineClass(152, 45, {}, SchemaOrgParser$ArticleItem);
createForClass(152);
function SchemaOrgParser$ImageItem(element) {
  SchemaOrgParser$ThingItem.call(this, ($clinit_SchemaOrgParser$Type(), IMAGE), element);
  $putStringValue(this.mStringProperties, "contentUrl", "");
  $putStringValue(this.mStringProperties, "encodingFormat", "");
  $putStringValue(this.mStringProperties, "caption", "");
  $putStringValue(this.mStringProperties, "representativeOfPage", "");
  $putStringValue(this.mStringProperties, "width", "");
  $putStringValue(this.mStringProperties, "height", "");
}
defineClass(151, 45, {}, SchemaOrgParser$ImageItem);
createForClass(151);
function SchemaOrgParser$OrganizationItem(element) {
  SchemaOrgParser$ThingItem.call(this, ($clinit_SchemaOrgParser$Type(), ORGANIZATION), element);
  $putStringValue(this.mStringProperties, "legalName", "");
}
defineClass(154, 45, {}, SchemaOrgParser$OrganizationItem);
createForClass(154);
function SchemaOrgParser$PersonItem(element) {
  SchemaOrgParser$ThingItem.call(this, ($clinit_SchemaOrgParser$Type(), PERSON), element);
  $putStringValue(this.mStringProperties, "familyName", "");
  $putStringValue(this.mStringProperties, "givenName", "");
}
defineClass(153, 45, {}, SchemaOrgParser$PersonItem);
createForClass(153);
function $clinit_SchemaOrgParser$Type() {
  $clinit_SchemaOrgParser$Type = emptyMethod;
  IMAGE = new SchemaOrgParser$Type("IMAGE", 0);
  ARTICLE_0 = new SchemaOrgParser$Type("ARTICLE", 1);
  PERSON = new SchemaOrgParser$Type("PERSON", 2);
  ORGANIZATION = new SchemaOrgParser$Type("ORGANIZATION", 3);
  UNSUPPORTED = new SchemaOrgParser$Type("UNSUPPORTED", 4);
}
function SchemaOrgParser$Type(enum$name, enum$ordinal) {
  Enum.call(this, enum$name, enum$ordinal);
}
defineClass(33, 9, {3:1, 11:1, 9:1, 33:1}, SchemaOrgParser$Type);
var ARTICLE_0, IMAGE, ORGANIZATION, PERSON, UNSUPPORTED, Lorg_chromium_distiller_SchemaOrgParser$Type_2_classLit = createForEnum(33, function() {
  $clinit_SchemaOrgParser$Type();
  return initValues(getClassLiteralForArray_0(Lorg_chromium_distiller_SchemaOrgParser$Type_2_classLit, 1), $intern_4, 33, 0, [IMAGE, ARTICLE_0, PERSON, ORGANIZATION, UNSUPPORTED]);
});
function SchemaOrgParser$UnsupportedItem(element) {
  SchemaOrgParser$ThingItem.call(this, ($clinit_SchemaOrgParser$Type(), UNSUPPORTED), element);
}
defineClass(155, 45, {}, SchemaOrgParser$UnsupportedItem);
createForClass(155);
function SchemaOrgParserAccessor(root, timingInfo) {
  this.mRoot = root;
  this.mTimingInfo = timingInfo;
}
defineClass(120, 1, {}, SchemaOrgParserAccessor);
_.getArticle = function() {
  var articles;
  !this.mParser && (this.mParser = new SchemaOrgParser(this.mRoot, this.mTimingInfo));
  articles = $getArticleItems(this.mParser);
  if (0 == articles.array.length) {
    articles = null;
  } else {
    articles = (checkElementIndex(0, articles.array.length), articles.array[0]);
    var article, author;
    article = new MarkupParser$Article;
    article.publishedTime = $hasStringValue(articles.mStringProperties, "datePublished") ? $getStringValue(articles.mStringProperties, "datePublished") : "";
    article.modifiedTime = $hasStringValue(articles.mStringProperties, "dateModified") ? $getStringValue(articles.mStringProperties, "dateModified") : "";
    article.section = $hasStringValue(articles.mStringProperties, "articleSection") ? $getStringValue(articles.mStringProperties, "articleSection") : "";
    author = $getPersonOrOrganizationName(articles, "author");
    !author.length && (author = $getPersonOrOrganizationName(articles, "creator"));
    article.authors = author.length ? initValues(getClassLiteralForArray_0(Ljava_lang_String_2_classLit, 1), $intern_7, 2, 4, [author]) : initDim(Ljava_lang_String_2_classLit, $intern_7, 2, 0, 4);
    articles = article;
  }
  return articles;
};
_.getAuthor = function() {
  var article, author;
  !this.mParser && (this.mParser = new SchemaOrgParser(this.mRoot, this.mTimingInfo));
  author = "";
  article = $getArticleItems(this.mParser);
  0 != article.array.length && (article = (checkElementIndex(0, article.array.length), article.array[0]), author = $getPersonOrOrganizationName(article, "author"), !author.length && (author = $getPersonOrOrganizationName(article, "creator")));
  return author.length ? author : this.mParser.mAuthorFromRel;
};
_.getCopyright = function() {
  var articles;
  !this.mParser && (this.mParser = new SchemaOrgParser(this.mRoot, this.mTimingInfo));
  articles = $getArticleItems(this.mParser);
  0 == articles.array.length ? articles = "" : (articles = (checkElementIndex(0, articles.array.length), articles.array[0]), articles = concat_0($hasStringValue(articles.mStringProperties, "copyrightYear") ? $getStringValue(articles.mStringProperties, "copyrightYear") : "", $getPersonOrOrganizationName(articles, "copyrightHolder")), articles = articles.length ? "Copyright " + articles : articles);
  return articles;
};
_.getDescription = function() {
  var articles;
  !this.mParser && (this.mParser = new SchemaOrgParser(this.mRoot, this.mTimingInfo));
  articles = $getArticleItems(this.mParser);
  return 0 == articles.array.length ? "" : $getStringProperty((checkElementIndex(0, articles.array.length), articles.array[0]), "description");
};
_.getImages = function() {
  var articleItem, articleItems, associatedImageOfArticle, hasRepresentativeImage, i, imageItem, images, image_0;
  !this.mParser && (this.mParser = new SchemaOrgParser(this.mRoot, this.mTimingInfo));
  images = new ArrayList;
  articleItems = $getArticleItems(this.mParser);
  associatedImageOfArticle = null;
  for (hasRepresentativeImage = 0;hasRepresentativeImage < articleItems.array.length;hasRepresentativeImage++) {
    articleItem = (checkElementIndex(hasRepresentativeImage, articleItems.array.length), articleItems.array[hasRepresentativeImage]);
    if (!associatedImageOfArticle && (associatedImageOfArticle = (i = $hasStringValue(articleItem.mItemProperties, "associatedMedia") ? $getStringValue(articleItem.mItemProperties, "associatedMedia") : null, !i && (i = $hasStringValue(articleItem.mItemProperties, "encoding") ? $getStringValue(articleItem.mItemProperties, "encoding") : null), i && i.mType == ($clinit_SchemaOrgParser$Type(), IMAGE) ? i : null))) {
      continue;
    }
    var imageUrl = imageItem = void 0, imageUrl = $hasStringValue(articleItem.mStringProperties, "image") ? $getStringValue(articleItem.mStringProperties, "image") : "";
    imageUrl.length ? (imageItem = new MarkupParser$Image, imageItem.url_0 = imageUrl, articleItem = imageItem) : articleItem = null;
    articleItem && (images.array[images.array.length] = articleItem);
  }
  hasRepresentativeImage = this.mParser;
  articleItems = new ArrayList;
  for (articleItem = 0;articleItem < hasRepresentativeImage.mItemScopes.array.length;articleItem++) {
    i = $get_2(hasRepresentativeImage.mItemScopes, articleItem), i.mType == ($clinit_SchemaOrgParser$Type(), IMAGE) && $add_0(articleItems, i);
  }
  hasRepresentativeImage = !1;
  for (i = 0;i < articleItems.array.length;i++) {
    imageItem = (checkElementIndex(i, articleItems.array.length), articleItems.array[i]), articleItem = (image_0 = new MarkupParser$Image, image_0.url_0 = $hasStringValue(imageItem.mStringProperties, "contentUrl") ? $getStringValue(imageItem.mStringProperties, "contentUrl") : "", !image_0.url_0.length && (image_0.url_0 = $hasStringValue(imageItem.mStringProperties, "url") ? $getStringValue(imageItem.mStringProperties, "url") : ""), image_0.type_0 = $hasStringValue(imageItem.mStringProperties, "encodingFormat") ? 
    $getStringValue(imageItem.mStringProperties, "encodingFormat") : "", image_0.caption_0 = $hasStringValue(imageItem.mStringProperties, "caption") ? $getStringValue(imageItem.mStringProperties, "caption") : "", image_0.width_0 = parseInt_0($hasStringValue(imageItem.mStringProperties, "width") ? $getStringValue(imageItem.mStringProperties, "width") : ""), image_0.height_0 = parseInt_0($hasStringValue(imageItem.mStringProperties, "height") ? $getStringValue(imageItem.mStringProperties, "height") : 
    ""), image_0), imageItem == associatedImageOfArticle || !hasRepresentativeImage && $equalsIgnoreCase($hasStringValue(imageItem.mStringProperties, "representativeOfPage") ? $getStringValue(imageItem.mStringProperties, "representativeOfPage") : "", "true") ? (hasRepresentativeImage = !0, checkPositionIndex(0, images.array.length), images.array.splice(0, 0, articleItem)) : images.array[images.array.length] = articleItem;
  }
  return $toArray_0(images, initDim(Lorg_chromium_distiller_MarkupParser$Image_2_classLit, $intern_3, 27, images.array.length, 0));
};
_.getPublisher = function() {
  var article, publisher;
  !this.mParser && (this.mParser = new SchemaOrgParser(this.mRoot, this.mTimingInfo));
  publisher = "";
  article = $getArticleItems(this.mParser);
  0 != article.array.length && (article = (checkElementIndex(0, article.array.length), article.array[0]), publisher = $getPersonOrOrganizationName(article, "publisher"), !publisher.length && (publisher = $getPersonOrOrganizationName(article, "copyrightHolder")));
  return publisher;
};
_.getTitle = function() {
  var i, item_0, title_0;
  !this.mParser && (this.mParser = new SchemaOrgParser(this.mRoot, this.mTimingInfo));
  title_0 = "";
  var articles = $getArticleItems(this.mParser), articles = new ArrayList_0(articles), c = new SchemaOrgParserAccessor$1;
  i = cloneSubrange(articles.array, articles.array.length);
  item_0 = i.length;
  var length_0, copy;
  !c && (c = ($clinit_Comparators(), $clinit_Comparators(), NATURAL));
  length_0 = item_0 - 0;
  copy = initValues(getClassLiteralForArray_0(Ljava_lang_Object_2_classLit, 1), $intern_3, 1, 3, [valueOf_2(0), valueOf_2(item_0)]);
  if (!(0 <= length_0)) {
    throw new IllegalArgumentException(format("%s \x3e %s", copy));
  }
  copy = createFrom(i, length_0);
  var len = min_0(i.length - 0, length_0), destOfs = length_0 = 0, destComp, destType, srcComp, srcType, srclen;
  if (null == i) {
    throw new NullPointerException_0("src");
  }
  if (null == copy) {
    throw new NullPointerException_0("dest");
  }
  srcType = getClass__Ljava_lang_Class___devirtual$(i);
  destType = getClass__Ljava_lang_Class___devirtual$(copy);
  checkArrayType(0 != (srcType.modifiers & 4), "srcType is not an array");
  checkArrayType(0 != (destType.modifiers & 4), "destType is not an array");
  srcComp = srcType.componentType;
  destComp = destType.componentType;
  checkArrayType(0 != (srcComp.modifiers & 1) ? srcComp == destComp : 0 == (destComp.modifiers & 1), "Array types don't match");
  srclen = i.length;
  destComp = copy.length;
  if (0 > length_0 || 0 > destOfs || 0 > len || length_0 + len > srclen || destOfs + len > destComp) {
    throw new IndexOutOfBoundsException;
  }
  if (0 != (srcComp.modifiers & 1) && 0 == (srcComp.modifiers & 4) || srcType == destType) {
    0 < len && nativeArraySplice(i, length_0, copy, destOfs, len, !0);
  } else {
    if (maskUndefined(i) === maskUndefined(copy) && length_0 < destOfs) {
      for (length_0 += len, len = destOfs + len;len-- > destOfs;) {
        copy[len] = i[--length_0];
      }
    } else {
      for (len = destOfs + len;destOfs < len;) {
        copy[destOfs++] = i[length_0++];
      }
    }
  }
  mergeSort_0(copy, i, 0, item_0, -0, c);
  c = articles.array.length;
  for (item_0 = 0;item_0 < c;item_0++) {
    $set(articles, item_0, i[item_0]);
  }
  for (i = 0;i < articles.array.length && !title_0.length;i++) {
    item_0 = (checkElementIndex(i, articles.array.length), articles.array[i]), title_0 = $hasStringValue(item_0.mStringProperties, "headline") ? $getStringValue(item_0.mStringProperties, "headline") : "", !title_0.length && (title_0 = $hasStringValue(item_0.mStringProperties, "name") ? $getStringValue(item_0.mStringProperties, "name") : "");
  }
  return title_0;
};
_.getType = function() {
  !this.mParser && (this.mParser = new SchemaOrgParser(this.mRoot, this.mTimingInfo));
  return 0 == $getArticleItems(this.mParser).array.length ? "" : "Article";
};
_.getUrl = function() {
  var articles;
  !this.mParser && (this.mParser = new SchemaOrgParser(this.mRoot, this.mTimingInfo));
  articles = $getArticleItems(this.mParser);
  return 0 == articles.array.length ? "" : $getStringProperty((checkElementIndex(0, articles.array.length), articles.array[0]), "url");
};
_.optOut = function() {
  return!1;
};
createForClass(120);
function SchemaOrgParserAccessor$1() {
}
defineClass(121, 1, {}, SchemaOrgParserAccessor$1);
_.compare = function(i1, i2) {
  var area1, area2;
  area1 = getArea(i1.mElement);
  area2 = getArea(i2.mElement);
  return area1 > area2 ? -1 : area1 < area2 ? 1 : 0;
};
createForClass(121);
function $clinit_StringUtil() {
  $clinit_StringUtil = emptyMethod;
  sWordCounter = new StringUtil$FullWordCounter;
}
function containsDigit(s) {
  $clinit_StringUtil();
  return/\d/.test(s);
}
function decodeURIComponent_0(input_0) {
  $clinit_StringUtil();
  return decodeURIComponent(input_0);
}
function isStringAllDigits(s) {
  $clinit_StringUtil();
  return/^\d+$/.test(s);
}
function isStringAllWhitespace(s) {
  $clinit_StringUtil();
  return!/\S/.test(s);
}
function join_1(strings, sep) {
  $clinit_StringUtil();
  return strings.join(sep);
}
function jsSplit(input_0) {
  $clinit_StringUtil();
  return input_0.split(",");
}
function jsTrim(s) {
  $clinit_StringUtil();
  return s.trim();
}
function toNumber(s) {
  $clinit_StringUtil();
  return s.length && isStringAllDigits(s) ? parseInt_0(s) : -1;
}
var sWordCounter;
function StringUtil$FastWordCounter() {
}
defineClass(108, 1, {}, StringUtil$FastWordCounter);
_.count = function(s) {
  return(s = s.match(/(\S*[\w\u00C0-\u1FFF]\S*)/g)) ? s.length : 0;
};
createForClass(108);
function StringUtil$FullWordCounter() {
}
defineClass(79, 1, {}, StringUtil$FullWordCounter);
_.count = function(s) {
  var m = s.match(/(\S*[\w\u00C0-\u1FFF\uAC00-\uD7AF]\S*)/g), c = m ? m.length : 0, m = s.match(/([\u3040-\uA4CF])/g);
  return c += Math.ceil(0.55 * (m ? m.length : 0));
};
createForClass(79);
function StringUtil$LetterWordCounter() {
}
defineClass(107, 1, {}, StringUtil$LetterWordCounter);
_.count = function(s) {
  return(s = s.match(/(\S*[\w\u00C0-\u1FFF\uAC00-\uD7AF]\S*)/g)) ? s.length : 0;
};
createForClass(107);
function $clinit_TableClassifier() {
  $clinit_TableClassifier = emptyMethod;
  sHeaderTags = new HashMap;
  $putStringValue(sHeaderTags, "COLGROUP", ($clinit_Boolean(), FALSE));
  $putStringValue(sHeaderTags, "COL", FALSE);
  $putStringValue(sHeaderTags, "TH", TRUE);
  sObjectTags = new HashMap;
  $putStringValue(sObjectTags, "EMBED", FALSE);
  $putStringValue(sObjectTags, "OBJECT", FALSE);
  $putStringValue(sObjectTags, "APPLET", FALSE);
  $putStringValue(sObjectTags, "IFRAME", FALSE);
  sARIATableRoles = new HashSet;
  $add_2(sARIATableRoles, "grid");
  $add_2(sARIATableRoles, "treegrid");
  sARIATableDescendantRoles = new HashSet;
  $add_2(sARIATableDescendantRoles, "gridcell");
  $add_2(sARIATableDescendantRoles, "columnheader");
  $add_2(sARIATableDescendantRoles, "row");
  $add_2(sARIATableDescendantRoles, "rowgroup");
  $add_2(sARIATableDescendantRoles, "rowheader");
  sARIARoles = new HashSet;
  $add_2(sARIARoles, "application");
  $add_2(sARIARoles, "banner");
  $add_2(sARIARoles, "complementary");
  $add_2(sARIARoles, "contentinfo");
  $add_2(sARIARoles, "form");
  $add_2(sARIARoles, "main");
  $add_2(sARIARoles, "navigation");
  $add_2(sARIARoles, "search");
}
function hasOneOfElements(list, tags) {
  var e, e$iterator, tagName;
  for (e$iterator = new AbstractList$IteratorImpl(list);e$iterator.i < e$iterator.this$01_0.size_1();) {
    if (e = (checkCriticalElement(e$iterator.i < e$iterator.this$01_0.size_1()), e$iterator.this$01_0.get_1(e$iterator.last = e$iterator.i++)), tagName = e.tagName, null == tagName ? $getEntry(tags.hashCodeMap, null) : void 0 !== tags.stringMap.get_2(tagName)) {
      return!(null == tagName ? getEntryValueOrNull($getEntry(tags.hashCodeMap, null)) : tags.stringMap.get_2(tagName)).value_0 || hasValidText(e);
    }
  }
  return!1;
}
function hasValidText(e) {
  e = getInnerText(e);
  return!!e.length && !isStringAllWhitespace(e);
}
function logAndReturn(reason, append, type_0) {
  2 <= sDebugLevel && logToConsole(reason + append + " -\x3e " + type_0);
  return type_0;
}
function table_0(t) {
  $clinit_TableClassifier();
  var allMeta, caption, color_0, docElement, docHeight, e$iterator0, i0, meta;
  $clinit_TableClassifier$Reason();
  for (docHeight = $getParentElement(t);docHeight;) {
    if ($equalsIgnoreCase("INPUT", docHeight.tagName) || $equalsIgnoreCase($getAttribute(docHeight, "contenteditable"), "true")) {
      return logAndReturn(INSIDE_EDITABLE_AREA, "", ($clinit_TableClassifier$Type(), LAYOUT));
    }
    docHeight = $getParentElement(docHeight);
  }
  docHeight = $getAttribute(t, "role").toLowerCase();
  if ("presentation" === docHeight) {
    return logAndReturn(ROLE_TABLE, "_" + docHeight, ($clinit_TableClassifier$Type(), LAYOUT));
  }
  if ($contains_2(sARIATableRoles, docHeight) || $contains_2(sARIARoles, docHeight)) {
    return logAndReturn(ROLE_TABLE, "_" + docHeight, ($clinit_TableClassifier$Type(), DATA));
  }
  docHeight = new ArrayList;
  e$iterator0 = t.getElementsByTagName("*");
  if (0 < t.getElementsByTagName("TABLE").length) {
    for (docElement = 0;docElement < e$iterator0.length;docElement++) {
      for (caption = e$iterator0[docElement], color_0 = $getParentElement(caption);color_0;) {
        if ($equalsIgnoreCase("TABLE", color_0.tagName)) {
          color_0 == t && (docHeight.array[docHeight.array.length] = caption);
          break;
        }
        color_0 = $getParentElement(color_0);
      }
    }
  } else {
    for (docElement = 0;docElement < e$iterator0.length;docElement++) {
      $add_0(docHeight, e$iterator0[docElement]);
    }
  }
  for (e$iterator0 = new AbstractList$IteratorImpl(docHeight);e$iterator0.i < e$iterator0.this$01_0.size_1();) {
    if (allMeta = (checkCriticalElement(e$iterator0.i < e$iterator0.this$01_0.size_1()), e$iterator0.this$01_0.get_1(e$iterator0.last = e$iterator0.i++)), caption = $getAttribute(allMeta, "role").toLowerCase(), $contains_2(sARIATableDescendantRoles, caption) || $contains_2(sARIARoles, caption)) {
      return logAndReturn(ROLE_DESCENDANT, "_" + caption, ($clinit_TableClassifier$Type(), DATA));
    }
  }
  if ("0" === $getAttribute(t, "datatable")) {
    return logAndReturn(DATATABLE_0, "", ($clinit_TableClassifier$Type(), LAYOUT));
  }
  if (0 < t.getElementsByTagName("TABLE").length) {
    return logAndReturn(NESTED_TABLE, "", ($clinit_TableClassifier$Type(), LAYOUT));
  }
  e$iterator0 = t.rows;
  if (1 >= e$iterator0.length) {
    return logAndReturn(LESS_EQ_1_ROW, "", ($clinit_TableClassifier$Type(), LAYOUT));
  }
  caption = null;
  for (color_0 = allMeta = 0;color_0 < e$iterator0.length;color_0++) {
    docElement = e$iterator0[color_0].cells, docElement.length > allMeta && (allMeta = docElement.length, caption = docElement);
  }
  color_0 = caption;
  if (!color_0 || 1 >= color_0.length) {
    return logAndReturn(LESS_EQ_1_COL, "", ($clinit_TableClassifier$Type(), LAYOUT));
  }
  if ((caption = t.caption) && hasValidText(caption) || t.tHead || t.tFoot || hasOneOfElements(docHeight, sHeaderTags)) {
    return logAndReturn(CAPTION_THEAD_TFOOT_COLGROUP_COL_TH, "", ($clinit_TableClassifier$Type(), DATA));
  }
  caption = new ArrayList;
  for (docElement = new AbstractList$IteratorImpl(docHeight);docElement.i < docElement.this$01_0.size_1();) {
    allMeta = (checkCriticalElement(docElement.i < docElement.this$01_0.size_1()), docElement.this$01_0.get_1(docElement.last = docElement.i++)), $equalsIgnoreCase("TD", allMeta.tagName) && (caption.array[caption.array.length] = allMeta);
  }
  for (docElement = new AbstractList$IteratorImpl(caption);docElement.i < docElement.this$01_0.size_1();) {
    allMeta = (checkCriticalElement(docElement.i < docElement.this$01_0.size_1()), docElement.this$01_0.get_1(docElement.last = docElement.i++));
    if (allMeta.hasAttribute("abbr") || allMeta.hasAttribute("headers") || allMeta.hasAttribute("scope")) {
      return logAndReturn(ABBR_HEADERS_SCOPE, "", ($clinit_TableClassifier$Type(), DATA));
    }
    allMeta = allMeta.getElementsByTagName("*");
    if (1 == allMeta.length && $equalsIgnoreCase("ABBR", allMeta[0].tagName)) {
      return logAndReturn(ONLY_HAS_ABBR, "", ($clinit_TableClassifier$Type(), DATA));
    }
  }
  docElement = t.ownerDocument.documentElement;
  allMeta = (docElement.offsetWidth || 0) | 0;
  if (0 < allMeta && ((t.offsetWidth || 0) | 0) > 0.95 * allMeta) {
    meta = !1;
    allMeta = docElement.getElementsByTagName("META");
    for (i0 = 0;i0 < allMeta.length && !meta;i0++) {
      meta = allMeta[i0], meta = $equalsIgnoreCase(meta.name, "viewport");
    }
    if (!meta) {
      return logAndReturn(MORE_95_PERCENT_DOC_WIDTH, "", ($clinit_TableClassifier$Type(), LAYOUT));
    }
  }
  if (t.hasAttribute("summary")) {
    return logAndReturn(SUMMARY, "", ($clinit_TableClassifier$Type(), DATA));
  }
  if (5 <= color_0.length) {
    return logAndReturn(MORE_EQ_5_COLS, "", ($clinit_TableClassifier$Type(), DATA));
  }
  for (color_0 = new AbstractList$IteratorImpl(caption);color_0.i < color_0.this$01_0.size_1();) {
    if (allMeta = (checkCriticalElement(color_0.i < color_0.this$01_0.size_1()), color_0.this$01_0.get_1(color_0.last = color_0.i++)), allMeta = getComputedStyle_0(allMeta).borderStyle, allMeta.length && "none" !== allMeta && "hidden" !== allMeta) {
      return logAndReturn(CELLS_HAVE_BORDER, "_" + allMeta, ($clinit_TableClassifier$Type(), DATA));
    }
  }
  i0 = null;
  for (allMeta = 0;allMeta < e$iterator0.length;allMeta++) {
    if (color_0 = getComputedStyle_0(e$iterator0[allMeta]).backgroundColor, null == i0) {
      i0 = color_0;
    } else {
      if (!$equalsIgnoreCase(i0, color_0)) {
        return logAndReturn(DIFFERENTLY_COLORED_ROWS, "", ($clinit_TableClassifier$Type(), DATA));
      }
    }
  }
  if (20 <= e$iterator0.length) {
    return logAndReturn(MORE_EQ_20_ROWS, "", ($clinit_TableClassifier$Type(), DATA));
  }
  if (10 >= caption.array.length) {
    return logAndReturn(LESS_EQ_10_CELLS, "", ($clinit_TableClassifier$Type(), LAYOUT));
  }
  if (hasOneOfElements(docHeight, sObjectTags)) {
    return logAndReturn(EMBED_OBJECT_APPLET_IFRAME, "", ($clinit_TableClassifier$Type(), LAYOUT));
  }
  docHeight = (docElement.offsetHeight || 0) | 0;
  return 0 < docHeight && ((t.offsetHeight || 0) | 0) > 0.9 * docHeight ? logAndReturn(MORE_90_PERCENT_DOC_HEIGHT, "", ($clinit_TableClassifier$Type(), LAYOUT)) : logAndReturn(DEFAULT_0, "", ($clinit_TableClassifier$Type(), DATA));
}
var sARIARoles, sARIATableDescendantRoles, sARIATableRoles, sHeaderTags, sObjectTags;
function $clinit_TableClassifier$Reason() {
  $clinit_TableClassifier$Reason = emptyMethod;
  INSIDE_EDITABLE_AREA = new TableClassifier$Reason("INSIDE_EDITABLE_AREA", 0);
  ROLE_TABLE = new TableClassifier$Reason("ROLE_TABLE", 1);
  ROLE_DESCENDANT = new TableClassifier$Reason("ROLE_DESCENDANT", 2);
  DATATABLE_0 = new TableClassifier$Reason("DATATABLE_0", 3);
  CAPTION_THEAD_TFOOT_COLGROUP_COL_TH = new TableClassifier$Reason("CAPTION_THEAD_TFOOT_COLGROUP_COL_TH", 4);
  ABBR_HEADERS_SCOPE = new TableClassifier$Reason("ABBR_HEADERS_SCOPE", 5);
  ONLY_HAS_ABBR = new TableClassifier$Reason("ONLY_HAS_ABBR", 6);
  MORE_95_PERCENT_DOC_WIDTH = new TableClassifier$Reason("MORE_95_PERCENT_DOC_WIDTH", 7);
  SUMMARY = new TableClassifier$Reason("SUMMARY", 8);
  NESTED_TABLE = new TableClassifier$Reason("NESTED_TABLE", 9);
  LESS_EQ_1_ROW = new TableClassifier$Reason("LESS_EQ_1_ROW", 10);
  LESS_EQ_1_COL = new TableClassifier$Reason("LESS_EQ_1_COL", 11);
  MORE_EQ_5_COLS = new TableClassifier$Reason("MORE_EQ_5_COLS", 12);
  CELLS_HAVE_BORDER = new TableClassifier$Reason("CELLS_HAVE_BORDER", 13);
  DIFFERENTLY_COLORED_ROWS = new TableClassifier$Reason("DIFFERENTLY_COLORED_ROWS", 14);
  MORE_EQ_20_ROWS = new TableClassifier$Reason("MORE_EQ_20_ROWS", 15);
  LESS_EQ_10_CELLS = new TableClassifier$Reason("LESS_EQ_10_CELLS", 16);
  EMBED_OBJECT_APPLET_IFRAME = new TableClassifier$Reason("EMBED_OBJECT_APPLET_IFRAME", 17);
  MORE_90_PERCENT_DOC_HEIGHT = new TableClassifier$Reason("MORE_90_PERCENT_DOC_HEIGHT", 18);
  DEFAULT_0 = new TableClassifier$Reason("DEFAULT", 19);
  UNKNOWN_0 = new TableClassifier$Reason("UNKNOWN", 20);
}
function TableClassifier$Reason(enum$name, enum$ordinal) {
  Enum.call(this, enum$name, enum$ordinal);
}
defineClass(16, 9, {3:1, 11:1, 9:1, 16:1}, TableClassifier$Reason);
var ABBR_HEADERS_SCOPE, CAPTION_THEAD_TFOOT_COLGROUP_COL_TH, CELLS_HAVE_BORDER, DATATABLE_0, DEFAULT_0, DIFFERENTLY_COLORED_ROWS, EMBED_OBJECT_APPLET_IFRAME, INSIDE_EDITABLE_AREA, LESS_EQ_10_CELLS, LESS_EQ_1_COL, LESS_EQ_1_ROW, MORE_90_PERCENT_DOC_HEIGHT, MORE_95_PERCENT_DOC_WIDTH, MORE_EQ_20_ROWS, MORE_EQ_5_COLS, NESTED_TABLE, ONLY_HAS_ABBR, ROLE_DESCENDANT, ROLE_TABLE, SUMMARY, UNKNOWN_0, Lorg_chromium_distiller_TableClassifier$Reason_2_classLit = createForEnum(16, function() {
  $clinit_TableClassifier$Reason();
  return initValues(getClassLiteralForArray_0(Lorg_chromium_distiller_TableClassifier$Reason_2_classLit, 1), $intern_4, 16, 0, [INSIDE_EDITABLE_AREA, ROLE_TABLE, ROLE_DESCENDANT, DATATABLE_0, CAPTION_THEAD_TFOOT_COLGROUP_COL_TH, ABBR_HEADERS_SCOPE, ONLY_HAS_ABBR, MORE_95_PERCENT_DOC_WIDTH, SUMMARY, NESTED_TABLE, LESS_EQ_1_ROW, LESS_EQ_1_COL, MORE_EQ_5_COLS, CELLS_HAVE_BORDER, DIFFERENTLY_COLORED_ROWS, MORE_EQ_20_ROWS, LESS_EQ_10_CELLS, EMBED_OBJECT_APPLET_IFRAME, MORE_90_PERCENT_DOC_HEIGHT, DEFAULT_0, 
  UNKNOWN_0]);
});
function $clinit_TableClassifier$Type() {
  $clinit_TableClassifier$Type = emptyMethod;
  DATA = new TableClassifier$Type("DATA", 0);
  LAYOUT = new TableClassifier$Type("LAYOUT", 1);
}
function TableClassifier$Type(enum$name, enum$ordinal) {
  Enum.call(this, enum$name, enum$ordinal);
}
defineClass(56, 9, {3:1, 11:1, 9:1, 56:1}, TableClassifier$Type);
var DATA, LAYOUT, Lorg_chromium_distiller_TableClassifier$Type_2_classLit = createForEnum(56, function() {
  $clinit_TableClassifier$Type();
  return initValues(getClassLiteralForArray_0(Lorg_chromium_distiller_TableClassifier$Type_2_classLit, 1), $intern_4, 56, 0, [DATA, LAYOUT]);
});
function cloneChild(clone, newChild) {
  var cl;
  cl = cloneNode(newChild);
  clone.appendChild(cl);
  return cl;
}
function cloneNode(node) {
  var clone;
  clone = node.cloneNode(!1);
  1 == node.nodeType && (node = getComputedStyle_0(node).direction, !node.length && (node = "auto"), clone.setAttribute("dir", node));
  return clone;
}
function cloneParent(clone, newParent) {
  var p;
  p = clone.parentNode;
  p || (p = cloneNode(newParent), p.appendChild(clone));
  return p;
}
function $getFirstNonWhitespaceTextNode(this$static) {
  return $getFirstNonWhitespaceTextNode_0($get_2(this$static.webElements, $get_2(this$static.textIndexes, 0).value_0));
}
function $hasLabel(this$static, label_0) {
  return $contains_2(this$static.labels, label_0);
}
function $mergeNext(this$static, other) {
  this$static.text_0 += "\n";
  this$static.text_0 += other.text_0;
  this$static.numWords += other.numWords;
  this$static.numWordsInAnchorText += other.numWordsInAnchorText;
  this$static.linkDensity = 0 == this$static.numWords ? 0 : this$static.numWordsInAnchorText / this$static.numWords;
  this$static.isContent |= other.isContent;
  $addAll_0(this$static.textIndexes, other.textIndexes);
  this$static.labels.addAll(other.labels);
  this$static.tagLevel = min_0(this$static.tagLevel, other.tagLevel);
}
function $setIsContent(this$static, isContent) {
  if (isContent == this$static.isContent) {
    return!1;
  }
  this$static.isContent = isContent;
  return!0;
}
function $toString_3(this$static) {
  var s;
  s = "[" + ($get_2(this$static.webElements, $get_2(this$static.textIndexes, 0).value_0).offsetBlock + "-" + $get_2(this$static.webElements, $get_2(this$static.textIndexes, this$static.textIndexes.array.length - 1).value_0).offsetBlock + ";");
  s += "tl\x3d" + this$static.tagLevel + ";";
  s += "nw\x3d" + this$static.numWords + ";";
  s += "ld\x3d" + this$static.linkDensity + ";";
  s = s + "]\t" + ((this$static.isContent ? "\u001b[0;32mCONTENT" : "\u001b[0;35mboilerplate") + "\u001b[0m,");
  s += "\u001b[1;30m" + $toString(new TreeSet(this$static.labels)) + "\u001b[0m";
  return s += "\n" + this$static.text_0;
}
function TextBlock(elements, index_0) {
  var wt, res;
  this.webElements = elements;
  this.textIndexes = new ArrayList;
  $add_0(this.textIndexes, valueOf_2(index_0));
  wt = $get_2(this.webElements, index_0);
  this.labels = (res = wt.labels, wt.labels = new HashSet, res);
  this.numWords = wt.numWords;
  this.numWordsInAnchorText = wt.numLinkedWords;
  this.tagLevel = wt.tagLevel;
  this.text_0 = wt.text_0;
  this.linkDensity = 0 == this.numWords ? 0 : this.numWordsInAnchorText / this.numWords;
}
defineClass(73, 1, {}, TextBlock);
_.toString$ = function() {
  return $toString_3(this);
};
_.isContent = !1;
_.linkDensity = 0;
_.numWords = 0;
_.numWordsInAnchorText = 0;
_.tagLevel = 0;
createForClass(73);
function TextDocument(textBlocks) {
  this.textBlocks = textBlocks;
}
defineClass(82, 1, {}, TextDocument);
createForClass(82);
function $clinit_ImageExtractor() {
  $clinit_ImageExtractor = emptyMethod;
  relevantTags = new HashSet;
  $add_2(relevantTags, "IMG");
  $add_2(relevantTags, "PICTURE");
  $add_2(relevantTags, "FIGURE");
  $add_2(relevantTags, "SPAN");
  LAZY_IMAGE_ATTRIBUTES = initValues(getClassLiteralForArray_0(Ljava_lang_String_2_classLit, 1), $intern_7, 2, 4, ["data-src", "data-original", "datasrc", "data-url"]);
}
function $createFigcaptionElement(element) {
  var figcaption;
  figcaption = $doc.createElement("FIGCAPTION");
  element = jsTrim(getInnerText(element));
  figcaption.textContent = element || "";
  return figcaption;
}
function $extract(this$static, e) {
  var cap, img, links_0;
  if (!$contains_2(relevantTags, e.tagName)) {
    return null;
  }
  this$static.imgSrc = "";
  cap = getFirstElementByTagNameInc(e);
  if ("FIGURE" === e.tagName) {
    img = getFirstElementByTagName(e, "PICTURE");
    !img && (img = getFirstElementByTagName(e, "IMG"));
    if (!img) {
      return null;
    }
    $extractImageAttributes(this$static, cap);
    (cap = getFirstElementByTagName(e, "FIGCAPTION")) ? (links_0 = querySelectorAll(cap, "A[HREF]"), cap = 0 < links_0.length ? cap : $createFigcaptionElement(cap)) : cap = $createFigcaptionElement(e);
    return new WebFigure(img, this$static.width_0, this$static.height_0, this$static.imgSrc, cap);
  }
  if ("SPAN" === e.tagName) {
    if (-1 == $getAttribute(e, "class").indexOf("lazy-image-placeholder")) {
      return null;
    }
    cap = $doc.createElement("img");
    this$static.imgSrc = $getAttribute(e, "data-src");
    this$static.width_0 = parseInt_0($getAttribute(e, "data-width"));
    this$static.height_0 = parseInt_0($getAttribute(e, "data-height"));
    img = $getAttribute(e, "data-srcset");
    cap.setAttribute("srcset", img);
    return new WebImage(cap, this$static.width_0, this$static.height_0, this$static.imgSrc);
  }
  $extractImageAttributes(this$static, cap);
  return new WebImage(e, this$static.width_0, this$static.height_0, this$static.imgSrc);
}
function $extractImageAttributes(this$static, imageElement) {
  var attr, attr$array, attr$index, attr$max;
  attr$array = LAZY_IMAGE_ATTRIBUTES;
  attr$index = 0;
  for (attr$max = attr$array.length;attr$index < attr$max && (attr = attr$array[attr$index], this$static.imgSrc = $getAttribute(imageElement, attr), !this$static.imgSrc.length);++attr$index) {
  }
  this$static.imgSrc.length ? (this$static.width_0 = 0, this$static.height_0 = 0) : (this$static.imgSrc = imageElement.src, this$static.width_0 = imageElement.width, this$static.height_0 = imageElement.height);
  2 <= sDebugLevel && logToConsole("Extracted WebImage: " + this$static.imgSrc);
}
function ImageExtractor() {
  $clinit_ImageExtractor();
}
defineClass(133, 1, {}, ImageExtractor);
_.extract = function(e) {
  return $extract(this, e);
};
_.getRelevantTagNames = function() {
  return relevantTags;
};
_.height_0 = 0;
_.width_0 = 0;
var LAZY_IMAGE_ATTRIBUTES, relevantTags;
createForClass(133);
function $clinit_TwitterExtractor() {
  $clinit_TwitterExtractor = emptyMethod;
  relevantTags_0 = new HashSet;
  $add_2(relevantTags_0, "BLOCKQUOTE");
  $add_2(relevantTags_0, "IFRAME");
}
function $handleNotRendered(e) {
  var anchors;
  if (-1 == $getAttribute(e, "class").indexOf("twitter-tweet")) {
    return null;
  }
  anchors = e.getElementsByTagName("a");
  if (0 == anchors.length) {
    return null;
  }
  anchors = anchors[anchors.length - 1];
  if (!hasRootDomain(anchors.href, "twitter.com")) {
    return null;
  }
  a: {
    var pathSplit;
    pathSplit = $split($getPropertyString(anchors, "pathname"), "/");
    for (anchors = pathSplit.length - 1;0 <= anchors;anchors--) {
      if (0 < pathSplit[anchors].length) {
        anchors = pathSplit[anchors];
        break a;
      }
    }
    anchors = null;
  }
  return null == anchors ? null : new WebEmbed(e, "twitter", anchors, null);
}
function $handleRendered(e) {
  var blocks;
  if ("IFRAME" !== e.tagName || e.src.length) {
    return null;
  }
  blocks = e.contentWindow.document;
  if (!blocks) {
    return null;
  }
  blocks = blocks.getElementsByTagName("blockquote");
  if (1 > blocks.length) {
    return null;
  }
  blocks = $getAttribute(blocks[0], "data-tweet-id");
  return blocks.length ? new WebEmbed(e, "twitter", blocks, null) : null;
}
function TwitterExtractor() {
  $clinit_TwitterExtractor();
}
defineClass(134, 1, {}, TwitterExtractor);
_.extract = function(e) {
  var result;
  e && $contains_2(relevantTags_0, e.tagName) ? (result = null, "BLOCKQUOTE" === e.tagName ? result = $handleNotRendered(e) : "IFRAME" === e.tagName && (result = $handleRendered(e)), result && 2 <= sDebugLevel && (logToConsole("Twitter embed extracted:"), logToConsole("    ID: " + result.id_0)), e = result) : e = null;
  return e;
};
_.getRelevantTagNames = function() {
  return relevantTags_0;
};
var relevantTags_0;
createForClass(134);
function $clinit_VimeoExtractor() {
  $clinit_VimeoExtractor = emptyMethod;
  relevantTags_1 = new HashSet;
  $add_2(relevantTags_1, "IFRAME");
}
function $extract_1(e) {
  var anchor, id_0;
  if (!e || !$contains_2(relevantTags_1, e.tagName)) {
    return null;
  }
  id_0 = e.src;
  if (!hasRootDomain(id_0, "player.vimeo.com")) {
    return null;
  }
  anchor = $doc.createElement("a");
  anchor.href = id_0;
  id_0 = $getPropertyString(anchor, "pathname");
  anchor = splitUrlParams($substring($getPropertyString(anchor, "search"), 1));
  a: {
    var pathSplit;
    pathSplit = $split(id_0, "/");
    for (id_0 = pathSplit.length - 1;0 <= id_0 && "video" !== pathSplit[id_0];id_0--) {
      if (0 < pathSplit[id_0].length) {
        id_0 = pathSplit[id_0];
        break a;
      }
    }
    id_0 = null;
  }
  if (null == id_0) {
    return null;
  }
  2 <= sDebugLevel && (logToConsole("Vimeo embed extracted:"), logToConsole("    ID:    " + id_0));
  return new WebEmbed(e, "vimeo", id_0, anchor);
}
function VimeoExtractor() {
  $clinit_VimeoExtractor();
}
defineClass(135, 1, {}, VimeoExtractor);
_.extract = function(e) {
  return $extract_1(e);
};
_.getRelevantTagNames = function() {
  return relevantTags_1;
};
var relevantTags_1;
createForClass(135);
function $clinit_YouTubeExtractor() {
  $clinit_YouTubeExtractor = emptyMethod;
  relevantTags_2 = new HashSet;
  $add_2(relevantTags_2, "IFRAME");
  $add_2(relevantTags_2, "OBJECT");
}
function $extract_2(e) {
  var id_0, paramLoc, paramMap;
  if (!e || !$contains_2(relevantTags_2, e.tagName)) {
    return null;
  }
  paramMap = null;
  "IFRAME" === e.tagName ? paramMap = e.src : "OBJECT" === e.tagName && ("application/x-shockwave-flash" === $getAttribute(e, "type") ? paramMap = $getAttribute(e, "data") : (id_0 = querySelectorAll(e, 'param[name\x3d"movie"]'), 1 == id_0.length && (paramMap = $getAttribute(id_0[0], "value"))));
  if (null == paramMap || !hasRootDomain(paramMap, "youtube.com")) {
    return null;
  }
  paramLoc = paramMap.indexOf("?");
  0 > paramLoc && (paramLoc = paramMap.indexOf("\x26"));
  0 > paramLoc && (paramLoc = paramMap.length);
  id_0 = paramMap.substr(0, paramLoc);
  paramMap = splitUrlParams(paramMap.substr(paramLoc + 1, paramMap.length - (paramLoc + 1)));
  a: {
    paramLoc = $split(id_0, "/");
    for (id_0 = paramLoc.length - 1;0 <= id_0 && "embed" !== paramLoc[id_0];id_0--) {
      if (0 < paramLoc[id_0].length) {
        id_0 = paramLoc[id_0];
        break a;
      }
    }
    id_0 = null;
  }
  if (null == id_0) {
    return null;
  }
  2 <= sDebugLevel && (logToConsole("YouTube embed extracted:"), logToConsole("    ID:    " + id_0));
  return new WebEmbed(e, "youtube", id_0, paramMap);
}
function YouTubeExtractor() {
  $clinit_YouTubeExtractor();
}
defineClass(136, 1, {}, YouTubeExtractor);
_.extract = function(e) {
  return $extract_2(e);
};
_.getRelevantTagNames = function() {
  return relevantTags_2;
};
var relevantTags_2;
createForClass(136);
function $process_1(doc, changed, header) {
  if (!(1 > sDebugLevel)) {
    if (changed) {
      logToConsole("\u001b[0;34m\x3c\x3c\x3c\x3c\x3c " + header + " \x3e\x3e\x3e\x3e\x3e");
      if (!(1 > sDebugLevel)) {
        changed = "";
        for (header = new AbstractList$IteratorImpl(doc.textBlocks);header.i < header.this$01_0.size_1();) {
          doc = (checkCriticalElement(header.i < header.this$01_0.size_1()), header.this$01_0.get_1(header.last = header.i++)), changed += $toString_3(doc) + "\n";
        }
        logToConsole(changed);
      }
      logToConsole("\u001b[0;34m\x3c\x3c\x3c\x3c\x3c                \x3e\x3e\x3e\x3e\x3e");
    } else {
      logToConsole("\u001b[0;31m~~~~~ No Changes: " + header + " ~~~~~");
    }
  }
}
function $clinit_TerminatingBlocksFinder() {
  $clinit_TerminatingBlocksFinder = emptyMethod;
  REG_TERMINATING = RegExp("(^(comments|\u00a9 reuters|please rate this|post a comment|\\d+\\s+(comments|users responded in))|what you think\\.\\.\\.|add your comment|add comment|reader views|have your say|reader comments|r\u00e4tta artikeln|^thanks for your comments - this feedback is now closed$)", "i");
}
var REG_TERMINATING;
function $clinit_BlockProximityFusion() {
  $clinit_BlockProximityFusion = emptyMethod;
  PRE_FILTERING = new BlockProximityFusion(!1);
  POST_FILTERING = new BlockProximityFusion(!0);
}
function $process_4(this$static, doc) {
  var block, changes, diffBlocks, it, prevBlock;
  block = doc.textBlocks;
  if (2 > block.array.length) {
    return!1;
  }
  changes = !1;
  prevBlock = (checkElementIndex(0, block.array.length), block.array[0]);
  for (it = new AbstractList$ListIteratorImpl(block, 1);it.i < it.this$01_0.size_1();) {
    block = (checkCriticalElement(it.i < it.this$01_0.size_1()), it.this$01_0.get_1(it.last = it.i++)), block.isContent && prevBlock.isContent ? (diffBlocks = $get_2(block.webElements, $get_2(block.textIndexes, 0).value_0).offsetBlock - $get_2(prevBlock.webElements, $get_2(prevBlock.textIndexes, prevBlock.textIndexes.array.length - 1).value_0).offsetBlock - 1, 1 >= diffBlocks ? (diffBlocks = !0, this$static.postFiltering ? prevBlock.tagLevel != block.tagLevel && (diffBlocks = !1) : $contains_2(block.labels, 
    "BOILERPLATE_HEADING_FUSED") && (diffBlocks = !1), $contains_2(prevBlock.labels, "STRICTLY_NOT_CONTENT") != $contains_2(block.labels, "STRICTLY_NOT_CONTENT") && (diffBlocks = !1), $contains_2(prevBlock.labels, "de.l3s.boilerpipe/TITLE") != $contains_2(block.labels, "de.l3s.boilerpipe/TITLE") && (diffBlocks = !1), !prevBlock.isContent && $contains_2(prevBlock.labels, "de.l3s.boilerpipe/LI") && !$contains_2(block.labels, "de.l3s.boilerpipe/LI") && (diffBlocks = !1), diffBlocks ? ($mergeNext(prevBlock, 
    block), $remove(it), changes = !0) : prevBlock = block) : prevBlock = block) : prevBlock = block;
  }
  return changes;
}
function BlockProximityFusion(postFiltering) {
  this.postFiltering = postFiltering;
}
defineClass(86, 1, {}, BlockProximityFusion);
_.toString$ = function() {
  return $ensureNamesAreInitialized(Lorg_chromium_distiller_filters_heuristics_BlockProximityFusion_2_classLit), Lorg_chromium_distiller_filters_heuristics_BlockProximityFusion_2_classLit.typeName + ": postFiltering\x3d" + this.postFiltering;
};
_.postFiltering = !1;
var POST_FILTERING, PRE_FILTERING, Lorg_chromium_distiller_filters_heuristics_BlockProximityFusion_2_classLit = createForClass(86);
function $clinit_DocumentTitleMatchClassifier() {
  $clinit_DocumentTitleMatchClassifier = emptyMethod;
  REG_REMOVE_CHARACTERS = RegExp("[\\?\\!\\.\\-\\:]+", "g");
}
function $addPotentialTitles(potentialTitles, title_0, pattern) {
  var p, parts;
  parts = $split(title_0, pattern);
  if (1 != parts.length) {
    for (title_0 = 0;title_0 < parts.length;title_0++) {
      p = parts[title_0], -1 == p.indexOf(".com") && (pattern = ($clinit_StringUtil(), sWordCounter.count(p)), 4 <= pattern && $add_2(potentialTitles, p));
    }
  }
}
function $getLongestPart(title_0, pattern) {
  var i, longestNumWords, longestPart, numWords, p, parts;
  parts = $split(title_0, pattern);
  if (1 == parts.length) {
    return null;
  }
  longestNumWords = 0;
  longestPart = "";
  for (i = 0;i < parts.length;i++) {
    if (p = parts[i], -1 == p.indexOf(".com") && (numWords = ($clinit_StringUtil(), sWordCounter.count(p)), numWords > longestNumWords || p.length > longestPart.length)) {
      longestNumWords = numWords, longestPart = p;
    }
  }
  return 0 == longestPart.length ? null : $trim(longestPart);
}
function DocumentTitleMatchClassifier(titles) {
  $clinit_DocumentTitleMatchClassifier();
  var title_0;
  if (titles) {
    for (this.potentialTitles = new HashSet, titles = $listIterator(titles, 0);titles.currentNode != titles.this$01.tail;) {
      title_0 = (checkCriticalElement(titles.currentNode != titles.this$01.tail), titles.lastNode = titles.currentNode, titles.currentNode = titles.currentNode.next, ++titles.currentIndex, titles.lastNode.value_0);
      var p = void 0;
      title_0 = $replace_0(title_0);
      title_0 = $replaceAll(title_0, "'");
      title_0 = $trim(title_0).toLowerCase();
      0 != title_0.length && $add_2(this.potentialTitles, title_0) && (p = $getLongestPart(title_0, "[ ]*[\\|\u00bb|-][ ]*"), null != p && $add_2(this.potentialTitles, p), p = $getLongestPart(title_0, "[ ]*[\\|\u00bb|:][ ]*"), null != p && $add_2(this.potentialTitles, p), p = $getLongestPart(title_0, "[ ]*[\\|\u00bb|:\\(\\)][ ]*"), null != p && $add_2(this.potentialTitles, p), p = $getLongestPart(title_0, "[ ]*[\\|\u00bb|:\\(\\)\\-][ ]*"), null != p && $add_2(this.potentialTitles, p), p = $getLongestPart(title_0, 
      "[ ]*[\\|\u00bb|,|:\\(\\)\\-][ ]*"), null != p && $add_2(this.potentialTitles, p), p = $getLongestPart(title_0, "[ ]*[\\|\u00bb|,|:\\(\\)\\-\u00a0][ ]*"), null != p && $add_2(this.potentialTitles, p), $addPotentialTitles(this.potentialTitles, title_0, "[ ]+[\\|][ ]+"), $addPotentialTitles(this.potentialTitles, title_0, "[ ]+[\\-][ ]+"), $add_2(this.potentialTitles, $replaceFirst(title_0, " - [^\\-]+$")), $add_2(this.potentialTitles, $replaceFirst(title_0, "^[^\\-]+ - ")));
    }
  } else {
    this.potentialTitles = null;
  }
}
defineClass(137, 1, {}, DocumentTitleMatchClassifier);
var REG_REMOVE_CHARACTERS;
createForClass(137);
function $clinit_KeepLargestBlockFilter() {
  $clinit_KeepLargestBlockFilter = emptyMethod;
  INSTANCE_EXPAND_TO_SIBLINGS = new KeepLargestBlockFilter(!0);
}
function KeepLargestBlockFilter(expandToSiblings) {
  this.expandToSiblings = expandToSiblings;
}
defineClass(88, 1, {}, KeepLargestBlockFilter);
_.expandToSiblings = !1;
var INSTANCE_EXPAND_TO_SIBLINGS;
createForClass(88);
function $isSimilarIndex(this$static, i, j) {
  i = $get_2(this$static.canonicalReps, i);
  j = $get_2(this$static.canonicalReps, j);
  return this$static.allowMixedTags || (i.nodeType != j.nodeType ? 0 : 1 != i.nodeType || i.nodeName === j.nodeName) ? i.parentNode == j.parentNode : !1;
}
function $process_11(this$static, doc) {
  var b, bad, badBegin, badEnd, changes, good, goodBegin, goodEnd, i, j;
  this$static.textBlocks = doc.textBlocks;
  if (2 > this$static.textBlocks.array.length) {
    return!1;
  }
  bad = this$static.textBlocks;
  badBegin = $doc.documentElement;
  good = new ArrayList;
  for (badEnd = 0;badEnd < bad.array.length;++badEnd) {
    changes = badEnd + 1 == bad.array.length ? badBegin : $getFirstNonWhitespaceTextNode((checkElementIndex(badEnd + 1, bad.array.length), bad.array[badEnd + 1]));
    0 == badEnd ? goodBegin = badBegin : (goodBegin = (checkElementIndex(badEnd - 1, bad.array.length), bad.array[badEnd - 1]), goodBegin = $getLastNonWhitespaceTextNode_0($get_2(goodBegin.webElements, $get_2(goodBegin.textIndexes, goodBegin.textIndexes.array.length - 1).value_0)));
    i = goodBegin;
    goodBegin = $getFirstNonWhitespaceTextNode((checkElementIndex(badEnd, bad.array.length), bad.array[badEnd]));
    for (goodEnd = goodBegin.parentNode;!goodEnd.contains(i) && !goodEnd.contains(changes);) {
      goodBegin = goodEnd, goodEnd = goodEnd.parentNode;
    }
    good.array[good.array.length] = goodBegin;
  }
  this$static.canonicalReps = good;
  good = initDim(I_classLit, {3:1}, 0, this$static.textBlocks.array.length, 7);
  goodEnd = goodBegin = 0;
  bad = initDim(I_classLit, {3:1}, 0, this$static.textBlocks.array.length, 7);
  badEnd = badBegin = 0;
  changes = !1;
  for (i = 0;i < this$static.textBlocks.array.length;i++) {
    if (!this$static.allowCrossTitles && $hasLabel($get_2(this$static.textBlocks, i), "de.l3s.boilerpipe/TITLE") || !this$static.allowCrossHeadings && $hasLabel($get_2(this$static.textBlocks, i), "de.l3s.boilerpipe/HEADING")) {
      goodBegin = goodEnd, badBegin = badEnd;
    } else {
      if ($get_2(this$static.textBlocks, i).isContent && !$hasLabel($get_2(this$static.textBlocks, i), "STRICTLY_NOT_CONTENT") && !$hasLabel($get_2(this$static.textBlocks, i), "de.l3s.boilerpipe/TITLE")) {
        for (good[goodEnd++] = i, j = badBegin;j < badEnd;j++) {
          b = bad[j], i - b > this$static.maxBlockDistance ? j == badBegin && ++badBegin : $isSimilarIndex(this$static, i, b) && (changes = !0, $setIsContent($get_2(this$static.textBlocks, b), !0), bad[j] = bad[badBegin++]);
        }
      } else {
        if ($get_2(this$static.textBlocks, i).linkDensity <= this$static.maxLinkDensity && !$get_2(this$static.textBlocks, i).isContent && !$hasLabel($get_2(this$static.textBlocks, i), "STRICTLY_NOT_CONTENT") && !$hasLabel($get_2(this$static.textBlocks, i), "de.l3s.boilerpipe/TITLE")) {
          for (j = goodBegin;j < goodEnd;j++) {
            if (b = good[j], i - b > this$static.maxBlockDistance) {
              j == goodBegin && ++goodBegin;
            } else {
              if ($isSimilarIndex(this$static, i, b)) {
                changes = !0;
                $setIsContent($get_2(this$static.textBlocks, i), !0);
                good[j] = good[goodBegin++];
                break;
              }
            }
          }
          j == goodEnd ? bad[badEnd++] = i : good[goodEnd++] = i;
        }
      }
    }
  }
  return changes;
}
function SimilarSiblingContentExpansion(allowCrossTitles, allowCrossHeadings, allowMixedTags, maxLinkDensity, maxBlockDistance) {
  this.allowCrossTitles = allowCrossTitles;
  this.allowCrossHeadings = allowCrossHeadings;
  this.allowMixedTags = allowMixedTags;
  this.maxLinkDensity = maxLinkDensity;
  this.maxBlockDistance = maxBlockDistance;
}
defineClass(139, 1, {}, SimilarSiblingContentExpansion);
_.allowCrossHeadings = !1;
_.allowCrossTitles = !1;
_.allowMixedTags = !1;
_.maxBlockDistance = 0;
_.maxLinkDensity = 0;
createForClass(139);
function $allowCrossHeadings() {
  var this$static = new SimilarSiblingContentExpansion$Builder;
  this$static.mAllowCrossHeadings = !0;
  return this$static;
}
function $build(this$static) {
  return new SimilarSiblingContentExpansion(this$static.mAllowCrossTitles, this$static.mAllowCrossHeadings, this$static.mAllowMixedTags, this$static.mMaxLinkDensity, this$static.mMaxBlockDistance);
}
function SimilarSiblingContentExpansion$Builder() {
  this.mAllowMixedTags = this.mAllowCrossHeadings = this.mAllowCrossTitles = !1;
  this.mMaxBlockDistance = this.mMaxLinkDensity = 0;
}
defineClass(85, 1, {}, SimilarSiblingContentExpansion$Builder);
_.mAllowCrossHeadings = !1;
_.mAllowCrossTitles = !1;
_.mAllowMixedTags = !1;
_.mMaxBlockDistance = 0;
_.mMaxLinkDensity = 0;
createForClass(85);
function $clinit_BoilerplateBlockFilter() {
  $clinit_BoilerplateBlockFilter = emptyMethod;
  INSTANCE_KEEP_TITLE = new BoilerplateBlockFilter("de.l3s.boilerpipe/TITLE");
}
function BoilerplateBlockFilter(labelToKeep) {
  this.labelToKeep = labelToKeep;
}
defineClass(87, 1, {}, BoilerplateBlockFilter);
var INSTANCE_KEEP_TITLE;
createForClass(87);
function $clinit_LabelToBoilerplateFilter() {
  $clinit_LabelToBoilerplateFilter = emptyMethod;
  INSTANCE_STRICTLY_NOT_CONTENT = new LabelToBoilerplateFilter(initValues(getClassLiteralForArray_0(Ljava_lang_String_2_classLit, 1), $intern_7, 2, 4, ["STRICTLY_NOT_CONTENT"]));
}
function LabelToBoilerplateFilter(label_0) {
  this.labels = label_0;
}
defineClass(138, 1, {}, LabelToBoilerplateFilter);
var INSTANCE_STRICTLY_NOT_CONTENT;
createForClass(138);
function $visitElement(this$static, e) {
  var className, component, extractor, extractor$iterator, hasHiddenClassName, keepAnyway, visible;
  visible = isVisible(e);
  hasHiddenClassName = keepAnyway = !1;
  visible || (this$static.isMobileFriendly && this$static.hasArticleElement && (this$static.isHiddenClass || (hasHiddenClassName = ($clinit_DomUtil(), e.classList.contains("hidden"))), (this$static.isHiddenClass || hasHiddenClassName) && (keepAnyway = !0)), this$static.isMobileFriendly && (-1 != $getAttribute(e, "class").indexOf("continue") && (keepAnyway = !0), "false" === $getAttribute(e, "aria-expanded") && (keepAnyway = !0)));
  var visible$$0 = visible || keepAnyway, style;
  2 > sDebugLevel || (style = getComputedStyle_0(e), logToConsole((visible$$0 ? "KEEP " : "SKIP ") + e.tagName + ": id\x3d" + e.id + ", dsp\x3d" + style.display + ", vis\x3d" + style.visibility + ", opaq\x3d" + style.opacity));
  if (!visible && !keepAnyway) {
    return $add_2(this$static.hiddenElements, e), !1;
  }
  try {
    if ($contains_2(this$static.embedTagNames, e.tagName)) {
      for (extractor$iterator = new AbstractList$IteratorImpl(this$static.extractors);extractor$iterator.i < extractor$iterator.this$01_0.size_1();) {
        if (extractor = (checkCriticalElement(extractor$iterator.i < extractor$iterator.this$01_0.size_1()), extractor$iterator.this$01_0.get_1(extractor$iterator.last = extractor$iterator.i++)), component = extractor.extract(e)) {
          return className = this$static.builder, $flushBlock(className, className.groupNumber), $add_0(className.document_0.elements, component), !1;
        }
      }
    }
  } catch ($e0) {
    if ($e0 = wrap($e0), instanceOf($e0, 15)) {
      className = $e0, logToConsole("Exception happened in EmbedExtractors: " + className.getMessage());
    } else {
      throw unwrap($e0);
    }
  }
  className = $getAttribute(e, "class");
  component = $getAttribute(e, "data-component");
  if ("sharing" === className || "socialArea" === className || "share" === component) {
    return!1;
  }
  canBeNested(e.tagName) && (component = this$static.builder, extractor = new WebTag(e.tagName, ($clinit_WebTag$TagType(), START)), $flushBlock(component, component.groupNumber), $add_0(component.document_0.elements, extractor));
  switch(e.tagName) {
    case "A":
      if (className = -1 != e.href.indexOf("action\x3dedit\x26section\x3d")) {
        return!1;
      }
      break;
    case "SPAN":
      if ("mw-editsection" === className) {
        return!1;
      }
      break;
    case "BR":
      return hasHiddenClassName = this$static.builder, hasHiddenClassName.flush && ($flushBlock(hasHiddenClassName, hasHiddenClassName.groupNumber), ++hasHiddenClassName.groupNumber, hasHiddenClassName.flush = !1), hasHiddenClassName = hasHiddenClassName.webTextBuilder, hasHiddenClassName.textBuffer += "\n", $add_0(hasHiddenClassName.allTextNodes, e), !1;
    case "TABLE":
      className = table_0(e);
      2 > sDebugLevel || (component = $getParentElement(e), logToConsole("TABLE: " + className + ", id\x3d" + e.id + ", class\x3d" + $getAttribute(e, "class") + ", parent\x3d[" + component.tagName + ", id\x3d" + component.id + ", class\x3d" + $getAttribute(component, "class") + "]"));
      if (className == ($clinit_TableClassifier$Type(), DATA)) {
        return hasHiddenClassName = this$static.builder, $flushBlock(hasHiddenClassName, hasHiddenClassName.groupNumber), $add_0(hasHiddenClassName.document_0.elements, new WebTable(e)), !1;
      }
      break;
    case "VIDEO":
      return hasHiddenClassName = this$static.builder, className = new WebVideo(e), $flushBlock(hasHiddenClassName, hasHiddenClassName.groupNumber), $add_0(hasHiddenClassName.document_0.elements, className), !1;
    case "OPTION":
    ;
    case "OBJECT":
    ;
    case "EMBED":
    ;
    case "APPLET":
      return this$static.builder.flush = !0, !1;
    case "HEAD":
    ;
    case "STYLE":
    ;
    case "SCRIPT":
    ;
    case "LINK":
    ;
    case "NOSCRIPT":
    ;
    case "IFRAME":
    ;
    case "svg":
      return!1;
  }
  className = this$static.builder;
  $clinit_ElementAction();
  extractor$iterator = getComputedStyle_0(e);
  component = new ElementAction;
  extractor = e.tagName;
  switch(extractor$iterator.display) {
    case "inline":
      break;
    case "inline-block":
    ;
    case "inline-flex":
      component.changesTagLevel = !0;
      break;
    case "block":
      if ("none" !== extractor$iterator["float"] && "SPAN" === extractor) {
        break;
      }
    ;
    default:
      component.flush = !0, component.changesTagLevel = !0;
  }
  if ("HTML" !== extractor && "BODY" !== extractor && "ARTICLE" !== extractor) {
    switch(keepAnyway = $getAttribute(e, "class"), extractor$iterator = ($clinit_DomUtil(), e.classList).length, visible = $getAttribute(e, "id"), (REG_COMMENT.test(keepAnyway) || REG_COMMENT.test(visible)) && 2 >= extractor$iterator && (extractor$iterator = component.labels, extractor$iterator[extractor$iterator.length] = "STRICTLY_NOT_CONTENT"), extractor) {
      case "ASIDE":
      ;
      case "NAV":
        extractor = component.labels;
        extractor[extractor.length] = "STRICTLY_NOT_CONTENT";
        break;
      case "LI":
        extractor = component.labels;
        extractor[extractor.length] = "de.l3s.boilerpipe/LI";
        break;
      case "H1":
        extractor = component.labels;
        extractor[extractor.length] = "de.l3s.boilerpipe/H1";
        extractor = component.labels;
        extractor[extractor.length] = "de.l3s.boilerpipe/HEADING";
        break;
      case "H2":
        extractor = component.labels;
        extractor[extractor.length] = "de.l3s.boilerpipe/H2";
        extractor = component.labels;
        extractor[extractor.length] = "de.l3s.boilerpipe/HEADING";
        break;
      case "H3":
        extractor = component.labels;
        extractor[extractor.length] = "de.l3s.boilerpipe/H3";
        extractor = component.labels;
        extractor[extractor.length] = "de.l3s.boilerpipe/HEADING";
        break;
      case "H4":
      ;
      case "H5":
      ;
      case "H6":
        extractor = component.labels;
        extractor[extractor.length] = "de.l3s.boilerpipe/HEADING";
        break;
      case "A":
        component.changesTagLevel = !0, e.hasAttribute("href") && (component.isAnchor = !0);
    }
  }
  $add_0(className.actionStack.arrayList, component);
  component.changesTagLevel && ++className.tagLevel;
  component.isAnchor && (extractor = className.webTextBuilder, extractor.inAnchor = !0, extractor.textBuffer += " ");
  className.flush |= component.flush;
  className = ($clinit_Boolean(), this$static.isHiddenClass ? TRUE : FALSE);
  $add_0(this$static.isHiddenStack.arrayList, className);
  this$static.isHiddenClass |= hasHiddenClassName;
  return!0;
}
function DomConverter(builder) {
  var extractor$iterator;
  this.isHiddenStack = new Stack;
  this.hiddenElements = new HashSet;
  this.builder = builder;
  this.extractors = new ArrayList;
  $add_0(this.extractors, new ImageExtractor);
  $add_0(this.extractors, new TwitterExtractor);
  $add_0(this.extractors, new VimeoExtractor);
  $add_0(this.extractors, new YouTubeExtractor);
  this.embedTagNames = new HashSet;
  for (extractor$iterator = new AbstractList$IteratorImpl(this.extractors);extractor$iterator.i < extractor$iterator.this$01_0.size_1();) {
    builder = (checkCriticalElement(extractor$iterator.i < extractor$iterator.this$01_0.size_1()), extractor$iterator.this$01_0.get_1(extractor$iterator.last = extractor$iterator.i++)), $addAll(this.embedTagNames, builder.getRelevantTagNames());
  }
}
defineClass(124, 1, {}, DomConverter);
_.exit = function(n) {
  if (1 == n.nodeType && canBeNested(n.tagName)) {
    var this$static = this.builder;
    n = new WebTag(n.tagName, ($clinit_WebTag$TagType(), END));
    $flushBlock(this$static, this$static.groupNumber);
    $add_0(this$static.document_0.elements, n);
  }
  this$static = this.builder;
  n = this$static.actionStack;
  var sz;
  sz = n.arrayList.array.length;
  if (0 < sz) {
    n = (checkArrayElementIndex(sz - 1, n.arrayList.array.length), $get_2(n.arrayList, sz - 1));
  } else {
    throw new EmptyStackException;
  }
  n.changesTagLevel && --this$static.tagLevel;
  if (this$static.flush || n.flush) {
    $flushBlock(this$static, this$static.groupNumber), ++this$static.groupNumber;
  }
  n.isAnchor && (n = this$static.webTextBuilder, n.inAnchor = !1, n.textBuffer += " ");
  $pop(this$static.actionStack);
  this.isHiddenClass = $pop(this.isHiddenStack).value_0;
};
_.visit = function(n) {
  switch(n.nodeType) {
    case 3:
      var this$static = this.builder;
      this$static.flush && ($flushBlock(this$static, this$static.groupNumber), ++this$static.groupNumber, this$static.flush = !1);
      var this$static$$0 = this$static.webTextBuilder, this$static = this$static.tagLevel, text_0;
      text_0 = n.data;
      text_0.length && (this$static$$0.textBuffer += text_0, $add_0(this$static$$0.allTextNodes, n), isStringAllWhitespace(text_0) || (n = ($clinit_StringUtil(), sWordCounter.count(text_0)), this$static$$0.numWords += n, this$static$$0.inAnchor && (this$static$$0.numAnchorWords += n), this$static$$0.lastNonWhitespaceNode = this$static$$0.allTextNodes.array.length - 1, this$static$$0.firstNonWhitespaceNode < this$static$$0.firstNode && (this$static$$0.firstNonWhitespaceNode = this$static$$0.lastNonWhitespaceNode), 
      -1 == this$static$$0.blockTagLevel && (this$static$$0.blockTagLevel = this$static)));
      return!1;
    case 1:
      return $visitElement(this, n);
    default:
      return!1;
  }
};
_.hasArticleElement = !1;
_.isHiddenClass = !1;
_.isMobileFriendly = !1;
createForClass(124);
function $clinit_ElementAction() {
  $clinit_ElementAction = emptyMethod;
  REG_COMMENT = /\bcomments?\b/;
}
function ElementAction() {
  this.labels = [];
}
defineClass(180, 1, {}, ElementAction);
_.changesTagLevel = !1;
_.flush = !1;
_.isAnchor = !1;
var REG_COMMENT;
createForClass(180);
function WebDocument() {
  this.elements = new ArrayList;
}
defineClass(117, 1, {}, WebDocument);
createForClass(117);
function $flushBlock(this$static, group) {
  var tb;
  tb = this$static.webTextBuilder;
  var offsetBlock = this$static.nextWebTextIndex;
  tb.firstNode == tb.allTextNodes.array.length ? tb = null : tb.firstNonWhitespaceNode < tb.firstNode ? ($reset_0(tb), tb = null) : (offsetBlock = new WebText(tb.textBuffer, tb.allTextNodes, tb.firstNode, tb.allTextNodes.array.length, tb.firstNonWhitespaceNode, tb.lastNonWhitespaceNode, tb.numWords, tb.numAnchorWords, tb.blockTagLevel, offsetBlock), $reset_0(tb), tb = offsetBlock);
  if (tb) {
    tb.groupNumber = group;
    ++this$static.nextWebTextIndex;
    var a$iterator, i;
    for (a$iterator = new AbstractList$IteratorImpl(this$static.actionStack.arrayList);a$iterator.i < a$iterator.this$01_0.size_1();) {
      for (offsetBlock = (checkCriticalElement(a$iterator.i < a$iterator.this$01_0.size_1()), a$iterator.this$01_0.get_1(a$iterator.last = a$iterator.i++)), i = 0;i < offsetBlock.labels.length;i++) {
        $add_2(tb.labels, offsetBlock.labels[i]);
      }
    }
    $add_0(this$static.document_0.elements, tb);
  }
}
function WebDocumentBuilder() {
  this.document_0 = new WebDocument;
  this.actionStack = new Stack;
  this.webTextBuilder = new WebTextBuilder;
  this.groupNumber = 0;
}
defineClass(123, 1, {}, WebDocumentBuilder);
_.flush = !1;
_.groupNumber = 0;
_.nextWebTextIndex = 0;
_.tagLevel = 0;
createForClass(123);
defineClass(216, 1, {});
_.isContent = !1;
createForClass(216);
function WebEmbed(e, t, embedId, params) {
  this.embedNodes = new ArrayList;
  this.id_0 = embedId;
  $add_0(this.embedNodes, e);
  this.type_0 = t;
  !params && new HashMap;
}
defineClass(57, 216, {}, WebEmbed);
_.generateOutput = function(textOnly) {
  if (textOnly) {
    return "";
  }
  textOnly = $doc.createElement("div");
  textOnly.className = "embed-placeholder";
  textOnly.setAttribute("data-type", this.type_0);
  textOnly.setAttribute("data-id", this.id_0);
  return textOnly.outerHTML;
};
createForClass(57);
function $clinit_WebImage() {
  $clinit_WebImage = emptyMethod;
  LAZY_SRCSET_ATTRIBUTES = initValues(getClassLiteralForArray_0(Ljava_lang_String_2_classLit, 1), $intern_7, 2, 4, ["data-srcset"]);
}
function $cloneAndProcessNode(this$static) {
  var attr, attr$array, attr$index, attr$max, cloned, i, src_0, srcs;
  cloned = this$static.imgElement.cloneNode(!0);
  attr$array = getFirstElementByTagNameInc(cloned);
  this$static.srcUrl.length && (attr$array.src = this$static.srcUrl, this$static.srcUrl = attr$array.src);
  0 < this$static.width_0 && 0 < this$static.height_0 && (attr$array.width = this$static.width_0, attr$array.height = this$static.height_0);
  stripImageElement(attr$array);
  srcs = cloned.getElementsByTagName("SOURCE");
  for (i = 0;i < srcs.length;i++) {
    for (src_0 = srcs[i], attr$array = LAZY_SRCSET_ATTRIBUTES, attr$index = 0, attr$max = attr$array.length;attr$index < attr$max;++attr$index) {
      if (attr = attr$array[attr$index], attr = $getAttribute(src_0, attr), attr.length) {
        src_0.setAttribute("srcset", attr);
        break;
      }
    }
  }
  makeAllSrcAttributesAbsolute(cloned);
  makeAllSrcSetAbsolute(cloned);
  this$static.clonedImg = cloned;
}
function WebImage(e, w, h, src_0) {
  $clinit_WebImage();
  this.imgElement = e;
  this.width_0 = w;
  this.height_0 = h;
  this.srcUrl = src_0;
  null == this.srcUrl && (this.srcUrl = "");
}
defineClass(32, 216, {32:1}, WebImage);
_.generateOutput = function(textOnly) {
  if (textOnly) {
    return "";
  }
  !this.clonedImg && $cloneAndProcessNode(this);
  return this.clonedImg.outerHTML;
};
_.height_0 = 0;
_.width_0 = 0;
var LAZY_SRCSET_ATTRIBUTES;
createForClass(32);
function WebFigure(e, w, h, src_0, caption) {
  $clinit_WebImage();
  WebImage.call(this, e, w, h, src_0);
  this.figCaption = caption;
}
defineClass(187, 32, {32:1}, WebFigure);
_.generateOutput = function(textOnly) {
  var figcaption;
  figcaption = ($clinit_DomUtil(), cloneAndProcessList(getOutputNodes(this.figCaption)));
  if (textOnly) {
    return getTextFromTreeForTest(figcaption);
  }
  textOnly = $doc.createElement("FIGURE");
  var newChild = (!this.clonedImg && $cloneAndProcessNode(this), this.clonedImg);
  textOnly.appendChild(newChild);
  !this.figCaption.innerHTML.length || textOnly.appendChild(figcaption);
  return textOnly.outerHTML;
};
createForClass(187);
function WebTable(tableRoot) {
  this.tableElement = tableRoot;
}
defineClass(69, 216, {69:1}, WebTable);
_.generateOutput = function(textOnly) {
  !this.cloned && (this.cloned = ($clinit_DomUtil(), cloneAndProcessList(getOutputNodes(this.tableElement))));
  return textOnly ? getTextFromTreeForTest(this.cloned) : this.cloned.outerHTML;
};
createForClass(69);
function $clinit_WebTag() {
  $clinit_WebTag = emptyMethod;
  nestingTags = new HashSet;
  $add_2(nestingTags, "UL");
  $add_2(nestingTags, "OL");
  $add_2(nestingTags, "LI");
  $add_2(nestingTags, "BLOCKQUOTE");
  $add_2(nestingTags, "PRE");
}
function WebTag(tagName, tagType) {
  $clinit_WebTag();
  this.tagName_0 = tagName;
  this.tagType = tagType;
}
function canBeNested(tagName) {
  $clinit_WebTag();
  return $contains_2(nestingTags, tagName);
}
defineClass(51, 216, {51:1}, WebTag);
_.generateOutput = function(textOnly) {
  return textOnly ? "" : "\x3c" + (this.tagType == ($clinit_WebTag$TagType(), START) ? "" : "/") + this.tagName_0 + "\x3e";
};
var nestingTags;
createForClass(51);
function $clinit_WebTag$TagType() {
  $clinit_WebTag$TagType = emptyMethod;
  START = new WebTag$TagType("START", 0);
  END = new WebTag$TagType("END", 1);
}
function WebTag$TagType(enum$name, enum$ordinal) {
  Enum.call(this, enum$name, enum$ordinal);
}
defineClass(52, 9, {3:1, 11:1, 9:1, 52:1}, WebTag$TagType);
var END, START, Lorg_chromium_distiller_webdocument_WebTag$TagType_2_classLit = createForEnum(52, function() {
  $clinit_WebTag$TagType();
  return initValues(getClassLiteralForArray_0(Lorg_chromium_distiller_webdocument_WebTag$TagType_2_classLit, 1), $intern_4, 52, 0, [START, END]);
});
function $getFirstNonWhitespaceTextNode_0(this$static) {
  return $get_2(this$static.allTextNodes, this$static.firstWordNode);
}
function $getInlineTags() {
  sInlineTags || (sInlineTags = new HashSet, $add_2(sInlineTags, "B"), $add_2(sInlineTags, "BIG"), $add_2(sInlineTags, "I"), $add_2(sInlineTags, "SMALL"), $add_2(sInlineTags, "TT"), $add_2(sInlineTags, "ABBR"), $add_2(sInlineTags, "ACRONYM"), $add_2(sInlineTags, "CITE"), $add_2(sInlineTags, "CODE"), $add_2(sInlineTags, "DFN"), $add_2(sInlineTags, "EM"), $add_2(sInlineTags, "KBD"), $add_2(sInlineTags, "STRONG"), $add_2(sInlineTags, "SAMP"), $add_2(sInlineTags, "TIME"), $add_2(sInlineTags, "VAR"), 
  $add_2(sInlineTags, "A"), $add_2(sInlineTags, "BDO"), $add_2(sInlineTags, "IMG"), $add_2(sInlineTags, "MAP"), $add_2(sInlineTags, "Q"), $add_2(sInlineTags, "SPAN"), $add_2(sInlineTags, "SUB"), $add_2(sInlineTags, "SUP"), $add_2(sInlineTags, "BUTTON"), $add_2(sInlineTags, "INPUT"), $add_2(sInlineTags, "LABEL"), $add_2(sInlineTags, "SELECT"), $add_2(sInlineTags, "TEXTAREA"));
  return sInlineTags;
}
function $getLastNonWhitespaceTextNode_0(this$static) {
  return $get_2(this$static.allTextNodes, this$static.lastWordNode);
}
function WebText(text_0, allTextNodes, start_0, end, firstWordNode, lastWordNode, numWords, numLinkedWords, tagLevel, offsetBlock) {
  this.text_0 = text_0;
  this.allTextNodes = allTextNodes;
  this.start_0 = start_0;
  this.end = end;
  this.firstWordNode = firstWordNode;
  this.lastWordNode = lastWordNode;
  this.numWords = numWords;
  this.numLinkedWords = numLinkedWords;
  this.labels = new HashSet;
  this.tagLevel = tagLevel;
  this.offsetBlock = offsetBlock;
}
defineClass(35, 216, {35:1}, WebText);
_.generateOutput = function(textOnly) {
  var clonedRoot, div, srcRoot;
  if ($contains_2(this.labels, "de.l3s.boilerpipe/TITLE")) {
    return "";
  }
  srcRoot = new AbstractList$SubList(this.allTextNodes, this.start_0, this.end);
  var s;
  if (1 == srcRoot.size_0) {
    clonedRoot = $cloneSubtree(new NodeTree((checkElementIndex(0, srcRoot.size_0), $get_2(srcRoot.wrapped, srcRoot.fromIndex))));
  } else {
    div = (checkElementIndex(0, srcRoot.size_0), $get_2(srcRoot.wrapped, srcRoot.fromIndex));
    clonedRoot = div.cloneNode(!1);
    for (srcRoot = new OrderedNodeMatcher(srcRoot);srcRoot.nextNode;) {
      if ($match(srcRoot, div)) {
        if (!srcRoot.nextNode) {
          break;
        }
        for (;;) {
          for (s = div.nextSibling;s && !s.contains(srcRoot.nextNode);) {
            s = s.nextSibling;
          }
          if (s) {
            clonedRoot = cloneParent(clonedRoot, div.parentNode);
            clonedRoot = cloneChild(clonedRoot, s);
            div = s;
            break;
          }
          div = div.parentNode;
          clonedRoot = cloneParent(clonedRoot, div);
        }
      } else {
        for (div = div.firstChild;!div.contains(srcRoot.nextNode);) {
          div = div.nextSibling;
        }
        clonedRoot = cloneChild(clonedRoot, div);
      }
    }
    for (;clonedRoot.parentNode;) {
      clonedRoot = clonedRoot.parentNode;
    }
  }
  1 != clonedRoot.nodeType && (div = $getParentElement($get_0(new AbstractList$SubList(this.allTextNodes, this.start_0, this.end), 0)).cloneNode(!1), div.appendChild(clonedRoot), clonedRoot = div);
  "BODY" === clonedRoot.tagName && (div = $doc.createElement("div"), div.innerHTML = clonedRoot.innerHTML || "", clonedRoot = div);
  for (srcRoot = null;$contains_2($getInlineTags(), clonedRoot.tagName);) {
    srcRoot || (srcRoot = getNearestCommonAncestor_0(new AbstractList$SubList(this.allTextNodes, this.start_0, this.end)), 1 != srcRoot.nodeType && (srcRoot = $getParentElement(srcRoot)));
    srcRoot = $getParentElement(srcRoot);
    if ("BODY" === srcRoot.tagName) {
      break;
    }
    div = srcRoot.cloneNode(!1);
    div.appendChild(clonedRoot);
    clonedRoot = div;
  }
  makeAllLinksAbsolute(clonedRoot);
  $clinit_DomUtil();
  stripAttributeFromTags(clonedRoot, "TARGET", initValues(getClassLiteralForArray_0(Ljava_lang_String_2_classLit, 1), $intern_7, 2, 4, ["A"]));
  stripAttributeFromTags(clonedRoot, "ID", initValues(getClassLiteralForArray_0(Ljava_lang_String_2_classLit, 1), $intern_7, 2, 4, ["*"]));
  div = clonedRoot;
  $clinit_DomUtil();
  1 == div.nodeType && div.hasAttribute("class") && (-1 != $getAttribute(div, "class").indexOf("caption") ? div.className = "caption" : div.removeAttribute("class"));
  div = querySelectorAll(div, "[class]");
  for (srcRoot = 0;srcRoot < div.length;srcRoot++) {
    -1 != $getAttribute(div[srcRoot], "class").indexOf("caption") ? div[srcRoot].className = "caption" : div[srcRoot].removeAttribute("class");
  }
  stripAttributeFromTags(clonedRoot, "COLOR", initValues(getClassLiteralForArray_0(Ljava_lang_String_2_classLit, 1), $intern_7, 2, 4, ["FONT"]));
  stripAttributeFromTags(clonedRoot, "STYLE", initValues(getClassLiteralForArray_0(Ljava_lang_String_2_classLit, 1), $intern_7, 2, 4, ["*"]));
  stripAllUnsafeAttributes(clonedRoot);
  return textOnly ? getTextFromTreeForTest(clonedRoot) : canBeNested(clonedRoot.tagName) ? clonedRoot.innerHTML : clonedRoot.outerHTML;
};
_.end = 0;
_.firstWordNode = 0;
_.groupNumber = 0;
_.lastWordNode = 0;
_.numLinkedWords = 0;
_.numWords = 0;
_.offsetBlock = 0;
_.start_0 = 0;
_.tagLevel = 0;
var sInlineTags = null;
createForClass(35);
function $reset_0(this$static) {
  this$static.textBuffer = "";
  this$static.numWords = 0;
  this$static.numAnchorWords = 0;
  this$static.firstNode = this$static.allTextNodes.array.length;
  this$static.blockTagLevel = -1;
}
function WebTextBuilder() {
  this.allTextNodes = new ArrayList;
}
defineClass(156, 1, {}, WebTextBuilder);
_.blockTagLevel = -1;
_.firstNode = 0;
_.firstNonWhitespaceNode = -1;
_.inAnchor = !1;
_.lastNonWhitespaceNode = 0;
_.numAnchorWords = 0;
_.numWords = 0;
_.textBuffer = "";
createForClass(156);
function WebVideo(e) {
  this.videoElement = e;
}
defineClass(179, 216, {}, WebVideo);
_.generateOutput = function(textOnly) {
  var curNode, ve;
  if (textOnly) {
    return "";
  }
  ve = this.videoElement.cloneNode(!1);
  for (textOnly = 0;textOnly < this.videoElement.childNodes.length;textOnly++) {
    curNode = this.videoElement.childNodes[textOnly], 1 != curNode.nodeType || "SOURCE" !== curNode.tagName && "TRACK" !== curNode.tagName || (curNode = curNode.cloneNode(!1), ve.appendChild(curNode));
  }
  ve.poster.length && (ve.poster = ve.poster);
  makeAllSrcAttributesAbsolute(ve);
  $clinit_DomUtil();
  stripAttributeFromTags(ve, "ID", initValues(getClassLiteralForArray_0(Ljava_lang_String_2_classLit, 1), $intern_7, 2, 4, ["*"]));
  stripAllUnsafeAttributes(ve);
  return ve.outerHTML;
};
createForClass(179);
defineClass(218, 1, {});
_.getImageScore = function(e) {
  var score;
  score = 0;
  e && (score = this.computeScore(e));
  2 <= sDebugLevel && logToConsole($getSimpleName(this.___clazz$) + ": " + score + "/" + this.maxScore);
  return min_0(score, this.maxScore);
};
createForClass(218);
function AreaScorer() {
  this.maxScore = 25;
  this.minArea = 75E3;
  this.maxArea = 2E5;
}
defineClass(157, 218, {}, AreaScorer);
_.computeScore = function(e) {
  e = ((e.offsetWidth || 0) | 0) * ((e.offsetHeight || 0) | 0);
  if (e < this.minArea) {
    return 0;
  }
  e = round_int((e - this.minArea) / (this.maxArea - this.minArea) * this.maxScore);
  return min_0(e, this.maxScore);
};
_.getMaxScore = function() {
  return this.maxScore;
};
_.maxArea = 0;
_.maxScore = 0;
_.minArea = 0;
createForClass(157);
function DimensionsRatioScorer() {
  this.maxScore = 25;
}
defineClass(158, 218, {}, DimensionsRatioScorer);
_.computeScore = function(e) {
  var height, width_0;
  height = (e.offsetHeight || 0) | 0;
  if (0 >= height) {
    return 0;
  }
  width_0 = (e.offsetWidth || 0) | 0;
  e = 0;
  height = width_0 / height;
  1.4500000476837158 < height && 1.7999999523162842 > height ? e = 1 : 1.2999999523162842 < height && 2.200000047683716 > height && (e = 0.4000000059604645);
  return round_int(this.maxScore * e);
};
_.getMaxScore = function() {
  return this.maxScore;
};
_.maxScore = 0;
createForClass(158);
function DomDistanceScorer(firstContent) {
  this.maxScore = 25;
  this.firstContentNode = firstContent;
}
defineClass(159, 218, {}, DomDistanceScorer);
_.computeScore = function(e) {
  var multiplier;
  if (!this.firstContentNode) {
    return 0;
  }
  e = ($clinit_DomUtil(), getParentNodes(this.firstContentNode).array.length - 1 - (getParentNodes(getNearestCommonAncestor(this.firstContentNode, e)).array.length - 1));
  multiplier = 0;
  4 > e ? multiplier = 1 : 6 > e ? multiplier = 0.6000000238418579 : 8 > e && (multiplier = 0.20000000298023224);
  return round_int(this.maxScore * multiplier);
};
_.getMaxScore = function() {
  return this.maxScore;
};
_.maxScore = 0;
createForClass(159);
function HasFigureScorer() {
  this.maxScore = 15;
}
defineClass(160, 218, {}, HasFigureScorer);
_.computeScore = function(e) {
  var n$iterator;
  e = getParentNodes(e);
  for (n$iterator = new AbstractList$IteratorImpl(e);n$iterator.i < n$iterator.this$01_0.size_1();) {
    if (e = (checkCriticalElement(n$iterator.i < n$iterator.this$01_0.size_1()), n$iterator.this$01_0.get_1(n$iterator.last = n$iterator.i++)), 1 == e.nodeType && "FIGURE" === e.tagName) {
      return this.maxScore;
    }
  }
  return 0;
};
_.getMaxScore = function() {
  return this.maxScore;
};
_.maxScore = 0;
createForClass(160);
var I_classLit, clazz$$inline_1127;
clazz$$inline_1127 = createClassObject("I");
clazz$$inline_1127.typeId = "I";
clazz$$inline_1127.modifiers = 1;
I_classLit = clazz$$inline_1127;
createForClass(199);
createForClass(201);
createForClass(null);
createForClass(204);
Ljava_util_Map$Entry_2_classLit = createForInterface();
_ = function(namespace) {
  var cur = this;
  if ("$wnd" == namespace) {
    return $wnd;
  }
  if ("" === namespace) {
    return cur;
  }
  "$wnd." == namespace.substring(0, 5) && (cur = $wnd, namespace = namespace.substring(5));
  namespace = namespace.split(".");
  namespace[0] in cur || !cur.execScript || cur.execScript("var " + namespace[0]);
  for (var part;namespace.length && (part = namespace.shift());) {
    cur[part] ? cur = cur[part] : cur = cur[part] = {};
  }
  return cur;
}("org.chromium.distiller.DomDistiller");
_.apply = function() {
  var obj;
  return applyWithOptions((obj = {}, obj));
};
_.applyWithOptions = applyWithOptions;
function $entry(jsFunction) {
  return function() {
    var JSCompiler_inline_result;
    a: {
      var args = arguments, initialEntry;
      0 != entryDepth && (initialEntry = Date.now ? Date.now() : (new Date).getTime(), 2E3 < initialEntry - watchdogEntryDepthLastScheduled && (watchdogEntryDepthLastScheduled = initialEntry, watchdogEntryDepthTimerId = $wnd.setTimeout(watchdogEntryDepthRun, 10)));
      if (0 == entryDepth++) {
        initialEntry = ($clinit_SchedulerImpl(), INSTANCE);
        var oldQueue, rescheduled;
        if (initialEntry.entryCommands) {
          rescheduled = null;
          do {
            oldQueue = initialEntry.entryCommands, initialEntry.entryCommands = null, rescheduled = runScheduledTasks(oldQueue, rescheduled);
          } while (initialEntry.entryCommands);
          initialEntry.entryCommands = rescheduled;
        }
        initialEntry = !0;
      } else {
        initialEntry = !1;
      }
      try {
        JSCompiler_inline_result = jsFunction.apply(this, args);
        break a;
      } finally {
        if (args = initialEntry) {
          if (initialEntry = ($clinit_SchedulerImpl(), INSTANCE), initialEntry.finallyCommands) {
            rescheduled = null;
            do {
              oldQueue = initialEntry.finallyCommands, initialEntry.finallyCommands = null, rescheduled = runScheduledTasks(oldQueue, rescheduled);
            } while (initialEntry.finallyCommands);
            initialEntry.finallyCommands = rescheduled;
          }
        }
        --entryDepth;
        args && -1 != watchdogEntryDepthTimerId && ($wnd.clearTimeout(watchdogEntryDepthTimerId), watchdogEntryDepthTimerId = -1);
      }
      JSCompiler_inline_result = void 0;
    }
    return JSCompiler_inline_result;
  };
}
var gwtOnLoad = gwtOnLoad = function(errFn, modName, modBase) {
  function initializeModules() {
    for (var i = 0;i < initFnList.length;i++) {
      initFnList[i]();
    }
  }
  null == initFnList_0 && (initFnList_0 = []);
  var initFnList = initFnList_0;
  $moduleName = modName;
  $moduleBase = modBase;
  if (errFn) {
    try {
      $entry(initializeModules)();
    } catch (e) {
      errFn(modName, e);
    }
  } else {
    $entry(initializeModules)();
  }
};
(function() {
  null == initFnList_0 && (initFnList_0 = []);
  for (var initFnList = initFnList_0, i = 0;i < arguments.length;i++) {
    initFnList.push(arguments[i]);
  }
})(function() {
  $wnd.setTimeout($entry(assertCompileTimeUserAgent));
  var allowedModes, currentMode, i;
  currentMode = $doc.compatMode;
  allowedModes = initValues(getClassLiteralForArray_0(Ljava_lang_String_2_classLit, 1), $intern_7, 2, 4, ["CSS1Compat"]);
  for (i = 0;i < allowedModes.length && allowedModes[i] !== currentMode;i++) {
  }
});
var propertyValue$$inline_1136 = [[["locale", "default"], ["user.agent", "safari"]]];
"object" === typeof window && "object" === typeof window.$gwt && (window.$gwt.permProps = propertyValue$$inline_1136);
window.gwtOnLoad = gwtOnLoad;
gwtOnLoad(undefined, "domdistiller", "", 0);})();