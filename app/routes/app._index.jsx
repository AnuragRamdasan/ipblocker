import { useLoaderData, Form, Link, useActionData } from "@remix-run/react";
import {
  Page,
  Layout,
  Tabs,
  Card,
  Button,
  Text,
  Banner,
} from "@shopify/polaris";
import masterCountryList from "./masterCountryList";
import { useEffect } from "react";
import { useState } from "react";
import {
  addCityToShop,
  addCountryToShop,
  addIpToShop,
  getCountriesForShop,
} from "../models/countries";
import { authenticate } from "../shopify.server";
import MultiSelect from "../components/MultiSelect";
import { getConfig } from "../models/configuration";
import { actions, analytics } from "../utils/segment_analytics";
import IndexSkeleton from "../components/IndexSelect";
import EmbedEnablePage from "../components/EmbedEnablePage";
import BasicPlanDashboard from "../components/Index/BasicPlanDashboard";
import WhitelistDashboard from "../components/Index/WhitelistDashboard";

export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
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

  return { token: session.accessToken, storeId: storeId };
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
  } else if (actionType === "create_cities") {
    const cities = JSON.parse(formData.get("cities"));
    res = await addCityToShop(session.accessToken, cities);
  }

  // Determine the type of action and set the appropriate message
  const actionMessages = {
    create: "modify country blocklist",
    create_ip: "modify IP blocklist",
    create_cities: "modify city blocklist",
  };

  const message = actionMessages[actionType] || "perform action";

  // Determine which property names to use based on the action type
  const getPropertyNames = (actionType) => {
    switch (actionType) {
      case "create":
        return { error: "error", message: "message" };
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
  const { token, storeId } = useLoaderData();
  const [showBanner, setShowBanner] = useState(true);

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedIps, setSelectedIps] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selected, setSelected] = useState(0);

  const [countries, setCountries] = useState([]);
  const [whiteList, setWhiteList] = useState([]);
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const tabs = [
    {
      id: "blocklist",
      content: "Blocklist",
      accessibilityLabel: "Block countries, cities, and IPs",
      panelID: "blocklist-content",
    },
    {
      id: "whitelist",
      content: "Whitelist",
      accessibilityLabel: "Whitelist countries",
      panelID: "whitelist-content",
    },
    {
      id: "premium",
      content: "Premium",
      accessibilityLabel: "Premium",
      panelID: "premium-content",
    },
  ];

  const handleTabChange = (selectedTabIndex) => {
    analytics.track(actions.TAB_CHANGED, {
      tab: tabs[selectedTabIndex].id,
    });
    setSelected(selectedTabIndex);
  };

  useEffect(() => {
    const fetchData = async () => {
      const { countries, ips, whiteList, cities } =
        await getCountriesForShop(token);
      const config = (await getConfig(token)) || {};

      setCountries(countries);
      setWhiteList(whiteList);
      setConfig(config);

      setSelectedOptions(countries.map((c) => c.country));
      setSelectedIps(ips);
      setSelectedCities(cities.map((c) => c.city));

      setShowBanner(config.embed_enabled !== "true");
      setLoading(false);
    };
    fetchData();
  }, [token]);

  const [isChecking, setIsChecking] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const checkEmbedStatus = async () => {
      if (enabled && showBanner) {
        setIsChecking(true);
        try {
          const config = await getConfig(token);
          if (config && config.embed_enabled === "true") {
            setShowBanner(false);
          }
        } catch (error) {
          console.error("Error checking embed status:", error);
        } finally {
          setIsChecking(false);
        }
      }
    };

    const intervalId = setInterval(checkEmbedStatus, 3000); // Check every 3 seconds

    return () => clearInterval(intervalId); // Clean up on unmount
  }, [token, showBanner, enabled]);

  const themeUrl = `https://admin.shopify.com/store/${storeId}/admin/themes/current/editor?context=apps`;

  if (loading) {
    return <IndexSkeleton />;
  }

  if (showBanner) {
    return (
      <EmbedEnablePage
        url={themeUrl}
        loading={isChecking}
        setEnabled={setEnabled}
      />
    );
  }

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
                Enable the app block in your theme app embeds to start blocking
                fraudulent traffic.{" "}
                <a
                  href={themeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    analytics.track(actions.MANAGE_THEME_APP_EMBEDS_CLICKED);
                    window.open(themeUrl, "_blank", "noopener,noreferrer");
                  }}
                >
                  Manage theme app embeds
                </a>
                .
              </p>
            </Banner>
            <Text variant="headingMd" as="h5"></Text>
          </Layout.Section>
        )}
        <Layout.Section>
          <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
            {selected === 0 && (
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
                  If you add countries to blocklist, all countries in blocklist
                  will find the website inaccessible. Country blocklist
                  supersedes city blocklist.
                </Text>
                <Form method="post">
                  <input type="hidden" name="_action" value="create" />
                  <MultiSelect
                    selectedOptions={selectedOptions}
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
                  <Button
                    submit
                    primary
                    onClick={() => {
                      analytics.track(actions.COUNTRY_BLOCKED, {
                        countries: selectedOptions,
                      });
                      // The form will be submitted automatically by the Button's default behavior
                    }}
                  >
                    Save
                  </Button>
                </Form>
                {data && data.message && (
                  <Banner
                    title={data.message}
                    status={data.error ? "critical" : "success"}
                  />
                )}

                <br />
                <Text variant="headingMd" as="h5">
                  Select the cities and zip codes you want to block access to.
                </Text>
                <Text>
                  If you add cities to blocklist, all cities in blocklist will
                  find the website inaccessible. City blocklist supersedes ip
                  blocklist.
                </Text>
                <Form method="post">
                  <input type="hidden" name="_action" value="create_cities" />
                  <MultiSelect
                    selectedOptions={selectedCities}
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
                  <Button
                    submit
                    primary
                    onClick={() => {
                      analytics.track(actions.CITY_BLOCKED, {
                        cities: selectedCities,
                      });
                      // The form will be submitted automatically by the Button's default behavior
                    }}
                  >
                    Save
                  </Button>
                </Form>
                {data && data.messageCities && (
                  <Banner
                    title={data.messageCities}
                    status={data.messageCities ? "critical" : "success"}
                  />
                )}
                <br />
                <Text variant="headingMd" as="h5">
                  Select the IPs that you want to block access to.
                </Text>
                <Form method="post">
                  <input type="hidden" name="_action" value="create_ip" />
                  <MultiSelect
                    selectedOptions={selectedIps}
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
                  <Button
                    submit
                    primary
                    onClick={() => {
                      analytics.track(actions.IP_BLOCKED, {
                        ips: selectedIps,
                      });
                      // The form will be submitted automatically by the Button's default behavior
                    }}
                  >
                    Save
                  </Button>
                </Form>
                {data && data.messageIp && (
                  <Banner
                    title={data.messageIp}
                    status={data.errorIp ? "critical" : "success"}
                  />
                )}
              </Card>
            )}
            {selected === 1 && (
              <WhitelistDashboard
                whiteList={whiteList}
                masterCountryList={masterCountryList}
              />
            )}
            {selected === 2 && <BasicPlanDashboard config={config} />}
          </Tabs>
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
