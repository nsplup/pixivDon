const fs = require('fs')

function mkdirWhenNotExist(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

module.exports = mkdirWhenNotExist
