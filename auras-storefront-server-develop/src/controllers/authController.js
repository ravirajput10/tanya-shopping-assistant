const axios = require("axios");

// Controller function
const fetchToken = async (req, res) => {
  try {
    const tokenData = await getAccessToken();
    res.json(tokenData);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Service function
const getAccessToken = async () => {
  try {
    const tokenRequest = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.MY_AZURE_CLIENT_ID || "",
      client_secret: process.env.MY_AZURE_CLIENT_SECRET || "",
      scope: process.env.MY_AZURE_SCOPE || "",
    });

    const response = await axios.post(
      `${process.env.MY_AZURE_AUTHORITY}/${process.env.MY_AZURE_TENANT_ID}/oauth2/v2.0/token`,
      tokenRequest,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data;

  } catch (error) {
    console.error("Token Request Error:", error);
    throw new Error("Failed to fetch cloud token");
  }
};

module.exports = { fetchToken };