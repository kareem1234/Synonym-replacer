var express = require('express');
var app = express();
var SynReplacer = require('./synreplacer');

;

app.get('/js', function(req, res){
  res.sendFile(__dirname + '/index.js');
});

app.get('', function(req, res){
  res.sendFile(__dirname + '/index.html');
});;

app.get('/replace', function (req, res) {
  var replacer = new SynReplacer(req.query.text);
  console.dir(replacer);
  replacer.replace((text)=>{
  	  console.dir(replacer);
  	  res.send(replacer);
  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});