import "./style.css"
import { getWeather } from "./weather.js"
import { ICON_MAP } from "./iconMap.js"

navigator.geolocation.getCurrentPosition(positionSuccess, positionError)

function positionSuccess({ coords }) {
    getWeather(
        coords.latitude,
        coords.longitude,
        Intl.DateTimeFormat().resolvedOptions().timeZone
    )
        .then(renderWeather)
        .catch(e => {
            console.error("Error getting weather:", e)
            alert("Error getting weather: " + e.message)
        })
}

function positionError(error) {
    console.error("Location error:", error)
    alert("Location error: " + error.message)
}

function getIconUrl(iconCode) {
    return `./public/icons/${ICON_MAP.get(iconCode)}.svg`
}

function renderWeather(data) {
    console.log(data)
}
