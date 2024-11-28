import { useLoaderData } from "@remix-run/react";
import { Page } from "@shopify/polaris";
import { useEffect } from "react";
import { useState } from "react";
import { authenticate } from "../shopify.server";
import { getConfig } from "../models/configuration";
import EmbedEnablePage from "../components/EmbedEnablePage";
import ReportingDashboard from "../components/Index/ReportingDashboard";

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

  const config = await getConfig(token).then((result) => result || {});

  return {
    token,
    storeId,
    config,
  };
};

export default function CountriesAdmin() {
  const { token, storeId, config } = useLoaderData();
  const [showBanner, setShowBanner] = useState(config.embed_enabled !== "true");

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

  return <ReportingDashboard />;
}
