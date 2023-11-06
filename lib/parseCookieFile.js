const fs = require('fs')
const path = require('path')

function main (filePath, config) {
  const { domainFilter, httpOnly } = Object.assign({
    domainFilter: null,
    httpOnly: false
  }, config)
  const data = fs.readFileSync(path.resolve(filePath), { encoding: 'utf8' })
  const cookies = data.split('\n')
    .reduce((prev, line) => {
      let hold = false, parts = null, domain = null
      line = line.trim()
      switch (true) {
        case httpOnly && line.startsWith('#HttpOnly_'):
          line = line.slice(10)
          hold = true
        case hold || (line && !line.startsWith('#')):
          parts = line.split('\t')
          domain = parts[0]
          if (!domainFilter || domain.includes(domainFilter)) {
            prev.push(`${ parts[5] }=${ parts[6] }`)
          }
      }
      return prev
    }, [])
  return cookies.join('; ')
}

module.exports = main