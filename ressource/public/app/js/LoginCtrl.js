function LoginCtrl($scope, $location, $user, $socket) {
    if($user.isLogged == true) {
        $location.path("dashboard");
    } else {
        $socket.emit("login:getProvider", {}, function(provider) {
            $scope.providers = provider;
        });

        $scope.name = "ModCP";
    }
}