/**
 * Atmospheric Sketch using weather data from Weather Underground.
 *    http://www.wunderground.com/weather/api/d/docs?d=data/conditions&MR=1
 * 
 * Author: Christina Lidwin
 * 
 * Created On: October 20, 2014
 * Modified On: October 20, 2014
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
}

/**
 * Operations that occur once per frame rendering
 */
function draw() {
  background(350, 100, 40);
  textSize(28);
  text(wind_mph, 0, 20);
  text(wind_degrees, 0, 80);
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
