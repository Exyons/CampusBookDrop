const mongoose = require("mongoose");
require("dotenv").config()
// const dbUrl = process.env.DB_URL
const dbUrl = "mongodb://127.0.0.1:27017/BookSellingApp";
mongoose.connect(dbUrl)
    .then(data => {
        console.log("Connected");
    })
    .catch(err => {
        console.log("NOT CONNECTED!!", err);
    })

const User = require("../db_models/user");
const { Product } = require("../db_models/product");
const Order = require("../db_models/order");
const { Address } = require("../db_models/address");

const programmes = ["BTech", "MTech", "PhD"];
const branchNames = ["Civil", "Mechanical", "CS", "IT", "Biotechnology", "Production", "Electrical", "Electronics and Communication"];
const branchTags = ["CE", "ME", "BT", "CSE", "PE", "CHE", "IT", "EE", "ECE"];
const bookNames = ["Irrigation Engineering", "Bridge Engineering", "Master C++", "Concrete Technology", "Networking", "System Desing",
    "Machine Learning in 100 page", "How To Get Rich", "Reinforcement Learning", "Dawn Of AI", "Where You will be 5 years later?"]

const getRandomElement = (array) => {
    const index = Math.floor(Math.random() * array.length);
    return { element: array[index], index };
}

const save = async () => {
    await Product.deleteMany({});
    // await Order.deleteMany({});
    const userId = "6461c2f00b534e99f1f48705";
    for (let i = 0; i < 40; i++) {
        const { element, index } = getRandomElement(branchNames);
        const product = new Product(
            {
                title: getRandomElement(bookNames).element,
                price: Math.floor(Math.random() * 600 + 400),
                programme: getRandomElement(programmes).element,
                branch: branchTags[index],
                year: Math.floor(Math.random() * 4 + 1),
                semester: Math.floor(Math.random() * 8 + 1),
                description: `Book for ${element} engineering students`,
                qty: Math.ceil(Math.random() * 20 + 1),
                user: userId,
                condition: "Like new",
                damages: "Page torn"
            }
        )
        await product.save();
    }
    // const newAddress = new Address({
    //     name: "Ankur Singh",
    //     mobile: 1234567890,
    //     room: 456,
    //     hostel: "TH"
    // });
    // await newAddress.save();

    // const newOrder_1 = new Order({
    //     order_id: "akjdsb-3sdvsvd-1232",
    //     status: "processing",
    //     date: Date.now(),
    //     address: newAddress
    // })

    // const newOrder_2 = new Order({
    //     order_id: "a234b-33svd-1234",
    //     status: "delivered",
    //     date: Date.now(),
    //     address: newAddress
    // })

    // const aproduct_1 = await Product.findOne({});
    // const aproduct_2 = await Product.findOne({});
    // newOrder_1.products.push({product: aproduct_1, order_qty: 1});
    // newOrder_1.products.push({product: aproduct_2, order_qty: 3});
    // await newOrder_1.save();

    // newOrder_2.products.push({product: aproduct_2, order_qty: 2});
    // newOrder_2.products.push({product: aproduct_1, order_qty: 3});
    // await newOrder_2.save();

    // const user = await User.findById(userId);
    // user.orders.push(newOrder_1);
    // user.orders.push(newOrder_2);
    
    // user.addresses.push(newAddress);
    // await user.save();
}

save()
    .then(data => {
        mongoose.connection.close();
        console.log("Saved Data");
    })
    .catch(err => {
        console.log("ERROR SAVING");
        console.log(err);
        mongoose.connection.close();
    })