var express = require('express')
var app = express()
var path = require('path')
var sqlQuery = require('./controller/modules/sqlQuery')
var bodyParser = require('body-parser')
var settings = require('./settings')
//Stuff the app uses to run
// app.use(express.static(path.join(__dirname, 'app')));



//Middle-ware for parsing JSON
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
//Middle-ware to print when users hit the site.
app.use(function(req, res, next){
  console.log("A boat named: " + req.hostname + ":" + req.ip + " landed at " + req.path + " from " +req.originalUrl);
  next();
});
//Middle-ware to add all routes for ./api/ the express instance as .router , settings.backend
app.use(require('./controller/routes'));

// If the Node process ends, close the MySQL connection
app.get('/', function(req,res){
  sqlQuery.getModels('Big Joe')
  .then(function(models){
    res.send(models);
  })
  .catch(function(err){
    console.log(err);
  });
  // res.sendFile(path.join(__dirname + '/index.html'));
});
// process.on('SIGINT', function() {
//   // settings.mySQL.cms.end(function () {
//   //   console.log('MySQL disconnected on app termination');
//   //   process.exit(0);
//   // });
// });

app.listen(settings.port, function (){
  console.log('Web server loaded on port ' + settings.port);
});
