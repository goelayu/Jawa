/**
 * This script picks random
 * domains based on whether they were sufficiently
 * crawled on way back or not
 */

const fs = require('fs'),
    program = require('commander'),
    http = require('https'),
    fetch = require('node-fetch');

const ALEXA1MFILE = `${__dirname}/../../sites/alexa/alexa-1m.txt`
const WAYBACK_CDX="https://web.archive.org/cdx/search/cdx";
const CHROME_LOADER=`${__dirname}/chrome-launcher.js`;

program
    .option('-o, --output [output]','path to the output file')
    .option('-s, --start [start]','start range' )
    .option('-e, --end [end]','end range')
    .parse(process.argv);

var parseAlexa = function(){
    var alexa = [],
        _alexa = fs.readFileSync(ALEXA1MFILE,'utf-8').split('\n').slice(0,1000000);
    _alexa.forEach((a)=>{
        var [rank,url] = a.split(' ');
        alexa.push(url)
    })
    return alexa;
}

const ALEXA1M = parseAlexa();

var getWBCount = async function(url){
    try { 
        var apiEndPoint = `${WAYBACK_CDX}?url=${url}&from=202011&to=202011&output=json&matchType=prefix&filter=mimetype:text/html&filter=statuscode:200&limit=7000`;
        var response = await fetch(apiEndPoint);
        // console.log(apiEndPoint)
        var json = await response.json();
    } catch (e) {
        var json = [];
    }
    return json.length
}

var randFromRange = function(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min)
}

var buildCorpusForRange = async function(min, max){
    var sites = [], 
        ranks = [],
        found = false;
    while (!found){
        var rank = randFromRange(min,max);
        if (ranks.indexOf(rank)>=0) continue;
        
        var url = ALEXA1M[rank];
        var count = await getWBCount(url);
        if (count < 7000) continue;

        //found valid url
        console.log(url)
        sites.push(url);
        ranks.push(rank)
        return url;
    }
    return null;
    
}

var buildCorpus = async function(){
    /**
     * Build a corpus of 300 sites such that
     * 100 from Alexa 1k
     * 100 from Alexa 1000 - 10000
     * 100 from Alexa 100,00 - 1,00,000
     */

    var sites = [];
    sites = sites.concat(await buildCorpusForRange(0,999))
    sites = sites.concat(await buildCorpusForRange(1000,99999))
    sites = sites.concat(await buildCorpusForRange(100000,999999));

    program.output && fs.writeFileSync(program.output, JSON.stringify(sites));

}

buildCorpusForRange(program.start, program.end);