const request = require('superagent')
const path = require('path')
const fs = require('fs')
const { ARTWORK_DETAIL_API, ARTWORK_CONTENTS_API } = require('../api')
const checkError = require('../checkError')
const { proxy, userAgent, __root__, delay } = require('../config')
const { DOWNLOAD_NAME } = require('../constants')
const sleep = require('../sleep')
const mkdirWhenNotExist = require('../mkdirWhenNotExist')
const { loadTask, saveTask } = require('../taskUtil')

const IMAGE_QUALITY = 'original'

require('superagent-proxy')(request)

let __index__, __referer__
function main (id, cookies, taskDetail, oldTaskPath, shouldUpdate) {
  __referer__ = `https://www.pixiv.net/artworks/${ id }`
  return new Promise(async (done, rej) => {
    const detail = await fetchDetail(id, cookies)
    const { title, userId, userName, seriesNavData } = detail
    const pageList = await fetchList(id, cookies, title)

    if (taskDetail) {
      let contents = taskDetail.contents

      for (let i = 0, len = contents.length; i < len; i++) {
        const cContent = contents[i]
        if (cContent.id === id) {
          __index__ = i
          taskDetail.contents[i] = Object.assign({}, cContent, { pages: pageList })
          break
        }
      }
    } else {
      __index__ = 0
      taskDetail = {
        contents: [{ id, pages: pageList, done: false }]
      }
    }

    const episodeName = (seriesNavData ?
      seriesNavData.order.toString().padStart(5, '0') + ' ':
      '') + title
    const pathParam = [
      __root__,
      DOWNLOAD_NAME,
      `${ userName } (${ userId })`,
      (seriesNavData ?
        `${ seriesNavData.title } (${ seriesNavData.seriesId })` :
        null),
      episodeName
    ].filter(name => name)
    const workPath = path.join(...pathParam)
    
    taskDetail = await doTask(taskDetail, cookies, workPath, oldTaskPath, shouldUpdate)
    done(taskDetail)
  })
}

function fetchDetail (id, cookies) {
  return new Promise((done, rej) => {
    console.log(`正在拉取章节详情: ${ id }`)

    const onresponse = (err, res) => {
      if (checkError(err, res)) { return }

      const { id, title, userId, userName, seriesNavData } = res.body.body
      done({ id, title, userId, userName, seriesNavData })
    }

    request
      .get(ARTWORK_DETAIL_API(id))
      .set('Cookie', cookies)
      .set('User-Agent', userAgent)
      .proxy(proxy)
      .end(onresponse)
  })
}

function fetchList (id, cookies, title) {
  return new Promise((done, rej) => {
    console.log(`正在拉取当前章节图片列表【${ title }】`)

    const onresponse = (err, res) => {
      if (checkError(err, res)) { return }

      const payload = res.body.body
        .map(({ urls }) => ({ url: urls[IMAGE_QUALITY], done: false }))
      done(payload)
    }

    request
      .get(ARTWORK_CONTENTS_API(id))
      .set('Cookie', cookies)
      .set('User-Agent', userAgent)
      .proxy(proxy)
      .end(onresponse)
  })
}

function doTask (newTask, cookies, workPath, oldTaskPath, shouldUpdate) {
  mkdirWhenNotExist(workPath)
  return new Promise((done, rej) => {
    const oldTask = loadTask(oldTaskPath)
    const oldContent = oldTask.contents[__index__]
    const { pages } = newTask.contents[__index__]
    const len = pages.length
    let task = Promise.resolve()
    const step = (url, order) => new Promise((resolve, rej) => {
      order += 1
      console.log(`　当前任务【${ order.toString().padStart(len.toString().length, '0') } / ${ len }】: ${ url }`)
      const splitedUrl = url.split('.')
      const ext = splitedUrl[splitedUrl.length - 1]
      const fileName = `${ order.toString().padStart(5, '0') }.${ ext }`
      const completedPath = path.join(workPath, fileName)
      fetchImage(url, cookies)
        .then(buffer => {
          newTask.contents[__index__].pages[order - 1].done = true
          oldTaskPath && saveTask(newTask, oldTaskPath)
          fs.writeFileSync(completedPath, buffer)
          console.log(`　　已完成，路径: ${ completedPath }`)
          newTask.contents.length > 1 && sleep(delay)
          resolve()
        })
    })
    for (let i = 0; i < len; i++) {
      const { url } = pages[i]
      if (!oldContent?.pages[i]?.done || shouldUpdate) {
        task = task.then(step.bind(null, url, i))
      } else {
        newTask.contents[__index__].pages[i].done = true
      }
    }
    task.finally(() => done(newTask))
  })
}

function fetchImage (url, cookies) {
  return new Promise((done, rej) => {
    const onresponse = (err, res) => {
      if (err) {
        console.error(err)
        return
      }
      done(res.body)
    }

    request
      .get(url)
      .set('Cookie', cookies)
      .set('User-Agent', userAgent)
      .set('Referer', __referer__)
      .proxy(proxy)
      .end(onresponse)
  })
}

module.exports = main