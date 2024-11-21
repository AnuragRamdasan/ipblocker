import React, { useState, useCallback } from "react";
import {
  Card,
  FormLayout,
  TextField,
  ColorPicker,
  RangeSlider,
  Button,
  InlineStack,
  DropZone,
  Popover,
  Page,
  Spinner,
  Banner,
  List,
} from "@shopify/polaris";
import { useLoaderData } from "@remix-run/react";
import { addOrCreateConfig } from "../../models/configuration";
import { uploadFile } from "../../models/fileUpload";
import { SaveBar } from "@shopify/app-bridge-react";
import { isFeatureAllowed } from "../../models/planGating";
import { useMantle } from "@heymantle/react";
import { failedToast, successToast } from "../../utils/toast";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  return { token: session.accessToken };
};

const Styling = ({ config, setConfig }) => {
  const { customer } = useMantle();
  const { token } = useLoaderData();
  const [styling, setStyling] = useState(
    config.blockPageStyling
      ? JSON.parse(config.blockPageStyling)
      : {
          title: "Access Denied",
          description: "Sorry, this content is not available in your region.",
          logoUrl: "",
          logoLink: "",
          titleColor: { hue: 0, saturation: 0, brightness: 0, hex: "#000000" },
          descriptionColor: {
            hue: 0,
            saturation: 0,
            brightness: 0,
            hex: "#000000",
          },
          backgroundColor: {
            hue: 0.4,
            saturation: 0,
            brightness: 0.9,
            hex: "#f5f4f2",
          },
          titleSize: 24,
          descriptionSize: 16,
          logoSize: 100,
        },
  );

  const updateStyling = (key, value) => {
    setStyling((prev) => ({ ...prev, [key]: value }));
    shopify.saveBar.show("my-styling-save-bar");
  };

  const [colorPickerActive, setColorPickerActive] = useState({
    title: false,
    description: false,
    background: false,
  });

  const toggleColorPicker = (field) => {
    setColorPickerActive((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const colorToHex = (color) => {
    if (!color || typeof color !== "object") {
      console.error("Invalid color object:", color);
      return "#000000";
    }

    const { hue, saturation, brightness } = color;

    // Ensure values are numbers and within expected ranges
    const h = Number(hue) || 0;
    const s = Number(saturation) || 0;
    const v = Number(brightness) || 0;

    const chroma = v * s;
    const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - chroma;

    let r, g, b;
    if (h >= 0 && h < 60) {
      [r, g, b] = [chroma, x, 0];
    } else if (h >= 60 && h < 120) {
      [r, g, b] = [x, chroma, 0];
    } else if (h >= 120 && h < 180) {
      [r, g, b] = [0, chroma, x];
    } else if (h >= 180 && h < 240) {
      [r, g, b] = [0, x, chroma];
    } else if (h >= 240 && h < 300) {
      [r, g, b] = [x, 0, chroma];
    } else {
      [r, g, b] = [chroma, 0, x];
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    return hex;
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleDropZoneDrop = useCallback(
    async (_dropFiles, acceptedFiles, _rejectedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setIsUploading(true);
        try {
          const uploadedUrl = await uploadFile(token, file);
          if (uploadedUrl) {
            updateStyling("logoUrl", uploadedUrl);
          }
        } finally {
          setIsUploading(false);
        }
      }
    },
    [],
  );

  const handleSave = async (e) => {
    e.preventDefault();
    const updatedConfig = {
      ...config,
      blockPageStyling: JSON.stringify(styling),
    };
    const res = await addOrCreateConfig(token, updatedConfig);
    if (!res.ok) {
      failedToast();
    } else {
      setConfig(updatedConfig);
      successToast();
      shopify.saveBar.hide("my-styling-save-bar");
    }
  };

  const handleDiscard = () => {
    shopify.saveBar.hide("my-styling-save-bar");
  };

  const BlockedPagePreview = () => {
    const defaultLogoUrl =
      "https://cdn.shopify.com/app-store/listing_images/c32fa88b423044f414bf606d4cd737d3/icon/CKj-r-6ez4cDEAE=.png";

    if (!styling.logoUrl) {
      updateStyling("logoUrl", defaultLogoUrl);
    }

    return (
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          textAlign: "center",
          padding: "50px",
          backgroundColor: colorToHex(styling.backgroundColor),
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {(styling.logoUrl || styling.logoLink) && (
          <img
            src={styling.logoUrl || styling.logoLink}
            alt="Logo"
            style={{
              width: `${styling.logoSize}px`,
              height: `${styling.logoSize}px`,
              objectFit: "contain",
              marginBottom: "30px",
            }}
          />
        )}
        <h1
          style={{
            color: colorToHex(styling.titleColor),
            fontSize: `${styling.titleSize}px`,
            marginBottom: "20px",
          }}
        >
          {styling.title}
        </h1>
        <p
          style={{
            color: colorToHex(styling.descriptionColor),
            fontSize: `${styling.descriptionSize}px`,
            textAlign: "center",
          }}
        >
          {styling.description}
        </p>
        <p
          style={{
            color: "#999",
            fontSize: "12px",
            marginTop: "30px",
          }}
        >
          Powered by ValueCommerce
        </p>
      </div>
    );
  };

  const featureEnabled = isFeatureAllowed(customer, "block_page_styling");
  return (
    <Page>
      {!featureEnabled && (
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
        </div>
      )}
      <br />
      <InlineStack wrap={false} gap="400">
        <div style={{ flex: 1 }}>
          <Card title="Customize Blocked Page" sectioned>
            <form>
              <FormLayout>
                <TextField
                  label="Title"
                  value={styling.title}
                  onChange={(value) => updateStyling("title", value)}
                  disabled={!featureEnabled}
                />
                <Card>
                  <p>Title Color</p>
                  <Popover
                    active={colorPickerActive.title}
                    activator={
                      <Button
                        onClick={() => toggleColorPicker("title")}
                        disabled={!featureEnabled}
                      >
                        {colorToHex(styling.titleColor)}
                      </Button>
                    }
                    onClose={() => toggleColorPicker("title")}
                  >
                    <Popover.Pane>
                      <ColorPicker
                        onChange={(color) =>
                          updateStyling("titleColor", {
                            ...color,
                            hex: colorToHex(color),
                          })
                        }
                        color={styling.titleColor}
                      />
                    </Popover.Pane>
                  </Popover>
                </Card>
                <RangeSlider
                  label="Title Size"
                  value={styling.titleSize}
                  onChange={(value) => updateStyling("titleSize", value)}
                  output
                  min={12}
                  max={48}
                  disabled={!featureEnabled}
                />

                <TextField
                  label="Description"
                  value={styling.description}
                  onChange={(value) => updateStyling("description", value)}
                  multiline
                  disabled={!featureEnabled}
                />
                <div>
                  <p>Description Color</p>
                  <Popover
                    active={colorPickerActive.description}
                    activator={
                      <Button
                        onClick={() => toggleColorPicker("description")}
                        disabled={!featureEnabled}
                      >
                        {colorToHex(styling.descriptionColor)}
                      </Button>
                    }
                    onClose={() => toggleColorPicker("description")}
                  >
                    <Popover.Pane>
                      <ColorPicker
                        onChange={(color) =>
                          updateStyling("descriptionColor", {
                            ...color,
                            hex: colorToHex(color),
                          })
                        }
                        color={styling.descriptionColor}
                      />
                    </Popover.Pane>
                  </Popover>
                </div>
                <RangeSlider
                  label="Description Size"
                  value={styling.descriptionSize}
                  onChange={(value) => updateStyling("descriptionSize", value)}
                  output
                  min={10}
                  max={24}
                  disabled={!featureEnabled}
                />

                <TextField
                  label="Logo Link"
                  value={styling.logoLink}
                  onChange={(value) => updateStyling("logoLink", value)}
                  disabled={!featureEnabled}
                />

                <DropZone
                  accept="image/*"
                  type="image"
                  onDrop={handleDropZoneDrop}
                  disabled={isUploading || !featureEnabled}
                >
                  {isUploading ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <Spinner size="large" />
                      <p>Uploading...</p>
                    </div>
                  ) : (
                    <DropZone.FileUpload />
                  )}
                </DropZone>

                <Card>
                  <p>Background Color</p>
                  <Popover
                    active={colorPickerActive.background}
                    activator={
                      <Button
                        onClick={() => toggleColorPicker("background")}
                        disabled={!featureEnabled}
                      >
                        {colorToHex(styling.backgroundColor)}
                      </Button>
                    }
                    onClose={() => toggleColorPicker("background")}
                  >
                    <Popover.Pane>
                      <ColorPicker
                        onChange={(color) =>
                          updateStyling("backgroundColor", {
                            ...color,
                            hex: colorToHex(color),
                          })
                        }
                        color={styling.backgroundColor}
                      />
                    </Popover.Pane>
                  </Popover>
                </Card>

                <RangeSlider
                  label="Logo Size"
                  value={styling.logoSize}
                  onChange={(value) => updateStyling("logoSize", value)}
                  output
                  min={50}
                  max={300}
                  disabled={!featureEnabled}
                />
              </FormLayout>
            </form>
          </Card>
        </div>
        <div style={{ flex: 3 }}>
          <div style={{ textAlign: "right" }}>
            <Button
              onClick={() => {
                const params = new URLSearchParams();
                params.set("title", styling.title);
                params.set("description", styling.description);
                params.set("backgroundColor", styling.backgroundColor.hex);
                params.set("logoSize", styling.logoSize);
                params.set("titleColor", styling.titleColor.hex);
                params.set("titleSize", styling.titleSize);
                params.set("descriptionColor", styling.descriptionColor.hex);
                params.set("descriptionSize", styling.descriptionSize);
                params.set("logoUrl", styling.logoUrl || defaultLogoUrl);
                params.set("removeBranding", styling.removeBranding);
                window.open(`/preview?${params.toString()}`, "_blank");
                return;
              }}
            >
              Preview Page
            </Button>
          </div>
          <br />
          <Card title="Live Preview" sectioned>
            <BlockedPagePreview />
          </Card>
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <span style={{ color: "gray" }}>
              This may take 2-3 minutes to reflect on the blocked page.
            </span>
          </div>
        </div>
      </InlineStack>
      <br />
      <Card>
        <h5>
          Need more customizations? Reach out to support to get a free block
          page customization done with your premium plan.
        </h5>
        <Button onClick={handleContactSupport} disabled={!featureEnabled}>
          Contact Support
        </Button>
      </Card>
      <SaveBar id="my-styling-save-bar">
        <button variant="primary" onClick={handleSave}></button>
        <button onClick={handleDiscard}></button>
      </SaveBar>
    </Page>
  );
};

function handleContactSupport() {
  $crisp.push(["do", "chat:open"]);
  $crisp.push([
    "do",
    "message:send",
    ["text", "I would like to get a customized block page made."],
  ]);
}

export default Styling;
