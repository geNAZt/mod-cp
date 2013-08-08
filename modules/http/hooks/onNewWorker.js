//Hook gets called each time the cluster creates a new worker
module.exports = function(c$logger, p$config, cb) {
    var express = require('express');
    var hookManager = require('../../../lib/HookManager');

    //Start a Express App
    var app = express();

    //Throw it into the Injector
    ModuleInjector.use("app", app);

    hookManager.execute("httpAppStartup", function() {});

    c$logger.debug("Starting HTTP Server(s)");

    //Start it on configured interfaces
    var servers = [];
    p$config.network.forEach(function(conn) {
        servers.push(app.listen(conn.port, conn.ip, function() {
            c$logger.info("Bound ExpressJS to " + conn.ip + ":" + conn.port);
        }));
    });

    //Put all started servers into the Injector
    ModuleInjector.use("servers", servers);

    hookManager.execute("httpServerStart", function() {});

    cb();
}