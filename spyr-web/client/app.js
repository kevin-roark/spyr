
/* dependencies */
var Recorder = require('./recorder');
var sparkle = require('./sparkle');

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
    console.log('got audio bufs');
    var left = bufs[0];
    var right = bufs[1];
    var buf1 = left.buffer;
    var buf2 = right.buffer;
    console.log(buf1);
    console.log(buf2);
  });
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