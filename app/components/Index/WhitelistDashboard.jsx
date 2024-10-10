import { Card, Text, Button } from "@shopify/polaris";
import { SaveBar } from "@shopify/app-bridge-react";
import MultiSelect from "../MultiSelect";
import { addWhitelistCountryToShop } from "../../models/countries";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  return { token: session.accessToken };
};

const WhitelistDashboard = ({ whiteList, masterCountryList, setWhiteList }) => {
  const { token } = useLoaderData();
  const [selectedOptionsWhitelist, setSelectedOptionsWhitelist] = useState(
    whiteList.map((c) => c.country),
  );

  const loadToast = (message) =>
    shopify.toast.show(message, { duration: 4000 });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const countryCodes = selectedOptionsWhitelist.map((name) => {
      const country = masterCountryList.find((c) => c.country === name);
      return country ? country.code : null;
    });

    const res = await addWhitelistCountryToShop(
      token,
      selectedOptionsWhitelist,
      countryCodes,
    );

    if (!res.ok) {
      loadToast("Failed to modify whitelist. Please try again.");
      setSelectedOptionsWhitelist(whiteList.map((c) => c.country));
    } else {
      setWhiteList(
        masterCountryList.filter((c) =>
          selectedOptionsWhitelist.includes(c.country),
        ),
      );
      loadToast("Successfully modified countries in whitelist.");
      shopify.saveBar.hide("my-save-bar");
    }
  };

  const handleDiscard = (e) => {
    shopify.saveBar.hide("my-save-bar");
  };

  const handleUpdate = (e) => {
    setSelectedOptionsWhitelist(e);
    shopify.saveBar.show("my-save-bar");
  };

  return (
    <Card sectioned>
      <Text variant="headingMd" as="h5">
        Select the countries that you want to whitelist.
      </Text>
      <Text>
        If you add countries to whitelist, all countries not in whitelist will
        be blocked. Whitelist supersedes blocklist.
      </Text>
      <form onSubmit={handleSubmit}>
        <MultiSelect
          selectedOptions={selectedOptionsWhitelist}
          placeholder={"Add countries to whitelist"}
          options={masterCountryList.map((c) => c.country)}
          onUpdate={handleUpdate}
        />
      </form>
      <SaveBar id="my-save-bar">
        <button variant="primary" onClick={handleSubmit}></button>
        <button onClick={handleDiscard}></button>
      </SaveBar>
    </Card>
  );
};

export default WhitelistDashboard;
