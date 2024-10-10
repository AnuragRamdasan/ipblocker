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
import UpgradePlanOverlay from "./UpgradePlanOverlay";

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
    if (isFeatureAllowed(customer, "reporting")) {
      fetchData();
    }
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

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
          <IndexTable.Cell>{formatDate(blockedAt)}</IndexTable.Cell>
          <IndexTable.Cell>{latitude}</IndexTable.Cell>
          <IndexTable.Cell>{longitude}</IndexTable.Cell>
        </IndexTable.Row>
      ),
    );

  useEffect(() => {
    if (!isFeatureAllowed(customer, "reporting")) {
      // Add dummy data for demonstration purposes
      const dummyAnalytics = [
        {
          eventName: "ip_blocked",
          id: "1",
          ip: "192.168.1.1",
          city: "New York",
          country: "United States",
          zip: "10001",
          blockedAt: "2023-06-01T12:00:00Z",
          latitude: "40.7128",
          longitude: "-74.0060",
        },
        {
          eventName: "country_blocked",
          id: "2",
          ip: "203.0.113.0",
          city: "London",
          country: "United Kingdom",
          zip: "SW1A 1AA",
          blockedAt: "2023-06-02T14:30:00Z",
          latitude: "51.5074",
          longitude: "-0.1278",
        },
        {
          eventName: "country_whitelisted",
          id: "3",
          ip: "198.51.100.0",
          city: "Toronto",
          country: "Canada",
          zip: "M5H 2N2",
          blockedAt: "2023-06-03T09:15:00Z",
          latitude: "43.6532",
          longitude: "-79.3832",
        },
      ];

      // Merge dummy data with existing analytics
      setAnalytics(dummyAnalytics);
    }
  }, [customer]);

  return (
    <div>
      {!isFeatureAllowed(customer, "reporting") && (
        <Layout.Section>
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
        </Layout.Section>
      )}
      <Layout.Section>
        <Card sectioned>
          <Text variant="headingMd" as="h6">
            Overview{" "}
            {isFeatureAllowed(customer, "reporting")
              ? ""
              : " (Dummy data. Upgrade your plan to see more details)"}
          </Text>
          <br />
          <InlineGrid columns={4} gap="400" background="bg-fill-success">
            {stats.map((stat, index) => (
              <Card key={index}>
                <div style={{ position: "relative" }}>
                  <Text variant="headingMd" as="h3">
                    {stat.name}
                  </Text>
                  <Text variant="heading2xl" as="p">
                    {stat.value}
                  </Text>
                  {!isFeatureAllowed(customer, "reporting") && (
                    <UpgradePlanOverlay />
                  )}
                </div>
              </Card>
            ))}
          </InlineGrid>
        </Card>
      </Layout.Section>
      <Layout.Section>
        <div style={{ position: "relative" }}>
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
          {!isFeatureAllowed(customer, "reporting") && <UpgradePlanOverlay />}
        </div>
      </Layout.Section>
    </div>
  );
}

export default ReportingDashboard;
