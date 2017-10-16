const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const sever = http.createServer();
const data = require('./lib/propoints.js');
console.log(data);
 
sever.on('request',function(req,res){
   
  requrl = url.parse(req.url,true);
  var pathname = requrl.pathname;
  console.log(requrl);
  staticPublic(req,res,pathname);
  sendpoint(req,res,pathname);
});
sever.listen(8000,function(){
  console.log('sever listen 8000');
});
 
console.log(process.cwd());
 
function staticPublic(req,res,pathname){
  fs.readFile('.'+pathname,function(err,data){
    if(err){
      res.writeHead(404,{'Content-type':'text/plain;charset=utf-8'});
      res.end('找不到文件');
      return;
    }
    if(path.extname(pathname)=='.html'){
      res.setHeader('Content-Type','text/html');
    };
    res.writeHead(200);
    res.end(data);
  });
};
 
 
function sendpoint(req,res,pathname){
  if(pathname=="/getpoint"){
    // var json1 = require('./public/js/point.json');
    // var json2 = JSON.stringify(json1); 
    var json2 = JSON.stringify(data); 
    res.writeHead(200);
    res.end(json2);
  }
}