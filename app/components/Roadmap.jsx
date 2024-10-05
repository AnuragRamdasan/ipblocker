import React from "react";
import {
  Badge,
  Card,
  Layout,
  BlockStack,
  InlineStack,
  Text,
  ProgressBar,
} from "@shopify/polaris";

const Roadmap = () => {
  return (
    <Layout>
      <Layout.Section>
        <Card sectioned>
          <Text variant="headingMd" as="h2">
            Our app is constantly evolving. Here's a sneak peek at what we're
            working on:
          </Text>
          <br />
          <BlockStack vertical gap="600">
            <Card sectioned>
              <InlineStack>
                Status: &nbsp;
                <div style={{ width: "100px" }}>
                  <ProgressBar progress={100} animated={true} tone="success" />
                </div>
              </InlineStack>
              <Text>
                🚫 Enable blocking of all primary countries which are potential
                source of spam traffic for a merchant.
              </Text>
            </Card>
            <Card sectioned>
              <InlineStack>
                Status: &nbsp;
                <div style={{ width: "100px" }}>
                  <ProgressBar progress={100} animated={true} tone="success" />
                </div>
              </InlineStack>
              <Text>
                💬 Enable merchants to reach out and request features.
              </Text>
            </Card>
            <Card sectioned>
              <InlineStack>
                Status: &nbsp;
                <div style={{ width: "100px" }}>
                  <ProgressBar progress={100} animated={true} tone="success" />
                </div>
              </InlineStack>
              <Text>
                ⛔ Enable IP level blocking for deeper control over blacklisting
                rules.
              </Text>
            </Card>
            <Card sectioned>
              <InlineStack>
                Status: &nbsp;
                <div style={{ width: "100px" }}>
                  <ProgressBar progress={100} animated={true} tone="success" />
                </div>
              </InlineStack>
              <Text>
                ⛔ Enable Premium users to remove Value IP Blocker branding.
              </Text>
            </Card>
            <Card sectioned>
              <InlineStack>
                Status: &nbsp;
                <div style={{ width: "100px" }}>
                  <ProgressBar progress={35} animated={true} tone="success" />
                </div>
              </InlineStack>
              <Text>
                ⛔ Enable Premium users to setup redirect rules for blocked
                requests.
              </Text>
            </Card>
            <Card sectioned>
              <InlineStack>
                Status: &nbsp;
                <div style={{ width: "100px" }}>
                  <ProgressBar progress={35} animated={true} tone="success" />
                </div>
              </InlineStack>
              <Text>
                ⛔ Enable Premium users to completely redesign the blocked page.
              </Text>
            </Card>
            <Card sectioned>
              <InlineStack>
                Status: &nbsp;
                <div style={{ width: "100px" }}>
                  <ProgressBar progress={20} animated={true} tone="success" />
                </div>
              </InlineStack>
              <Text>
                ⛔ Enable Premium users to block requests at a product,
                collection and page level.
              </Text>
            </Card>
            <Card sectioned>
              <InlineStack>
                Status: &nbsp;
                <div style={{ width: "100px" }}>
                  <ProgressBar progress={15} animated={true} tone="success" />
                </div>
              </InlineStack>
              <Text>
                ⛔ Enable Premium users to setup internationalization to show
                block page in local languages.
              </Text>
            </Card>
            <Card sectioned>
              <InlineStack>
                Status: &nbsp;
                <div style={{ width: "100px" }}>
                  <ProgressBar progress={0} animated={true} tone="success" />
                </div>
              </InlineStack>
              <Text>
                ⛔ Enable Enterprise users to tag orders as fraud and block
                similar future orders.
              </Text>
            </Card>
            <Card sectioned>
              <InlineStack>
                Status: &nbsp;
                <div style={{ width: "100px" }}>
                  <ProgressBar progress={0} animated={true} tone="success" />
                </div>
              </InlineStack>
              <Text>
                ⛔ Enable Enterprise users to setup block rules for checkout
                page.
              </Text>
            </Card>
            <Card sectioned>
              <InlineStack>
                Status: &nbsp;
                <div style={{ width: "100px" }}>
                  <ProgressBar progress={0} animated={true} tone="success" />
                </div>
              </InlineStack>
              <Text>
                📈 Enable blocking analytics for merchants to understand better
                the source of spam traffic.
              </Text>
            </Card>
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );
};

export default Roadmap;
