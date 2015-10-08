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

var writeFile = function (filename, data, cb) {
  // var filename = Date.now().toString() + ".json";
  // console.log("Filename: ", filename);

};


exports.write = function (data, cb) {
  // TODO: change directory!
  var filename = '/tmp/radio.json';
  fs.stat(filename, function (err, stats) {
    if (err) {
      console.log("No previous data detected, creating new file.");
      fs.writeFile(filename, JSON.stringify(data), {}, cb);
    } else if (stats.isFile()) {
      console.log("Previous file detected, atomically writing new data.");
      var temp_filename = '/tmp/radio-tmp.json';
      fs.writeFile(temp_filename, JSON.stringify(data), {}, function (err) {
        if (!err) {
          fs.rename(temp_filename, filename, cb);
        } else {
          console.log('File write error!');
        }
      });
    } else {
      console.log("Something's wrong, is '" + filename + "' a directory or something?");
    }
  });
};