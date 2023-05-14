const express = require("express");
const wrapAsync = require("../utils/WrapAsync");
const passport = require("passport");
const { storeReturnTo, storeSessionCart } = require("../middlewares");
const { isLoggedIn, deleteImages } = require("../middlewares");
const multer = require("multer");
const {
    renderSignUpForm,
    signUpUser,
    renderLogInForm,
    updateUserCart,
    logOutUser,
    renderUserDashboard,
    updateUserDetails,
    saveNewAddress,
    updateAddressDetails,
    destroyAddress,
    addNewBookDetails,
    uploadNewBookImage,
    updateBookDetails,
    // downloadReceipt,
    destroyBook,
    sendSellerAnalytics,
    setDeliveryOrderStatus,
    checkUsername,
    checkEmail,
    checkPassword,
    renderForgotPasswordPage,
    sendPasswordResetLink,
    sendThankYouEmail,
    renderResetUserPasswordPage,
    resetUserPassword,
    uploadUserThumbnail,
    saveThumbnail } = require("../controllers/user.js");

const crypto = require('crypto');
const moment = require('moment');
// const { v4: uuidv4 } = require('uuid');
// const timezone = 'Asia/Kolkata'; // for example, set it to the timezone you want
// moment.tz.setDefault(timezone);

const upload = multer({
    // for stroing the image in memory temporarily before uploading
    storage: multer.memoryStorage()
});

const router = express.Router();

// TODO
// If user is new and haven't saved any address before
// Render this page
// Otherwise show them a page of saved addresses in their account
// and let them choose their address

router.get("/forgot_password", renderForgotPasswordPage)

router.post("/forgot_password", wrapAsync(sendPasswordResetLink))

router.get("/reset_password/:token", wrapAsync(renderResetUserPasswordPage))

router.post("/reset_password", upload.none(), wrapAsync(resetUserPassword))

router.post("/reset_password/checkPassword", wrapAsync(checkPassword))

router.get("/sign_up", deleteImages, renderSignUpForm)

router.post("/sign_up", upload.none(), wrapAsync(signUpUser), wrapAsync(sendThankYouEmail))

router.post("/sign_up/checkUsername", wrapAsync(checkUsername))

router.post("/sign_up/checkEmail", wrapAsync(checkEmail))

router.post("/sign_up/checkPassword", wrapAsync(checkPassword))

router.get("/log_in", deleteImages, renderLogInForm)

router.post("/log_in",
    storeReturnTo,
    storeSessionCart,
    passport.authenticate("local", { failureRedirect: "/user/log_in" }),
    wrapAsync(updateUserCart)
)

router.post("/log_out", isLoggedIn, logOutUser)

router.get("/dashboard", isLoggedIn, deleteImages, wrapAsync(renderUserDashboard))

router.post("/account/uploadThumbnail", upload.single("userThumbnail"), wrapAsync(uploadUserThumbnail))

router.post("/account/:id/saveThumbnail", upload.none(), wrapAsync(saveThumbnail))

router.patch("/account/:id/update", isLoggedIn, upload.none(), wrapAsync(updateUserDetails))

router.post("/address", isLoggedIn, upload.none(), wrapAsync(saveNewAddress))

router.patch("/address/:addressId", isLoggedIn, upload.none(), wrapAsync(updateAddressDetails))

router.delete("/address/:addressId", isLoggedIn, wrapAsync(destroyAddress))

// This is route gets only text only form thats why using upload.none() middleware
router.post("/books/details", isLoggedIn, upload.none(), wrapAsync(addNewBookDetails))

router.post("/books/imageUpload", isLoggedIn, upload.single("image"), wrapAsync(uploadNewBookImage))

router.patch("/books/:bookId", isLoggedIn, upload.none(), wrapAsync(updateBookDetails))

router.delete("/books/:bookId", isLoggedIn, wrapAsync(destroyBook))

router.get("/books/analytics", isLoggedIn, wrapAsync(sendSellerAnalytics))

router.post("/delivery/status", isLoggedIn, wrapAsync(setDeliveryOrderStatus))

// In-session store for OTPs and their expiry times
router.post("/send_otp", (req, res) => {
    const { mobileNumber } = req.body;
    req.session.mobileNumber = mobileNumber;
    if (!mobileNumber) {
        return res.json({ error: "Mobile number is required to send OTP" });
    }

    if (req.app.locals.otps[mobileNumber]) {
        return res.json({ error: "You cannot send otp again from here!" })
    }
    // const uuid = uuidv4();

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999);

    // Store the OTP and its expiry time (5 minutes from now)
    // also store resend in to know when to resend the otp
    req.app.locals.otps[mobileNumber] = {
        code: otp,
        expiresAt: moment().add(10, 'minutes'),
        resendIn: moment().add(1, 'minutes')
    };
    console.log(req.app.locals.otps);
    // TODO: Use an SMS API to send the OTP to the mobile number
    res.json({ success: true });
    // res.json(req.app.locals.otps);

})

// Route for verifying OTP
router.post('/verify_otp', (req, res) => {
    const { code } = req.body;
    const { mobileNumber } = req.session;
    // Check if the OTP exists and hasn't expired
    if (!mobileNumber) {
        return res.json({ error: "Mobile number is required to verify otp" });
    }
    if (!code) {
        return res.json({ error: "OTP is required!" });
    }
    if (req.app.locals.otps[mobileNumber] &&
        req.app.locals.otps[mobileNumber].code === parseInt(code) &&
        moment().isBefore(req.app.locals.otps[mobileNumber].expiresAt)) {
        // Delete the OTP from the store to prevent reuse
        delete req.app.locals.otps[mobileNumber];
        delete req.session.mobileNumber;
        res.json({ success: 'OTP verified successfully' });
    } else {
        res.json({ error: 'Invalid or expired OTP' });
    }
});

// Route for requesting to resend OTP
router.post('/resend_otp', (req, res) => {
    const { mobileNumber } = req.body;
    req.session.mobileNumber = mobileNumber;

    if (!mobileNumber) {
        return res.json({ error: "Mobile number is required to resend otp" });
    }

    // Check if there is an existing OTP for this mobile number
    const isExistingOtp = Object.keys(req.app.locals.otps).find(key => key === mobileNumber)

    if (isExistingOtp && moment().isBefore(req.app.locals.otps[mobileNumber].resendIn)) {
        // An OTP already exists and hasn't expired yet, so we can't resend it
        return res.json({ error: "Wait 1 min before sending another OTP!" });
    }

    // Generate a new OTP and store it
    const otp = crypto.randomInt(100000, 999999);

    req.app.locals.otps[mobileNumber] = {
        code: otp,
        expiresAt: moment().add(5, 'minutes'),
        resendIn: moment().add(1, 'minutes')
    };
    console.log(req.app.locals.otps);
    // TODO: Use an SMS API to send the OTP to the mobile number
    res.json({ success: 'OTP resent successfully' });
});

module.exports = router;