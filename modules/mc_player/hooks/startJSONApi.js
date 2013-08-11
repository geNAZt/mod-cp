var events = require('events');

module.exports = function(jsonapi$api, c$logger, cb) {
    var ee = new events.EventEmitter();

    PrivateInjector.use("playerStorage", ee);

    setInterval(function() {
        jsonapi$api.call("getPlayers", [], function(err, result) {
            if(err) {
                ee.emit("players", -1);
                c$logger.debug(err);
            }

            else {
                ee.emit("players", result);
            }
        });
    }, 1000);

    cb();
};