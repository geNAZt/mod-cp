var hookManager = require('../../../lib/HookManager');

module.exports = function(c$logger, socket) {
    socket.on('login:checkLogin', function(data, callback) {
        socket.get("user", function(err, user) {
            if(user == null) {
                callback(false);
            } else {
                callback(true);
            }
        });
    });

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
        hookManager.execute("loginAttempt", [user], [user.provider + "-login"], function(resp) {
            if(typeof resp[user.provider + "-login"] == "undefined") {
                c$logger.warn("Login Provider " + user.provider + "-login not found");
                return callback(resp);
            }

            if(resp[user.provider + "-login"] != false) {
                socket.set("user", resp[user.provider + "-login"], function() {
                    callback(resp[user.provider + "-login"]);
                });
            } else {
                callback(resp[user.provider + "-login"]);
            }
        });
    });
};