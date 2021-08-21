/**
 * Compute network and console errors
 * for a given site
 */

var program = require('commander'),
    fs = require('fs'),
    netParser = require('parser/networkParser');

program
    .option('-n, --dnetwork [network]','path to the dst network file')
    .option('-s, --snetwork [network]','path to the source network file')
    .option('-l, --log [log]', 'path to the log file')
    .option('--is-filter', 'is filter, also report filtered number')
    .option('-u, --url [url]')
    .parse(process.argv);

var parse = function(f){
    return JSON.parse(fs.readFileSync(f));
}

var initDict = {};

var totalSize = fetchedSize = 0;
var gfiltered = gfilteredFromScripts = 0;
var filteredURLs = [];
var getURLs = function(netData){
    var urls = [];
    var net = netParser.parseNetworkLogs((netData));
    for (var n of net){
        if (!isValidUrl(n) || !n.size) continue;
        if (n.response && n.response.status == 200){
            urls.push(n.url);
            totalSize += n.size;
            var init;
            if (n.initiator.type == 'script'){
                n.initiator.stack.callFrames.forEach((f)=>{
                    var init = f.url;
                    if (!(init in initDict))
                        initDict[init] = [];
                    initDict[init].push(n.url);
                })
                // var _init = n.initiator.stack.callFrames.pop();
                // if (!_init) continue;
                // init = _init.url;
                // if (!(init in initDict))
                //     initDict[init] = [];
                // initDict[init].push(n.url);
            }
            //  console.log(n.url, n.type)
        }
    }
    // console.log('--------------------')
    return [...new Set(urls)];
}

var allInitiatedFiltered = function(n){
    var allurls = new Set;
    var mem = [];
    var url = n.url;
    var _inits = function(url){
        if (mem.indexOf(url)>=0) return;
        mem.push(url)
        if (initDict[url]){
            initDict[url].forEach((u)=>{
                // console.log(n.url, n.type)
                allurls.add(u);
                _inits(u);
            });
        }
    }
    _inits(url)
    return allurls;
}

var getFilteredUrls = function(data){
    var net = netParser.parseNetworkLogs(parse(data));
    var urls = new Set;
    for (var n of net){
        if (n.isFiltered){
            // console.log(n.url)
            gfiltered++;
            if (n.initiator.type == 'script') gfilteredFromScripts++
            else filteredURLs.push(n.url);
            urls.add(n.url)
            // console.log(n.url, n.type)
            if (initDict[n.url]){
                var allurls = [...allInitiatedFiltered(n)]
                allurls.forEach(urls.add, urls);
                // count += initDict[n.url].length
            }
        }
    }
    return urls;
}

var isValidUrl = function(n){
    // const VALID_MIMES = ["image", "document", "script", "stylesheet"];
    const VALID_MIMES = ["image", "html", "script", "css","json",""];
    return n.request.method == "GET" &&
        n.url.indexOf('data')!=0 && 
        VALID_MIMES.some(e=>n.type.toLowerCase().indexOf(e)>=0 ) && 
        n.type.indexOf('gif')<0;

}

var checkBrokenNet = function(data,srcURLs){
    var net = netParser.parseNetworkLogs(parse(data));
    var bCount = 0,succR = [];
    for (var n of net){
        if (!isValidUrl(n) || !n.size) continue;
        if (n.response && n.response.status > 400){
            bCount++;
        }
        if (n.response && n.response.status == 200){
            succR.push(n.url);
            fetchedSize += n.size;
            // console.log(n.url, n.type)
        }
    }
    return [succR,bCount];
}

var checkBrokenLogs = function(data){
    var log = parse(data);
    var count=0;
	log.forEach((l) => {
		if (l.exceptionDetails && 
			l.exceptionDetails.exception &&
			l.exceptionDetails.exception.description && 
			l.exceptionDetails.exception.description.indexOf('404 NOT FOUND')<0) {
				if (program.verbose)
					console.log(l.exceptionDetails.exception.description)
				count++;
		}
	});
	return count;
}

function main(){
    var srcURLs = getURLs(parse(program.snetwork));
    var successRes = checkBrokenNet(program.dnetwork, srcURLs);
    if (program.isFilter){
        var _filteredURLs = getFilteredUrls(program.dnetwork);
        // var filteredURLs = [..._filteredURLs].filter(x => !successRes[0].includes(x)).filter(x => srcURLs.includes(x))
        // var filteredURLs = [..._filteredURLs].filter(x => srcURLs.includes(x))
    }
    // console.log(totalSize, fetchedSize)
    console.log(gfiltered, gfilteredFromScripts)
    // fs.writeFileSync(`/vault-home/goelayu/webArchive/data/performance/SOSP21/design/filter_impact/all_filter_urls/${program.url}`, JSON.stringify(filteredURLs));
    // console.log(`Src: ${srcURLs.length} Network: ${successRes[0].length} ${successRes[1]} log: ${checkBrokenLogs(program.log)} ` + (program.isFilter ? 'Filter ' + filteredURLs.length : '') );
}

main();