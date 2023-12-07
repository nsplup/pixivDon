const { MANGA_SERIES_REG, ARTWORK_REG } = require('../regExp')
const seriesProcess = require('./seriesProcess')
const episodeProcess = require('./episodeProcess')

function main (url, cookies) {
  return new Promise ((done, rej) => {
    let matched, _ignore, userId, id, processType = -1
    
    matched = Array.from(url.matchAll(MANGA_SERIES_REG))
    if (matched.length > 0) {
      [matched, _ignore, userId, id] = matched[0]
      processType = 0
      console.log(`匹配目标【MANGA_SERIES】: ${ id }`)
    } else {
      matched = Array.from(url.matchAll(ARTWORK_REG))

      if (matched.length > 0) {
        [matched, _ignore, id] = matched[0]
        processType = 1
        console.log(`匹配目标【ARTWORK】: ${ id }`)
      }
    }
  
    switch (processType) {
      case 0:
        seriesProcess(id, cookies).then(done)
        break
      case 1:
        episodeProcess(id, cookies).then(done)
        break
      case -1:
        console.log('错误: 【ID】匹配失败')
    }
  })
}

module.exports = main