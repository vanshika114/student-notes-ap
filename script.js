const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityDisplay = document.getElementById('city-name');
const dateDisplay = document.getElementById('current-date');
const tempDisplay = document.getElementById('temperature');
const descDisplay = document.getElementById('weather-desc');
const humidityDisplay = document.getElementById('humidity');
const windDisplay = document.getElementById('wind-speed');
const iconDisplay = document.getElementById('weather-icon');

// Mock Data for demonstration (Quick Preview)
const mockWeather = {
    "london": { temp: 18, desc: "Cloudy Intervals", humidity: "62%", wind: "15 km/h", icon: "ph-cloud-sun" },
    "new york": { temp: 24, desc: "Bright Sunshine", humidity: "40%", wind: "8 km/h", icon: "ph-sun" },
    "tokyo": { temp: 21, desc: "Light Rain", humidity: "88%", wind: "10 km/h", icon: "ph-cloud-rain" },
    "mumbai": { temp: 32, desc: "Humid & Hot", humidity: "90%", wind: "5 km/h", icon: "ph-thermometer-hot" }
};

function updateWeather() {
    const city = cityInput.value.toLowerCase().trim();
    const card = document.getElementById('weather-card');
    
    // Basic animation trigger
    card.style.opacity = '0';
    card.style.transform = 'translateY(10px)';

    setTimeout(() => {
        const data = mockWeather[city] || { 
            temp: Math.floor(Math.random() * 15) + 15, 
            desc: "Clear Sky", 
            humidity: "50%", 
            wind: "12 km/h", 
            icon: "ph-sun" 
        };

        cityDisplay.textContent = city.charAt(0).toUpperCase() + city.slice(1) || "London";
        tempDisplay.textContent = data.temp;
        descDisplay.textContent = data.desc;
        humidityDisplay.textContent = data.humidity;
        windDisplay.textContent = data.wind;
        
        // Update Icon Class
        iconDisplay.className = `ph-fill ${data.icon}`;

        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 300);
}

function setDate() {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    dateDisplay.textContent = new Date().toLocaleDateString('en-US', options);
}

searchBtn.addEventListener('click', updateWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') updateWeather();
});

// Initial State
window.onload = () => {
    setDate();
    cityInput.value = "London";
    updateWeather();
};