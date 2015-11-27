var serialport = require("serialport"),
    SerialPort = serialport.SerialPort,
    fs = require('fs'),
    port = null;


var search_for_interface = function () {
  var possible_names = [
    '/dev/tty.usbserial-DA01ID01',
    '/dev/tty.usbserial-DA01ID0U',
    '/dev/ttyUSB0',
    '/dev/ttyUSB1',
    '/dev/ttyUSB2',
    '/dev/ttyUSB3',
    '/dev/ttyUSB4',
    '/dev/ttyUSB5',
    '/dev/ttyUSB6',
    '/dev/ttyUSB7',
    '/dev/ttyUSB8',
    '/dev/ttyUSB9',
    '/dev/ttyUSB10'
  ];
  for (var i = 0; i < possible_names.length; i++) {
    try {
      fs.accessSync(possible_names[i]);
      return possible_names[i];
    } catch (err) {
      console.log("Nope: " + possible_names[i]);
    }
  }
  console.log("No radio device found");
  return null;
};


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
  };
}


exports.start = function (onChange) {
  if (!port) {
    var port_file_name = search_for_interface();
    if (!port_file_name) {
      return;
    }
    console.log("SERIAL: Opening " + port_file_name);
    port = new SerialPort(port_file_name, {
      baudrate: 115200,
      databits: 8,
      stopbits: 1,
      parity: 'none',
      parser: serialport.parsers.readline('\n'),
      platformOptions: {
        vmin: 0
      }
    });
  }

  port.on("open", function (error) {
    if (error) {
      console.log('SERIAL: Failed to open port: ' + error);
      process.exit(23);
    } else {
      console.log('SERIAL: Port opened (' + port.isOpen() + ')');
      port.on('data', makeParser(onChange));
    }
  });

  port.on('error', function (error) {
    console.log('SERIAL ERROR: ' + error);
  });
};


exports.send = function (data) {
  console.log("SERIAL: Sending data ...");
  var toSend = data.join(",");
  port.write("P" + toSend + ",S");
};

