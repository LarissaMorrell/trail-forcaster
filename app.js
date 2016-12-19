var BASE_TRAIL_URL = 'https://trailapi-trailapi.p.mashape.com/';
var BASE_WEATHER_URL = 'http://api.apixu.com/v1/';
var activityDate;
//make an object for historic and forecasted data?

function getDataFromTrailApi(callback) {
    var data = {
        url: BASE_TRAIL_URL + getEndpoints(), // The URL to the API. You can get this in the API page of the API you intend to consume
        type: 'GET',
        data: {}, // Additional parameters here
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




function getEndpoints() {
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



function getDataFromWeatherApi(locObj, dateTense, endpoint, callback) { //also pass in lat/long param from search result

    var settings = {
        url: BASE_WEATHER_URL + dateTense +
            '.json?key=245141566e984e7e9de230727161012&q=' + locObj.lat +
            ',' + locObj.lon + endpoint,
        dataType: 'json',
        data: {},
        type: 'GET',
        success: callback
    };

    console.log(dateTense + ' weather: ' + settings.url);

    $.ajax(settings);
}



// function setDateTense() {
//     //convert the 2 string into a Date???
//     //then compare and 
//     var today = todaysDate;

//     if (activityDate < today) {
//         dateTense = 'history';
//     } else if (activityDate == today) {
//         dateTense = 'current';
//     } else {
//         dateTense = 'forecast';
//     };
// }



function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

// function todaysDate() {
//     var today = new Date();
//     var dd = today.getDate();
//     var mm = today.getMonth() + 1; //January is 0!

//     var yyyy = today.getFullYear();
//     if (dd < 10) {
//         dd = '0' + dd
//     }
//     if (mm < 10) {
//         mm = '0' + mm
//     }
//     return yyyy + '-' + mm + '-' + dd;
// }


// Render functions

function displaySearchData(data) {
    if (data.places.length > 0) {
        data.places.forEach(function(place) {

            $('.js-search-results').append('<div class="result small"' +
                'data-lat="' + place.lat + '" data-lon="' + place.lon + '" ' +
                'data-city="' + place.city + '" data-state="' + place.state + '">' +
                '<div class="result-name">' + place.name + '</div>' +
                '<div class="result-location">' + place.city + ', ' + place.state + '</div></div>');
        });

    } else {
        $('.js-search-results').append('<p>Sorry, no trails found</p>');
    }

}



// but how do I target what activity it is that was selected when API is called again??????
function displayTrailData(data) {
    var trailObj = data.places.activities;

    //for every activity in the city    --- no there are multiple city objects....
    // for (var x = 0; x < trailObj.length; x++) {

    //if the place id matches, then append ---> store place id in data???

    var trailSection = '<div class="trail-details">Description: ' +
        trailObj.description + '</p>' +
        '<p>See more about this trail: <a href="' + trailObj.url + '>Click here!</a></p>' +
        '</div>';
    // }

    return trailSection;
}


//display the previous 3 days of weather
function displayHistoricWeatherData(data) {
    var forecastDays = data.forecast.forecastday;

    for (var i = 0; i < forecastDays.length; i++) {
        $('.big').append('<p>Rainfall: ' + forecastDays[i].day.totalprecip_in + ' inches</p>');
    }
}

//display the current day and next 3 days of weather
function displayWeatherData(data) {
    var forecastDays = data.forecast.forecastday;

    //display the last 3 days rainfall/snow/temp
    for (var i = 0; i < forecastDays.length; i++) {
        $('.big').append("<p>Working... " + forecastDays[i].day.maxtemp_f + "degrees</p>");
    }
    //display the next 4 days temp/rainfall/snow/wind

}

function expandResult(locObj) {
    $('.big').append('<section>' +
        // getDataFromTrailApi(locObj.city, locObj.state, displayTrailData) +
        '<div class="weather-details"></div></section>');

    getDataFromTrailApi($(this).data('city'), $(this).data('state'), displayTrailData);

    //need help getting the date 3 days prior to the current date!!!!
    getDataFromWeatherApi(locObj.data(), 'history', '&days=3&dt=2016-12-15', displayHistoricWeatherData);
    // getDataFromWeatherApi(locObj.data(), 'history', '&dt=2016-12-16', displayHistoricWeatherData);
    // getDataFromWeatherApi(locObj.data(), 'history', '&dt=2016-12-17', displayHistoricWeatherData);
    getDataFromWeatherApi(locObj.data(), 'forecast', '&days=3', displayWeatherData);
}



// Event Listeners

function watchSubmit() {
    $('.js-search-form').submit(function(event) {
        event.preventDefault();
        $('.js-search-results').empty(); //any previous results

        activityDate = $('.js-date').val();

        getDataFromTrailApi(displaySearchData);
    });
}



$(document).ready(function() {
    var now = new Date();
    var date = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    console.log(typeof date + ' is the date');
    //set the value of element to today's date on load
    $('.js-date').val(date);


    watchSubmit();

    //Expand the result
    $(document).on('click', '.small', function(event) {
        $(this).addClass('big');
        $(this).removeClass('small');

        expandResult($(this));
    });



    //Collapse the result
    $(document).on('click', '.big', function() {
        $('.result-location').nextAll().remove();

        $(this).addClass('small');
        $(this).removeClass('big');
    });
});
