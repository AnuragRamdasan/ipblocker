import { useLoaderData, Form, Link, useActionData } from "@remix-run/react";
import { Page, Layout, Card, Button, Text, Banner } from "@shopify/polaris";
import masterCountryList from "./masterCountryList";
import { useEffect } from "react";
import { useState } from "react";
import {
  addCityToShop,
  addCountryToShop,
  addIpToShop,
  addWhitelistCountryToShop,
  getCountriesForShop,
} from "../models/countries";
import { authenticate } from "../shopify.server";
import MultiSelect from "../components/MultiSelect";

export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const { countries, ips, whiteList, cities } = await getCountriesForShop(
    session.accessToken,
  );
  const res = await admin.graphql(`
    query {
      shop {
        myshopifyDomain
      }
    }
  `);
  const { data } = await res.json();
  const storeId = data.shop.myshopifyDomain
    .replace("https://", "")
    .replace(".myshopify.com", "");

  return { countries, ips, storeId, whiteList, cities };
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
  } else if (actionType === "create_whitelist") {
    const countryNames = JSON.parse(formData.get("countries"));
    const countryCodes = countryNames.map((name) => {
      const country = masterCountryList.find((c) => c.country === name);
      return country ? country.code : null;
    });
    res = await addWhitelistCountryToShop(
      session.accessToken,
      countryNames,
      countryCodes,
    );
  } else if (actionType === "create_cities") {
    const cities = JSON.parse(formData.get("cities"));
    res = await addCityToShop(session.accessToken, cities);
  }

  // Determine the type of action and set the appropriate message
  const actionMessages = {
    create: "modify country blocklist",
    create_whitelist: "modify country whitelist",
    create_ip: "modify IP blocklist",
    create_cities: "modify city blocklist",
  };

  const message = actionMessages[actionType] || "perform action";

  // Determine which property names to use based on the action type
  const getPropertyNames = (actionType) => {
    switch (actionType) {
      case "create":
        return { error: "error", message: "message" };
      case "create_whitelist":
        return { error: "errorWhitelist", message: "messageWhitelist" };
      case "create_ip":
        return { error: "errorIp", message: "messageIp" };
      case "create_cities":
        return { error: "errorCities", message: "messageCities" };
      default:
        return { error: "error", message: "message" };
    }
  };

  const { error: errorProp, message: messageProp } =
    getPropertyNames(actionType);

  // Return appropriate response based on the result
  if (!res.ok) {
    return {
      [errorProp]: true,
      [messageProp]: `Failed to ${message}.`,
    };
  }

  return {
    [errorProp]: false,
    [messageProp]: `Successfully ${message.replace("modify", "modified")}.`,
  };
};

export default function CountriesAdmin() {
  const data = useActionData();
  const { countries, ips, storeId, whiteList, cities } = useLoaderData();
  const [showBanner, setShowBanner] = useState(true);

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedOptionsWhitelist, setSelectedOptionsWhitelist] = useState([]);
  const [selectedIps, setSelectedIps] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);

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

  const themeUrl = `https://admin.shopify.com/store/${storeId}/admin/themes/current/editor`;

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
              Select the countries that you want to whitelist.
            </Text>
            <Text>
              If you add countries to whitelist, all countries not in whitelist
              will be blocked. Whitelist supersedes blocklist.
            </Text>
            <Form method="post">
              <input type="hidden" name="_action" value="create_whitelist" />
              <MultiSelect
                selectedOptions={whiteList.map((c) => c.country)}
                placeholder={"Add countries to whitelist"}
                options={masterCountryList.map((c) => c.country)}
                onUpdate={setSelectedOptionsWhitelist}
              />
              <br />
              <input
                type="hidden"
                name="countries"
                value={JSON.stringify(selectedOptionsWhitelist)}
              />
              <Button submit primary>
                Save
              </Button>
            </Form>
          </Card>
        </Layout.Section>
        <Layout.Section>
          {data && data.messageWhitelist && (
            <Banner
              title={data.messageWhitelist}
              status={data.errorWhitelist ? "critical" : "success"}
            />
          )}
        </Layout.Section>
        <Layout.Section>
          <Card
            sectioned
            background={
              whiteList.length > 0 ? "bg-surface-secondary" : "bg-surface"
            }
          >
            <Text variant="headingMd" as="h5">
              Select the countries that you want to block access to.
            </Text>
            <Text>
              If you add countries to blocklist, all countries in blocklist will find the website inaccessible. Country blocklist supersedes city blocklist.
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
              <Button submit primary disabled={whiteList.length > 0}>
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
              Select the cities and zip codes you want to block access to.
            </Text>
            <Text>
              If you add cities to blocklist, all cities in blocklist will find the website inaccessible. City blocklist supersedes ip blocklist.
            </Text>
            <Form method="post">
              <input type="hidden" name="_action" value="create_cities" />
              <MultiSelect
                selectedOptions={cities.map((c) => c.city)}
                placeholder={
                  "Add city and optionally a zip code (e.g., New York or New York 10001)"
                }
                options={[]}
                onUpdate={setSelectedCities}
              />
              <br />
              <input
                type="hidden"
                name="cities"
                value={JSON.stringify(selectedCities)}
              />
              <Button submit primary>
                Save
              </Button>
            </Form>
          </Card>
        </Layout.Section>
        <Layout.Section>
          {data && data.messageCities && (
            <Banner
              title={data.messageCities}
              status={data.messageCities ? "critical" : "success"}
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
