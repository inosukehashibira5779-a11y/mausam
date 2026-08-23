import "./style.css"
import { getWeather } from "./weather.js"  // ✅ Fixed: Added .js extension
import { ICON_MAP } from "./iconMap.js";

navigator.geolocation.getCurrentPosition(positionSuccess, positionError)

function positionSuccess({ coords }) {
    getWeather(coords.latitude, coords.longitude, Intl.DateTimeFormat().resolvedOptions()
    .timeZone).then(renderWeather).catch(
    e => {
        console.log(e);
        alert("error getting weather.")
    })
}

function positionError() {
    alert("There was an error getting your location. Please allow us to use your location.")
}

function renderWeather({ current, daily, hourly }) {
    renderCurrentWeather(current)
    renderDailyWeather(daily)
    renderHourlyWeather(hourly)
    document.body.classList.remove("blurred")
}    

// ✅ Fixed: Added safety check to prevent crashes if element doesn't exist
function setValue(selector, value, { parent = document } = {}) {
    const element = parent.querySelector(`[data-${selector}]`)
    if (element) {
        element.textContent = value
    }
}

function getIconUrl(iconCode) {
    return `./icons/${ICON_MAP.get(iconCode)}.svg`
}

// ✅ Fixed: Query elements after DOM is ready
let currentIcon

function renderCurrentWeather(current) {
    if (!currentIcon) {
        currentIcon = document.querySelector('[data-current-icon]')
    }
    
    if (currentIcon) {
        currentIcon.src = getIconUrl(current.iconCode)
    }
    
    setValue("current-temp", current.currentTemp)
    setValue("current-high", current.highTemp)
    setValue("current-low", current.lowTemp)
    setValue("current-fl-high", current.highFeelsLike)
    setValue("current-fl-low", current.lowFeelsLike)
    setValue("current-wind", current.windSpeed)
    setValue("current-precip", current.precip)
}

const DAY_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: "long" })

let dailySection
let dayCardTemplate

function renderDailyWeather(daily) {
    // ✅ Fixed: Query elements on first run
    if (!dailySection) {
        dailySection = document.querySelector('[data-day-section]')
        dayCardTemplate = document.getElementById("day-card-template")
    }

    if (!dailySection) return
    
    dailySection.innerHTML  = "";
    daily.forEach(day => {
        const element = dayCardTemplate.content.cloneNode(true)
        setValue("temp", day.maxTemp, { parent: element })
        setValue("date", DAY_FORMATTER.format(day.timestamp), { parent: element })
        element.querySelector('[data-icon]').src = getIconUrl(day.iconCode)
        dailySection.append(element)
    })
}

const HOURLY_FORMATTER = new Intl.DateTimeFormat(undefined, { hour: "numeric"})

let hourlySection
let hourRowTemplate

function renderHourlyWeather(hourly) {
    // ✅ Fixed: Query elements on first run
    if (!hourlySection) {
        hourlySection = document.querySelector('[data-hour-section]')
        hourRowTemplate = document.getElementById("hour-row-template")
    }

    if (!hourlySection) return

    hourlySection.innerHTML = "";

    hourly.forEach(hour => {
        const element = hourRowTemplate.content.cloneNode(true)

        setValue("temp", hour.temp, { parent: element })
        setValue("fl-temp", hour.feelsLike, { parent: element })
        setValue("wind", hour.windSpeed, { parent: element })
        setValue("precip", hour.precip, { parent: element })

        setValue("date", DAY_FORMATTER.format(hour.timestamp), { parent: element })
        setValue("time", HOURLY_FORMATTER.format(hour.timestamp), { parent: element })

        element.querySelector('[data-icon]').src = getIconUrl(hour.iconCode)

        hourlySection.append(element)
    })
}
