import { ICON_MAP } from "./iconMap.js"

export function getWeather(lat, lon, timezone) {
    return fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=${timezone}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&hourly=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation`
    )
        .then(res => res.json())
        .then(data => {
            return {
                current: parseCurrentWeather(data),
                daily: parseDailyWeather(data),
                hourly: parseHourlyWeather(data)
            }
        })
}

function parseCurrentWeather(data) {
    const { 
        temperature_2m: temp,
        weather_code: code,
        wind_speed_10m: windSpeed
    } = data.current

    const { 
        temperature_2m_max: maxTemp,
        temperature_2m_min: minTemp,
        apparent_temperature_max: maxFeelsLike,
        apparent_temperature_min: minFeelsLike,
        precipitation_sum: precip
    } = data.daily.time.length > 0 ? {
        temperature_2m_max: data.daily.temperature_2m_max[0],
        temperature_2m_min: data.daily.temperature_2m_min[0],
        apparent_temperature_max: data.daily.apparent_temperature_max[0],
        apparent_temperature_min: data.daily.apparent_temperature_min[0],
        precipitation_sum: data.daily.precipitation_sum[0]
    } : {}

    return {
        currentTemp: Math.round(temp),
        highTemp: Math.round(maxTemp),
        lowTemp: Math.round(minTemp),
        highFeelsLike: Math.round(maxFeelsLike),
        lowFeelsLike: Math.round(minFeelsLike),
        windSpeed: Math.round(windSpeed),
        precip: Math.round(precip * 100) / 100,
        iconCode: code
    }
}

function parseDailyWeather(data) {
    return data.daily.time.map((time, index) => {
        return {
            timestamp: new Date(time),
            iconCode: data.daily.weather_code[index],
            maxTemp: Math.round(data.daily.temperature_2m_max[index]),
            minTemp: Math.round(data.daily.temperature_2m_min[index])
        }
    }).slice(0, 7)
}

function parseHourlyWeather(data) {
    return data.hourly.time.map((time, index) => {
        return {
            timestamp: new Date(time),
            iconCode: data.hourly.weather_code[index],
            temp: Math.round(data.hourly.temperature_2m[index]),
            feelsLike: Math.round(data.hourly.apparent_temperature[index]),
            windSpeed: Math.round(data.hourly.wind_speed_10m[index]),
            precip: Math.round(data.hourly.precipitation[index] * 100) / 100
        }
    }).slice(0, 24)
}
