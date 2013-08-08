angular.
    module('modcp', ['pascalprecht.translate','webStorageModule']).
    factory('$session', function(webStorage) {
        var session = {
            get: function(key) {
                return webStorage.get("session:" + key);
            },

            add: function(key, value) {
                return webStorage.add("session:" + key, value);
            },

            remove: function(key) {
                return webStorage.remove("session:" + key);
            }
        };

        if(typeof session.get("isLogged") == "undefined") session.add("isLogged", false);

        return session;
    }).
    factory('$socket', function ($rootScope) {
        var socket = io.connect();

        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        };
    }).
    run(function ($rootScope, $location, $session) {
        $rootScope.$on('$routeChangeStart', function(event, currRoute) {
            if (typeof currRoute.access != "undefined" && !currRoute.access.isFree && !$session.get("isLogged")) {
                $location.path("/");
            }
        });
    }).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'app/partials/login.html',
                controller: "LoginCtrl",
                access: {
                    isFree: true
                }
            }).
            when('/login/:provider', {
                templateUrl: 'app/partials/login.html',
                controller: "LoginCtrl",
                access: {
                    isFree: true
                }
            }).
            when('/dashboard', {
                templateUrl: 'app/partials/dashboard.html',
                controller: "DashboardCtrl",
                access: {
                    isFree: false
                }
            }).
            otherwise({
                redirectTo: '/'
            });
    }]).
    config(['$translateProvider', function ($translateProvider) {
        var lang, androidLang;
        // works for earlier version of Android (2.3.x)
        if (navigator && navigator.userAgent && (androidLang = navigator.userAgent.match(/android.*\W(\w\w)-(\w\w)\W/i))) {
            lang = androidLang[1];
        } else {
            // works for iOS and Android 4.x
            lang = navigator.userLanguage || navigator.language;
        }

        $translateProvider.useStaticFilesLoader({
            prefix: 'app/lang/',
            suffix: '.json'
        });

        $translateProvider.preferredLanguage(lang);
        $translateProvider.fallbackLanguage('en_US');
    }]);