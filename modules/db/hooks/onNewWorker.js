module.exports = function(p$config, cb) {
    var Schema = require('jugglingdb').Schema;
    var schema = new Schema('mysql', {
        database: p$config.database,
        username: p$config.user,
        password: p$config.pass,
        host: p$config.host
    });

    ModuleInjector.use("schema", schema);

    var hookManager = require('../../../lib/HookManager');
    hookManager.execute("attachORM", function() {
        if(p$config.init == false) {
            schema.autoupdate();
        }

        cb();
    });
}