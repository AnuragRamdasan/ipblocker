const getCountriesForShop = async session => {
  console.log(process.env.SERVER_URL)
  console.log(process.env)
  const res = await fetch("https://ipblocker.shopifyplugins.pro" + "ipblocker/countries.json?token=" + session)
  const countries = await res.json()
  return countries["countries"]
}
const addCountryToShop = async (token, country, countryCode) => {
  console.log(process.env.SERVER_URL)
  console.log(process.env)
  fetch("https://ipblocker.shopifyplugins.pro" + "ipblocker/countries.json", {
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