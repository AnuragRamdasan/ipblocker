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
import StylingDashboard from "../components/Index/StylingDashboard";

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
  const token = session.accessToken;

  const [{ countries, ips, whiteList, cities }, config] = await Promise.all([
    getCountriesForShop(token),
    getConfig(token).then((result) => result || {}),
  ]);

  return {
    token,
    storeId,
    countries,
    ips,
    whiteList,
    cities,
    config,
  };
};

export default function CountriesAdmin() {
  const { token, storeId, countries, ips, whiteList, cities, config } =
    useLoaderData();
  const [showBanner, setShowBanner] = useState(config.embed_enabled !== "true");

  const [selectedCountries, setSelectedCountries] = useState(
    countries.map((c) => c.country),
  );
  const [selectedIps, setSelectedIps] = useState(ips);
  const [selectedCities, setSelectedCities] = useState(
    cities.map((c) => c.city),
  );
  const [selected, setSelected] = useState(0);

  const [newWhiteList, setNewWhiteList] = useState(whiteList);
  const [newConfig, setNewConfig] = useState(config);
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
    {
      id: "styling",
      content: "Styling",
      accessibilityLabel: "Customize blocked page styling",
      panelID: "styling-content",
    },
  ];

  const handleTabChange = (selectedTabIndex) => {
    analytics.track(actions.TAB_CHANGED, {
      tab: tabs[selectedTabIndex].id,
    });
    setSelected(selectedTabIndex);
  };

  const [isChecking, setIsChecking] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const checkEmbedStatus = async () => {
      if (enabled && showBanner) {
        setIsChecking(true);
        try {
          const config = await getConfig(token);
          setNewConfig(config);
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
          {newConfig.basic_upgrade_banner_dismissed !== "1" && (
            <BasicUpgradeBanner />
          )}
        </Layout.Section>
        <Layout.Section>
          <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
            {selected === 0 && (
              <BlocklistDashboard
                whiteList={newWhiteList}
                masterCountryList={masterCountryList}
                selectedCountries={selectedCountries}
                selectedCities={selectedCities}
                selectedIps={selectedIps}
              />
            )}
            {selected === 1 && (
              <WhitelistDashboard
                whiteList={newWhiteList}
                masterCountryList={masterCountryList}
                setWhiteList={setNewWhiteList}
              />
            )}
            {selected === 2 && <BasicPlanDashboard config={newConfig} />}
            {selected === 3 && <ReportingDashboard />}
            {selected === 4 && (
              <StylingDashboard config={newConfig} setConfig={setNewConfig} />
            )}
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
