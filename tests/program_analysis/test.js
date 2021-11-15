
(function(){if (typeof __tracer == 'undefined' && typeof window != 'undefined')
				 { __tracer = new window.top.__declTracerObject__(window);
				    }
				   if (self.window != self){
				   	__tracer = {isProxy:function(e){return e}, handleProtoAssignments: function(e){return e}}
				   }
                   if (__tracer && __tracer.cacheInit){
                       __tracer.cacheInit("test.js")
                   }
				})();

    function a(){
        var bcd = __tracerPROXY.anotherglobal;
        function b(){var __closureObj0 = {__isClosureObj:true,bcd : bcd,set_bcd : function(o){bcd = o},bcd : bcd,set_bcd : function(o){bcd = o},};
var closureScope0 =  __tracer.createClosureProxy(__closureObj0 ,'<anonymous>-function-2-13-2-14');
{
            __tracerPROXY.global = closureScope0.bcd + 2;
            closureScope0.bcd = 4;
            function d(){

            }
        }}
        function c(){
            function e(){
                
            }
        }
        return b;
    }
    var ret = a();
    ret();
    (function(){
                    if (__tracer && __tracer.exitFunction)
                        __tracer.exitFunction();
                })();