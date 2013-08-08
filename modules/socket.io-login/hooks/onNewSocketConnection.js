var hookManager = require('../../../lib/HookManager');

module.exports = function(socket) {
    socket.on('login:getProvider', function(data, callback) {
        hookManager.execute("getLoginProviderName", function(loginProvider) {
            var ret = [];

            Object.keys(loginProvider).forEach(function(value) {
                ret.push(loginProvider[value]);
            });

            callback(ret);
        });
    });

    socket.on('login:loginAttempt', function(user, callback) {
        hookManager.execute("loginAttempt", [user], [user.provider + "-login"], function() {

        });
    });
};