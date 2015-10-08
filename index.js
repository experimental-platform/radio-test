var express = require('express'),
  app = express(),
  path = require('path'),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  serial = require('./serial.js'),
  storage = require('./storage'),
  crc = require('crc-32'),
  fs = require('fs');


app.use(express.static(path.join(__dirname, './static')));


io.on('connection', function (socket) {
  console.log('User connected. Socket id %s', socket.id);
  socket.on('disconnect', function () {
    console.log('User disconnected. %s. Socket id %s', socket.id);
  });
});


var findLongestSubstring = function (string) {
  var longestRepeated = "";
  // i = current size of substring
  // i loop runs string.length times;
  // looks for large repeated substrings first
  for (i = string.length; i > 0; i--) {
    // j = current beginning index of substring
    // j loop runs (string.length - substring.length + 1) times;
    // checks for repeat of subStr in
    // range (indexOf(subStr), whileCurrentSizeiStillFitsInString]
    for (j = 0; j < string.length - i; j++) {
      var subStr = string.substring(j, j + i);
      // if subStr is matched between indexOf(subStr) + 1 and
      // the end of the string, we're done here
      // (I'm not checking for multiple repeated substrings
      //  of the same length. Get over it.)
      if (string.indexOf(subStr, j + 1) != -1) {
        longestRepeated = subStr;
        break;
      }
    }
    if (longestRepeated.length) break;
  }
  if (longestRepeated.length) {
    return subStr;
  } else {
    return string;
  }
};


var extend = function (data) {
  // TODO: add signal length and make some cool error resistant calculation w/ it.
  data.identity = findLongestSubstring(data.timings.join(','));
  data.received = new Date();
  data.crc = crc.str(data.identity);
  data.name = "Unbekannt: " + data.identity + ", " + data.identity.length + " Bits, CRC " + data.crc.toString();
  return data;
};


data = storage.read("/data/storage.json", function (data) {
  serial.start(function (signal) {
    if (signal) {
      signal = extend(signal);
      // TODO: DUMP ANALYSIS DATA
      var filename = Date.now().toString() + ".json";
      console.log("Filename: ", filename);
      fs.writeFileSync(filename, JSON.stringify(signal));
      if (data[signal.identity]) {
        io.emit('known signal', signal);
      } else {
        io.emit('new signal', signal);
        // TODO: add to db
      }
    }
  });
});

http.listen(process.env.PORT || 5000, function () {
  console.log('listening on: ' + process.env.PORT || 5000);
});

