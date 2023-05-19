const renderHomePage = (req, res) => {
    res.render('home', { title: "Welcome to CampusBookDrop", page_styles: "home_styles.css" });
}

module.exports = {
    renderHomePage
}