const getAnalytics = async (token) => {
  const res = await fetch(import.meta.env.VITE_SERVER_URL + "analytics", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token,
    },
  });
  const data = await res.json();
  const analytics = data.map((item, index) => ({
    id: index,
    eventName: item.name,
    ip: item.properties.ip,
    city: item.properties.city,
    country: item.properties.country_name,
    zip: item.properties.zip,
    latitude: item.properties.latitude,
    longitude: item.properties.longitude,
    blockedAt: item.created_at,
  }));
  return analytics;
};

export { getAnalytics };
