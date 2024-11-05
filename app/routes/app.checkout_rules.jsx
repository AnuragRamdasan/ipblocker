import { useState } from "react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  Select,
  Banner,
  DataTable,
} from "@shopify/polaris";
import { SaveBar } from "@shopify/app-bridge-react";
import { addOrCreateConfig, getConfig } from "../models/configuration";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import masterCountryList from "./masterCountryList";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const config = await getConfig(session.accessToken);
  if (config.checkout_blocked_config) {
    return {
      token: session.accessToken,
      config: JSON.parse(config.checkout_blocked_config),
    };
  }
  return { token: session.accessToken, config: [] };
};

export default function CheckoutRules() {
  const { token, config } = useLoaderData();

  const [rules, setRules] = useState(config || []);
  const [newRule, setNewRule] = useState({
    key: "email",
    value: "",
  });

  const ruleTypes = [
    { label: "Email", value: "email" },
    { label: "Phone Number", value: "phone" },
    { label: "ZIP Code", value: "zip" },
    { label: "Country", value: "country" },
  ];

  const loadToast = (message) =>
    shopify.toast.show(message, { duration: 4000 });

  const handleAddRule = () => {
    if (!newRule.value.trim()) return;

    setRules([...rules, { ...newRule, id: Date.now() }]);
    setNewRule({ ...newRule, value: "" });
  };

  const handleRemoveRule = (id) => {
    setRules(rules.filter((rule) => rule.id !== id));
    shopify.saveBar.show("my-save-bar");
  };

  const rows = rules.map((rule) => [
    rule.key.charAt(0).toUpperCase() + rule.key.slice(1),
    rule.value,
    <Button destructive onClick={() => handleRemoveRule(rule.id)}>
      Remove
    </Button>,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rules.find((rule) => rule.key === "country")) {
      rules.find((rule) => rule.key === "country").value = extractCountryCode(
        rules.find((rule) => rule.key === "country").value,
      );
    }

    const conf = { checkout_blocked_config: JSON.stringify(rules) };
    const res = await addOrCreateConfig(token, conf);

    if (!res.ok) {
      loadToast("Failed to modify configuration. Please try again.");
    } else {
      console.log(await res.json());
      loadToast("Successfully modified configuration.");
      shopify.saveBar.hide("my-save-bar");
    }
  };

  const handleDiscard = () => {
    shopify.saveBar.hide("my-save-bar");
  };

  const extractCountryCode = (country) => {
    const countryCode = masterCountryList.find(
      (c) => c.country === country,
    )?.code;
    return countryCode || country;
  };

  return (
    <Page title="Checkout Rules">
      <Layout>
        <form data-save-bar onSubmit={handleSubmit} style={{ width: "100%" }}>
          <Layout.Section>
            <Card sectioned>
              <Select
                label="Rule Type"
                options={ruleTypes}
                value={newRule.key}
                onChange={(value) => setNewRule({ ...newRule, key: value })}
              />
              <TextField
                label="Value to block"
                value={newRule.value}
                onChange={(value) => setNewRule({ ...newRule, value: value })}
                placeholder={
                  newRule.key === "email"
                    ? "example@domain.com"
                    : newRule.key === "phone"
                      ? "+1234567890"
                      : newRule.key === "zip"
                        ? "123456"
                        : "Country name"
                }
              />
              <Button primary onClick={handleAddRule}>
                Add Rule
              </Button>
            </Card>
          </Layout.Section>

          <Layout.Section>
            {rules.length > 0 ? (
              <Card>
                <DataTable
                  columnContentTypes={["text", "text", "text"]}
                  headings={["Key", "Value", "Actions"]}
                  rows={rows}
                />
              </Card>
            ) : (
              <Banner status="info">
                No rules added yet. Add rules above to start blocking checkout
                attempts.
              </Banner>
            )}
          </Layout.Section>
        </form>
        <SaveBar id="my-save-bar">
          <button variant="primary" onClick={handleSubmit}></button>
          <button onClick={handleDiscard}></button>
        </SaveBar>
      </Layout>
    </Page>
  );
}
