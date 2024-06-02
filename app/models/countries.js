const getCountriesForShop = async token => {
  const res = await fetch("https://core-backend-70dfd44a255b.herokuapp.com/" + "ipblocker/countries.json", {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': token    
    }
  })
  const countries = await res.json()
  return countries["countries"]
}
const addCountryToShop = async (token, country, countryCode) => {
  fetch("https://core-backend-70dfd44a255b.herokuapp.com/" + "ipblocker/countries.json", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': token    
    },
    body: JSON.stringify({country: {country: country, country_code: countryCode}})
  });
}
const removeCountryFromShop = async (token, country) => {
  fetch("https://core-backend-70dfd44a255b.herokuapp.com/" + "ipblocker/countries/" + country + ".json", {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': token    
    }
  });
}

export {
  getCountriesForShop,
  addCountryToShop,
  removeCountryFromShop
}