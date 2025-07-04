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
  // console.log("came here");
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

const fetchTokenBmGrant = async (req = null, res = null) => {
  // console.log("came here");
  try {
    const client_id = req?.query?.client_id || process.env.SFCC_CLIENT_ID;

    if (!process.env.SFCC_CLIENT_ID) {
      if (res) {
        return res
          .status(400)
          .json({ error: "SFCC_CLIENT_ID is not configured" });
      }
      throw new Error("SFCC_CLIENT_ID is not configured");
    }

    // Prepare form-urlencoded body
    const formBody = new URLSearchParams({
      grant_type:
        "urn:demandware:params:oauth:grant-type:client-id:dwsid:dwsecuretoken",
    });

    const url = `https://zzfw-002.dx.commercecloud.salesforce.com/dw/oauth2/access_token?client_id=${client_id}`;

    const response = await axios.post(url, formBody, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Authorization: req.header("Authorization"),
        Authorization:
          "Basic c3Jpa2FudGgua3VtYmFnYWxsYUBhc3BpcmVzeXMuY29tOkZpdG5lc3NAMTIzNDUxMjM0NTpTaGluZUAxMjM0NTEyMzQ1",
      },
    });

    // console.log("fetchTokenBmGrant resoponse", response.data);

    return res.status(200).json(response.data); // <-- This sends the response to Postman
  } catch (error) {
    console.error("Token Request Error:", error);
    return res.status(500).json({
      error: "Failed to fetch SFCC token",
      details: error.response?.data || error.message,
    });
  }
};

const fetchExistingRegisterCustomerToken = async (req = null, res = null) => {
  console.log("came here");
  try {
    const client_id = req?.query?.client_id || process.env.SFCC_CLIENT_ID;
    const { customerId } = req.params; // Get customerId from route params

    // if (!process.env.SFCC_CLIENT_ID) {
    //   if (res) {
    //     return res
    //       .status(400)
    //       .json({ error: "SFCC_CLIENT_ID is not configured" });
    //   }
    //   throw new Error("SFCC_CLIENT_ID is not configured");
    // }

    const authToken = req.header("Authorization");
    // console.log("authToken createBasket", authToken);
    if (!authToken) {
      return res.status(401).json({ error: "Authorization token is required" });
    }

    const url = `${process.env.SFCC_BASE_URL}/customers/${customerId}/auth?client_id=${client_id}`;

    const response = await axios.post(
      url,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
      }
    );

    // Get the authorization header from SFCC response
    const authHeader = response.headers["authorization"];
    const responseData = {
      ...response.data,
      customer_token: authHeader,
    };

    // If called from API route, send response with headers
    if (res) {
      res.setHeader("Authorization", authHeader);
      return res.json(responseData);
    }

    // console.log("fetchExistingRegisterCustomerToken resoponse", response.data);

    return res.status(200).json(response.data); // <-- This sends the response to Postman
  } catch (error) {
    console.error("Token Request Error:", error);
    return res.status(500).json({
      error: "Failed to fetch SFCC token",
      details: error.response?.data || error.message,
    });
  }
};

module.exports = {
  fetchToken,
  fetchTokenSFCC,
  fetchTokenBmGrant,
  fetchExistingRegisterCustomerToken,
};
