var BASE_TRAIL_URL = 'https://trailapi-trailapi.p.mashape.com/';
var BASE_WEATHER_URL = 'https://api.apixu.com/v1/';
var weatherError = false;
var today;
var relativeDayName;
var selectedLocation;



function getDataFromTrailApi(callback) {

    var data = {
        url: BASE_TRAIL_URL + getQueryEndpoints(),
        type: 'GET',
        data: {},
        dataType: 'json',
        success: callback,
        error: function(err) {
            console.log(err);
            alert("There is an error");
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader("X-Mashape-Authorization",
                "IvhvrcGpoQmshzCYWrW3TPwJKMKip1PjW0Mjsnde60lb1SyWES");
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
    return '?q[activities_activity_name_cont]=' + locObj.name +
        '&q[state_cont]=' + locObj.state +
        '&q[city_cont]=' + locObj.city;
}



function getDataFromWeatherApi(locObj, apiType, endpoint, callback) {
    var location = '';

    //when there is an invalid lat/lon
    if (locObj.lat == 0 && locObj.lon == 0 || locObj.lat == null || locObj.lon == null) {
        location += '&q[city_cont]=' + locObj.city +
            '&q[state_cont]=' + locObj.state;
    } else {
        location += '&q=' + locObj.lat + ',' + locObj.lon
    }

    var settings = {
        url: BASE_WEATHER_URL + apiType +
            '.json?key=245141566e984e7e9de230727161012' + location + endpoint,
        dataType: 'json',
        data: {},
        type: 'GET',
        success: callback
    };
    console.log(apiType + ' weather: ' + settings.url);
    $.ajax(settings);
}



function formatDateForAPI(d) {
    var month, day, year;
    month = (d.getMonth() + 1);
    day = d.getDate();
    year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}



//takes in a date string with format YYYY-MM-DD
function formatDateForJS(dateStr) {
    var d = dateStr.split('-');
    var year = d[0].toString();
    var month = d[1].toString();
    var day = d[2].toString();

    if (month.length < 2) {
        month = '0' + d[1];
    };
    if (day.length < 2) {
        day = '0' + d[2];
    }
    return [month, day, year].join('/');
}



function findBestDirections(activities) {
    var longStr = "";
    for (var i = 0; i < activities.length; i++) {
        if (activities[i].directions == null) {
            continue;
        }
        if (activities[i].directions.length > longStr.length) {
            longStr = activities[i].directions;
        }
    }
    return longStr;
}



function findBestDescription(activities) {
    var longStr = "";
    for (var i = 0; i < activities.length; i++) {
        if (activities[i].description == null) {
            continue;
        }
        if (activities[i].description.length > longStr.length) {
            longStr = activities[i].description;
        }
    }
    if (longStr == 'null' || longStr.length == 0) {
        longStr = "Not available";
    }
    return longStr;
}



function dayOfWeekStr(data, thisDate) {
    var day = '';
    var dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    //if the API date was yesterday...
    if (thisDate == relativeDayName[0].dateStr) {
        day += relativeDayName[0].dayStr;
    } else if (thisDate == relativeDayName[1].dateStr) { //today
        day += relativeDayName[1].dayStr;
    } else if (thisDate == relativeDayName[2].dateStr) { //tomorrow
        day += relativeDayName[2].dayStr;
    } else {
        var dateType = new Date(formatDateForJS(thisDate));
        day += dayOfWeek[dateType.getDay()];
    }
    return day;
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
                '<div class="result-location">' + place.city + ', ' + place.state + '</div>' +
                '<p class="trail-details"><span class="detail-label">' +
                'Description:</span> ' + findBestDescription(place.activities) + '</p>' +
                '<p class="trail-directions"><span class="detail-label">Directions:</span> ' +
                place.directions + '</p></div></div>');

        });
    } else {
        $('.js-search-results').append('<p>Sorry, no trails found</p>');
    }
}



//set the weather for past days
function displayHistWeatherData(data) {
    //city/state and lat/long are inaccurate
    if (data.hasOwnProperty('error')) {
        weatherError = true;
        return;
    };

    var histDay = data.forecast.forecastday[0];
    var weatherStr = '<div class="col"><p>' + dayOfWeekStr(data, histDay.date) + '</p>' +
        '<img src="http:' + histDay.day.condition.icon + '">' +
        '<p>' + histDay.day.condition.text + '</p>' +
        '<ul><li><span>Precipitation:</span> ' + histDay.day.totalprecip_in + '"</li>' +
        '<li><span>Avg Temp:</span> ' + Math.round(histDay.day.avgtemp_f) + '&deg;F</li></ul><div>';

    selectedLocation.find('.js-history').append(weatherStr);
}



//set the current day and next 3 days of weather
function displayForecastData(data) {
    //city/state and lat/long are inaccurate
    if (data.hasOwnProperty('error')) {
        weatherError = true;
        return;
    };

    var todaysForecast = data.forecast.forecastday[0].day;
    var todaysWeather =
        '<p>' + dayOfWeekStr(data, data.forecast.forecastday[0].date) + '</p>' +
        '<p><span>Currently:</span> ' + Math.round(data.current.temp_f) + '&deg;F</p>' +
        '<img src="http:' + todaysForecast.condition.icon + '">' +
        '<p>' + todaysForecast.condition.text + '</p>' +
        '<ul><li><span>High:</span> ' + Math.round(todaysForecast.maxtemp_f) + '&deg;F</li>' +
        // '<li><span>Feels Like:</span ' + Math.round(todaysForecast.feelslike_f) + '&deg;F</li>' +
        '<li><span>Low:</span> ' + Math.round(todaysForecast.mintemp_f) + '&deg;F</li>' +
        '<li><span>Humidity:</span> ' + data.current.humidity + '%</li>' +
        '<li><span>Precipitation:</span> ' + todaysForecast.totalprecip_in + '"</li>' +
        '<li><span>Wind:</span> ' + data.current.wind_mph + ' mph</li></ul>';

    $('.current-weather').append(todaysWeather);


    var forecastDays = data.forecast.forecastday
    var forecastWeather = '';

    for (var i = 1; i < forecastDays.length; i++) {
        forecastWeather += '<div class="col"><p>' + dayOfWeekStr(data, forecastDays[i].date) + '</p>' +
            '<img src="http:' + forecastDays[i].day.condition.icon + '">' +
            '<p>' + forecastDays[i].day.condition.text + '</p>' +
            '<ul><li><span>High:</span> ' + Math.round(forecastDays[i].day.maxtemp_f) + '&deg;F</li>' +
            '<li><span>Low:</span> ' + Math.round(forecastDays[i].day.mintemp_f) + '&deg;F</li>' +
            '<li><span>Precipitation:</span> ' + forecastDays[i].day.totalprecip_in + '"</li>' +
            '<li><span>Wind:</span> ' + forecastDays[i].day.maxwind_mph + ' mph</li></ul></div>';
    };
    console.log(forecastWeather);
    $('.js-forecast').append(forecastWeather);
}



function getWeatherData(locObj) {
    selectedLocation = locObj;

    locObj.append('<section class="weather-details"><header>Weather for this trail:</header>' + 
        '<div class="current-weather"></div>' +
        //'<h4>Will it be muddy? This is the weather for the last 3 days</h4>' +
        '<div class="row"><div class="js-history hist-weather"></div></div>' + 
        //'<h4>Here\'s the weather for the next 3 days</h4>' +
        '<div class="row"><div class="js-forecast forecast-weather"></div></div></section>');

    //weather 3 days ago
    var threeDaysAgo = new Date();
    threeDaysAgo.setDate(today.getDate() - 3);
    getDataFromWeatherApi(locObj.data(), 'history', '&dt=' + formatDateForAPI(threeDaysAgo), displayHistWeatherData);

    //weather 2 days ago
    var twoDaysAgo = new Date();
    twoDaysAgo.setDate(today.getDate() - 2);
    getDataFromWeatherApi(locObj.data(), 'history', '&dt=' + formatDateForAPI(twoDaysAgo), displayHistWeatherData);

    //weather yesterday
    getDataFromWeatherApi(locObj.data(), 'history', '&dt=' + relativeDayName[0].dateStr, displayHistWeatherData);
    
    //curent weather and forecast for next 4 days (including today)
    getDataFromWeatherApi(locObj.data(), 'forecast', '&days=4', displayForecastData);


    if (weatherError) {
        locObj.find($('.weather-details')).text('Sorry. No weather information available.');
        weatherError = false; //reset
    }
}



// Event Listeners
function watchSubmit() {
    $('.js-search-form').submit(function(event) {
        event.preventDefault();
        $('.js-search-results').empty(); //any previous results

        var activityDate = $('.js-date').val();
        getDataFromTrailApi(displaySearchData);
    });
}



$(document).ready(function() {

    today = new Date();
    var yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    var tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    relativeDayName = [{ dayStr: 'Yesterday', dateStr: formatDateForAPI(yesterday) },
        { dayStr: 'Today', dateStr: formatDateForAPI(today) },
        { dayStr: 'Tomorrow', dateStr: formatDateForAPI(tomorrow) }
    ];

    watchSubmit();

    //Expand the result
    $(document).on('click', '.small', function(event) {

        if ($(this).hasClass('has-details')) {
            $(this).addClass('big');
            $(this).removeClass('small');

        } else {
            //if result is not already expanded
            if (!$('.result').hasClass('big')) {
                $(this).addClass('big');
                $(this).removeClass('small');
                $(this).addClass('has-details');

                getWeatherData($(this));
            }
        }
    });



    //Collapse the result
    // $(document).on('click', '.result-header', function() {
    $(document).on('click', '.big', function() {
        // $('.result-location').nextAll().remove();

        $(this).addClass('small');
        $(this).removeClass('big');
    });
});
