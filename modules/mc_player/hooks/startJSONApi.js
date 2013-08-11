var events = require('events');

module.exports = function(jsonapi$api, cb) {
    var ee = new events.EventEmitter();

    PrivateInjector.use("playerStorage", ee);

    setInterval(function() {
        jsonapi$api.call("getPlayers", [], function(err, result) {
            if(typeof result == "undefined") ee.emit("players", -1);
            else ee.emit("players", result);
        });
    }, 1000);

    cb();
};