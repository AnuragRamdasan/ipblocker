import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  try {
    const { topic, shop, session, admin } = await authenticate.webhook(request);

    if (!admin) {
      // The admin context isn't returned if the webhook fired after a shop was uninstalled.
      return new Response(null, { status: 204 });
    }

    switch (topic) {
      case "APP_UNINSTALLED":
        if (session) {
          await db.session.deleteMany({ where: { shop } });
        }
        break;

      case "CUSTOMERS_DATA_REQUEST":
        // Handle the customers data request
        // This typically involves exporting customer data as required by the GDPR
        await handleCustomersDataRequest(shop, request);
        break;

      case "CUSTOMERS_REDACT":
        // Handle the customers redaction request
        // This typically involves anonymizing customer data as required by the GDPR
        await handleCustomersRedact(shop, request);
        break;

      case "SHOP_REDACT":
        // Handle the shop redaction request
        // This typically involves deleting all shop data as required by the GDPR
        await handleShopRedact(shop);
        break;

      default:
        return new Response("Unhandled webhook topic", { status: 404 });
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

// Example handlers for different GDPR topics
const handleCustomersDataRequest = async (shop, request) => {
  // Implementation for handling customers data request
};

const handleCustomersRedact = async (shop, request) => {
  // Implementation for handling customers redaction request
};

const handleShopRedact = async (shop) => {
  // Implementation for handling shop redaction request
};