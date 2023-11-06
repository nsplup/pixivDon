function main (err, res) {
  if (err) {
    switch (err.code) {
      case 'ETIMEDOUT':
        console.log('错误: 连接超时')
        break
      default:
        console.error(err)
    }
    return true
  }

  const { error, message } = res.body
  if (error) {
    console.log(`错误: 【${ message }】`)
    return true
  }

  return false
}

module.exports = main