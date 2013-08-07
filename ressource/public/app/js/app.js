

angular.
    module('modcp', ['pascalprecht.translate']).
    factory('$user', [function() {
        var sdo = {
            isLogged: false,
            username: ''
        };

        return sdo;
    }]).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'app/partials/login.html',
                controller: LoginCtrl
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