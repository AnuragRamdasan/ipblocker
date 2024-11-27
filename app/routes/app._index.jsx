import { Suspense, lazy } from "react";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, Tabs, Spinner } from "@shopify/polaris";
import masterCountryList from "./masterCountryList";
import { useEffect } from "react";
import { useState } from "react";
import { getCountriesForShop } from "../models/countries";
import { authenticate } from "../shopify.server";
import { getConfig } from "../models/configuration";
import { actions, analytics } from "../utils/segment_analytics";
import EmbedEnablePage from "../components/EmbedEnablePage";
import WhitelistDashboard from "../components/Index/WhitelistDashboard";
import BlocklistDashboard from "../components/Index/BlocklistDashboard";
import ReportingDashboard from "../components/Index/ReportingDashboard";
import BasicUpgradeBanner from "../components/Index/BasicUpgradeBanner";
import { getCurrentPlan } from "../models/planGating";
import { useMantle } from "@heymantle/react";

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
  const { customer } = useMantle();
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
      id: "reporting",
      content: "Reporting",
      accessibilityLabel: "Reporting",
      panelID: "reporting-content",
    },
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

  // 3. Lazy load non-critical tabs
  const TabComponents = {
    0: ReportingDashboard,
    1: BlocklistDashboard,
    2: WhitelistDashboard,
    3: lazy(() => import("../components/Index/StylingDashboard")),
  };

  // 4. Optimize initial render
  const ActiveTabComponent = TabComponents[selected];

  return (
    <Page title="Manage Blocked Countries">
      <Layout>
        <Layout.Section>
          {newConfig.basic_upgrade_banner_dismissed !== "1" &&
            customer &&
            getCurrentPlan(customer) === "Free" && <BasicUpgradeBanner />}
        </Layout.Section>
        <Layout.Section>
          <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} />
          <Suspense fallback={<Spinner />}>
            {selected === 0 && <ReportingDashboard />}
            {selected === 1 && (
              <BlocklistDashboard
                whiteList={newWhiteList}
                masterCountryList={masterCountryList}
                selectedCountries={selectedCountries}
                selectedCities={selectedCities}
                selectedIps={selectedIps}
                setSelectedCountries={setSelectedCountries}
                setSelectedCities={setSelectedCities}
                setSelectedIps={setSelectedIps}
              />
            )}
            {selected === 2 && (
              <WhitelistDashboard
                whiteList={newWhiteList}
                masterCountryList={masterCountryList}
                setWhiteList={setNewWhiteList}
              />
            )}
            {selected === 3 && (
              <ActiveTabComponent config={newConfig} setConfig={setNewConfig} />
            )}
          </Suspense>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
