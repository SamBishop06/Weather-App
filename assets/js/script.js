// Weather Display Select Elemnts 
const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city');
const cityName = document.querySelector('#city-name');
const todaysDate = dayjs().format('MM/DD/YYYY');
const forcastContainer = document.querySelector('#forecast-container');
const currentDate = document.querySelector('#current-date');
const weatherIcon = document.querySelector('#weather-icon');
const currentTemp = document.querySelector('#current-temp');
const currentWind = document.querySelector('#current-wind');
currentHumidity = document.querySelector('#current-humid');

// Latitude and Longitude from city search using OpenWeatherMap API
async function fetchGeocodeData(city) {
    const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=c146dbb949e3984d88cf4996c851d1ec`);
    const data = await res.json();
    return({ lat: data[0].lat, lon: data[0].lon});
}

// Current weather data from OpenWeather API
async function fecthCurrentWeatherData(lat, lon) {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=c146dbb949e3984d88cf4996c851d1ec`);
    const data = await res.json();
    return data
}

// Forecast data from openweather API
async function fecthForecastData(lat, lon) {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=c146dbb949e3984d88cf4996c851d1ec`);
    const data = await res.json();
    return data 
    
}   

// Data Display 
function displayWeatherData(data) {
    console.log(data)
    cityName.textContent = data.name;
    currentDate.textContent = ` (${todaysDate})`;
    weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather icon">`;
    currentTemp.textContent = `${data.main.temp} \u00B0F`;
    currentWind.textContent = `${data.wind.speed} MPH`;
    currentHumidity.textContent = `${data.main.humidity} %`;
}

//  adds each forcast day to the container
function displayForecast(data) {
    // 6 am timestamps forcast data 
    const filteredData = data.list.filter(item => dayjs(item.dt_txt).format('HH:mm') === '06:00');
    forcastContainer.innerHTML = '';
    filteredData.forEach(dayData => {
        const forecastDay = createForecastDayElement(dayData);
        forcastContainer.appendChild(forecastDay);
    });
}

// DOM elemnets for the forcast day data 
function createForecastDayElement(dayData) {
    const forecastDay = document.createElement('div');
    forecastDay.classList.add('forecast-day', 'col-12', 'col-lg-2');

    // Store date of forecast data
    const dateElement = document.createElement('p');
    dateElement.textContent = dayjs(dayData.dt_txt).format('MM/DD/YYYY');

    // images for weather icon
    const iconElement = document.createElement('img');
    iconElement.classList.add('icon')
    let iconCode = dayData.weather[0].icon;
    if (iconCode.endsWith('n')) {
        iconCode = iconCode.slice(0, -1) + 'd';
    }
    iconElement.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    iconElement.alt = 'Weather icon';

    // p tag stores the Temp data 
    const tempElement = document.createElement('p');
    tempElement.textContent = `Temp: ${dayData.main.temp}`;

    // p tag that stores Wind data 
    const windElement = document.createElement('p');
    windElement.textContent = `Wind: ${dayData.wind.speed} MPH`;

    // p tag stores Humidity
    const humidityElement = document.createElement('p');
    humidityElement.textContent = `Humidity: ${dayData.main.humidity} %`;

    // Appends each forecast element to forecast day div 
    forecastDay.appendChild(dateElement);
    forecastDay.appendChild(iconElement);
    forecastDay.appendChild(tempElement);
    forecastDay.appendChild(windElement);
    forecastDay.appendChild(humidityElement);
    return forecastDay;
}
// City Button Function allows user to click and see weather for that city 
function createCityButton(city) {
    const Button = document.createElement('li');
    Button.classList.add('city-button');
    Button.textContent = city;
    Button.addEventListener('click', () => {
        getWeatherForCity(city);
    });
    Button.dataset.city = city;
    return Button;
}

// Main Weather Fetch Function
async function getWeatherForCity(city) {
    try {
        const { lat, lon } = await fetchGeocodeData(city);
        const currentWeatherData = await fecthCurrentWeatherData(lat, lon);
        const forecastData = await fecthForecastData(lat, lon);
        console.log(currentWeatherData)

        // calls display to current forecast weather data 
        displayWeatherData(currentWeatherData);
        displayForecast(forecastData);

        // button data from local storage if it exists or creates empty array
        const storedButtons = localStorage.getItem('cityButtons') || '[]';
        const cityButtonsArray = JSON.parse(storedButtons);
        // checks if the citybutton array is included if not creates a new city button for that city 
        if (!cityButtonsArray.includes(city)) {
            cityButtonsArray.push(city);
            localStorage.setItem('cityButtons', JSON.stringify(cityButtonsArray));
            const cityButtonsContainer = document.getElementById('recent-cities');
            cityButtonsContainer.appendChild(createCityButton(city));
        }
    } catch (error) {
        console.error('Error fecthing weather:', error);
    }
}

// loads city buttons list 
window.addEventListener('DOMContentLoaded', () => {
    const storedButtons = localStorage.getItem('cityButtons') || '[]';
    const cityButtonsArray = JSON.parse(storedButtons);

    cityButtonsArray.forEach(city => {
        const button = createCityButton(city);
        const cityButtonsContainer = document.getElementById('recent-cites');
        cityButtonsContainer.appendChild(button);
    });
});

// gets value from the city calls getWeatherForCity function; clears city value from the text 
searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const city = cityInput.value;
    console.log(city)
    await getWeatherForCity(city);
    cityInput.value = ''
});