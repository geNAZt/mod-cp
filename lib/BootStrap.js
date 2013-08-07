function BootStrap() {
    //Get all Prototype extensions
    require('require-all')({
        dirname: __dirname + '/prototype'
    });


    //Get the module Loader and hook manager
    var hookManager = require('./HookManager');
    var moduleLoader = require('./module/Loader');

    //Start the Injector
    require('./Injector');

    //Check if config is valid
    var config = require('./ConfigManager');
    config.load("./config.json", function BootStrapAfterConfigCheck(err) {
        if (err !== null) {
            console.log("Config Error: " + err.message);
            console.log(err.stack);

            process.nextTick(function() {
                process.exit(-1);
            });
        } else {
            //Config is valid JSON => Store the config manager into the Injector
            Injector.use("config", config);

            //Start the Logger
            var logger = require('./logger');
            Injector.use("logger", logger);

            logger.info("Loaded Logger");


            logger.info("Loading all Modules");
            var mL = new moduleLoader(function() {
                logger.info("Checking if each Module has a valid config");
                var error = hookManager.execute("checkConfig");

                if(Object.keys(error).length != 0) {
                    var must = 0, done = 0;

                    Object.keys(error).forEach(function(value) {
                        must++;
                        logger.error(error[value].message, function() {
                            done++;

                            if(must == done) {
                                process.nextTick(function() {
                                    process.exit(-1);
                                });
                            }
                        });
                    });
                } else {
                    require('./Cluster');
                }
            });
        }
    });
}

module.exports = BootStrap;