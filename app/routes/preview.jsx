import { useSearchParams } from "@remix-run/react";

export function loader() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export default function Preview() {
  const [searchParams] = useSearchParams();
  const styling = {
    title: searchParams.get("title") || "Access Denied",
    description:
      searchParams.get("description") ||
      "Sorry, this content is not available in your region.",
    backgroundColor: {
      hex: searchParams.get("backgroundColor") || "#f5f4f2",
    },
    logoSize: searchParams.get("logoSize") || "100",
    titleColor: {
      hex: searchParams.get("titleColor") || "#000000",
    },
    titleFontSize: searchParams.get("titleSize") || "24",
    descriptionColor: {
      hex: searchParams.get("descriptionColor") || "#000000",
    },
    descriptionSize: searchParams.get("descriptionSize") || "16",
  };

  const imageUrl = searchParams.get("logoUrl") || "";
  const removeBranding = searchParams.get("removeBranding") === "true";

  return (
    <>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{styling.title}</title>
        <style>
          {`
            .ipblocker-body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 50px;
              background-color: ${styling.backgroundColor.hex};
              height: 100vh;
            }
            .ipblocker-body img {
              width: ${styling.logoSize}px;
              height: ${styling.logoSize}px;
              object-fit: contain;
              margin-bottom: 30px;
            }
            .ipblocker-body h1 {
              color: ${styling.titleColor.hex};
              font-size: ${styling.titleFontSize}px;
              margin-bottom: 20px;
            }
            .ipblocker-body p {
              color: ${styling.descriptionColor.hex};
              font-size: ${styling.descriptionSize}px;
            }
            .footer {
              color: #999;
              font-size: 12px;
              margin-top: 30px;
            }
          `}
        </style>
      </head>
      <body className="ipblocker-body">
        <img id="storeLogo" src={imageUrl} alt="Store Logo" />
        <h1>{styling.title}</h1>
        <p>{styling.description}</p>
        {!removeBranding && (
          <span className="footer">Powered by ValueCommerce</span>
        )}
      </body>
    </>
  );
}
