import { json } from "@remix-run/node";
import {
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  Card,
  ResourceList,
  ResourceItem,
  Text,
  Button,
  ButtonGroup,
  Modal,
  Select,
  TextField,
  Banner,
  Tabs,
  InlineStack,
  BlockStack,
  Tag,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  // Fetch products with proper access scope
  const productsResponse = await admin.graphql(`
    query {
      products(first: 100) {
        edges {
          node {
            id
            title
            handle
            legacyResourceId
            featuredImage {
              url
            }
            priceRangeV2 {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    }
  `, {
    headers: {
      "X-Shopify-Access-Token": admin.accessToken,
    },
  });

  const products = await productsResponse.json()

  // Fetch collections with proper access scope
  const collectionsResponse = await admin.graphql(`
    query {
      collections(first: 100) {
        edges {
          node {
            id
            title
            handle
            legacyResourceId
          }
        }
      }
    }
  `, {
    headers: {
      "X-Shopify-Access-Token": admin.accessToken,
    },
  });

  const collections = await collectionsResponse.json()
  // Fetch existing rules from our database
  const rules = []

  return json({
    products: products.data.products.edges,
    collections: collections.data.collections.edges,
    rules
  });
};

export default function ProductRules() {
  const { products, collections, rules } = useLoaderData();
  const [selectedTab, setSelectedTab] = useState(0);
  const [modalActive, setModalActive] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [ruleType, setRuleType] = useState("block");
  const [blockingLevel, setBlockingLevel] = useState("country");
  const [value, setValue] = useState("");
  
  const submit = useSubmit();

  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelectedTab(selectedTabIndex),
    [],
  );

  const tabs = [
    {
      id: "products",
      content: "Products",
      accessibilityLabel: "Products",
      panelID: "products-panel",
    },
    {
      id: "collections",
      content: "Collections",
      accessibilityLabel: "Collections",
      panelID: "collections-panel",
    },
  ];

  const handleAddRule = (item) => {
    setSelectedItem(item);
    setModalActive(true);
  };

  const handleSaveRule = () => {
    submit(
      {
        itemId: selectedItem.id,
        itemType: selectedTab === 0 ? "product" : "collection",
        ruleType,
        blockingLevel,
        value,
      },
      { method: "POST" }
    );
    setModalActive(false);
  };

  const renderItem = (item) => {
    const itemRules = rules.filter(
      (rule) => rule.itemId === item.node.id
    );

    const price = selectedTab === 0 
      ? `${item.node.priceRangeV2.minVariantPrice.currencyCode} ${item.node.priceRangeV2.minVariantPrice.amount}`
      : null;

    return (
      <ResourceItem
        id={item.node.id}
        accessibilityLabel={`View details for ${item.node.title}`}
        media={selectedTab === 0 && item.node.featuredImage 
          ? <img 
              src={item.node.featuredImage.url} 
              alt={item.node.title}
              style={{width: '200px', height: '200px', objectFit: 'cover'}}
            />
          : <img
              src="https://placehold.co/200x200/white/orange?text=Default+Image"
              alt="Default product image" 
              style={{width: '200px', height: '200px', objectFit: 'cover'}}
            />
        }
      >
        <BlockStack vertical>
          <BlockStack wrap={false} align="space-between">
            <Text variant="bodyMd" fontWeight="bold">
              {item.node.title}
            </Text>
            {price && <Text variant="bodyMd">{price}</Text>}
          </BlockStack>
          <BlockStack spacing="tight">
            {itemRules.map((rule, index) => (
              <Tag key={index}>
                {`${rule.ruleType}: ${rule.blockingLevel} - ${rule.value}`}
              </Tag>
            ))}
          </BlockStack>
          <ButtonGroup>
            <Button onClick={() => handleAddRule(item.node)}>
              Add Rule
            </Button>
          </ButtonGroup>
        </BlockStack>
      </ResourceItem>
    );
  };

  return (
    <>
      <Card>
        <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange} />
        <ResourceList
          items={selectedTab === 0 ? products : collections}
          renderItem={renderItem}
        />
      </Card>

      <Modal
        open={modalActive}
        onClose={() => setModalActive(false)}
        title="Add Blocking Rule"
        primaryAction={{
          content: "Save",
          onAction: handleSaveRule,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setModalActive(false),
          },
        ]}
      >
        <Modal.Section>
          <BlockStack vertical spacing="tight">
            <Select
              label="Rule Type"
              options={[
                { label: "Block", value: "block" },
                { label: "Whitelist", value: "whitelist" },
              ]}
              value={ruleType}
              onChange={setRuleType}
            />
            <Select
              label="Blocking Level"
              options={ruleType === "whitelist" ? [
                { label: "Country", value: "country" }
              ] : [
                { label: "Country", value: "country" },
                { label: "City", value: "city" },
                { label: "IP", value: "ip" },
              ]}
              value={blockingLevel}
              onChange={setBlockingLevel}
            />
            <TextField
              label="Value"
              value={value}
              onChange={setValue}
              placeholder={
                blockingLevel === "country"
                  ? "Enter country code (e.g., US)"
                  : blockingLevel === "city"
                  ? "Enter city name"
                  : "Enter IP address"
              }
            />
          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
} 