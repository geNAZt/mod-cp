module.exports = function (logger) {
    "use strict";

    //Alle FormatPattern laden
    var pattern = {};
    require("fs").readdirSync(__dirname + "/pattern").forEach(function (file) {
        if (file.substr(0, 1) !== ".") {
            pattern[file.split(".")[0]] = require("./pattern/" + file)(logger);
        }
    });

    return pattern;
};