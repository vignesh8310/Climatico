// script.js
let weather = {
    openweathermapApiKey: "Your API Key",
    pexelsApiKey: "Your API Key",

    fetchWeather: function (city) {
        if (!city) {
            console.error("City name cannot be empty.");
            this.displayError("Please enter a city name.");
            return;
        }

        fetch("https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=metric&appid=" + this.openweathermapApiKey)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("No weather found for this city. Please check the spelling.");
                }
                return response.json();
            })
            .then((data) => this.displayWeather(data))
            .catch((error) => {
                console.error("Error fetching weather:", error);
                this.displayError(error.message);
                document.body.style.backgroundImage = "url('https://via.placeholder.com/1600x900/000000/FFFFFF?text=Weather+API+Error')";
            });
    },

    displayWeather: function (data) {
        if (!data || !data.name || !data.weather || !data.main || !data.wind) {
            console.error("Invalid weather data received:", data);
            this.displayError("Error: Could not retrieve weather data.");
            return;
        }

        const { name } = data;
        const { icon, description } = data.weather[0];
        const { temp, humidity } = data.main;
        const { speed } = data.wind;

        document.querySelector(".city").innerText = "Weather in " + name;
        document.querySelector(".icon").src = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
        document.querySelector(".icon").style.display = "block"; // Show icon if valid
        document.querySelector(".description").innerText = description;
        document.querySelector(".temp").innerText = Math.round(temp) + "°C";
        document.querySelector(".humidity").innerText = "Humidity: " + humidity + "%";
        document.querySelector(".wind").innerText = "Wind speed: " + Math.round(speed * 3.6) + " km/h";

        document.querySelector(".weather").classList.remove("loading");

        this.fetchBackgroundImage(name);
    },

    fetchBackgroundImage: function(query) {
        if (!this.pexelsApiKey) {
            console.warn("Pexels API Key not set. Using default background.");
            document.body.style.backgroundImage = "url('https://via.placeholder.com/1600x900/000000/FFFFFF?text=No+Pexels+Key')";
            return;
        }

        const encodedQuery = encodeURIComponent(query);
        const imageUrl = `https://api.pexels.com/v1/search?query=${encodedQuery} city skyline landscape&orientation=landscape&size=medium&per_page=1`;

        fetch(imageUrl, {
            headers: {
                Authorization: this.pexelsApiKey
            }
        })
        .then(response => {
            if (!response.ok) {
                console.error(`Pexels API error: ${response.status} - ${response.statusText}`);
                throw new Error("Could not fetch background image from Pexels.");
            }
            return response.json();
        })
        .then(data => {
            if (data.photos && data.photos.length > 0) {
                document.body.style.backgroundImage = `url('${data.photos[0].src.landscape}')`;
            } else {
                console.warn("No specific city image found. Trying generic city...");
                return fetch(`https://api.pexels.com/v1/search?query=${encodedQuery} city&orientation=landscape&size=medium&per_page=1`, {
                    headers: {
                        Authorization: this.pexelsApiKey
                    }
                })
                .then(res => res.json())
                .then(fallbackData => {
                    if (fallbackData.photos && fallbackData.photos.length > 0) {
                        document.body.style.backgroundImage = `url('${fallbackData.photos[0].src.landscape}')`;
                    } else {
                        document.body.style.backgroundImage = "url('https://via.placeholder.com/1600x900/000000/FFFFFF?text=Generic+Landscape')";
                    }
                });
            }
        })
        .catch(error => {
            console.error("Error in fetchBackgroundImage:", error);
            document.body.style.backgroundImage = "url('https://via.placeholder.com/1600x900/000000/FFFFFF?text=Error+Loading+Image')";
        });
    },

    search: function() {
        this.fetchWeather(document.querySelector(".searchbar").value.trim());
    },

   displayError: function(message) {
    document.querySelector(".city").innerText = message;

    const iconElement = document.querySelector(".icon");
    iconElement.src = "";
    iconElement.style.display = "none";

    document.querySelector(".description").innerText = "";
    document.querySelector(".temp").innerText = "";
    document.querySelector(".humidity").innerText = "";
    document.querySelector(".wind").innerText = "";
    document.querySelector(".weather").classList.remove("loading");

    // 🍿 Use Pexels to fetch a default sad/error image
    const fallbackQuery = "sad cloudy weather";

    fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(fallbackQuery)}&orientation=landscape&size=medium&per_page=1`, {
        headers: {
            Authorization: this.pexelsApiKey
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.photos && data.photos.length > 0) {
            document.body.style.backgroundImage = `url('${data.photos[0].src.landscape}')`;
        } else {
            document.body.style.backgroundImage = "url('https://via.placeholder.com/1600x900/000000/FFFFFF?text=Weather+API+Error')";
        }
    })
    .catch(error => {
        console.error("Fallback Pexels error image failed:", error);
        document.body.style.backgroundImage = "url('https://via.placeholder.com/1600x900/000000/FFFFFF?text=Background+Error')";
    });
}


};

document.querySelector(".search button").addEventListener("click", function() {
    weather.search();
});

document.querySelector(".searchbar").addEventListener("keyup", function(event){
    if (event.key === "Enter"){
        weather.search();
    }
});

// Default weather for Bengaluru
weather.fetchWeather("Bengaluru");
