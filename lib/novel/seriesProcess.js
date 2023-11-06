const request = require('superagent')
const fs = require('fs')
const path = require('path')
const episodeProcess = require('./episodeProcess')
const checkError = require('../checkError')
const { NOVEL_DETAIL_API, NOVEL_CONTENTS_API } = require('../api')
const { proxy, userAgent, delay, __root__ } = require('../config')
const { LIMIT, CACHE_NAME, FILE_NAME } = require('../constants')
const sleep = require('../sleep')
const mkdirWhenNotExist = require('../mkdirWhenNotExist')

require('superagent-proxy')(request)

let __cookies__ = null

function main (id, cookies) {
  __cookies__ = cookies /** 缓存以便其他请求调用 */

  return new Promise((done, rej) => {
    const onresponse = async (err, res) => {
      if (checkError(err, res)) { return }
      
      const { body: detail } = res.body
      const {
        displaySeriesContentCount: total,
        userId, userName, title, caption, language, tags
      } = detail
      let totalPage = Math.floor(total / LIMIT)
      const contents = await fetchList(id, totalPage)
      const newTask = {
        id, title, caption, userId, userName, language, tags, total, contents,
      }
      const workPath = path.join(
        __root__,
        CACHE_NAME,
        `${ userName } (${ userId })`,
        `${ title } (${ id })`
      )
      await doTask(newTask, workPath)
      done()
    }
  
    request
      .get(NOVEL_DETAIL_API(id))
      .set('Cookie', __cookies__)
      .set('User-Agent', userAgent)
      .proxy(proxy)
      .end(onresponse)
  })
}

function doTask (newTask, workPath) {
  mkdirWhenNotExist(workPath)
  return new Promise((done, rej) => {
    const completedPath = path.join(workPath, FILE_NAME)
    const oldTask = loadTask(completedPath)
    const { contents: oldContents } = oldTask
    const { contents: newContents } = newTask
    let task = Promise.resolve()
    const step = (id, cookies, index) => new Promise((resolve, rej) => {
      episodeProcess(id, cookies)
        .then(() => {
          newTask.contents[index].done = true
          saveTask(newTask, completedPath)
          sleep(delay)
          resolve()
        })
    })
    for (let i = 0, len = newContents.length; i < len; i++) {
      const cOld = oldContents[i]
      const cNew = newContents[i]
      if (cOld === undefined || cNew.reuploadTimestamp > cOld.reuploadTimestamp || !cOld.done) {
        const { id } = cNew
        task = task.then(step.bind(null, id, __cookies__, i))
      } else {
        newTask.contents[i].done = true
      }
    }
    task.finally(done)
  })
}

function loadTask (filePath) {
  let task = { contents: [] }
  try {
    task = JSON.parse(fs.readFileSync(path.resolve(filePath), { encoding: 'utf8' }))
  } catch (e) {
    switch (e.code) {
      case 'ENOENT':
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

function fetchList (id, page) {
  return new Promise((done, rej) => {
    let results = []
    const onfinally = () => {
      results = results.flat()
        .map(item => {
          const { id, series, title, reuploadTimestamp } = item
          return { id, series, title, reuploadTimestamp, done: false }
        })
      console.log(`拉取结束: 总计【${ results.length }】条目`)
      done(results)
    }
    let task = Promise.resolve()
    const onresponse = (err, res, resolve) => {
      if (checkError(err, res)) { return }

      results.push(res.body.body.page.seriesContents)
      sleep(1500)
      resolve()
    }
    const step = index => new Promise((resolve, rej) => {
      request.get(NOVEL_CONTENTS_API(id, index))
        .set('Cookie', __cookies__)
        .set('User-Agent', userAgent)
        .proxy(proxy)
        .end((err, res) => onresponse(err, res, resolve))
    })
    console.log('正在拉取完整章节列表')
    let i = 0
    while (i <= page) {
      task = task.then(step.bind(null, i))
      i++
    }
    task.finally(onfinally)
  })
}

module.exports = main