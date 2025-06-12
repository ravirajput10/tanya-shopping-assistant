const express = require("express");
const { search, searchSFCC } = require("../controllers/searchController.js");
const router = express.Router();

router.post("/search", (req, res, next) => {
  search(req, res, next).catch(next);
});

router.get("/search-sfcc", (req, res, next) => {
  searchSFCC(req, res, next).catch(next);
});

module.exports = router;
