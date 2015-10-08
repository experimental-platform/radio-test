var express = require('express'),
  app = express(),
  path = require('path'),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  serial = require('./serial.js'),
  storage = require('./storage'),
  analyse = require('./analyse').analyse;


app.use(express.static(path.join(__dirname, './static')));


io.on('connection', function (socket) {
  console.log('User connected. Socket id %s', socket.id);
  // TODO: SEND ALL KNOWN SIGNALS
  socket.on('disconnect', function () {
    console.log('User disconnected. %s. Socket id %s', socket.id);
  });
});

data = storage.read(function (data) {
  serial.start(function (signal) {
    if (signal) {
      signal = analyse(signal);
      if (data[signal.identity]) {
        io.emit('known signal', signal);
      } else {
        data[signal.identity] = signal;
        storage.write(data);
        io.emit('new signal', signal);
        io.emit('known signal', signal);
      }
    }
  });
});


http.listen(process.env.PORT || 5000, function () {
  console.log('listening on: ' + process.env.PORT || 5000);
});

