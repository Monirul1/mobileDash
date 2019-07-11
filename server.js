// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');

// Get config params
const config = require('./config');

// Get our API routes
// const api = require('./server/routes/api');

const app = express();

// automatically add CORS headers to every response
const cors = require('cors');
const corsOptions = {
  origin: [
    /http:\/\/localhost:\d+$/
    // /http:\/\/\d+\.\d+\.\d+\.\d+(\:\d+)?$/
    // /http:\/\/tools\.mtvi\.com:\d+$/
  ],
  methods: [ 'GET', 'POST' ],
  allowedHeaders: [ 'Content-Type', 'Authorization' ],
  credentials: true,
  optionsSuccessStatus: 200 // for legacy browsers that don't support 204
};
if (config.app.origin) {
  if (Array.isArray(config.app.origin)) {
    corsOptions.origin = corsOptions.origin.concat(config.app.origin);
  } else {
    corsOptions.origin.push(origin);
  }
  console.log('origin:', corsOptions.origin);
}
app.use(cors(corsOptions));

// use node as proxy to get around CORS restrictions (note: apply cors first!)
var proxy = require('express-http-proxy');
app.use('/proxy/playplex-api', proxy('api.playplex.viacom.com'));
app.use('/proxy/jenkins-api', proxy('build.viacom.com', {
  https: true,
  proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
    var hash = new Buffer(config.jenkins.username + ':' + config.jenkins.token).toString('base64');
    proxyReqOpts.headers['Authorization'] = 'Basic ' + hash;
    return proxyReqOpts;
  },
  userResHeaderDecorator: function(headers, userReq, userRes, proxyReq, proxyRes) {
    headers['Access-Control-Allow-Origin'] = '*';
    return headers;
  }
}));

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));

// Set our api routes
// app.use('/api', api);

// Catch all other routes and return the index file
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || config.app.port;
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, function () {
  console.log('API running on localhost:' + port);
});
