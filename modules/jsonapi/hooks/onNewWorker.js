module.exports = function(p$config, cb) {
    var Minecraft = require('minecraft');

    var mc = new Minecraft({
        host: p$config.host,
        user: p$config.user,
        pass: p$config.pass,
        salt: p$config.salt
    });

    ModuleInjector.use("api", mc);

    var hookManager = require('../../../lib/HookManager');
    hookManager.execute("startJSONApi", function() {
        cb();
    });
}