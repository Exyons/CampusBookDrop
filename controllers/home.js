const renderHomePage = (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.render('home', { title: "Welcome | Campus Book Drop", page_styles: "home_styles.css" });
}

module.exports = {
    renderHomePage
}