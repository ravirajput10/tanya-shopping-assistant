const axios = require("axios");

const externalApiUrl = 'https://dev.aurascc.net/web-bff/customers/login';
const externalCustomerApi = 'https://dev.aurascc.net/web-bff/customers/'
const externalAddressApi = 'https://dev.aurascc.net/web-bff/customers/'
const externalSignUpApi = 'https://dev.aurascc.net/web-bff/customers/'

const login = async (req) => {
  try {
    const payload= {
        "emailId": req.body.emailId,
        "password": req.body.password
      }
    const response = await axios.post(
        externalApiUrl,
        payload,
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

const getCustomerInfoById = async (req) => {
  try {
    const customerId = req.params.customerId;
    const response = await axios.get(
       `${externalCustomerApi}${customerId}`,
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

const customerAddAddress = async (req) => {
  try {
    const customerId = req.params.customerId;
    const emailId = req.params.emailId;
    const payload=    {
      "addressLine1":req.body.addressLine1,
       "addressLine2": req.body.addressLine2,
        "city":req.body.city,
       "state":req.body.state,
        "street": req.body.street,
          "postalCode": req.body.postalCode,
          "country": req.body.country,
         "addressType": req.body.addressType
     }

    const response = await axios.post(
      `${externalAddressApi}${customerId}?emailId=${emailId}`,
        payload,
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

const signUp = async (req) => {
  try {
    const payload= {
        "emailId": req.body.emailId,
        "password": req.body.password,
          "firstName": req.body.firstName,
          "lastName": req.body.lastName,
          "phoneNumber":req.body.phoneNumber,
        
      }
    const response = await axios.post(
        externalSignUpApi,
        payload,
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

module.exports = { login, getCustomerInfoById, customerAddAddress, signUp };