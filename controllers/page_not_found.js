const renderPageNotFound = async (req, res, next) => {
    res.status(404).render("page_not_found", { title: "Page Not Found | Campus Book Drop", page_styles: ""});
}

module.exports = {
    renderPageNotFound
}