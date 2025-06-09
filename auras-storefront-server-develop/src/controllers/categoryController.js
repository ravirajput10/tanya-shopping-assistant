const axios = require("axios");
const { aws4Interceptor } = require("aws4-axios");

const getAllCategories = async (req, res, next) => {
  try {
    const { storeCode } = req.query
    const url = `https://dev.aurascc.net/web-bff/categories?storeCode=${storeCode}`;
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: req.header("Authorization"),
      },
    });

    res.json(response?.data);
  } catch (error) {
    next(error);
  }
};

// const getAllCategoriesById = async (req, res, next) => {
//   try {
//     const { categoryId } = req.params;
//     if (!categoryId) {
//       return res.status(400).json({ error: "Category ID is required" });
//     }
//     const url = `https://dev.aurascc.net/web-bff/categories/${categoryId}`;
//     // if (storeCode === "claires") {
//     //   url += `?storeCode=${storeCode}`;
//     // }
//     // console.log(url, "url");
//     const response = await axios.get(url, {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: req.header("Authorization"),
//       },
//     });
//     // console.log(response?.data, "controllerResponseGETCATEGORYBYID");
//     res.json(response?.data);
//   } catch (error) {
//     console.error("Error:", error.message || error);
//     next(error); // Pass error to Expr
//   }
// };

const getProductByCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { storeCode, page = 0, hitsPerPage = 4, priceRange, ratingRange } = req.query;

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

  client.interceptors.request.use(interceptor);

  try {
    const baseUrl = req.headers["x-search-endpoint"];

    // Construct query parameters dynamically
    const queryParams = new URLSearchParams({
      categoryId,
      hitsPerPage: hitsPerPage.toString(),
      page: page.toString(),
    });

    // Add priceRange if provided
    if (priceRange) {
      queryParams.append("priceRange", priceRange);
    }

    // Add ratingRange if provided
    if (ratingRange && ratingRange !== "0TO5") {
      queryParams.append("ratingRange", ratingRange);
    }

    // Construct full URL
    const url = `${baseUrl}?${queryParams.toString()}`;

    // Make API request
    const response = await client.get(url);
    // console.log(response.data, "response");

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};


module.exports = {
  getAllCategories,
  // getAllCategoriesById,
  getProductByCategory,
};
