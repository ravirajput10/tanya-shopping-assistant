const express = require("express");
const { fetchToken, fetchTokenSFCC, fetchTokenBmGrant, fetchExistingRegisterCustomerToken, fetchExistingGuestCustomerToken } = require("../controllers/authController.js"); // Note: .js extension is required

const router = express.Router();

router.get("/auth/token", fetchToken);
router.post("/auth/token-sfcc", fetchTokenSFCC);
router.post("/auth/token-bm-grant", fetchTokenBmGrant);
router.post("/auth/token-existing-guest-customer", fetchExistingGuestCustomerToken);
router.post("/auth/token-existing-register-customer/:customerId", fetchExistingRegisterCustomerToken);

module.exports = router;
