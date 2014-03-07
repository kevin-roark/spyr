var browserify = require('browserify-middleware');
var mustache = require('mustache-express');
var express = require('express');
var app = express();

var port = process.env.SPYR_PORT || 3000;

/*
var redis = require('./redis')();

process.title = 'weplay-web';
*/

app.listen(port);
console.log('listening on *:' + port);

if ('development' != process.env.NODE_ENV) {
  app.use(express.basicAuth('a', 'b'));
}

app.engine('mustache', mustache());
app.set('views', __dirname + '/views');

if ('development' == process.env.NODE_ENV) {
  app.use('/main.js', browserify('./client/app.js'));
}
app.use(express.static(__dirname + '/public'));

/*
app.use(function(req, res, next) {
  req.socket.on('error', function(err) {
    console.error(err.stack);
  });
  next();
});
*/

var url = process.env.SPYR_IO_URL || 'http://localhost:3001';
app.get('/', function(req, res, next) {
  res.render('index.mustache', {});
});
