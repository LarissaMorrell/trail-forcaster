var BASE_TRAIL_URL = 'https://trailapi-trailapi.p.mashape.com/';
var BASE_WEATHER_URL = 'http://api.apixu.com/v1/search.json?key=245141566e984e7e9de230727161012';
var activityDate;

function getDataFromTrailApi(searchTerm, callback) {
    $.ajax({
        url: BASE_TRAIL_URL + '?q[state_cont]=' + searchTerm, // The URL to the API. You can get this in the API page of the API you intend to consume
        type: 'GET',
        data: {}, // Additional parameters here
        dataType: 'json',
        success: callback, //function(data) { console.dir((data.source)); },
        error: function(err) {
            console.log(err);
            alert("There is an error" + err);
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader("X-Mashape-Authorization", "IvhvrcGpoQmshzCYWrW3TPwJKMKip1PjW0Mjsnde60lb1SyWES");
        }
    });
}





function getDataFromWeatherApi(callback) { //also pass in lat/long param from search result
    var settings = {
        url: BASE_WEATHER_URL + '&q=' + $('.js-query').val(),
        dataType: 'json',
        data: {},
        type: 'GET',
        success: callback
    };

    console.log(activityDate);

    $.ajax(settings);
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

function getUserTarget() {
    //retrieve the location the user wants to search
    //use switch case??? for text boxes
}

function displaySearchData(data) {
    var resultElement = '';
    if (data.places.length > 0) {
        data.places.forEach(function(place) {
            console.log(place.name + ", city " + place.city + ", state " + place.state);

            // resultElement += '<div class="result">' +
            //     '<p><div class="result-name">' + place.name + '</div>' +
            //     '<div class="result-city">' + place.city + '</div>' +
            //     // '<p class="result-city">' + place.city + '</p>' +
            //     '<div class="result-state">' + place.state + '</div></p></div>';
            // // '<p class="result-state">' + place.state + '</p>';

            $('.js-search-results').append('<div class="result">' +
                '<p><div class="result-name">' + place.name + '</div>' +
                '<div class="result-location">' + place.city + ', ' + place.state + '</div>' +
                '</p></div>');
        });
    } else {
        resultElement += '<p>no cities found</p>';
    }

    //$('.js-search-results').html(resultElement);
}


function displayWeatherData(latitude, longitude) {
    var resultElement = data.current.temp_f + " degrees currently";



    $('.js-search-results').html(resultElement);
}



function watchSubmit() {
    $('.js-search-form').submit(function(event) {
        event.preventDefault();
        $('.js-search-results').empty(); //any previous results

        activityDate = $('.js-date').val();

        var query = $(this).find('.js-state').val();
        getDataFromTrailApi(query, displaySearchData);
        getDataFromWeatherApi(query, displayWeatherData)

    });
}

$(function() {
    var now = new Date();
    var date = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();

    $('.js-date').val(date);

    watchSubmit();
});
