var app = angular.module("radioControl", [])
  .run(function(socket) {
    console.log("App is running ...");
  })

  .factory("socket", function($rootScope) {
    var path = location.pathname.replace(/(.*)(\/.*)/, "$1");
    var socket = io('http://' + location.hostname, {
      path: path + "/socket.io"
    });

    socket.commands = {};

    socket.on("connect", function() {
      console.log("Socket is connected.");
    });

    socket.on('known signal', function(signal) {
      $rootScope.$apply(function() {
        console.log("Received known signal ", signal.name, " (", signal.identity, ")");
      });
    });

    socket.on('new signal', function(signal) {
      $rootScope.$apply(function() {
        console.log("Received new signal ", signal.identity);
        socket.commands[signal.identity] = signal;
      });
    });

    socket.on('known signals', function(signals) {
      $rootScope.$apply(function() {
        console.log("Received list with ", Object.getOwnPropertyNames(signals).length, " known signals");
        _.extend(socket.commands, signals);
      });
    });
    return socket;
  })

  .directive("speechInput", function() {
    return {
      scope: {
        callback: "="
      },
      link: function($scope, $element, attrs) {
        var timeout;
        var $span = $element.find("span");
        var originalText = $span.text();

        $element.on("click", function() {
          clearTimeout(timeout);
          $element.addClass("active");
          if (!window.webkitSpeechRecognition) {
            $span.text("No speech support :(");
            return;
          }
          var recognition = new webkitSpeechRecognition();
          recognition.lang = "en-US";
          recognition.onresult = function(event) {
            $element.removeClass("active").addClass("result");

            try {
              var result = event.results[0][0].transcript;
            } catch (e) {}

            $span.text(result);
            $scope.callback(result);

            timeout = setTimeout(function() {
              $span.text(originalText);
              $element.removeClass("active result");
            }, 2000);
          };
          recognition.onerror = function(event) {
            console.log("onerror", event);
            $element.removeClass("active result");
          };
          recognition.onend = function(event) {
            $element.removeClass("active");
          };
          recognition.start();
        });
      }
    }
  })

  .controller("CreateCommand1Ctrl", function($scope, $rootScope, socket) {
    function onSignal(signal) {
      $scope.$apply(function() {
        console.log("Renaming the signal ", signal.identity, ", old name ", signal.name);
        socket.currentSignal = signal.identity;
        $rootScope.page = "create_2";
      });
    }

    socket.on("known signal", onSignal);
    // Do not forget to unregister socket handler
    $scope.$on("$destroy", function() {
      socket.off("known signal", onSignal)
    });
  })

  .controller("CreateCommand2Ctrl", function($scope, $rootScope, socket) {
    $scope.create = function() {
      var command = $scope.command.toLowerCase().replace(/[^a-z'\s0-9]/g, "");
      var signal = socket.commands[socket.currentSignal];
      $rootScope.page = null;
      // Set Name on signal
      signal.name = command;
      // Save this signal w/ new name in backend
      socket.emit('renamed signal', signal);
      console.log("Created command '", command, "' for ", signal.identity);
    };
  })

  .controller("CommandsListCtrl", function($scope, $rootScope, socket) {
    $scope.commands = socket.commands;
    $scope.editMode = false;

    $scope.filterNamedItems = function() {
      return _.filter($scope.commands, function(item) {
        return item.name;
      });
    };

    $scope.findAndExecute = function(name) {
      console.log("Find and execute command:", name);
      var command = _.findWhere($scope.commands, {
        name: name.toLowerCase()
      });
      if (command) {
        console.log("Send:", name);
        $scope.send(command);
      }
    };

    $scope.goToCreate = function() {
      $rootScope.page = "create_1";
    };

    $scope.delete = function(signal) {
      socket.emit('delete signal', signal.identity);
      delete socket.commands[signal.identity];
    };

    $scope.send = function(signal) {
      socket.emit('send signal', signal.identity);
    };
  });