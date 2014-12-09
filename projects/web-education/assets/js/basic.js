$(document).ready(function () {
    $('#module-design-icon').hover(function () {
        alert('hello');
        $('#module-design-icon').removeClass('entypo-brush');
        $('#module-design-icon').addClass('entypo-rocket');
    });
});