

const fs = require('fs'),
    program = require('commander');

program
    .option('-l, --log [log]', 'path to chrome log file')
    .parse(process.argv);

var getAverage = function (arr) {
    if (!arr.length) return 0;
    var sum = 0;
    arr.forEach((a) => { sum += a })
    return sum / arr.length;
}

var parseLogFile = function (f) {
    var res = [];
    var file = fs.readFileSync(f, 'utf-8');
    file.split('\n').forEach((line) => {
        if (line == '') return;
        var [ts, count] = line.split(' ');
        res.push([Number.parseInt(ts), count]);
    })
    // return res;
    return res.sort((a, b) => { return a[0] - b[0] });
}

var computePersistenceInfo = function () {
    var alldata = parseLogFile(program.log);
    var totalMax = curMax = 0, maxValue = 0;
    curErr = alldata[0][1],
        consistentRuntimes = [],
        curCount = 0;
    alldata.forEach((data) => {
        var [ts, err] = data;
        if (err != curErr) {
            //reset
            // if (curMax > totalMax) {
            //     // console.log(`found new total max: ${curMax}, prev: ${totalMax}`)
            //     totalMax = curMax;
            //     maxValue = count;
            // }
            consistentRuntimes.push(curCount);
            curCount = 0;
        } else {
            curCount++;
        }

    });
    consistentRuntimes.push(curCount);
    console.log(getAverage(consistentRuntimes), consistentRuntimes.length, alldata.length);
}

computePersistenceInfo();