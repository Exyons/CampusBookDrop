const User = require("../db_models/user");
const { Product } = require("../db_models/product");
const chunk = require("lodash/chunk");
const ejs = require("ejs");

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

const renderBooksPage = async (req, res) => {
    // Taking note of how many chunks are sent
    res.app.locals.bookChunkSentCount = 0;
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.render("products_page/books", { title: "Books | CampusBookDrop", page_styles: "books.css" });
}

const sendBookCardPartial = async (req, res) => {
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
    const numberOfProductsInChunk = 6;
    const chunkedData = chunk(pageProducts, numberOfProductsInChunk);
    if (!chunkedData.length){
        return res.json({ error: "No Books Found!" })
    }
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
}

const renderBookSearchPage = async (req, res) => {
    const { q } = req.query;
    res.app.locals.bookChunkSentCount = 0;
    const title = `You Searched for: ${q}`;
    res.render("products_page/search_books", { title, query: q, page_styles: "books.css" });
}

const sendSearchedBookCardPartial = async (req, res) => {
    const { q } = req.query;
    // console.log(q);
    // Only show books qty greater than 0
    let pageProducts = []
    try {
        const products = await Product.find({
            qty: { $gt: 0 },
            $or: [
                { title: { $regex: q.trim(), $options: 'i' } },
                { description: { $regex: q.trim(), $options: 'i' } },
                { programme: { $regex: q.trim(), $options: 'i' } },
                { branch: { $regex: q.trim(), $options: 'i' } }
            ]
        });
        // console.log(products.length)
        // Check if the books are already present in cart
        // If yes disable the addToCart button on the html page using in_cart key

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
    } catch (error) {
        return res.json({ error: "Server Error!" });
    }

    // Chunking the data into 6 units
    const numberOfProductsInChunk = 6;
    const chunkedData = chunk(pageProducts, numberOfProductsInChunk);
    if (!chunkedData.length){
        return res.json({ error: "No Books Found!" })
    }
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
            return res.json({ error: "Server Error!" });
        }
    }
    else {
        res.json({ success: "Thats All We Have For Now!" });
    }
}

const filterBooks = async (req, res) => {
    const products = await Product.find(req.filterOptionQuery);
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
}

const renderDetailsPage = async (req, res) => {
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
    res.render("products_page/product_details", { title, page_styles, product: pageProduct[0] });
}

module.exports = {
    renderBooksPage,
    sendBookCardPartial,
    renderBookSearchPage,
    sendSearchedBookCardPartial,
    filterBooks,
    renderDetailsPage
}