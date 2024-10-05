import { AnalyticsBrowser } from "@segment/analytics-next";

export const analytics = AnalyticsBrowser.load({
  writeKey: import.meta.env.VITE_SEGMENT_WRITE_KEY,
});
export const actions = {
  IP_BLOCKED: "IP Blocked",
  CITY_BLOCKED: "City Blocked",
  COUNTRY_BLOCKED: "Country Blocked",
  COUNTRY_WHITELISTED: "Country Whitelisted",
  AUTO_BLOCK_ENABLED: "Auto Block Enabled",
  AUTO_BLOCK_DISABLED: "Auto Block Disabled",
  HOW_TO_VIEWED: "How To Viewed",
  TAB_CHANGED: "Tab Changed",
  MANAGE_THEME_APP_EMBEDS_CLICKED: "Manage Theme App Embeds Clicked",
  APP_BRANDING_DISABLED: "App Branding Disabled",
  BOT_BLOCKING_ENABLED: "Bot Blocking Enabled",
  REDIRECT_RULES: "Redirect Rules",
};
