import { json } from "@remix-run/node";
import { getCountriesForShop } from "../models/countries";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const urlParams = new URLSearchParams(url.search);
  const shop = urlParams.get("shop");

  const session = await prisma.ipblockerSession.findMany({
    where: {
      shop: shop,
    },
  });

  const { countries, ips, mantle_customer, whiteList, cities } =
    await getCountriesForShop(session[0].accessToken);
  const config = await getConfig(session[0].accessToken)
  return json(
    { countries, ips, mantle_customer, whiteList, cities, config },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
    },
  );
};
