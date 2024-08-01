import { useLoaderData, Form, Link, useActionData } from "@remix-run/react";
import { Page, Layout, Card, Button, Text, Banner } from "@shopify/polaris";
import masterCountryList from "./masterCountryList";
import { useEffect } from "react";
import { useState } from "react";
import {
  addCountryToShop,
  addIpToShop,
  getCountriesForShop,
} from "../models/countries";
import { authenticate } from "../shopify.server";
import MultiSelect from "../components/MultiSelect";

export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const { countries, ips } = await getCountriesForShop(session.accessToken);
  const res = await admin.graphql(`
    query {
      shop {
        url
      }
    }
  `);
  const { data } = await res.json();
  const storeId = data.shop.url
    .replace("https://", "")
    .replace(".myshopify.com", "");
  return { countries, ips, storeId };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("_action");

  let res = null;
  if (actionType === "create") {
    const countryNames = JSON.parse(formData.get("countries"));
    const countryCodes = countryNames.map((name) => {
      const country = masterCountryList.find((c) => c.country === name);
      return country ? country.code : null;
    });
    res = await addCountryToShop(
      session.accessToken,
      countryNames,
      countryCodes,
    );
  } else if (actionType === "create_ip") {
    const ips = JSON.parse(formData.get("ips"));
    res = await addIpToShop(session.accessToken, ips);
  }

  const isCountryAction = actionType === "create";
  const message = isCountryAction
    ? "modify country blocklist"
    : "modify IP blocklist";

  if (!res.ok) {
    return {
      error: true,
      [isCountryAction ? "message" : "messageIp"]: `Failed to ${message}.`,
    };
  }

  return {
    [isCountryAction ? "error" : "errorIp"]: false,
    [isCountryAction ? "message" : "messageIp"]:
      `Successfully ${message.replace("modify", "modified")}.`,
  };
};

export default function CountriesAdmin() {
  const data = useActionData();
  const { countries, ips, storeId } = useLoaderData();
  const [showBanner, setShowBanner] = useState(true);

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedIps, setSelectedIps] = useState([]);

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
    const existingScript = document.querySelector(
      `script[src="https://client.crisp.chat/l.js"]`,
    );
    if (!existingScript) {
      addCrispScript();
    }
  }, []);

  const themeUrl = `https://admin.shopify.com/store/${storeId}/admin/themes/current/editor`

  return (
    <Page title="Manage Blocked Countries">
      <Layout>
        {showBanner && (
          <Layout.Section>
            <Banner
              title="IP Blocker App Embed"
              tone="info"
              onDismiss={() => setShowBanner(false)}
            >
              <p>
                Enable the app block in your theme header to start blocking
                fraudulent traffic.{" "}
                <a href={themeUrl} target="_blank" rel="noopener noreferrer">
                  Manage theme app extensions
                </a>
                .
              </p>
            </Banner>
            <Text variant="headingMd" as="h5"></Text>
          </Layout.Section>
        )}
        <Layout.Section>
          <Card sectioned>
            <Text variant="headingMd" as="h5">
              Select the countries that you want to block access to.
            </Text>
            <Form method="post">
              <input type="hidden" name="_action" value="create" />
              <MultiSelect
                selectedOptions={countries.map((c) => c.country)}
                placeholder={"Add countries to block"}
                options={masterCountryList.map((c) => c.country)}
                onUpdate={setSelectedOptions}
              />
              <br />
              <input
                type="hidden"
                name="countries"
                value={JSON.stringify(selectedOptions)}
              />
              <Button submit primary>
                Save
              </Button>
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
          <Card sectioned>
            <Text variant="headingMd" as="h5">
              Select the IPs that you want to block access to.
            </Text>
            <Form method="post">
              <input type="hidden" name="_action" value="create_ip" />
              <MultiSelect
                selectedOptions={ips}
                placeholder={"Add IPs separated by comma to block"}
                options={[]}
                onUpdate={setSelectedIps}
              />
              <br />
              <input
                type="hidden"
                name="ips"
                value={JSON.stringify(selectedIps)}
              />
              <Button submit primary>
                Save
              </Button>
            </Form>
          </Card>
        </Layout.Section>
        <Layout.Section>
          {data && data.messageIp && (
            <Banner
              title={data.messageIp}
              status={data.errorIp ? "critical" : "success"}
            />
          )}
        </Layout.Section>
        <Layout.Section>
          <Card sectioned>
            <Text>
              View our <Link to="/app/roadmap">Roadmap</Link> to see what we are
              working on to make IPBlocker even more powerful for you.
            </Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
