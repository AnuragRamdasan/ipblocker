/**
 * Adds or creates a configuration on the server.
 *
 * This function takes an authentication token and a configuration object as parameters.
 * It transforms the configuration object into an array of key-value pairs, then sends a POST request
 * to the server to add or create the configuration.
 *
 * @param {string} token - The authentication token for the server request.
 * @param {object} config - The configuration object to be added or created on the server.
 * @returns {Promise<Response>} - A promise that resolves to the server's response.
 */
export const addOrCreateConfig = async (token, config) => {
  const configuration = Object.keys(config).map((k) => {
    return {
      key: k,
      value: config[k],
    };
  });

  return fetch(process.env.SERVER_URL + "configurations.json", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ configuration }),
  });
};

/**
 * Retrieves the configuration from the server.
 *
 * This function takes an authentication token as a parameter and sends a GET request
 * to the server to fetch the current configuration. It then parses the JSON response
 * and returns the configuration object.
 *
 * @param {string} token - The authentication token for the server request.
 * @returns {Promise<object>} - A promise that resolves to the configuration object.
 */
export const getConfig = async (token) => {
  const res = await fetch(process.env.SERVER_URL + "configurations.json", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token,
    },
  });
  const config = await res.json();

  return config["configuration"];
};
