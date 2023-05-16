const express = require('express');
const wrapAsync = require("../utils/WrapAsync");
const { deleteImages } = require("../middlewares");
const User = require("../db_models/user");
const { Product } = require("../db_models/product");
const chunk = require("lodash/chunk");
const ejs = require("ejs");

const router = express.Router();

// Define route handlers for the book route
const checkIfProductsAreInCart = (cartArray, productsArray) => {
    // products = [{product: product, in_cart: true}]
    const products = [];
    productsArray.forEach((product) => {
        if (cartArray.length > 0) {
            let isExisting = false;
            for (const cartProduct of cartArray) {
                if (product._id.toString() === cartProduct.product.toString()) {
                    isExisting = true;
                    products.push({
                        product: product,
                        in_cart: true
                    })
                    break;
                }
            }
            if (!isExisting) {
                products.push({
                    product: product,
                    in_cart: false
                })
            }
        }
        else {
            products.push({
                product: product,
                in_cart: false
            })
        }
    })

    return products;
}

router.get("/books", deleteImages, wrapAsync(async (req, res) => {
    // console.log(req.session.bookChunkSentCount);
    // TODO
    // Take hold of which chunk is sent and donot send any data once all chunks are send
    // Do not send data if the main page is not loaded
    const { search } = req.query;

    const { btech_programmes, books_page_styles } = req.app.locals;

    let pageProducts = [];
    if (!search) {
        const title = "Buy Books";
        // When page loads there is no chunk transferred
        res.app.locals.bookChunkSentCount = 0;
        res.render("products_page/books", { title, btech_programmes, page_styles: books_page_styles });
    }
    else {
        // console.log(search);
        const title = `You Searched for: ${search}`;
        // Sanitize the search term before finding books
        // Using mongosanitize to sanitize the query string
        const products = await Product.find({
            qty: { $gt: 0 },
            $or: [
                { title: { $regex: search.trim(), $options: 'i' } },
                { description: { $regex: search.trim(), $options: 'i' } }
                // { programme: { $regex: search.trim(), $options: 'i' } },
                // { branch: { $regex: search.trim(), $options: 'i' } }
            ]
        });
        console.log(products)
        if (!req.user) {
            if (req.session.cart) {
                pageProducts = checkIfProductsAreInCart(req.session.cart, products);
            }
            else {
                pageProducts = checkIfProductsAreInCart([], products);
            }
        }
        else {
            const user = await User.findById(req.user._id);
            pageProducts = checkIfProductsAreInCart(user.cart, products);
        }
        
        res.render("products_page/books", { title, btech_programmes, page_styles: books_page_styles, pageProducts });
    }
}))

router.get("/books/loadBooks", wrapAsync(async (req, res) => {
    // Only show books qty greater than 0
    const products = await Product.find({ qty: { $gt: 0 } });

    // Check if the books are already present in cart
    // If yes disable the addToCart button on the html page using in_cart key
    let pageProducts = []
    if (!req.user) {
        if (req.session.cart) {
            pageProducts = checkIfProductsAreInCart(req.session.cart, products);
        }
        else {
            pageProducts = checkIfProductsAreInCart([], products);
        }
    }
    else {
        const user = await User.findById(req.user._id);
        pageProducts = checkIfProductsAreInCart(user.cart, products);
    }
    // Chunking the data into 6 units
    const numberOfChunks = 6;
    const chunkedData = chunk(pageProducts, numberOfChunks);
    const count = res.app.locals.bookChunkSentCount++;
    if (count < chunkedData.length) {
        try {
            let templateStringArray = [];
            for (const book of chunkedData[count]) {
                const templateString = await ejs.renderFile('views/products_page/partials/product_card.ejs',
                    {
                        product: book,
                        currentUser: res.locals.currentUser
                    });
                templateStringArray.push(templateString);
            }
            res.send(templateStringArray);
        } catch (error) {
            res.json({ error: "Server Error!" });
        }
    }
    else {
        res.json({ success: "Thats All We Have For Now!" });
    }
}))

const constructFilterQuery = (req, res, next) => {
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
    // console.log(filterOptions.semester);
    next();
}

router.post("/books/filter", constructFilterQuery, wrapAsync(async (req, res) => {
    // console.log(req.body);
    // const { semester, year, branch, programme, price } = req.body;
    // const query = {
    //     $or: [
    //         { semester: { $in: semester } },
    //         { year: { $in: year } },
    //         { programme: { $in: programme } },
    //         { branch: { $in: branch } }
    //     ]
    // };

    // console.log(req.filterOptionQuery);
    const products = await Product.find(req.filterOptionQuery);
    // console.log(products);
    // const products = await Product.find({
    //     semester: { $in: semester },
    //     year: { $in: year },
    //     programme: { $in: programme },
    //     branch: { $in: branch }
    // });
    let pageProducts = [];
    if (!req.user) {
        if (req.session.cart) {
            pageProducts = checkIfProductsAreInCart(req.session.cart, products);
        }
        else {
            pageProducts = checkIfProductsAreInCart([], products);
        }
    }
    else {
        const user = await User.findById(req.user._id);
        pageProducts = checkIfProductsAreInCart(user.cart, products);
    }
    // console.log(products);
    try {
        let templateStringArray = [];
        for (const book of pageProducts) {
            const templateString = await ejs.renderFile('views/products_page/partials/product_card.ejs',
                {
                    product: book,
                    currentUser: res.locals.currentUser
                });
            templateStringArray.push(templateString);
        }
        res.json(templateStringArray);
    } catch (error) {
        console.log(error)
        res.json({ success: "Thats all we got. For Now." });
    }
}))

router.get("/books/:id", deleteImages, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const page_styles = "";
    let book = await Product.findById(id).populate("user");
    if (!book) {
        req.flash("error", "Product Not Found!")
        res.redirect("/books");
    }

    const product = await Product.findById(id);
    const title = product.title;

    // Check if the books are already present in cart
    // If yes disable the addToCart button on the html page using in_cart key
    let pageProduct = [];
    if (!req.user) {
        if (req.session.cart) {
            pageProduct = checkIfProductsAreInCart(req.session.cart, [product]);
        }
        else {
            pageProduct = checkIfProductsAreInCart([], [product]);
        }
    }
    else {
        const user = await User.findById(req.user._id);
        pageProduct = checkIfProductsAreInCart(user.cart, [product]);
    }
    // console.log(pageProduct)
    res.render("products_page/product_details", { title, page_styles, product: pageProduct[0] });
}))

module.exports = router;