const fs = require('fs')
const path = require('path')

function loadTask (filePath) {
  let task = { contents: [] }
  try {
    task = JSON.parse(fs.readFileSync(path.resolve(filePath), { encoding: 'utf8' }))
  } catch (e) {
    switch (e.code) {
      case 'ENOENT':
      case 'ERR_INVALID_ARG_TYPE':
        break
      default:
        console.error(e)
    }
  }
  return task
}

function saveTask (task, filePath) {
  const content = JSON.stringify(task, null, 2)
  fs.writeFileSync(filePath, content, { encoding: 'utf8' })
}

module.exports = { loadTask, saveTask }