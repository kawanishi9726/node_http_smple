//server.js
var http = require('http'); //httpモジュールのインポート
var server = http.createServer();　
var settings = require('./settings') //同じディレクトリのsettingsファイルをrequire
var fs = require('fs');
var text = fs.readFileSync('index.html', 'utf-8');

console.log(settings); 
server.on('request', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});　
  res.write(text);//resの中身を出力
  res.end();
})
server.listen(settings.port,settings.host)