import { Page } from "@shopify/polaris";
import { useMantle } from "@heymantle/react";
import { useEffect } from "react";

export const loader = async ({ request }) => {
  return {};
};

export const action = async ({ request }) => {
  return null;
};

export default function Billing() {
  const { createHostedSession } = useMantle();

  const openBillingPage = async () => {
    try {
      const session = await createHostedSession({ type: "plans" });

      if (session && session.url) {
        console.log("Hosted session URL:", session.url);
        window.open(session.url, "_self");
      } else {
        console.error("Invalid session or missing URL");
      }
    } catch (error) {
      console.error("Error creating hosted session:", error);
    }
  };

  useEffect(() => {
    openBillingPage();
  }, []);

  return <Page title="Your Billing"></Page>;
}
