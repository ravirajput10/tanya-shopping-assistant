const express = require("express");
const { createBasket, addProductToBasket } = require("../controllers/basketController.js");
const router = express.Router();

router.post("/basket/create", (req, res, next) => {
  createBasket(req,res,next).catch(next);
});

router.post("/basket/add-product/:basketId", (req, res, next) => {
  addProductToBasket(req, res, next).catch(next);
});

module.exports = router;
