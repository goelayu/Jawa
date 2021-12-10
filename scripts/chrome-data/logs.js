var fs = require('fs')
var util = require('util'),
	strSim=require('string-similarity'),
	program = require('commander'),
	netParser = require(`../../parser/networkParser`);


program
    .option("-m, --modified [modified]", "path to the modified log file")
    .option("-o, --original [original]", "path to the original log file")
    .option("-t, --type [type]","type of analysis to run")
    .option("-v, --verbose", "verbose logs")
	.option("-n, --network [network]", 'path to the network log (optional)')
    .parse(process.argv);

var parse = function(f){
	return JSON.parse(fs.readFileSync(f));
}
	
var flag = program.type
var verbose = false;
var log1, log2;
try {
	log1 = JSON.parse(fs.readFileSync(program.original, "utf-8"))
	// log2 = JSON.parse(fs.readFileSync(program.original,"utf-8"))

	// if (!log1.length)
	// 	process.stderr.write(util.format("Empty logs: log1" + process.argv[3] + "\n"));
	// if (!log2.length)
	// 	process.stderr.write("Empty logs: log2" + process.argv[3] + "\n");

} catch (e) {
	// console.error(e);
	if (flag != "-l") {
		var unmodified = e.toString().indexOf("unmodified") >= 0 ? true : false; 
		process.stderr.write(util.format("na", !unmodified, unmodified,"\n"));
	}
	process.exit();
}

function getConsoleLogs(logs1){
	var caches = []
	logs1.forEach((l)=>{
		if (l.type == "log")
			caches.push(l.args.map((e)=>{return e.value}));
	});
	if (!caches.length) return;
	var hits = caches.reduce((result, e)=>{
		if (String(e[0]).indexOf("hit")>=0) result.push(e[0]); return result;},[]);
	var misses  = caches.reduce((result, e)=>{
		if (String(e[0]).indexOf("miss")>=0) result.push(e); return result;
	});
	var numberOfFunctions;
	logs1.forEach((c)=>{
		var _fileName = process.argv[3].split('/');
		var fileName = _fileName[_fileName.length -2];
		if (c.type == "log" && String(c.args[0].value).indexOf("total") >=0 && c.stackTrace.callFrames[0].url.indexOf(fileName) >= 0)
			numberOfFunctions = c.args[0].value;
	});
	//numberOfFunctions.replace( /^\D+/g, '')
	console.log(hits.length + "," +  misses.length);
}
function getExceptionsDiff(){
	process.stdout.write(util.format(calculateErrors(log1) - matchingExceptions(log1, log2), calculateErrors(log1), calculateErrors(log2)));
}

function simpleErrorMatch(l1, l2){
	var matches = [];
	var unmatch = [];
	for (var i1 of l1){
		for (var i2 of l2){
			if (i1 == i2) {
				matches.push(i1);
				break;
			}
		}
	}
	for (var i1 of l1){
		if (matches.indexOf(i1) < 0)
			unmatch.push(i1);
	}
	process.stdout.write(util.format(matches.length + " " + unmatch.length + " "  + JSON.stringify(unmatch))  );
}

function matchingExceptions(log1, log2){
	var exceptions1 = [], unmatches = [];
	var exceptionCount = 0;
    log1.forEach((l) => {
        if (l.exceptionDetails){
            //Either there is an exceptions object or the description is contained inside the text object
            if (l.exceptionDetails.exception && l.exceptionDetails.exception.description) {
                var exception = l.exceptionDetails.text.length > l.exceptionDetails.exception.description.length ? 
	                	l.exceptionDetails.text : l.exceptionDetails.exception.description || "";
                if (exception.indexOf("at")>=0)
                	exceptions1.push(exception.substr(0, exception.indexOf("at")));
                else exceptions1.push(exception);
            } else {
                exceptions1.push(l.exceptionDetails.text ? l.exceptionDetails.text 
                	: l.exceptionDetails.value );
            }
        }
    });
	var exceptions2 = [];
	log2.forEach((l) => {
	    if (l.exceptionDetails){
	            if (l.exceptionDetails.exception) {
	                var exception = l.exceptionDetails.text.length > l.exceptionDetails.exception.description.length ? 
	                	l.exceptionDetails.text : l.exceptionDetails.exception.description || "";
	                if (exception.indexOf("at")>=0)
	                	exceptions2.push(exception.substr(0, exception.indexOf("at")));
	                else exceptions2.push(exception);
	            } else {
	                exceptions2.push(l.exceptionDetails.text);
	            }
	    }
	});
	// console.error(exceptions1);
	// console.error(exceptions2);
	for (var ex1 in exceptions1){
		var foundMatch = false;
		// console.log("exception1" + exceptions1[ex1]);
		for (var ex2 in exceptions2){
			// console.log("exceptions2" + exceptions2[ex2]);
			if ( (exceptions1[ex1] == exceptions2[ex2]) || exceptions1[ex1].indexOf("DOMException")>=0
			|| exceptions1[ex1].indexOf("tracerPROXY")>=0 ) {
				exceptionCount++;
				foundMatch = true;
				break;
			}
		}
		/*if logs2 is empty*/
		if (exceptions1[ex1].indexOf("DOMException")>=0 ) {
			exceptionCount++;
			foundMatch=true;  
		}
		if (!foundMatch){
			/*Didn't find exact match, let's get ss mettric*/
			for (var ex2 in exceptions2){
				// console.log("exceptions2" + exceptions2[ex2]);
				var ss = strSim.compareTwoStrings(exceptions1[ex1], exceptions2[ex2]);
				if (ss > 0.9){
					
				}
			}
			unmatches.push(exceptions1[ex1]);
		}
	}
	if (program.verbose) {
		console.error(exceptions1);
		console.error(exceptions2);
	}
	// console.error(unmatches);
	return exceptionCount;

}

var errorFromMain = function(log){
	// return false;
	var net = netParser.parseNetworkLogs(parse(program.network));
	return log.exceptionDetails &&
		log.exceptionDetails.url == net[0].documentURL;
}

function calculateErrors(log){
	var count=0;
	var avoidErrors = ['404 NOT FOUND', '(in promise)']
	log.forEach((l) => {
		if (l.exceptionDetails && 
			l.exceptionDetails.exception &&
			l.exceptionDetails.exception.description && 
			l.exceptionDetails.exception.description.indexOf('404 NOT FOUND')<0 &&
			l.exceptionDetails.text && l.exceptionDetails.text.indexOf('in promise')<0 /*&&
			!errorFromMain(l) */ ) {
				if (program.verbose)
					console.log(l.exceptionDetails.exception.description)
				count++;
		}
	});
	return count;
}

console.log(calculateErrors(log1));
		
// if (flag != "l" && flag !== "e" && flag != "simple") { console.error("No flag provided: \nUsage: node logs.js <firstLog> <secondLog> <flag>"); process.exit(); }
// if (flag == "e") getExceptionsDiff();
// else if (flag == "l") {getConsoleLogs(log1);}
// else if (flag == "simple") simpleErrorMatch(log1, log2);
