/**
 * @author Fabian Faßbender
 * @version 0.1.0
 * @file Socket Module binds the socket.io app to HTTP NodeJS Servers
 * @class Socket
 */

/**
 * @requires module:socket.io - NPM Install to get this
 * @type {object}
 */
var io = require('socket.io');

var SocketIOLogger = require('./logger/socket-bridge');

function Socket($httpservers, $logger, $config) {
    "use strict";

    //Start Socket.IO if enabled
    if ($config.get("./config.json").get("socket") === true) {
        $logger.debug("Starting Socket.IO Server(s)");

        $httpservers.forEach(function(server) {
            server.on('listening', function() {
                $logger.info("Bound Socket.IO to " + server.address().address + ":" + server.address().port);
            });

            io.listen(server, {
                'logger': new SocketIOLogger()
            });
        });
    }
}

(Socket.inject())();