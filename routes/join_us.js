const express = require("express");
const { isLoggedIn, deleteImages } = require("../middlewares");
const wrapAsync = require("../utils/WrapAsync");
const router = express.Router();

const { renderJoinUsPage, joinUser } = require("../controllers/join_us");

router.get("/join_us", deleteImages, renderJoinUsPage)

router.post("/join_us", isLoggedIn, wrapAsync(joinUser))

module.exports = router;