import { ICON_MAP } from "./iconMap.js"

export function getWeather(lat, lon, timezone) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=${timezone}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&hourly=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation`
  
  console.log("🌐 Fetching from:", url)
  
  return fetch(url)
    .then(res => {
      console.log("📡 Response status:", res.status)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
    .then(data => {
      console.log("📊 API data received", data)
      return {
        current: parseCurrentWeather(data),
        daily: parseDailyWeather(data),
        hourly: parseHourlyWeather(data)
      }
    })
}

function parseCurrentWeather(data) {
  const { temperature_2m: temp, weather_code: code, wind_speed_10m: windSpeed } = data.current
  const today = data.daily
  
  return {
    currentTemp: Math.round(temp),
    highTemp: Math.round(today.temperature_2m_max[0]),
    lowTemp: Math.round(today.temperature_2m_min[0]),
    highFeelsLike: Math.round(today.apparent_temperature_max[0]),
    lowFeelsLike: Math.round(today.apparent_temperature_min[0]),
    windSpeed: Math.round(windSpeed),
    precip: Math.round(today.precipitation_sum[0] * 100) / 100,
    iconCode: code
  }
}

function parseDailyWeather(data) {
  return data.daily.time.map((time, i) => ({
    timestamp: new Date(time),
    iconCode: data.daily.weather_code[i],
    maxTemp: Math.round(data.daily.temperature_2m_max[i])
  })).slice(0, 7)
}

function parseHourlyWeather(data) {
  return data.hourly.time.map((time, i) => ({
    timestamp: new Date(time),
    iconCode: data.hourly.weather_code[i],
    temp: Math.round(data.hourly.temperature_2m[i]),
    feelsLike: Math.round(data.hourly.apparent_temperature[i]),
    windSpeed: Math.round(data.hourly.wind_speed_10m[i]),
    precip: Math.round(data.hourly.precipitation[i] * 100) / 100
  })).slice(0, 24)
}
