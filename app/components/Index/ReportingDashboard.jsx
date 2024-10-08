import React, { useEffect, useState } from "react";
import {
  Layout,
  Card,
  Text,
  IndexTable,
  InlineGrid,
  Banner,
  List,
} from "@shopify/polaris";
import { getAnalytics } from "../../models/analytics";
import { useLoaderData } from "@remix-run/react";
import { isFeatureAllowed } from "../../models/planGating";
import { useMantle } from "@heymantle/react";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  return { token: session.accessToken };
};

function ReportingDashboard() {
  const { token } = useLoaderData();
  const [analytics, setAnalytics] = useState([]);
  const { customer } = useMantle();

  useEffect(() => {
    async function fetchData() {
      const analyticsData = await getAnalytics(token);
      setAnalytics(analyticsData);
    }
    fetchData();
  }, []);

  const stats = [
    {
      name: "Total IPs Tracked",
      value: analytics.filter((item) => item.eventName === "ip_tracked").length,
    },
    {
      name: "IPs Blocked",
      value: analytics.filter((item) => item.eventName === "ip_blocked").length,
    },
    {
      name: "Countries Blocked",
      value: analytics.filter((item) => item.eventName === "country_blocked")
        .length,
    },
    {
      name: "Countries Whitelisted",
      value: analytics.filter(
        (item) => item.eventName === "country_whitelisted",
      ).length,
    },
  ];

  const rowMarkup = analytics
    .filter((item) => item.eventName !== "ip_tracked")
    .map(
      (
        {
          eventName,
          id,
          ip,
          city,
          country,
          zip,
          blockedAt,
          latitude,
          longitude,
        },
        index,
      ) => (
        <IndexTable.Row id={id} key={id} position={index}>
          <IndexTable.Cell>
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {eventName}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>{ip}</IndexTable.Cell>
          <IndexTable.Cell>{city}</IndexTable.Cell>
          <IndexTable.Cell>{country}</IndexTable.Cell>
          <IndexTable.Cell>{zip}</IndexTable.Cell>
          <IndexTable.Cell>{latitude}</IndexTable.Cell>
          <IndexTable.Cell>{longitude}</IndexTable.Cell>
          <IndexTable.Cell>{blockedAt}</IndexTable.Cell>
        </IndexTable.Row>
      ),
    );

  if (!isFeatureAllowed(customer, "reporting")) {
    return (
      <div>
        <Banner
          title="Plan Upgrade Required"
          action={{ url: "/app/billing", content: "Upgrade Plan" }}
          tone="warning"
        >
          <List>
            <List.Item>
              Premium features are not available on the free plan. You can
              enable this feature on our basic plan for just $1.99 per month.
            </List.Item>
          </List>
        </Banner>
      </div>
    );
  }

  return (
    <div>
      <Layout.Section>
        <Card sectioned>
          <Text variant="headingMd" as="h6">
            Overview
          </Text>
          <br />
          <InlineGrid columns={4} gap="400" background="bg-fill-success">
            {stats.map((stat, index) => (
              <Card key={index}>
                <Text variant="headingMd" as="h3">
                  {stat.name}
                </Text>
                <Text variant="heading2xl" as="p">
                  {stat.value}
                </Text>
              </Card>
            ))}
          </InlineGrid>
        </Card>
      </Layout.Section>
      <Layout.Section>
        <Card sectioned title="Geographic Distribution">
          <IndexTable
            itemCount={analytics.length}
            headings={[
              { title: "Block Type" },
              { title: "IP" },
              { title: "City" },
              { title: "Country" },
              { title: "Zip" },
              { title: "Blocked At" },
              { title: "Latitude" },
              { title: "Longitude" },
            ]}
            selectable={false}
          >
            {rowMarkup}
          </IndexTable>
        </Card>
      </Layout.Section>
    </div>
  );
}

export default ReportingDashboard;
