import { Page } from "@shopify/polaris";
import StylingDashboard from "../components/Index/StylingDashboard";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { getConfig } from "../models/configuration";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const token = session.accessToken;
  const config = await getConfig(token);
  return { config, token };
};

export default function Styling() {
  const { config, token } = useLoaderData();
  return (
    <Page title="Advanced Styling">
      <StylingDashboard config={config} token={token} />
    </Page>
  );
}
