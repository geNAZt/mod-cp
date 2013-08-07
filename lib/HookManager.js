module.exports = new HookManager;

function HookManager() {

    /** Private variables **/
    var loadedHooks = {};

    /** Public Methods **/

    this.add = function(module, hook, func) {
        if(typeof loadedHooks[hook] == "undefined") {
            loadedHooks[hook] = [];
        }

        loadedHooks[hook].push([module, func]);
    };

    this.execute = function hookExecutor(hook, args, modules) {
        if(typeof args == "undefined") args = [];

        var ret = {};

        if(Array.isArray(loadedHooks[hook])) {
            for(var i = 0; i < loadedHooks[hook].length; i++) {
                if(typeof modules != "undefined" && Array.isArray(modules)) {
                    if(!modules.contains(loadedHooks[hook][i][0])) {
                        continue;
                    }
                }

                var ret1 = loadedHooks[hook][i][1].inject(loadedHooks[hook][i][0]).apply(null, args);

                if(typeof ret1 != "undefined") {
                    ret[loadedHooks[hook][i][0]] = ret1;
                }
            }
        }

        return ret;
    }
}