import {
  reactExtension,
  useShippingAddress,
  useBuyerJourneyIntercept,
  useShop,
  useEmail,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

const reasons = {
  email: {
    message: "Email not allowed",
    target: "$.cart.buyerIdentity.email",
  },
  phone: {
    message: "Phone not allowed",
    target: "$.cart.deliveryGroups[0].deliveryAddress.phone",
  },
  zip: {
    message: "Zip not allowed",
    target: "$.cart.deliveryGroups[0].deliveryAddress.zip",
  },
  country: {
    message: "Country not allowed",
    target: "$.cart.deliveryGroups[0].deliveryAddress.countryCode",
  } 
};
function Extension() {
  const { zip, phone, countryCode } = useShippingAddress();
  const email = useEmail();

  const shop = useShop();

  useBuyerJourneyIntercept(async ({ canBlockProgress }) => {
    const checkAllowed = async () => {
      try {
        const response = await fetch(
          "https://knitting-composed-thailand-quote.trycloudflare.com/checkout",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              shop: shop.myshopifyDomain,
              checkout_config: { country: countryCode, zip, phone, email },
            }),
          },
        );
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error checking allowed status:", error);
        return { status: false, reason: "Error checking status" };
      }
    };

    const { status, reason } = await checkAllowed();

    if (!status) {
      const all_reasons = reason.split(", ");
      console.log({
        behavior: "block",
        reason: "Not allowed",
        errors: all_reasons.map((r) => {
          return {
            message: reasons[r].message,
            target: reasons[r].target,
          };
        }),
      })
      return {
        behavior: "block",
        reason: "Not allowed",
        errors: all_reasons.map((r) => {
          return {
            message: reasons[r].message,
            target: reasons[r].target,
          };
        }).push({
          message: "This checkout cannot be completed",
          target: "cart",
        }),
      };
    }

    return {
      behavior: "allow",
    };
  });
}
