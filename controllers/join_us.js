const User = require("../db_models/user");
const user_types = ["seller", "delivery"];

const renderJoinUsPage = (req, res) => {
    const title = "Join Us | CampusBookDrop";
    // TODO: Show pricing details that you will charge if they sell their books but seller wont deliver their books
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.render("join_us", { title, page_styles:"join_us_styles.css" });
}

const joinUser = async (req, res) => {
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
}

module.exports = {
    renderJoinUsPage,
    joinUser
}