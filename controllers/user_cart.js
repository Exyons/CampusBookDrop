// const { render } = require("ejs");
const { Product } = require("../db_models/product");
const User = require("../db_models/user");

const returnCartItemCount = async (req, res) => {
    if (!req.user) {
        if (req.session.cart) {
            res.json({ count: req.session.cart.length });
        }
        else {
            res.json({ count: 0 });
        }
    }
    else {
        const user = await User.findById(req.user._id);
        res.json({ count: user.cart.length });
    }
}

const calculateCartValue = async (req, res) => {
    let deliveryCharge = 0
    let subtotal = 0;
    if (!req.user) {
        try {
            if (req.session.cart) {
                const cartLength = req.session.cart.length;
                if (0 < cartLength && cartLength <= req.app.locals.discountProductCount) {
                    deliveryCharge = req.app.locals.maxDeliveryCharge;
                }
                else if (cartLength > req.app.locals.discountProductCount) {
                    deliveryCharge = req.app.locals.minDeliveryCharge;
                }
                else {
                    deliveryCharge = 0;
                }
                for (let i = 0; i < cartLength; ++i) {
                    const product = await Product.findById(req.session.cart[i].product);
                    subtotal += product.price * req.session.cart[i].cart_qty;
                }
                res.json({ deliveryCharge, subtotal, totalAmount: deliveryCharge + subtotal });
            }
            else {
                res.json({ deliveryCharge, subtotal, totalAmount: deliveryCharge + subtotal });
            }
        } catch (error) {
            res.json({ error: "Cannot Contact Server!" })
        }
    }
    else {
        try {
            const user = await User.findById(req.user._id);
            const cartLength = user.cart.length;
            if (cartLength) {
                if (0 < cartLength && cartLength <= req.app.locals.discountProductCount) {
                    deliveryCharge = req.app.locals.maxDeliveryCharge;
                }
                else if (cartLength > req.app.locals.discountProductCount) {
                    deliveryCharge = req.app.locals.minDeliveryCharge;
                }
                else {
                    deliveryCharge = 0;
                
                }
                if (req.app.locals.freeDeliveryOnFirstOrder) {
                    // Giving new users zero delivery fee on their first order
                    if (user.orders.length === 0) {
                        deliveryCharge = 0;
                    }
                }

                for (const cartItem of user.cart) {
                    const product = await Product.findById(cartItem.product);
                    if (product) {
                        subtotal += product.price * cartItem.cart_qty;
                    }
                }
                res.json({ deliveryCharge, subtotal, totalAmount: deliveryCharge + subtotal });
            }
            else {
                res.json({ deliveryCharge, subtotal, totalAmount: deliveryCharge + subtotal });
            }
        } catch (error) {
            res.json({ error: "Cannot Contact Server!" })
        }
    }
}

const renderUserCart = async (req, res) => {
    const title = "Your Cart";

    let products = [];
    if (!req.user) {
        if (!req.session.cart) {
            req.session.cart = [];
        }
        else {
            for (let i = 0; i < req.session.cart.length; ++i) {
                const populatedProduct = await Product.findById(req.session.cart[i].product);
                if (populatedProduct) {
                    products.push({
                        product: populatedProduct,
                        cart_qty: req.session.cart[i].cart_qty
                    });
                }
            }
        }
    }
    else {
        const user = await User.findById(req.user._id);
        // TODO
        // Implement function, when the seller removes his/her product from database
        // remove those items from the cart of the user.
        for (let i = 0; i < user.cart.length; ++i) {
            const populatedProduct = await Product.findById(user.cart[i].product);
            if (populatedProduct) {
                products.push({
                    product: populatedProduct,
                    cart_qty: user.cart[i].cart_qty
                });
            }
        }
    }
    res.render("user/user_cart", { title, page_styles: "user_cart_styles.css", products });
}

const addItemToCart = async (req, res) => {
    const { id } = req.params;
    const foundProduct = await Product.findById(id);
    if (!foundProduct) {
        req.json({ error: "The product you are adding to cart does not exist!" });
        // return res.redirect("/user_cart");
    }
    const maxOrderQty = Math.min(foundProduct.qty, req.app.locals.maxCartQty);
    // If the user is not logged in store cart data in session
    if (!req.user) {

        if (!req.session.cart) {
            req.session.cart = [];
        }

        // Check if the session cart has already products or not
        // by checnking if its length is more than zero
        // If yes, then check if the user has added an exixting item or not, 
        //        if yes increment its quantity, if no add that item to cart
        // If no, add the item to cart
        const cartLength = req.session.cart.length;

        if (cartLength >= 15) {
            return res.json({ error: "Cart Full!" })
        }

        if (cartLength > 0) {
            let isExisting = false;
            for (const cartItem of req.session.cart) {
                if (cartItem.product.toString() === foundProduct._id.toString()) {
                    isExisting = true;
                    if (cartItem.cart_qty < maxOrderQty) {
                        cartItem.cart_qty += 1;
                        break;
                    }
                    else {
                        // req.flash("error", `You cannot order quantity more than ${maxOrderQty} of same item!`);
                        return res.json({ error: "You cannot increase quantity more" });
                    }
                }
            }
            if (!isExisting) {
                req.session.cart.push({ product: foundProduct._id, cart_qty: 1 });
            }
        }
        else {
            req.session.cart.push({ product: foundProduct._id, cart_qty: 1 });
        }
        // res.redirect("/user_cart");
        res.json({ success: "Added an item to cart!" });
    }
    else {
        // If the user is logged in add product to their database cart
        const user = await User.findById(req.user._id);
        const cartLength = user.cart.length;

        if (cartLength >= 15) {
            return res.json({ error: "Cart Full!" })
        }

        if (cartLength > 0) {
            let isExisting = false;
            for (const cartItem of user.cart) {
                if (cartItem.product.toString() === foundProduct._id.toString()) {
                    isExisting = true;
                    if (cartItem.cart_qty < maxOrderQty) {
                        cartItem.cart_qty += 1;
                        break;
                    }
                    else {
                        // req.flash("error", `You cannot increase quantity more than ${maxOrderQty} of same item!`);
                        return res.json({ error: "You cannot increase quantity more" });
                    }
                }
            }
            if (!isExisting) {
                user.cart.push({ product: foundProduct._id, cart_qty: 1 });
            }
        }
        else {
            user.cart.push({ product: foundProduct._id, cart_qty: 1 });
        }
        await user.save();
        res.json({ success: "Added an item to cart!" });
    }
}

const updateUserCartItem = async (req, res) => {
    const { id } = req.params;
    const { q } = req.query;
    const foundProduct = await Product.findById(id);

    if (!foundProduct) {
        req.flash("error", "The product you are changing quantity of does not exist!");
        return res.redirect("/user_cart");
    }

    const maxOrderQty = Math.min(foundProduct.qty, req.app.locals.maxCartQty);
    if (!req.user) {
        for (const cartItem of req.session.cart) {
            if (cartItem.product.toString() === foundProduct._id.toString()) {
                if (q === "+") {
                    if (cartItem.cart_qty < maxOrderQty) {
                        cartItem.cart_qty += 1;
                        res.json({ qty: cartItem.cart_qty });
                        break;
                    }
                    else {
                        res.json({ error: `You cannot increase quantity more than ${maxOrderQty}!` });
                    }
                }
                else if (q === "-") {
                    if (cartItem.cart_qty > 1) {
                        cartItem.cart_qty -= 1;
                        res.json({ qty: cartItem.cart_qty });
                        break;
                    }
                    else {
                        res.json({ error: `You cannot decrease quantity less than zero!` });
                    }
                }
            }
        }
    }
    else {
        const user = await User.findById(req.user._id);
        const cartLength = user.cart.length;
        if (cartLength > 0) {
            for (const cartItem of user.cart) {
                if (cartItem.product.toString() === foundProduct._id.toString()) {
                    if (q === "+") {
                        if (cartItem.cart_qty < maxOrderQty) {
                            cartItem.cart_qty += 1;
                            res.json({ qty: `${cartItem.cart_qty}` });
                            break;
                        }
                        else {
                            res.json({ error: `You cannot increase quantity more than ${maxOrderQty}!` });
                        }
                    }
                    else if (q === "-") {
                        if (cartItem.cart_qty > 1) {
                            cartItem.cart_qty -= 1;
                            res.json({ qty: `${cartItem.cart_qty}` });
                            break;
                        }
                        else {
                            res.json({ error: `You cannot decrease quantity less than zero!` });
                        }
                    }
                }
            }
        }
        else {
            res.json({ error: "You cannot increase quantity when cart is empty!" });
        }
        await user.save();
    }
}

const destroyWholeCart = async (req, res) => {
    if (!req.user) {
        delete req.session.cart;
    }
    else {
        const user = await User.findById(req.user._id);
        if (user.cart.length) {
            user.cart = [];
        }

        try {
            await user.save();
        } catch (error) {
            res.json({ error: "Error while clearing cart!" })
        }
    }
}

const destroyCartItem = async (req, res) => {
    // console.log(req.params);
    const { id } = req.params;
    // console.log(id);
    const foundProduct = await Product.findById(id);
    if (!foundProduct) {
        return res.json({ error: "Product Not Found!" });
    }
    if (!req.user) {
        if (!req.session.cart || !req.session.cart.length) {
            // If anyhow the user sends a delete request when the cart is empty

            // res.redirect("/user_cart");
            return res.json({ error: "You cannont remove a product when cart is empty!" });
        }
        else {
            // console.log(req.session.cart)
            req.session.cart.forEach((cartItem, index) => {
                if (cartItem.product.valueOf() === foundProduct._id.valueOf()) {
                    req.session.cart.splice(index, 1);
                }
            })
            res.json({ success: "You removed an item from cart" });
        }
    }
    else {
        delete req.session.cart;
        const user = await User.findById(req.user._id);
        if (!user.cart.length) {
            // If anyhow the user sends a delete request when the cart is empty
            return res.json({ error: "You cannont remove a product when cart is empty!" });
        }
        else {
            // console.log(user.cart)
            user.cart.forEach((cartItem, index) => {
                if (cartItem.product.valueOf() === foundProduct._id.valueOf()) {
                    user.cart.splice(index, 1);
                }
            })
            await user.save();
        }
        res.json({ success: "You removed an item from cart" });
    }
}

module.exports = {
    returnCartItemCount,
    calculateCartValue,
    renderUserCart,
    addItemToCart,
    updateUserCartItem,
    destroyWholeCart,
    destroyCartItem
}