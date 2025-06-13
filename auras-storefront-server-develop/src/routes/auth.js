const express = require("express");
const { fetchToken, fetchTokenSFCC } = require("../controllers/authController.js"); // Note: .js extension is required

const router = express.Router();

router.get("/auth/token", fetchToken);
router.post("/auth/token-sfcc", fetchTokenSFCC);

module.exports = router;
