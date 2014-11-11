/**
 * Atmospheric Sketch using weather data from Weather Underground.
 *    http://www.wunderground.com/weather/api/d/docs?d=data/conditions&MR=1
 * 
 * Author: Christina Lidwin
 * 
 * Created On: October 20, 2014
 * Modified On: November 10, 2014
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
 * Interactivity: 
 * 
 * TODOS: 
 */
 
var weather_city = 'Blacksburg';
var weather_state = 'VA';
var temp_f;
var wind_mph;
var wind_degrees;
var lines;
var points;
var tree;

var LineSegment = function(point1, point2) {
  this.point1 = point1;
  this.point2 = point2;
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
  getData();
  createPoints();
  tree = new kdTree(points, distance, ["x", "y"]);
  //createLines(points);
  //getNearest(10);
}

/**
 * Operations that occur once per frame rendering
 */
function draw() {
  background(350, 0, 60);
  getNearest(8);
  textSize(28);
  text(wind_mph, 0, 20);
  text(wind_degrees, 0, 80);
  
  for (var j=0; j<lines.length; j++) {
    line(lines[j].point1.x, lines[j].point1.y, lines[j].point2.x, lines[j].point2.y);
  }
}

/**
 * Uses AJAX to query weather underground for information on the 
 */
function getData() {
  //TODO: Generate a current city based on entered data
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
 * Retrieves the nearest X number of points to every given point, and maps the
 * results to the lines array.
 * 
 * @param numberOfPoints The number of nearest points to retrieve per point.
 */
function getNearest(numberOfPoints) {
  lines = [];
  for (var i=0; i<points.length; i++) {
    fill(220, random(100), 50);
    //noFill();
    beginShape();
    var nearest = tree.nearest(points[i], numberOfPoints);
    vertex(points[i].x, points[i].y);
    for (var j=0; j<nearest.length; j++) {
      var point = nearest[j][0];
      vertex(point.x, point.y);
      lines[lines.length] = new LineSegment(points[i], point);
    }
    endShape(CLOSE);
  }
}

/**
 * Creates lines between the points created.
 */
function createLines(points) {
  lines = [];
  for (var i=0; i<points.length; i++) {
    for (var j=0; j<points.length; j++) {
      if (abs(points[i].x - points[j].x) < 100 
          && abs(points[i].y - points[j].y) < 100) {
        lines[lines.length] = new LineSegment(points[i], points[j]);
      }
    }
  }
}

function distance(a, b) {
  var dx = a.x-b.x;
  var dy = a.y-b.y;
  return dx*dx + dy*dy;
}

/**
 * Creates a random set of points in the image.
 */
function createPoints() {
  points = [];
  var xOff = 0;
  var yOff = 0;
  for (var i=0; i<200; i++) {
    for (var j=0; j<50; j++) {
      var xPos = noise(xOff + 2*i) * width;
      var yPos = noise(yOff - 2*i) * height;
      points[i] = {x: xPos, y: yPos, id: i};
      xOff += 5;
      yOff += 5;
    }
  }
}
