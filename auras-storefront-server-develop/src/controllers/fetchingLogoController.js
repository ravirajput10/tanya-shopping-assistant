const axios = require("axios");

const getLogo = async (req, res) => {
  try {
    const storeCode = req.query.storeCode;
    if (!storeCode) {
      return res.status(400).json({ error: "storeCode is required" });
    }
    const url = `https://dev.aurascc.net/web-bff/fetch-logo?storeCode=${storeCode}`;
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: req.header("Authorization")
      }
    });
    res.json(response?.data);

  } catch (error) {
    if (error.response) {
      console.error("🛑 API Error Response:", {
        status: error.response.status,
        data: error.response.data,
      });

      return res.status(error.response.status).json({
        error: error.response.data || "Error occurred while fetching logo and color",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getLogo };
