import { json } from "@remix-run/node";
import { getCountriesForShop, getStatusForShop } from "../models/countries";
import prisma from "../db.server";
import { getConfig } from "../models/configuration";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const urlParams = new URLSearchParams(url.search);
  const shop = urlParams.get("shop");
  const ip = urlParams.get("ip");

  const session = await prisma.ipblockerSession.findMany({
    where: {
      shop: shop,
    },
  });

  const allowed = await getStatusForShop(session[0].accessToken, ip, shop);
  const config = await getConfig(session[0].accessToken);

  return json(
    { allowed, config },
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
