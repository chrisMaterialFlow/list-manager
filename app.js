var express = require('express')
var app = express()
var path = require('path')
var multer = require('multer')
var upload = multer({dest: 'uploads/'})
var lists = require('./controller/lists')
var bodyParser = require('body-parser')
var mysql = require('mysql')
//Stuff the app uses to run
// app.use(express.static(path.join(__dirname, 'app')));



//Middle-ware for parsing JSON
app.use(bodyParser.urlencoded({limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
//Middle-ware to print when users hit the site.
app.use(function(req, res, next){
  console.log("A boat named: " + req.hostname + ":" + req.ip + " landed at " + req.path + " from " +req.originalUrl);
  next();
});
//Middle-ware to add all routes for ./api/ the express instance as .router
app.use(require('settings'));
app.use(settings.backend ,require('./controller/routes'));
// settings.mySQL.cmsConnection.connect(function(err) {
//   if (err) {
//     console.error('error connecting: ' + err.stack);
//     return;
//   }
//   console.log('Connected to mysql database : ' + cmsDB.database + " as user: " + cmsDB.user);
// });

// If the Node process ends, close the MySQL connection
process.on('SIGINT', function() {
  settings.mySQL.cms.end(function () {
    console.log('MySQL disconnected on app termination');
    process.exit(0);
  });
});

app.listen(settings.port, function (){
  console.log('Web server loaded on port ' + settings.port);
});

app.get('/', function(req,res){
  res.sendFile(path.join(__dirname + '/index.html'))
});
