/* Email Regex from http://www.jquerybyexample.net/2011/04/validate-email-address-using-jquery.html */
var emailFilter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;


/* Validates fields have correct input and sends the form to the email address */
var emailAddress = 'clidwin@gmail.com';
function validateAndSendForm() {
    $('#error').hide();
    event.preventDefault();

    // Validate the name field
    var name = $('input#name').val();
    if (name === '') {
        $('#error').text('Please enter your name before submitting');
        $('#error').show();
        $('input#name').focus();
        return false;
    } 

    // Validate the email
    var email = $('input#email').val();
    if (!emailFilter.test(email)) {
        $('#error').text('Please enter a vaild email before submitting');
        $('#error').show();
        $('input#email').focus();
        return false;
    } 

    var message = $('#message').val();
    if (message === '') {
        $('#error').text('Please enter a message before submitting');
        $('#error').show();
        $('input#message').focus();
        return false;
    }

    var subject = '[clidwin.com] Message from ' + name;

    // AJAX call code from https://medium.com/@mariusc23/send-an-email-using-only-javascript-b53319616782
    // TODO(clidwin): encrypt key
    $.ajax({
      type: 'POST',
      url: 'https://mandrillapp.com/api/1.0/messages/send.json',
      data: {
        'key': 'IrMC-X9TFCH6ZwL3j_mcdg',
        'message': {
          'from_email': email,
          'from_name': 'clidwin.com',
          'to': [
              {
                'email': emailAddress,
                'name': 'Christina Lidwin',
                'type': 'to'
              }
            ],
          'autotext': 'true',
          'subject': subject,
          'html': message
        }
      }
     }).done(function(response) {
        var status = response[0].status;
        if (status === 'sent') {
            $('#error').text('Message sent');
            $('#error').css({color: "#538647"}); //TODO(clidwin): find better green
            $('#error').show();
            $('#error').delay( 800 ).fadeOut( "slow", function() {
                $('#error').css({color: "#be3636"});
                $('input#name').val('');
                $('input#email').val('');
                $('#message').val('');
            });
        } else {
            $('#error').text('Sending error. Please try again later.');
            $('#error').show();
            $('#error').delay( 800 ).fadeOut();
        }
    });
    
    return false;
};


/* Calculate where the various pages start within the site */
function calculatePageLocations() {
    home = 0;
    contact = 0 + $('#home').height();
};


/* Function that runs when the page has loaded */
$( document ).ready( function() {
    $('#error').hide();
    $('#contact').submit(validateAndSendForm);
    
    // Page smooth scroll: http://stackoverflow.com/questions/4198041/jquery-smooth-scroll-to-an-anchor
    var hashTagActive = "";
    $(".nav").click(function (event) {
        if(hashTagActive != this.hash) { //this will prevent if the user click several times the same link to freeze the scroll.
            event.preventDefault();
            //calculate destination place
            var dest = 0;
            if ($(this.hash).offset().top > $(document).height() - $(window).height()) {
                dest = $(document).height() - $(window).height();
            } else {
                dest = $(this.hash).offset().top;
            }
            //go to destination
            $('html,body').animate({
                scrollTop: dest
            }, 1000, 'swing');
            hashTagActive = this.hash;
        }
    });
});