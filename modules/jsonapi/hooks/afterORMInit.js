var async = require('async');

module.exports = function(db$schema, c$logger, cb) {
    var Minecraft = require('minecraft');
    var jsonapi = {};

    function diffArray(a, b) {
        var seen = [], diff = [];
        for ( var i = 0; i < b.length; i++)
            seen[b[i]] = true;
        for ( var i = 0; i < a.length; i++)
            if (!seen[a[i]])
                diff.push(a[i]);
        return diff;
    }

    function initJSONAPI() {
        db$schema.models.JSONAPI.all(function(err, jsonapis) {
            if(err) {
                c$logger.error("DB Error: ", err);
            } else {
                var found = [];

                jsonapis.forEach(function(jsonapiConfig) {
                    found.push(jsonapiConfig.name);

                    if(typeof jsonapi[jsonapiConfig.name] == "undefined") {
                        jsonapi[jsonapiConfig.name] = new Minecraft({
                            host: jsonapiConfig.host,
                            port: jsonapiConfig.port,
                            user: jsonapiConfig.user,
                            pass: jsonapiConfig.password,
                            salt: jsonapiConfig.salt
                        });
                    }
                });

                diffArray(Object.keys(jsonapi), found).forEach(function(value) {
                    delete jsonapis[value];
                });
            }
        });
    }

    initJSONAPI();
    setInterval(function() {
        c$logger.debug("Looking for new JSONAPI Endpoints");
        initJSONAPI();
    }, 30000);

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