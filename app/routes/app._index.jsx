import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { useState } from "react";
import { authenticate } from "../shopify.server";
import { getConfig } from "../models/configuration";
import ReportingDashboard from "../components/Index/ReportingDashboard";
import { Onboarding } from "../components/Onboarding";

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
  const [isChecking, setIsChecking] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [newConfig, setNewConfig] = useState(config || {});

  useEffect(() => {
    const checkEmbedStatus = async () => {
      if (enabled) {
        setIsChecking(true);
        try {
          const config = await getConfig(token);
          setNewConfig(config);
        } catch (error) {
          console.error("Error checking embed status:", error);
        } finally {
          setIsChecking(false);
        }
      }
    };

    const intervalId = setInterval(checkEmbedStatus, 3000); // Check every 3 seconds

    return () => clearInterval(intervalId); // Clean up on unmount
  }, [token, enabled]);

  if (newConfig.rules_setup !== "true" || newConfig.embed_enabled !== "true") {
    return (
      <Onboarding
        storeId={storeId}
        loading={isChecking}
        setEnabled={setEnabled}
        config={newConfig}
      />
    );
  }

  return <ReportingDashboard />;
}
