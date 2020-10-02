/**
 * This module contains utility functions
 */

 const fs = require('fs'),
    program = require('commander'),
    netParser = require('parser/networkParser');


program
    .option('-i, --input [input]','path to the input file')
    .option('-t, --type [type]','type of run')
    .option('-o, --output [output]','path to output file')
    .parse(process.argv);


var parse = function(f){
    return JSON.parse(fs.readFileSync(f));
}

var pruneDB = function(d){
    var critera = "Top/News"
    d.forEach((entry)=>{
        if (entry.category.indexOf(critera)>=0)
            console.log(entry.url);
    });
}

var getQueueTime = function(data){
    var net = netParser.parseNetworkLogs(parse(data));
    for (var n of net){
        var startTime = n.requestStart_o;
        if (n.redirectResponse){
            console.log( (n.redirectResponse.timing.requestTime - n.requestStart_o)*1000 );
            startTime = n.redirectStart_o;
        } 
        if (n.response)
            console.log(( n.response.timing.requestTime - startTime)*1000);
    }
}

var getStallTime = function(data){
    var net = netParser.parseNetworkLogs(parse(data));
    for (var n of net){
        if (!n.response) continue;
        if (n.redirectResponse){
            console.log(n.redirectResponse.timing.sendStart - n.redirectResponse.timing.sslEnd);
        } 
        if (n.response)
            console.log(n.response.timing.sendStart - n.response.timing.sslEnd);
    }
}

var getNetSize = function(data){
    var net = netParser.parseNetworkLogs(data);
    var total = 0;
    for (var n of net){
        if (!n.size) continue;
        total += n.size;
    }
    console.log(total);
}

var getNetLen = function(data){
    var net = netParser.parseNetworkLogs(parse(data));
    console.log(net.length);
}



switch (program.type){
    case "prune": pruneDB(parse(program.input)); break
    case "netSize": getNetSize(parse(program.input)); break;
    case "stall": getStallTime(program.input); break;
    case "queue" : getQueueTime(program.input); break;
    case "len": getNetLen(program.input); break;
}