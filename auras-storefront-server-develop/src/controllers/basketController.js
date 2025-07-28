const axios = require("axios");
const { fetchTokenBmGrant } = require("./authController");
// const { fetchTokenSFCC } = require("./authController");

const createBasket = async (req, res) => {
  try {
    // Get token using the auth service
    // const tokenResponse = await fetchTokenSFCC();
    // if (!tokenResponse || !tokenResponse.access_token) {
    //   return res.status(401).json({ error: "Failed to get access token" });
    // }

    // Get authorization token from request header
    // console.log("req.header", req.header);
    const authToken = req.header("Authorization");
    // console.log("authToken createBasket", authToken);
    if (!authToken) {
      return res.status(401).json({ error: "Authorization token is required" });
    }

    // Build the basket creation URL
    const baseUrl = `${process.env.SFCC_BASE_URL}/baskets`;

    // Make the request
    const response = await axios.post(
      baseUrl,
      {}, // Empty body for basket creation
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken, // Don't need to add 'Bearer' as it's already in the token
        },
      }
    );

    return res.status(201).json(response.data);
  } catch (error) {
    console.error(
      "Basket Creation Error:",
      error.response?.data || error.message
    );
    return res.status(error.response?.status || 500).json({
      error: "Failed to create basket",
      details: error.response?.data || error.message,
    });
  }
};

const addProductToBasket = async (req, res) => {
  try {
    const products = req.body;
    const { basketId } = req.params; // Get basketId from route params

    // Validate input
    if (!Array.isArray(products)) {
      return res.status(400).json({
        error: "Invalid request body",
        message: "Expected an array of products",
      });
    }

    // Get authorization token from request header
    const authToken = req.header("Authorization");
    if (!authToken) {
      return res.status(401).json({ error: "Authorization token is required" });
    }

    // Build the basket creation URL
    const baseUrl = `${process.env.SFCC_BASE_URL}/baskets/${basketId}/items`;

    // Make the request
    const response = await axios.post(baseUrl, products, {
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken, // Don't need to add 'Bearer' as it's already in the token
      },
    });

    // Return the created basket
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Basket Creation Error:",
      error.response?.data || error.message
    );
    return res.status(error.response?.status || 500).json({
      error: "Failed to create basket",
      details: error.response?.data || error.message,
    });
  }
};

const fetchBasket = async (req, res) => {
  try {
    const { basketId } = req.params; // Get basketId from route params

    // Get authorization token from request header
    const authToken = req.header("Authorization");
    if (!authToken) {
      return res.status(401).json({ error: "Authorization token is required" });
    }

    const baseUrl = `https://zzfw-002.dx.commercecloud.salesforce.com/s/Sites-SiteGenesis-Site/dw/shop/v23_2/baskets/${basketId}`;

    const response = await axios.get(baseUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken, // Don't need to add 'Bearer' as it's already in the token
        // Authorization: `Bearer ${access_token}`, // Don't need to add 'Bearer' as it's already in the token
      },
    });

    // console.log("fetchBasket", response.data);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("fetchBasketError", error.response?.data || error.message);
    return res.status(404).json({
      error: "Basket not found",
      details: error.response?.data || error.message,
    });
  }
};

module.exports = {
  createBasket,
  addProductToBasket,
  fetchBasket,
};
