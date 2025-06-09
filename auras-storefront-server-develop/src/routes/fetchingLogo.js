const express = require("express");
const { getLogo } = require("../controllers/fetchingLogoController.js");

const router = express.Router();

router.get("/logo", getLogo);

  
module.exports = router;