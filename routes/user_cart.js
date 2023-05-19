const express = require("express");
const wrapAsync = require("../utils/WrapAsync");
const { deleteImages } = require("../middlewares");
const router = express.Router();
const { returnCartItemCount,
    calculateCartValue,
    renderUserCart,
    addItemToCart,
    updateUserCartItem,
    destroyWholeCart,
    destroyCartItem } = require("../controllers/user_cart");


router.get("/user_cart/itemcount", deleteImages, wrapAsync(returnCartItemCount))

router.get("/user_cart/getAmounts", deleteImages, wrapAsync(calculateCartValue))

router.get("/user_cart", wrapAsync(renderUserCart))

router.post("/user_cart/:id/add", wrapAsync(addItemToCart))

router.patch("/user_cart/:id/update", wrapAsync(updateUserCartItem))

router.delete("/user_cart/destroy", wrapAsync(destroyWholeCart))

router.delete("/user_cart/:id/remove", wrapAsync(destroyCartItem))

module.exports = router;