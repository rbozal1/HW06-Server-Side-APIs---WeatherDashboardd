var apiKey = "114f1a6d2d63f6142beaad9d16a2364c"
var city = "raleigh"
var currentConditions = "https://api.openweathermap.org/data/2.5/weather?appid="
var fiveDay =
  "https://api.openweathermap.org/data/2.5/forecast?114f1a6d2d63f6142beaad9d16a2364cq={city name},{country code}"

var searchedArr = JSON.parse(localStorage.getItem("searchedItems")) || [];
var currentDate = moment().format("MM/DD/YYYY");

//taking in user input, and passing the value into a variable
$(document).ready(function() {
  $("#searchBtn").on("click", function(event) {
    var userInput = $("#searchVal").val()
    console.log(userInput)
    getWeather(userInput)
  
  })
})

if (searchedArr.length > 0) {//sets history array search to correct length.
    getWeather(searchedArr[searchedArr.length - 1]);
}

for (var i = 0; i < searchedArr.length; i++) {// makes a row for each element in history array(searchTerms).
    createRow(searchedArr[i]);
}

function createRow(text) {
    var listItem = $("<li>").addClass("list-group-item").text(text);
    $(".searchedItems").append(listItem);
}

$(".searchedItems").on("click", "li", function () {
    getWeather($(this).text());
    getWeather($(this).text());
});
// userInput is passed into the getWeather function as arguement 'cityName'
function getWeather(cityName) {
  var apiCall = ""

  if (cityName !== "") {
    apiCall = currentConditions + apiKey + "&q=" + cityName
    //return apiCall;
  } else {
    apiCall = currentConditions + apiKey + "&q=" + city
    //return apiCall;
  }

  $.ajax({
    url: apiCall,
    method: "GET"
  }).then(function(response) {
    console.log(response)
    
    var humid = response.main.humidity;
    var wind = response.wind.speed
    var feelslike = response.main.temp


    feelslike = (feelslike - 273.15) * 1.8 + 32
    feelslike = Math.floor(feelslike)
    city = response.name

    //appending city,currentDate, weather, humidity, wind speed
    $("#today").append("<div>" + "<h3>" +city +"(" + currentDate + ")"+"</h3>" +"</div>")
    $("#today").append("<div>" + "Temperature: " +feelslike + " °F" + "</div>")
    $("#today").append("<div>" + "Humidity: " + humid + " %" + "</div>")
    $("#today").append("<div>" + "Wind Speed:"  + wind + " MPH" +"</div>")
   
    
    //displaying Uv index
    var lon = response.coord.lon;
    var lat = response.coord.lat;
    var uvIndex = $("<p>").addClass("card-text").text("UV Index: ")

            $.ajax({
                type: "GET",
                url:`https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}` 


            }).then(function (response) {
                console.log(response);

                // var uvColor;
                var uvResponse = response.value;
                var btn = $("<span>").addClass("btn btn-sm").text(uvResponse);


                if (uvResponse < 3) {
                    btn.addClass("btn-success");
                } else if (uvResponse < 7) {
                    btn.addClass("btn-warning");
                } else {
                    btn.addClass("btn-danger");
                }

                
                $("#today").append(uvIndex.append(btn));

            });


    fiveDay = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`

     $.ajax({
      url: fiveDay,
      method: "GET"
    }).then(function(response) {
      console.log(response)
      
      $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>")

      var averageTemp = 0
      var previousdate = ""
      var count = 0
      var results = 0
      previousdate = moment().format("MM/DD/YYYY")
      for (let index = 0; index < response.list.length; index++) {
        var currentDate = moment(response.list[index].dt, "X").format(
          "MM/DD/YYYY"
        )
        var temp = response.list[index].main.temp
        temp = (temp - 273.15) * 1.8 + 32
        temp = Math.floor(temp)
        console.log(currentDate)
        console.log(temp)

        if (previousdate === currentDate) {
          averageTemp = averageTemp + temp
          count++
          previousdate = currentDate
        } else {
          results = averageTemp / count
          results = Math.floor(results)
          console.log("results:", results)
          var card = $("<div class = 'card col-md-2'>")

          var div1 = $("<div class= 'card-header'>")
          div1.append("Date:" + ' ' + currentDate)
          card.append(div1)
          
        var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + response.list[index].weather[0].icon + ".png");
        card.append(img)
        var humidity = $("<p>").addClass("card-text").text("Humidity: " + response.list[index].main.humidity + "%");
        card.append(humidity)
        temp = $("<p>").addClass("card-text").text("Temperature: " + results + " °F");
        card.append(temp)

        $("#forecast").append(card);
        // $("#today").append("<div>" + humidity+ "</div>")
          count = 0
          averageTemp = 0
          previousdate = currentDate



         
        }
      }
    })
  })
}