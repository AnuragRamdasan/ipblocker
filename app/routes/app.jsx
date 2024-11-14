import { MantleProvider } from "@heymantle/react";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import { getMantleCustomer } from "../models/mantleCustomer";
import { useEffect } from "react";
import Rollbar from "rollbar";
import { analytics } from "../utils/segment_analytics";

// Initialize Rollbar
const rollbar = new Rollbar({
  accessToken: import.meta.env.VITE_ROLLBAR_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: process.env.NODE_ENV,
});

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const token = await getMantleCustomer(session.accessToken);
  const shopInfo = await admin.rest.resources.Shop.all({
    session: session,
  });

  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    customerApiToken: token,
    shopName: session.shop,
    shop: shopInfo.data[0],
  };
};

export default function App() {
  const { apiKey, customerApiToken, shop, shopName } = useLoaderData();

  useEffect(() => {
    // Identify the user
    analytics.identify(shopName, shop);

    // Set up Rollbar person tracking
    rollbar.configure({
      payload: {
        person: {
          id: shop,
        },
      },
    });
  }, [shop]);

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
          {(shop.myshopify_domain === "03cdb4.myshopify.com" ||
            shop.myshopify_domain === "vc-checkout-store.myshopify.com" ||
            shop.myshopify_domain === "cholesterol-diet.myshopify.com"
          ) && (
            <Link to="/app/checkout_rules">Checkout Rules</Link>
          )}
          <Link to="/app/billing">Billing</Link>
          <Link to="/app/faqs">FAQs</Link>
          <Link to="/app/roadmap">Roadmap</Link>
        </NavMenu>
        <Outlet />
      </MantleProvider>
    </AppProvider>
  );
}

// Update the ErrorBoundary to log errors to Rollbar
export function ErrorBoundary() {
  const error = useRouteError();

  useEffect(() => {
    rollbar.error(error);
  }, [error]);

  return boundary.error(error);
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
