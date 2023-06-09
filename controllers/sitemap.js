const path = require("path")
const root = __dirname
const sendSitemap = (req, res) => {
    res.sendFile(path.join(root, "../sitemap/sitemap.xml"))
}

module.exports = sendSitemap