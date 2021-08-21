let ABPFilterParser = require('abp-filter-parser');
const program = require('commander'),
    fs = require('fs'),
    netParser = require('parser/networkParser');

program
    .option('-n, --network [network]','path to the dst network file')
    .option('-d, --domain [domain]','domain of the site')
    .parse(process.argv);

let easyListTxt = fs.readFileSync('/home/goelayu/research/webArchive/filter-lists/final.txt', 'utf-8');
let parsedFilterData = {};

var parse = function(f){
    return JSON.parse(fs.readFileSync(f));
}

var isValidUrl = function(n){
    // const VALID_MIMES = ["image", "document", "script", "stylesheet"];
    const VALID_MIMES = ["image", "html", "script", "css","json",""];
    return n.request.method == "GET" &&
        n.url.indexOf('data')!=0 && 
        VALID_MIMES.some(e=>n.type.toLowerCase().indexOf(e)>=0 ) && 
        n.type.indexOf('gif')<0;

}

var getURLs = function(data){
    var net = netParser.parseNetworkLogs(parse(data));
    var urls = new Set;
    for (var n of net){
        if (!isValidUrl(n)) continue;
        urls.add(n.url);
    }
    return [...urls];
}

ABPFilterParser.parse(easyListTxt, parsedFilterData);
// ABPFilterParser.parse(someOtherListOfFilters, parsedFilterData);

function filter(){
    // console.log(`domain is ${program.domain}`)
    var urls = getURLs(program.network)
    var count = 0;
    urls.forEach((u)=>{
        if (ABPFilterParser.matches(parsedFilterData,u, {
            domain: program.domain
        } )) {
            // console.log(`filtering ${u}`)
            count++;
        }
    });
    console.log(count);
}

filter();

// if (ABPFilterParser.matches(parsedFilterData, urlToCheck, {
//       domain: currentPageDomain,
//       elementTypeMaskMap: ABPFilterParser.elementTypes.SCRIPT,
//     })) {
//   console.log('You should block this URL!');
// } else {
//   console.log('You should NOT block this URL!');
// }