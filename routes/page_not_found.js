const express = require("express");
const wrapAsync = require("../utils/WrapAsync");
const { deleteImages } = require("../middlewares")
const router = express.Router();
const { renderPageNotFound } = require("../controllers/page_not_found")

router.all("*", deleteImages, wrapAsync(renderPageNotFound));

module.exports = router;