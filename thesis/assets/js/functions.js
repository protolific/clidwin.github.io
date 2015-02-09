function showAnnotation(element) {
  var card = $(element).parent().parent().parent().parent();
  if (card) {
    var frontCard = card.children().first();
    var backCard = card.children().last();
    
    frontCard.animateRotate(180, 500, 'linear', function(){
        frontCard.css('z-index', '1');
        frontCard.css('backface-visibility', 'hidden');
        frontCard.css('transform', 'rotateY(180deg)');
    });
    backCard.animateRotate(180, 500, 'linear', function(){
        backCard.css('z-index', '2');
        backCard.css('backface-visibility', 'visible');
        backCard.css('transform', 'rotateY(0deg)');
    });
  }
};

//TODO: Fix bug in flipping, which is caused by the first execution of this method
function hideAnnotation(element) {
  var card = $(element).parent().parent().parent();
  if (card) {
    var frontCard = card.children().first();
    var backCard = card.children().last();
    
    backCard.animateRotate(180, 500, 'linear', function(){
        backCard.css('z-index', '1');
        backCard.css('backface-visibility', 'hidden');
        backCard.css('transform', 'rotateY(180deg)');
    });
    frontCard.animateRotate(180, 500, 'linear', function(){
        frontCard.css('z-index', '2');
        frontCard.css('backface-visibility', 'visible');
        frontCard.css('transform', 'rotateY(0deg)');
    });
  }
};



/* Function created at https://stackoverflow.com/questions/15191058/ */
$.fn.animateRotate = function(angle, duration, easing, complete) {
  var args = $.speed(duration, easing, complete);
  var step = args.step;
  return this.each(function(i, e) {
    args.complete = $.proxy(args.complete, e);
    args.step = function(now) {
      $.style(e, 'transform', 'rotateY(' + now + 'deg)');
      if (step) return step.apply(e, arguments);
    };

    $({deg: 0}).animate({deg: angle}, args);
  });
};