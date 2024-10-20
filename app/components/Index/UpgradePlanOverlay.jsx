import React from "react";
import { Button } from "@shopify/polaris";

function UpgradePlanOverlay() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255, 255, 255, 0.9)",
        opacity: 1,
        transition: "opacity 0.3s",
      }}
    >
      <Button url="/app/billing" primary>
        Upgrade Plan
      </Button>
    </div>
  );
}

export default UpgradePlanOverlay;
