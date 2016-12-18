var BASE_TRAIL_URL = 'https://trailapi-trailapi.p.mashape.com/';
var BASE_WEATHER_URL = 'http://api.apixu.com/v1/';
var activityDate;
var dateTense;

function getDataFromTrailApi(cityQuery, stateQuery, callback) {
    var data = {
        url: BASE_TRAIL_URL + getEndpoints(cityQuery, stateQuery), // The URL to the API. You can get this in the API page of the API you intend to consume
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


function getEndpoints(cityQuery, stateQuery) {
    var endString = '';

    if (cityQuery.length > 0) {
        endString += '?q[city_cont]=' + cityQuery +
            '&q[state_cont]=' + stateQuery;
    } else {
        endString += '?q[state_cont]=' + stateQuery;
    }

    return endString;
}



function getDataFromWeatherApi(locObj, callback) { //also pass in lat/long param from search result

    setDateTense();

    var settings = {
        url: BASE_WEATHER_URL + dateTense +
            '.json?key=245141566e984e7e9de230727161012&q=' +  locObj.lat+
            ',' + locObj.lon,
        dataType: 'json',
        data: {},
        type: 'GET',
        success: callback
    };

    console.log(settings.url);

    $.ajax(settings);
}



function setDateTense() {
    //convert the 2 string into a Date???
    //then compare and 
    var today = todaysDate;

    if (activityDate < today) {
        dateTense = 'history';
    } else if (activityDate == today) {
        dateTense = 'current';
    } else {
        dateTense = 'forecast';
    };
}



function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function todaysDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    return yyyy + '-' + mm + '-' + dd;
}


// Render functions

function displaySearchData(data) {
    if (data.places.length > 0) {
        data.places.forEach(function(place) {

            $('.js-search-results').append('<div class="result small"' + 
                'data-lat="' + place.lat + '" data-lon="' + place.lon + '">' +
                '<div class="result-name">' + place.name + '</div>' +
                '<div class="result-location">' + place.city + ', ' + place.state + '</div></div>');
        });
    } else {
        $('.js-search-results').append('<p>Sorry, no trails found</p>');
    }

}

function displayTrailData(data){

}


function displayWeatherData(SearchLocation) {


}



// Event Listeners

function watchSubmit() {
    $('.js-search-form').submit(function(event) {
        event.preventDefault();
        $('.js-search-results').empty(); //any previous results

        activityDate = $('.js-date').val();

        var stateQuery = $(this).find('.js-state').val();
        var cityQuery = $(this).find('.js-city').val();

        // var SearchLocation = 
        getDataFromTrailApi(cityQuery, stateQuery, displaySearchData);
        // console.log(typeof SearchLocation);
        // getDataFromWeatherApi(SearchLocation);
        // getDataFromWeatherApi();
    });
}



$(document).ready(function() {
    var now = new Date();
    var date = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();

    //set the value of element to today's date on load
    $('.js-date').val(date);

    watchSubmit();

    $(document).on('click', '.small', function(event) {
        $(this).addClass('big');
        $(this).removeClass('small');
        alert("lon: " + $(this).data('lon') + "lat: " + $(this).data('lat'));
        getDataFromWeatherApi($(this).data(), displayWeatherData);
    });
    $(document).on('click', '.big', function() {
        $(this).addClass('small');
        $(this).removeClass('big');
    });
});
