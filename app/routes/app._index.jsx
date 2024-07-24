import { useLoaderData, Form, Link, useActionData } from '@remix-run/react';
import { Page, Layout, Card, Select, Button, Text, TextField, Banner } from '@shopify/polaris';
import { CountryList } from '../components/CountryList';
import masterCountryList from "./masterCountryList"
import { useCallback, useEffect } from 'react';
import { useState } from 'react';
import { addCountryToShop, getCountriesForShop, removeCountryFromShop } from '../models/countries';
import { authenticate } from '../shopify.server';

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const countries = await getCountriesForShop(session.accessToken)
  return { countries };
};


export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get('_action');

  let res = null
  if (actionType === 'create') {
    const countryName = formData.get('country');
    const countryCode = masterCountryList.filter(mk => mk['country'] === countryName)[0]["code"]
    res = await addCountryToShop(session.accessToken, countryName, countryCode)    
  } else if (actionType === 'delete') {
    const countryId = formData.get("countryId")
    res = await removeCountryFromShop(session.accessToken, countryId)
  }

  if (!res.ok) {
    return {
      error: true,    
      message: actionType === 'create' ? "Failed to add country to blocklist." : "Failed to remove country from blocklist."  
    };
  } else {
    return {
      message: actionType === 'create' ? "Successfully added country to blocklist." : "Successfull removed country from blocklist."
    };
  }
};

export default function CountriesAdmin() {
  const data = useActionData()
  const { countries } = useLoaderData();
  const [selected, setSelected] = useState();  
  const [showBanner, setShowBanner] = useState(true)
  const handleSelectChange = useCallback(
    (value) => setSelected(value),
    [],
  );

  useEffect(() => {
    // Function to add the script
    const addCrispScript = () => {
      window.$crisp = [];
      window.CRISP_WEBSITE_ID = "6158cfeb-f135-4382-abcd-80c96b8fa3ab";
      const d = document;
      const s = d.createElement("script");
      s.src = "https://client.crisp.chat/l.js";
      s.async = 1;
      d.getElementsByTagName("head")[0].appendChild(s);
    };

    // Check if the script is already present
    const existingScript = document.querySelector(`script[src="https://client.crisp.chat/l.js"]`);
    if (!existingScript) {
      addCrispScript();
    }
  }, []);

  return (
    <Page title="Manage Blocked Countries">
      <Layout>    
        {showBanner && <Layout.Section>
            <Banner
              title="IP Blocker App Embed"
              tone="info"
              onDismiss={() => setShowBanner(false)}
            >
              <p>Enable the app block in your theme header to start blocking fraudulent traffic.</p>
            </Banner>
            <Text variant="headingMd" as="h5">
              
            </Text>            
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
          {data && data.message && (
                  <Banner
                    title={data.message}
                    status={data.error ? "critical" : "success"}
                  />
                )}
        </Layout.Section>
        <Layout.Section>
          <CountryList countries={countries} />
        </Layout.Section>
        <Layout.Section>
          <Card sectioned>
            <Text>View our <Link to="/app/roadmap">Roadmap</Link> to see what we are working on to make IPBlocker even more powerful for you.</Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}