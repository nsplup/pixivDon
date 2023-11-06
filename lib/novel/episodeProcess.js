const request = require('superagent')
const path = require('path')
const fs = require('fs')
const { NOVEL_MAIN_API } = require('../api')
const checkError = require('../checkError')
const { proxy, userAgent, __root__ } = require('../config')
const { DOWNLOAD_NAME } = require('../constants')
const { TRIM_START_REG } = require('../regExp')
const mkdirWhenNotExist = require('../mkdirWhenNotExist')

require('superagent-proxy')(request)

function main (id, cookies) {
  return new Promise((done, rej) => {
    console.log(`正在拉取章节详情: ${ id }`)

    const onresponse = (err, res) => {
      if (checkError(err, res)) { return }

      let { title, userId, userName, content, seriesNavData } = res.body.body
      const pathParam = [
        __root__,
        DOWNLOAD_NAME,
        `${ userName } (${ userId })`,
        (seriesNavData ?
          `${ seriesNavData.title } (${ seriesNavData.seriesId })` :
          null),
      ].filter(name => name)
      const fileName = seriesNavData ?
        `${ seriesNavData.order.toString().padStart(5, '0') } ${ trimStart(title) }` :
        title
      const workPath = path.join(...pathParam)
      const completedPath = path.resolve(workPath, fileName + '.txt')
      mkdirWhenNotExist(workPath)

      content = content.split(/[\r\n]/)
        .map(line => line.trim())
        .join('\n')
      
      fs.writeFileSync(completedPath, content, { encoding: 'utf8' })
      console.log(`已完成: ${ fileName } (${ id })`)
      console.log(`　路径: ${ completedPath }`)
      done()
    }

    request
      .get(NOVEL_MAIN_API(id))
      .set('Cookie', cookies)
      .set('User-Agent', userAgent)
      .proxy(proxy)
      .end(onresponse)
  })
}

function trimStart (str) {
  return str.replace(TRIM_START_REG, '')
}

module.exports = main