/**
 * Analyze the storage overhead of 
 * all other mimetypes
 */


var fs = require('fs'),
    crypto = require('crypto'),
    zlib = require('zlib'),
    program = require('commander');

program
    .option('-d, --dir [dir]', 'path to the src directory')
    .option('-u, --urls [urls]', 'list of urls the data needs to be processed on')
    .option('-v, --verbose')
    .option('-o, --output [output]', 'path to output file')
    .parse(process.argv);

const CRAWL_ENTRY_LEN = 77
const SERVING_ENTRY_LEN = 275
const SERVING_ENTRY_APPEND = 32

var isFilterUrl = function (url) {
    if (url.indexOf('web.archive.org/_static/') >= 0 || url.indexOf('archive.org/includes') >= 0)
        return true;

    return !timeStampInURL(url);


}

var timeStampInURL = function (url) {
    // Only extract timestamp from the main part of the url
    var idx = url.indexOf('?');
    url = idx >= 0 ? url.slice(0, idx) : url;
    var hasNumbers = url.match(/\d+/g);
    if (hasNumbers) {
        for (var num of hasNumbers) {
            if (num.length == 14)
                return num;
        }
    }
    return false
}

var getOriginalURL = function (archiveURL) {
    // return archiveURL
    var ts = timeStampInURL(archiveURL);
    if (!ts) return archiveURL;

    var prefix = `web/${ts}`;
    var preInd = archiveURL.indexOf(prefix);
    if (preInd == -1) return archiveURL;

    return archiveURL.slice(preInd + prefix.length);
}

var removeComments = function (content, zip) {
    if (zip) {
        content = zlib.gunzipSync(content).toString()
    } else content = content.toString()
    return content.replace(/FILE ARCHIVED [\s\S]*./g, "");
}

var dedupMime = function (mimeData, jsData, store, path, page, pageMD) {
    var cWrites = 0, njsFiles = 0;
    pageMD[page] = {
        other: { cWrites: 0 },
        js: { lookups: 0, sSize: 0, cWrites: 0, cSize: 0 },
    };
    mimeData.forEach((entry) => {
        var { url, content, length, type } = entry, hash;
        var fType;
        if (!type) return;
        if (isFilterUrl(url)) return;
        if (type.indexOf('image') >= 0) fType = 'image'
        else if (type.indexOf('css') >= 0) fType = 'css'
        else if (type.indexOf('html') >= 0) fType = 'html'
        else return;


        if (fType == 'image') hash = content;
        else hash = url;
        if (store[fType].hashes.indexOf(hash) < 0) {
            store[fType].size += length;
            store[fType].hashes.push(hash);

            cWrites++; // update the crawl index since a unique resource is crawled
        };
        store[fType].total += length;
    })
    pageMD[page].other.cWrites = cWrites;
    program.verbose && console.log(page)
    jsData.forEach((file) => {
        var fileDir = `${path}/${file}`;
        // var content = fs.readFileSync(`${fileDir}/content`);
        var size;
        var fileInfo;
        try {
            // size = fs.statSync(`${fileDir}/content`).size;
            fileInfo = JSON.parse(fs.readFileSync(`${fileDir}/${file}`));
            size = fileInfo.wire_length;
        } catch (e) {
            console.log(e);
            return;
        }
        if (fileInfo.type != "js") return;
        // var wocommentContent = removeComments(content, fileInfo.zip)
        // var hash = crypto.createHash('md5').update(wocommentContent).digest('hex');
        // var origUrl = getOriginalURL(fileInfo.url);
        njsFiles++;
        program.verbose && console.log(`url: ${fileInfo.url}, size: ${size}`)
        var archiveUrl = fileInfo.url;
        var storeKey = hash;
        var type = 'js';
        //for js hashes are indexed by url names
        var hash = store[type].hashes[archiveUrl];
        if (!hash) {
            store[type].size += size;
            store[type].hashes[archiveUrl] = true

            //update metadata
            pageMD[page].js.cWrites++;
            pageMD[page].js.cSize += CRAWL_ENTRY_LEN;
        }
        pageMD[page].js.sSize += SERVING_ENTRY_LEN;
        pageMD[page].js.lookups++;
        store[type].total += size;
    })

    program.verbose && console.log(`${page} nFiles: ${njsFiles}`)

}


function main() {
    var pages = fs.readFileSync(program.urls, 'utf-8').split('\n'), store = {
        image: { size: 0, hashes: [], total: 0 },
        css: { size: 0, hashes: [], total: 0 },
        html: { size: 0, hashes: [], total: 0 },
        js: { size: 0, hashes: {}, total: 0 },
    };
    var pageMD = {}
    pages.forEach((page, idx) => {
        if (page == '') return;

        try {
            var srcDir = `${program.dir}/${page}`
            var mimeData = JSON.parse(fs.readFileSync(`${srcDir}/__metadata__/allfiles`, 'utf-8'));
            var jsData = fs.readdirSync(`${srcDir}`).filter(e => e != '__metadata__' && e != 'py_out');
        } catch (e) {
            // console.log(e)
            return;
        }
        dedupMime(mimeData, jsData, store, srcDir, page, pageMD);
        // var perc = Number.parseInt(idx*100/pages.length);
        // program.verbose && console.log(page)
        program.verbose && console.log(`js ${store.js.size} image ${store.image.size} css ${store.css.size} html  ${store.html.size}`)

    })
    console.log(`Finres dedup: js ${store.js.size} image ${store.image.size} css ${store.css.size} html  ${store.html.size}`)
    console.log(`Finres: js ${store.js.total} image ${store.image.total} css ${store.css.total} html ${store.html.total}`)

    program.output && fs.writeFileSync(program.output, JSON.stringify(pageMD));
}
main();

