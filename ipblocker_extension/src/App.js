import React, { useEffect } from 'react';

const App = () => {

  useEffect(() => {
    async function fetchCountries() {
      try {
        const response = await fetch("https://ipblocker.shopifyplugins.pro/countries");
        const countries = await response.json();
        
        const data = await fetch("https://api.ipify.org?format=json");
        const ipData = await data.json();

        const countryData = await fetch('https://ipapi.co/' + ipData.ip + '/json/');
        const country = await countryData.json();

        const currentCountry = country["country_code"];
        const blockedCountries = countries.countries.map(c => c["country_code"]);

        if (blockedCountries.includes(currentCountry)) {
          // Erase all content on the page
          document.body.innerHTML = '';

          // Example usage
          const newContent = `
            <div>
              <h1>This Shopify store is not available in your country.</h1>
              <p>Sorry about that.</p>
            </div>
          `;

          // Inject the new HTML string
          document.body.innerHTML = newContent;
        }
      } catch (err) {
        console.log("Error fetching countries or IP data:", err);
      }
    }

    fetchCountries();
  }, []);

  return null;
};

export default App;