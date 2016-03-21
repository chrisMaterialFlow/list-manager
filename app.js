var express = require('express')
var app = express()
var path = require('path')
var multer = require('multer')
var upload = multer({dest: 'uploads/'})
var lists = require('./controller/lists')
var bodyParser = require('body-parser')
//Stuff the app uses to run
// app.use(express.static(path.join(__dirname, 'app')));
app.use(bodyParser.urlencoded({limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
var PORT = 8080;
app.get('/', function(req,res){
  res.sendFile(path.join(__dirname + '/index.html'))
});
app.get('/api/lists/download/:id/:type', function(req, res) {
    var file_type = req.params.type;
    var list_id = req.params.id;
    // Set Valid Download Formats
    var validFormats = ['csv','json'];

    // If Invalid Format
    // Return Error
    if(validFormats.indexOf(file_type) < 0){
      res.json({"error":"Invalid Download Type"});
      res.end();
    }

    // Create Download from ID
    lists.createDownload(list_id,file_type)
    .then(function(file){
        if(file_type ==="json"){
          res.setHeader('Content-disposition', 'attachment; filename='+list_id+'.json');
          res.setHeader('Content-type', 'text/json'); //do 'text/csv' or 'text/json'
          res.charset = 'UTF-8';
          res.json(file);
          res.end();
        }
        if (file_type === "csv"){
          //if the file_type is .csv then downloadList returns a string location of the csv file on the server.
          res.setHeader('Content-disposition', 'attachment; filename='+list_id+'.csv');
          res.setHeader('Content-type', 'text/csv'); //do 'text/csv' or 'text/json'
          res.charset = 'UTF-8';
          res.write(file);
          res.end();
        }
      })
      .catch(function(err){
        console.log("error with file processing:" + err);
      });
});
app.post('/api/lists/upload/:type',upload.single('file'), function(req, res) {
/*
  SUMMARY:
    This route allows a user to upload a file with a table of data to
    to be parsed and uploaded into the database.
    NOTE: Only csv files are currently supported.
  PARAMS:
    type: is the type of list being uploaded as chosen by the user.
      NOTE: type = req.params.type
    file: Is the csv file the user uploaded.
      NOTE: file location on server = req.file.path
*/
  var reqType = req.params.type;

  lists.parse(reqType,req.file.path).then(function(arrayList){
    console.log("Upload turned into this: " + arrayList);
  })
  res.send('the upload went through');
});
app.post('api/lists/compare', function(req, res){
  /*
  SUMMARY:
    User sends a bunch of lists id's in a json file to compare {ids:[list1001,list1002], type:how_to_compare}
  */
});

app.listen(PORT, function (){
  console.log('Web server loaded on port ' + PORT);
});
