const express = require('express');
// const User = require("../db_models/user");
const { deleteImages } = require("../middlewares");
const router = express.Router();

// async..await is not allowed in global scope, must use a wrapper


// Define route handlers for the /home route
router.get('/', deleteImages, (req, res) => {
  const title = "Welcome to CampusBookDrop";
  const page_styles = "";
  res.render('home', { title, page_styles });
});

module.exports = router;

// app.get("/", (req, res) => {
//     title = "Welcome to BookMarked";
//     // TODO
//     // Make it look more goood
//     // After you have completed all the things required
//     // to make this project a production web app
//     res.render("home", { title });
// })



