import { useEffect } from "react";
import { Provider, ErrorBoundary } from "@rollbar/react";

const rollbarConfig = {
  accessToken: "c5b3fd43148e4e258eadef336137b298",
  environment: "production",
};

const API_ENDPOINTS = {
  USAGE_EVENTS: "https://appapi.heymantle.com/v1/usage_events",
  COUNTRIES: "https://ipblocker.valuecommerce.info/countries",
  IP_INFO: "https://api.ipify.org?format=json",
  COUNTRY_INFO: "https://ipapi.co",
};

const IPBLOCKER_LOGO = "https://cdn.shopify.com/app-store/listing_images/c32fa88b423044f414bf606d4cd737d3/icon/CKj-r-6ez4cDEAE=.png";

const App = () => {
  // Fetch function with retry mechanism
  const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 300) => {
    try {
      // Attempt to fetch data from the URL
      const response = await fetch(url, options);
      // If the response is not ok, throw an error
      if (!response.ok) throw new Error("Network response was not ok");
      // Parse and return the JSON response
      return await response.json();
    } catch (error) {
      // If no more retries left, throw the error
      if (retries === 0) throw error;
      // Wait for the backoff period before retrying
      await new Promise((resolve) => setTimeout(resolve, backoff));
      // Recursively call fetchWithRetry with one less retry and doubled backoff time
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
  };

  const trackEvent = async (customer, countryData, eventName) => {
    const { appId, customerToken } = customer;
    const {
      ip, continent_code, continent_name, country_code, country_name,
      region_code, region_name, city, zip, latitude, longitude, security,
    } = countryData;

    const eventProperties = {
      continent_code, continent_name, country_code, country_name,
      region_code, region_name, city, zip, latitude, longitude, security, ip,
    };

    if (eventName.includes("blocked")) {
      eventProperties.blockedReason = eventName.split("_")[0];
    }

    return fetchWithRetry(API_ENDPOINTS.USAGE_EVENTS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Mantle-App-Id": appId,
        "X-Mantle-Customer-Api-Token": customerToken,
      },
      body: JSON.stringify({
        eventId: `block_${Date.now()}`,
        eventName,
        timestamp: Date.now(),
        properties: eventProperties,
      }),
    });
  };

  const injectBlockedContent = () => {
    document.body.innerHTML = `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f8f8f8;">
        <img id="storeLogo" src="${IPBLOCKER_LOGO}" alt="Store Logo" style="width: 130px; height: 130px; object-fit: contain; margin-bottom: 30px;">
        <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">This Shopify store is not available in your location.</h1>
        <p style="color: #666; font-size: 16px;">We apologize for the inconvenience. Thank you for your understanding.</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">Powered by ValueCommerce</p>
      </div>
    `;
  };

  useEffect(() => {
    async function fetchCountries() {
      try {
        // Get the shop domain from the root element's data attribute        
        const shop = window.Shopify.shop.replace('.myshopify.com', '') || document.getElementById("root").getAttribute("data-shop-domain");

        // Fetch country data, IP list, customer info, and whitelist for the shop
        const { countries, ips, mantle_customer, whiteList } = await fetchWithRetry(`${API_ENDPOINTS.COUNTRIES}?shop=${shop}`);

        // Get the current IP address of the user
        const { ip: currentIP } = await fetchWithRetry(API_ENDPOINTS.IP_INFO);

        // Fetch detailed country information based on the current IP
        const country = await fetchWithRetry(`${API_ENDPOINTS.COUNTRY_INFO}/${currentIP}/json/`);

        // Extract the country code from the fetched country data
        const currentCountry = country.country_code;

        // Create an array of blocked country codes
        const blockedCountries = countries.map((c) => c.country_code);

        // Track the IP event for analytics
        await trackEvent(mantle_customer, country, "ip_tracked");

        // Initialize blocking flags
        let shouldBlock = false;
        let reason = "";

        // Check if the current country is not in the whitelist (if whitelist exists)
        if (whiteList?.length && !whiteList.includes(currentCountry)) {
          shouldBlock = true;
          reason = "country";
        } 
        // Check if the current country is in the blocked list or if the IP is blocked
        else if (blockedCountries.includes(currentCountry) || ips.includes(currentIP)) {
          shouldBlock = true;
          reason = blockedCountries.includes(currentCountry) ? "country" : "ip";
        }

        // If blocking is required, track the event and inject blocked content
        if (shouldBlock) {
          await trackEvent(mantle_customer, country, `${reason}_blocked`);
          injectBlockedContent();
        }
      } catch (err) {
        console.error("Error fetching countries or IP data:", err);
      }
    }

    fetchCountries();
  }, []);

  return (
    <Provider config={rollbarConfig}>
      <ErrorBoundary></ErrorBoundary>
    </Provider>
  );
};

export default App;