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
        Authorization: req.header("Authorization")
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
};
