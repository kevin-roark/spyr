
/* dependencies */
var Recorder = require('./recorder');
var sparkle = require('./sparkle');
var kutility = require('kutility');

/* constants */
var RECORD_TIME = 1000;

/* view stuff */
function resize() {
  var buttonLeft = $(window).width()/2 - $('.record-button').width()/2;
  $('.record-button').css('left', buttonLeft + 'px');

  var lineLeft = $(window).width()/2 - 150;
  $('.recording-line').css('left', lineLeft + 'px');
}
$(window).resize(resize);
resize();

var bufs1;

/* events, etc */

$('.record-button').click(function() {
  if ($('.record-button').hasClass('recording'))
    return;

  startRecording();
});

function startRecording() {
  if (!Recorder.recorder) {
    console.log('recorder no good');
    return;
  }

  var recorder = Recorder.recorder;
  recorder.clear();
  recorder.record();
  $('.record-button').addClass('recording');
  startVisualization();
  setTimeout(function() {
    stopRecording();
  }, RECORD_TIME);
}

function stopRecording() {
  if (!Recorder.recorder) {
    console.log('recorder no good');
    return;
  }

  var recorder = Recorder.recorder;
  $('.record-button').removeClass('recording');
  recorder.stop();
  recorder.getBuffer(function(bufs) {
    var left = bufs[0];
    var right = bufs[1];
    var audBuf = {l: left.buffer, r: right.buffer};

    if (bufs1) {
      var com = combineBuffers([bufs1, audBuf]);

      /* for now lets play these things */
      playBuffers(com);

      /* nullify bufs1 */
      bufs1 = null;
    }
    else {
      bufs1 = audBuf;
    }
  });
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

  var b = allBufs[0];
  var l = b.l;

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

  return {l: lcom.buffer, r: rcom.buffer, n: allBufs.length};
}

function startVisualization() {
  var $dot = $('.recording-progress-dot');

  var left = $(window).width()/2 - 150;
  var right = $(window).width()/2 + 150;
  var alpha = 0.8;

  $dot.css('left', left + 'px');
  $dot.css('opacity', alpha);
  $dot.addClass('recording');

  $('.recording-line').addClass('recording');

  $dot.animate({
    'left': right,
    'opacity': 1.0
  }, RECORD_TIME, 'linear', function() {
    stopVisualization();
  });
}

function stopVisualization() {
  $('.recording-progress-dot').removeClass('recording');
  $('.recording-line').removeClass('recording');
}

/* buf.l == left channel PCM, buf.r ==  right channel PCM (arraybuffers) */
function playBuffers(buf) {
  var ctx = Recorder.audioContext;

  // convert buffers to float 32 here
  var left = new Float32Array(buf.l);
  var right = new Float32Array(buf.r);

  var source = ctx.createBufferSource();
  var combinedBuf = ctx.createBuffer(2, left.length, ctx.sampleRate);
  combinedBuf.getChannelData(0).set(left);
  combinedBuf.getChannelData(1).set(right);

  source.buffer = combinedBuf;
  source.connect(ctx.destination);
  source.start(0);

  addTriangles(buf.n);
}

var triangleStyles = [
  ['border-left', 'border-right', 'border-bottom'],
  ['border-left', 'border-right', 'border-top'],
  ['border-top', 'border-bottom', 'border-left'],
  ['border-top', 'border-bottom', 'border-right'],
]

/* adds triangles for the audio visualization section !! */
function addTriangles(num) {
  var $viz = $('.audio-visualizer');
  var triangles = [];

  function addTriangle() {
    var t = $('<div>').addClass('audio-triangle');
    var color = kutility.randColor();
    var size = Math.floor(Math.random() * 80) + 20;

    var style = kutility.choice(triangleStyles);
    for (var i = 0; i < style.length - 1; i++) {
      t.css(style[i], size + 'px solid transparent');
    }
    t.css(style[style.length - 1], size + 'px solid ' + color);

    var left = Math.floor(Math.random() * ($(window).width() - 120)) + 20;
    var top = Math.floor(Math.random() * ($viz.height() - 120)) + 20;
    t.css('left', left + 'px');
    t.css('top', top + 'px');

    $viz.append(t);
    triangles.push(t);
  }

  for (var n = 0; n < num; n++) {
    setTimeout(function() {
      addTriangle();
    }, n * 75);
  }

  setTimeout(function() {
    var ti = 0;
    var remover = setInterval(function() {
      triangles[ti].remove();
      ti++;
      if (ti >= triangles.length)
        clearInterval(remover);
    }, 75);
  }, RECORD_TIME);
}
