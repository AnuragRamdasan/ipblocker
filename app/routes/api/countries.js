import { PrismaClient } from '@prisma/client';
import { json, redirect } from '@remix-run/node';

const prisma = new PrismaClient();

export const loader = async ({ params }) => {
  const shopId = params.shopId;
  const countries = await prisma.country.findMany({
    where: { shopId: parseInt(shopId) },
  });
  return json({ countries });
};

export const action = async ({ request, params }) => {
  const formData = await request.formData();
  const actionType = formData.get('_action');
  const shopId = parseInt(params.shopId);

  if (actionType === 'create') {
    const countryName = formData.get('countryName');
    const countryCode = formData.get('countryCode');
    await prisma.country.create({
      data: {
        name: countryName,
        code: countryCode,
        shopId: shopId,
      },
    });
  } else if (actionType === 'delete') {
    const countryId = parseInt(formData.get('countryId'));
    await prisma.country.delete({
      where: { id: countryId },
    });
  }

  return redirect(`/admin/${shopId}/countries`);
};