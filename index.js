var express = require('express'),
  app = express(),
  path = require('path'),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  request = require('request').defaults({json: true}),
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
      var signal = data[signal_id];
      if (typeof signal.webhook_send == "string") {
        console.log("Calling webhook on send: ", signal['webhook_send']);
        request
          .get(signal['webhook_send'])
          .on('error', function (err) {
            console.log(err)
          })
          .on('response', function (response) {
            // TODO: Do something with the response?
            console.log("Webhook status code: ", response.statusCode);
          });
      }
      console.log("Sending Signal to ", signal.name, " (", signal_id, ")");
      serial.send(signal.timings);
    });
    socket.on('renamed signal', function (signal) {
      console.log("NEW NAME: '", signal.name, "' for '", signal.identity, "'");
      data[signal.identity] = signal;
      // remove all entries without a name
      data = _.omit(data, function (entry) {
        return entry.name === null;
      });
      storage.write(data);
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
        var webhook = data[signal.identity]["webhook_receive"];
        if (typeof webhook == "string") {
          console.log("Calling webhook on receive: ", webhook);
          request
            .post(webhook, signal)
            .on('error', function (err) {
              console.log("Webhook ERROR: ", err)
            })
            .on('response', function (response) {
              // TODO: Do something with the response?
              console.log("Webhook status code: ", response.statusCode);
            });
        }
      } else {
        io.emit('new signal', signal);
        io.emit('known signal', signal);
      }
    }
  });
  http.listen(process.env.PORT || 5000, function () {
    console.log('listening on: ' + process.env.PORT || 5000);
  });
});

