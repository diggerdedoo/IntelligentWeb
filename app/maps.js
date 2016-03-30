jQuery(function($) {
	 // Asynchronously Load the map API 
    var script = document.createElement('script');
	script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyB_t3_wvQ1AxaFSDjZMifE7kVaPIvHEhSA&sensor=false";
    document.body.appendChild(script);
});

function initialize() {

	var map;
    var bounds = new google.maps.LatLngBounds();
	var mapOptions = {
	    mapTypeId: 'roadmap'
    };
		                    
	// Display a map on the page
	map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
	map.setTilt(45);

	var markers = [
		['Regents Court, Sheffield', 53.38108855193859, -1.4801287651062012],
	    ['Pam Liversidge Building, Sheffield', 53.382716, -1.477704]
   	];

  	// Info Window Content
    var infoWindowContent = [
        ['<div class="info_content">' +
        '<h3>Regents Court</h3>' +
        '<p>The Department of Computer Science, The University of Sheffield .</p>' + '</div>'],
	    ['<div class="info_content">' +
   	    '<h3>Pam Liversidge Building</h3>' +
        '<p>The Pam Liversidge Building.</p>' +
	    '</div>']
	];

	// Display multiple markers on a map
	var infoWindow = new google.maps.InfoWindow(), marker, i;
	    
	// Loop through our array of markers & place each one on the map  
	for( i = 0; i < markers.length; i++ ) {
		var position = new google.maps.LatLng(markers[i][2], markers[i][3]);
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

		// Automatically center the map fitting all markers on the screen
	    map.fitBounds(bounds);
	}

	// Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
    var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function(event) {
		this.setZoom(14);
        google.maps.event.removeListener(boundsListener);
    });
}

function initialize1() {
	var myLatlng = new google.maps.LatLng(53.38108855193859, -1.4801287651062012);
	var mapOptions = {
		zoom: 16,
		center: myLatlng }
	var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
	var marker = new google.maps.Marker({
		position: myLatlng,
		map: map,
		title: "Here!!" });
	var infowindow = new google.maps.InfoWindow({
		content: 'I work at the Department of Computer Science, The University of Sheffield',
		maxWidth:200 });
	infowindow.open(map,marker);
	google.maps.event.addListener(marker, 'click', function() {
	infowindow.open(map, marker); });
}

function moveMarker() {
	var myLatlng = new google.maps.LatLng(53.382716, -1.477704);
	var mapOptions = {
		zoom: 16,
		center: myLatlng }
	var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
	var marker = new google.maps.Marker({
		position: myLatlng,
		map: map,
		title: "Here!!" });
	var infowindow = new google.maps.InfoWindow({
		content: 'This is the Pam Liversidge Building',
		maxWidth:200 });
	infowindow.open(map,marker);
	google.maps.event.addListener(marker, 'click', function() {
	infowindow.open(map, marker); });
}

function moveBus( map, marker ) {
    marker.setPosition( new google.maps.LatLng( 53.382716, -1.477704 ) );
	google.maps.event.addListener(marker, 'click', (function(marker) {
      	return function() {
        	map.panTo( new google.maps.LatLng( 53.382716, -1.477704 ) );
      	}
    })(marker));
};