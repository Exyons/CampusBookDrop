const express = require("express");
const ExpressError = require("../utils/ExpressErrors");
const wrapAsync = require("../utils/WrapAsync");
const { deleteImages } = require("../middlewares")
const router = express.Router();

// router.get("*", (req, res) => {
//     const title = "Page Not Found"
//     //TODO
//     // Make It good looking
//     res.status(404).render("page_not_found", { title });
// });

router.all("*", deleteImages, wrapAsync(async (req, res, next) => {
    const title = "Page Not Found";
    const page_styles = "";
    // const no_footer = false;
    //TODO
    // Make It good looking
    // throw new ExpressError("Page Not Found", 404);
    res.status(404).render("page_not_found", { title, page_styles});
}));

module.exports = router;