import { ICON_MAP } from "./iconMap.js"

/**
 * Fetches weather data from Open-Meteo API
 * @param {number} lat - Latitude of user's location
 * @param {number} lon - Longitude of user's location
 * @param {string} timezone - User's timezone (e.g., 'America/New_York')
 * @returns {Promise} Promise that resolves to { current, daily, hourly } weather objects
 */
export function getWeather(lat, lon, timezone) {
    return fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=${timezone}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&hourly=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation`
    )
        .then(res => res.json())
        .then(data => {
            console.log("API Response:", data)
            // Transform raw API data into our app's format
            return {
                current: parseCurrentWeather(data),
                daily: parseDailyWeather(data),
                hourly: parseHourlyWeather(data)
            }
        })
        .catch(error => {
            console.error("Fetch Error:", error)
            throw error
        })
}

/**
 * Parses current weather from API response
 * Extracts today's temperature, feels-like, wind, and precipitation data
 * @param {object} data - Raw API response from Open-Meteo
 * @returns {object} Current weather object with properties for rendering
 */
function parseCurrentWeather(data) {
    // Destructure current weather values from API response
    const { 
        temperature_2m: temp,
        weather_code: code,
        wind_speed_10m: windSpeed
    } = data.current

    // Destructure today's daily forecast (high/low temps, feels-like, precip)
    // Uses index [0] because it's today's data in the daily arrays
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

    // Return formatted object with rounded values and matching property names
    // that our UI rendering functions expect
    return {
        currentTemp: Math.round(temp),
        highTemp: Math.round(maxTemp),
        lowTemp: Math.round(minTemp),
        highFeelsLike: Math.round(maxFeelsLike),
        lowFeelsLike: Math.round(minFeelsLike),
        windSpeed: Math.round(windSpeed),
        precip: Math.round(precip * 100) / 100, // Convert to 2 decimal places
        iconCode: code // Weather code to map to icon
    }
}

/**
 * Parses daily forecast from API response
 * Extracts 7-day forecast with highs, weather codes, and dates
 * @param {object} data - Raw API response from Open-Meteo
 * @returns {array} Array of daily forecast objects
 */
function parseDailyWeather(data) {
    // Map through each day in the forecast and extract relevant data
    return data.daily.time.map((time, index) => {
        return {
            timestamp: new Date(time), // Convert date string to JavaScript Date object
            iconCode: data.daily.weather_code[index], // Code to look up icon in ICON_MAP
            maxTemp: Math.round(data.daily.temperature_2m_max[index]),
            minTemp: Math.round(data.daily.temperature_2m_min[index])
        }
    }).slice(0, 7) // Only return 7 days of forecast
}

/**
 * Parses hourly forecast from API response
 * Extracts 24-hour forecast with temperature, feels-like, wind, and precipitation
 * @param {object} data - Raw API response from Open-Meteo
 * @returns {array} Array of hourly forecast objects
 */
function parseHourlyWeather(data) {
    // Map through each hour in the forecast and extract relevant data
    return data.hourly.time.map((time, index) => {
        return {
            timestamp: new Date(time), // Convert timestamp string to JavaScript Date object
            iconCode: data.hourly.weather_code[index], // Code to look up icon in ICON_MAP
            temp: Math.round(data.hourly.temperature_2m[index]),
            feelsLike: Math.round(data.hourly.apparent_temperature[index]),
            windSpeed: Math.round(data.hourly.wind_speed_10m[index]),
            precip: Math.round(data.hourly.precipitation[index] * 100) / 100 // Convert to 2 decimal places
        }
    }).slice(0, 24) // Only return 24 hours of forecast
}
