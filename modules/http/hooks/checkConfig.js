/**
 * Created with JetBrains WebStorm.
 * User: geNAZt
 * Date: 02.08.13
 * Time: 22:42
 * To change this template use File | Settings | File Templates.
 */
module.exports = function (p$config) {
    if (typeof p$config.network != "object") {
        return new Error("http:network not configured");
    }

    return undefined;
};