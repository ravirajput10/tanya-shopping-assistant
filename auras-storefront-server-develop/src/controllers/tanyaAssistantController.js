const axios = require("axios");
const { aws4Interceptor } = require("aws4-axios");

const tanyaShoppingAssistant = async (req, res, next) => {
  try {
    const { userId, pdp, whom } = req.query;
    const { prompt, storeCode } = req.body;

    if (!userId || !pdp || !whom) {
      res.status(400).json({ error: "Something is missing" });
    }

    const URL = `https://dev.aurascc.net/web-bff/assistant?userId=${userId}&pdp=${pdp}&whom=${whom}`;
    const response = await axios.post(
      URL,
      { prompt, storeCode },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: req.header("Authorization"),
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error:", error.message || error);
    next(error); // Pass error to Express error handler
  }
};

const getSearchProduct = async (req, res, next) => {
  const { search } = req.query;

  // Create an Axios instance
  const client = axios.create({ timeout: 20000 });

  // AWS Signed Interceptor
  const interceptor = aws4Interceptor({
    region: "eu-north-1",
    service: "execute-api",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  client.interceptors.request.use(interceptor); // Attach interceptor

  try {
    const url = `https://kf22v0ym9k.execute-api.eu-north-1.amazonaws.com/Dev/products/search?query=${search}`;

    // Make request using client (ensures AWS signing is applied)
    const response = await client.get(url);
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error fetching products:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

const tanyaShoppingAssistantStream = async (req, res, next) => {
  try {
    const { application, userId, registered } = req.query;
    const externalApiUrl = `https://dev.aurascc.net/web-bff/invoke/stream?application=${application}&userId=${userId}&registered=${registered}`;

    const { flowId, flowAliasId, input } = req.body;
    console.log(externalApiUrl, "ext");
    // Make request to external API with streaming enabled
    const response = await axios.post(
      externalApiUrl,
      { flowId, flowAliasId, input },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: req.header("Authorization"), // Pass authorization from the client
        },
        responseType: "stream", // Important for streaming
      }
    );

    // Set response headers for streaming
    res.setHeader("Content-Type", "application/json");

    // Pipe the external API response directly to the client
    response.data.pipe(res);

    // Handle stream completion
    response.data.on("end", () => {
      console.log("Stream ended successfully.");
      res.end();
    });

    // Handle errors
    response.data.on("error", (error) => {
      console.error("Stream error:", error);
      res.status(500).json({ error: "Stream error occurred" });
    });
  } catch (error) {
    console.error("Error fetching stream:", error);
    res.status(500).json({ error: "Failed to fetch stream" });
  }
};

module.exports = {
  tanyaShoppingAssistant,
  getSearchProduct,
  tanyaShoppingAssistantStream,
};
