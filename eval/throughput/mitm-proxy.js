var Proxy = require('http-mitm-proxy');
var det = require('deterministic')
var fs = require('fs');
var rewriter = require(`${__dirname}/../../program_analysis/rewriters/dynamic-cfg`);
var intercepts = fs.readFileSync(`${__dirname}/../../program_analysis/runtime/dynamic-api-intercepts.js`,'utf-8');
var tracer = fs.readFileSync(`${__dirname}/../../program_analysis//runtime/tracer.js`,'utf-8');
var program = require('commander');



var contentstore = {};

var rewriteHTML = function(src){
    var doctypeMatch = /<!DOCTYPE[^>[]*(\[[^]]*\])?>/i.exec(src);
    var headIndx = src.indexOf('<head>');

    var preStr = postStr = "";
    if (doctypeMatch){
        var preInd = src.indexOf(doctypeMatch[0]);
        preStr = src.slice(0,preInd);
        postStr = src.slice(preStr.length);
    } else if (headIndx){
        preStr = src.slice(0,headIndx+6);
        postStr = src.slice(headIndx+6,)
    } else {
        preStr = '';
        postStr = src;
    }

    var tracerStr = `<script> ${intercepts + tracer} </script>`;

    src = preStr + tracerStr + postStr;
    return src;

}

var rewriteJS = function(src,filename){
    try {
        return rewriter.instrument(src, {filename:filename});
    } catch (e) {
        return src;
    }
}

function initProxy(){

    var jsCounter = 0;

    var proxy = Proxy();
    proxy.onError(function(ctx, err) {
        console.error('proxy error:', err);
      });
      
      proxy.onCertificateRequired = function(hostname, callback) {
          return callback(null, {
            keyFile: '/home/goelayu/research/webArchive/eval/key.pem',
            certFile: '/home/goelayu/research/webArchive/eval/cert.pem',
            passphrase: 'ayush'
          });
        };
      
      proxy.use(Proxy.gunzip)
      
      proxy.onRequest(function(ctx, callback) {
          // console.log('incoming request')
          // if (ctx.clientToProxyRequest.headers.host.indexOf('google')>=0){
          //     console.log('canceling ', ctx.clientToProxyRequest.headers.host);
          //     return;
          // }
          var chunks = [];
          ctx.onResponseData(function(ctx, chunk, callback) {
              chunks.push(chunk);
              return callback(null, null); // don't write chunks to client response
          });
          ctx.onResponseEnd(function(ctx, callback) {
              var body = Buffer.concat(chunks);
              // console.log(ctx.serverToProxyResponse.headers)
              if ((ctx.serverToProxyResponse.headers['content-type'] && ctx.serverToProxyResponse.headers['content-type'].indexOf('text/html') === 0 )) {
                  body = rewriteHTML(body.toString())
                  ctx.proxyToClientResponse.write(body);
              } else if ((ctx.serverToProxyResponse.headers['content-type'] && ctx.serverToProxyResponse.headers['content-type'].indexOf('javascript') >= 0 )) {
                var filename = `js-file-${jsCounter}`
                var bodystr = body.toString();
                contentstore[filename] = bodystr;
                 var start = process.hrtime();
                 body = rewriteJS(bodystr,filename)
                 var end = process.hrtime(start);
                 console.log(`Injection time: ${end[0]} ${end[1]/(1000*1000)} .Length: ${bodystr.length}`)
                 ctx.proxyToClientResponse.write(body);
            

                 fs.writeFile(`/tmp/webarchive/js-file-${jsCounter}`, bodystr,()=>{});

                 jsCounter++;
                }
              
              return callback();
          });
          callback();
      });
      
      proxy.listen({port: 8081});
}

process.on('SIGTERM', function () {
    console.log('cleaning up before exiting')
    Object.keys(contentstore).forEach((file)=>{
        console.log(`file ${file} has data length ${contentstore[file].length}`);
    })
    process.exit();
});

initProxy();


