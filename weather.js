//Weather data provided by Darksky API

function weather() {
  var location = document.getElementById("location");
  var apiKey = config.darkskyKey; //insert Darkspy API here 
  var url = 'https://api.forecast.io/forecast/';
  
  navigator.geolocation.getCurrentPosition(success, error);
  //Retrieve location, get cloud coverage, get aurora report on success
  function success(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    location.innerHTML = "";
    $.getJSON(url + apiKey + "/" + latitude + "," + longitude + "?callback=?", function(data) {
      cloud = data.currently.cloudCover;
      if(cloud <= 0.25){
        $('#coverage').html("Little to no cloud coverage.")
      }else if(cloud <= .50){
        $('#coverage').html("Some cloud coverage.")
      }else if(cloud <= 0.75){
        $('#coverage').html("High cloud coverage.")
      }else{
        $('#coverage').html("Very high cloud coverage.")
      }
      $('#clouds').css("opacity", cloud*.75); //Scale cloud opacity a bit
      aurora(latitude, longitude, data.currently.cloudCover);
    });
  }
  
  function error() {
    alert("Unable to retrieve location. Please try again later or refresh the page.");
  }
  location.innerHTML = "Retrieving location...";
}

//Retrieve & process aurora information
function aurora(lat, long, cloud){
  fetch('https://services.swpc.noaa.gov/text/aurora-nowcast-map.txt')
  .then(res => res.blob()) // Gets the response and returns it as a blob
  .then(blob => {
    var reader = new FileReader();
    reader.onload = function(e){
      var raw_file = e.target.result;
      var i = 0;
      var new_lines = 0
      var kp_start = 0;
      while(i < filesize){
        if(raw_file.charCodeAt(i) == 10){
          new_lines++;
        }
        if(new_lines == 17){ //# of lines before actual map starts 
          kp_start = i+1; 
          break;
        }
        i++;
      }
      var final_map =  raw_file.substring(kp_start, filesize); //Trim off beginning section of NOAA file
      final_map = final_map.match(/\d+/g).map(Number);
      var x;
      if(long <= 0){
        x = long + 360;
      }else{
        x = long;
      }
      x = x / 0.3284615; //Have to scale longitude value to match scale of map from NOAA
      var y = (lat + 90) / 0.3515625; //Scale latitude value 
      var final_pos = Math.round((y * 1024) + x);
      var aurora_percentage = final_map[final_pos];
      var aurora_string;
      switch(true){
        case (aurora_percentage < 25):
        aurora_string = "Slim to no Aurora visiblity in perfect conditions.";
        $('#aurora').css("border", "1px solid gray");
        break;
        case (aurora_percentage < 50):
        aurora_string = "Low Aurora visibility in perfect conditions.";
        break;
        case(aurora_percentage < 75):
        aurora_string = "Medium Aurora visibility in perfect conditions.";
        break;
        case(aurora_percentage <= 100):
        aurora_string = "High Aurora visibility in perfect conditions.";
        break;
      }
      $('#activity').html(aurora_string);
      $('#aurora').css("box-shadow", "0 0 100px 40px rgba(65, 241, 244, "+ (aurora_percentage/100) + "), 0 0 140px 60px rgba(66, 244, 104, " + (aurora_percentage/100) + ")");
      console.log(aurora_percentage);
    };
    reader.readAsText(blob);
    var filesize = blob.size; 
    document.getElementById("map").href = ("https://services.swpc.noaa.gov/text/aurora-nowcast-map.txt");
  });
  $('#clouds').show();
}

$('#clouds').hide();
weather();
