module.exports = {
  ISNOVEL_REG: /^(https?:\/\/)?www\.pixiv\.net\/novel\/.*/,
  NOVEL_SERIES_REG: /(https?:\/\/)?www\.pixiv\.net\/novel\/series\/(\d+).*/g,
  NOVEL_EPISODE_REG: /(https?:\/\/)?www\.pixiv\.net\/novel\/show\.php\?id=(\d+).*/g,

  ISMANGA_REG: /^(https?:\/\/)?www\.pixiv\.net\/user\/\d+\/series\/.*/,
  MANGA_SERIES_REG: /(https?:\/\/)?www\.pixiv\.net\/user\/(\d+)\/series\/(\d+).*/g,

  ARTWORK_REG: /(https?:\/\/)?www\.pixiv\.net\/artworks\/(\d+).*/g,
  TRIM_START_REG: /^\d+[\　\ ]*/,
}