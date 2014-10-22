/**
 * Iron Man Watch: Based on Mobile Image:
 *  http://cdn7.staztic.com/app/a/3060/3060987/iron-ui-music-widget-uccw-skin-3-3-s-307x512.jpg
 * 
 * Author: Christina Lidwin
 * 
 * Created On: October 6, 2014
 * Modified On: October 22, 2014
 * 
 * Design Goal: To create a visual clock that involves animations for different 
 *    time breakdowns.
 * 
 * Inspiration: Iron man mobile image as well as:
 *    http://th03.deviantart.net/fs70/PRE/i/2013/145/3/4/futuristic_clock_by_kolegapl-d66ivv6.jpg
 * 
 * Interactivity: No specific interactivity defined for this piece. However,
 *    it would be an interesting exercise to see how one might set an alarm or
 *    timer using this interface.
 * 
 * TODOS: In addition to the TODOs below, upload a version of this that shows
 *    the watch version and matching background.
 *    Also change the color schemes throughout the day (cool colors at night,
 *    warm colors during the day).
 */

var allBlack = true;

var black;

var secondStarted;

var rotateHour = 0;
var minuteRange = 60;
var secondOpacity = 60;

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
  black = color(350, 0, 0);
  
  // Initial background specs.
  if (allBlack) {
    background(189, 82, 0);
  } else {
    // Draw the initial watch area
    background(250, 0, 75);
    fill(356, 0, 25);
    rect(width/2 - 125, 0, 250, height);
  }

  // Calculate the second the program was started in milliseconds.
  secondStarted = millis() - second()*1000;
}

/**
 * Operations that occur once per frame rendering
 */
function draw() {
  //Determine which mode is being drawn
  allBlack ? drawAllBlack() : drawWatchFace();
  
  // Draw time pieces (outmost layer is the shortest time measurement).
  drawSeconds();
  drawMinutes();
  drawHours();
  drawDate();
}

/**
 * Renders a blank watch face for the watch background mode.
 */
function drawWatchFace() {
  fill(black);
  stroke(0, 0, 50);
  strokeWeight(30);

  push();
    translate(width/2, height/2);
    ellipse(0, 0, 475, 475);
  pop();
}

/**
 * Renders content for the all black background mode.
 */
function drawAllBlack() {
  background(189, 82, 0);
}

/**
 * Draws a ring of lines indicating the milliseconds
 * in the current time.
 */
function drawDate() {
  // Calculate opacity
  var opacity = abs((250 - millis() % 1500));
  
  // Set styling
  fill(50, 39, 80, opacity);
  noStroke();
  textAlign(CENTER);
  
  push();
    translate(width/2, height/2);
    
    // Draw month abbreviation
    textSize(28);
    text(getMonthText(), 0, -10);
    
    // Draw day of the month
    textSize(48);
    text(day(), 0, 30);
  pop();
}

/**
 * Draws a ring of lines indicating the number of seconds
 * in the current time.
 */
function drawSeconds() {
  var arcLength = 375;
  
  // Set styling.
  noFill();
  stroke(164, 37, 15);
  strokeCap(PROJECT);
  strokeWeight(20);
  
  // Fade the ring into darkness on the first second of each minute.
  if (second() === 0) {
    if (secondOpacity === 0) {
      secondOpacity = 60;
    } else {
      secondOpacity -= 2;
    }
    stroke(164, 37, secondOpacity);
    
    push();
      translate(width/2, height/2);
      arc(0, 0, arcLength, arcLength, 0, 360);
    pop();
  } else {
    // Draw the portion of the ring corresponding to the milliseconds.
    var percentage = ((millis()-secondStarted)%60000)/60000*360;
    
    push();
      translate(width/2, height/2);
      rotate(-88);
      arc (0, 0, arcLength, arcLength, 0, 360);
      stroke(164, 37, 60);
      arc(0, 0, arcLength, arcLength, 0, percentage);
    pop();
  }
}

/**
 * Draws a ring of lines indicating the number of minutes
 * in the current time.
 */
function drawMinutes() {
  var radius=80;
  
  // Stroke details.
  strokeCap(PROJECT);
  strokeWeight(3);
  
  // Reset the minuteRange if it's below zero.
  if (minuteRange < 0) {
    minuteRange = 0;
  }
  
  push();
    // Initial transforms.
    translate(width/2, height/2);
    rotate(-141);
    
    for (var i=0; i<60; i++) {
      // Use different colors for the current minute, building minutes, or not
      // encountered minutes.
      if (i == minute() && i < minuteRange) {
        stroke(5, 59, 75);
      } else if (i < minute() && i < minuteRange) {
        stroke(50, 39, 75);
      } else {
        stroke(50, 39, 20);
      }
      
      // Vary the length depending on if the time is an interval of 15 or 5
      var length = 11;
      if (i % 15 === 0) {
        length+=10;
      } else if (i % 5 === 0) {
        length+=5;
      }
      
      // Alter the rotation so each minute is drawn at a different point.
      rotate(6);
      line(radius, radius, radius+length, radius+length);
    }
  pop();
  
  // Create empty/fill animation based on if the second() is a switch second.
  // TODO: Add easing so that the animation adds a minute, then retracts,
  // then increases to the new position.
  if (second() == 59) {
    minuteRange -= 2;
  } else if (second() === 0) {
    minuteRange += 2;
  }
}

/**
 * Draws arcs indicating the number of minutes in the current time.
 */
function drawHours() {
  noStroke();
  
  // Create a rotation animation if the hour is changing.
  if (minute() === 0 && second() ===0 ) {
    rotateHour += 12;
  }
  
  push();
    translate(width/2, height/2);
    rotate(258 + rotateHour);
    
    for (var i=0; i<23; i++) {
      // Set fill color based on how it correlates to the time.
      var c;
      if (i == hour() - 1) {
        c = color(5, 59, 85);
      } else if (i < hour()) {
        c = color(0, 50, 55);
      } else {
        c = color(0, 50, 20);
      }
      fill(c);
      
      // Draw hour pieces in a circle shape.
      rotate(15.65);
      arc(0, 0, 165, 165, 0, 11);
    }
    
    fill(black);
    ellipse(0, 0, 112, 112);
  pop();
}

/**
 * @return an abbreviation of the current month, or 'Error' if invalid
 */
function getMonthText() {
  switch(month()) {
    case 1:
      return 'JAN';
    case 2:
      return 'FEB';
    case 3:
      return 'MAR';
    case 4:
      return 'APR';
    case 5:
      return 'MAY';
    case 6:
      return 'JUN';
    case 7:
      return 'JUL';
    case 8:
      return 'AUG';
    case 9:
      return 'SEP';
    case 10:
      return 'OCT';
    case 11:
      return 'NOV';
    case 12:
      return 'DEC';
    default:
      return 'Error';
  }
}
