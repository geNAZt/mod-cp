/**
 * Created by geNAZt on 06.08.13.
 */
var express = require('express'),
    path = require('path'),
    cons = require('consolidate'),
    swig = require('swig');

module.exports = function(http$app, cb) {
    var publicPath = path.join(process.cwd(), 'ressource/public');
    var viewPath = path.join(process.cwd(), 'ressource/view')

    http$app.use(express.static(publicPath));

    http$app.engine('.html', cons.swig);
    http$app.set('view engine', 'html');

    var store = new express.session.MemoryStore();
    var secret = 'jfkldsjfhsdfhkl';

    http$app.use(express.cookieParser());
    http$app.use(express.session({store: store, secret: secret}));

    ModuleInjector.use("store", store);
    ModuleInjector.use("secret", secret);

    swig.init({
        root: viewPath,
        cache: false,
        allowErrors: true // allows errors to be thrown and caught by express instead of suppressed by Swig
    });

    http$app.set("views", viewPath);
    cb();
}