var fs = require('fs'),
    program = require('commander');

program
    .option('-e, --evt [evt]', 'file containing list of urls')
    .option('--filter', 'is filter events')
    .parse(process.argv);


var parseEvt = function(e){
    var total = 0, input = 0, scripts = 0;  
    var IGNORE_ELEMENTS = ['SCRIPT', 'IFRAME', 'BODY','LINK','IMG','HTML']
    e.forEach((evt)=>{
        var [elem, handlers] = evt;
        total += Object.keys(handlers).length;
        if (elem.indexOf('INPUT')>=0 || elem.indexOf('FORM')>=0)
            input += Object.keys(handlers).length;
        for (var ig of IGNORE_ELEMENTS){
            if (elem.indexOf(ig)>=0){
                scripts += Object.keys(handlers).length;
                break;
            }
        }
    })
    return [total,input, scripts];
}

var parseEvtFilter = function(e){
    var total = 0;
    e.forEach((evt)=>{
        var [_, handlers] = evt;
        total += JSON.parse(handlers).length;
    })
    return total;
}

if (program.filter) console.log(parseEvtFilter(JSON.parse(fs.readFileSync(program.evt, 'utf-8'))));
else console.log(parseEvt(JSON.parse(fs.readFileSync(program.evt, 'utf-8'))));


