var fs = require('fs'),
  jsonfile = require('jsonfile'),
  util = require('util');


exports.read = function (filename, cb) {
  fs.stat(filename, function (err, stats) {
    if (err) {
      console.log("No previous data detected, creating new base object.");
      cb({});
    } else if (stats.isFile()) {
      console.log("Reading previous data...");
      jsonfile.readFile(filename, function (err, data) {
        if (err) {
          console.log('JSON ERROR: ', err)
        } else {
          cb(data);
        }
      });
    } else {
      console.log("Something's wrong, is '" + filename + "' a directory or something?");
    }
  });
};