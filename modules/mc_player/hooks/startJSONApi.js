var events = require('events');

module.exports = function(jsonapi$api, cb) {
    var ee = new events.EventEmitter();

    PrivateInjector.use("playerStorage", ee);

    setInterval(function() {
        jsonapi$api.call("getPlayers", [], function(err, result) {
            ee.emit("players", result);
        });
    }, 1000);

    cb();
};