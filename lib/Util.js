var async = require('async');

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
            delete user.password;
            delete user.salt;

            return cb(null, {
                user: user,
                groups: groups,
                permissions: finalPermissions
            });
        });
    });
}.inject();