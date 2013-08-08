/**
 * Created with JetBrains WebStorm.
 * User: geNAZt
 * Date: 02.08.13
 * Time: 22:42
 * To change this template use File | Settings | File Templates.
 */
module.exports = function (p$config, cb) {
    if (typeof p$config.network != "object") {
        return cb(new Error("http:network not configured"));
    }

    cb();
};