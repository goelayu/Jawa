/**
 * This script takes in a url and determines whether a given url
 * is an article url or navigational url
 */

var fs  = require('fs'),
    program  =  require('commander');

program
    .option('-i, --input [input]','path to the input file')
    .parse(process.argv);


var isArticle = function(url){
    if  (!url || url.length < 7) return false;

    var urlFields = url.split('/'),
        fieldLen = urlFields.length;
    
    if  (fieldLen == 3 ||
            (fieldLen ==  4 && url.endsWith('/')))
            return false;
    var lastField = urlFields[fieldLen - 1];
    if (lastField == "")
        lastField = urlFields[fieldLen - 2];
    if (lastField.indexOf('.html')>=0)
        return [true,"html"];
    if (lastField.length > 15){
        // console.log(url)
        return [true,"last-len"];
    }
    
    for (var id =0;id<fieldLen;id++){
        var dashedFields = urlFields[id].split('-');
        if  (dashedFields.length >= 3) return [true,"dashed"];
    }

    return  false;
}

var parseFile = function(f){
    var content = fs.readFileSync(f,'utf-8');
    var _urls =  content.split('\n');
    return _urls.
        filter(e=>e.split(' ').length  == 1).filter(e=>e.length);
}

function  main(){
    var urls  = parseFile(program.input);
    var articles = 0, res = {"html":0, "last-len":0,"dashed":0}
    urls.forEach((u)=>{
        var pageType = isArticle(u)
        if (pageType[0]){
            res[pageType[1]]++;
            articles++;
        }
    });
    console.log(`${urls.length} ${articles}`);
}

main();