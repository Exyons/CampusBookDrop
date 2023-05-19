const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');
const { Schema } = mongoose;

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
    mobile: {
        type: Number,
        required: true
    },
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

module.exports = mongoose.model("User", userSchema);