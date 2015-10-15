var express = require('express'),
  app = express(),
  path = require('path'),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  serial = require('./serial.js'),
  storage = require('./storage'),
  analyse = require('./analyse').analyse;


data = storage.read(function (data) {
  // express
  // static file server
  app.use(express.static(path.join(__dirname, './static')));
  // socket.io handlers
  io.on('connection', function (socket) {
    console.log('User connected. Socket id %s', socket.id);
    // send all known
    io.emit('known signals', data);
    socket.on('send signal', function (signal_id) {
      console.log("Sending Signal to ", signal_id);
      serial.send(data[signal_id].timings);
    });
    socket.on('disconnect', function () {
      console.log('User disconnected. %s. Socket id %s', socket.id);
    });
  });
  // serial console handlers
  serial.start(function (signal) {
    if (signal) {
      signal = analyse(signal);
      if (data[signal.identity]) {
        io.emit('known signal', data[signal.identity]);
        // TODO: compare signal quality and replace bad recordings
      } else {
        data[signal.identity] = signal;
        storage.write(data);
        io.emit('new signal', signal);
        io.emit('known signal', signal);
      }
    }
  });
  http.listen(process.env.PORT || 5000, function () {
    console.log('listening on: ' + process.env.PORT || 5000);
  });
});

