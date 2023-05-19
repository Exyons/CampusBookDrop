const express = require('express');
const { deleteImages } = require("../middlewares");
const { renderHomePage } = require("../controllers/home")
const router = express.Router();

router.get('/', deleteImages, renderHomePage)

module.exports = router;