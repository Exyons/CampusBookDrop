const express = require("express");
const sendSitemap = require("../controllers/sitemap")
const router = express.Router();

router.get("/", sendSitemap)

module.exports = router