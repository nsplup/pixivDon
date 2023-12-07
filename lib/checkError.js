function main (err, res) {
  if (err) {
    switch (true) {
      case err.code === 'ETIMEDOUT':
        console.log('错误: 连接超时')
        break
      case err.status === 404:
        console.log('错误: 目标页面不存在')
        console.log('　如果你访问的是 R18 内容，你可能需要登录，具体步骤请参照 README')
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