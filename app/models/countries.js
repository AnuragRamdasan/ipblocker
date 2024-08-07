const getCountriesForShop = async (token) => {
  const res = await fetch(process.env.SERVER_URL + "ipblocker/countries.json", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token,
    },
  });
  const data = await res.json();
  return data;
};

const addCountryToShop = async (token, country, countryCode) => {
  return fetch(process.env.SERVER_URL + "ipblocker/countries.json", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      country: { country: country, country_code: countryCode, type: "block" },
    }),
  });
};
const addWhitelistCountryToShop = async (token, country, countryCode) => {
  return fetch(process.env.SERVER_URL + "ipblocker/countries.json", {
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

const addIpToShop = async (token, ips) => {
  return fetch(process.env.SERVER_URL + "ipblocker/ips.json", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      country: { ips: ips },
    }),
  });
};

export {
  getCountriesForShop,
  addCountryToShop,
  addIpToShop,
  addWhitelistCountryToShop,
};
