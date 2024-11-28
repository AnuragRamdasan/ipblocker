import { Card, Text, Banner } from "@shopify/polaris";
import MultiSelect from "../MultiSelect";
import { useState } from "react";
import { SaveBar } from "@shopify/app-bridge-react";
import {
  addWhitelistCountryToShop,
  updateBlocklist,
} from "../../models/countries";
import { failedToast, successToast } from "../../utils/toast";

const BlocklistDashboard = ({
  token,
  whiteList,
  masterCountryList,
  selectedCountries,
  selectedCities,
  selectedIps,
  setSelectedCountries,
  setSelectedCities,
  setSelectedIps,
}) => {
  const [countries, setCountries] = useState(selectedCountries);
  const [cities, setCities] = useState(selectedCities);
  const [ips, setIps] = useState(selectedIps);
  const [selectedOptionsWhitelist, setSelectedOptionsWhitelist] = useState(
    whiteList.map((c) => c.country),
  );

  const handleSubmitWhitelist = async (e) => {
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
      failedToast();
      setSelectedOptionsWhitelist(whiteList.map((c) => c.country));
    } else {
      setSelectedOptionsWhitelist(
        masterCountryList.filter((c) =>
          selectedOptionsWhitelist.includes(c.country),
        ),
      );
      successToast();
      shopify.saveBar.hide("whitelist-save-bar");
    }
  };

  const handleSubmitBlocklist = async (e) => {
    e.preventDefault();
    const countryWithCodes = countries.map((name) => {
      const country = masterCountryList.find((c) => c.country === name);
      return country
        ? { country: country.country, country_code: country.code }
        : null;
    });

    const res = await updateBlocklist(token, countryWithCodes, cities, ips);
    if (!res.ok) {
      failedToast();
    } else {
      setSelectedCountries(countries);
      setSelectedCities(cities);
      setSelectedIps(ips);
      successToast();
      shopify.saveBar.hide("blocklist-save-bar");
    }
  };

  const handleDiscard = () => {
    shopify.saveBar.hide("blocklist-save-bar");
    shopify.saveBar.hide("whitelist-save-bar");
  };

  const handleWhitelistUpdate = (e) => {
    setSelectedOptionsWhitelist(e);
    shopify.saveBar.show("whitelist-save-bar");
  };

  const handleCountryUpdate = (e) => {
    setCountries(e);
    shopify.saveBar.show("blocklist-save-bar");
  };

  const handleCityUpdate = (e) => {
    setCities(e);
    shopify.saveBar.show("blocklist-save-bar");
  };

  const handleIpUpdate = (e) => {
    setIps(e);
    shopify.saveBar.show("blocklist-save-bar");
  };

  return (
    <>
      <Card sectioned gap="20px">
        <Text variant="headingMd" as="h5">
          Select the countries that you want to whitelist.
        </Text>
        <Text>
          If you add countries to whitelist, all countries not in whitelist will
          be blocked. Whitelist supersedes blocklist.
        </Text>
        <form onSubmit={handleSubmitWhitelist}>
          <MultiSelect
            selectedOptions={selectedOptionsWhitelist}
            placeholder={"Add countries to whitelist"}
            options={masterCountryList.map((c) => c.country)}
            onUpdate={handleWhitelistUpdate}
          />
        </form>
        <SaveBar id="whitelist-save-bar">
          <button variant="primary" onClick={handleSubmitWhitelist}></button>
          <button onClick={handleDiscard}></button>
        </SaveBar>
      </Card>
      <br />
      <Card sectioned>
        {selectedOptionsWhitelist.length > 0 && (
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
          If you add countries to blocklist, all countries in blocklist will
          find the website inaccessible. Country blocklist supersedes city
          blocklist.
        </Text>
        <form onSubmit={handleSubmitBlocklist}>
          <MultiSelect
            selectedOptions={countries}
            placeholder={"Add countries to block"}
            options={masterCountryList.map((c) => c.country)}
            onUpdate={handleCountryUpdate}
            disabled={selectedOptionsWhitelist.length > 0}
          />
          <br />
          <Text variant="headingMd" as="h5">
            Select the cities and zip codes you want to block access to.
          </Text>
          <Text>
            If you add cities to blocklist, all cities in blocklist will find
            the website inaccessible. City blocklist supersedes ip blocklist.
          </Text>
          <MultiSelect
            selectedOptions={cities}
            placeholder={
              "Add city and optionally a zip code (e.g., New York or New York 10001)"
            }
            options={[]}
            onUpdate={handleCityUpdate}
            disabled={selectedOptionsWhitelist.length > 0}
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
            disabled={selectedOptionsWhitelist.length > 0}
          />
        </form>
        <SaveBar id="blocklist-save-bar">
          <button variant="primary" onClick={handleSubmitBlocklist}></button>
          <button onClick={handleDiscard}></button>
        </SaveBar>
      </Card>
    </>
  );
};

export default BlocklistDashboard;
