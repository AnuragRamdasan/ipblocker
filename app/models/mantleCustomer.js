const getMantleCustomer = async (token) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/customers`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: token,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { mantle_customer } = await response.json();
    if (mantle_customer === null) {
      throw new Error("Failed to get customer info from mantle");
    }

    return mantle_customer.api_token;
  } catch (error) {
    console.error("Error fetching Mantle customer data:", error);
    throw error;
  }
};

export { getMantleCustomer };