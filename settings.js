//Creates MySQL connection objects, a factory if you will
function createSQLConnection(database){
  //db settings
  var dbSettings = {
    host : 'localhost',
    user : 'tester',
    password : 'password',
  }
  //create a connection object
  var connection = require('mysql').createConnection({
    host : dbSettings.host,
    user : dbSettings.user,
    password : dbSettings.password,
    database : database
  });
  return connection;
}
//settings for the whole project
var settings = {
  backend : '/api',
  port : 8080,
  mySQL : {
    cms : createSQLConnection('cms')
  }
}

module.exports = settings;
