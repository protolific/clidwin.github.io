/**
 * Atmospheric Sketch using weather data from Weather Underground.
 *    http://www.wunderground.com/weather/api/d/docs?d=data/conditions&MR=1
 * 
 * Author: Christina Lidwin
 * 
 * Created On: October 20, 2014
 * Modified On: November 19, 2014
 * 
 * Design Goal: To create a visual piece where the rate at which objects moves
 *    relates to the wind speed/direction, color relates to the temperature, etc.
 * 
 * Inspiration: The place where I work has no windows that face the outdoors,
 *    and as a result, we were thinking of ways to bring information about the
 *    weather into our space so that we would know if it's raining, hot/cold,
 *    windy, etc. I thought that the topic would make an interesting abstract
 *    piece.
 * 
 * Interactivity: None specified (yet). Maybe allow the capability to enter in
 *    a custom city/state.
 * 
 * TODOS: Connect motion to weather data, auto-update visualization every 15min
 */

// Visual Elements
var hue;
var rotationFactorLimit;
var triangles;
var velocityLimit;
var weatherLogo;

// Weather Elements
var weather_city = 'Blacksburg';
var weather_state = 'VA';
var api_key = 'eac387d283139277';
var temp_f;
var wind_mph;

/**
 * Custom triangle class.
 * @param position The first point in the triangle.
 * @param velocity The velocity of the triangle.
 * @param velocity The amount of rotation to be applied each frame.
 */
var Triangle = function(position, velocity, rotationFactor) {
  this.point1 = position;
  this.point2 = createVector(random(25, 100), random(25, 100));
  this.point3 = createVector(random(25, 100), 0 - random(25, 100));
  
  this.saturation = random(15, 100);
  
  this.velocity = velocity;
  this.rotationFactor = rotationFactor;
  this.rotation = this.rotationFactor;
}

/**
 * Pre-draw operations (only run once at startup by default)
 */
function setup() {
  // Canvas and overall image settings.
  angleMode(DEGREES);
  createCanvas(700, 700);
  frameRate(30);
  textFont('Roboto');
  
  // Create color settings.
  colorMode(HSB, 360, 100, 100);
  background(350, 100, 90);
  
  // Initialize Visual Elements
  hue = 180;
  rotationFactorLimit = 1;
  velocityLimit = 1;
  weatherLogo = loadImage('wUndergroundLogo.png');

  // Capture Weather Data.
  parseWeatherData();
}

/**
 * Operations that occur once per frame rendering
 */
function draw() {
  // Draw gradient background
  background(hue, 100, 90);
  drawRadialGradient(width/2, height/2);
  
  /*fill(0);
  textSize(28);
  text(wind_mph, 0, 20);
  text(wind_degrees, 0, 80);*/
  
  noStroke();
  
  // Draw all of the triangles on the canvas
  for (var i=0; triangles && i<triangles.length; i++) {
    fill(hue, triangles[i].saturation, 90);
    
    push();
    // Apply transforms.
    translate(triangles[i].point1.x, triangles[i].point1.y);
    rotate(triangles[i].rotation);
    
    // Draw triangle. TODO(clidwin): make this a function of the triangle class
    triangle(
      0, 0, // First point of triangle
      triangles[i].point2.x, triangles[i].point2.y, // Second point of triangle
      triangles[i].point3.x, triangles[i].point3.y); // Third point of triangle
    pop();
    
    moveTriangle(triangles[i]);
  }
  
  // Draw credits
  colorMode(RGB);
  tint(255, 125);
  image(
    weatherLogo, 
    width - weatherLogo.width, // image x position (top-left corner)
    height - weatherLogo.height, // image y position (top-left corner)
    weatherLogo.width, // image width
    weatherLogo.height // image height
    );
  colorMode(HSB);
}

/**
 * Draws a radial gradient.
 * Based on: https://www.processing.org/examples/radialgradient.html
 */
function drawRadialGradient() {
  noStroke();
  var dim = width;
  var radius = dim;
  var s = 100;
  var x = width/2;
  var y = height/2;
  for (var r = radius; r > 0; r-=5) {
    fill(hue, s, 90);
    ellipse(x, y, r, r);
    s-=0.75;
  }
}

/**
 * Draws a linear gradient.
 * Based on: https://processing.org/examples/lineargradient.html
 */
function drawLinearGradient() {
  var x = 0;
  var y = 0;
  var w = width;
  var h = height;
  
  var c1 = color(hue, 100, 90);
  var c2 = color(hue, 100, 90);
  noFill();
  for (var i = y; i <= y+h; i++) {
    //var inter = map(i, y, y+h, 0, 0.01);
    //var c = lerpColor(c1, c2, 1);
    s = i*0.15;
    stroke(hue, s, 90);
    line(x, i, x+w, i);
  }
}

/**
 * Updates information on where and how a triangle should be drawn.
 * @param triangle The triangle to update.
 */
function moveTriangle(triangle) {
  // Handle the case when an X value has gone out of bounds.
  if (triangle.point1.x >= width || triangle.point1.x <= 0 ||
        triangle.point1.x >= width || triangle.point1.x <= 0 ||
        triangle.point1.x + triangle.point2.x >= width || 
        triangle.point1.x + triangle.point2.x <= 0 ||
        triangle.point1.x + triangle.point3.x >= width || 
        triangle.point1.x + triangle.point3.x <= 0) {
      triangle.velocity.x = triangle.velocity.x * (-1);
    }
  
  // Handle the case when the Y value has gone out of bounds.
  if (triangle.point1.y > width || triangle.point1.y <= 0 ||
      triangle.point1.y >= width || triangle.point1.y <= 0 ||
      triangle.point1.y + triangle.point2.y >= width || 
      triangle.point1.y + triangle.point2.y <= 0 ||
      triangle.point1.y + triangle.point3.y >= width || 
      triangle.point1.y + triangle.point3.y <= 0) {
    triangle.velocity.y = triangle.velocity.y * (-1);
  }
    
  // Scale back rotation value when it's larger than 360 degrees.
  if (triangle.rotation >= 360) {
    triangle.rotation -= 360;
  }
  
  // Update velocity and rotation.
  triangle.point1.add(triangle.velocity.x, triangle.velocity.y);
  triangle.rotation += triangle.rotationFactor;
}

/**
 * Uses AJAX to query weather underground for information on the current
 * conditions. Response comes in as a JSON packet, so the information is parsed
 * into local variables.
 */
function parseWeatherData() {
  var weatherUrl = 
      'http://api.wunderground.com/api/' + api_key + '/geolookup/conditions/q/' 
      + weather_state+ '/' + weather_city + '.json';
  
  $.ajax({
    url : 
      weatherUrl,
    dataType : "jsonp",
    success : function(parsed_json) {
      weather_city = parsed_json['location']['city'];
      weather_state = parsed_json['location']['state'];
      temp_f = parsed_json['current_observation']['temp_f'];
      wind_mph = parsed_json['current_observation']['wind_mph'];
      
      setHue();
      setVelocityAndRotationFactor();
      createTriangles();
    },
    error: function(parsed_json) {
      alert(parsed_json);
    }
  });
}

/**
 * Sets the hue color based on the current temperature (farenheit)
 */
function setHue() {
  if (temp_f < 0) {
    hue = 275; // Violet
  } else if (temp_f < 17) {
    hue = 224; // Dark Blue
  } else if (temp_f < 33) {
    hue = 208; // Medium Blue
  } else if (temp_f < 50) {
    hue = 192; // Light Blue
  } else if (temp_f < 68) {
    hue = 45; // Green
  } else if (temp_f < 86) {
    hue = 36; // Yellow
  } else {
    hue = 15; //Red
  }
}

/**
 * Sets the velocity and rotation factor based on the current wind speed 
 * (miles per hour)
 */
function setVelocityAndRotationFactor() {
  if (wind_mph < 2) {
    velocityLimit = 0.15;
    rotationFactorLimit = 0.15;
  } else if (wind_mph < 6) {
    velocityLimit = 0.5;
    rotationFactorLimit = 0.5;
  } else if (wind_mph < 10) {
    velocityLimit = 1;
    rotationFactorLimit = 1;
  } else if (wind_mph < 15) {
    velocityLimit = 1.5;
    rotationFactorLimit = 1.5;
  } else if (wind_mph < 80) {
    velocityLimit = wind_mph/10;
    rotationFactorLimit = wind_mph/10;
  } else { // Wind speed is above 80mph
    velocityLimit = 8;
    rotationFactorLimit = 8;
  } 
}

/**
 * Creates triangles based on a pseudo-random (noise-based) set of points.
 */
function createTriangles() {
  triangles = [];
  
  var xOff = 0;
  var yOff = 0;
  
  for (var i=0; i<150; i++) {
    // Find the first point's 2D position and velocity.
    var pos = 
          createVector(noise(xOff + 2*i) * width, noise(yOff - 2*i) * height);

    velocity = createVector(
      random(0-velocityLimit, velocityLimit), 
      random(0-velocityLimit, velocityLimit)
    );
    rotationFactor = random(0-rotationFactorLimit, rotationFactorLimit);

    // Create the triangle object.
    triangles[triangles.length] = new Triangle(pos, velocity, rotationFactor);
    
    // Update the offset values.
    xOff += 20;
    yOff += 20;
  }
}
