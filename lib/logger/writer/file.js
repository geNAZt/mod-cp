var fs = require('fs');

function FileWriter($logger, $config, cb) {
    "use strict";

    var currentFile = $config.get("./config.json").get("logger:folder") + "/" + process.pid + ".log",
        writeStream = fs.createWriteStream(currentFile),
        rotate = 0,
        maxSize = 1024 * 1024 * 1024,
        checkCount = 0;

    function fileWriterListener(line) {
        writeStream.write(line + "\n");

        if (++checkCount === 100) {
            checkCount = 0;

            fs.stat(currentFile, function (err, stats) {
                if (stats.size > maxSize) {
                    writeStream.end();
                    currentFile = $config.get("./config.json").get("logger:folder") + "/" + process.pid + "-" + rotate + ".log";
                    writeStream = fs.createWriteStream(currentFile);
                    rotate += 1;
                }
            });
        }
    }

    //Auf Lines reagieren, wenn diese vom Logger kommen
    $logger.on('newLine', fileWriterListener);

    this.destroy = function() {
        $logger.debug("Destroy File Writer");
        $logger.removeListener('newLine', fileWriterListener);
        writeStream.end();
    };

    process.nextTick(function() {
        $logger.debug("Added File Writer");
        cb();
    });
}

module.exports = function (cb) {
    "use strict";

    return new (FileWriter.inject())(cb);
};