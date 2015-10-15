var app = angular.module("radioControl", [])
  .run(function (socket) {
    console.log("App is running ...");
  })

  .factory("socket", function ($rootScope) {
    var path = location.pathname.replace(/(.*)(\/.*)/, "$1");
    var socket = io('http://' + location.hostname, {
      path: path + "/socket.io"
    });

    socket.commands = {};

    socket.on("connect", function () {
      console.log("Socket is connected");
    });

    socket.on('known signal', function (signal) {
      $rootScope.$apply(function () {
        // TODO: trigger angular event to update command
        console.log("Received known signal:", signal);
      });
    });

    socket.on('new signal', function (signal) {
      $rootScope.$apply(function () {
        console.log("Received new signal:", signal);
        socket.commands[signal.identity] = signal;
      });
    });

    socket.on('known signals', function (signals) {
      $rootScope.$apply(function () {
        console.log("Received list of known signals:");
        _.extend(socket.commands, signals);
      });
    });
    return socket;
  })

  .directive("speechInput", function () {
    return {
      scope: {
        callback: "="
      },
      link: function ($scope, $element, attrs) {
        var timeout;
        var $span = $element.find("span");
        var originalText = $span.text();

        $element.on("click", function () {
          clearTimeout(timeout);
          $element.addClass("active");
          if (!window.webkitSpeechRecognition) {
            $span.text("No speech support :(");
            return;
          }
          var recognition = new webkitSpeechRecognition();
          recognition.lang = "en-US";
          recognition.onresult = function (event) {
            $element.removeClass("active").addClass("result");

            try {
              var result = event.results[0][0].transcript;
            } catch (e) {
            }
            $span.text(result);
            $scope.callback(result);

            timeout = setTimeout(function () {
              $span.text(originalText);
              $element.removeClass("active result");
            }, 2000);
          };
          recognition.onerror = function (event) {
            $element.removeClass("active result");
          };
          recognition.onend = function (event) {
            $element.removeClass("active");
          };
          recognition.start();
        });
      }
    }
  })

  .controller("CreateCommand1Ctrl", function ($scope, $rootScope, socket) {
    $scope.nextPage = function () {
      $rootScope.page = "create_2";
    };

    function onSignal(signal) {
      console.log("Signal received: ", signal);
      // TODO: do something
    }

    socket.on("known signal", onSignal);
    // Do not forget to unregister socket handler
    $scope.$on("$destroy", function () {
      socket.off("new signal", onSignal)
    });
  })

  .controller("CreateCommand2Ctrl", function ($scope, $rootScope, socket) {
    $scope.create = function () {
      var command = $scope.command.toLowerCase().replace(/[^a-z'\s0-9]/g, "");
      console.log("create command for ", command);

      console.log("Creating, ...", socket.commands);
      $rootScope.page = null;
      // TODO: Set Name on signal

      // TODO: Save this signal w/ new name in backend
      socket.emit('renamed signal', socket.commands)
    };
  })

  .controller("CommandsListCtrl", function ($scope, $rootScope, socket) {
    $scope.commands = socket.commands;
    $scope.findAndExecute = function (name) {
      console.log("find and execute:", name);
      // TODO: figure out the ID of the entry
      var command = _.findWhere($scope.commands, {
        // TODO: .toLowerCase() the name for speech input
        name: name
      });
      if (command) {
        $scope.send(command);
      }
    };

    $scope.goToCreate = function () {
      $rootScope.page = "create_1";
    };

    $scope.send = function (whatever) {
      socket.emit('send signal', whatever.identity);
    };
  });