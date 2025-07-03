const axios = require("axios");

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const url = `https://dev.aurascc.net/web-bff/products/${id}`;

    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: req.header("Authorization"),
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching product by ID:", error.message || error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

const getSFCCProductById = async (req, res, next) => {
  try {
    const { id, client_id, expand } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const baseUrl = `https://zzfw-002.dx.commercecloud.salesforce.com/s/Sites-SiteGenesis-Site/dw/shop/v24_1/products/${id}`;

    // Build params dynamically with defaults
    const params = new URLSearchParams({
      client_id: client_id || process.env.SFCC_CLIENT_ID,
      expand: expand || "images,prices,availability,variations,promotions",
      // Add more defaults if needed
    });

    // Add any other query params from req.query
    Object.keys(req.query).forEach((key) => {
      if (!params.has(key)) {
        params.append(key, req.query[key]);
      }
    });

    const url = `${baseUrl}?${params.toString()}`;

    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        // Authorization: req.header("Authorization") // Uncomment if needed
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching product by ID:", error.message || error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

module.exports = {
  getProductById,
  getSFCCProductById,
};
