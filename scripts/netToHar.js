

var {netEvents} = require('parser/networkParser_v2'),
    har = require('parser/har.js'),
    program = require('commander'),
    fs = require('fs');


program
    .option('-i, --input [input]','path to main log directory')
    .option('-o, --output [output]', 'path to the output file')
    .parse(process.argv);


var parse = function(f){
    return JSON.parse(
        fs.readFileSync(f,"utf-8")
    );
}

function main(){
    var net = parse(`${program.input}/network`);
    var plt = parse(`${program.input}/plt`);
    var pNet = new netEvents(net, plt);
    pNet.processEvents();
    var harLog = har.create([pNet]);
    fs.writeFileSync(program.output, JSON.stringify(harLog));
}

main();