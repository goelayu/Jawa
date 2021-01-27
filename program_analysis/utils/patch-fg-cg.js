/**
 * This module takes in the cg and fg and finds missing callee values 
 */

var findMissingCallees = function(cg, fg){
    var cgCallees = cg.map(e=>e[0]);
    var allCallees = fg.map(e=>e[1]).filter(e=>e.indexOf('Callee')>=0)
        .map(e=>e.replace('"Callee(','').replace(')";',''));
    var missingCallees = allCallees.filter(e=> cgCallees.indexOf(e)<0);
    console.log(missingCallees);
    missingCallees.forEach((mc)=>{
        cg.push([mc, null]);
    });
}

module.exports = {
    findMissingCallees:findMissingCallees
}