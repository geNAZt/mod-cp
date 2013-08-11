module.exports = function (db$schema, cb) {
    db$schema.define('JSONAPI', {
        name: { type: String, length: 255 },
        host: { type: String, length: 255 },
        port: { type: Number },
        user: { type: String, length: 255 },
        password: { type: String, length: 255 },
        salt: { type: String, length: 255 }
    });

    cb();
};