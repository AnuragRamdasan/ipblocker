const getCountriesForShop = async (token) => {
  const res = await fetch(process.env.SERVER_URL + "ipblocker/countries.json", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token,
    },
  });
  const countries = await res.json();
  return countries["countries"];
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
      country: { country: country, country_code: countryCode },
    }),
  });
};
const removeCountryFromShop = async (token, country) => {
  return fetch(
    process.env.SERVER_URL + "ipblocker/countries/" + country + ".json",
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: token,
      },
    },
  );
};

export { getCountriesForShop, addCountryToShop, removeCountryFromShop };
