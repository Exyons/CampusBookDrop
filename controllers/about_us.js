const renderAboutUsPage = (req, res) => {
    res.render("about_us", { title: "About Us | CampusBookDrop", page_styles: "" });
}

module.exports = {
    renderAboutUsPage
}