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
  var lineBuffer = {timings: [], bits: [], empty: true};
  return function parseLine(line) {
    // TODO: track line numbers
    if (line.toLowerCase().indexOf('start') != -1) {
      return false;
    } else if (line.toLowerCase().indexOf('end') != -1) {
      if (!lineBuffer.empty) {
        cb(lineBuffer);
      }
      lineBuffer = {timings: [], bits: [], empty: true};
    } else {
      var arr = line.split(' ');
      if (arr.length > 2) {
        lineBuffer.bits.push(arr[1].trim());
        lineBuffer.timings.push(arr[2].trim());
        lineBuffer.empty = false;
      }
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

exports.send = function (data) {
  console.log("Sending data ", data);
  var toSend = data.join(",");
  //toSend = toSend + "," + toSend;
  // toSend = toSend + "," + toSend;

  port.write("P" + toSend + ",S");
};

