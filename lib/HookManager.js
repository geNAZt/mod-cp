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

    this.execute = function hookExecutor(hook, args, modules, cb) {
        if(typeof args == "function") {
            cb = args;
            args = [];
        }

        if(typeof modules == "function") {
            cb = modules;
            modules = undefined;
        }

        if(typeof cb != "function") {
            throw new Error("Called hookManager execute without callback");
        }

        var ret = {}, execute = [], done = 0;

        if(Array.isArray(loadedHooks[hook])) {
            for(var i = 0; i < loadedHooks[hook].length; i++) {
                if(typeof modules != "undefined" && Array.isArray(modules)) {
                    if(!modules.contains(loadedHooks[hook][i][0])) {
                        continue;
                    }
                }

                execute.push([loadedHooks[hook][i][1].inject(loadedHooks[hook][i][0]), loadedHooks[hook][i][0]]);
            }

            if(execute.length > 0) {
                execute.forEach(function(value) {
                    value[0].apply(null, args.concat([function(ret1) {
                        if(typeof ret1 != "undefined") ret[value[1]] = ret1;
                        done++;

                        if(execute.length == done) {
                            cb(ret);
                        }
                    }]));
                });
            }
        }
    }
}