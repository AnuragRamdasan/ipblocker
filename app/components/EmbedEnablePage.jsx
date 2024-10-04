import React from "react";
import { Page, Layout, Card, Text, Button, Link } from "@shopify/polaris";
import { actions, analytics } from "../utils/segment_analytics";

export default function EmbedEnablePage({ url, loading, setEnabled }) {
  return (
    <Page title="Enable IP Blocker">
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Text variant="headingMd" as="h2">
              Enable Theme App Embed
            </Text>
            <Text variant="bodyMd" as="p">
              To start blocking fraudulent traffic, you need to enable the IP
              Blocker app embed in your theme.
            </Text>
            <Text variant="bodyMd" as="p">
              Follow these steps:
            </Text>
            <ol>
              <li>Click the "Enable App Embed" button below</li>
              <li>In the theme editor, locate the "App embeds" section</li>
              <li>Find "IP Blocker" and click to enable it</li>
              <li>Save the changes in your theme</li>
            </ol>
            <Button
              primary
              loading={loading}
              onClick={() => {
                setEnabled(true);
                analytics.track(actions.MANAGE_THEME_APP_EMBEDS_CLICKED);
                window.open(url, "_blank" + new Date().getTime());
              }}
            >
              Enable App Embed
            </Button>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
