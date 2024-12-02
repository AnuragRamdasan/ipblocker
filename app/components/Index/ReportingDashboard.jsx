import React, { useEffect, useState } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  IndexTable,
  InlineGrid,
  EmptySearchResult,
  TextField,
  Pagination,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

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

  const filteredAnalytics = analytics
    .filter((item) => item.eventName !== "ip_tracked")
    .filter((item) => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        item.ip?.toLowerCase().includes(searchLower) ||
        item.city?.toLowerCase().includes(searchLower) ||
        item.country?.toLowerCase().includes(searchLower) ||
        item.zip?.toLowerCase().includes(searchLower)
      );
    })
    .filter((_, index) => {
      if (!isFeatureAllowed(customer, "reporting")) {
        return index < 10;
      }
      return true;
    });

  const paginatedAnalytics = filteredAnalytics.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const rowMarkup = paginatedAnalytics.map(
    ({eventName, id, ip, city, country, zip, blockedAt, latitude, longitude}, index) => (
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
    )
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
    <Page>
      <Layout.Section>
        <Card sectioned>
          <Text variant="headingMd" as="h6">
            Overview for the Last 30 Days
          </Text>
          <br />
          <InlineGrid 
            columns={{ xs: 1, sm: 2, md: 2, lg: 4 }} 
            gap="400"
          >
            {stats.map((stat, index) => (
              <Card key={index} padding="400">
                <div style={{ textAlign: 'center' }}>
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
            <div style={{ marginBottom: "16px" }}>
              <TextField
                label="Search"
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by IP, city, country, or zip"
                clearButton
                onClearButtonClick={() => setSearchQuery("")}
              />
            </div>
            <IndexTable
              itemCount={filteredAnalytics.length}
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
            <div style={{ marginTop: "16px", display: "flex", justifyContent: "center" }}>
              <Pagination
                label={`${Math.min((currentPage - 1) * rowsPerPage + 1, filteredAnalytics.length)} - ${Math.min(currentPage * rowsPerPage, filteredAnalytics.length)} of ${filteredAnalytics.length} results`}
                hasPrevious={currentPage > 1}
                onPrevious={() => setCurrentPage(currentPage - 1)}
                hasNext={currentPage * rowsPerPage < filteredAnalytics.length}
                onNext={() => setCurrentPage(currentPage + 1)}
              />
            </div>
          </Card>
          {!isFeatureAllowed(customer, "reporting") && <UpgradePlanOverlay />}
        </div>
      </Layout.Section>
    </Page>
  );
}

export default ReportingDashboard;
