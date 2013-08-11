function DashboardCtrl($scope, $session, $socket, $permission) {
    $scope.user = $session.get("user");

    var groups = $session.get("groups"), joinGroups = [];
    groups.forEach(function(value) {
        joinGroups.push(value.name);
    });

    $scope.user.joined_groups = joinGroups.join(", ");

    $scope.onlineChart = false;
    if($permission.hasPermission("server.user.online.chart")) {
        $scope.onlineChart = true;

        var options = {
            series: {
                lines: { show: true }
            },

            xaxis: {
                mode: "time",
                timezone: "browser",
                show: true,
                max: null
            },

            yaxis: {
                show: true,
                min: -1,
                max: null
            }
        };

        var data = {
            label: "Player",
            data: []
        };

        var plot = $.plot($('#playerOnlineCount'), [data], options);

        $socket.on('server:playerCount', function(d) {
            if(data.data.length > 300) {
                data.data.splice(0, 1);
            }

            data.data.push([(new Date()).getTime(), d]);

            plot.setData([data]);
            plot.setupGrid();
            plot.draw();
        });

        $socket.emit('server:getPlayerCount');

        $scope.$on("$destroy", function(){
            $socket.emit("server:getPlayerCount:disable");
        });
    }
}