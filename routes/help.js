const express = require("express")
const router = express.Router();
const { renderHelpPage } = require("../controllers/help");

router.get("/", renderHelpPage)

module.exports = router;