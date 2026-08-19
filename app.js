let dbUrl = "mongodb://127.0.0.1:27017/BookSellingApp";

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}
else {
    dbUrl = process.env.MONGODB_URL 
}

const express = require("express")
const path = require("path")
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require('passport-local');
const User = require("./db_models/user");
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');
const wrapAsync = require("./utils/WrapAsync");
const helmet = require('helmet');
const compression = require('compression');

// TODO :Implement a method to send email that they logged in from another device
// TODO: If they know it then ok, otherwise tell them to change password, probably someone else accessed their account


// Connecting MongoDB database
mongoose.connect(dbUrl)
    .then(() => {
        console.log("DB Connected");
    })
    .catch(() => {
        console.log("Connection error");
    })

const app = express();
const root = __dirname;

// Maximum quantity of an item in cart a user can order
app.locals.otps = {}

app.locals.maxCartQty = 5;

// Maxmimum Delivery Charge 
app.locals.maxDeliveryCharge = 15;

// Max products to be ordered for user to pay minDeliveryCharge
app.locals.discountProductCount = 3;

// Min Delivery Charge on an order for quantity more than discountProductCount
app.locals.minDeliveryCharge = Math.ceil(app.locals.maxDeliveryCharge / 2);

//Give users free delivery on first order
app.locals.freeDeliveryOnFirstOrder = true;

// Using mongo-store to store session data
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secrete: process.env.SESSION_SECRET,
        touchAfter: 24 * 3600 // time period in seconds
    }
})

// Using express-session middleware
const sessionOptions = {
    name: "campus_session",
    store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    proxy: process.env.NODE_ENV === "production",
    cookie: {
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // time period in milliseconds for 1 week
    }
}
app.use(session(sessionOptions));

// Using helmet to secure website more
app.use(helmet())

// Hides server name
app.use(helmet.hidePoweredBy());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net/",
    "https://www.googletagmanager.com"
];
const styleSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net"
];

const connectSrcUrls = [
    "https://www.google-analytics.com"
]

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: [ "'self'", "'unsafe-inline'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: ["'self'"],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
            ],
            mediaSrc:["'self'"],
            fontSrc: ["'self'"],
        },
    })
);

// Enabling compression middleware to compress files
app.use(compression({
    // Use Brotli as the preferred compression method
    brotli: {
        // Enable Brotli compression
        enabled: true
    },
    // Use Gzip as the fallback compression method
    gzip: {
        // Enable Gzip compression
        enabled: true
    }
}));

// Using manogo-sanitize middleware to tackle mongo injection attacks from get request query strings
app.use(mongoSanitize());

// Using connect-flash middleware
app.use(flash());

// using method-override middleware to overcome html's form incompetance to send requests other than GET and POST
app.use(methodOverride("_method"));

// Enabling JSON middleware to parse JSON data
app.use(express.json());

// This is done to receive form data from html's form post requests
app.use(express.urlencoded({ extended: true }));

// Setting views folder path where partials will be stored
app.set("views", path.join(root, "views"));

// Using ejs-mate to help setup boilerplate content for ejs
app.engine("ejs", ejsMate);

// Setting ejs as templating/view engine
app.set("view engine", "ejs");

// Setting path of static files
app.use(express.static(path.join(root, 'public')));

// Setting up passport for login and signup
app.use(passport.initialize());
app.use(passport.session()); // Passport session should be defined below express-session
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Making flash messages available in flash template page for easy access by setting them to res.locals
app.use(wrapAsync(async (req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    // You must always write next in a middleware
    next();
}))

// Home Route
const home_route = require("./routes/home.js");
app.use(home_route);

// Book collections route
const books_route = require("./routes/books.js");
app.use(books_route);

// Order placing route
const order_placing_route = require("./routes/order_placing.js");
app.use(order_placing_route);

// About Us route
const about_us_route = require("./routes/about_us.js");
app.use(about_us_route);

// Help route
const help_route = require("./routes/help.js");
app.use("/help", help_route);

// join Us route
const join_us_route = require("./routes/join_us.js");
app.use(join_us_route);

// User route
const userRoute = require("./routes/user.js");
app.use("/user", userRoute);

// User Cart route
const user_cart_route = require("./routes/user_cart.js");
app.use(user_cart_route);

// Sitemap route
const sitemap_route = require("./routes/sitemap.js");
app.use("/sitemap.xml", sitemap_route);

// Manifest route
const manifest_route = require("./routes/manifest.js");
app.use("/manifest.json", manifest_route);

// Page Not Found route
// This should always be at bottom
const page_not_found_route = require("./routes/page_not_found.js");
app.use(page_not_found_route);

app.use((err, req, res, next) => {
    // console.log(err);
    const { status = 500 } = err;
    if (!err.message) {
        err.message = "Oh No! Something Went Wrong";
    }
    const title = "Error Occured"
    req.flash("error", err.message);
    res.status(status).render("error", { title, page_styles: "", err });
})

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log("Listening on port ", port);
})
