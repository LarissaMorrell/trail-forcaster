var BASE_TRAIL_URL = 'https://trailapi-trailapi.p.mashape.com/';
var BASE_WEATHER_URL = 'http://api.apixu.com/v1/';
// var Weather = new Object(); //contains historic and forecasted weather data
var weatherError = false;
var today;
var relativeDayName;

//pasted
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



//pasted
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
    // console.log(apiType + ' weather: ' + settings.url);
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


function findBestDirections(data) {
    var longStr = "";
    for (var i = 0; i < data.places.length; i++) {

        if (data.places[i].directions == null) {
            continue;
        }
        if (data.places[i].directions.length > longStr.length) {
            longStr = data.places[i].directions;
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
        //use dayOfWeek
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
                // '<header class="result-header"><div class="result-name">' + place.name + '</div>' +
                // '<div class="result-location">' + place.city + ', ' + place.state + '</div></header></div>');
                '<div class="result-name">' + place.name + '</div>' +
                '<div class="result-location">' + place.city + ', ' + place.state + '</div>' +
                '<p class="trail-details"><span class="detail-label">' +
                'Description:</span> ' + findBestDescription(data) + '</p>' +
                '<p class="trail-directions"><span class="detail-label">Directions:</span> ' +
                findBestDirections(data) + '</p>' +
                //Add the weather section
                // '<section class="weather-details"><p>Weather for this trail:</p></section></div></div>');
                '</div></div>');

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
    var weatherStr = '<p>' + dayOfWeekStr(data, histDay.date) + '</p>' +
        '<img src="http:' + histDay.day.condition.icon + '">' +
        '<p>' + histDay.day.condition.text + '</p>' +
        '<ul><li><span>Precipitation:</span> ' + histDay.day.totalprecip_in + '</li>' +
        '<li><span>Temp:</span> ' + histDay.day.avgtemp_f + '</li></ul>';

    $('.weather-details').append(weatherStr);
}



//set the current day and next 3 days of weather
function displayForecastData(data) {
    //city/state and lat/long are inaccurate
    if (data.hasOwnProperty('error')) {
        weatherError = true;
        return;
    };

    var todaysForecast = data.forecast.forecastday[0].day;
    var todaysWeather = '<div class = "current-weather">' +
        '<p>' + dayOfWeekStr(data, data.forecast.forecastday[0].date) + '</p>' +
        '<p><span>Currently: ' + data.current.temp_f + '</p>' +
        '<img src="http:' + todaysForecast.condition.icon + '">' +
        '<p>' + todaysForecast.condition.text + '</p>' +
        '<ul><li><span>High:</span> ' + todaysForecast.maxtemp_f + '</li>' +
        '<li><span>Feels Like:</span ' + todaysForecast.feelslike_f + '</li>' +
        '<li><span>Low:</span> ' + todaysForecast.mintemp_f + '</li>' +
        '<li><span>Humidity:</span> ' + data.current.humidity + '</li>' +
        '<li><span>Precipitation:</span> ' + todaysForecast.totalprecip_in + '</li>' +
        '<li><span>Wind:</span> ' + data.current.wind_mph + ' mph</li></ul></div>';

    $('.weather-details').append(todaysWeather);


    var forecastDays = data.forecast.forecastday
    var forecastWeather = '';

    console.log(forecastDays.length + ' is how many forecasted days');
    for (var i = 1; i < forecastDays.length; i++) {
        forecastWeather = '<p>' + dayOfWeekStr(data, forecastDays[i].date) + '</p>' +
            '<img src="http:' + forecastDays[i].day.condition.icon + '">' +
            '<p>' + forecastDays[i].day.condition.text + '</p>' +
            '<ul><li><span>High:</span> ' + forecastDays[i].day.maxtemp_f + '</li>' +
            '<li><span>Low:</span> ' + forecastDays[i].day.mintemp_f + '</li>' +
            '<li><span>Precipitation:</span> ' + forecastDays[i].day.totalprecip_in + '</li>' +
            '<li><span>Wind:</span> ' + forecastDays[i].day.maxwind_mph + ' mph</li></ul>';
    };
    console.log(forecastWeather);
    $('.weather-details').append(forecastWeather);


    //     Weather[forecastedDate] = {
    //         totalprecip_in: forecastDays[i].day.totalprecip_in,
    //         maxtemp_f: forecastDays[i].day.maxtemp_f,
    //         mintemp_f: forecastDays[i].day.mintemp_f,
    //         avgtemp_f: forecastDays[i].day.avgtemp_f,
    //         icon: forecastDays[i].day.condition.icon,
    //         condition: forecastDays[i].day.condition.text,
    //         windSpeed: forecastDays[i].day.maxwind_mph
    //     };

    //     if (i == 1) {
    //         Weather[forecastedDate].dateTense = "Tomorrow";
    //     }

    // console.log(Weather);
    // };

    //add additional properties for today
    // Weather[formatDateForAPI(today)].dateTense = "Today";
    // Weather[formatDateForAPI(today)].humidity = data.current.humidity;
    // Weather[formatDateForAPI(today)].currentlyfeelsLike = data.current.feelslike_f;
}



function getWeatherData(locObj) {

    //Then add the weather to the screen
    $('.big').append('<section class="weather-details"><header>Weather:</header></section>');

    //HELP!!! need promises??? to make sure that they finish in the right order

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


    // HELP!!! Still need to figure out how to make it wait before executing this code
    if (weatherError) {
        locObj.find($('.weather-details')).text('Sorry. No weather information available.');
        weatherError = false; //reset
    }
}



// Event Listeners
//pasted
function watchSubmit() {
    $('.js-search-form').submit(function(event) {
        event.preventDefault();
        $('.js-search-results').empty(); //any previous results

        var activityDate = $('.js-date').val();
        getDataFromTrailApi(displaySearchData);
    });
}


//pasted
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


    // relativeDayName = [formatDateForAPI(yesterday), formatDateForAPI(today), formatDateForAPI(tomorrow)];
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
