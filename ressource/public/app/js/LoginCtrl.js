function LoginCtrl($scope, $location, $user, $socket, $routeParams) {
    if($user.isLogged == true) {
        $location.path("dashboard");
    } else {
        if(typeof $routeParams.provider != "undefined") {
            $scope.selectedProvider = $routeParams.provider;
        }

        $socket.emit("login:getProvider", {}, function(provider) {
            $scope.providers = provider;
        });

        $scope.name = "ModCP";
    }
}