//this saves the cms mySQL connection object to connection
var connection = require('settings').mySQL.cms;
var Promise = require('bluebird');

exports.getModels = function(manufact){
  /*
    SUMMARY: This function returns an array of models from database.
  */
  return new Promise(function(resolve, reject){


    resolve(parseList.run(listType, list));
  });
};
