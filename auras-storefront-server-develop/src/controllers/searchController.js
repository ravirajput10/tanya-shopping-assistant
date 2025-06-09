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

const searchNew = async (req, res) => {
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

    //https://zzfw-001.dx.commercecloud.salesforce.com/s/Sites-SiteGenesis-Site/dw/shop/v24_1/product_search?q=shirt&count=150&client_id=e819cc35-5a97-40be-b10c-44681ea88ab5&refine_2=orderable_only=true

    const response = await axios.get(`${baseUrl}?query=${query}`, {
      headers: options.headers,
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

module.exports = { search };