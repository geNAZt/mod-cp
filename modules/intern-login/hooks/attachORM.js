module.exports = function(db$schema, cb) {
    db$schema.define('User', {
        email: { type: String, length: 255 },
        password: { type: String, length: 255 },
        salt: { type: String, length: 255 },
        mcname: { type: String, length: 255 }
    });

    db$schema.define('Group', {
        name: String
    });

    //User.hasMany(Post,   {as: 'posts',  foreignKey: 'userId'});
    cb();
}