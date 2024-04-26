document.getElementById("zipForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const zipCode = document.getElementById("zipCode").value;

    fetchLongitudeLatitude(zipCode)
    .then(coordinates => {
        return getCurrentWeather(coordinates.longitude, coordinates.latitude);
    })
    .then(weatherData => {
        displayWeather(weatherData);
    })
    .catch(error => {
        console.error("Error: ", error);
        document.getElementById("result").innerHTML = "Error" + error.message;
    })
})

function fetchLongitudeLatitude(zipCode){
    return fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${zipCode}`)
        .then(response => {
            if(!response.ok){
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Data received from API:", data);
            if(data.results.length > 0){
                const location = data.results[0];
                console.log(location.latitude);
                console.log(location.longitude);
                return {
                    latitude: location.latitude,
                    longitude: location.longitude
                };
            } else{
                throw new Error(`No location found for the provided zip code "${zipCode}".`);
            }
        })
        .catch(error => {
            console.error('Error fetching location data: ', error);
            if(error instanceof TypeError && error.message === "Failed to fetch") {
                throw new Error('Network error occurred. Please check your internet connection.');
            } else {
                throw new Error('An unexpected error occurred while fetching location data.');
            }
        });
}


function getCurrentWeather(longitude, latitude){
    return fetch(`https://api.open-meteo.com/v1/gfs?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,precipitation,rain,showers,snowfall&timezone=America%2FNew_York`)
    .then(response => {
        if(!response.ok){
            throw new Error(`HTTP error! Status: ${response.error}`);
        }
        return response.json();
    })
    .catch(error => {
        console.error("Cannot retrieve weather data: ", error);
        throw error;
    });
}


function displayWeather(weatherData){
    try{
        const currentWeather = weatherData.current;

        //calculating temp in both celsius and fahrenheit
        const currenttemperatureCelsius = currentWeather.temperature_2m;
        const currenttemperateFahrenheit = Math.round((currenttemperatureCelsius* (9/5)) + 32);
        const currApparentCelsius = currentWeather.apparent_temperature;
        const currApparentFahrenheit = Math.round((currApparentCelsius* (9/5)) + 32);

        const weatherInfo = `
            <h2>Current Weather</h2>
            <p>Temperature: ${currenttemperatureCelsius}°C (${currenttemperateFahrenheit}°F)</p>
            <p>Apparent Temperature: ${currApparentCelsius}°C (${currApparentFahrenheit}°F)</p>
            <p>Precipitation: ${currentWeather.precipitation} mm</p>
            <p>Rain: ${currentWeather.rain} mm</p>
            <p>Showers: ${currentWeather.showers} mm</p>
            <p>Snowfall: ${currentWeather.snowfall} cm</p>
        `;

        document.getElementById("result").innerHTML = weatherInfo;
    } catch(error){
        console.error("Error displaying error: ", error);
        console.log("Weather data: ", weatherData);
        document.getElementById("result").innerHTML = "<p>An error occurred while displaying weather data</p>"
    }
}