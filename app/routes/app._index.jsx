import { useLoaderData, Form, useFetcher } from '@remix-run/react';
import { Page, Layout, Card, TextField, Button } from '@shopify/polaris';
import { CountryList } from '~/components/CountryList';
import { PrismaClient } from '@prisma/client';
import { json, redirect } from '@remix-run/node';

const prisma = new PrismaClient();

export const loader = async ({ params }) => {
  const shopId = 1; // Replace with actual shop ID
  const countries = await prisma.country.findMany({
    where: { shopId: shopId },
  });
  return json({ countries });
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get('_action');
  const url = new URL(request.url)
  const shop = url.searchParams.get("shop")
  const shopId = 1; // Replace with actual shop ID

  if (actionType === 'create') {
    const countryName = formData.get('countryName');
    const countryCode = formData.get('countryCode');
    await prisma.country.create({
      data: {
        country: countryName,
        countryCode: countryCode,
        shop: shop,
      },
    });
  } else if (actionType === 'delete') {
    const countryId = parseInt(formData.get('countryId'));
    await prisma.country.delete({
      where: { id: countryId },
    });
  }

  return redirect('/');
};

export default function CountriesAdmin() {
  const { countries } = useLoaderData();
  const fetcher = useFetcher();

  return (
    <Page title="Manage Countries">
      <Layout>
        <Layout.Section>
          <CountryList countries={countries} />
        </Layout.Section>
        <Layout.Section>
          <Card sectioned>
            <Form method="post">
              <input type="hidden" name="_action" value="create" />
              <TextField label="Country Name" name="countryName" />
              <TextField label="Country Code" name="countryCode" />
              <Button submit primary>Add Country</Button>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}