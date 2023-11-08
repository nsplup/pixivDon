# pixivDon

> **pixivDon** 只支持并将长期只支持【小说下载】。

## 🤔我该怎么做？

```bash
# 1. 下载 NODE 并配置环境变量
# 2. git clone 代码到本地
# 3. cd 至代码文件夹
# 4. npm install 安装依赖
# 5. （可选的）登录 pixiv 并使用任意浏览器扩展导出 cookies.txt 覆盖根目录的同名文件
# 5.1 跳过此步骤将以游客状态发起请求
# 5.2 以 Firefox 为例，可选扩展：https://github.com/hrdl-github/cookies-txt
# 6. （可选的）修改配置文件
```

## 😎我能做什么？

```bash
# [URL]示例:
### 系列作品: https://www.pixiv.net/novel/series/[:id]
### 单篇作品: https://www.pixiv.net/novel/show.php?id=[:id]
# node main.js [URL]

# [plainTextPath]说明:
### 纯文本文件
### 每行一条[URL]
### 空白行会被忽略
### 井号（#）开头的行会被视为注释（被忽略）
# [startIndex]说明:
### 可选的
### 起始索引，意外中断时很方便
# node list.js [plainTextPath] [startIndex]
```

## 🤖配置文件！

```json
/** conf.json */
{
  "proxy": null, /** 代理地址，当 proxy 为 null 时，会使用当前环境下的 http_proxy */
  "userAgent": null, /** 用户代理，当 userAgent 为 null 时，会使用默认用户代理 */
  "delay": 15000 /** 请求间隔，单位毫秒 */
}
```