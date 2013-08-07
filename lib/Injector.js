var localInjector = null;
var security = require('./module/Security');

function ModuleInjector() {
    var storage = {};

    this.get = function() {
        if(arguments.callee.caller.name == 'getModuleInjector') {
            return storage;
        } else {
            throw new Error("Invalid access of getting a module in the ModuleInjector");
        }
    };

    this.use = function(name, obj) {
        var module = security.resolveModule(arguments.callee.caller);

        if(typeof module == "string") {
            storage[module + "$" + name] = obj;
        }
    }
}

function PrivateInjector() {
    var storage = {};

    this.get = function(fn) {
        if(arguments.callee.caller.name == 'getPrivateInjector') {
            var module = security.resolveModule(fn);

            return storage[module];
        } else {
            throw new Error("Invalid access of getting a module in the PrivateInjector");
        }
    };

    this.use = function(name, obj, module) {
        if(arguments.callee.caller.name != 'ModuleLoaderInitIterator') {
            module = security.resolveModule(arguments.callee.caller);
        }

        if(typeof module == "string") {
            if(typeof storage[module] == "undefined") {
                storage[module] = {};
            }

            storage[module]["p$" + name] = obj;
        }
    }
}

function Injector() {
    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var use = {};

    function annotate (fn) {
        var $inject,
            fnText,
            argDecl,
            last;

        if (typeof fn === 'function') {
            if (!($inject = fn.$inject)) {
                $inject = [];
                fnText = fn.toString().replace(STRIP_COMMENTS, '');
                argDecl = fnText.match(FN_ARGS);
                argDecl[1].split(FN_ARG_SPLIT).forEach(function(arg){
                    arg.replace(FN_ARG, function(all, underscore, name){
                        $inject.push(name);
                    });
                });

                fn.$inject = $inject;
            }
        } else if (Array.isArray(fn)) {
            last = fn.length - 1;

            if (typeof fn[last] !== "function") {
                throw new Error("Injector called via array. Last Index was not a function");
            }

            $inject = fn.slice(0, last);
        } else {
            throw new Error("Injector called but target is neither a function or an array");
        }
        return $inject;
    }

    this.use = function(name, object) {
        //Global READ only Injections
        if(arguments.callee.caller.caller.name == 'BootStrapAfterConfigCheck') {
            name = "c$" + name;
            object = Object.freeze(object);
        } else {
            throw new Error("Global Injections can only be set by the BootStrap");
        }

        use[name] = object;
    };

    function getModuleInjector() {
        return global.ModuleInjector.get();
    }

    function getPrivateInjector(module) {
        return global.PrivateInjector.get(module);
    }

    this.inject = function(module, fn) {
        var newFN = function InjectWrapper() {
            var inject = annotate(fn);
            var privateInjector = getPrivateInjector(fn);
            var moduleInjector = getModuleInjector();
            var callArgs = [];
            var args = Array.prototype.slice.call(arguments, 0);

            inject.forEach(function(arg) {
                if (typeof use[arg] != "undefined") {
                    callArgs.push(use[arg]);
                } else if (typeof privateInjector != "undefined" && typeof privateInjector[arg] != "undefined") {
                    callArgs.push(privateInjector[arg]);
                } else if (typeof moduleInjector != "undefined" && typeof moduleInjector[arg] != "undefined") {
                    callArgs.push(moduleInjector[arg]);
                } else {
                    callArgs.push(args.shift());
                }
            });

            return fn.apply(this, callArgs);
        };

        newFN.hashCode = fn.getHashCode();

        return newFN;
    };
}

function SecureInjector(injector) {
    localInjector = injector;

    this.use = function(name, object) {
        localInjector.use(name, object);
    };
}

Function.prototype.inject = function(module) {
    return localInjector.inject(module, this);
}

global.Injector = new SecureInjector(new Injector());
global.PrivateInjector = new PrivateInjector();
global.ModuleInjector = new ModuleInjector();