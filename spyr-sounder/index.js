
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
  io.emit('takeyell', combination);
  redis.set('spyr:takeyell', msgpack.encode(combination));
  curBufs = [];
}, interval);


sub.subscribe('spyr:madeyell');
sub.on('message', function(channel, bufs){
  if ('spyr:madeyell' != channel) return;
  takeyell(msgpack.decode(bufs)); 
});

/* an individual yell set of bufs */
function takeyell(bufs) {
  curBufs.push(bufs);
}

/* takes a list of {l, r} PCM arraybuffers and makes a single arraybuffer with
   all the audio combined !! */
function combineBuffers(allBufs) {
  if (!allBufs || !allBufs.length)
    return null;

  // convert from arraybuffer to float32array
  for (var j = 0; j < allBufs.length; j++) {
    allBufs[j].l = new Float32Array(allBufs[j].l);
    allBufs[j].r = new Float32Array(allBufs[j].r);
  }

  var lcom = new Float32Array(allBufs[0].l.length);
  var rcom = new Float32Array(allBufs[0].r.length);

  // combine all the datas
  var buf;
  for (var i = 0; i < lcom.length; i++) {
    for (var j = 0; j < allBufs.length; j++) {
      buf = allBufs[j];
      if (buf.l.length > j) {
        lcom[i] += buf.l[i];
        rcom[i] += buf.r[i];
      }
    }
  }

  var leftBuf = new Buffer(lcom);
  var rightBuf = new Buffer(rcom);
  return {l: leftBuf, r: rightBuf, n: allBufs.length};
}

