function main (delay) {
  const start = Date.now()
  while (Date.now() - start < delay) { /** 什么也不做 */ }
}

module.exports = main