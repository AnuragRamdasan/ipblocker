import { useEffect } from 'react';

const App = () => {
  const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 300) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
  };

  useEffect(() => {
    async function fetchCountries() {
      try {
        // TODO cleanup url
        const shop = document.getElementById('root').getAttribute('data-shop-domain')
        const countries = await fetchWithRetry("https://dale-needed-astrology-devil.trycloudflare.com/countries?shop=" + shop);
        const ipData = await fetchWithRetry("https://api.ipify.org?format=json");
        const country = await fetchWithRetry(`https://ipapi.co/${ipData.ip}/json/`);

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