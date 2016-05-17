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

// function for initalizing google maps on the page
function initialize() {
    var map;
    var bounds = new google.maps.LatLngBounds();
    var mapOptions = {
        mapTypeId: 'roadmap'
    };
                    
    // Display the map on the page
    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    map.setTilt(45);
        
    // Dummy array for plotting the locations of the geocoded tweets, will be removed as getTweets will provide this data
    var coord = [];
    /* Dummy values
      { type: 'Point', coordinates: [ 53.43887641, -2.26581926 ] },
      { type: 'Point', coordinates: [ 53.260671, -2.12337785 ] },
      { type: 'Point', coordinates: [ 53.44815087, -2.22897913 ] },
      { type: 'Point', coordinates: [ 53.4809685, -2.2328403 ] },
      { type: 'Point', coordinates: [ 53.48140416, -2.19272908 ] },
      { type: 'Point', coordinates: [ 53.48140416, -2.19272908 ] },
      { type: 'Point', coordinates: [ 53.48118582, -2.19197047 ] },
      { type: 'Point', coordinates: [ 53.430645, -2.309451 ] },
      { type: 'Point', coordinates: [ 53.48314268, -2.20046282 ] },
      { type: 'Point', coordinates: [ 53.25648692, -2.12422065 ] },
      { type: 'Point', coordinates: [ 53.48329123, -2.20054605 ] },
      { type: 'Point', coordinates: [ 53.44815087, -2.22897913 ] },
      { type: 'Point', coordinates: [ 53.28846045, -3.47088026 ] },
      { type: 'Point', coordinates: [ 53.48329123, -2.20054605 ] },
      { type: 'Point', coordinates: [ 53.41481911, -2.26520875 ] },
      { type: 'Point', coordinates: [ 53.5061265, -2.0240911 ] },
      { type: 'Point', coordinates: [ 53.57085753, -2.29129693 ] },
      { type: 'Point', coordinates: [ 53.38878594, -2.28376868 ] },
      { type: 'Point', coordinates: [ 53.4667, -2.2333 ] },
      { type: 'Point', coordinates: [ 53.48118582, -2.19197047 ] },
      { type: 'Point', coordinates: [ 52.809, -1.756 ] },
      { type: 'Point', coordinates: [ 53.48140416, -2.19272908 ] },
      { type: 'Point', coordinates: [ 53.48140416, -2.19272908 ] },
      { type: 'Point', coordinates: [ 53.4822464, -2.2339807 ] },
      { type: 'Point', coordinates: [ 53.24289639, -2.12678539 ] },
      { type: 'Point', coordinates: [ 53.48314268, -2.20046282 ] },
      { type: 'Point', coordinates: [ 50.73873874, -1.82213708 ] },
      { type: 'Point', coordinates: [ 50.73410011, -1.83927035 ] },
      { type: 'Point', coordinates: [ 50.375254, -4.1124781 ] },
      { type: 'Point', coordinates: [ 50.72072072, -1.84989633 ] },
      { type: 'Point', coordinates: [ 50.3775494, -4.109164 ] },
      { type: 'Point', coordinates: [ 53.38683461, -2.26890536 ] },
      { type: 'Point', coordinates: [ 53.43887641, -2.26581926 ] },
      { type: 'Point', coordinates: [ 53.260671, -2.12337785 ] },
      { type: 'Point', coordinates: [ 53.44815087, -2.22897913 ] },
      { type: 'Point', coordinates: [ 53.4809685, -2.2328403 ] },
      { type: 'Point', coordinates: [ 53.48140416, -2.19272908 ] },
      { type: 'Point', coordinates: [ 53.48140416, -2.19272908 ] },
      { type: 'Point', coordinates: [ 53.48118582, -2.19197047 ] },
      { type: 'Point', coordinates: [ 53.430645, -2.309451 ] },
      { type: 'Point', coordinates: [ 53.48314268, -2.20046282 ] },
      { type: 'Point', coordinates: [ 53.25648692, -2.12422065 ] },
      { type: 'Point', coordinates: [ 53.48329123, -2.20054605 ] },
      { type: 'Point', coordinates: [ 53.44815087, -2.22897913 ] },
      { type: 'Point', coordinates: [ 53.28846045, -3.47088026 ] },
      { type: 'Point', coordinates: [ 53.48329123, -2.20054605 ] },
      { type: 'Point', coordinates: [ 53.41481911, -2.26520875 ] },
      { type: 'Point', coordinates: [ 53.5061265, -2.0240911 ] },
      { type: 'Point', coordinates: [ 53.57085753, -2.29129693 ] },
      { type: 'Point', coordinates: [ 53.38878594, -2.28376868 ] } 
    ];    */
    
    // array for pushing the coordinates
    var coords = [];

    // function to check that coordinates have been returned by getTweets()
    function checkCoord(){
        if (coordAr == []){
            return null;
        } else {
            return coordAr;
        }
    }

    // function for turning coords into just an array of coordinates
    var coordAr = coord.map(function(o) {
      return o.coordinates;
    })
    
    // array containing the locations of each premier league football teams stadium for markers
    var markers = [
      ['Arsenal', 51.555757,-0.108298],
      ['AVFCOfficial', 52.509007,-1.884826],
      ['afcbournemouth', 50.735238,-1.838293],
      ['ChelseaFC', 51.481660,-0.190949],
      ['CPFC', 51.398253,-0.085485],
      ['Everton', 53.438764,-2.966324],
      ['LCFC', 52.620301,-1.143208],
      ['LFC', 53.430829,-2.960830],
      ['MCFC', 53.483125,-2.200406],
      ['ManUtd', 53.463037,-2.291342],
      ['NUFC', 54.975350,-1.622575],
      ['NorwichCityFC', 52.622042,1.309107], 
      ['SouthamptonFC', 50.905739,-1.389905],
      ['stokecity', 52.988264,-2.175518],
      ['SunderlandAF', 54.914542,-1.388435],
      ['SwansOfficial', 51.642730,-3.934489],
      ['SpursOfficial', 51.603165,-0.065739],
      ['WBAFCofficial', 52.509045,-1.963949],
      ['whufc_official', 51.531950,0.039392],
      ['WatfordFC', 51.649871,-0.401363],
    ]

    // Info Window Content for each of the markers 
    var infoWindowContent = [
        ['<div class="info_content">' + '<h4>Emirates Stadium</h4>' + '<p>Home of Arsenal Football Club.</p>' + '</div>'],
        ['<div class="info_content">' + '<h4>Villa Park</h4>' + '<p>Home of Aston Villa Football Club.</p>' + '</div>'],
        ['<div class="info_content">' + '<h4>Dean Court</h4>' + '<p>Home of Bournemouth Football Club.</p>' + '</div>'],
        ['<div class="info_content">' + '<h4>Stamford Bridge</h4>' + '<p>Home of Chelsea Football Club.</p>' + '</div>'],
        ['<div class="info_content">' + '<h4>Selhurst Park</h4>' + '<p>Home of Crystal Palace Football Club.</p>' + '</div>'],
        ['<div class="info_content">' + '<h4>Goodison Park</h4>' + '<p>Home of Everton Football Club.</p>' + '</div>'],
        ['<div class="info_content">' + '<h4>King Power Stadium</h4>' + '<p>Home of Leicester City Football Club.</p>' + '</div>'],
        ['<div class="info_content">' + '<h4>Anfield</h4>' + '<p>Home of Liverpool Football Club.</p>' + '</div>'],
        ['<div class="info_content">' + '<h4>Etihad Stadium</h4>' + '<p>Home of Manchester City Football Club.</p>' + '</div>'],
        ['<div class="info_content">' + '<h4>Old Trafford</h4>' + '<p>Home of Manchester United Football Club.</p>' + '</div>'],
        ['<div class="info_content">' + '<h3>St James Park </h4>' + '<p>Home of Newcastle United Football Club.</p>' + '</div>'],
        ['<div class="info_content">' + '<h4>Carrow Road</h4>' + '<p>Home of Norwich City Football Club.</p>' + '</div>'],
        ['<div class="info_content">' + '<h4>St Marys Stadium</h4>' + '<p>Home of Southampton Football Club.</p>' + '</div>'],
        ['<div class="info_content">' + '<h4>Britania Stadium</h4>' + '<p>Home of Stoke City Football Club.</p>' + '</div>'],
        ['<div class="info_content">' + '<h4>Stadium Of Light</h4>' + '<p>Home of Sunderland Football Club.</p>' + '</div>'],
        ['<div class="info_content">' + '<h4>Liberty Stadium</h4>' + '<p>Home of Swansea City Football Club.</p>' + '</div>'],
        ['<div class="info_content">' + '<h4>White Hart Lane</h4>' + '<p>Home of Tottenham Hotspur Football Club.</p>' + '</div>'],
        ['<div class="info_content">' + '<h4>The Hawthorns</h4>' + '<p>Home of West Bromich Albion Football Club.</p>' + '</div>'],
        ['<div class="info_content">' + '<h4>Upton Park</h4>' + '<p>Home of West Ham Football Club.</p>' + '</div>'],
        ['<div class="info_content">' + '<h4>Vicarage Road</h4>' + '<p>Home of Watford Football Club.</p>' + '</div>']
    ];
        
    // Display multiple markers on a map
    var infoWindow = new google.maps.InfoWindow(), markers, i;
    var infoWindowt = new google.maps.InfoWindow(), coordAr, i;

    // Loop through the array of markers for stadiums & place each one on the map  
    for( i = 0; i < markers.length; i++ ) {
        var position = new google.maps.LatLng(markers[i][1], markers[i][2]);
        bounds.extend(position);
        marker = new google.maps.Marker({
            position: position,
            map: map,
            title: markers[i][0]
        });
        
        // Allow each marker to have an info window    
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                infoWindow.setContent(infoWindowContent[i][0]);
                infoWindow.open(map, marker);
            }
        })(marker, i));
    }

    // Loop through the array of tweet coords & place each one on the map  
    for( i = 0; i < coordAr.length; i++ ) {
        var position = new google.maps.LatLng(coordAr[i][0], coordAr[i][1]);
        bounds.extend(position);
        marker = new google.maps.Marker({
            position: position,
            map: map
        });

        // Allow each marker to have an info window    
        google.maps.event.addListener(coordAr, 'click', (function(coordAr, i) {
            return function() {
                infoWindow.setContent('<div class="info_content">' + '<h4>Tweet</h4>' + '<p>Location of one of the tweets returned.</p>' + '</div>');
                infoWindow.open(map, coordAr);
            }
        })(coordAr, i));
    }

    // Center the map fitting all markers on the screen
    map.fitBounds(bounds);

    // Set the zoom level once the fitBounds function runs
    var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function(event) {
        this.setZoom(5);
        google.maps.event.removeListener(boundsListener);
    });
}

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

// attach a submit handler to the form 
$("#query").submit(function(event) {

  // stop form from submitting normally
  event.preventDefault();

  // get some values from elements on the page:
  var $form = $( this ),
      url = $form.attr( 'action' );

  // Send the data using post
  var posting = $.post( url, { twitterProfile: $('#profile').val(), keywords: $('#keywords').val(), hashTags: $('#hashtags').val(), count: $('#count').val(), date: $('#date').val(), distance: $('#distance').val(), geo: $('#geo').val() } );

  // Alerts the results
  posting.done(function(data) {
    alert('success');
  });
});

// attach a submit handler to the form 
$("#sparqlquery").submit(function(event) {

  // stop form from submitting normally
  event.preventDefault();

  // get some values from elements on the page:
  var $form = $( this ),
      url = $form.attr( 'action' );

  // Send the data using post
  var poster = $.post( url, { date: $('#date').val(), HomeTeam: $('hTeam').val(), AwayTeam: $('aTeam').val(),} );

  // Alerts the results
  poster.done(function(data) {
    alert('success');
  });
});

/*
//var tweets = <%= tweets %>;
var coord = <%= JSON.stringify(geo) %>;
            var words = <%= JSON.stringify(commonWords) %>;
            var users = <%= activeUsers %>;
            var users_com = <%= usersCommon %>;
*/