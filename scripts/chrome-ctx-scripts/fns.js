/**
 * This file contains custom functions 
 * that are executed after chrome is finished 
 * loading the page to extract information
 * about the page load process
 */

const fs = require('fs');

var getCallGraph = async function(page, program){
    var _cgObj = await page.evaluateHandle(() => window.__tracer.getEvtFns());
    var cg = await _cgObj.jsonValue();
    dump(cg, `${program.output}/cg`);
}

var dump = function(data, file){
    fs.writeFileSync(file, JSON.stringify(data));
}


module.exports = {
    getCallGraph : getCallGraph
}