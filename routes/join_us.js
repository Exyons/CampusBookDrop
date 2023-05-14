const express = require("express");
const { isLoggedIn, deleteImages } = require("../middlewares");
const User = require("../db_models/user");
const wrapAsync = require("../utils/WrapAsync");
const router = express.Router();

const user_types = ["seller", "delivery"];

router.get("/join_us", deleteImages, (req, res) => {
    const title = "Join Us | CampusBookDrop";
    const page_styles = "";
    // TODO
    // Show pricing details that you will charge if they sell their books but seller wont deliver their books

    res.render("join_us", { title, page_styles });
})

router.post("/join_us", isLoggedIn, wrapAsync(async (req, res) => {
    const { helper_type } = req.body;

    try {
        const user = await User.findById(req.user._id);
        // If the user is already helping, say thanks and dont let them register again
        if (user_types.includes(user.user_type)) {
            req.flash("success", "You're already making a difference! If you're interested in exploring other ways to contribute, please don't hesitate to reach out to us.")
            return res.redirect("/")
        }
        user.user_type = helper_type;
        await user.save();
        req.flash("success", "Thank you for choosing to help us!");
        res.redirect("/user/dashboard");
    } catch (error) {
        console.log(error);
        req.flash("error", "Server Error!")
        res.redirect("/join_us");
    }
}))

module.exports = router;