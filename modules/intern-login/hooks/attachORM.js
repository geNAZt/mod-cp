module.exports = function(db$schema, cb) {
    var User = db$schema.define('User', {
        email: { type: String, length: 255 },
        password: { type: String, length: 255 },
        salt: { type: String, length: 255 },
        mcname: { type: String, length: 255 }
    });

    var Group = db$schema.define('Group', {
        name: String
    });

    var Permission = db$schema.define('Permission', {
        name: String
    });

    User.hasAndBelongsToMany(Group, {as: 'groups', foreignKey: 'groupId'});
    Permission.hasAndBelongsToMany(Group);

    cb();
}