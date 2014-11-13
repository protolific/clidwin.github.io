/**
 * Atmospheric Sketch using weather data from Weather Underground.
 *    http://www.wunderground.com/weather/api/d/docs?d=data/conditions&MR=1
 * 
 * Author: Christina Lidwin
 * 
 * Created On: October 20, 2014
 * Modified On: November 13, 2014
 * 
 * Design Goal: To create a visual piece where the rate at which objects moves
 *    relates to the wind speed, color relates to the temperature, etc.
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
 * TODOS: Connect motion, color, etc to weather data
 */
 
var weather_city = 'Blacksburg';
var weather_state = 'VA';
var temp_f;
var wind_mph;
var wind_degrees;
var triangles;

/**
 * Custom triangle class.
 */
var Triangle = function(point1X, point1Y, velocityX, velocityY) {
  //TODO(clidwin): Translate these points into PVectors
  this.point1X = point1X;
  this.point1Y = point1Y;
  this.point2X = random(25, 100);
  this.point2Y = random(25, 100);
  this.point3X = random(25, 100);
  this.point3Y = 0 - random(25, 100);
  
  this.saturation = random(15, 100);
  
  //TODO(clidwin): Use PVectors and make Velocity an argument
  this.velocityX = velocityX;
  this.velocityY = velocityY;
  
  //TODO(clidwin): Make rotation an argument.
  this.rotationFactor = random(-5, 5);
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
  background(350, 100, 40);
  
  // Get initial weather data
  //getData();
  createTriangles();
}

/**
 * Operations that occur once per frame rendering
 */
function draw() {
  background(35, 20, 100);
  //TODO(clidwin): draw a gradient
  //Linear gradient: https://processing.org/examples/lineargradient.html
  //Radial gradient: https://www.processing.org/examples/radialgradient.html
  
  /*textSize(28);
  text(wind_mph, 0, 20);
  text(wind_degrees, 0, 80);*/
  
  stroke(0,0,0);
  strokeWeight(2);
  
  // Draw all of the triangles on the canvas
  for (var i=0; i<triangles.length; i++) {
    fill(35, triangles[i].saturation, 100);
    
    push();
    translate(triangles[i].point1X, triangles[i].point1Y);
    rotate(triangles[i].rotation);
    triangle(
      0, 0, // First point of triangle
      triangles[i].point2X, triangles[i].point2Y, // Second point of triangle
      triangles[i].point3X, triangles[i].point3Y); // Third point of triangle
    pop();
    
    moveTriangle(triangles[i]);
  }
}

/**
 * Updates information on where and how a triangle should be drawn.
 * @param triangle The triangle to update.
 */
function moveTriangle(triangle) {
  // Handle the case when an X value has gone out of bounds.
  if (triangle.point1X >= width || triangle.point1X <= 0 ||
        triangle.point1X >= width || triangle.point1X <= 0 ||
        triangle.point1X + triangle.point2X >= width || 
        triangle.point1X + triangle.point2X <= 0 ||
        triangle.point1X + triangle.point3X >= width || 
        triangle.point1X + triangle.point3X <= 0) {
      triangle.velocityX = triangle.velocityX * (-1);
    }
  
  // Handle the case when the Y value has gone out of bounds.
  if (triangle.point1Y > width || triangle.point1Y <= 0 ||
      triangle.point1Y >= width || triangle.point1Y <= 0 ||
      triangle.point1Y + triangle.point2Y >= width || 
      triangle.point1Y + triangle.point2Y <= 0 ||
      triangle.point1Y + triangle.point3Y >= width || 
      triangle.point1Y + triangle.point3Y <= 0) {
    triangle.velocityY = triangle.velocityY * (-1);
  }
    
  // Scale back rotation value when it's larger than 360 degrees.
  if (triangle.rotation >= 360) {
    triangle.rotation -= 360;
  }
  
  // Update velocity and rotation.
  triangle.point1X += triangle.velocityX;
  triangle.point1Y += triangle.velocityY;
  triangle.rotation += triangle.rotationFactor;
}

/**
 * Uses AJAX to query weather underground for information on the current
 * conditions. Response comes in as a JSON packet, so the information is parsed
 * into local variables.
 */
function getData() {
  var weatherUrl = 
      'http://api.wunderground.com/api/eac387d283139277/geolookup/conditions/q/' 
      + weather_state+ '/' + weather_city + '.json';
  
  $.ajax({
    url : 
      weatherUrl,
    dataType : "jsonp",
    success : function(parsed_json) {
      weather_city = parsed_json['location']['city'];
      weather_state = parsed_json['location']['state'];
      temp_f = parsed_json['current_observation']['temp_f'];
      wind_degrees = parsed_json['current_observation']['wind_degrees'];
      wind_mph = parsed_json['current_observation']['wind_mph'];
    },
    error: function(parsed_json) {
      alert(parsed_json);
    }
  });
}

/**
 * Creates triangles based on the created points.
 */
function createTriangles() {
  triangles = [];
  
  var xOff = 0;
  var yOff = 0;
  
  for (var i=0; i<100; i++) {
    // Find the first point's x and y values.
    var xPos = noise(xOff + 2*i) * width;
    var yPos = noise(yOff - 2*i) * height;
    
    // Create the triangle object.
    triangles[triangles.length] 
        = new Triangle(xPos, yPos, random(-2, 2), random(-2, 2));
    
    // Update the offset values.
    xOff += 20;
    yOff += 20;
  }
}
