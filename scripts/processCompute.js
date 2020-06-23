
const fs = require('fs'),
    program = require('commander'),
    tParse = require('parser/timelineParser')


program
    .option('-t, --trace [trace]','path to chrome trace log')
    .parse(process.argv);


function main(){
    var traceLog = JSON.parse(fs.readFileSync(program.trace),"utf-8");
    var computeCatMap = tParse.TimelineModel(traceLog);
    var total = Array.from(computeCatMap.values()).reduce((curr,acc)=>{return parseFloat(acc) + parseFloat(curr)},0);

    console.log(total);
}

main();