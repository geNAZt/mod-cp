function writer(line, cb) {
    process.stdout.write(line +"\n", function() {
        cb();
    });
}

module.exports = function (cb) {
    "use strict";

    cb();
    return writer;
};