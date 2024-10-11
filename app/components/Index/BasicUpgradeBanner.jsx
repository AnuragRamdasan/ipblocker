import { Banner } from "@shopify/polaris";
import { useState, useEffect } from "react";
import { addOrCreateConfig, getConfig } from "../../models/configuration";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }) => {
  const { token } = await authenticate.admin(request);
  return { token };
};

function BasicUpgradeBanner() {
  const [showBanner, setShowBanner] = useState(true);
  const { token } = useLoaderData();

  const handleDismiss = () => {
    setShowBanner(false);
    addOrCreateConfig(token, { basic_upgrade_banner_dismissed: true });
  };

  return (
    showBanner && (
      <Banner
        title="Early Stage Plan"
        status="info"
        action={{ content: "Contact Support", onAction: handleContactSupport }}
        onDismiss={handleDismiss}
      >
        <p>
          Get Value IP Blocker for free for stores with less than $10K in
          monthly revenue.
        </p>
      </Banner>
    )
  );
}

function handleContactSupport() {
  $crisp.push(["do", "chat:open"]);
  $crisp.push([
    "do",
    "message:send",
    ["text", "I would like to get on early stage plan"],
  ]);
}

export default BasicUpgradeBanner;
