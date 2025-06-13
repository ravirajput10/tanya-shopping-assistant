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

const fetchTokenSFCC = async (req = null, res = null) => {
  console.log("came here");
  try {
    // Use environment variable if no request object
    const client_id = req?.query?.client_id || process.env.SFCC_CLIENT_ID;
    const type = req?.body?.type || "guest";

    // console.log("req body", type);
    // console.log("req params", client_id);

    // Validate client_id
    if (!process.env.SFCC_CLIENT_ID) {
      if (res) {
        return res
          .status(400)
          .json({ error: "SFCC_CLIENT_ID is not configured" });
      }
      throw new Error("SFCC_CLIENT_ID is not configured");
    }

    const response = await axios.post(
      `${process.env.SFCC_BASE_URL}/customers/auth?client_id=${client_id}`,
      { type },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Get the authorization header from SFCC response
    const authHeader = response.headers["authorization"];
    const responseData = {
      ...response.data,
      access_token: authHeader,
    };

    // If called from API route, send response with headers
    if (res) {
      res.setHeader("Authorization", authHeader);
      return res.json(responseData);
    }
    // console.log("authHeader", authHeader);
    // console.log("sfcctoken", response.data);

    // If called directly (e.g. from basketController), return data object
    return responseData;
  } catch (error) {
    console.error("Token Request Error:", error);
    if (res) {
      return res.status(500).json({
        error: "Failed to fetch SFCC token",
        details: error.response?.data || error.message,
      });
    }
    throw new Error("Failed to fetch SFCC token");
  }
};

module.exports = { fetchToken, fetchTokenSFCC };
