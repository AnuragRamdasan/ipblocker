import { PrismaClient } from '@prisma/client';
import { json, redirect } from '@remix-run/node';

const prisma = new PrismaClient();

export const loader = async ({ params }) => {
  const shop = params.shop;
  const countries = await prisma.country.findMany({
    where: { shop: shop },
  });

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
