const axios = require("axios");

const externalApiUrl = 'https://dev.aurascc.net/web-bff/orders?customerId=';

const getOrderById = async (req) => {
  try {
    const customerId = req.params.customerId;
    const response = await axios.get(
       `${externalApiUrl}${customerId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: req.headers.authorization,
        },
      }
    );
    return response.data; 
  } catch (error) {
      throw error;
  }
};

module.exports = { getOrderById };