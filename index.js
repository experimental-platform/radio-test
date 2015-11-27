var express = require('express'),
    app = express(),
    path = require('path'),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    _ = require('underscore'),
    serial = require('./serial.js'),
    storage = require('./storage'),
    analyse = require('./analyse').analyse;


storage.read(function(data) {
  function save() {
    // remove all entries without a name
    data = _.omit(data, function(entry) {
      return entry.name === null;
    });
    storage.write(data);
  }

  app.use(express.static(path.join(__dirname, './static')));
  // socket.io handlers
  io.on('connection', function(socket) {
    console.log('User connected. Socket id %s', socket.id);
    // send all known
    io.emit('known signals', data);

    socket.on('send signal', function(identity) {
      var signal = data[identity];
      console.log("Sending Signal to ", signal.name, " (", identity, ")");
      serial.send(signal.timings);
    });

    socket.on('renamed signal', function(signal) {
      console.log("NEW NAME: '", signal.name, "' for '", signal.identity, "'");
      data[signal.identity] = signal;
      save();
    });

    socket.on('delete signal', function(identity) {
      delete data[identity];
      save();
    });

    socket.on('disconnect', function () {
      console.log('User disconnected. %s. Socket id %s', socket.id);
    });
  });

  serial.start(function (signal) {
    if (!signal) {
      return;
    }
    signal = analyse(signal);
    if (data[signal.identity]) {
      io.emit('known signal', data[signal.identity]);
      // TODO: compare signal quality and replace bad recordings
    } else {
      io.emit('new signal', signal);
      io.emit('known signal', signal);
    }
  });

  http.listen(process.env.PORT || 5000, function () {
    console.log('listening on: ' + process.env.PORT || 5000);
  });
});

