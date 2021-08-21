var fs = require('fs'),
  http = require('http'),
  https = require('https'),
  httpProxy = require('http-proxy');

var isHttps = true; // do you want a https proxy?

var options = {
  https: {
    key: fs.readFileSync('/home/goelayu/research/webArchive/eval/key.pem'),
    cert: fs.readFileSync('/home/goelayu/research/webArchive/eval/cert.pem')
  }
};

// this is the target server
var proxy = httpProxy.createProxyServer({
//   target: {
//     host: '127.0.0.1',
//     port: 9999
//   },
  ssl:{
        key: fs.readFileSync('/home/goelayu/research/webArchive/eval/key.pem'),
        cert: fs.readFileSync('/home/goelayu/research/webArchive/eval/cert.pem'),
        passphrase: 'ayush'
  }
},function(req, res) {
    console.log('Proxying https request at %s', new Date());
    proxy.proxyRequest(req, res);
  }).listen(8009, function(err) {
    if (err)
      console.log('Error serving https proxy request: %s', req);
    
    // console.log('Created https proxy. Forwarding requests from %s to %s:%s', '443', proxy.target.host, proxy.target.port);
  });