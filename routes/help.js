const express = require("express")
const wrapAsync = require("../utils/WrapAsync");
const router = express.Router();

router.get("/", (req, res) => {
    const title = "Help | CampusBookDrop";
    res.render("help", { title, page_styles: "help_styles.css" })
})

module.exports = router;