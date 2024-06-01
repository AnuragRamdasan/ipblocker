const getCountriesForShop = async shop => {
  const countries = await fetch("https://core-backend-70dfd44a255b.herokuapp.com/ipblocker/countries.json")
  return countries["countries"]
}
const addCountryToShop = async shop => {}
const removeCountryFromShop = async shop => {}

export {
  getCountriesForShop,
  addCountryToShop,
  removeCountryFromShop
}