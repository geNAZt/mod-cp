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

        var data = [{
            label: "Player",
            data: []
        }];

        var plot = $.plot($('#playerOnlineCount'), data, options);

        function getLabel(label) {
            for(var i = 0; i < data.length; i++) {
                if(data[i].label === label) {
                    return i;
                }
            }

            return false;
        }

        var newDataPoints = {};
        $socket.on('server:playerCount', function(d) {
            if(typeof newDataPoints[d.name] != "undefined") {
                console.log("Got more data than i should get");
            } else {
                newDataPoints[d.name] = d.playerCount;
            }
        });

        var redrawInterval = setInterval(function() {
            var tempNewData = newDataPoints;
            newDataPoints = {};

            var time = (new Date()).getTime();

            tempNewData['Dummy #1'] = Math.random()*1000;

            Object.keys(tempNewData).forEach(function(value) {
                var labelIndex = getLabel(value);

                if(labelIndex === false) {
                    var overallIndex = getLabel("Player");
                    var newLabel = {
                        label: value,
                        data: []
                    };

                    for(var i = 0; i < data[overallIndex].data.length; i++) {
                        newLabel.data.push(data[overallIndex].data[i][0], -1);
                    }

                    labelIndex = data.push(newLabel) - 1;
                }

                if(data[labelIndex].data.length > 300) {
                    data[labelIndex].data.splice(0, 1);
                }

                data[labelIndex].data.push([time, tempNewData[value].playerCount]);
            });

            var overallPlayer = 0;

            data.forEach(function(value) {
                if(value.label != "Player" && value.data[value.data.length - 1][1] != -1) {
                    overallPlayer += value.data[value.data.length - 1][1];
                }
            });

            var labelIndex = getLabel("Player");
            if(data[labelIndex].data.length > 300) {
                data[labelIndex].data.splice(0, 1);
            }

            data[labelIndex].data.push([time, overallPlayer]);

            plot.setData(data);
            plot.setupGrid();
            plot.draw();
        }, 1000);

        $socket.emit('server:getPlayerCount');

        $scope.$on("$destroy", function(){
            $socket.emit("server:getPlayerCount:disable");
            clearInterval(redrawInterval);
        });
    }
}