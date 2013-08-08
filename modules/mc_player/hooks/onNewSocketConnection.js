module.exports = function(c$logger, p$playerStorage, socket) {
    function playListener(player) {
        socket.emit('server:playerCount', player.length);
    }

    socket.on('server:getPlayerCount', function() {
        p$playerStorage.on("players", playListener);
    });

    socket.on('server:getPlayerCount:disable', function() {
        p$playerStorage.removeListener("players", playListener);
    });

    socket.on('disconnect', function() {
        p$playerStorage.removeListener("players", playListener);
    });
};