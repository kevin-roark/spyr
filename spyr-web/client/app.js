
/* dependencies */
var Recorder = require('./recorder');
var sparkle = require('./sparkle');
var kutility = require('kutility');
var io = require('socket.io-client');

/* constants */
var RECORD_TIME = 1000;
var SAMPLE_RATE = 22050;

/* view stuff */
function resize() {
  var buttonLeft = $(window).width()/2 - $('.record-button').width()/2;
  $('.record-button').css('left', buttonLeft + 'px');

  var lineLeft = $(window).width()/2 - 150;
  $('.recording-line').css('left', lineLeft + 'px');
}
$(window).resize(resize);
resize();

/* get that socket chillin */
var socket = io(config.io);
socket.on('connect', function() {
  $('.record-button').fadeIn();
});

socket.on('disconnect', function() {
  $('.record-button').fadeOut();
});

socket.on('takeyell', function(bufs) {
  playBuffers(bufs);
});

socket.on('connections', function(total) {
  $('.bystander-count').html(total);
});

/* UI events, etc */

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
    var audBuf = downSample(bufs);
    socket.emit('madeyell', audBuf);
  });
}

function downSample(bufs) {
  var left = bufs[0];
  var length = left.length / 2;
  var sampled = new Float32Array(length);

  var i = 0;
  var j = 0;
  var avg;
  while (i < length) {
    avg = 0.5 * (left[j++] + left[j++]);
    sampled[i++] = avg;
  }

  return sampled.buffer;
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

/* buf.buf == a single mono ArrayBuffer of PCM data. buf.n == number of bufs combined here */
function playBuffers(buf) {
  var ctx = Recorder.audioContext;
  var fbuf = new Float32Array(buf.buf);

  var source = ctx.createBufferSource();
  var audioBuf = ctx.createBuffer(1, fbuf.length, SAMPLE_RATE);
  audioBuf.getChannelData(0).set(fbuf);

  source.buffer = audioBuf;
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
    var size = Math.floor(Math.random() * 60) + 20;

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
