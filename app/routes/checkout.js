import { json } from "@remix-run/node";
import { getCheckoutStatusForShop } from "../models/countries";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return json({}, {
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      }
    });
  }
  // Get the request body
  const body = await request.json();
  if (!body.checkout_config || !body.shop) {
    return json({});
  }

  const session = await prisma.ipblockerSession.findMany({
    where: {
      shop: body.shop,
    },
  });

  const allowed = await getCheckoutStatusForShop(
    session[0].accessToken,
    body.checkout_config,
  );

  return json(
    { allowed: allowed.allowed, reason: allowed.reason },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
    },
  );
};

export const action = async ({ request }) => {
  // Get the request body
  const body = await request.json();
  if (!body.checkout_config || !body.shop) {
    return json(
      { error: "Missing checkout_config or shop in request body" },
      { status: 400 },
    );
  }

  const session = await prisma.ipblockerSession.findMany({
    where: {
      shop: body.shop,
    },
  });

  const allowed = await getCheckoutStatusForShop(
    session[0].accessToken,
    body.checkout_config,
  );

  return json(
    { allowed: allowed.allowed, reason: allowed.reason },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
    },
  );
};
