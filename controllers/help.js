const renderHelpPage = (req, res) => {
    // res.setHeader('Cache-Control', 'public, max-age=3600');
    res.render("help/index", { title: "Help | CampusBookDrop", page_styles: "" })
}

module.exports = {
    renderHelpPage
}