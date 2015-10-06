var async = require("async");
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;

var port = new SerialPort("/dev/ttyUSB0", {
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

var lineBuffer = [];
var lastLine = null;

function parsePacket(packet) {
  console.log(packet.length + ' pieces of data in the package')
}

function parseLine(line) {
  if (line === 'Program started\r') {
    return;
  } else if(line === 'End of recordedBits\r') {
    parsePacket(lineBuffer)
    lineBuffer = []
  } else {
    var arr = line.split(' ')
    var datum = {state: arr[1], time: arr[2] }
    lineBuffer.push(datum)
  }
}

port.on("open", function (error) {
  if ( error ) {
    console.log('failed to open: '+error);
  } else {
    console.log('Port opened');

    //port.on('data', function(line) { console.log(line); });
    port.on('data', parseLine);
  }
});

port.on('error', function(error) {
  console.log('error: ' + error);
});

