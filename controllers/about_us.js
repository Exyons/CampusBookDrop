const renderAboutUsPage = (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.render("about_us", { title: "About Us | CampusBookDrop", page_styles: "" });
}

module.exports = {
    renderAboutUsPage
}