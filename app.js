var BASE_TRAIL_URL = 'https://trailapi-trailapi.p.mashape.com/';
var BASE_WEATHER_URL = 'http://api.apixu.com/v1/';
var activityDate;
var now;
var weather = new Object();

//make an object for historic and forecasted data?


function getDataFromTrailApi(endpoints, callback) {

    var data = {
        url: BASE_TRAIL_URL + endpoints,
        type: 'GET',
        data: {},
        dataType: 'json',
        success: callback,
        error: function(err) {
            console.log(err);
            alert("There is an error");
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader("X-Mashape-Authorization", "IvhvrcGpoQmshzCYWrW3TPwJKMKip1PjW0Mjsnde60lb1SyWES");
        }
    };
    $.ajax(data);
}




function getQueryEndpoints() {
    var endString = '';
    var city = $('.js-city').val();
    var state = $('.js-state').val();

    if (city.trim() != "") {
        endString += '?q[city_cont]=' + city +
            '&q[state_cont]=' + state;
    } else {
        endString += '?q[state_cont]=' + state;
    }

    return endString;
}

function getTrailEndpoints(locObj) {
    var endString = "";

    endString += '?q[activities_activity_name_cont]=' + locObj.name +
        '&q[state_cont]=' + locObj.state +
        '&q[city_cont]=' + locObj.city;

    return endString;
}



function getDataFromWeatherApi(locObj, dateTense, endpoint, callback) {

    var settings = {
        url: BASE_WEATHER_URL + dateTense +
            '.json?key=245141566e984e7e9de230727161012&q=' + locObj.lat +
            ',' + locObj.lon + endpoint,
        dataType: 'json',
        data: {},
        type: 'GET',
        success: callback
    };

    // console.log(dateTense + ' weather: ' + settings.url);

    $.ajax(settings);
}



function formatDate(d) {
    month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}



// Render functions

function displaySearchData(data) {
    if (data.places.length > 0) {
        data.places.forEach(function(place) {

            $('.js-search-results').append('<div class="result small"' +
                'data-lat="' + place.lat + '" data-lon="' + place.lon + '" ' +
                'data-city="' + place.city + '" data-state="' + place.state + '"' +
                'data-name="' + place.name + '">' +
                '<div class="result-name">' + place.name + '</div>' +
                '<div class="result-location">' + place.city + ', ' + place.state + '</div></div>');
        });

    } else {
        $('.js-search-results').append('<p>Sorry, no trails found</p>');
    }

}



/**Later write in the different activities in one location and filter out duplicates**/
function displayTrailData(data) {
    var trailObj = data.places[1];

    $('.big').append('<div class="trail-details"><span class="detail-label">Description:</span> ' +
        findBestDescription(data) + '</p>' +
        '<p class="trail-directions"><span class="detail-label">Directions:</span> ' +
        findBestDirections(data) + '</p></div>');

}



function findBestDirections(data) {
    var longStr = "";
    for (var i = 0; i < data.places.length; i++) {
        try {
            if (data.places[i].directions == null) {
                continue;
            }
            if (data.places[i].directions.length > longStr.length) {
                longStr = data.places[i].directions;
            }
        } catch (err) {
            continue;
        }
    }
    return longStr;
}

function findBestDescription(data) {
    var longStr = "";
    for (var i = 0; i < data.places.length; i++) {
        if (data.places[i].description == null) {
            continue;
        }
        if (data.places[i].description.length > longStr.length) {
            longStr = data.places[i].description;
        }
    }

    if (longStr == 'null' || longStr.length == 0) {
        longStr = "Not available";
    }
    return longStr;
}



//display the previous 3 days of weather
function displayHistoricWeatherData(data) {
    var forecastDays = data.forecast.forecastday;

    for (var i = 0; i < forecastDays.length; i++) {
        $('.weather-details').append('<p>Rainfall on' +
            forecastDays[i].day.totalprecip_in + ' inches</p>');
    }

}

//display the current day and next 3 days of weather
function displayWeatherData(data) {
    var forecastDays = data.forecast.forecastday;

    //display the last 3 days rainfall/snow/temp
    for (var i = 0; i < forecastDays.length; i++) {
        $('.weather-details').append("<p>Working... " +
            forecastDays[i].day.maxtemp_f + "degrees</p>");
    }
    //display the next 4 days temp/rainfall/snow/wind

}

function expandResult(locObj) {

    //trail expanded information
    getDataFromTrailApi(getTrailEndpoints(locObj.data()), displayTrailData);

    //weather 3 days ago
    var threeDaysAgo = new Date();
    threeDaysAgo.setDate(now.getDate() - 3);
    getDataFromWeatherApi(locObj.data(), 'history', '&dt=' + formatDate(threeDaysAgo), displayHistoricWeatherData);

    //weather 2 days ago
    var twoDaysAgo = new Date();
    twoDaysAgo.setDate(now.getDate() - 2);
    getDataFromWeatherApi(locObj.data(), 'history', '&dt=' + formatDate(twoDaysAgo), displayHistoricWeatherData);

    //weather yesterday
    var yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    getDataFromWeatherApi(locObj.data(), 'history', '&dt=' + formatDate(yesterday), displayHistoricWeatherData);

    //curent weather and forecast for next 3 days
    getDataFromWeatherApi(locObj.data(), 'forecast', '&days=3', displayWeatherData);
}



// Event Listeners

function watchSubmit() {
    $('.js-search-form').submit(function(event) {
        event.preventDefault();
        $('.js-search-results').empty(); //any previous results

        activityDate = $('.js-date').val();

        getDataFromTrailApi(getQueryEndpoints(), displaySearchData);
    });
}



$(document).ready(function() {
    now = new Date();
    var dateStr = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();

    //set the value of element to today's date on load
    $('.js-date').val(dateStr);


    /*
    Also for tomorrow, there is a glitch when the user has 2 results 
    selected, and then clicks off of 1. The result is still yellow, but no 
    longer includes the weather data. Check what $(objects) are being selected



    How does the weather history API access multiple days of historic data???
    */


    watchSubmit();

    //Expand the result
    $(document).on('click', '.small', function(event) {

        //if result is not already expanded
        if (!$('.result').hasClass('big')) {
            $(this).addClass('big');
            $(this).removeClass('small');
            expandResult($(this));
        }
    });



    //Collapse the result
    $(document).on('click', '.big', function() {
        $('.result-location').nextAll().remove();

        $(this).addClass('small');
        $(this).removeClass('big');
    });
});
