const request = require('superagent')
const fs = require('fs')
const path = require('path')
const episodeProcess = require('./episodeProcess')
const checkError = require('../checkError')
const { MANGA_DETAIL_API, ARTWORK_DETAIL_API } = require('../api')
const { proxy, userAgent, delay, __root__ } = require('../config')
const { LIMIT, CACHE_NAME, FILE_NAME } = require('../constants')
const sleep = require('../sleep')
const mkdirWhenNotExist = require('../mkdirWhenNotExist')
const { loadTask, saveTask } = require('../taskUtil')

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
      const { series, total, recentUpdatedWorkIds } = page
      const { title, caption } = illustSeries[0]
      const len = series.length
      let totalPage = Math.ceil(total / len)
      const contents = await fetchList(id, totalPage, series)
      const newTask = {
        id, title, caption, userId, userName, tagTranslation,
        recentUpdatedWorkIds, total, contents,
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
    const { contents: oldContents } = oldTask
    const { contents: newContents } = newTask
    let task = Promise.resolve()
    const step = (id, cookies, index, shouldUpdate) => new Promise((resolve, rej) => {
      episodeProcess(id, cookies, newTask, completedPath, shouldUpdate)
        .then(taskDetail => {
          taskDetail.contents[index].done = true
          saveTask(taskDetail, completedPath)
          newTask = taskDetail
          sleep(delay)
          resolve()
        })
    })
    for (let i = 0, len = newContents.length; i < len; i++) {
      const cOld = oldContents[i]
      const cNew = newContents[i]
      const { id } = cNew
      const shouldUpdate = newTask.recentUpdatedWorkIds.includes(id)
      if (cOld === undefined || shouldUpdate || !cOld.done) {
        task = task.then(step.bind(null, id, __cookies__, i, shouldUpdate))
      } else {
        newTask.contents[i].done = true
      }
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