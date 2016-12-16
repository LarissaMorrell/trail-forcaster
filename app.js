var BASE_TRAIL_URL = 'https://trailapi-trailapi.p.mashape.com/';
var BASE_WEATHER_URL = 'http://api.apixu.com/v1/search.json?key=245141566e984e7e9de230727161012';
var activityDate;

function getDataFromTrailApi(cityQuery, stateQuery, callback) {
    $.ajax({
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
    });
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



function getDataFromWeatherApi(callback) { //also pass in lat/long param from search result
    

    var settings = {
        url: BASE_WEATHER_URL + '&q=' + $('.js-query').val(),
        dataType: 'json',
        data: {},
        type: 'GET',
        success: callback
    };

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


// Render functions

function displaySearchData(data) {
    if (data.places.length > 0) {
        data.places.forEach(function(place) {

            $('.js-search-results').append('<div class="result small">' +
                '<div class="result-name">' + place.name + '</div>' +
                '<div class="result-location">' + place.city + ', ' + place.state + '</div>' +
                '</div>');
        });
    } else {
        $('.js-search-results').append('<p>Sorry, no trails found</p>');
    }

}


function displayWeatherData(latitude, longitude) {
    var resultElement = data.current.temp_f + " degrees currently";



    $('.js-search-results').html(resultElement);
}



// Event Listeners

function watchSubmit() {
    $('.js-search-form').submit(function(event) {
        event.preventDefault();
        $('.js-search-results').empty(); //any previous results

        activityDate = $('.js-date').val();

        var stateQuery = $(this).find('.js-state').val();
        var cityQuery = $(this).find('.js-city').val();

        getDataFromTrailApi(cityQuery, stateQuery, displaySearchData);
        //getDataFromWeatherApi(query, displayWeatherData)

    });
}

// function selectCity() {

// $('.result').on('click', function() {
//     event.preventDefault();
//     $(this).addClass('.open');
// });

// $('.result').click(function(event) {
//     event.preventDefault();
//     $(this).addClass('.open');
// });
// }

// $(document).ready(function(){
//     $(document).on('click', '.small a', function(){
//         $('.small').addClass('big');
//         $('.small').removeClass('small');
//     });
//     $(document).on('click', '.big a', function(){
//         $('.big').addClass('small');
//         $('.big').removeClass('big');
//     });
// });


$(document).ready(function(){
    var now = new Date();
    var date = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();

    $('.js-date').val(date);

    watchSubmit();

    // $(document).on("click", "div.result", function() {
    //     $(this).addClass('.open');
    // });

    $(this).on('click', '.small', function(){
        $('.small').addClass('big');
        $('.small').removeClass('small');
    });
    $(this).on('click', '.big', function(){
        $('.big').addClass('small');
        $('.big').removeClass('big');
    });
});
