import { useEffect } from "react";
import { Provider, ErrorBoundary } from "@rollbar/react";
import isBot from "./BotBlocker";

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

const IPBLOCKER_LOGO =
  "https://cdn.shopify.com/app-store/listing_images/c32fa88b423044f414bf606d4cd737d3/icon/CKj-r-6ez4cDEAE=.png";

const App = () => {
  // Fetch function with retry mechanism
  const fetchWithRetry = async (
    url,
    options = {},
    retries = 3,
    backoff = 300,
  ) => {
    try {
      // Attempt to fetch data from the URL
      const response = await fetch(url, options);
      // If the response is not ok, throw an error
      if (!response.ok) throw new Error("Network response was not ok " + url);
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

    const eventProperties = {
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
    // Remove all existing scripts
    document.querySelectorAll("script").forEach((script) => script.remove());

    // Overwrite the entire document content
    document.documentElement.innerHTML = `
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Access Blocked</title>
        <style>
          .ipblocker-body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background-color: #f8f8f8;
          }
          .ipblocker-body img {
            width: 130px;
            height: 130px;
            object-fit: contain;
            margin-bottom: 30px;
          }
          .ipblocker-body h1 {
            color: #333;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .ipblocker-body p {
            color: #666;
            font-size: 16px;
          }
          .footer {
            color: #999;
            font-size: 12px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body class="ipblocker-body">
        <img id="storeLogo" src="${IPBLOCKER_LOGO}" alt="Store Logo">
        <h1>This Shopify store is not available in your location.</h1>
        <p>We apologize for the inconvenience. Thank you for your understanding.</p>
        <p class="footer">Powered by ValueCommerce</p>
      </body>
    `;

    // Disable all JavaScript execution
    Object.defineProperty(window, "eval", {
      value: () => null,
      writable: false,
      configurable: false,
    });

    // Prevent adding new script tags
    document.createElement = (function () {
      const createElement = document.createElement;
      return function (tagName) {
        if (tagName.toLowerCase() === "script") {
          return null;
        }
        return createElement.apply(this, arguments);
      };
    })();

    // Disable setting innerHTML and outerHTML
    Element.prototype.innerHTML = "";
    Object.defineProperty(Element.prototype, "innerHTML", {
      set: () => {},
      configurable: false,
    });
    Object.defineProperty(Element.prototype, "outerHTML", {
      set: () => {},
      configurable: false,
    });
  };

  useEffect(() => {
    async function fetchCountries() {
      try {
        // Get the shop domain from the root element's data attribute
        const shop = window.Shopify.shop;

        // Fetch country data, IP list, customer info, and whitelist for the shop
        const { countries, ips, mantle_customer, whiteList, cities, config } =
          await fetchWithRetry(`${API_ENDPOINTS.COUNTRIES}?shop=${shop}`);

        // Get the current IP address of the user
        const { ip: currentIP } = await fetchWithRetry(API_ENDPOINTS.IP_INFO);

        // Fetch detailed country information based on the current IP
        const country = await fetchWithRetry(
          `${API_ENDPOINTS.COUNTRY_INFO}/${currentIP}/json/?access_key=a9b7a2dccfd7659f52c7414083b297da`,
        );

        // Extract the country code from the fetched country data
        const currentCountry = country.country_code;
        const currentCity = {
          city: country.city,
          pincode: country.postal || country.zip,
        };

        // Create an array of blocked country codes
        const blockedCountries = countries.map((c) => c.country_code);
        const whitelistedCountries = whiteList.map((c) => c.country_code);
        // Create an array of blocked city codes
        const cityBlocked = (currentCity) => {
          const { city, pincode } = currentCity;
          return blockedCities.some((blockedCity) => {
            if (blockedCity.pincode) {
              // If pincode is present, match both city and pincode
              return pincode === blockedCity.pincode;
            } else {
              // If no pincode, just match the city name (ignoring spaces and case)
              return (
                city.toLowerCase().replace(/\s+/g, "") ===
                blockedCity.city.toLowerCase().replace(/\s+/g, "")
              );
            }
          });
        };

        const blockedCities = cities.map((c) => {
          const [city, pincode] = c.city.split(" ").reduce(
            (acc, part, index, arr) => {
              if (index === arr.length - 1 && /^\d+$/.test(part)) {
                acc[1] = part;
              } else {
                acc[0] += (acc[0] ? " " : "") + part;
              }
              return acc;
            },
            ["", ""],
          );
          return { city, pincode };
        });

        // Track the IP event for analytics
        try {
          await trackEvent(mantle_customer, country, "ip_tracked");
        } catch (error) {
          console.error("Error tracking IP event:", error);
        }

        // Initialize blocking flags
        let shouldBlock = false;
        let reason = "";

        // Check if the current country is not in the whitelist (if whitelist exists)
        if (
          whiteList?.length &&
          !whitelistedCountries.includes(currentCountry)
        ) {
          shouldBlock = true;
          reason = "country";
        }
        // Check if the current country is in the blocked list or if the IP is blocked
        else if (blockedCountries.includes(currentCountry)) {
          shouldBlock = true;
          reason = "country";
        } else if (cityBlocked(currentCity)) {
          shouldBlock = true;
          reason = "city";
        } else if (ips.includes(currentIP)) {
          shouldBlock = true;
          reason = "ip";
        } else if (
          config &&
          config["botBlockingEnabled"] === "true" &&
          isBot()
        ) {
          shouldBlock = true;
          reason = "bot";
        }

        // If blocking is required, track the event and inject blocked content
        if (shouldBlock) {
          try {
            trackEvent(mantle_customer, country, `${reason}_blocked`);
          } catch (err) {
            console.error("Error tracking event:", err);
          }
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
