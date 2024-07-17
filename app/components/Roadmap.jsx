import React from 'react';
import { Badge, Card, Layout, BlockStack, InlineStack, Text, ProgressBar } from '@shopify/polaris';

const Roadmap = () => {
  return (
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Text variant="headingMd" as="h2">Our app is constantly evolving. Here's a sneak peek at what we're working on:</Text>
            <br />
            <BlockStack vertical gap="600">
              <Card sectioned>
                <InlineStack>
                Status: &nbsp;
                <div style={{width: "100px"}}>
                  <ProgressBar progress={100} animated={true} tone="success"/>
                </div>
                </InlineStack>
                <Text>🚫 Enable blocking of all primary countries which are potential source of spam traffic for a merchant.</Text>                
              </Card>
              <Card sectioned>
                <InlineStack>
                Status: &nbsp;
                <div style={{width: "100px"}}>
                  <ProgressBar progress={100} animated={true} tone="success"/>
                </div>
                </InlineStack>
                <Text>💬 Enable merchants to reach out and request features.</Text>                
              </Card>
              <Card sectioned>
                <InlineStack>
                Status: &nbsp;
                <div style={{width: "100px"}}>
                  <ProgressBar progress={50} animated={true} tone="success"/>
                </div>
                </InlineStack>
                <Text>⛔ Enable IP level blocking for deeper control over blacklisting rules.</Text>                
              </Card>
              <Card sectioned>
                <InlineStack>
                Status: &nbsp;
                <div style={{width: "100px"}}>
                  <ProgressBar progress={0} animated={true} tone="success"/>
                </div>
                </InlineStack>
                <Text>✅ Enable IP level whitelisting to enable certain IPs from blocked countries.</Text>                
              </Card>
              <Card sectioned>
                <InlineStack>
                Status: &nbsp;
                <div style={{width: "100px"}}>
                  <ProgressBar progress={0} animated={true} tone="success"/>
                </div>
                </InlineStack>
                <Text>📈 Enable blocking analytics for merchants to understand better the source of spam traffic.</Text>                
              </Card>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
  );
};

export default Roadmap;