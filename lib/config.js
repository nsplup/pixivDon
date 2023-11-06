const fs = require('fs')
const path = require('path')
const { USER_AGENT } = require('./constants')

const __root__ = process.cwd()
let config = {}

try {
  config = fs.readFileSync(path.resolve(__root__, './conf.json'))
  config = JSON.parse(config)
} catch (e) {
  switch (e.code) {
    case 'ENOENT':
      console.log('错误: 找不到指定【CONF_JSON】')
      break
    default:
      console.error(e)
  }
}

let { proxy, userAgent, delay } = config

if (!(typeof proxy === 'string' && proxy.startsWith('http://'))) {
  proxy = process.env.http_proxy
}
if (!(typeof userAgent === 'string' && userAgent.length > 0)) {
  userAgent = USER_AGENT
}
if (typeof delay !== 'number') {
  delay = 15 * 1000
}

module.exports = Object.assign({}, config, {
  __root__,
  proxy,
  userAgent,
  delay,
})