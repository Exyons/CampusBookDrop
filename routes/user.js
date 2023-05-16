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
    saveThumbnail,
    generateOTP,
    regenerateOTP,
    verifyOTP,
    sendOtpToEmail } = require("../controllers/user.js");


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
    passport.authenticate("local", { failureFlash: true, failureRedirect: "/user/log_in" }),
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

router.post("/send_otp", generateOTP, wrapAsync(sendOtpToEmail))

// Route for verifying OTP
router.post('/verify_otp', verifyOTP);

// Route for requesting to resend OTP
router.post('/resend_otp', regenerateOTP, wrapAsync(sendOtpToEmail));

module.exports = router;