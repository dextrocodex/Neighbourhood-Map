var map;
// This function is called when the map api loads
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: {
      lat: 26.137184,
      lng: 91.784439
    },
    zoom: 13,
    mapTypeId: 'roadmap'
  });

  infoWindow = new google.maps.InfoWindow();

  var bounds = new google.maps.LatLngBounds();

  for (var i = 0; i < placesData.length; i++) {
    addMarker(placesData[i]);
    bounds.extend(placesData[i].location);
  }
  map.fitBounds(bounds);
}

// This function add marker to the map.
function addMarker(place) {
  var coordinate = {
    lat: place.location.lat,
    lng: place.location.lng
  };
  self.marker = new google.maps.Marker({
    map: map,
    animation: google.maps.Animation.DROP,
    position: coordinate
  });

  if (self.marker) {
    self.markerArray().push([coordinate, self.marker]);
    google.maps.event.addListener(marker, "click", function() {
      stopAnimation();
      startAnimation(coordinate);
      showFourSquareData(place);
    });
  }
}

// This function remove (hide) all the marker from the map.
function removeMarker() {
  for (var i = 0; i < self.markerArray().length; i++) {
    self.markerArray()[i][1].setVisible(false);
  }
}

// This fuction show all the makers in the map
function showMarker() {
  for (var i = 0; i < self.markerArray().length; i++) {
    self.markerArray()[i][1].setVisible(true);
  }
}


// This function display bounce animation in the marker when the marker is clicked.
function startAnimation(coordinate) {
  ko.computed(function() {
    ko.utils.arrayForEach(self.markerArray(), function(m) {
      if (coordinate.lat === m[0].lat && coordinate.lng === m[0].lng) {
        m[1].setVisible(true);
        m[1].setAnimation(google.maps.Animation.BOUNCE);
      }
    });
  });
}

// This function stop the animation of all the markers.
function stopAnimation() {
  for (var i = 0; i < self.markerArray().length; i++) {
    self.markerArray()[i][1].setAnimation(null);
  }
}

function showMarkerPlace(place) {
  for (var i = 0; i < self.markerArray().length; i++) {
    if (place.location.lat == self.markerArray[i][0].lat && place.location.lng == self.markerArray()[i][0].lng) {
      self.markerArray[i][1].setVisible(true);
    }
  }
}

// This function loads the data from the foursquare api and stores them in knockout variables.
function showFourSquareData(place) {
  var currentDate = new Date();
  var day = currentDate.getDate();
  var month = currentDate.getMonth() + 1;
  var year = currentDate.getFullYear();

  if (day < 10) {
    day = "0" + day;
  }

  if (month < 10) {
    month = "0" + month;
  }

  var today = "" + year + month + day + "";
  var venue_id = place.venue_id;
  var url = "https://api.foursquare.com/v2/venues/" + venue_id + "?client_id=" + foursquareClientId + "&client_secret=" + foursquareClientSecret + "&v=" + today + "";

  // Ajax function is called here
  $.ajax({
    url: url,
    dataType: "json",
    async: true
  }).done(function(data) {
    // If call is successfull stores data in the variables.
    self.place_name(data.response.venue.name);
    self.place_description(data.response.venue.description);
    self.place_image(data.response.venue.bestPhoto.prefix + "320x200" + data.response.venue.bestPhoto.suffix);
    self.place_rating("Rating : " + data.response.venue.rating);
    self.place_contact(data.response.venue.contact.phone ? "Contact number:" + data.response.venue.contact.phone: "Contact Number unavailable.");
  }).error(function(){
    // If call is unsuccessfull this function is called.
    self.place_contact("");
    self.error_message("Error : Not able to load Foursquare API !!");
  });
}

var viewModel = function() {
  var self = this;
  this.markerArray = ko.observableArray([]);
  this.searchQuery = ko.observable();

  this.place_image = ko.observable();
  this.place_name = ko.observable();
  this.place_contact = ko.observable();
  this.place_description = ko.observable();
  this.place_rating = ko.observable();

  this.apiError = ko.observable(false);
  this.error_message = ko.observable();

  this.searchResult = ko.computed(function() {
    query = self.searchQuery();
    if (!query) {
      showMarker();
      return placesData;
    } else {
      removeMarker();
      return ko.utils.arrayFilter(placesData, function(place) {
        if (place.name.toLowerCase().indexOf(query) >= 0) {
          return place;
        }
        else if (place.name.toUpperCase().indexOf(query) >= 0){
          return place;
        }
      });
    }
  });

  this.viewPlaceOnMap = function(place) {
    var coordinate = {
      lat: place.location.lat,
      lng: place.location.lng
    };
    stopAnimation();
    startAnimation(coordinate);
    showFourSquareData(place);
  };

};

// This function is called when there is an error in loading the map.
function googleMapLoadError() {
  window.alert("Google Maps has failed to load. Please check your internet connection and try again.");
  self.apiError(true);
}
// Applying bindings of view with model
ko.applyBindings(viewModel);