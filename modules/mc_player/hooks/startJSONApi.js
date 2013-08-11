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
                var newResult = [];

                result.forEach(function(value) {
                    if(value.err) {
                        newResult.push({name: value.name, playerCount: -1});
                    } else {
                        newResult.push({name: value.name, playerCount: value.result.length});
                    }
                });

                ee.emit("players", newResult);
            }
        });
    }, 1000);

    cb();
};