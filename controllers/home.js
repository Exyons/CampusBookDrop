const renderHomePage = (req, res) => {
    res.render('home', { title: "Welcome | Campus Book Drop", page_styles: "home_styles.css" });
}

module.exports = {
    renderHomePage
}