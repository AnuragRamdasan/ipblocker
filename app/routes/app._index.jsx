import { useLoaderData, Form } from '@remix-run/react';
import { Page, Layout, Card, Select, Button, Text, TextField, Banner } from '@shopify/polaris';
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
    const countryId = formData.get("countryId")
    const res = await removeCountryFromShop(session.accessToken, countryId)
  }

  return redirect(`/app?shop=${shop}`);
};

export default function CountriesAdmin() {
  const { countries } = useLoaderData();
  const [selected, setSelected] = useState();  
  const [showBanner, setShowBanner] = useState(true)
  const handleSelectChange = useCallback(
    (value) => setSelected(value),
    [],
  );

  return (
    <Page title="Manage Blocked Countries">
      <Layout>    
        {showBanner && <Layout.Section>
          <Card sectioned>
            <Banner
              title="IP Blocker App Embed"
              tone="info"
              onDismiss={() => setShowBanner(false)}
            >
              <p>Enable the app block in your theme header to start blocking fraudulent traffic.</p>
            </Banner>
            <Text variant="headingMd" as="h5">
              
            </Text>            
          </Card>
        </Layout.Section>    }
        <Layout.Section>
          <Card sectioned>
            <Text variant="headingMd" as="h5">
              Select the countries that you want to block access to.
            </Text>
            <Form method="post">
            <input type="hidden" name="_action" value="create" />
            <Select
              name="country"
              options={masterCountryList.filter(c => !countries.map(c => c.country).includes(c.country) ).map(c => { return {label: c["country"], value: c["country"]}})}
              onChange={handleSelectChange}
              value={selected}
            />
              <Button submit primary>Add Country</Button>
            </Form>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <CountryList countries={countries} />
        </Layout.Section>
      </Layout>
    </Page>
  );
}