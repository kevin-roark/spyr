/* globals $*/

/* dependencies */
var Particle = require('./particle.js').Particle;

/* constants */
var MAX_PARTICLES = 100;

/* useful variables */
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var screenWidth, screenHeight;
var mouseX, mouseY;
var particles = [];

/* set up animation frames thanks Paul Irish */
var requestAnimFrame = (function() {
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function(callback){
            window.setTimeout(callback, 1000 / 60);
          };
})();

/* size stuff */
function resize() {
  screenWidth = $(window).width();
  screenHeight = $(window).height();
  mouseX = screenWidth / 2;
  mouseY = screenHeight / 2;
  canvas.width = screenWidth;
  canvas.height = screenHeight;
}
$(window).resize(resize);
resize();

/* mouse movement */
$(document).mousemove(function(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

/* get it juicing */
animate();

/* create particles */
function makeParticles(particleCount) {
  for (var i = 0; i < particleCount; i++) {
    var particle = new Particle((mouseX - 50), (mouseY - 50));
    
    particle.velX = Math.random() * 10 - 5;
    particle.velY = Math.random() * 10 - 5;
    
    particle.rgbColor = goldColor();
    
    particle.drag = 0.9;
    particle.gravity = 0.5;
    
    particle.size = 4;
    particle.shrink = 0.99;
    particle.fade = 0.03;
    
    particles.push(particle);
  }
}

// Animate using requestAnimFrame
function animate() {
  requestAnimFrame(animate);
  loop();
}

// Loop throught the particles and update their values
function loop() {
  makeParticles(2);
        
  context.clearRect(0, 0, screenWidth, screenHeight);
  
  for (var i = 0, partLen = particles.length; i < partLen; i++) {
    var particle = particles[i];
    particle.render(context);
    particle.update();
  }
  
  while (particles.length > MAX_PARTICLES) {
    particles.shift();
  }
}

/* get that gold */
function goldColor() {
  var r = 255;
  var g = 200 + Math.round(Math.random() * 55);
  var b = Math.round(Math.random() * 100);
  return [r, g, b];
}