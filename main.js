import { getWeather } from "./weather.js"
import { ICON_MAP } from "./iconMap.js"

console.log("🚀 App starting...")

// Wait for DOM to be fully loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp)
} else {
  initApp()
}

function initApp() {
  console.log("✅ DOM ready")
  navigator.geolocation.getCurrentPosition(positionSuccess, positionError)
}

function positionSuccess({ coords }) {
  console.log("📍 Location:", coords.latitude, coords.longitude)
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  console.log("🕐 Timezone:", timezone)
  
  getWeather(coords.latitude, coords.longitude, timezone)
    .then(renderWeather)
    .catch(e => {
      console.error("❌ Error:", e)
      alert("Error: " + e.message)
    })
}

function positionError(error) {
  console.error("❌ Location error:", error.message)
  alert("Please enable location access")
}

function setValue(selector, value, { parent = document } = {}) {
  const el = parent.querySelector(`[data-${selector}]`)
  if (el) el.textContent = value
}

function getIconUrl(iconCode) {
  return `./icons/${ICON_MAP.get(iconCode)}.svg`
}

function renderWeather({ current, daily, hourly }) {
  console.log("🎨 Rendering weather...")
  
  // Current weather
  const icon = document.querySelector("[data-current-icon]")
  if (icon) icon.src = getIconUrl(current.iconCode)
  
  setValue("current-temp", current.currentTemp)
  setValue("current-high", current.highTemp)
  setValue("current-low", current.lowTemp)
  setValue("current-fl-high", current.highFeelsLike)
  setValue("current-fl-low", current.lowFeelsLike)
  setValue("current-wind", current.windSpeed)
  setValue("current-precip", current.precip)
  
  // Daily forecast
  const daySection = document.querySelector("[data-day-section]")
  const dayTemplate = document.getElementById("day-card-template")
  const dayFormatter = new Intl.DateTimeFormat(undefined, { weekday: "long" })
  
  if (daySection && dayTemplate) {
    daySection.innerHTML = ""
    daily.forEach(day => {
      const el = dayTemplate.content.cloneNode(true)
      setValue("temp", day.maxTemp, { parent: el })
      setValue("date", dayFormatter.format(day.timestamp), { parent: el })
      el.querySelector("[data-icon]").src = getIconUrl(day.iconCode)
      daySection.appendChild(el)
    })
  }
  
  // Hourly forecast
  const hourSection = document.querySelector("[data-hour-section]")
  const hourTemplate = document.getElementById("hour-row-template")
  const hourFormatter = new Intl.DateTimeFormat(undefined, { hour: "numeric" })
  const dayFormatterHour = new Intl.DateTimeFormat(undefined, { weekday: "long" })
  
  if (hourSection && hourTemplate) {
    hourSection.innerHTML = ""
    hourly.forEach(hour => {
      const el = hourTemplate.content.cloneNode(true)
      setValue("temp", hour.temp, { parent: el })
      setValue("fl-temp", hour.feelsLike, { parent: el })
      setValue("wind", hour.windSpeed, { parent: el })
      setValue("precip", hour.precip, { parent: el })
      setValue("date", dayFormatterHour.format(hour.timestamp), { parent: el })
      setValue("time", hourFormatter.format(hour.timestamp), { parent: el })
      el.querySelector("[data-icon]").src = getIconUrl(hour.iconCode)
      hourSection.appendChild(el)
    })
  }
  
  document.body.classList.remove("blurred")
  console.log("✅ Done!")
}
