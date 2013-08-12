var io = require('socket.io');
var SocketIOLogger = require('../../../lib/logger/socket-bridge');
var hookManager = require('../../../lib/HookManager');
var ioSession = require('socket.io-session');
var express = require('express');

module.exports = function(http$servers, app_configure$store, app_configure$secret, c$logger, p$config, cb) {
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

            listen.set('authorization', ioSession(express.cookieParser(app_configure$secret), app_configure$store));
            listen.sockets.on('connection', function (socket) {
                socket.set = function(key, value, fn) {
                    socket.handshake.session[key] = value;
                    socket.handshake.session.save();
                    fn && fn(null);
                    return this;
                };

                socket.get = function(key, fn) {
                    fn(null, socket.handshake.session[key] === undefined ? null : socket.handshake.session[key]);
                    return this;
                };

                hookManager.execute("onNewSocketConnection", [socket], function() {});
            });
        });
    }

    cb();
}