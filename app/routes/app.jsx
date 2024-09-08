import { MantleProvider } from "@heymantle/react";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import { getMantleCustomer } from "../models/mantleCustomer";
import { useEffect } from "react";
import { analytics } from "../utils/segment_analytics";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const token = await getMantleCustomer(session.accessToken);
  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    customerApiToken: token,
    shop: session.shop,
  };
};

export default function App() {
  const { apiKey, customerApiToken, shop } = useLoaderData();

  useEffect(() => {
    // Identify the user
    analytics.identify(shop);
  }, []);

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <MantleProvider
        appId={import.meta.env.VITE_MANTLE_APP_ID}
        customerApiToken={customerApiToken}
        apiUrl={import.meta.env.VITE_MANTLE_API_URL}
      >
        <NavMenu>
          <Link to="/app" rel="home">
            Home
          </Link>
          <Link to="/app/billing">Billing</Link>
          <Link to="/app/roadmap">Roadmap</Link>
        </NavMenu>
        <Outlet />
      </MantleProvider>
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
