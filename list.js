const fs = require('fs')
const path = require('path')
const sleep = require('./lib/sleep')
const { delay } = require('./lib/config')
const dispatch = require('./index')

function main (listPath, startIndex) {
  let listContent
  try {
    listContent = fs.readFileSync(path.resolve(listPath), { encoding: 'utf8' })
  } catch (e) {
    switch (e.code) {
      case 'ENOENT':
        console.log('错误: 找不到指定【LIST_FILE】')
        break
      default:
        console.error(e)
    }
    return
  }
  listContent = listContent.split(/[\n\r]+/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
  
  let task = Promise.resolve()
  let len = listContent.length
  const step = (url, index) => new Promise((resolve, rej) => {
    console.log(`当前任务【${ (index + 1).toString().padStart(len.toString().length, '0') } / ${ len }】: ${ url }`)
    dispatch(url).then(() => {
      sleep(delay)
      resolve()
    })
  })
  if (typeof startIndex === 'string') { startIndex = parseInt(startIndex) - 1 }
  if (isNaN(startIndex) || (startIndex === undefined) || (startIndex < 0) || (startIndex >= len)) {
    startIndex = 0
  }
  for (let i = startIndex; i < len; i++) {
    const current = listContent[i]
    task = task.then(step.bind(null, current, i))
  }
}

main(...process.argv.slice(2))