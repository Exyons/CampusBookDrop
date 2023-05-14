const { cloudinary } = require("../cloudinary");
const User = require("../db_models/user");
const Order = require("../db_models/order");
const DeliveryOrder = require("../db_models/delivery_order");
const { Product } = require("../db_models/product");
const { Address } = require("../db_models/address");
const { Readable } = require('stream');
const nodemailer = require("nodemailer");
const moment = require('moment');
const bcrypt = require("bcrypt");
// import fetch from 'node-fetch';
// const upload = multer({ storage })

const cloudinaryUploadStream = (stream, folderName, width, height) => {
    return new Promise((resolve, reject) => {
        const cloudinaryStream = cloudinary.uploader.upload_stream(
            {
                tags: "SellerBookImage",
                resource_type: 'image',
                folder: `BookSellingApp/${folderName}`,
                width,
                height,
                crop: 'limit',
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

const validatePassword = (password) => {
    // Check length of password
    if (password.length < 8 || password.length > 20) {
        return false;
    }

    // Check for at least one symbol, one capital letter, one number, and one lowercase letter
    const symbolRegex = /[@#$%^&+=]/;
    const capitalRegex = /[A-Z]/;
    const numberRegex = /[0-9]/;
    const lowercaseRegex = /[a-z]/;
    if (!symbolRegex.test(password) ||
        !capitalRegex.test(password) ||
        !numberRegex.test(password) ||
        !lowercaseRegex.test(password)) {
        return false;
    }

    // If all criteria are met, return true
    return true;
}

const renderForgotPasswordPage = (req, res) => {
    const title = "Forgot Password";
    const page_styles = "";
    res.render("user/forgot_password", { title, page_styles });
}

const renderSignUpForm = (req, res) => {
    const title = "Sign Up | CampusBookDrop";
    const page_styles = "password_visibility.css";
    res.render("user/sign_up", { title, page_styles });
}

const signUpUser = async (req, res, next) => {
    try {
        // Using passport to sign up
        // It is to be done like this do not modify again
        const { firstname, lastname, email, mobile, password, username } = req.body;
        // Check Password
        if (!validatePassword(password)) {
            req.flash("error", "Password Invalid!")
            return res.json({ redirect: "/user/sign_up" })
        }
        if (!res.app.locals.isValidUsername) {
            req.flash("error", "Invalid Username!");
            return res.json({ redirect: "/user/sign_up" })
        }
        if (!res.app.locals.isValidEmail) {
            req.flash("error", "Invalid Email!");
            return res.json({ redirect: "/user/sign_up" })
        }
        let newUser = new User({ firstname, lastname, email, mobile, username, joining_date: Date.now() });
        newUser = await User.register(newUser, password);

        req.logIn(newUser, err => {
            if (err) { return next(err); }
            delete res.app.locals.isValidUsername;
            delete res.app.locals.isValidEmail;
            req.flash("success", "Thank You For Registering!");
            // You have send data from inside req.login function to login the user successfully
            res.json({ redirect: "/" });
        })
        next();
    }
    catch (error) {
        // req.flash("error", "Cannot sign you up!");
        // res.redirect("/user/sign_up");
        res.json({ error: "Server Error!" })
    }
}

const checkUsername = async (req, res) => {
    const { username } = req.body;
    // console.log(username)
    try {
        res.app.locals.isValidUsername = false;
        if (4 <= username.length && username.length <= 10) {
            const users = await User.find({ username })
            if (users.length) {
                res.app.locals.isValidUsername = false;
                res.json({ error: "This username is not available!" });
            }
            else {
                res.app.locals.isValidUsername = true;
                res.json({ success: "Username available!" });
            }
        }
        else {
            res.json({ error: "Length should be 4-10 characters!" })
        }
    } catch (error) {
        // console.log(error)
        res.json({ error: "Server Error!" })
    }
}

const checkEmail = async (req, res) => {
    const { email } = req.body;
    try {
        const users = await User.find({ email })
        res.app.locals.isValidEmail = false;
        if (users.length) {
            res.app.locals.isValidEmail = false;
            res.json({ error: "Email already exist!" });
        }
        else {
            res.app.locals.isValidEmail = true;
            res.json({ success: "Unique email!" });
        }
    } catch (error) {
        console.log(error)
        res.json({ error: "Server Error!" })
    }
}

const checkPassword = async (req, res) => {
    const { password } = req.body;

    if (password.length < 8 || password.length > 20) {
        return res.json({ error: "Length should be 8-20 characters!" });
    }
    // Check for at least one symbol, one capital letter, one number, and one lowercase letter
    const symbolRegex = /[@#$%^&+=]/;
    const capitalRegex = /[A-Z]/;
    const numberRegex = /[0-9]/;
    const lowercaseRegex = /[a-z]/;
    if (!symbolRegex.test(password)) {
        return res.json({ error: "Must contain atleast one symbol @#$%^&+=" });
    }
    if (!capitalRegex.test(password)) {
        return res.json({ error: "Must contain atleast one capital letter!" });
    }
    if (!numberRegex.test(password)) {
        return res.json({ error: "Must contain atleast one number!" });
    }
    if (!lowercaseRegex.test(password)) {
        return res.json({ error: "Must contain atleast one lower case letter!" });
    }
    // If all criteria are met, return true
    res.json({ success: "Valid Password!" });;
}

const renderLogInForm = (req, res) => {
    const title = "Log In | CampusBookDrop";
    const page_styles = "password_visibility.css";
    res.render("user/log_in", { title, page_styles });
}

const updateUserCart = async (req, res) => {
    const redirectUrl = res.locals.returnTo || "/";
    const id = req.user._id;
    const sessionCart = res.locals.cart || [];
    // Save the cart data to the MongoDB database
    // This will be done when either user logs in or register
    // TODO 
    // implement this when user register
    const user = await User.findById(id);
    if (user.cart.length >= 15) {
        req.flash("success", "We are glad to have you back!");
        return res.redirect("/");
    }
    for (const sessionItem of sessionCart) {
        const foundProduct = await Product.findById(sessionItem.product);
        const maxOrderQty = Math.min(foundProduct.qty, req.app.locals.maxCartQty);
        let isExisting = false;
        let isAuthor = false;
        if (foundProduct.user.toString() !== req.user._id.toString()) {
            // console.log("Not author")
            for (const item of user.cart) {
                // Add the products from session to user cart if he/she is not the same user who
                // added that product
                // const product = await Product.findById(item.product)
                if (sessionItem.product.toString() === item.product._id.toString()) {
                    item.cart_qty += sessionItem.cart_qty;
                    if (item.cart_qty > maxOrderQty) {
                        item.cart_qty = maxOrderQty;
                    }
                    isExisting = true;
                    break;
                }
            }
        }
        else {
            isAuthor = true;
            // console.log("Yes author")
        }

        if (!isAuthor && !isExisting) {
            // console.log("Yes Added", isAuthor, isExisting);
            user.cart.push(sessionItem);
        }
        // else {
        //     // console.log("Yes Flash");
        //     req.flash("error", "You cannot add the products that you listed!");
        // }
        // }
    }
    try {
        await user.save();
        // Clear the cart data from the session
        delete res.locals.cart;
        delete req.session.cart;
        // req.flash("success", 'Cart data saved! ');
        req.flash("success", "We are glad to have you back!");
        res.redirect(redirectUrl);
    }
    catch (err) {
        req.flash("error", "Cart Save Error!!");
        res.redirect("/")
    }
}

const logOutUser = (req, res, next) => {
    req.logOut(err => {
        if (err) { return next(err); }
        req.flash("success", "Logged Out Successfully!");
        res.redirect("/");
    })
}

const renderUserDashboard = async (req, res) => {
    const id = req.user._id;
    const user = await User.findById(id)
        .populate("addresses")
        .populate("orders")

    if (!user) {
        req.flash("error", "Error in /user/dashboard, user not found");
        return res.redirect("/user");
    }
    // Find all the books listed by user who is seller
    // And also the books that were ordered by other users
    let sellerBooks = [];
    // let sellerOrderProducts = [];
    let sellerOrders = [];
    if (user.user_type === "seller") {
        sellerBooks = await Product.find({ user: user._id });
        const orders = await Order.find({
            status: {
                // Remove processing before deploying
                $in: ["processing", "confirmed", "canceled", "delivered", "returned"]
            }
        })
        if (orders.length) {
            orders.forEach(order => {
                for (const product of order.products) {
                    if (product.product.user.toString() === user._id.toString()) {
                        sellerOrders.push({ product: product, order_id: order.order_id, status: order.status })
                    }
                }
            })
        }
    }
    let userDeliveryOrders = []
    if (user.user_type === "delivery") {
        const deliveryOrders = await DeliveryOrder.find({
            payment_status: {
                $in: ["processing", "confirmed", "canceled", "delivered", "returned"]
            }
        })
        const deliveryStatus = ["locked", "pickedup", "delivered"]
        deliveryOrders.forEach(order => {
            // show only those orders which are either open to be delivered
            // Or if the current delivery user has locked, pickedup or delivered it
            if (order.delivery_status === "open" ||
                (deliveryStatus.includes(order.delivery_status) && (order.delivery_user.toString() === req.user._id.toString()))) {
                userDeliveryOrders.push(order);
            }
        })

    }
    const { user_dashboard_styles } = req.app.locals;
    const title = "Dashboard";

    res.render("user/dashboard/user_dashboard", { title, page_styles: user_dashboard_styles, user, sellerBooks, userDeliveryOrders, sellerOrders });
}

const updateUserDetails = async (req, res) => {
    const { id } = req.params;
    // TODO
    // verify all data before saaving or sanitize them
    // If user changes mobile number 
    // first verify the mobile number before saving
    try {
        const user = await User.findByIdAndUpdate(id, req.body, { runValidators: true });
        if (!user) {
            return res.json({ error: "User does not exist!" });
        }
        res.json({ success: "Details Updated Successfully!" });
    } catch (error) {
        res.json({ error: "Server Error! Cannot Update Details" });
    }
}

const uploadUserThumbnail = async (req, res) => {
    const thumbnailWidth = "30";
    const thumbnailHeight = "30";

    if (req.session.userThumbnail) {
        await cloudinary.uploader.destroy(req.session.userThumbnail.filename);
        delete req.session.userThumbnail;
    }
    if (req.file) {
        // Because I am storing image in memmory, it is stored as buffer
        // Convert req.file.buffer to Stream for uploading to cloudinary
        const bufferStream = new Readable();
        bufferStream.push(req.file.buffer);
        bufferStream.push(null);

        try {
            const uploadStream = await cloudinaryUploadStream(bufferStream, `${req.user.username}/thumbnail`, thumbnailWidth, thumbnailHeight);
            req.session.userThumbnail = {
                url: uploadStream.secure_url,
                filename: uploadStream.public_id
            }
            res.json({ success: "Image Uploaded Successfully!" })
        } catch (error) {
            console.error(error);
            res.json({ error: "Error Uploading Image!" });
        }
    }
}

const saveThumbnail = async (req, res) => {
    const { id } = req.params;
    if (!req.session.userThumbnail) {
        return res.json({ error: "Upload An Image First!" });
    }
    try {
        const user = await User.findById(id);
        user.user_icon = req.session.userThumbnail;
        await user.save();
        delete req.session.userThumbnail;
        res.json({ success: "Saved Successfully!" })
    } catch (error) {
        console.log(error);
        res.json({ error: "Error Saving Image!" });
    }
}
const saveNewAddress = async (req, res) => {
    const id = req.user._id;
    try {
        // If I am making user user is logged in then there is no point in checking if user exist
        const user = await User.findById(id)
        if (!user) {
            return res.json({ error: "User does not exist! Cannot add address!" });
        }
        const address = new Address(req.body)
        user.addresses.push(address);
        await address.save();
        await user.save();
        res.json({ success: "Address Added Successfully!" });

    } catch (error) {
        res.json({ error: "Server Error! Cannot add new address!" });
    }
}

const updateAddressDetails = async (req, res) => {
    const { addressId } = req.params;
    try {
        const address = await Address.findByIdAndUpdate(addressId, req.body, { runValidators: true });
        if (!address) {
            return res.json({ error: "The Address you want to edit does not exist!" });
        }
        res.json({ success: "Address updated successfully!" });

    } catch (error) {
        res.json({ error: "Server Error! Cannot update address!" });
    }
}

const destroyAddress = async (req, res) => {
    const { addressId } = req.params;
    try {
        const user = await User.findById(req.user._id);
        const address = await Address.findByIdAndDelete(addressId);
        if (!user || !address) {
            // req.flash("error", "Erro in deleteing address, either user or address does not exist")
            return res.json({ error: "Error! Either user or address not found!" });
        }
        await user.updateOne({ $pull: { addresses: { _id: addressId } } })
        res.json({ success: "Deleted Address Successfully!" });

    } catch (error) {
        res.json({ error: "Server Error!" });
    }
}

const addNewBookDetails = async (req, res) => {
    const { bookImage } = req.session;
    if (!bookImage) {
        return res.json({ error: "Upload a book Image" });
    }
    const newProduct = new Product(req.body);
    newProduct.user = req.user._id;
    newProduct.image = bookImage;
    try {
        await newProduct.save();
        delete req.session.bookImage;
        res.json({ success: "Your Book Saved Successfully" });
    } catch (error) {
        // console.log(error);
        res.json({ error: "Error occured when Saving Book. Try Again!" });
    }
    // res.json({success: "Book Saved!"});
}

const uploadNewBookImage = async (req, res) => {
    // If user closes the add book form I want to remove the book image they added
    const { bookImage } = req.session;
    const bookImgWidth = "500";
    const bookImgHeight = "300";
    if (bookImage) {
        await cloudinary.uploader.destroy(bookImage.filename);
        delete req.session.bookImage;
    }

    if (req.file) {
        // Because I am storing image in memmory, it is stored as buffer
        // Convert req.file.buffer to Stream for uploading to cloudinary
        const bufferStream = new Readable();
        bufferStream.push(req.file.buffer);
        bufferStream.push(null);

        try {
            const uploadStream = await cloudinaryUploadStream(bufferStream, `${req.user.username}/books`, bookImgWidth, bookImgHeight);
            req.session.bookImage = {
                url: uploadStream.secure_url,
                filename: uploadStream.public_id
            }
            res.json({ success: "Image Uploaded Successfully!" })
        } catch (error) {
            console.error(error);
            res.json({ error: "Error Uploading Image!" });
        }
    }
}

const updateBookDetails = async (req, res) => {
    const { bookId } = req.params;
    try {
        const product = await Product.findByIdAndUpdate(bookId, req.body, { runValidators: true });
        await product.save();
        res.json({ success: "Book has been Updated successfully!" });
    } catch (error) {
        res.json({ error: "Error! Cannot update book detials!" });
    }
}

const destroyBook = async (req, res) => {
    const { bookId } = req.params;
    try {
        const product = await Product.findByIdAndDelete(bookId);

        if (!product) {
            return res.json({ error: "Product not found!" })
        }
        if (product.image) {
            await cloudinary.uploader.destroy(product.image.filename);
        }
        res.json({ success: "Deleted you book successfully!" });

    } catch (error) {
        res.json({ error: "Server Error! Cannot delete book! Try Again" });
    }
}

const sendSellerAnalytics = async (req, res) => {
    const id = req.user._id;
    const user = await User.findById(id)
    if (!user) {
        return res.json({ error: "User not found!" });
    }
    // let sellerBooks = [];
    let saleSeriesPoints = []
    let earningSeriesPoints = []
    // let sellerOrderProducts = [];
    // let sellerOrders = [];
    if (user.user_type === "seller") {
        // sellerBooks = await Product.find({ user: user._id });
        const orders = await Order.find({
            status: {
                // Remove processing before deploying
                // $in: ["delivered"]
                $in: ["processing", "confirmed", "canceled", "delivered", "returned"]
            }
        })
        if (orders.length) {
            orders.forEach(order => {
                let saleCount = 0;
                for (const product of order.products) {
                    if (product.product.user.toString() === user._id.toString()) {
                        // console.log(product);
                        saleCount += product.order_qty;
                    }
                }
                saleSeriesPoints.push([order.date.toISOString(), saleCount])
            })
        }
    }
    res.json({ saleSeriesPoints, earningSeriesPoints })
}

const setDeliveryOrderStatus = async (req, res) => {
    const { status, id, orderId } = req.body
    const deliveryOrderStatus = ["locked", "delivered", "pickedup"]
    // const userOrderStatus = ["pickedup", "delivered"];
    if (!status && !deliveryOrderStatus.includes(status)) {
        return res.json({ error: "Status should be valid!" })
    }
    try {
        const deliveryOrder = await DeliveryOrder.findById(id)
        if (deliveryOrder.delivery_status === "delivered") {
            return res.json({ error: "The products are already delivered!" })
        }

        if (deliveryOrder.delivery_status === "open") {
            if (status === "locked") {
                deliveryOrder.delivery_user = req.user._id;
                deliveryOrder.delivery_status = status;
                await deliveryOrder.save();
                return res.json({ success: "Status Saved!" })
            }
            else {
                return res.json({ error: "You first need to confirm that you will pickup and deliver by locking the order first!" })
            }
        }
        if (deliveryOrder.delivery_status === "locked") {
            if (status === "pickedup") {
                deliveryOrder.delivery_status = status;
                await deliveryOrder.save();

                const order = await Order.find({ order_id: orderId })
                if (order.status !== "delivered") {
                    await Order.findOneAndUpdate({ order_id: orderId }, { status })
                }

                return res.json({ success: "Status Saved!" })
            }
            else if (status === "locked") {
                return res.json({ error: "Order already locked by you!" })
            }
            else {
                return res.json({ error: "You need to pickup the products first!" })
            }
        }
        if (deliveryOrder.delivery_status === "pickedup") {
            if (status === "delivered") {
                deliveryOrder.delivery_status = status;
                await deliveryOrder.save();

                const order = await Order.find({ order_id: orderId })
                if (order.status !== "delivered") {
                    await Order.findOneAndUpdate({ order_id: orderId }, { status })
                }

                return res.json({ success: "Status Saved!" })
            }
            else if (status === "pickedup") {
                return res.json({ error: "Already Pickedup! You need to deliver the products now!" })
            }
            else {
                return res.json({ error: "You need to pickup the products first!" })
            }
        }
    } catch (error) {
        console.log(error)
        res.json({ error: "Server Error!" })
    }
}

const sendPasswordResetLink = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            // User not found
            req.flash("error", "User Not Found!");
            return res.redirect("/user/forgot_password");
        }

        const resetToken = await bcrypt.hash(user.email + Date.now().toString(), 10);
        const resetExpires = moment().add(1, "hour").toDate();
        user.passwordResetToken = resetToken;
        user.passwordResetExpires = resetExpires;
        // Encoding so it is safely trnaferred through url
        const encodedToken = encodeURIComponent(resetToken)
        await user.save();
        // The req.headers.host property is used to dynamically generate the URL of the 
        // password reset link that is included in the password reset email sent to the user.
        const resetLink = `http://${req.headers.host}/user/reset_password/${encodedToken}`;

        // create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            host: "smtp.hostinger.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: "no-reply@campusbookdrop.store",
                pass: "ThisEmailSendsNoReplyContent69#"
            },
        });
        const emailBody = "<h1>Campus Book Drop</h1>" +
            "<p>We have received a request to reset your password</p>" +
            "<p>Click on the button below within 1 hour to reset your password<p>" +
            "<div style='width=100%; display: flex; justify-content: center;'>" +
            `<a href="${resetLink}" style="text-decoration: none; padding:10px; border-radius: 10px; background-color: red color: white;">Reset Password</a>` +
            "<p>-Team Campus Book Drop</p>";

        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: "Campus Book Drop no-reply@campusbookdrop.store", // sender address
            to: email, // list of receivers
            subject: "Your Password Reset Link",
            html: emailBody, // html body
        });
        req.flash("success", "Password Reset Link Has Been Sent To Your Email!");
        res.redirect("/");
    } catch (error) {
        console.log(error);
        req.flash("error", "Server Error! Unable to send link!");
        res.redirect("/user/forgot_password");
    }
}

const renderResetUserPasswordPage = async (req, res) => {
    const { token } = req.params;
    const title = "Reset Password"
    try {
        const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } })
        // console.log(user);
        if (!user) {
            // Token is invalid or has expired
            req.flash("error", "Password reset token is invalid or has expired.");
            return res.redirect("/");
        }
        // Render the password reset form
        res.render("user/reset_password", { title, page_styles: "password_visibility.css", token });
    } catch (error) {
        req.flash("error", "An error occurred while processing your request.");
        res.redirect("/");
    }
}

const resetUserPassword = async (req, res) => {
    const { token, password, confirmPassword } = req.body;
    // console.log(token, password, confirmPassword);
    if (!validatePassword(password)) {
        req.flash("error", "Invalid Password!");
        return res.redirect("/");
    }
    if (password !== confirmPassword) {
        return res.json({ error: "Passwords do not match!" });
    }
    try {
        const decodedToken = decodeURIComponent(token)
        const user = await User.findOne({ passwordResetToken: decodedToken, passwordResetExpires: { $gt: Date.now() } })
        if (!user) {
            // Token is invalid or has expired
            return res.json({ error: "Password reset token is invalid or has expired." });
        }
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        // Hash the new password
        await user.setPassword(password)
        await user.save();
        res.json({ success: "Password Changed Successfully", redirect: "/user/log_in" });
    } catch (error) {
        console.log(error);
        res.json({ error: "An error occurred while processing your request." });
    }
}

const sendThankYouEmail = async (req, res) => {
    const { email } = req.user;
    try {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.hostinger.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: "founder@campusbookdrop.store",
                pass: "#Check#Length#GTE#0#"
            },
        });
        const emailBody = `<p>Dear ${req.user.firstname + " " + req.user.lastname},</p>` +
            "<p>We wanted to take a moment to thank you for registering with Campus Book Drop! We're thrilled to have you as a part of our growing community of college students who are passionate about finding affordable textbooks and supporting sustainable practices.</p>" +
            "<p>As a registered user, you'll have access to a variety of features and benefits that make it easy to buy and sell used textbooks with ease. Whether you're looking to save money on required course materials or earn some extra cash by selling your old books, we're here to help every step of the way.</p>" +
            "<p>If you ever have any questions or feedback, don't hesitate to reach out to us. We're always eager to hear from our users and improve our services based on their needs.</p>" +
            "<p>Thanks again for joining Campus Book Drop! We look forward to helping you make the most of your college experience.</p>" +
            "<p>Best regards,</p>" +
            "Ankur Pratap Singh<br>" +
            "Founder, Campus Book Drop and the Campus Book Drop team</p>";

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: "Campus Book Drop founder@campusbookdrop.store", // sender address
            to: email, // list of receivers
            subject: "Thank You for Registering with Campus Book Drop!",
            html: emailBody, // html body
        });
        // req.flash("success", "Password Reset Link Has Been Sent To Your Email!");
        // res.redirect("/");
    } catch (error) {
        // req.flash("error", "Server Error! Unable to send link!");
        // res.redirect("/user/forgot_password");
    }
}

module.exports = {
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
    saveThumbnail
    // downloadReceipt
}