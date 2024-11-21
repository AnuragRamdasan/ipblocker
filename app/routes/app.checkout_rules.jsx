import { useState } from "react";
import {
  Page,
  Layout,
  Card,
  TextField,
  Button,
  Select,
  Banner,
  DataTable,
  EmptyState,
} from "@shopify/polaris";
import { SaveBar } from "@shopify/app-bridge-react";
import { addOrCreateConfig, getConfig } from "../models/configuration";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import masterCountryList from "./masterCountryList";
import { failedToast, successToast } from "../utils/toast";

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

  const handleAddRule = () => {
    if (!newRule.value.trim()) return;

    setRules([...rules, { ...newRule, id: Date.now() }]);
    setNewRule({ ...newRule, value: "" });
  };

  const handleAddRuleRow = () => {
    setRules([...rules, { id: Date.now(), key: "email", value: "" }]);
  };

  const handleRemoveRule = (id) => {
    setRules(rules.filter((rule) => rule.id !== id));
    shopify.saveBar.show("my-save-bar");
  };

  const rows = rules.map((rule) => [
    <Select
      options={ruleTypes}
      value={rule.key}
      onChange={(value) => {
        const updatedRules = rules.map((r) =>
          r.id === rule.id ? { ...r, key: value } : r,
        );
        setRules(updatedRules);
        shopify.saveBar.show("my-save-bar");
      }}
    />,
    <TextField
      value={rule.value}
      onChange={(value) => {
        const updatedRules = rules.map((r) =>
          r.id === rule.id ? { ...r, value } : r,
        );
        setRules(updatedRules);
        shopify.saveBar.show("my-save-bar");
      }}
    />,
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
      failedToast();
    } else {
      successToast();
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
        <Layout.Section>
          <Banner title="Block Unwanted Checkout Attempts" tone="info">
            <p>
              Create rules to block checkout attempts based on customer email,
              phone number, ZIP code, or country. Any checkout matching these
              rules will be automatically blocked.
            </p>
          </Banner>
        </Layout.Section>
        <form data-save-bar onSubmit={handleSubmit} style={{ width: "100%" }}>
          <Layout.Section>
            {rules.length > 0 ? (
              <Card>
                <Button primary onClick={handleAddRuleRow}>
                  + Add Rule
                </Button>
                <DataTable
                  columnContentTypes={["text", "text", "text"]}
                  headings={["Key", "Value", "Actions"]}
                  rows={rows}
                />
              </Card>
            ) : (
              <EmptyState
                heading="Manage your Checkout Page Block Rules"
                action={{ content: "Add Rule", onAction: handleAddRuleRow }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>
                  No rules added yet. Add rules above to start blocking checkout
                  attempts.
                </p>
              </EmptyState>
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
