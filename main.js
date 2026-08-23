import "./style.css"
import { getWeather } from "./weather.js"  // ✅ Fixed: Added .js extension
import { ICON_MAP } from "./iconMap.js";

console.log("🎯 main.js loaded")

navigator.geolocation.getCurrentPosition(positionSuccess, positionError)

function positionSuccess({ coords }) {
    console.log("📍 Location found:", coords.latitude, coords.longitude)
    
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    console.log("🕐 Timezone:", timezone)
    
    getWeather(coords.latitude, coords.longitude, timezone)
        .then(data => {
            console.log("✅ Weather data received:", data)
            renderWeather(data)
        })
        .catch(e => {
            console.error("❌ Error getting weather:", e)
            alert("Error: " + e.message)
        })
}

function positionError(error) {
    console.error("❌ Location error:", error)
    alert("Location error: " + error.message)
}

function renderWeather({ current, daily, hourly }) {
    console.log("🎨 Starting to render weather...")
    renderCurrentWeather(current)
    renderDailyWeather(daily)
    renderHourlyWeather(hourly)
    document.body.classList.remove("blurred")
    console.log("✅ Rendering complete!")
}    

// ✅ Fixed: Added safety check to prevent crashes if element doesn't exist
function setValue(selector, value, { parent = document } = {}) {
    const element = parent.querySelector(`[data-${selector}]`)
    if (element) {
        element.textContent = value
        console.log(`✓ Set ${selector} = ${value}`)
    } else {
        console.warn(`⚠️ Element not found: [data-${selector}]`)
    }
}

function getIconUrl(iconCode) {
    return `./icons/${ICON_MAP.get(iconCode)}.svg`
}

// ✅ Fixed: Query elements after DOM is ready
let currentIcon

function renderCurrentWeather(current) {
    console.log("🌡️ Rendering current weather:", current)
    
    if (!currentIcon) {
        currentIcon = document.querySelector('[data-current-icon]')
    }
    
    if (currentIcon) {
        currentIcon.src = getIconUrl(current.iconCode)
        console.log("✓ Icon set")
    } else {
        console.warn("⚠️ currentIcon element not found")
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
    console.log("📅 Rendering daily weather, items:", daily.length)
    
    // ✅ Fixed: Query elements on first run
    if (!dailySection) {
        dailySection = document.querySelector('[data-day-section]')
        dayCardTemplate = document.getElementById("day-card-template")
        console.log("Queried elements - dailySection:", !!dailySection, "template:", !!dayCardTemplate)
    }

    if (!dailySection) {
        console.warn("⚠️ dailySection element not found")
        return
    }
    
    dailySection.innerHTML  = "";
    daily.forEach((day, i) => {
        const element = dayCardTemplate.content.cloneNode(true)
        setValue("temp", day.maxTemp, { parent: element })
        setValue("date", DAY_FORMATTER.format(day.timestamp), { parent: element })
        element.querySelector('[data-icon]').src = getIconUrl(day.iconCode)
        dailySection.append(element)
        console.log(`✓ Day ${i} added`)
    })
}

const HOURLY_FORMATTER = new Intl.DateTimeFormat(undefined, { hour: "numeric"})

let hourlySection
let hourRowTemplate

function renderHourlyWeather(hourly) {
    console.log("⏰ Rendering hourly weather, items:", hourly.length)
    
    // ✅ Fixed: Query elements on first run
    if (!hourlySection) {
        hourlySection = document.querySelector('[data-hour-section]')
        hourRowTemplate = document.getElementById("hour-row-template")
        console.log("Queried elements - hourlySection:", !!hourlySection, "template:", !!hourRowTemplate)
    }

    if (!hourlySection) {
        console.warn("⚠️ hourlySection element not found")
        return
    }

    hourlySection.innerHTML = "";

    hourly.forEach((hour, i) => {
        const element = hourRowTemplate.content.cloneNode(true)

        setValue("temp", hour.temp, { parent: element })
        setValue("fl-temp", hour.feelsLike, { parent: element })
        setValue("wind", hour.windSpeed, { parent: element })
        setValue("precip", hour.precip, { parent: element })

        setValue("date", DAY_FORMATTER.format(hour.timestamp), { parent: element })
        setValue("time", HOURLY_FORMATTER.format(hour.timestamp), { parent: element })

        element.querySelector('[data-icon]').src = getIconUrl(hour.iconCode)

        hourlySection.append(element)
        
        if (i < 3) console.log(`✓ Hour ${i} added`)
    })
}
