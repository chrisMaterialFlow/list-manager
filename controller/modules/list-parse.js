// var express = require('express');
// var mongoose = require('mongoose');
var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');

function openListFile(file){
  /*
    SUMMARY:
      Opens a file and loads it's contents into an array.
      returns: {colNames: [], items, []} -NOTE- colNames : are taken from the 1st row of csv, items: property names = colNames, values= the  row contents.
    HOW IT DOES IT:
      Scrapes off the first csv line which contains the properties to be uploaded
      Creates new row objects with each property (column name) scraped and the line's value for that column.
      Then returns the newly created array to be parsed further.
    PARAMS:
      file = "c:\filelocation\file"
      NOTE: file is a string of the files location on the server.
  */


  return new Promise(function(resolve, reject){

    var parsedFile = {
      colNames: [], //this is where the column names are stored
      items: [] //this is where the rows are stored
    };
    fs.readFile(file,'utf8',function(err,data){
      if(!err){
        //split csv file by line, data.split returns an array with each line
        var allRows = data.split('\r\n');
        //loop through each line which corresponds to a product, so eachProduct is looped through.
        for (var i = 0; i < allRows.length; i++){
          //get every column aka category of data by splitting the csv by ',' put this into an array.
          eachCell = allRows[i].split(',');
          if(i === 0){
            //save to parsedFile.colNames which is outside of the loop.
            parsedFile.colNames = eachCell;
          }
          else {
            //We just got the column names now we loop through each line and create an obj with properties = column names and add the value in order.
            var row = {};
            for (var ii = 0; ii < parsedFile.colNames.length; ii++){
              //add a new property to the row = the column name , the value is = the cell.
              row[parsedFile.colNames[ii]] = eachCell[ii];
            }
            //add the new row object ,properties and all, into the "parsedFile" array
            parsedFile.items.push(row);
          }
        }
        //delete the file.
        fs.unlinkSync(file);
        //return the parsedFile which contains all of the rows with column names as properties
        resolve(parsedFile);
      } else {

        //delete the file.
        fs.unlinkSync(file);
        //There was an error opening the file.
        reject("Error(File Reading): Can't create Array");
      }
    });
  });
}

function checkForValidCols(validCols, upload){
  /*
    SUMMARY:
      This function is meant to be chained with openListFile
      It checks the upload for required columns and resolve it if they are found
    PARAMS:
      upload = obj{colNames: [], items: []} -NOTE- colNames: fields, items: data
      validCols = obj{req:[], opt: []} -NOTE- req: required fields, opt: optional fields
  */
  //TODO : Need to take out "break"s from the forEach loops and check for duplicate column fields instead.

  return new Promise(function(resolve, reject){

    var reqMatch = false;
    //var optMatch = false;
    var reqMatchCount = 0;
    var optMatchCount = 0;
    var that = this;

    validCols.req.forEach(function(element, index, array){
        //loop through the list and check to see if any cols match this required col.
        for(var i = 0; i < upload.colNames.length; i++){
          //if there is a match increment matchCount by 1 and stop searching.
          if (upload.colNames[i] === element){
            reqMatchCount++;
            break;
          }
        }
    });
    //if we found all of the required fields and there are no more fields left in list.colNames
    if (reqMatchCount === validCols.req.length && upload.colNames.length === validCols.req.length) {
      //send the array of rows forward they have been checked and passed all tests.
      resolve(upload.items);
    }
    //if we found all of the required fields and there are more fields left in list.colNames
    else if (reqMatchCount === validCols.req.length && upload.colNames.length > validCols.req.length){
      //search for each optional field in list.colNames
      validCols.opt.forEach(function(element, index, array){
        //loop through the list.colNames and check to see if any cols match this optional col.
        for(var i; i < upload.colNames.length; i++){
          //if there is a match increment matchCount by 1 and stop searching.
          if (upload.colNames[i] === element){
            optMatchCount++;
            break;
          }
        }
      });
      //if there are columns remaining in our list that don't match we reject with an error
      if(upload.colNames.length > reqMatchCount + optMatchCount){
        reject("Error (parsing list): Some optional fields don't match valid inputs.");
      } else {
        //send the array of rows forward they have been checked and passed all tests.
        resolve(upload.items);
      }
    }
    //if neither is true then we have a problem. Error: All required fields not matched
    else{
      reject("Error (parsing list): There are missing required fields.");
    }
  });
}

function parseDimensions(fileArray){
  /*
    This function is only used to parse a string that contains box dimensions.
    Only used when a user uploads a shipping list
  */

  return new Promise(function(resolve, reject){
    function parseDimensionString(dimString){
      //This function does the actual parsing
      var dimObject = {
        length: 0,
        width: 0,
        height: 0
      }
      try {
       var dimensionArray = dimString.split('x');
       dimObject.length = dimensionArray[0];
       dimObject.length = dimensionArray[1];
       dimObject.length = dimensionArray[2];
       return dimensionArray;
      }
      catch(e){
        reject("Error (dimension parsing): Dimensions are not formatted correctly. Missing \"x\" between them.");
      }
    }
    resolve(fileArray.map(function(element, index, array){element.dimensions = parseDimensionString(element.dimensions);}));
  });

}
function getValidCols(listType){
  return new Promise(function(resolve, reject){
    //Add new list types with required (req) and optional (opt) fields here.
    var validColumns = {
      "price" : {
        req: ["model","price"],
        opt: ["list", "cost","competitor price","competitor name"]
      },
      "shipping" : {
        req: ["model","dimensions"],
        opt: []
      },
      "attributes" : {
        req: ["model"],
        opt: []
      }
    }
    //TODO: Add optional cols to attributes and shipping

      if(typeof validColumns[listType] === undefined){
        reject("Error: The listType is not valid.");
      } else {
        resolve(validColumns[listType]);
      }


  });
}

function main(listType, upload){
  //this is the only publicly available function. All other functions are private.
  return new Promise(function(resolve, reject){
    var validCols = getValidCols(listType);
    var fileArray = openListFile(upload);

    Promise.all([validCols,fileArray])
    .then(function(args){
      var validCols = args[0];
      var fileArray = args[1];
      //checkForValidCols returns an array of the rows from the uploaded list
      resolve(checkForValidCols(validCols, fileArray));
    })
    .catch(function(e){
      console.log("Error: uploading file..." + e);
    });
  });
}

module.exports.run = main;
