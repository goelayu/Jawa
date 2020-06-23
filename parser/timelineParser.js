/*
Parses chrome timeline trace
*/

const devToolsModel = require('devtools-timeline-model');


function dumpTree(tree, timeValue) {
  var result = new Map();
  tree.children.forEach((value, key) => result.set(key, value[timeValue].toFixed(1)));
  return result;
}


function TimelineModel(data){
    var model = new devToolsModel(data);
    var map = dumpTree(model.bottomUpGroupBy('Category'), 'selfTime');
    return map;
}

module.exports = {
    TimelineModel: TimelineModel
}