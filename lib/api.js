const { LIMIT } = require('./constants')

module.exports = {
  NOVEL_DETAIL_API: id => `https://www.pixiv.net/ajax/novel/series/${ id }`,
  NOVEL_CONTENTS_API: (id, page = 0) =>
    `https://www.pixiv.net/ajax/novel/series_content/${ id }?limit=${ LIMIT }&last_order=${ LIMIT * page }&order_by=asc`,
  NOVEL_MAIN_API: id => `https://www.pixiv.net/ajax/novel/${ id }`
}