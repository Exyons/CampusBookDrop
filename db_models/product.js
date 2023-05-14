const mongoose = require("mongoose");
const { Schema } = mongoose;

const imageSchema = new Schema({
    url: String,
    filename: String
})

const productSchema = new mongoose.Schema({
    image: imageSchema,
    title: {
        type: String,
        required: true
    },
    programme: {
        type: String,
        enum: ["BTech", "MTech", "PhD"],
        required: true
    },
    price: {
        type: Number,
        min: 0,
        required: true
    },
    year: {
        type: Number,
        min: 1,
        max: 4,
        required: true
    },
    semester: {
        type: Number,
        min: 1,
        max: 8,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    condition: {
        type: String,
        required: true
    },
    damages: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        enum: ["CE", "ME", "BT", "CSE", "PE", "CHE", "IT", "EE", "ECE"],
        required: true
    },
    qty: {
        type: Number,
        min: 0,
        required: true
    },
    user: {
        // Every Product must have a user who added it
        // that's why it has "required: true"
        // There can be many sellers for a book
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
})

const Product = mongoose.model("Product", productSchema);

module.exports = { Product, productSchema }