/**
 * @author Fabian Faßbender
 * @version 0.1.0
 * @file Socket Logger Bridge to bind the socket.io logger into this logger
 * @class SocketIOLogger
 */

var toArray = require('./utils').toArray;

var levels = [
    'error'
    , 'warn'
    , 'info'
    , 'debug'
];

var Logger = module.exports = function (opts) {

};

/**
 * Generate methods.
 */

function generateLogger($logger) {
    levels.forEach(function (name) {
        if(typeof $logger[name] !== "undefined") {
            Logger.prototype[name] = function () {
                $logger[name].apply(this, toArray(arguments));
            };
        }
    });
}

(generateLogger.inject())();