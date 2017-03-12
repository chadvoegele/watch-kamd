var fs = require('fs')
var express = require('express')
var http = require('http')
var path = require('path')
var reload = require('reload')
var bodyParser = require('body-parser')
var logger = require('morgan')
var markdown = require('markdown-it')({ breaks: true })
var markdown_katex = require('markdown-it-katex')
var markdown_anchor = require("markdown-it-anchor")
var markdown_toc = require("markdown-it-table-of-contents")

markdown.use(markdown_katex, { "throwOnError" : false, "errorColor" : " #cc0000" })
markdown.use(markdown_anchor)
markdown.use(markdown_toc)

var mdfilename = process.argv[2]
if (!mdfilename) {
  console.log('Usage: node server.js [file.md]')
  process.exit(1)
}
console.log('Serving file: ' + mdfilename)

var app = express()
app.set('port', process.env.PORT || 3000)
app.use(logger('dev'))
app.use(bodyParser.json())

app.get('/', function (req, res) {
  var mdfile = fs.readFileSync(mdfilename).toString()
  var result = markdown.render(mdfile);
  var katexcss = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.7.1/katex.min.css">'
  var githubcss = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/github-markdown-css/2.4.1/github-markdown.css"/>'
  var reloadjs = '<script src="/reload/reload.js"></script>'
  var page = [ '<!DOCTYPE html><html><head>', katexcss, githubcss, '</head><body>', result, reloadjs, '</body></html>' ]
  res.send(page.join(''))
})

var server = http.createServer(app)

reloadServer = reload(server, app)
fs.watchFile(mdfilename, (curr, prev) => {
  reloadServer.reload()
})

server.listen(app.get('port'), function () {
  console.log('Web server listening on port ' + app.get('port'))
})
