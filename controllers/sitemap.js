const sendSitemap = (req, res) => {
    res.sendFile("../sitemap/sitemap.xml")
}

module.exports = sendSitemap