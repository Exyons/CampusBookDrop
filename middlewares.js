const { cloudinary } = require("./cloudinary");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // If the user was not logged in, store the url they were visiting in session
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You Must Be Logged In!")
        return res.redirect("/user/log_in");
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.storeSessionCart = (req, res, next) => {
    if (req.session.cart) {
        res.locals.cart = req.session.cart;
    }
    next();
}

module.exports.deleteImages = async (req, res, next) => {
    // Delteing the image from cloudinary if the user was unable to place order or create a book
    // This is in middleware beacuse it will run at every request
    // If user mistakenly goes to another, the images will be deleted
    if (req.session.bookImage) {
        await cloudinary.uploader.destroy(req.session.bookImage.filename);
        delete req.session.bookImage
    }
    if (req.session.receiptImage) {
        await cloudinary.uploader.destroy(req.session.receiptImage.filename);
        delete req.session.receiptImage
    }
    if (req.session.userThumbnail) {
        await cloudinary.uploader.destroy(req.session.userThumbnail.filename);
        delete req.session.userThumbnail
    }
    next();
}
