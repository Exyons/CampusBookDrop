const path = require("path")

const sendManifest = (req, res) => {
    res.sendFile(path.join(__dirname, "../manifest/manifest.json"))
}


module.exports = sendManifest