const express = require('express');
const { deleteImages } = require("../middlewares")
const router = express.Router();

router.get("/about_us", deleteImages, (req, res) => {
    const title = "About Us | CampusBookDrop";
    const page_styles = "";
    res.render("about_us", { title, page_styles });
});

module.exports = router;