import {
  Banner,
  Card,
  Checkbox,
  List,
  Text,
  TextField,
} from "@shopify/polaris";
import { useMantle } from "@heymantle/react";
import { isFeatureAllowed } from "../../models/planGating";
import { useState } from "react";
import { addOrCreateConfig } from "../../models/configuration";
import { useLoaderData } from "@remix-run/react";
import { actions, analytics } from "../../utils/segment_analytics";
import { useCallback } from "react";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  return { token: session.accessToken };
};

const BasicPlanDashboard = ({ config }) => {
  const [conf, setConf] = useState(config);
  const [redirectRules, setRedirectRules] = useState(conf.redirectRules);
  const { customer } = useMantle();
  const { token } = useLoaderData();

  const isChecked = (value) => {
    return Boolean(value) && value !== "false" && value !== "0";
  };

  const loadToast = (message) =>
    shopify.toast.show(message, { duration: 4000 });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await addOrCreateConfig(token, conf);

    if (!res.ok) {
      loadToast("Failed to modify configuration. Please try again.");
      setConf(config);
    } else {
      loadToast("Successfully modified configuration.");
    }
  };

  const handleRedirectRulesUpdate = useCallback(
    (value) => {
      analytics.track(actions.REDIRECT_RULES, {
        redirectRules: value,
      });
      setConf({ ...conf, redirectRules: value });
      setRedirectRules(value);
    },
    [conf],
  );

  return (
    <form data-save-bar onSubmit={handleSubmit}>
      {!isFeatureAllowed(customer, "branding_removal") && (
        <div>
          <Banner
            title="Plan Upgrade Required"
            action={{ url: "/app/billing", content: "Upgrade Plan" }}
            tone="warning"
          >
            <List>
              <List.Item>
                Premium features are not available on the free plan. You can
                enable this feature on our basic plan for just $2.99 per month.
              </List.Item>
            </List>
          </Banner>
          <br />
        </div>
      )}
      {isChecked(config.botBlockingEnabled) && (
        <Card sectioned>
          <Text variant="headingMd" as="h5">
            Bot Blocking (this is a deprecated feature, disabling it will make
            it unavailable permanently)
          </Text>
          <Text as="p" variant="bodyMd">
            Our intelligent Bot Blocking feature uses advanced algorithms to
            automatically detect and block malicious bot traffic, protecting
            your store without any manual configuration needed.
          </Text>
          <br />
          <Text as="p" variant="bodyMd">
            By upgrading to our paid plan, you'll unlock:
          </Text>
          <List>
            <List.Item>24/7 automated bot protection</List.Item>
            <List.Item>Improved site performance and security</List.Item>
            <List.Item>Reduced server load and bandwidth costs</List.Item>
            <List.Item>
              Protection against content scraping and fraud attempts
            </List.Item>
          </List>
          <br />
          <Text as="p" variant="bodyMd">
            Simply enable the feature below and let our system take care of the
            rest. Upgrade now to safeguard your store and optimize your online
            presence.
          </Text>
          <br />
          <>
            <input type="hidden" name="_action" value="toggle_bot_blocking" />
            <input
              type="hidden"
              name="botBlockingEnabled"
              value={conf.botBlockingEnabled}
            />
            <Checkbox
              label="Enable Bot Blocking"
              checked={conf.botBlockingEnabled}
              onChange={(checked) => {
                analytics.track(actions.BOT_BLOCKING_ENABLED, {
                  botBlockingEnabled: checked,
                });
                setConf({ ...conf, botBlockingEnabled: checked });
              }}
            />
          </>
        </Card>
      )}
      <br />
      <Card sectioned>
        <Text variant="headingMd" as="h5">
          Remove IP Blocker Branding
        </Text>
        <Text variant="bodyMd" as="p">
          Choose whether to remove IP Blocker branding on the blocked page. This
          may take 3-4 minutes to reflect on the blocked page.
        </Text>
        <br />
        <>
          <input type="hidden" name="_action" value="toggle_app_branding" />
          <input
            type="hidden"
            name="appBrandingDisabled"
            value={conf.appBrandingDisabled}
          />
          <Checkbox
            label="Remove IP Blocker branding on blocked page"
            checked={conf.appBrandingDisabled}
            disabled={!isFeatureAllowed(customer, "branding_removal")}
            onChange={(checked) => {
              analytics.track(actions.APP_BRANDING_DISABLED, {
                appBrandingDisabled: checked,
              });
              setConf({ ...conf, appBrandingDisabled: checked });
            }}
          />
        </>
      </Card>

      <br />
      <Card sectioned>
        <Text variant="headingMd" as="h5">
          Setup Redirect Rules
        </Text>
        <Text variant="bodyMd" as="p">
          Setup redirect rules to redirect users to a different page when they
          are blocked.
        </Text>
        <br />
        <input type="hidden" name="_action" value="setup_redirect_rules" />
        <input type="hidden" name="redirectRules" value={redirectRules} />
        <TextField
          disabled={!isFeatureAllowed(customer, "redirect_rules")}
          label="Enable Redirect Rules"
          config={redirectRules}
          value={redirectRules}
          onChange={handleRedirectRulesUpdate}
          type="url"
          placeholder="https://example.com"
          helpText="Enter the url to redirect users to when they are blocked. Keep it blank to disable."
        />
      </Card>
    </form>
  );
};

export default BasicPlanDashboard;
