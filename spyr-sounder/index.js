
var debug = require('debug');
var msgpack = require('msgpack-js');

process.title = 'spyr-sounder';

// redis
var redis = require('./redis')();
var sub = require('./redis')();
var io = require('socket.io-emitter')(redis);

var interval = process.env.SPYR_YELL_INTERVAL || 200;

console.log('starting sounder. yell interval: ' + interval);

var curBufs = [];

setInterval(function() {
  if (!curBufs.length)
    return;

  var combination = combineBuffers(curBufs);
  if (combination) {
    io.emit('takeyell', combination);
    redis.set('spyr:takeyell', msgpack.encode(combination));
  }
  curBufs = [];
}, interval);


sub.subscribe('spyr:madeyell');
sub.on('message', function(channel, buf){
  if ('spyr:madeyell' != channel) return;
  takeyell(msgpack.decode(buf));
});

/* an individual yell set of bufs */
function takeyell(buf) {
  curBufs.push(buf);
}

/* takes a list of {l, r} PCM arraybuffers and makes a single arraybuffer with
   all the audio combined !! */
function combineBuffers(allBufs) {
  if (!allBufs || !allBufs.length)
    return null;

  // convert from arraybuffer to float32array
  for (var j = 0; j < allBufs.length; j++) {
    allBufs[j] = new Float32Array(allBufs[j]);
  }

  var com = new Float32Array(allBufs[0].length);

  // combine all the datas
  var buf;
  for (var i = 0; i < com.length; i++) {
    for (var j = 0; j < allBufs.length; j++) {
      buf = allBufs[j];
      if (buf.length > i) {
        com[i] += buf[i] / (allBufs.length);
      }
    }
  }

  var comBuf = new Buffer(com);
  return {buf: comBuf, n: allBufs.length};
}
