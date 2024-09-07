export default function isBot() {
  const userAgent = navigator.userAgent.toLowerCase();
  const allowedBots = [
    /googlebot/i,
    /facebookexternalhit/i,
    /facebot/i,
    /bingbot/i,
    /slackbot/i,
    /twitterbot/i,
  ];

  const isAllowedBot = allowedBots.some((pattern) => pattern.test(userAgent));
  const isHuman =
    !/bot|crawl|spider|slurp|nutch|duckduckbot|baiduspider|yandex|sogou|exabot|ia_archiver/i.test(
      userAgent,
    );

  return !(isAllowedBot || isHuman); // Return true if it's not an allowed bot or a human
}
