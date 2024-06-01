import { json } from '@remix-run/node';
import { getCountriesForShop } from '../models/countries';

export const loader = async ({ params }) => {
  const shop = params.shop;
  const countries = await getCountriesForShop(shop)

  return json(
    { countries }, 
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        'Content-Type': 'application/json',
      }
    }
  );
};
