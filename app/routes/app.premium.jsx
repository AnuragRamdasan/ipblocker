import { Page } from "@shopify/polaris";
import BasicPlanDashboard from "../components/Index/BasicPlanDashboard";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { getConfig } from "../models/configuration";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const token = session.accessToken;
  const config = await getConfig(token);
  console.log("****************");
  console.log(config);
  return { config, token };
};

export default function Premium() {
  const { config, token } = useLoaderData();
  return (
    <Page title="Premium Settings">
      <BasicPlanDashboard config={config} />
    </Page>
  );
}
