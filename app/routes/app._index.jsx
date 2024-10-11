import { useLoaderData, Link } from "@remix-run/react";
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
import { getCountriesForShop } from "../models/countries";
import { authenticate } from "../shopify.server";
import { getConfig } from "../models/configuration";
import { actions, analytics } from "../utils/segment_analytics";
import IndexSkeleton from "../components/IndexSelect";
import EmbedEnablePage from "../components/EmbedEnablePage";
import BasicPlanDashboard from "../components/Index/BasicPlanDashboard";
import WhitelistDashboard from "../components/Index/WhitelistDashboard";
import BlocklistDashboard from "../components/Index/BlocklistDashboard";
import ReportingDashboard from "../components/Index/ReportingDashboard";
import BasicUpgradeBanner from "../components/Index/BasicUpgradeBanner";

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

export default function CountriesAdmin() {
  const { token, storeId } = useLoaderData();
  const [showBanner, setShowBanner] = useState(true);

  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedIps, setSelectedIps] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selected, setSelected] = useState(0);

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
    {
      id: "reporting",
      content: "Reporting",
      accessibilityLabel: "Reporting",
      panelID: "reporting-content",
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

      setWhiteList(whiteList);
      setConfig(config);

      setSelectedCountries(countries.map((c) => c.country));
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
          setConfig(config);
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
        <Layout.Section>
          {config.basic_upgrade_banner_dismissed !== "1" && (
            <BasicUpgradeBanner />
          )}
        </Layout.Section>
        <Layout.Section>
          <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
            {selected === 0 && (
              <BlocklistDashboard
                whiteList={whiteList}
                masterCountryList={masterCountryList}
                selectedCountries={selectedCountries}
                selectedCities={selectedCities}
                selectedIps={selectedIps}
              />
            )}
            {selected === 1 && (
              <WhitelistDashboard
                whiteList={whiteList}
                masterCountryList={masterCountryList}
                setWhiteList={setWhiteList}
              />
            )}
            {selected === 2 && <BasicPlanDashboard config={config} />}
            {selected === 3 && <ReportingDashboard />}
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
