 //Array of background images
var images = new Array('/images/Etihad-Stadium.jpg', '/images/De-bruyne.jpg', '/images/emirates-stadium.jpg', '/images/Toure.jpg', '/images/Ozil.jpg', '/images/Hazard.jpg', '/images/Aguero.jpg', '/images/Klopp.jpg', '/images/Rooney.jpg', '/images/Spurs.jpg', '/images/Vardy.jpg', '/images/Wembley.jpg'),
    nextimage = 0;

//Function that handles the background images slideshow
function doSlideshow(){
    if (nextimage >= images.length) {nextimage=0;}
    $('.home')
    .css('background-image','url("'+images[nextimage++]+'")')
    .fadeIn("slow", "swing", function(){
        setTimeout(doSlideshow,20000);
    });
}

// Set the interval between the 404 images 
setInterval(function()
{
    // Remove .active class from the active li, select next li sibling.
    var next = $('img.active').removeClass('active').next('img');

    // Did we reach the last element? Of so: select first sibling
    if (!next.length) next = next.prevObject.siblings(':first');

    // Add .active class to the li next in line.
    next.addClass('active');
}, 5000);

// Function for validating the user input in the form
function validateForm(){
    var x = document.forms["login"]["username"].value;
    if (x==null || x==""){
        alert("Please enter your username.")
        return false;
    }
}

jQuery(function($) {
    // Asynchronously Load the map API 
    var script = document.createElement('script');
    script.src = "http://maps.googleapis.com/maps/api/js?key=AIzaSyBhdAk0Ki3azlEwLYPnBIDFyGWoFxH4Zb0&Asensor=false&callback=initialize";
    document.body.appendChild(script);
});

// JQuery for the toggleable text window
$(document).ready(function () {

    $('#toggle-view li').click(function () {

        var text = $(this).children('div.panel');

        if (text.is(':hidden')) {
            text.slideDown('200');
            $(this).children('span').html('-');     
        } else {
            text.slideUp('200');
            $(this).children('span').html('+');     
        }
        
    });
});

// Submit for the Twitter form
$("#query").submit(function(event) {

  // stop form from submitting normally
  event.preventDefault();

  // get some values from elements on the page:
  var $form = $( this ),
      url = $form.attr( 'action' );

  // Send the data using post
  var posting = $.post( url, { twitterProfile: $('#profile').val(), keywords: $('#keywords').val(), hashTags: $('#hashtags').val(), count: $('#count').val(), date: $('#date').val(), distance: $('#distance').val(), geo: $('#geo').val() } );

});

// Submit for the SPARQL form 
$("#sparqlquery").submit(function(event) {

  // stop form from submitting normally
  event.preventDefault();

  // get some values from elements on the page:
  var $form = $( this ),
      url = $form.attr( 'action' );

  // Send the data using post
  var poster = $.post( url, { date: $('#date').val(), HomeTeam: $('hTeam').val(), AwayTeam: $('aTeam').val(),} );

});