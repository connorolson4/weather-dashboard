// empty list until event
var searchHistory = [];
// search history from local storage
function getItems() {
    var storedCities = JSON.parse(localStorage.getItem("searchHistory"));
    if (storedCities !== null) {
        searchHistory = storedCities;
    };
     // lists locations
    for (i = 0; i < searchHistory.length; i++) {
        if (i == 8) {
            break;
          }
        
        cityListButton = $("<a>").attr({
            class: "list-group-item list-group-item-action",
            href: "#"
        });
        // history button is appended
        cityListButton.text(searchHistory[i]);
        $(".list-group").append(cityListButton);
    }
};
var city;
var mainCard = $(".card-body");

getItems();

function getData() { 
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=49fb27317373bb54f7d9243387af6df3" // starts call for current conditions
    mainCard.empty();
    $("#weeklyForecast").empty();
    // requests
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        // moment to get date
        var date = moment().format(" MM/DD/YYYY");
        // retrieves icon code from response
        var iconCode = response.weather[0].icon;
        // main card icon url
        var iconURL = "http://openweathermap.org/img/w/" + iconCode + ".png";
        // creates a single var and takes the name added from the search and the date/format from moment
        var name = $("<h3>").html(city + date);
        // shows name in main card
        mainCard.prepend(name);
        // shows icon in main card
        mainCard.append($("<img>").attr("src", iconURL));
        // converts K and removes decimals using Math.round
        var temp = Math.round((response.main.temp - 273.15) * 1.80 + 32);
        mainCard.append($("<p>").html("Temperature: " + temp + " &#8457"));
        // humidity
        var humidity = response.main.humidity;
        mainCard.append($("<p>").html("Humidity: " + humidity));
        // wind
        var windSpeed = response.wind.speed;
        mainCard.append($("<p>").html("Wind Speed: " + windSpeed)); // appends windspeed
        
        var lat = response.coord.lat;
        var lon = response.coord.lon;

        // UV index request
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/uvi?appid=49fb27317373bb54f7d9243387af6df3&lat=" + lat + "&lon=" + lon, // my api code
            method: "GET"
        // displays color coded UV info
        }).then(function (response) {
            mainCard.append($("<p>").html("UV Index: <span>" + response.value + "</span>"));
            // 
            if (response.value <= 2) {
                $("span").attr("class", "btn btn-outline-success");
            };
            if (response.value > 2 && response.value <= 5) {
                $("span").attr("class", "btn btn-outline-warning");
            };
            if (response.value > 5) {
                $("span").attr("class", "btn btn-outline-danger");
            };
        })
        // call for 5 day forecast
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=49fb27317373bb54f7d9243387af6df3", // my api code
            method: "GET"
        // columns for the 5 days
        }).then(function (response) {
            for (i = 0; i < 5; i++) { // start for loop
                // columns
                var newCard = $("<div>").attr("class", "col fiveDay bg-primary text-white rounded-lg p-2");
                $("#weeklyForecast").append(newCard);
                // moment for date
                var myDate = new Date(response.list[i * 8].dt * 1000);
                // displays date
                newCard.append($("<h4>").html(myDate.toLocaleDateString()));
                // brings back the icon url suffix
                var iconCode = response.list[i * 8].weather[0].icon;
                // builds the icon URL
                var iconURL = "http://openweathermap.org/img/w/" + iconCode + ".png";
                // displays the icon
                newCard.append($("<img>").attr("src", iconURL));
                // converts K and removes decimals using Math.round
                var temp = Math.round((response.list[i * 8].main.temp - 273.15) * 1.80 + 32);
                // displays temp
                newCard.append($("<p>").html("Temp: " + temp + " &#8457")); //appends fahrenheit degrees using short key code
                // creates a var for humidity from the response
                var humidity = response.list[i * 8].main.humidity;
                // displays humidity
                newCard.append($("<p>").html("Humidity: " + humidity));
                // displays wind
                newCard.append($("<p>").html("Wind Speed: " + windSpeed));

            }
        })
    })
};
// event executes search and adds to history
$("#searchCity").click(function() {
    city = $("#city").val().trim();
    getData();
    var checkArray = searchHistory.includes(city);
    if (checkArray == true) {
        return
    }
    else {
        searchHistory.push(city);
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
        var cityListButton = $("<a>").attr({
            // to keep search history items consistent
            class: "list-group-item list-group-item-action",
            href: "#"
        });
        cityListButton.text(city);
        $(".list-group").append(cityListButton);
    };
});

$(".list-group-item").click(function() {
    city = $(this).text();
    getData();
});

$("#searchCity").keypress(function () {  
    var _val = $("#searchCity").val();  
    var _txt = _val.charAt(0).toUpperCase() + _val.slice(1);  
    $("#searchCity").val(_txt);
});


$('#clear').click( function() {
    window.localStorage.clear();
    location.reload();
    return false;
    });