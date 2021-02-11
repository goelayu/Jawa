/**
 * This file contains custom functions 
 * that are executed after chrome is finished 
 * loading the page to extract information
 * about the page load process
 */

const fs = require('fs');

var getCallGraph = async function(page, program, index){
    var _cgObj = await page.evaluateHandle(() => window.__tracer.getEvtFns());
    var cg = await _cgObj.jsonValue();
    dump(cg, `${program.output}/cg${index}`);
}

var getAllFns = async function(page, program){
    var _allFns = await page.evaluateHandle(() => window.__tracer.getAllFns());
    var allFns = await _allFns.jsonValue();
    dump(allFns, `${program.output}/allFns`);
}

var dump = function(data, file){
    fs.writeFileSync(file, JSON.stringify(data));
}


module.exports = {
    getCallGraph : getCallGraph,
    getAllFns : getAllFns
}