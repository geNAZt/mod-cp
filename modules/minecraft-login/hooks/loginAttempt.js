var request = require('request');

module.exports = function(db$schema, c$logger, user, cb) {
    request('http://login.minecraft.net/?user=' + user.email + '&password=' + user.password + '&version=13', function(error, response) {
        if(!error) {
            if(response.body == 'Bad login') {
                return cb(false);
            } else {
                var temp = response.body.split(":");

                db$schema.models.User.findOne({where: {mcname: temp[2]}}, function(err, model) {
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
            }
        } else {
            return cb(false);
        }
    });
};