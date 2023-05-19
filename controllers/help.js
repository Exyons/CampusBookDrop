const renderHelpPage = (req, res) => {
    res.render("help/index", { title: "Help | CampusBookDrop", page_styles: "help_styles.css" })
}

module.exports = {
    renderHelpPage
}