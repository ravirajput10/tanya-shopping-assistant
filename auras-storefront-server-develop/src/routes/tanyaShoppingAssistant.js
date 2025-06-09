const express = require("express");
const { tanyaShoppingAssistant, getSearchProduct, tanyaShoppingAssistantStream } = require("../controllers/tanyaAssistantController.js");

const router = express.Router();

// Ensure correct async error handling
router.post("/web-bff/assistant", (req, res, next) => {
  tanyaShoppingAssistant(req, res, next).catch(next);
});

router.get("/search-product",(req,res,next) => {
  getSearchProduct(req,res,next).catch(next);
})

router.post("/web-bff/assistantStream", (req, res, next) => {
  tanyaShoppingAssistantStream(req, res, next).catch(next);
});

module.exports = router;
