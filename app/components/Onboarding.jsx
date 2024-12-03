import {
  Card,
  Text,
  ProgressBar,
  Button,
  Icon,
  Box,
  BlockStack,
  Page,
  Layout,
} from "@shopify/polaris";
import { CheckCircleIcon } from "@shopify/polaris-icons";
import { actions, analytics } from "../utils/segment_analytics";
import { useNavigate } from "react-router";

export function Onboarding({ storeId, loading, setEnabled, config }) {
  const url = `https://admin.shopify.com/store/${storeId}/admin/themes/current/editor?context=apps`;

  const navigate = useNavigate();

  const handleEmbedClick = () => {
    setEnabled(true);
    analytics.track(actions.MANAGE_THEME_APP_EMBEDS_CLICKED);
    window.open(url, "_blank" + new Date().getTime());
  };

  const handleRuleClick = () => {
    navigate("/app/block_rules");
  };

  const tasks = [
    {
      title: "Enable Value Bot Blocker App Embed",
      completed: config.embed_enabled === "true",
      onClick: handleEmbedClick,
      description:
        "Get a list of all technical issues our system has found on the website. Start fixing them step by step from the most critical errors to least important.",
      buttonText: "Enable App Embed",
    },
    {
      title: "Setup Up Blocking Rules",
      completed: config.rules_setup === "true",
      onClick: handleRuleClick,
      description:
        "Setup a rule to block traffic from a specific country, city or IP or to whitelist a specific country.",
      buttonText: "Setup A Rule",
    },
  ];

  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const progress = (completedTasks / totalTasks) * 100;

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="5">
              <BlockStack gap="4">
                <div style={{ padding: "0 20px" }}>
                  <BlockStack gap="2">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text variant="headingLg" as="h3">
                        Setup guide
                      </Text>
                    </div>
                  </BlockStack>
                </div>

                <div style={{ padding: "0 20px", maxWidth: "25%" }}>
                  <BlockStack gap="2">
                    <Text variant="bodyMd" as="p">
                      {completedTasks} of {totalTasks} tasks complete
                    </Text>
                    <ProgressBar progress={progress} size="medium" />
                  </BlockStack>
                </div>
              </BlockStack>

              <BlockStack gap="0">
                {tasks.map((task, index) => (
                  <Box key={index}>
                    <div
                      style={{
                        padding: "16px 20px",
                      }}
                    >
                      <BlockStack gap="3">
                        <div
                          style={{
                            display: "flex",
                            gap: "12px",
                            alignItems: "center",
                          }}
                        >
                          {task.completed ? (
                            <div
                              style={{
                                width: "24px",
                                height: "24px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Icon source={CheckCircleIcon} color="base" />
                            </div>
                          ) : (
                            <div
                              style={{
                                width: "20px",
                                height: "20px",
                                border: "2px solid #8C9196",
                                borderRadius: "50%",
                              }}
                            />
                          )}
                          <Text variant="bodyMd">{task.title}</Text>
                        </div>

                        {!task.completed && (
                          <div style={{ paddingLeft: "36px" }}>
                            <BlockStack gap="3">
                              <Text variant="bodyMd" color="subdued">
                                {task.description}
                              </Text>
                              <div>
                                <Button
                                  primary
                                  loading={loading}
                                  onClick={task.onClick}
                                >
                                  {task.buttonText}
                                </Button>
                              </div>
                            </BlockStack>
                          </div>
                        )}
                      </BlockStack>
                    </div>
                  </Box>
                ))}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
