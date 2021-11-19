

const program = require('commander'),
    fetch = require('node-fetch'),
    fs =   require('fs');

program
    .option('-u, --url [url]', 'url to query wayback cdx with')
    .option('-t, --type [type]','type to query to run')
    .parse(process.argv);


const WAYBACK_CDX="https://web.archive.org/cdx/search/cdx";

var queryWayBack = async function(query){
    try { 
        var response = await fetch(query);
        // console.log(query)
        var json = await response.json();
    } catch (e) {
        console.log(e)
        var json = [];
    }
    return json;
}

async function getUniqPages(){
    var query = `${WAYBACK_CDX}?url=${program.url}&from=202109&to=202109&output=json&matchType=prefix&filter=mimetype:text/html&filter=statuscode:200&limit=1000&collapse=urlkey`
    var _res = await queryWayBack(query),
        res = _res.map(e=>e[2]);
    return res;
}

async function getPageCount(){
    var query = `${WAYBACK_CDX}?url=${program.url}&from=202109&to=202109&output=json&filter=mimetype:text/html&filter=statuscode:200&limit=7000`;
    var res = await queryWayBack(query)
    return res;
}

async function main(){
    if (program.type == 'uniq'){
        var res = await getUniqPages();
        fs.writeFileSync(`${program.url}.uniq.txt`,JSON.stringify(res));
    }
    else if (program.type == 'count'){
        var res = await getPageCount();
        console.log(res.length)
    }
}

main();