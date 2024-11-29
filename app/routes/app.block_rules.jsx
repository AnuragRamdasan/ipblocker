import { useLoaderData } from "@remix-run/react";
import { Page } from "@shopify/polaris";
import masterCountryList from "./masterCountryList";
import { useState } from "react";
import { getCountriesForShop } from "../models/countries";
import { authenticate } from "../shopify.server";
import { getConfig } from "../models/configuration";
import BlocklistDashboard from "../components/Index/BlocklistDashboard";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const token = session.accessToken;

  const [{ countries, ips, whiteList, cities }, config] = await Promise.all([
    getCountriesForShop(token),
    getConfig(token).then((result) => result || {}),
  ]);

  return {
    token,
    countries,
    ips,
    whiteList,
    cities,
    config,
  };
};

export default function CountriesAdmin() {
  const { token, countries, ips, whiteList, cities } = useLoaderData();

  const [selectedCountries, setSelectedCountries] = useState(
    countries.map((c) => c.country),
  );
  const [selectedIps, setSelectedIps] = useState(ips);
  const [selectedCities, setSelectedCities] = useState(
    cities.map((c) => c.city),
  );
  const [newWhiteList, setNewWhiteList] = useState(whiteList);

  return (
    <Page title="Manage Blocked Countries">
      <BlocklistDashboard
        token={token}
        whiteList={newWhiteList}
        masterCountryList={masterCountryList}
        selectedCountries={selectedCountries}
        selectedCities={selectedCities}
        selectedIps={selectedIps}
      />
    </Page>
  );
}
