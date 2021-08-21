// HTTP forward proxy server that can also proxy HTTPS requests
// using the CONNECT method

// requires https://github.com/nodejitsu/node-http-proxy

const authKey = process.env.PROXY_AUTH_KEY || undefined;
const proxyHeader = 'porxy-authorization';

var httpProxy = require('http-proxy'),
  url = require('url'),
  net = require('net'),
  http = require('http');

process.on('uncaughtException', logError);

function truncate(str) {
  var maxLength = 64;
  return str.length >= maxLength ? str.substring(0, maxLength) + '...' : str;
}

function logRequest(req) {
  console.log(req.method + ' ' + truncate(req.url));
  for (var i in req.headers)
    console.log(' * ' + i + ': ' + truncate(req.headers[i]));
}

function logError(e) {
  console.warn('*** ' + e);
}

// this proxy will handle regular HTTP requests
var regularProxy = new httpProxy.createProxyServer();

// standard HTTP server that will pass requests
// to the proxy
var server = http.createServer(function(req, res) {
  //   console.log('via normal http');
  logRequest(req);
  if (!req.headers[proxyHeader] || req.headers[proxyHeader] !== auth) {
    res.writeHead(401);
    res.end();
    return;
  }
  delete req.headers[proxyHeader];
  //   uri = url.parse(req.url);
  //   regularProxy.proxyRequest(req, res, {
  //     host: uri.hostname,
  //     port: uri.port || 80
  //   });
  regularProxy.web(req, res, { target: 'https://' + req.headers.host });
});

// when a CONNECT request comes in, the 'connect'
// event is emitted
server.on('connect', function(req, socket, head) {
  //   console.log('via connect');
  logRequest(req);
  if (
    authKey &&
    (!req.headers[proxyHeader] || req.headers[proxyHeader] !== authKey)
  ) {
    socket.write('HTTP/1.1 401 UNAUTHORIZED\r\n\r\n');
    socket.end();
    socket.destroy();
    return;
  }
  // URL is in the form 'hostname:port'
  var parts = req.url.split(':', 2);
  // open a TCP connection to the remote host
  var conn = net.connect(
    parts[1],
    parts[0],
    function() {
      // respond to the client that the connection was made
      socket.write('HTTP/1.1 200 OK\r\n\r\n');
      // create a tunnel between the two hosts
      socket.pipe(conn);
      conn.pipe(socket);
    }
  );
});

const port = process.env.PORT || 3333;
server.listen(port);