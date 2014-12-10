/**
 * Atmospheric Sketch using weather data from Weather Underground.
 *    http://www.wunderground.com/weather/api/d/docs?d=data/conditions&MR=1
 * 
 * Author: Christina Lidwin
 * 
 * Created On: October 20, 2014
 * Modified On: December 10, 2014
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
 * Interactivity: Allows the user to enter in a custom city/state by clicking
 *    on the currently-displayed state and city in the lower right corner.
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

var bgImg;

var showCityPicker = false;

/**
 * Custom triangle class.
 * 
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
  createCanvas(windowWidth, windowHeight);
  frameRate(25);
  textFont('Montserrat');
  
  // Create color settings.
  colorMode(HSB, 360, 100, 100, 100);
  background(350, 0, 90);
  
  // Initialize Visual Elements
  hue = 180;
  rotationFactorLimit = 1;
  velocityLimit = 1;
  weatherLogo = loadImage('wundergroundLogo.png');

  // Capture Weather Data.
  parseWeatherData();
  bgImg = createGraphics(windowWidth, windowHeight);
  bgImg.colorMode(HSB, 360, 100, 100, 100);
}

/**
 * Operations that occur once per frame rendering
 */
function draw() {
  // Fetch new weather data every 15 minute mark to keep the visuals current.
  if (minute() % 15 === 0 && second() === 0 && millis() % 1000 === 0) {
    parseWeatherData();
  }
  
  // Draw gradient background
  background(hue, 100, 90);
  image(bgImg, width/2 - bgImg.width/2, height/2 - bgImg.height/2);
  
  // Draw all of the triangles on the canvas
  noStroke();
  for (var i=0; triangles && i<triangles.length; i++) {
    fill(hue, triangles[i].saturation, 90, 80);
    
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
  drawCredits();
}

/*
 * Operation that occurs when the display window is resized.
 * Based on: http://p5js.org/reference/#/p5/windowResized
 */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  bgImg = createGraphics(windowWidth, windowHeight);
  bgImg.colorMode(HSB, 360, 100, 100, 100);
  drawRadialGradient();
  
  createTriangles();
}

/**
 * Draw information about the graphic in the bottom right corner.
 */
function drawCredits() {
  push();
    translate(width - 20 - weatherLogo.width, height - 80 - weatherLogo.height);
    
    colorMode(RGB);
    tint(255, 125);
    if (mouseX >= width - 20 - weatherLogo.width && 
        mouseY >= height - 80 - weatherLogo.height && 
        mouseY <= height - 80) {
      tint(255, 200);
    }
    image(
      weatherLogo, 
      20, // image x position (top-left corner)
      0, // image y position (top-left corner)
      weatherLogo.width, // image width
      weatherLogo.height // image height
      );
    colorMode(HSB);
    
    fill(100, 0, 100, 50);
    textAlign(RIGHT);
    textSize(12);
    text(
      'The current weather is ' + temp_f + '\u00B0F', 
      weatherLogo.width, 
      weatherLogo.height + 20);
    text(
      'with a wind speed of ' + wind_mph + ' mph', 
      weatherLogo.width, 
      weatherLogo.height + 40);
      
    if (mouseX >= width - 20 - weatherLogo.width && 
        mouseY >= height - 30 && 
        mouseY <= height - 15) {
      fill(100, 0, 100, 90);
    }
    text(
      'in ' + weather_city + ', ' + weather_state, 
      weatherLogo.width, 
      weatherLogo.height + 60);
  pop();
}

/**
 * Operation that occurs when the mouse is moved.
 */
function mouseMoved() {
  // Show the cursor as a hand if it's hovering over the weather logo.
  if (mouseX >= width - 20 - weatherLogo.width && 
        mouseY >= height - 80 - weatherLogo.height && 
        mouseY <= height - 80) {
    cursor(HAND);
  } else if (mouseX >= width - 20 - weatherLogo.width && 
        mouseY >= height - 30 && 
        mouseY <= height - 15) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
}

/**
 * Operation that occurs when the mouse is clicked.
 */
function mouseClicked() {
  // Open the weather underground API in a new tab when the logo is clicked.
  if (mouseX >= width - 20 - weatherLogo.width && 
        mouseY >= height - 80 - weatherLogo.height && 
        mouseY <= height - 80) {
    var win = window.open('http://www.wunderground.com/weather/api/', '_blank');
    win.focus();
  } 
  // Show the selector for a new city/state
  else if (mouseX >= width - 20 - weatherLogo.width && 
        mouseY >= height - 30 && 
        mouseY <= height - 15) {
    $( '#city-state-picker' ).toggle( true );
  }
  // Hide the selector for a new city/state.
  else if (
        !(mouseX >= width/2 - 200 && mouseX <= width/2 + 200) &&
        !(mouseY >= height/2 - 100 && mouseY <= height/2 + 100)) {
    $( '#city-state-picker' ).toggle( false );
  }
}

/**
 * Draws a radial gradient.
 * Based on: https://www.processing.org/examples/radialgradient.html
 */
function drawRadialGradient() {
  var dim = windowWidth;
  if (windowHeight > windowWidth) {
    dim = windowHeight;
  }
  if (dim < 200) {
    dim =200;
  }
  var radius = dim;
  var s = 100;
  var x = windowWidth;
  var y = windowHeight;
  
  bgImg.noStroke();
  for (var r = radius; r > 0; r-=5) {
    bgImg.stroke(hue, s, 90);
    bgImg.strokeWeight(r);
    bgImg.point(x, y);
    if (s > 10) {
      s-=0.5;
    }
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
  if (triangle.point1.y > height || triangle.point1.y <= 0 ||
      triangle.point1.y >= height || triangle.point1.y <= 0 ||
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
      if (!triangles || triangles.length === 0) {
        createTriangles();
      } else {
        updateTriangleProperties();
      }
      drawRadialGradient();
    },
    error: function(parsed_json) {
      //TODO: Figure out why this message isn't being shown
      alert('parsed_json');
    }
  });
}

/**
 * Updates the location of the city and state.
 */
function changeLocation() {
  $( '#city-state-picker' ).toggle( false );
  
  var newCity = $('#city-name').val();
  newCity = newCity.replace(' ', '_');
  
  var newState = $('#state-name').val();
  if (newState.length != 2) {
    alert('Enter a valid state abbreviation');
  } else {
    weather_city = newCity;
    weather_state = newState;
    parseWeatherData();
  }
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
    hue = 45; // Yellow
  } else if (temp_f < 86) {
    hue = 36; // Orange
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
  
  var numTriangles = 200;
  if (windowWidth > 800) {
    numTriangles = windowWidth / 4;
  }
  
  for (var i=0; i<numTriangles; i++) {
    // Find the first point's 2D position, velocity, and rotation.
    var pos = 
          createVector(noise(xOff + 2*i) * width, noise(yOff - 2*i) * height);

    velocity = createVector(
      random(0-velocityLimit, velocityLimit), 
      random(0-velocityLimit, velocityLimit)
    );
    rotationFactor = random(0 - rotationFactorLimit, rotationFactorLimit);

    // Create the triangle object.
    triangles[triangles.length] = new Triangle(pos, velocity, rotationFactor);
    
    // Update the offset values.
    xOff += 20;
    yOff += 20;
  }
}

/**
 * Assigns new velocity and rotation information for each triangle.
 */
function updateTriangleProperties() {
  for (var i=0; i<triangles.length; i++) {
    velocity = createVector(
      random(0-velocityLimit, velocityLimit), 
      random(0-velocityLimit, velocityLimit)
    );
    rotationFactor = random(0 - rotationFactorLimit, rotationFactorLimit);
    
    triangles[i].velocity = velocity;
    triangles[i].rotationFactor = rotationFactor;
    triangles[i].rotation = this.rotationFactor;
  }
}