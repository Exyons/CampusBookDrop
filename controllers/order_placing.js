const { cloudinary } = require("../cloudinary");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const orderid = require('order-id')('key');
const { Readable } = require('stream');
const User = require("../db_models/user");
const Order = require("../db_models/order");
const DeliveryOrder = require("../db_models/delivery_order");
const { Product } = require("../db_models/product");
const { Address } = require("../db_models/address");


const cloudinaryUploadStream = (stream, folderName, tag) => {
    let root = "BookSellingApp"
    if(process.env.NODE_ENV === "production"){
        root = "CampusBookDrop"
    }
    return new Promise((resolve, reject) => {
        const cloudinaryStream = cloudinary.uploader.upload_stream(
            {
                tags: tag,
                resource_type: 'image',
                folder: `${root}/${folderName}`,
                allowed_formats: ['jpg', 'jpeg', 'png']
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.pipe(cloudinaryStream);
    });
};

const renderOrderPlacingPage = async (req, res) => {
    if (!req.user) {
        req.flash("error", "You First Need To Login!")
        return res.redirect("/books");
    }

    if (res.app.locals.orderPlacingToken) {
        delete res.app.locals.orderPlacingToken;
        return res.redirect("/books");
    }

    const id = req.user._id;
    const user = await User.findById(id).populate("addresses");
    const { books } = res.app.locals;
    if (!books) {
        // req.flash("error", "The Book You Are Buying Does Not Exist!")
        return res.redirect("/books");
    }
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.render("order_placing/index", { title: "Place Order | Campus Book Drop", page_styles: "order_placing.css", user, books })
}

const generateToken = async (req, res) => {
    // I am not using isLoggedIn middleware here beacuse I don't want to redirect user to login page
    // I will just send a response to redirect back to /books page
    if (req.user) {
        const token = uuidv4();
        res.app.locals.orderPlacingToken = token;
        try {
            const saltRounds = 11;
            const hashedToken = await bcrypt.hash(token, saltRounds)
            res.json({ token: hashedToken })
        } catch (error) {
            res.json({ redirect: "/books" })
        }
    }
    else {
        req.flash("success", "Login To Your Account")
        res.json({ redirect: "/user/log_in" })
    }
}

const verifyOrderAndToken = async (req, res) => {
    const { data, token } = req.body;
    if (!data) {
        return res.json({ redirect: "/books" });
    }
    if (!req.user) {
        return res.json({ redirect: "/user/log_in" });
    }
    const id = req.user._id;
    const user = await User.findById(id);
    // Validating the token to confirm the order being placed is legit
    const isValidToken = await bcrypt.compare(res.app.locals.orderPlacingToken, token)
    if (!isValidToken) {
        return res.json({ redirect: "/books" });
    }
    if (!user) {
        return res.json({ error: "Error user not found" });
    }

    if (!data.bookIdsAndQty.length) {
        return res.json({ error: "You must have books selected to buy them" });
    }

    const books = [];
    for (const { bookId, cart_qty } of data.bookIdsAndQty) {
        const book = await Product.findById(bookId);
        if (!book) {
            return res.json({ error: "The book you are ordering does not exist" });
        }
        if (book.user.toString() === user._id.toString()) {
            return res.json({ error: "You cannot buy the book you listed for sale!" });
        }
        if (cart_qty <= 0) {
            return res.json({ error: "Invalid qauntity of book!" });
        }
        books.push({ book, cart_qty });
    }
    res.app.locals.books = books;
    delete res.app.locals.orderPlacingToken;
    res.json({ redirect: "/order_placing" })
}

const saveShippingAddress = async (req, res) => {
    // I dont know why when sending FormData obect from a form req.body is empty
    // But when I use upload.none() and specify formtype on page as multipart/form-data req.body is not empty
    const id = req.user._id;
    // const { name, mobile, room, hostel } = req.body;
    try {
        const user = await User.findById(id)
        const address = new Address(req.body)
        user.addresses.push(address)
        await user.save()
        await address.save()
        res.app.locals.address = address
        res.json({ success: "Address Saved!" })
    } catch (error) {
        // console.log(error);
        res.json({ error: "Server Error!" })
    }
}

const showSelectAddressOption = async (req, res) => {
    // const id = req.user._id;
    const { addressId } = req.body;
    if (!addressId) {
        return res.json({ error: "Address is needed!" });
    }
    try {
        const address = await Address.findById(addressId);
        res.app.locals.address = address
        res.json({ success: true })
    } catch (error) {
        res.json({ error: "Server Error!" })
    }
}

const confirmPayment = async (req, res) => {
    if (!res.app.locals.address) {
        return res.json({ error: "Address is needed before payment!" })
    }
    res.json({ success: "Payment Done!" });
}

const calculateOrderAmount = async (req, res) => {
    let deliveryCharge = 0
    let subtotal = 0;
    let totalAmount = 0
    res.app.locals.validAmounts = false;
    try {
        const { books } = res.app.locals;
        const cartLength = books.length;
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
            
            // Giving new users zero delivery fee on their first order
            const user = await User.findById(req.user._id);
            if (req.app.locals.freeDeliveryOnFirstOrder) {
                // Giving new users zero delivery fee on their first order
                if (user.orders.length === 0) {
                    deliveryCharge = 0;
                }
            }

            books.forEach(book => {
                subtotal += book.book.price * book.cart_qty;
            })
            totalAmount = deliveryCharge + subtotal
            res.json({ deliveryCharge, subtotal, totalAmount });
        }
        else {
            res.json({ deliveryCharge, subtotal, totalAmount });
        }
        res.app.locals.validAmounts = true;
        res.app.locals.deliveryCharge = deliveryCharge;
        res.app.locals.totalAmount = totalAmount;
    } catch (error) {
        res.app.locals.validAmounts = false;
        res.json({ error: "Server Error!" })
    }
}

const uploadReceipt = async (req, res) => {
    const { receiptImage } = req.session;
    // This deletes the uploaded image if user uploads another image
    if (receiptImage) {
        await cloudinary.uploader.destroy(receiptImage.filename);
        delete res.app.locals.receiptImage;
    }
    if (req.file) {
        if(req.file.size >= 1000000){
            return res.json({error: "Image size should be less than 1MB!"})
        }
        // Because I am storing image in memmory, it is stored as buffer
        // Convert req.file.buffer to Stream for uploading to cloudinary
        const bufferStream = new Readable();
        bufferStream.push(req.file.buffer);
        bufferStream.push(null);

        try {
            const uploadStream = await cloudinaryUploadStream(bufferStream, `${req.user.username}/receipts`, "ReceiptImage");
            // console.log(uploadStream);
            res.app.locals.receiptImage = {
                url: uploadStream.secure_url,
                filename: uploadStream.public_id
            }
            res.json({ success: "Receipt Uploaded Successfully!" })
        } catch (error) {
            console.error(error);
            res.json({ error: "Error Uploading Receipt!" });
        }
    }
}

const orderPlaceConfirmation = async (req, res) => {
    //TODO
    // If the order is not placed, delete the receipt image from cloudinary
    if (!res.app.locals.validAmounts) {
        return res.json({ error: "Cannot Place Your Order!" })
    }
    const { books } = res.app.locals;
    const { receiptImage } = res.app.locals;
    const { address } = req.app.locals;
    const { deliveryCharge } = res.app.locals;
    const { totalAmount } = res.app.locals;
    try {
        const user = await User.findById(req.user._id);
        if (!address) {
            return res.json({ error: "Order cannot be placed! Address is required!" });
        }
        if (!receiptImage) {
            return res.json({ error: "Order cannot be placed! Upload payment receipt image!" });
        }
        if (!books.length) {
            return res.json({ error: "Order cannot be placed! You must select atleast one book before placing order!" });
        }

        const orderId = orderid.generate();
        const newOrder = new Order({
            receiptImage,
            order_id: orderId,
            status: "processing",
            date: Date.now(),
            address: address,
            deliveryCharge,
            totalAmount,
            statusComment: "Your payment is being verified."
        })

        const newDeliveryOrder = new DeliveryOrder({
            shipping_address: address,
            order_id: orderId,
            delivery_status: "open",
            payment_status: "processing"
        })

        let foundBook = {};
        for (const { book, cart_qty } of books) {
            // What if the seller who just removed the book, a user might place order for it
            foundBook = await Product.findById(book._id).populate({ path: "user", populate: { path: "addresses" } });
            if (!foundBook) {
                return res.json({ error: "Order cannot be placed! The product you are ordering does not exist!" });
            }
            if (foundBook.user.toString() === user._id.toString()) {
                return res.json({ error: "Order cannot be placed! You cannot buy the book you listed for sale!" });
            }
            if (foundBook.qty === 0) {
                return res.json({ error: "Order cannot be placed! The book you are buying is out of stock!" });
            }
            if (cart_qty <= 0) {
                return res.json({ error: "Order cannot be placed! Invalid quantity of book!" });
            }
            foundBook.qty -= 1;
            newOrder.products.push({
                product: foundBook,
                order_qty: cart_qty
            });
            newDeliveryOrder.products.push({
                product: foundBook,
                pickup_qty: cart_qty
            })
            newDeliveryOrder.pickup_addresses.push(foundBook.user.addresses[0])
        }

        user.orders.push(newOrder);

        await newOrder.save();
        await user.save();
        await foundBook.save();
        await newDeliveryOrder.save();
        
        delete res.app.locals.deliveryCharge;
        delete res.app.locals.totalAmount
        delete res.app.locals.books;
        delete res.app.locals.receiptImage;
        delete res.app.locals.address;
        
        res.json({ success: "Huurray! Order Placed!" })
    } catch (error) {
        console.log(error);
        res.json({ error: "Server Error! Cannot Place Order" })
    }
}

module.exports = {
    renderOrderPlacingPage,
    generateToken,
    verifyOrderAndToken,
    saveShippingAddress,
    showSelectAddressOption,
    confirmPayment,
    calculateOrderAmount,
    uploadReceipt,
    orderPlaceConfirmation
}