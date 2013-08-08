function LoginCtrl($scope, $location, $user, $socket, $routeParams, $http) {
    if($user.isLogged == true) {
        $location.path("dashboard");
    } else {
        if(typeof $routeParams.provider != "undefined") {
            $scope.selectedProvider = $routeParams.provider;
        } else {
            $scope.selectedProvider = "intern";
        }

        $socket.emit("login:getProvider", {}, function(provider) {
            $scope.providers = provider;
        });

        $scope.name = "ModCP";

        $scope.login = function(user) {
            user.provider = $scope.selectedProvider;
            $socket.emit("login:loginAttempt", user, function(result) {

            });
        }
    }
}