const express = require("express");
const wrapAsync = require("../utils/WrapAsync");
const { isLoggedIn, deleteImages } = require("../middlewares");
const multer = require("multer");
const upload = multer({
    // for stroing the image in memory temporarily before uploading
    storage: multer.memoryStorage()
});
const router = express.Router();

const { renderOrderPlacingPage,
    generateToken,
    verifyOrderAndToken,
    saveShippingAddress,
    showSelectAddressOption,
    confirmPayment,
    calculateOrderAmount,
    uploadReceipt,
    orderPlaceConfirmation } = require("../controllers/order_placing");

router.get("/order_placing", isLoggedIn, deleteImages, wrapAsync(renderOrderPlacingPage))

router.post("/order_placing/getToken", wrapAsync(generateToken))

router.post("/order_placing", wrapAsync(verifyOrderAndToken))

router.post("/order_placing/save_address", isLoggedIn, upload.none(), wrapAsync(saveShippingAddress))

router.post("/order_placing/select_address", isLoggedIn, wrapAsync(showSelectAddressOption))

router.post("/order_placing/payment", isLoggedIn, wrapAsync(confirmPayment))

router.get("/order_placing/getAmounts", wrapAsync(calculateOrderAmount))

router.post("/order_placing/recieptImageUpload", isLoggedIn, upload.single("reciept"), wrapAsync(uploadReceipt))

router.post("/order_placing/confirmation", isLoggedIn, wrapAsync(orderPlaceConfirmation))

module.exports = router; 