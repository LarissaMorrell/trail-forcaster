var BASE_URL = 'https://trailapi-trailapi.p.mashape.com/';

function getDataFromTrailApi(searchTerm, callback) {
    var settings = {
        url: BASE_URL + 'q[city_cont]=' + $('.js-query').val(),
        dataType: 'json',
        data: {
            X-Mashape-Key: 'IvhvrcGpoQmshzCYWrW3TPwJKMKip1PjW0Mjsnde60lb1SyWES',
            Accept: 'text/plain'
        },
        type: 'GET',
        success: callback
    };
    $.ajax(settings);
}

function getDataFromWeatherApi(){
    
}



function getUserTarget(){
    //retrieve the location the user wants to search
    //use switch case??? for text boxes
}

function displaySearchData(data) {
    var resultElement = '';
    if (data.places.length > 0) {
        data.places.forEach(function(place) {
            
            resultElement += '<p>' +  place.city + '</p>';
        });
    } else {
        resultElement += '<p>no cities found</p>';
    }

    $('.js-search-results').html(resultElement);
}

function watchSubmit() {
    $('.js-search-form').submit(function(event) {
        event.preventDefault();
        var query = $(this).find('.js-query').val();
        getDataFromTrailApi(query, displaySearchData);
    });
}

$(function() { watchSubmit(); });
