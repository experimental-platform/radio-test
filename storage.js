var fs = require('fs'),
    jsonfile = require('jsonfile');

var getFilename = function() {
  try {
    fs.accessSync('/data/');
    return '/data/radio.json';
  } catch (err) {
    console.log('STORAGE: "/data/" is unavailable:', err);
    return '/tmp/radio.json';
  }
};


exports.read = function(cb) {
  var filename = getFilename();
  fs.stat(filename, function(err, stats) {
    if (err) {
      console.log('STORAGE: No previous data detected, creating new base object "' + filename + '".');
      cb({});
    } else if (stats.isFile()) {
      console.log('Reading previous data "' + filename + '"...');
      jsonfile.readFile(filename, function(err, data) {
        if (err) {
          console.log('STORAGE: JSON ERROR ', err)
        } else {
          cb(data);
        }
      });
    } else {
      console.log("STORAGE: Something's wrong, is '" + filename + "' a directory or something?");
    }
  });
};


exports.write = function(data) {
  var filename = getFilename();
  fs.stat(filename, function(err, stats) {
    if (err) {
      console.log('STORAGE: No previous data detected, creating new file"' + filename + '".');
      fs.writeFile(filename, JSON.stringify(data), {}, function(err) {
        if (err) {
          console.log("Error writing file '" + filename + "':", err);
        }
      });
    } else if (stats.isFile()) {
      console.log('Previous file detected, atomically writing new data "' + filename + '".');
      var tempFilename = filename + ".tmp";
      fs.writeFile(tempFilename, JSON.stringify(data), {}, function(err) {
        if (!err) {
          fs.rename(tempFilename, filename, function(err) {
            if (err) {
              console.log("Error writing file '" + filename + "':", err);
            }
          });
        } else {
          console.log('File "' + filename + '"write error!');
        }
      });
    } else {
      console.log("Something's wrong, is '" + filename + "' a directory or something?");
    }
  });
};