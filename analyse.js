var fs = require('fs'),
  crc = require('crc-32');


var bitWise = function (data) {
  return data.join(', ')
};

exports.analyse = function (data) {
  // TODO: add signal length and make some cool error resistant calculation w/ it.
  data.identity = bitWise(data.timings);
  data.received = new Date();
  data.crc = crc.str(data.identity);
  data.name = "Unbekannt: " + data.crc.toString() + ', ' + data.identity.length + " Bits";
  return data;
};