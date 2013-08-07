module.exports = ModuleLoader;

var hookManager = require('../HookManager');
var fs = require('fs');
var path = require('path');
var async = require('async');
var security = require('./Security');

function ModuleLoader(cb) {

    /** Private variables **/
    var modulePath = null;

    /** Private Methods **/
    var loadHooks = function(c$logger, mod, innerCB) {
        c$logger.debug("Loading Hooks for: " + mod);

        var files = fs.readdirSync(path.join(process.cwd(), "modules", mod, "hooks"));

        async.each(files, function(item, innerCB2) {
            c$logger.debug("Found Hook for " + mod + ": " + item);

            var fn = require(path.join(process.cwd(), "modules", mod, "hooks", item));
            if(typeof fn != "function") {
                throw new Error("Loaded hook which is not a function");
            }

            security.add(mod, fn);
            hookManager.add(mod, item.replace(".js", ""), require(path.join(process.cwd(), "modules", mod, "hooks", item)));

            innerCB2();
        }, function() {
            innerCB();
        });
    }.inject();

    var init = function(c$logger, c$config) {
        modulePath = c$config.get("./config.json").get("modulePath");

        if(modulePath == undefined) {
            c$logger.error("No modulePath has been configured", function() {
                process.nextTick(function() {
                    process.exit(-1);
                });
            });

            return;
        }

        var modules = fs.readdirSync(path.join(process.cwd(), "modules"));

        async.each(modules, function ModuleLoaderInitIterator(item, innerCB) {
            c$logger.info("Found Module: " + item);

            //Check if global Module config is given
            if(typeof c$config.get("./config.json").get(item) != "undefined") {
                PrivateInjector.use("config", c$config.get("./config.json").get(item), item);
            }

            loadHooks(item, innerCB);
        }, function() {
            cb();
        });
    }.inject();


    /** Start the instance **/
    init();
}