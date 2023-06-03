const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');
const { Schema } = mongoose;

const Order = require("../db_models/order");
const DeliveryOrder = require("../db_models/delivery_order");
const { Product } = require("../db_models/product");
const { Address } = require("../db_models/address");

const imageSchema = new Schema({
    url: String,
    filename: String
})

const userSchema = new mongoose.Schema({
    user_icon: imageSchema,
    firstname: {
        type: String,
        trim: true,
        required: true
    },
    lastname: {
        type: String,
        trim: true,
        required: true
    },
    mobile: Number,
    email: {
        type: String,
        unique: true,
        required: true
    },
    user_type: {
        type: String,
        default: "normal",
        enum: ["normal", "seller", "delivery"],
        required: true
    },
    orders: [
        {   // In user model we do not require orders to have "required: true" property set
            // Because user can be new and haven't ordered anything
            type: Schema.Types.ObjectId,
            ref: "Order"
        }
    ],
    addresses: [
        {   // In user model we do not require address to have "required: true" property set
            // Because user can be new and may not add an address
            type: Schema.Types.ObjectId,
            ref: "Address"
        }
    ],
    cart: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product"
            },
            cart_qty: {
                type: Number,
                default: 1,
                min: 1,
                max: 5
            }
        }
    ],
    joining_date: {
        type: Date
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    },
    sellerUpiId: {
        type: String,
        trim: true
    }
})

// Password, Username, will be added by passport-local-mongoose
userSchema.plugin(passportLocalMongoose);

userSchema.post('findOneAndDelete', async function (doc) {
    // When user deletes the account, remove all their data from all databases

    // This is common for all users
    // Delete saved addressess
    for (const address_Id of doc.addresses) {
        await Address.findByIdAndDelete(address_Id);
    }
    // Delete all orders
    for (const order_Id of doc.orders) {
        await Order.findByIdAndDelete(order_Id);
    }

    // When the user is seller
    if (doc.user_type === "seller") {
        // Delete all of their listed products
        const products = await Product.find({});
        for (const product of products) {
            if (product.user.toString() === doc._id.toString()) {
                await Product.findByIdAndDelete(product._id);
            }
        }
    }
});

module.exports = mongoose.model("User", userSchema);