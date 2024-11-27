import { CalloutCard } from "@shopify/polaris";
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
    addOrCreateConfig(token, { basic_upgrade_banner_dismissed: 1 });
  };

  return (
    showBanner && (
      <CalloutCard
        title="Unlock premium for Free 🎉"
        primaryAction={{
          content: "Contact Support",
          onAction: handleContactSupport,
        }}
        onDismiss={handleDismiss}
      >
        Get access to our premium features like advanced reporting, redirects at
        no cost for stores with less than $10k in monthly revenue. Contact our
        team to unlock the premium for absolutely free.
      </CalloutCard>
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
