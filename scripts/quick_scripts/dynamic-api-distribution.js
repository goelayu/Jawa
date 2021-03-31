/**
 * This script computes the distribution of 
 * dynamic api calls as made from analytics,
 * first party, and filtered scripts
 */

const fs = require('fs'),
    program = require('commander');

program
    .option('-d,--dyn [value]',help='dynamic api data')
    .option('-s, --js-src []',help='path to the js src files')
    .parse(process.argv);

var parse = function(f){
    return JSON.parse(fs.readFileSync(f,'utf-8'));
}
var getFilterRules = function(){
    var p = `${__dirname}/../../filter-lists/archive-filter.txt`;
    var _filters = fs.readFileSync(p,'utf-8'), filters=[];
    _filters.split('\n').forEach((f)=>{
        if (f == '' || f == '\n') return;
        filters.push(f);
    });
    return filters;
}

var getFilteredUrls = function(urls,filenames){
    var filters = getFilterRules(), filteredUrls = [];
    urls.forEach((u,idx)=>{
        for (var rule of filters){
            // console.log('match rule', rule , ' with ', u)
            if (u.indexOf(rule)>=0){
                // console.log(u,' matched rule', rule)
                filteredUrls.push(filenames[idx])
            }
        }
    });
    return filteredUrls;
}

var getDiskUrl = function(url){
    if (url.length > 50)
        url = url.slice(url.length - 50);

    url = url.replace(' ','_');
    return url.replace(/[^-\w.]/g,'');
}

var getIrrelevantFiles = function(){
    var adblockUrls = parse(`${program.jsSrc}/__metadata__/analytics`),
        _allUrls = parse(`${program.jsSrc}/__metadata__/urls`);
    var allUrls = [], allFilenames = [];
    _allUrls.forEach((u)=>{
        allUrls.push(u[0]);
        allFilenames.push(u[1]);
    });

    var filteredUrls = getFilteredUrls(allUrls, allFilenames);

    return [adblockUrls, filteredUrls.map(e=>getDiskUrl(e))];
}

var _APIDistribution = function(fns, res, adblockFiles, filteredFiles){
    fns.forEach((fn)=>{
        if (!fn) return;
        var endIndx = 4;
        if (fn.indexOf('-script-')>=0)
            endIndx = 6;
        var fnFile = fn.split('-').slice(0,fn.split('-').length - endIndx).join('-');

        if (adblockFiles.indexOf(fnFile)>=0)
            res.analytics++
        else if(filteredFiles.indexOf(fnFile)>=0)
            res.filtered++
        else {
            console.log(fnFile)
            res.main++;
        }
    });
}

var APIDistribution = function(){
    var apiData = parse(`${program.dyn}`);
        dist = {analytics:0, filtered:0, main:0};

    var [adblockFiles, filteredFiles] = getIrrelevantFiles();

    var keys = Object.keys(apiData).filter(e=>e!='cookie' && e!='referrer')

    keys.forEach((k)=>{
        _APIDistribution(apiData[k], dist, adblockFiles, filteredFiles)
        // console.log(k,dist)
    })
    // _APIDistribution(apiData.userAgent, dist, adblockFiles, filteredFiles)
    // _APIDistribution(apiData.platform, dist, adblockFiles, filteredFiles)
    // _APIDistribution(apiData.referrer, dist, adblockFiles, filteredFiles)
    // _APIDistribution(apiData.innerWidth, dist, adblockFiles, filteredFiles)
    var total = Object.values(dist).reduce((acc,cur)=>{return acc+cur},0);
    console.log(total, dist.main);
}

APIDistribution();