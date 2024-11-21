import { Page, Card, Text, Layout, Box } from "@shopify/polaris";

export const loader = async ({ request }) => {
  return {};
};

export const action = async ({ request }) => {
  return null;
};

export default function Faqs() {
  const faqItems = [
    {
      question:
        "Why does my Analytics still show traffic from blocked regions?",
      answer:
        "Since IP Blocker only blocks access to your storefront, not your backend or API, Analytics may still show traffic from blocked regions. The users are still however blocked and unable to access your store.",
    },
    {
      question: "What does the 'Auto Block' feature do?",
      answer:
        "Auto Block is a premium feature that automatically detects and blocks sessions that are known to be associated with malicious activity. This feature is not available in the free version of IP Blocker.",
    },
    {
      question: "Do you accept feature requests?",
      answer:
        "Yes, we do accept feature requests. Please submit your feature requests via chat. We usually get the feature requests done within a week.",
    },
  ];

  return (
    <Page title="FAQS">
      {faqItems.map((faq) => {
        return (
          <Layout.Section>
            <Card roundedAbove="sm">
              <Text as="h2" variant="headingSm">
                {faq.question}
              </Text>
              <Box paddingBlockStart="200">
                <Text as="p" variant="bodyMd">
                  {faq.answer}
                </Text>
              </Box>
            </Card>
          </Layout.Section>
        );
      })}
    </Page>
  );
}
