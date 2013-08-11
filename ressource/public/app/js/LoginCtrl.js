function LoginCtrl($scope, $location, $session, $socket) {
    if($session.get("isLogged") == true) {
        $location.path("dashboard");
    } else {
        $scope.selectedProvider = "intern";
        $scope.lostPass = true;

        $socket.emit("login:getProvider", {}, function(provider) {
            $scope.providers = provider;
        });

        $scope.name = "ModCP";
        $scope.user = {};

        $scope.changeProvider = function(newProvider) {
            $scope.selectedProvider = newProvider;
            $scope.lostPass = ($scope.selectedProvider == "intern");
        };

        $scope.login = function(user) {
            user.provider = $scope.selectedProvider;
            $socket.emit("login:loginAttempt", user, function(result) {
                if(result == false) {
                    $scope.user.error = true;
                    $scope.user.invalid = true;
                } else {
                    $session.add("user", result.user);
                    $session.add("isLogged", true);
                    $session.add("groups", result.groups);
                    $session.add("permissions", result.permissions);

                    $location.path("dashboard");
                }
            });
        }

        $scope.reset = function() {
            $scope.user.error = false;
            $scope.user.invalid = false;
        }
    }
}