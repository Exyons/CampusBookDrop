const mongoose = require("mongoose");
const { productSchema } = require("./product");
const { addressSchema } = require("./address");
const { Schema } = mongoose;

const deliveryOrderSchema = new Schema({
    order_id: {
        type: String,
        required: true
    },
    products: [
        {
            product: productSchema,
            pickup_qty: {
                type: Number,
                min: 1,
                required: true
            }
        }
    ],
    payment_status: {
        type: String,
        lowercase: true,
        enum: ["processing", "confirmed", "failed"],
        required: true
    },
    delivery_status: {
        type: String,
        lowercase: true,
        enum: ["open", "locked", "pickedup", "delivered"],
        required: true
    },
    pickup_addresses: [
        addressSchema
    ],
    shipping_address: addressSchema,
    delivery_user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

module.exports = mongoose.model("Deliveryorder", deliveryOrderSchema);