var async = require('async');

module.exports = function(db$schema, c$logger, cb) {
    var Minecraft = require('minecraft');
    var jsonapi = {};

    db$schema.models.JSONAPI.all(function(err, jsonapis) {
        if(err) {
            c$logger.error("DB Error: ", err);
        } else {
            jsonapis.forEach(function(jsonapiConfig) {
                jsonapi[jsonapiConfig.name] = new Minecraft({
                    host: jsonapiConfig.host,
                    port: jsonapiConfig.port,
                    user: jsonapiConfig.user,
                    pass: jsonapiConfig.password,
                    salt: jsonapiConfig.salt
                });
            });
        }
    });

    ModuleInjector.use("api", {
        call: function(method, args, cb) {
            if (typeof args == 'function') {
                cb = args;
                args = undefined;
            }

            async.map(Object.keys(jsonapi), function(value, acb) {
                jsonapi[value].call(method, args, function(err, result) {
                    acb(null, { name: value, result: result, err: err });
                });
            }, function(err, results) {
                cb(err, results);
            });
        }
    });

    var hookManager = require('../../../lib/HookManager');
    hookManager.execute("startJSONApi", function() {
        cb();
    });
}