/**
 * @author Fabian Faßbender
 * @version 0.1.0
 * @file Cluster that enables running on multiple Cores
 * @class Cluster
 */

var hookManager = require('./HookManager');

function Cluster(c$config, c$logger) {
    //Try to get the general Config
    var config = c$config.get("./config.json");

    //Check if cluster is enabled
    if (config.get("cluster:enabled") == false) {
        c$logger.info("Starting in single Thread mode");

        hookManager.execute("beforeCluster", [false]);
        hookManager.execute("onNewWorker");
    } else {
        c$logger.info("Starting in multi Thread mode");

        hookManager.execute("beforeCluster", [true]);
    }
}

Cluster.inject()();