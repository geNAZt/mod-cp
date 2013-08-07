/**
 * @author Fabian Faßbender
 * @version 0.1.0
 * @file The new Config Loader and Storage
 * @class ConfigManager
 */

/**
 * @requires module:nconf - Run npm install to get the right Version
 * @type {object}
 */
var nconf = require('nconf');

/**
 * @requires module:fs - Bundled by nodeJS
 * @type {object}
 */
var fs = require('fs');

/**
 * @requires module:path - Bundled by nodeJS
 * @type {object}
 */
var path = require('path');

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

function ConfigManager() {
    "use strict";

    //Call the EventEmitter
    events.EventEmitter.call(this);

    /**
     * Holds all loaded Config Objects
     * @type {object}
     * @memberof Config
     * @private
     */
    var nconfs = {};

    /**
     * Holds all config Paths
     * @type {object}
     * @memberof Config
     * @private
     */
    var configPaths = {};

    /**
     * The current Workdir
     * @type {string}
     * @memberof Config
     * @private
     */
    var cwd = process.cwd();

    /**
     * Loads a configFile into an new nconf Object and stores it
     * @memberof Config
     * @param {string} configFile The config that need to be loaded
     * @param {Config~loadedCallback} loadedCallback This Callback gets executed either on error or on success
     */
    this.load = function (configFile, loadedCallback) {
            //Check if the callback is given
        var hasCB = (typeof loadedCallback === 'function'),

            //Function that helps either throwing or cbing an Error
            throwOrCb = function(err) {
                if (hasCB) return loadedCallback(err, false);
                throw err;
            };

        //Check if configFile is a string
        if (typeof configFile !== 'string') return throwOrCb(new Error("configFile must be a string"));

        //Check if this file is there
        fs.exists(path.join(cwd, configFile), function (exists) {
            //Does this file exist ?
            if (exists) {
                //It does => Try creating a nconf object
                try {
                    nconfs[configFile] = new nconf.Provider();
                    nconfs[configFile].file(path.join(cwd, configFile));
                    configPaths[configFile] = configFile;

                    //Call the callback if given
                    if (hasCB) {
                        return loadedCallback(null, nconfs[configFile]);
                    }
                } catch (e) {
                    return throwOrCb(e);
                }
            } else {
                //It does not exist => Error
                return throwOrCb(new Error("This config file could not be found"));
            }
        });
    };

    /**
     * Loads a configFile under a alias into an new nconf Object and stores it
     * @memberof Config
     * @param {string} asConfigFile The alias that is used to store the config
     * @param {string} configFile The config that need to be loaded
     * @param {Config~loadedCallback} loadedCallback This Callback gets executed either on error or on success
     */
    this.loadAs = function (asConfigFile, configFile, loadedCallback) {
            //Check if the callback is given
        var hasCB = (typeof loadedCallback === 'function'),

            //Function that helps either throwing or cbing an Error
            throwOrCb = function(err) {
                if (hasCB) return loadedCallback(err, false);
                throw err;
            };

        //Check if configFile is a string
        if (typeof configFile !== 'string') return throwOrCb(new Error("configFile must be a string"));

        //Check if asConfigFile is a string
        if (typeof asConfigFile !== 'string') return throwOrCb(new Error("asConfigFile must be a string"));

        //Check if this file is there
        fs.exists(path.join(cwd, configFile), function (exists) {
            //Does this file exist ?
            if (exists) {
                //It does => Try creating a nconf object
                try {
                    nconfs[asConfigFile] = new nconf.Provider();
                    nconfs[asConfigFile].file(path.join(cwd, configFile));
                    configPaths[asConfigFile] = configFile;

                    //Call the callback if given
                    if (hasCB) {
                        return loadedCallback(null, nconfs[asConfigFile]);
                    }
                } catch (e) {
                    return throwOrCb(e);
                }
            } else {
                //It does not exist => Error
                return throwOrCb(new Error("This config file could not be found"));
            }
        });
    };

    /**
     * This causes all loaded config to reload
     * @memberof Config
     * @param {Config~reloadCallback} - Callback that gets called if all configs are reloaded or on error
     * @fires Config#reload
     */
    this.reload = function(callback) {
            //Store the this scope
        var self = this,

            //Does this function has gotten a cb ?
            hasCB = (typeof callback === 'function'),

            //Function that helps either throwing or cbing an Error
            throwOrCb = function(err) {
                if (hasCB) return callback(err, false);
                throw err;
            },

            //All paths that need to be reloaded
            reloadArr = [];

        //Iterate through all Configs and delete them, load them new
        for(var path in nconfs) {
            if (nconfs.hasOwnProperty(path)) {
                reloadArr.push(path);
            }
        }

        var counter = reloadArr.length, curCount = -1;

        //To ensure that if a load fails it stops to operate
        var next = function() {
            if(++curCount === counter) {
                if (hasCB) callback(null);
                return;
            }

            self.loadAs(reloadArr[curCount], configPaths[reloadArr[curCount]], function (err, conf) {
                if (err) {
                    return throwOrCb(err);
                }

                self.emit("reload", path, conf);
                next();
            });
        };

        next();
    };

    /**
     * Get the config without loading it
     * @memberof Config
     * @param {string} path - The path that belongs to the config
     * @returns {object|boolean} - Returns false if the config was not loaded otherweise the nconf object
     */
    this.get = function(path) {
        //Check if the Config is loaded, if not => return false else return nconf object
        if (typeof nconfs[path] === "undefined") {
            return false;
        }

        return nconfs[path];
    };
}

//Inhertis from the EventEmitter
util.inherits(ConfigManager, events.EventEmitter);

module.exports = new ConfigManager();

/**
 * This callback gets executed via loading a config file
 * @callback Config~loadedCallback
 * @param {object} err An Error Object or null
 * @param {object|boolean} config The nconf Config object or false
 */

/**
 * This callback gets executed via loading a config file
 * @callback Config~reloadCallback
 * @param {object} err An Error Object or null
 */

/**
 * Reload Event, which get emitted if one config file reloads.
 * @event Config#reload
 * @type {object}
 * @property {string} file - The filename that has been reloaded
 * @property {object} conf - The new config object
 */