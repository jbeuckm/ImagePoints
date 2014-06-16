

angular.module("imagepoints").controller("DiscController", ['$scope', function($scope){

    $scope.minSpacing = 5;
    $scope.maxSpacing = 9;
    $scope.brightnessEffect = 1.5;

    $scope.generateDiscPoints = function() {

        main_canvas.width = main_canvas.width;

        discpoints_worker.postMessage({
            cmd: 'begin',
            image_data: image_data,
            searchRadiusInner: $scope.minSpacing,
            searchRadiusOuter: $scope.maxSpacing,
            brightnessToDepth: $scope.brightnessEffect
        });
    };


    $scope.handleWorkerMessage = function(e) {

        var data = e.data;

        switch (data.cmd) {

            case 'point_settled':
                drawPoint(data.point, "#fff", data.point.radius);
                break;

            case "complete":
                break;
        }
    };

    $scope.drawPoint = function(p, color, radius) {

        main_ctx.fillStyle = color;
        main_ctx.beginPath();
        main_ctx.arc(p.x, p.y, radius || .75, 0, Math.PI*2, true);
        main_ctx.closePath();
        main_ctx.fill();

    };

    discpoints_worker = new Worker('scripts/discpoints_worker.js?v=' + Math.random());
    discpoints_worker.addEventListener('message', $scope.handleWorkerMessage, false);

}]);


