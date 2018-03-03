function showAnnotation(element) {
  var card = $(element).parent().parent().parent().parent();
  card.addClass('flip');
};

function hideAnnotation(element) {
  var card = $(element).parent().parent().parent().parent();
  card.removeClass('flip');
};
