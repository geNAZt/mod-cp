function ModuleSecurity() {
    var functionToModule = {};

    this.add = function(mod, fn) {
        if(!Array.isArray(functionToModule[mod])) {
            functionToModule[mod] = [];
        }

        functionToModule[mod].push(fn.getHashCode());
    };

    this.resolveModule = function(fn) {
        var hashCode = fn.getHashCode();
        var ret = undefined;

        Object.keys(functionToModule).forEach(function(value) {
            functionToModule[value].forEach(function(fun) {
                if(hashCode == fun) {
                    ret = value;
                }
            });
        });

        return ret;
    }
}

module.exports = new ModuleSecurity();