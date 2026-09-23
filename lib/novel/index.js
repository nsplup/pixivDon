const { NOVEL_SERIES_REG, NOVEL_EPISODE_REG } = require('../regExp')
const seriesProcess = require('./seriesProcess')
const episodeProcess = require('./episodeProcess')

function main (url, cookies) {
  return new Promise ((done, rej) => {
    let matched, _ignore, id, processType = -1
    
    matched = Array.from(url.matchAll(NOVEL_SERIES_REG))
    if (matched.length > 0) {
      [matched, _ignore, id] = matched[0]
      processType = 0
      console.log(`匹配目标【NOVEL_SERIES】: ${ id }`)
    } else {
      matched = Array.from(url.matchAll(NOVEL_EPISODE_REG))
  
      if (matched.length > 0) {
        [matched, _ignore, id] = matched[0]
        processType = 1
        console.log(`匹配目标【NOVEL_EPISODE】: ${ id }`)
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