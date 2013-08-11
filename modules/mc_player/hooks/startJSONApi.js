var events = require('events');

module.exports = function(jsonapi$api, c$logger, cb) {
    var ee = new events.EventEmitter();

    PrivateInjector.use("playerStorage", ee);

    setInterval(function() {
        jsonapi$api.call("getPlayers", [], function(err, result) {
            if(err) {
                c$logger.error(err);
            }

            else {
                result.forEach(function(value) {
                    if(value.err) {
                        ee.emit("players", {name: value.name, players: -1});
                    } else {
                        ee.emit("players", {name: value.name, players: value.result});
                    }
                });
            }
        });
    }, 1000);

    cb();
};