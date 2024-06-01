const getCountriesForShop = async session => {
  const res = await fetch(process.env.SERVER_URL + "ipblocker/countries.json?token=" + session)
  const countries = await res.json()
  return countries["countries"]
}
const addCountryToShop = async (token, country, countryCode) => {
  fetch(process.env.SERVER_URL + "ipblocker/countries.json", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': token    
    },
    body: JSON.stringify({country: {country: country, country_code: countryCode}})
  });
}
const removeCountryFromShop = async (session, country) => {

}

export {
  getCountriesForShop,
  addCountryToShop,
  removeCountryFromShop
}