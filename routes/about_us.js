const express = require('express');
const { deleteImages } = require("../middlewares")
const { renderAboutUsPage } = require("../controllers/about_us");
const router = express.Router();

router.get("/about_us", deleteImages, renderAboutUsPage);

module.exports = router;