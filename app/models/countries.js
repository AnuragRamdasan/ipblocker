const getCountriesForShop = async (token) => {
  const res = await fetch(
    import.meta.env.VITE_SERVER_URL + "ipblocker/countries.json",
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: token,
      },
    },
  );
  const data = await res.json();
  return data;
};

const getStatusForShop = async (token, ip, shop) => {
  const res = await fetch(
    import.meta.env.VITE_SERVER_URL + "ipblocker/allowed.json?ip=" + ip + "&shop=" + shop,
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: token,
      },    
    },
  );
  const data = await res.json();
  return data.allowed;
};

const getCheckoutStatusForShop = async (token, checkout_config) => {
  const res = await fetch(
    import.meta.env.VITE_SERVER_URL + "ipblocker/checkout_allowed.json",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ checkout_config: checkout_config }),
    },
  );
  const data = await res.json();
  return data;
};

const addWhitelistCountryToShop = async (token, country, countryCode) => {
  return fetch(import.meta.env.VITE_SERVER_URL + "ipblocker/countries.json", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      country: {
        country: country,
        country_code: countryCode,
        type: "whitelist",
      },
    }),
  });
};

const updateBlocklist = async (token, countries, cities, ips) => {
  return fetch(import.meta.env.VITE_SERVER_URL + "ipblocker/blocklist.json", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      countries: countries,
      cities: cities,
      ips: ips,
    }),
  });
};

export {
  getCountriesForShop,
  addWhitelistCountryToShop,
  getStatusForShop,
  updateBlocklist,
  getCheckoutStatusForShop,
};
