var util = require('../../../lib/Util');

module.exports = function(c$logger, p$playerStorage, socket) {
    function playListener(player) {
        socket.emit('server:playerCount', player.length);
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