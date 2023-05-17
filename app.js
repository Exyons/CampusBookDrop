let dbUrl = "mongodb+srv://REDACTED:REDACTED@REDACTED.mongodb.net/?retryWrites=true&w=majority";
// if (process.env.NODE_ENV !== "production") {
//     require("dotenv").config()
//     dbUrl = "mongodb://127.0.0.1:27017/BookSellingApp";
// }
// else {
//     dbUrl = process.env.MONGODB_URL
// }

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

const sessionSecrete = process.env.SESSION_SECRET || "NotSoNiceScectetIGuess";

// TODO 
// Implement a method to send email that they logged in from another device
// If they know it then ok, otherwise tell them to change password, probably someone else accessed their account

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

// const programmes = ["B.Tech.", "M.Tech.", "PhD"];
// const branches = ["CE", "ME", "BT", "CSE", "PE", "CHE", "IT", "EE", "ECE"];

app.locals.user_dashboard_styles = "user_dashboard_styles.css";
app.locals.user_cart_styles = "user_cart_styles.css";
app.locals.books_page_styles = "books.css";
// Maximum quantity of an item in cart a user can order
app.locals.otps = {}
app.locals.maxCartQty = 5;

// Using mongo-store to store session data
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secrete: sessionSecrete,
        touchAfter: 24 * 3600 // time period in seconds
    }
})

// Using express-session middleware
const sessionOptions = {
    store,
    secret: sessionSecrete,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // time period in milliseconds
    }
}


// Using helmet to secure website more
app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net/"
];
const styleSrcUrls = [
    // "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    // "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'"],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
            ],
            fontSrc: ["'self'"],
        },
    })
);


app.use(session(sessionOptions));

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
    // res.locals.message = req.flash("message");
    res.locals.currentUser = req.user;
    // console.log(req.user.populate("orders").populate("addresses"));
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

// Page Not Found route
// This should always be at bottom
const page_not_found_route = require("./routes/page_not_found.js");
app.use(page_not_found_route);

app.use((err, req, res, next) => {
    // console.log(err);
    const { status = 500 } = err;
    // if(!err.message)
    // const message = err.message.details(e=>e.message).join(",");
    if (!err.message) {
        err.message = "Oh No! Something Went Wrong";
    }
    const title = "Error Occured"
    req.flash("error", err.message);
    res.status(status).render("error", { title, page_styles: "", err });
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Listening on port ", port);
})
