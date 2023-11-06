module.exports = {
  ISNOVEL_REG: /^(https?:\/\/)?www\.pixiv\.net\/novel\/.*/,
  NOVEL_SERIES_REG: /(https?:\/\/)?www\.pixiv\.net\/novel\/series\/(\d+).*/g,
  NOVEL_EPISODE_REG: /(https?:\/\/)?www\.pixiv\.net\/novel\/show\.php\?id=(\d+).*/g,

  TRIM_START_REG: /^\d+[\　\ ]*/,
}