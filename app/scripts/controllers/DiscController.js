

angular.module("imagepoints").controller("DiscController", ['$scope', function($scope){

    $scope.minSpacing = 5;
    $scope.maxSpacing = 9;
    $scope.brightnessEffect = 1.5;

    $scope.generateDiscPoints = function() {

        $scope.main_canvas.width = $scope.main_canvas.width;

        discpoints_worker.postMessage({
            cmd: 'begin',
            image_data: $scope.image_data,
            searchRadiusInner: $scope.minSpacing,
            searchRadiusOuter: $scope.maxSpacing,
            brightnessToDepth: $scope.brightnessEffect
        });
    };


    $scope.handleWorkerMessage = function(e) {

        var data = e.data;

        switch (data.cmd) {

            case 'point_settled':
                $scope.drawPoint(data.point, "#fff", data.point.radius);
                break;

            case "complete":
                break;
        }
    };

    $scope.drawPoint = function(p, color, radius) {

        $scope.main_ctx.fillStyle = color;
        $scope.main_ctx.beginPath();
        $scope.main_ctx.arc(p.x, p.y, radius || .75, 0, Math.PI*2, true);
        $scope.main_ctx.closePath();
        $scope.main_ctx.fill();

    };

    discpoints_worker = new Worker('app/scripts/controllers/discpoints_worker.js?v=' + Math.random());
    discpoints_worker.addEventListener('message', $scope.handleWorkerMessage, false);

}]);


