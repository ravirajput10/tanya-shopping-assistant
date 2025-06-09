const express = require("express");
const { fetchToken } = require("../controllers/authController.js"); // Note: .js extension is required

const router = express.Router();

router.get("/auth/token", fetchToken);

module.exports = router;
