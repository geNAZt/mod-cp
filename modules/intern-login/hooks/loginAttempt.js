var request = require('request');

module.exports = function(db$schema, c$logger, user, cb) {
    db$schema.models.User.findOne({where: {email: user.email}}, function(err, model) {
                    if(err) {
                        c$logger.warn("DB Error: ", err);
                        return cb(false);
                    }

                    if(model == null) {
                        return cb(false);
                    } else {
                        return model.groups(function(err, groups) {
                            if(err) {
                                c$logger.warn("DB Error: ", err);
                                return cb(false);
                            }

                            return cb({
                                user: model,
                                groups: groups
                            });
                        });
                    }
                });

};