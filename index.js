var express = require('express'),
  app = express(),
  path = require('path'),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  serial = require('./serial.js');

app.use(express.static(path.join(__dirname, './static')));

io.on('connection', function (socket) {
  console.log('User connected. Socket id %s', socket.id);

  socket.on('join', function (rooms) {
    console.log('Socket %s subscribed to %s', socket.id, rooms);
    if (Array.isArray(rooms)) {
      rooms.forEach(function (room) {
        socket.join(room);
      });
    } else {
      socket.join(rooms);
    }
  });

  socket.on('leave', function (rooms) {
    console.log('Socket %s unsubscribed from %s', socket.id, rooms);
    if (Array.isArray(rooms)) {
      rooms.forEach(function (room) {
        socket.leave(room);
      });
    } else {
      socket.leave(rooms);
    }
  });

  socket.on('disconnect', function () {
    console.log('User disconnected. %s. Socket id %s', socket.id);
  });
});


serial.start(function (message) {
  console.log(message);
  io.emit('data received', message);
});

http.listen(process.env.PORT || 5000, function () {
  console.log('listening on: ' + process.env.PORT || 5000);
});

