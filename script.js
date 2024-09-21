const userLocation = document.getElementById("userLocation"),
    converter = document.getElementById("converter"),
    weatherIcon = document.querySelector(".weatherIcon"),
    temperature = document.querySelector(".temperature"),
    feelsLike = document.querySelector(".feelsLike"),
    description = document.querySelector(".description"),
    date = document.querySelector(".date"),
    city = document.querySelector(".city"),
    HValue = document.getElementById("HValue"),
    WValue = document.getElementById("WValue"),
    SRValue = document.getElementById("SRValue"),
    SSValue = document.getElementById("SSValue"),
    CValue = document.getElementById("CValue"),
    UVValue = document.getElementById("UVValue"),
    PValue = document.getElementById("PValue"),
    Forecast = document.querySelector(".Forecast");

const APIKEY = '64f2301c872493dfd69bc2a5d94d5a70';
const WEATHER_API_ENDPOINT = `https://api.openweathermap.org/data/2.5/weather?appid=${APIKEY}&q=`;
const WEATHER_DATA_ENDPOINT = `https://api.openweathermap.org/data/3.0/onecall?appid=${APIKEY}&exclude=minutely&units=metric&`;
const REVERSE_GEO_ENDPOINT = `https://api.openweathermap.org/geo/1.0/reverse?lat={lat}&lon={lon}&limit=1&appid=${APIKEY}`;

// Listen for the "Enter" key on the input field
userLocation.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        findUserLocation();
    }
});

// Event listener for temperature unit change
converter.addEventListener("change", findUserLocation);

function findUserLocation() {
    Forecast.innerHTML = "";
    const locationInput = userLocation.value.trim();

    if (locationInput === "") {
        getCurrentLocation();
    } else {
        fetchWeatherByCity(locationInput);
    }
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetch(REVERSE_GEO_ENDPOINT.replace('{lat}', latitude).replace('{lon}', longitude))
                    .then(response => response.json())
                    .then(data => {
                        city.innerHTML = data.length > 0 ? data[0].name : "Unknown location";
                        fetchWeatherData(longitude, latitude);
                    })
                    .catch(error => {
                        console.error("Error with reverse geocoding:", error);
                        city.innerHTML = "Unknown location";
                    });
            },
            () => alert("Unable to retrieve your location. Please allow location access.")
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function fetchWeatherByCity(cityName) {
    fetch(WEATHER_API_ENDPOINT + cityName)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) {
                alert(data.message);
                return;
            }
            city.innerHTML = data.name;
            fetchWeatherData(data.coord.lon, data.coord.lat);
        })
        .catch(err => {
            console.error(err);
            alert("Error fetching data. Please try again.");
        });
}

function fetchWeatherData(lon, lat) {
    fetch(WEATHER_DATA_ENDPOINT + `lon=${lon}&lat=${lat}`)
        .then(response => response.json())
        .then(data => {
            if (data.cod && data.cod !== 200) {
                alert(data.message);
                return;
            }
            displayCurrentWeather(data);
            displayForecast(data.daily);
        });
}

function displayCurrentWeather(data) {
    weatherIcon.style.background = `url(https://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png)`;
    temperature.innerHTML = TemConverter(data.current.temp);
    feelsLike.innerHTML = "Feels like " + TemConverter(data.current.feels_like);
    description.innerHTML = `<i class="fa-brands fa-cloudversify"></i> &nbsp;${data.current.weather[0].description}`;

    const options1 = { hour: "numeric", minute: "numeric", hour12: true };
    date.innerHTML = getLongFormateDateTime(data.current.dt, data.timezone_offset, options1);
    HValue.innerHTML = Math.round(data.current.humidity) + "<span>%</span>";
    WValue.innerHTML = Math.round(data.current.wind_speed) + "<span>m/s</span>";
    SRValue.innerHTML = getLongFormateDateTime(data.current.sunrise, data.timezone_offset, options1);
    SSValue.innerHTML = getLongFormateDateTime(data.current.sunset, data.timezone_offset, options1);
    CValue.innerHTML = data.current.clouds + "<span>%</span>";
    UVValue.innerHTML = data.current.uvi;
    PValue.innerHTML = data.current.pressure + "<span>hPa</span>";
}

function displayForecast(dailyData) {
    dailyData.forEach(weather => {
        let div = document.createElement("div");
        const options = { weekday: 'long', month: 'long', day: "numeric" };
        const dailyDate = getLongFormateDateTime(weather.dt, 0, options).split(" at ")[0];
        div.innerHTML = `
            ${dailyDate}
            <img src="https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png"/>
            <p class="forecast-desc">${weather.weather[0].description}</p>
            <span>
                <span>${TemConverter(weather.temp.min)}</span>
                &nbsp;&nbsp;
                <span>${TemConverter(weather.temp.max)}</span>
            </span>`;
        Forecast.append(div);
    });
}

function formatUnixTime(dtValue, offset, options = {}) {
    const dateObj = new Date((dtValue + offset) * 1000);
    return dateObj.toLocaleTimeString([], { timeZone: "UTC", ...options });
}

function getLongFormateDateTime(dtValue, offset, options) {
    return formatUnixTime(dtValue, offset, options);
}

function TemConverter(temp) {
    let tempValue = Math.round(temp);
    return converter.value === "°C" 
        ? `${tempValue}<span>°C</span>` 
        : `${(tempValue * 9) / 5 + 32}<span>°F</span>`;
}

findUserLocation();
