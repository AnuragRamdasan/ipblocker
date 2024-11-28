import React, { useEffect, useState } from "react";
import {
  Layout,
  Card,
  Text,
  IndexTable,
  InlineGrid,
  EmptySearchResult,
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
      name: "Blocked by Whitelist",
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
    .filter((_, index) => {
      // Show only 10 rows if the customer is not on the premium plan
      if (!isFeatureAllowed(customer, "reporting")) {
        return index < 10;
      }
      return true;
    })
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

  const emptyStateMarkup = (
    <EmptySearchResult
      title={"No traffic blocked yet"}
      description={
        "Wait for some traffic to come in and we will show you the details here."
      }
      withIllustration
    />
  );

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
                <div style={{ position: "relative" }}>
                  <Text variant="headingMd" as="h3">
                    {stat.name}
                  </Text>
                  <Text variant="heading2xl" as="p">
                    {stat.value}
                  </Text>
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
              emptyState={emptyStateMarkup}
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
