

angular.module("imagepoints").controller("DiscController", ['$scope', function($scope){

    $scope.minSpacing = 5;
    $scope.maxSpacing = 9;
    $scope.brightnessEffect = 1.5;

    $scope.generateDiscPoints = function() {

        $scope.clearPoints();

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
                $scope.drawPoint(data.point, "#fff");
                break;

            case "complete":
                break;
        }
    };

    discpoints_worker = new Worker('app/scripts/controllers/discpoints_worker.js?v=' + Math.random());
    discpoints_worker.addEventListener('message', $scope.handleWorkerMessage, false);

}]);


