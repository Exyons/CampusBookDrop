const mongoose = require("mongoose");
const { Schema } = mongoose;
const addressSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    room: {
        type: Number,
        min: 1,
        max: 750,
        required: true
    },
    hostel: {
        type: String,
        enum: ["TH", "MH", "PH"],
        required: true
    }
});

const Address = mongoose.model("Address", addressSchema);

module.exports = {Address, addressSchema};