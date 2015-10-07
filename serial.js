var async = require("async"),
  serialport = require("serialport"),
  SerialPort = serialport.SerialPort,
  os = require('os'),
  device = os.type() === 'Darwin' ? "/dev/tty.usbserial-DA01ID01" : '/dev/ttyUSB0';


var port = new SerialPort(device, {
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
  var lineBuffer = [[], []];
  return function parseLine(line) {
    // TODO: track line numbers
    console.log("LINE RECEIVED: " + line);
    if (line === 'Program started\r') {
      return false;
    } else if (line === 'End of recordedBits\r') {
      cb(lineBuffer);
      lineBuffer = [[], []];
    } else {
      var arr = line.split(' ');
      lineBuffer[0].push(arr[1]);
      lineBuffer[1].push(arr[2]);
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