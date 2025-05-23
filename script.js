const apiKey = "3a04abfc9ecc0e6b8728a709e6c82780"; 

document.getElementById("searchButton").addEventListener("click", fetchWeather);
document.getElementById("unitSelect").addEventListener("change", fetchWeather);
document.getElementById("darkModeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

function fetchWeather() {
  const city = document.getElementById("cityInput").value.trim();
  const unit = document.getElementById("unitSelect").value;

  if (!city) return alert("Please enter a city name.");

  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${unit}`;
  fetch(weatherUrl)
    .then(res => res.json())
    .then(data => {
      displayCurrentWeather(data, unit);
      fetchForecast(city, unit);
      fetchAirData(data.coord.lat, data.coord.lon);
    })
    .catch(err => {
      document.getElementById("weatherInfo").innerHTML = `<div style="color:red;">Error: ${err.message}</div>`;
    });
}

function displayCurrentWeather(data, unit) {
  const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  document.getElementById("icon").innerHTML = `<img src="${iconUrl}" alt="Icon">`;
  document.getElementById("city").textContent = `📍 ${data.name}, ${data.sys.country}`;
  document.getElementById("temp").textContent = `🌡 Temp: ${data.main.temp} ${unit === "metric" ? "°C" : "°F"}`;
  document.getElementById("humidity").textContent = `💧 Humidity: ${data.main.humidity}%`;
  document.getElementById("wind").textContent = `💨 Wind: ${data.wind.speed} ${unit === "metric" ? "m/s" : "mph"}`;
  document.getElementById("visibility").textContent = `👁 Visibility: ${data.visibility / 1000} km`;
}

function fetchForecast(city, unit) {
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${unit}`;
  fetch(forecastUrl)
    .then(res => res.json())
    .then(data => {
      displayHourlyForecast(data.list.slice(0, 6), unit);
      displayDailyForecast(data.list, unit);
    });
}

function displayHourlyForecast(list, unit) {
  const container = document.getElementById("hourlyForecast");
  container.innerHTML = "";

  list.forEach(item => {
    const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    container.innerHTML += `
      <div class="forecast-card">
        <div>${time}</div>
        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="">
        <div>${item.main.temp} ${unit === "metric" ? "°C" : "°F"}</div>
      </div>
    `;
  });
}

function displayDailyForecast(list, unit) {
  const container = document.getElementById("dailyForecast");
  container.innerHTML = "";

  const dailyMap = {};
  list.forEach(item => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    if (!dailyMap[date]) dailyMap[date] = [];
    dailyMap[date].push(item);
  });

  Object.entries(dailyMap).slice(0, 5).forEach(([date, entries]) => {
    const avgTemp = (entries.reduce((sum, e) => sum + e.main.temp, 0) / entries.length).toFixed(1);
    const icon = entries[0].weather[0].icon;
    container.innerHTML += `
      <div class="forecast-card">
        <div>${date}</div>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="">
        <div>${avgTemp} ${unit === "metric" ? "°C" : "°F"}</div>
      </div>
    `;
  });
}

function fetchAirData(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const aqi = data.list[0].main.aqi;
      const uviUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
      document.getElementById("airQuality").textContent = `🌫 Air Quality Index: ${aqi}`;

      
      fetch(uviUrl)
        .then(res => res.json())
        .then(uviData => {
          document.getElementById("uvIndex").textContent = `☀ UV Index: ${uviData.value}`;
        });
    });
}
