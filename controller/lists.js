var express = require('express');
var Promise = require('bluebird');
var parseList = require('./list-parse');

exports.parse = function(listType, list){
  /*
    SUMMARY: this will return a parsed list as an Array for entering into the database.
      where the properties = the product model properties.
    NOTE: All of the logic for this function is stored in lists-upload.js
  */
  return new Promise(function(resolve, reject){
    resolve(parseList.run(listType, list));
  });
};
