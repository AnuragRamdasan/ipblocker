import { json } from "@remix-run/node";
import { getCountriesForShop, getStatusForShop } from "../models/countries";
import prisma from "../db.server";
import { getConfig } from "../models/configuration";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const urlParams = new URLSearchParams(url.search);
  const shop = urlParams.get("shop");
  const ip = urlParams.get("ip");
  const referrer = urlParams.get("referrer");
  const sessions = await prisma.ipblockerSession.findMany({
    where: {
      shop: shop,
    },
  });

  const session = sessions[sessions.length - 1];
  const allowed = await getStatusForShop(
    session.accessToken,
    ip,
    shop,
    referrer,
  );
  const config = await getConfig(session.accessToken);

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
