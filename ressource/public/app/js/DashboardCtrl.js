function DashboardCtrl($scope, $session, $socket) {
    $scope.user = $session.get("user");


    var groups = $session.get("groups"), joinGroups = [];
    groups.forEach(function(value) {
        joinGroups.push(value.name);
    });

    $scope.user.joined_groups = joinGroups.join(", ");

    $('.dropdown-toggle').dropdown()
}