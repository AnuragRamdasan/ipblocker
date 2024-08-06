import { useEffect } from "react";
import { Provider, ErrorBoundary } from "@rollbar/react"; // Provider imports 'rollbar'

const rollbarConfig = {
  accessToken: "c5b3fd43148e4e258eadef336137b298",
  environment: "production",
};

const App = () => {
  const fetchWithRetry = async (
    url,
    options = {},
    retries = 3,
    backoff = 300,
  ) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    } catch (error) {
      if (retries === 0) throw error;
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
  };

  const trackIp = async (customer, countryData) => {
    const { appId, customerToken } = customer;

    const {
      ip,
      continent_code,
      continent_name,
      country_code,
      country_name,
      region_code,
      region_name,
      city,
      zip,
      latitude,
      longitude,
      security,
    } = countryData;

    return await fetchWithRetry(
      "https://appapi.heymantle.com/v1/usage_events",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Mantle-App-Id": appId,
          "X-Mantle-Customer-Api-Token": customerToken,
        },
        body: JSON.stringify({
          eventId: `block_${Date.now()}`,
          eventName: `ip_tracked`,
          timestamp: Date.now(),
          properties: {
            continent_code,
            continent_name,
            country_code,
            country_name,
            region_code,
            region_name,
            city,
            zip,
            latitude,
            longitude,
            security,
            ip,
          },
        }),
      },
    );
  };
  const trackBlocked = async (customer, countryData, reason) => {
    const { appId, customerToken } = customer;

    const {
      ip,
      continent_code,
      continent_name,
      country_code,
      country_name,
      region_code,
      region_name,
      city,
      zip,
      latitude,
      longitude,
      security,
    } = countryData;

    return await fetchWithRetry(
      "https://appapi.heymantle.com/v1/usage_events",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Mantle-App-Id": appId,
          "X-Mantle-Customer-Api-Token": customerToken,
        },
        body: JSON.stringify({
          eventId: `block_${Date.now()}`,
          eventName: `${reason}_blocked`,
          timestamp: Date.now(),
          properties: {
            continent_code,
            continent_name,
            country_code,
            country_name,
            region_code,
            region_name,
            city,
            zip,
            latitude,
            longitude,
            security,
            ip,
            blockedReason: reason,
          },
        }),
      },
    );
  };

  useEffect(() => {
    async function fetchCountries() {
      try {
        // TODO cleanup url
        const shop = document
          .getElementById("root")
          .getAttribute("data-shop-domain");
        const { countries, ips, mantle_customer } = await fetchWithRetry(
          "https://ipblocker.valuecommerce.info/countries?shop=" + shop,
        );
        const ipData = await fetchWithRetry(
          "https://api.ipify.org?format=json",
        );
        const country = await fetchWithRetry(
          `https://ipapi.co/${ipData.ip}/json/`,
        );

        const currentCountry = country["country_code"];
        const currentIP = ipData.ip;
        const blockedCountries = countries.map((c) => c["country_code"]);
        const blockedIPs = ips;

        try {
          trackIp(mantle_customer, country);
        } catch (err) {
          console.log("Failed to report event" + err);
        }

        // Check if either the country or IP is blocked
        if (
          blockedCountries.includes(currentCountry) ||
          blockedIPs.includes(currentIP)
        ) {
          try {
            const reason = blockedCountries.includes(currentCountry)
              ? "country"
              : "ip";
            trackBlocked(mantle_customer, country, reason);
          } catch (err) {
            console.log("Failed to report event" + err);
          }

          // Erase all content on the page
          document.body.innerHTML = "";

          // Example usage
          const newContent = `
            <div>
              <h1>This Shopify store is not available in your location.</h1>
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

  return (
    <Provider config={rollbarConfig}>
      <ErrorBoundary></ErrorBoundary>
    </Provider>
  );
};

export default App;
