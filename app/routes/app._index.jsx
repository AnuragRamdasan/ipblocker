import { useLoaderData, Form, useFetcher } from '@remix-run/react';
import { Page, Layout, Card, Select, Button } from '@shopify/polaris';
import { CountryList } from '../components/CountryList';
import { json, redirect } from '@remix-run/node';
import masterCountryList from "./masterCountryList"
import { useCallback } from 'react';
import { useState } from 'react';
import { addCountryToShop, getCountriesForShop, removeCountryFromShop } from '../models/countries';
import { authenticate } from '../shopify.server';

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const countries = await getCountriesForShop(session.accessToken)
  return json({ countries });
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get('_action');
  const url = new URL(request.url)
  const shop = url.searchParams.get("shop")

  if (actionType === 'create') {
    const countryName = formData.get('country');
    const countryCode = masterCountryList.filter(mk => mk['country'] === countryName)[0]["code"]
    const res = await addCountryToShop(session.accessToken, countryName, countryCode)    
  } else if (actionType === 'delete') {
    const res = await removeCountryFromShop(session.accessToken, countryName)
  }

  return redirect(`/app?shop=${shop}`);
};

export default function CountriesAdmin() {
  const { countries } = useLoaderData();
  const [selected, setSelected] = useState();  
  const handleSelectChange = useCallback(
    (value) => setSelected(value),
    [],
  );

  return (
    <Page title="Manage Blocked Countries">
      <Layout>
        <Layout.Section>
          <CountryList countries={countries} />
        </Layout.Section>
        <Layout.Section>
          <Card sectioned>
            <Form method="post">
            <input type="hidden" name="_action" value="create" />
            <Select
              name="country"
              options={masterCountryList.map(c => { return {label: c["country"], value: c["country"]}})}
              onChange={handleSelectChange}
              value={selected}
            />
              <Button submit primary>Add Country</Button>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}