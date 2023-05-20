const mongoose = require("mongoose");
const { productSchema } = require("./product");
const { addressSchema } = require("./address");
const { Schema } = mongoose;

const receiptImageSchema = new Schema({
    url: String,
    filename: String
})

const orderSchema = new Schema({
    receiptImage: receiptImageSchema,
    order_id: {
        type: String,
        required: true
    },
    products: [
        {
            product: productSchema,
            order_qty: {
                type: Number,
                min: 1,
                required: true
            }
        }
    ],
    status: {
        type: String,
        lowercase: true,
        enum: ["processing", "confirmed", "canceled", "pickedup", "delivered", "returned"],
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    deliveryCharge: Number,
    totalAmount: Number,
    address: addressSchema,
    statusComment: String
});

module.exports = mongoose.model("Order", orderSchema);