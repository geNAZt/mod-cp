var io = require('socket.io');
var SocketIOLogger = require('../../../lib/logger/socket-bridge');
var hookManager = require('../../../lib/HookManager');

module.exports = function(http$servers, c$logger, p$config) {
    "use strict";

    //Start Socket.IO if enabled
    if (p$config.enabled == true) {
        c$logger.debug("Starting Socket.IO Server(s)");

        http$servers.forEach(function(server) {
            server.on('listening', function() {
                c$logger.info("Bound Socket.IO to " + server.address().address + ":" + server.address().port);
            });

            var listen = io.listen(server, {
                'logger': new SocketIOLogger()
            });

            listen.sockets.on('connection', function (socket) {
                hookManager.execute("onNewSocketConnection", [socket]);
            });
        });
    }
}