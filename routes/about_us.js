const express = require('express');
const { deleteImages } = require("../middlewares")
const router = express.Router();

router.get("/about_us", deleteImages, (req, res) => {
    const title = "I Persume You Want To Know About Us/Me";
    const page_styles = "";
    res.render("about_us", { title, page_styles });
});

module.exports = router;