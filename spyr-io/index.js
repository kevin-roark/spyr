
var sio = require('socket.io');
var debug = require('debug');
var msgpack = require('msgpack-js');

process.title = 'spyr-io';

var port = process.env.SPYR_PORT || 3001;
var io = module.exports = sio(port);
console.log('listening on *:' + port);

// redis socket.io adapter
var uri = process.env.SPYR_REDIS || 'localhost:6379';
io.adapter(require('socket.io-redis')(uri));

// redis queries instance
var redis = require('./redis')();

var uid = process.env.SPYR_SERVER_UID || port;
debug('server uid %s', uid);

io.total = 0;
io.on('connection', function(socket){
  var req = socket.request;

  // keep track of connected clients
  updateCount(++io.total);
  socket.on('disconnect', function(){
    updateCount(--io.total);
  });

  // publish yells to redis
  socket.on('madeyell', function(bufs){
    redis.publish('spyr:madeyell', msgpack.encode(bufs));
  });

});

// sends connections count to everyone
// by aggregating all servers
function updateCount(total){
  redis.hset('spyr:connections', uid, total);
}

// broadcast events
function broadcast(socket/*, …*/){
  var args = Array.prototype.slice.call(arguments, 1);
  socket.broadcast.emit.apply(socket, args);
}

