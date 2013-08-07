module.exports = function(socket) {
    socket.on('login:getProvider', function(data, callback) {
        callback([
            "minecraft"
        ]);
    });
};