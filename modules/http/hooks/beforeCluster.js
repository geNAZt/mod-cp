//This hook gets called before the cluster does setup
module.exports = function(c$logger, p$config, multiThread) {
    if(multiThread) {
        c$logger.debug("HTTP Module starting in multi Thread mode");
    } else {
        c$logger.debug("HTTP Module starting in single Thread mode");
    }
}