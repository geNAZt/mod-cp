var util = require('../../../lib/Util');

module.exports = function(c$logger, p$playerStorage, socket) {
    function playListener(player) {
        if(player.players === -1) {
            socket.emit('server:playerCount', {name: player.name, playerCount: -1});
        } else {
            socket.emit('server:playerCount', {name: player.name, playerCount: player.players.length});
        }
    }

    socket.on('server:getPlayerCount', function() {
        socket.get("user", function(err, user) {
            if(user != null && util.hasPermission(user.permissions, "server.user.online.chart")) {
                p$playerStorage.on("players", playListener);
            }
        });
    });

    socket.on('server:getPlayerCount:disable', function() {
        socket.get("user", function(err, user) {
            if(user != null && util.hasPermission(user.permissions, "server.user.online.chart")) {
                p$playerStorage.removeListener("players", playListener);
            }
        });
    });

    socket.on('disconnect', function() {
        socket.get("user", function(err, user) {
            if(user != null && util.hasPermission(user.permissions, "server.user.online.chart")) {
                p$playerStorage.removeListener("players", playListener);
            }
        });
    });
};