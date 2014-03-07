// Modified version of simpleParticle by Seb Lee-Delisle (http://sebleedelisle.com/)
// Original: https://github.com/sebleedelisle/JavaScript-PixelPounding-demos/blob/master/1_Particles/js/SimpleParticle.js

exports.Particle = Particle

function Particle(posx, posy) {
    // the position of the particle
    this.posX = posx; 
    this.posY = posy; 
    
    // the velocity 
    this.velX = 0; 
    this.velY = 0; 
    
    // multiply the particle size by this every frame
    this.shrink = 1; 
    this.size = 1; 
    
    // multiply the velocity by this every frame to create
    // drag. A number between 0 and 1, closer to one is 
    // more slippery, closer to 0 is more sticky. values
    // below 0.6 are pretty much stuck :) 
    this.drag = 1; 
    
    // add this to the yVel every frame to simulate gravity
    this.gravity = 0; 
    
    // current transparency of the image
    this.alpha = 1; 

    // subtracted from the alpha every frame to make it fade out
    this.fade = 0; 

    this.update = function()
    {
        // simulate drag
        this.velX *= this.drag; 
        this.velY *= this.drag;
        
        // add gravity force to the y velocity 
        this.velY += this.gravity; 
        
        // and the velocity to the position
        this.posX += this.velX;
        this.posY += this.velY; 
        
        // shrink the particle
        this.size *= this.shrink;
        
        // and fade it out
        this.alpha -= this.fade;
    };
    
    this.render = function(c)
    {
        if(this.alpha < 0.01) return;
        
        // a radial gradient with two colour stops and transparency around it
        var radgrad = c.createRadialGradient((this.posX + 50), (this.posY + 50), (this.size /  10), (this.posX + 50), (this.posY + 50), this.size);
        radgrad.addColorStop(0, 'rgba(' + this.rgbColor[0] + ', '  + this.rgbColor[1] + ', ' + this.rgbColor[2] + ', ' + this.alpha + ')');
        radgrad.addColorStop(0.8, 'rgba(' + this.rgbColor[0] + ', '  + this.rgbColor[1] + ', ' + this.rgbColor[2] + ', ' + this.alpha * 0.3 + ')');
        radgrad.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Fully transparent

        c.fillStyle = radgrad;

        // the radial gradient is placed in a rectangle
        c.fillRect(this.posX, this.posY, 100, 100);
    };
}