import { Card, Text, Banner } from "@shopify/polaris";
import MultiSelect from "../MultiSelect";
import { useState } from "react";
import { SaveBar } from "@shopify/app-bridge-react";
import { updateBlocklist } from "../../models/countries";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  return { token: session.accessToken };
};

const BlocklistDashboard = ({
  whiteList,
  masterCountryList,
  selectedCountries,
  selectedCities,
  selectedIps,
}) => {
  const [countries, setCountries] = useState(selectedCountries);
  const [cities, setCities] = useState(selectedCities);
  const [ips, setIps] = useState(selectedIps);

  const { token } = useLoaderData();

  const loadToast = (message) =>
    shopify.toast.show(message, { duration: 4000 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const countryWithCodes = countries.map((name) => {
      const country = masterCountryList.find((c) => c.country === name);
      return country
        ? { country: country.country, country_code: country.code }
        : null;
    });

    const res = await updateBlocklist(token, countryWithCodes, cities, ips);
    if (!res.ok) {
      loadToast("Failed to modify blocklist. Please try again.");
    } else {
      loadToast("Successfully modified countries in blocklist.");
      shopify.saveBar.hide("my-save-bar");
    }
  };

  const handleDiscard = () => {
    shopify.saveBar.hide("my-save-bar");
  };

  const handleCountryUpdate = (e) => {
    setCountries(e);
    shopify.saveBar.show("my-save-bar");
  };

  const handleCityUpdate = (e) => {
    setCities(e);
    shopify.saveBar.show("my-save-bar");
  };

  const handleIpUpdate = (e) => {
    setIps(e);
    shopify.saveBar.show("my-save-bar");
  };

  return (
    <Card sectioned>
      {whiteList.length > 0 && (
        <>
          <Banner tone="info">
            Whitelist is enabled. You can't add countries to blocklist.
          </Banner>
          <br />
        </>
      )}
      <Text variant="headingMd" as="h5">
        Select the countries that you want to block access to.
      </Text>
      <Text>
        If you add countries to blocklist, all countries in blocklist will find
        the website inaccessible. Country blocklist supersedes city blocklist.
      </Text>
      <form onSubmit={handleSubmit}>
        <MultiSelect
          selectedOptions={countries}
          placeholder={"Add countries to block"}
          options={masterCountryList.map((c) => c.country)}
          onUpdate={handleCountryUpdate}
          disabled={whiteList.length > 0}
        />
        <br />
        <Text variant="headingMd" as="h5">
          Select the cities and zip codes you want to block access to.
        </Text>
        <Text>
          If you add cities to blocklist, all cities in blocklist will find the
          website inaccessible. City blocklist supersedes ip blocklist.
        </Text>
        <MultiSelect
          selectedOptions={cities}
          placeholder={
            "Add city and optionally a zip code (e.g., New York or New York 10001)"
          }
          options={[]}
          onUpdate={handleCityUpdate}
          disabled={whiteList.length > 0}
        />
        <br />
        <Text variant="headingMd" as="h5">
          Select the IPs that you want to block access to.
        </Text>
        <MultiSelect
          selectedOptions={ips}
          placeholder={"Add IPs separated by comma to block"}
          options={[]}
          onUpdate={handleIpUpdate}
          disabled={whiteList.length > 0}
        />
      </form>
      <SaveBar id="my-save-bar">
        <button variant="primary" onClick={handleSubmit}></button>
        <button onClick={handleDiscard}></button>
      </SaveBar>
    </Card>
  );
};

export default BlocklistDashboard;
