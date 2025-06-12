const axios = require("axios");
const aws4 = require("aws4");

const search = async (req, res) => {
  const { query } = req.query;
  const { searchConfigs } = req.body;

  if (!query) {
    return res.status(400).json({ error: "❌ Query parameter is required!" });
  }
  const region = process.env.ALGOLIA_REGION;
  const service = process.env.ALGOLIA_SERVICE_NAME;
  const baseUrl = searchConfigs.endpoint;
  try {
    const options = {
      host: new URL(baseUrl).host,
      path: new URL(baseUrl).pathname + `?query=${query}`,
      method: "GET",
      service,
      region,
    };

    // Sign the request
    aws4.sign(options, {
      accessKeyId: searchConfigs.accessKey,
      secretAccessKey: searchConfigs.secretKey,
    });

    const response = await axios.get(`${baseUrl}?query=${query}`, {
      headers: options.headers,
      timeout: 20000,
      responseType: "stream",
    });
    res.setHeader("Content-Type", "application/json");

    response.data.pipe(res);

    response.data.on("end", () => {
      console.log("Stream ended successfully.");
      res.end();
    });
  } catch (error) {
    console.log("the error =>", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const searchSFCC = async (req, res) => {
  const { query, count, client_id, refine_2, expand } = req.query;

  if (!query) {
    return res.status(400).json({ error: "❌ Query parameter is required!" });
  }

  // Build the URL with the query parameter
  const baseUrl =
    "https://zzfw-001.dx.commercecloud.salesforce.com/s/Sites-SiteGenesis-Site/dw/shop/v24_1/product_search";

  const params = new URLSearchParams({
    q: query,
    count: count || "150",
    client_id: client_id || process.env.SFCC_CLIENT_ID,
    refine_2: refine_2 || process.env.SFCC_REFINE_2_PARAM,
    expand: expand || "images,prices,availability,variations,promotions",
  });

  const url = `${baseUrl}?${params.toString()}`;
  try {
    const response = await axios.get(url, {
      responseType: "stream",
    });
    res.setHeader("Content-Type", "application/json");

    response.data.pipe(res);

    response.data.on("end", () => {
      console.log("Stream ended successfully.");
      res.end();
    });
  } catch (error) {
    console.log("the error =>", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { search, searchSFCC };
