

const fs = require('fs'),
    program = require('commander');

program
    .option('-l, --log [log]', 'path to chrome log file')
    .parse(process.argv);


var parseLogFile = function(f){
    var res = [];
    var file = fs.readFileSync(f, 'utf-8');
    file.split('\n').forEach((line)=>{
        if (line == '') return;
        var [ts, count] = line.split(' ');
        res.push([Number.parseInt(ts), count]);
    })
    // return res;
    return res.sort((a,b)=>{return a[0]-b[0]});
}

var computePersistenceInfo = function(){
    var alldata = parseLogFile(program.log);
    var totalMax = curMax = 0, maxValue = 0;
            curCount = alldata[0][1];
    alldata.forEach((data)=>{
        var [ts, count] = data;
        if (count != curCount){
            //reset
            if (curMax > totalMax) {
                // console.log(`found new total max: ${curMax}, prev: ${totalMax}`)
                totalMax = curMax;
                maxValue = count;
            }
            curMax = 0;
            curCount = count;
        } else {
            curMax++;
        }

    });
    console.log(totalMax, maxValue)
}

computePersistenceInfo();