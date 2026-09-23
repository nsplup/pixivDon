const request = require('superagent')
const path = require('path')
const episodeProcess = require('./episodeProcess')
const checkError = require('../checkError')
const { MANGA_DETAIL_API } = require('../api')
const { proxy, userAgent, delay, __root__ } = require('../config')
const { CACHE_NAME, FILE_NAME } = require('../constants')
const sleep = require('../sleep')
const mkdirWhenNotExist = require('../mkdirWhenNotExist')
const { loadTask } = require('../taskUtil')

require('superagent-proxy')(request)

let __cookies__ = null

function main (id, cookies) {
  __cookies__ = cookies /** 缓存以便其他请求调用 */

  return new Promise((done, rej) => {
    const onresponse = async (err, res) => {
      if (checkError(err, res)) { return }
      
      const { body: detail } = res.body
      const { users, page, illustSeries, tagTranslation } = detail
      const { userId, name: userName } = users[0]
      const { series, total } = page
      const { title, caption, updateDate } = illustSeries[0]
      const len = series.length
      let totalPage = Math.ceil(total / len)
      const contents = await fetchList(id, totalPage, series)
      const newTask = {
        id, title, caption, userId, userName, tagTranslation,
        updateDate, total, contents,
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
      .get(MANGA_DETAIL_API(id))
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
    let task = Promise.resolve()
    const step = (id, cookies, index) => new Promise((resolve, rej) => {
      episodeProcess(id, cookies, newTask, completedPath, index)
        .then(taskDetail => {
          newTask = taskDetail
          sleep(delay)
          resolve()
        })
    })
    for (let i = 0, len = newTask.contents.length; i < len; i++) {
      newTask.contents[i].uploadDate = oldTask.contents[i]?.uploadDate || 0
      newTask.contents[i].done = oldTask.contents[i]?.done || false
      task = task.then(step.bind(null, newTask.contents[i].id, __cookies__, i))
    }
    task.finally(done)
  })
}

function fetchList (id, page, part) {
  return new Promise((done, rej) => {
    let results = [].concat(part)
    const onfinally = () => {
      results = results.flat()
      const len = results.length
      const payload = new Array({ length: len })

      results.forEach(({ workId, order }) => {
        payload[order - 1] = { id: parseInt(workId), pages: [], done: false }
      })

      console.log(`拉取结束: 总计【${ len }】条目`)
      done(payload)
    }
    let task = Promise.resolve()
    const onresponse = (err, res, resolve) => {
      if (checkError(err, res)) { return }

      results.push(res.body.body.page.series)
      sleep(1500)
      resolve()
    }
    const step = index => new Promise((resolve, rej) => {
      request.get(MANGA_DETAIL_API(id, index))
        .set('Cookie', __cookies__)
        .set('User-Agent', userAgent)
        .proxy(proxy)
        .end((err, res) => onresponse(err, res, resolve))
    })
    console.log('正在拉取完整章节列表')
    let i = 2
    while (i <= page) {
      task = task.then(step.bind(null, i))
      i++
    }
    task.finally(onfinally)
  })
}

module.exports = main