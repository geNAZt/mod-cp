var async = require('async');
var crypto = require('crypto');
var randString = require('random-string');

module.exports.generatePasswordHash = function(password, cb) {
    var shasum = crypto.createHash('sha512');
    var salt = randString({length: 48});

    password = salt + password;
    shasum.update(password);

    var hash = shasum.digest('hex');

    cb(salt, hash);
};

module.exports.hasPermission = function(permissions, permission) {
    for(var i = 0; i < permissions.length; i++) {
        var per = permissions[i];

        if(per.substr(per.length - 1, 1) == "*") {
            if(permission.indexOf(per.replace("*", "")) == 0) {
                return true;
            }
        } else {
            if(permission === per) {
                return true;
            }
        }
    }

    return false;
};

module.exports.getFullUser = function(db$schema, user, cb) {
    user.groups(function(err, groups) {
        if(err) {
            return cb(err);
        }

        function loadPermission(group, acb) {
            group.permissions(function(err, permissions) {
                acb(err, permissions);
            });
        }

        return async.map(groups, loadPermission, function(err, result) {
            if(err) {
                return cb(err);
            }

            var unsortedPermissions = [];
            result.forEach(function(group) {
                group.forEach(function(per) {
                    if(!unsortedPermissions.contains(per.name)) {
                        unsortedPermissions.push(per.name);
                    }
                });
            });

            var permissions = [];

            unsortedPermissions.sort().forEach(function(per) {
                if(!module.exports.hasPermission(permissions, per)) {
                    permissions.push(per);
                }
            });

            var finalPermissions = [];
            permissions.forEach(function(per) {
                if(per.substr(0, 1) != "-") {
                    if(!module.exports.hasPermission(permissions, "-" + per)) {
                        finalPermissions.push(per);
                    }
                }
            });

            permissions = null;
            unsortedPermissions = null;

            var newUser = {};
            newUser.email = user.email;
            newUser.mcname = user.mcname;

            return cb(null, {
                user: newUser,
                groups: groups,
                permissions: finalPermissions
            });
        });
    });
}.inject();