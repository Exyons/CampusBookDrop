const express = require("express");
const sendManifest = require("../controllers/manifest")
const router = express.Router();

router.get("/", sendManifest)

module.exports = router