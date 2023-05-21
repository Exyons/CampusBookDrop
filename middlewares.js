const { cloudinary } = require("./cloudinary");
const { signupSchema, bookSchema, addressSchema } = require("./joi_schema");

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
    if (res.app.locals.bookImage) {
        await cloudinary.uploader.destroy(res.app.locals.bookImage.filename);
        delete res.app.locals.bookImage
    }
    if (res.app.locals.receiptImage) {
        await cloudinary.uploader.destroy(res.app.locals.receiptImage.filename);
        delete res.app.locals.receiptImage
    }
    if (res.app.locals.userThumbnail) {
        await cloudinary.uploader.destroy(res.app.locals.userThumbnail.filename);
        delete res.app.locals.userThumbnail
    }
    // Setitng the otp object to be empty at every response request
    req.app.locals.otps = {}
    next();
}

module.exports.constructFilterQuery = (req, res, next) => {
    // const { semester, year, branch, programme, price } = req.body;
    const filterOptions = []
    Object.keys(req.body).forEach(key => {
        if (key === "programme") {
            if (req.body[key].length) {
                filterOptions.push({ programme: { $in: req.body[key] } })
            }
        }
        if (key === "branch") {
            if (req.body[key].length) {
                filterOptions.push({ branch: { $in: req.body[key] } })
            }
        }
        if (key === "semester") {
            if (req.body[key].length) {
                filterOptions.push({ semester: { $in: req.body[key] } })
            }
        }
        if (key === "year") {
            if (req.body[key].length) {
                filterOptions.push({ year: { $in: req.body[key] } })
            }
        }
    })
    req.filterOptionQuery = {
        qty: { $gt: 0 },
        $and: filterOptions
    }
    next();
}

module.exports.regenerateSession = (req, res, next) => {
    req.session.regenerate()
    next();
}

module.exports.validateSignUp = (req, res, next) => {
    const { error } = signupSchema.validate(req.body);

    if (error) {
        const message = error.details.map(err => err.message).join(",");
        throw new ExpressError(message, 400);
    }
    else {
        next();
    }
}

module.exports.validateBookDetails = (req, res, next) => {
    const { error } = bookSchema.validate(req.body);

    if (error) {
        const message = error.details.map(err => err.message).join(",");
        throw new ExpressError(message, 400);
    }
    else {
        next();
    }
}

module.exports.validateAddressDetails = (req, res, next) => {
    const { error } = addressSchema.validate(req.body);

    if (error) {
        const message = error.details.map(err => err.message).join(",");
        throw new ExpressError(message, 400);
    }
    else {
        next();
    }
}