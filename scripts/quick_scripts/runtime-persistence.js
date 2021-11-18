

const fs = require('fs'),
    program = require('commander');

program
    .option('-l, --log [log]', 'path to chrome log file')
    .parse(process.argv);


var parseLogFile = function(f){
    var res = {};
    var file = fs.readFileSync(f, 'utf-8');
    file.split('\n').forEach((line)=>{
        if (line == '') return;
        var [_ts, count] = line.split(' ');
        var ts = _ts.split('/')[10],
            page = _ts.split('/')[9];
        if (!(page in res))
            res[page] = [];
        res[page].push([Number.parseInt(ts), count]);
    })
    Object.keys(res).forEach((page)=>{
        res[page] = res[page].sort((a,b)=>{return a[0]-b[0]});
    })
    return res;
    // return res.sort((a,b)=>{return a[0]-b[0]});
}

var computePersistenceInfo = function(){
    var alldata = parseLogFile(program.log);
    Object.keys(alldata).forEach((page)=>{
        data = alldata[page];
        var totalMax = curMax = 0;
            curCount = data[0][1];
        data.forEach((entry)=>{
            var [ts, count] = entry;
            if (count != curCount){
                //reset
                if (curMax > totalMax) {
                    // console.log(`found new total max: ${curMax}, prev: ${totalMax}`)
                    totalMax = curMax;
                    
                }
                curMax = 0;
                curCount = count;
            } else {
                curMax++;
            }
        });
        console.log(page, totalMax)
    });
}

computePersistenceInfo();