var Promise = require('bluebird');
var settings = require('../../settings');
var mysql = require('mysql');
//private function for connecting to sql database
exports.createSQLConnection = function(dbName){
  var dbSettings = settings.mySQL.settings;
  //create a connection object
  var connection = mysql.createConnection({
    host : dbSettings.host,
    user : dbSettings.user,
    password : dbSettings.password,
    database : dbName
  });

  connection.connect(function(err){
    if(!err){
      return connection;
    } else {
      console.log(err);
    }
  });
  return connection;
}

exports.getModels = function(manufact){
  /*
    SUMMARY: This function returns an array of models from database.
  */
  var sql = "SELECT p.partID, p.name, pa.attriValue " +
    "FROM part p LEFT JOIN part_attribute pa " +
    "ON p.partID = pa.partID " +
    "WHERE (pa.attriValue LIKE '$%' OR pa.attriValue LIKE 'call') " +
    "AND p.classID IN (SELECT classID FROM part_class WHERE manufactID=(SELECT manufactID FROM manufacturer WHERE manufactName = ?));"
  var inserts = [manufact];
  sql = mysql.format(sql, inserts);
  var connection = exports.createSQLConnection('cms');

  function formatResults(results){

    results.forEach(function(element, index, array){
      //clean up the price string
      if(element.attriValue[0] === '$'){
        element.attriValue = element.attriValue.slice(1);
      }
      if(element.attriValue.includes('&comma;')){
        element.attriValue = element.attriValue.split('&comma;').join('');
      }
      element["model"] = element.name;
      element["price"] = element.attriValue;
      delete element.partID;
      delete element.name;
      delete element.attriValue;
    });

    return results;
  }

  return new Promise(function(resolve, reject){
    if (typeof connection !== 'undefined' ){
      connection.query(sql, function(err, results){
        if(!err){
          connection.end();
          var newResults = formatResults(results);
          console.log(newResults);
          resolve(newResults);
        } else {
          connection.end();
          reject("SQL query to CMS Database to retrieve models failed: " + err);
        }
      });
    } else {
      reject("Database Error: Error opening connection the the mySQL database.");
    }
  });
};
module.exports = exports;
