const express = require("express");
const router = express.Router();
const {
  getProductById,
  getSFCCProductById,
} = require("../controllers/productController");

router.get("/product/:id", getProductById);
router.get("/product-sfcc/:id", getSFCCProductById);

module.exports = router;
