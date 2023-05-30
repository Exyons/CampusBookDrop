const renderHelpPage = (req, res) => {
    res.render("help/index", { title: "Help | CampusBookDrop", page_styles: "" })
}

module.exports = {
    renderHelpPage
}