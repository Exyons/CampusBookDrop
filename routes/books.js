const express = require('express');
const wrapAsync = require("../utils/WrapAsync");
const { deleteImages, constructFilterQuery } = require("../middlewares");
const router = express.Router();
const { renderBooksPage,
    sendBookCardPartial,
    renderBookSearchPage,
    sendSearchedBookCardPartial,
    filterBooks,
    renderDetailsPage } = require("../controllers/books")

router.get("/books", deleteImages, wrapAsync(renderBooksPage))

router.get("/books/loadBooks", wrapAsync(sendBookCardPartial))

router.get("/books/search", wrapAsync(renderBookSearchPage))

router.get("/books/search/loadbooks", wrapAsync(sendSearchedBookCardPartial))

router.post("/books/filter", constructFilterQuery, wrapAsync(filterBooks))

router.get("/books/:id", deleteImages, wrapAsync(renderDetailsPage))

module.exports = router;