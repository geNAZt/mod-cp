/**
 * @author Fabian Faßbender
 * @version 0.1.0
 * @file Logger that is used to log actions
 * @class Logger
 */

/**
 * @requires module:events - Bundled by nodeJS
 * @type {object}
 */
var events = require('events');

/**
 * @requires module:util - Bundled by nodeJS
 * @type {object}
 */
var util = require('util');

/**
 * @requires module:fs - Bundled by nodeJS
 * @type {object}
 */
var fs = require('fs');

/**
 * @requires module:async - Run npm install to get it
 * @type {object}
 */
var async = require('async');

/**
 * @requires module:lib/config.js - Bundled Config Loader
 * @type {object}
 */
var configObj = require('../ConfigManager');

function Logger() {
    "use strict";



    /*** Private vars ***/

    /**
     * The general Config Object
     * @type {object}
     * @memberof Logger
     * @private
     */
    var config = {};

    /**
     * An hrtime object that gets set by logger start
     * @type {object}
     * @memberof Logger
     * @private
     */
    var startTime = process.hrtime();

    /**
     * All formats that are available for the logger
     * @type {object}
     * @memberof Logger
     * @private
     */
    var formats = require('./format')(this);

    /**
     * All Writers that are loaded
     * @type {object}
     * @memberof Logger
     * @private
     */
    var writer;

    /**
     * The general format string
     * @type {string}
     * @memberof Logger
     * @private
     */
    var format;

    /**
     * All available Log methods
     * @type {object}
     * @memberof Logger
     * @private
     */
    var avail;

    /**
     * Stores all loaded writers
     * @memberof Logger
     * @type {array}
     * @private
     */
    var loadedWriter = [];

    /**
     * All enabled Log methods, they will emit lines
     * @type {object}
     * @memberof Logger
     * @private
     */
    var enabled;

    /**
     * The format cache that holds all Format methods
     * @type {object}
     * @memberof Logger
     * @private
     */
    var formatCache = {};

    /**
     * The regex that is been used to get the formats out of a format
     * @type {RegExp}
     * @memberof Logger
     * @private
     */
    var regex = /(?:\{([a-z0-9,= ]+)\})?%([a-z]+)%/img;

    /**
     * This holds the current scope
     * @type {Object}
     */
    var self = this;



    /*** Callbacks ***/

    /**
     * Loader for file Writers
     * @memberof Logger
     * @param file - The file that should be loaded
     * @param {Logger~asyncCallback} cb - Async Module Callback, that gets called after every load
     * @private
     */
    var loadWriter = function (file, cb) {
        loadedWriter.push(require('./writer/' + file)(function () {
            cb(null, true);
        }));
    };



    /*** Public setter/getter for private vars ***/

    /**
     * Get the hrtime object
     * @memberof Logger
     * @public
     * @returns {object}
     */
    this.__defineGetter__("startTime", function() {
        return startTime;
    });



    /*** Object init ***/

    events.EventEmitter.call(this);
    initConfig(configObj.get("./config.json"));
	configObj.on('reload', function (path, conf) {
        if (path === "./config.json") {
            try {
                initConfig(conf);
            } catch(e) {
                if (typeof self.error === "function") {
                    self.error("Reloading config.json was invalid: " + e.message);
                } else {
                    console.log("Reloading config.json was invalid: " + e.message);
                }
            }
        }
    });


    /*** Private methods ***/

    /**
     * Parse and build an format function
     * @memberof Logger
     * @param {string} format - The format that should be parsed
     * @private
     */
    var getFormatFunction = function (format) {
        return "return \"" + format.replace(regex, function (fullMatch, matchOptions, formatPattern) {
            //If the formatPattern has a function use it
            if (typeof formats[formatPattern] === 'function') {
                //Parse its options
                if (typeof matchOptions === 'undefined') {
                    matchOptions = [];
                } else {
                    var tmpOptions = {};

                    //Options always have to be <key>=<value>, <key>=<value>,<key>=<value> or so
                    matchOptions.split(",").forEach(function (option) {
                        var optionPair = option.trim().split("=");
                        tmpOptions[optionPair[0]] = optionPair[1];
                    });

                    matchOptions = tmpOptions;
                }

                return "\" + formats." + formatPattern + "(message, level, " + JSON.stringify(matchOptions) + ") + \"";
            } else {
                //If not function => give bad the matched string
                return fullMatch;
            }
        }) + "\";";
    };

    /**
     * Lookup format functions, if not there parse them and emit the new logline
     * @memberof Logger
     * @param {string} message - The message that should be emitted
     * @param {string} level - Which logelevel will be emitted
     * @private
     */
    var parseAndEmit = function (message, level, cb) {
        if (typeof formatCache[level] === 'undefined') {
            var lvlConfig = config.get("logger:" + level),
                format = (typeof lvlConfig !== 'undefined' && typeof lvlConfig.format === 'string') ? lvlConfig.format : config.get("logger:format"),
                formatFunction = getFormatFunction(format);

            formatCache[level] = new Function("message", "level", "formats", formatFunction);
        }

        var line = formatCache[level](message, level, formats);

        async.applyEach(loadedWriter, line, function() {
            cb();
        });
    };

    /*** Private vars validation ***/
    function initConfig(conf) {
        if (conf === false) {
            //No general config => Fatal Error
            throw new Error("The general config: ./config.json was not loaded");
        } else {
            var newConf = {};

            //Config is there validate it
            if (typeof conf.get("logger") === "undefined") {
                throw new Error("Logger can't be initialized without logger config");
            }

            //Check if the Writer config is set and if it is valid
            newConf.writer = conf.get("logger:writer");
            if (typeof newConf.writer === "undefined") {
                throw new Error("Logger can't be initialized without writer config");
            } else {
                //Must be an array
                if (!Array.isArray(newConf.writer)) {
                    throw new Error("Logger writer config is not an array");
                } else {
                    //Must be non empty
                    if (newConf.writer.length === 0) {
                        throw new Error("Logger writer config is an empty array");
                    } else {
                        newConf.writer.forEach(function (value) {
                            //Each value must be a string
                            if (typeof value !== "string") {
                                throw new Error("Logger writer config is an array that contains non string values");
                            } else {
                                //And it must be found on the disk
                                if (!fs.existsSync(__dirname + "/writer/" + value + ".js")) {
                                    throw new Error("Logger writer config has an writer that could not be found: " + value);
                                }
                            }
                        });
                    }
                }
            }

            //Check if the format config is set and if it is valid
            newConf.format = conf.get("logger:format");
            if (typeof newConf.format === "undefined") {
                throw new Error("Logger can't be initialized without format config");
            } else {
                //Must be a string
                if (typeof newConf.format !== "string") {
                    throw new Error("Logger format config is not a string");
                } else {
                    //String must be non empty
                    if (newConf.format.length === 0) {
                        throw new Error("Logger format config is a empty string");
                    }
                }
            }

            //Check if the availableLevels config is set and if it is valid
            newConf.avail = conf.get("logger:availableLevels");
            if (typeof newConf.avail === "undefined") {
                throw new Error("Logger can't be initialized without availableLevels config");
            } else {
                //Must be an array
                if (!Array.isArray(newConf.avail)) {
                    throw new Error("Logger availableLevels config is not an array");
                } else {
                    //Must be non empty
                    if (newConf.avail.length === 0) {
                        throw new Error("Logger availableLevels config is an empty array");
                    } else {
                        newConf.avail.forEach(function (value) {
                            //Each value must be a string
                            if (typeof value !== "string") {
                                throw new Error("Logger availableLevels config is an array that contains non string values");
                            }
                        });
                    }
                }
            }


            //Check if the enabledLevels config is set and if it is valid
            newConf.enabled = conf.get("logger:enabledLevels");
            if (typeof newConf.enabled === "undefined") {
                throw new Error("Logger can't be initialized without enabledLevels config");
            } else {
                //Must be an array
                if (!Array.isArray(newConf.enabled)) {
                    throw new Error("Logger enabledLevels config is not an array");
                } else {
                    //Must be non empty
                    if (newConf.enabled.length === 0) {
                        throw new Error("Logger enabledLevels config is an empty array");
                    } else {
                        newConf.enabled.forEach(function (value) {
                            //Each value must be a string
                            if (typeof value !== "string") {
                                throw new Error("Logger enabledLevels config is an array that contains non string values");
                            } else {
                                //Each value must be found in availableLevels
                                if (newConf.avail.indexOf(value) === -1) {
                                    throw new Error("Logger enabledLevels config has an value that is not in the availableLevels config");
                                }
                            }
                        });
                    }
                }
            }

            writer = newConf.writer;
            format = newConf.format;
            avail = newConf.avail;
            enabled = newConf.enabled;
            config = conf;

            loadedWriter = [];

            async.mapSeries(writer, loadWriter.bind(self), function(err) {
                if(err) {
                    throw err;
                }

                setupLoggerMethods(self);
            });
        }
    }



    /*** Public methods ***/

    /**
     * The logger method will be named by the config value of the available config
     * @memberof Logger
     * @public
     */

    function setupLoggerMethods(self) {
        formatCache = {};

        avail.forEach(function (level) {
            if (enabled.indexOf(level) !== -1) {
                //Setup the logging method
                this[level] = function (message, cb) {
                    var line = '';

                    //Concat the arguments if they are above 1
                    if(arguments.length > 1) {
                        for(var x in arguments) {
                            if (arguments.hasOwnProperty(x) && typeof arguments[x] !== "function") {
                                line += arguments[x] + " ";
                            }
                        }
                    } else {
                        line = message;
                    }

                    //Emit the line to all writers
                    parseAndEmit(line, level, function() {
                        if(typeof cb === "function") {
                            cb();
                        }
                    });
                };
            } else {
                //If this level isnt enabled, ignore input
                this[level] = function () { };
            }
        }.bind(self));
    }
}

util.inherits(Logger, events.EventEmitter);
module.exports = new Logger();

/**
 * @callback Logger~asyncCallback
 */