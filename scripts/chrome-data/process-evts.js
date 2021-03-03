/**
 * This module process the event handlers
 */

 const fs = require('fs'),
    program = require('commander');
const { toNamespacedPath } = require('path');


program
    .option('-i, --input [value]','path to list of event handlers')
    .parse(process.argv);



var parse = function(f){
    return JSON.parse(fs.readFileSync(f));
}

var isDOMHandler = function(h){
    const IGNORE_ELEMENTS = ['SCRIPT', 'IFRAME', 'BODY','LINK','IMG'
        ,'INPUT','FORM']

    var elemId = h[0];
    if (IGNORE_ELEMENTS.filter(e=>elemId.indexOf(e)>=0).length)
        return false;
    
    if (elemId.indexOf('href')>=0){
        var href = elemId.split('href:');
        if (href != '#' && href.indexOf('javascript')<0)
            return false;
        else return true;
    }

    return true;
}

var all_handlers_on = ["onabort", "onblur", "onchange", "onclick", "onclose", "oncontextmenu", "ondblclick", "onfocus",
    "oninput", "onkeydown", "onkeypress", "onkeyup", "onmouseenter", "onmousedown", "onmouseleave", "onmousemove", "onmouseout",
    "onmouseover", "onmouseup", "onreset", "onresize", "onscroll", "onselect", "onsubmit" ];
var all_handlers = ["abort", "blur", "change", "click", "close", "ctextmenu", "dblclick", "focus",
    "input", "keydown", "keypress", "keyup", "mouseenter", "mousedown", "mouseleave", "mousemove", "mouseout",
    "mouseover", "mouseup", "reset", "resize", "scroll", "select", "submit" ];
var getHandlers = function(h, all){
    var total = 0;
    if (all) return Object.keys(h[1]).length;
    Object.keys(h[1]).forEach((evt)=>{
      if (all_handlers.indexOf(evt)>=0) total++  
    })
    return total;
}

function processHandlers(handlers){
    var total = 0, domH = 0;
    handlers.forEach(h => {
        total+=getHandlers(h, true);
        var isDH = isDOMHandler(h);
        isDH && (domH+=getHandlers(h))
    });

    console.log(total, domH);
}

processHandlers(parse(program.input));