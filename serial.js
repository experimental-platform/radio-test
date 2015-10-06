var async = require("async");
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;

var port = new SerialPort("/dev/tty.usbserial-DA01ID01", {
  baudrate: 115200,
  databits: 8,
  stopbits: 1,
  parity: 'none',
  parser: serialport.parsers.readline('\n'),
  //parser: serialport.parsers.raw,
  platformOptions: {
    vmin: 0
  }
});

function parsePacket(packet) {
  console.log(packet.length + ' pieces of data in the package')
}

function makeParser(cb) {
  var lineBuffer = [];
  return function parseLine(line) {
    // TODO: track line numbers
    if (line === 'Program started\r') {
      console.log("Program started");
      return false;
    } else if (line === 'End of recordedBits\r') {
      cb(lineBuffer);
      // console.log("Bits logged");
      lineBuffer = [];
    } else {
      var arr = line.split(' ');
      var datum = {state: arr[1], time: arr[2]};
      lineBuffer.push(datum);
      // console.log("Bit received");
    }
  }
}


exports.start = function (onChange) {
  port.on("open", function (error) {
    if (error) {
      console.log('failed to open: ' + error);
    } else {
      console.log('Port opened');

      //port.on('data', function(line) { console.log(line); });
      port.on('data', makeParser(onChange));
    }
  });

  port.on('error', function (error) {
    console.log('error: ' + error);
  });
};