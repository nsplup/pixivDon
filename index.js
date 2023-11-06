const parseCookieFile = require('./lib/parseCookieFile')
const { ISNOVEL_REG } = require('./lib/regExp')
const novelProcess = require('./lib/novel')
const { DOMAIN } = require('./lib/constants')

const COOKIE_FILE = './cookies.txt'

function main (url) {
  return new Promise((done, rej) => {
    let cookies = null
    try {
      cookies = parseCookieFile(COOKIE_FILE, { httpOnly: true, domainFilter: DOMAIN })
      console.log('【COOKIE_FILE】载入成功')
    } catch (e) {
      switch (e.code) {
        case 'ENOENT':
          console.log('错误: 找不到指定【COOKIE_FILE】')
          break
        default:
          console.error(e)
      }
      return
    }
    switch (true) {
      case ISNOVEL_REG.test(url):
        novelProcess(url, cookies).then(done)
        break
      default:
        console.log('错误: 不受支持的【URL】地址')
    }
  })
}

module.exports = main