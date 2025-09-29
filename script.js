/*
=======================================
📘 JavaScript & Web APIs Lab
All tasks in one file (script.js)
=======================================
*/
document.addEventListener("DOMContentLoaded", function () {
    // all your DOM code here

/*  
=======================================
TODO1: Welcome Board
---------------------------------------
When the page loads, display a welcome message 
inside the <p> element with id="t1-msg".

✅ Task:
- Select the element with id "t1-msg".
- Change its text to "Hello, World!".

💡 Hint:
document.getElementById("t1-msg").innerHTML = "Hello, World!";
*/

document.getElementById("t1-msg").innerHTML = "Hello, World!";


/*  
=======================================
TODO2: Interaction Corner
---------------------------------------
There is a button with id="t2-btn".
When the button is clicked, change the text inside 
the <p> with id="t2-status" to:
    "You clicked the button!"

✅ Task:
- Get the button element.
- Add a click event listener.
- Inside the event, change the text of the status paragraph.

💡 Hint:
button.addEventListener("click", function () {
    // change text here
});
*/
 
const button = document.getElementById("t2-btn");
button.addEventListener("click", function () {
      document.getElementById("t2-status").innerHTML = "You clicked the button!";
});


/*  
=======================================
TODO3: Inspiring Quote Board
---------------------------------------
Use the Quotable API to display a random quote.

🌍 API Link:
https://dummyjson.com/quotes/random

✅ Task:
- When the button with id="t3-loadQuote" is clicked:
    - Fetch a random quote from the API.
    - Display the quote text inside the <p> with id="t3-quote".
    - Display the author inside the <p> with id="t3-author".

💡 Hint:
The API returns JSON like:
{
  "content": "Do not watch the clock. Do what it does. Keep going.",
  "author": "Sam Levenson"
}

Use:
data.content   // the quote text
data.author    // the author
*/

const API_Button = document.getElementById("t3-loadQuote");
API_Button.addEventListener("click", function () {
    fetch("https://dummyjson.com/quotes/random")
    .then(function (response) {
      if (!response.ok) {                 // not 2xx → treat as an error
        throw new Error("HTTP " + response.status);
      }
      return response.json();             // turn response body into JS object
    })
    .then(function (data) {
      // use the JSON data here
      document.getElementById("t3-quote").textContent = `"${data.quote}"`;
      document.getElementById("t3-author").textContent = `— ${data.author}`;
    })
    .catch(function (err) {
        document.getElementById("t3-quote").textContent =
        "Could not load quote. Please try again.";});
});





/*  
=======================================
TODO4: Dammam Weather Now
---------------------------------------
Use the OpenWeatherMap API to display live weather data.

🌍 API Link:
https://api.openweathermap.org/data/2.5/weather?q=Dammam&appid=API_KEY=metric

⚠️ Replace YOUR_API_KEY with your actual API key from:
https://openweathermap.org/api

✅ Task:
- When the button with id="t4-loadWx" is clicked:
    - Fetch current weather data for Dammam.
    - Show temperature in the element with id="t4-temp".
    - Show humidity in the element with id="t4-hum".
    - Show wind speed in the element with id="t4-wind".

💡 Hint:
data.main.temp      → temperature (°C)
data.main.humidity  → humidity (%)
data.wind.speed     → wind speed (m/s)
*/

const weatherBtn = document.getElementById("t4-loadWx");

weatherBtn.addEventListener("click", async function () {
  const tempEl = document.getElementById("t4-temp");
  const humEl  = document.getElementById("t4-hum");
  const windEl = document.getElementById("t4-wind");
  const errEl  = document.getElementById("t4-err");

  // Build API URL with query parameters
  const base  = "https://api.openweathermap.org/data/2.5/weather";
  const city  = "Dammam,sa"; // Dammam, Saudi Arabia
  const units = "metric";
  const key   = "f8ecf5f88455b64f2f790ad9d0299a72"; // 🔑 your API key
  const url   = `${base}?q=${encodeURIComponent(city)}&appid=${key}&units=${units}`;

  try {
    // Simple loading state
    weatherBtn.disabled = true;
    errEl.textContent = "⏳ Loading…";
    tempEl.textContent = "—";
    humEl.textContent  = "—";
    windEl.textContent = "—";

    // Fetch weather
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);

    const data = await res.json();

    // Use JSON fields
    tempEl.textContent = data.main.temp + " °C";
    humEl.textContent  = data.main.humidity + " %";
    windEl.textContent = data.wind.speed + " m/s";
    errEl.textContent  = ""; // clear loading/error
  } catch (err) {
    // Friendly error
    errEl.textContent = "⚠️ Could not load weather data.";
    console.error(err);
  } finally {
    // Always re-enable button
    weatherBtn.disabled = false;
  }
});


});