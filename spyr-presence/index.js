
var redis = require('./redis')();
var io = require('socket.io-emitter')(redis);
var interval = process.env.SPYR_CONN_INTERVAL || 5000;

console.log('tracking connections');
console.log('update interval: ' + interval);

setInterval(function(){
  redis.hgetall('spyr:connections', function(err, counts){
    if (!counts) return;
    var count = 0;
    for (var i in counts) count += Number(counts[i]);
    redis.set('spyr:connections-total', count);
    io.emit('connections', count);
  });
}, interval);

