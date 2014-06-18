
angular.module("imagepoints").controller("GridController", ['$scope', function($scope){

    $scope.blockSize = 10;
    $scope.holeSize = 10;

    $scope.generateGridPoints = function() {

        $scope.clearPoints();

        $scope.currentRow = 0;
        $scope.currentJobNo = (new Date).getTime();

        $scope.updateNextRowPoints();
    };


    $scope.handleWorkerMessage = function(e) {

        var data = e.data;
        if (data.jobno != $scope.currentJobNo) return;

        switch (data.cmd) {

            case 'row_processed':
                $scope.drawRowPoints(data.rowPoints);
                break;
        }
    };

    $scope.updateNextRowPoints = function() {

        console.log('updateNextRowPoints() ' + $scope.currentRow + ', ' + $scope.currentJobNo);
        var row_data = $scope.image_canvas_ctx.getImageData(0, $scope.currentRow * $scope.blockSize, $scope.image_canvas_ctx.canvas.width, $scope.blockSize).data;

        $scope.imagepoints_worker.postMessage({
            'cmd': 'find_row_brightness',
            'jobno': $scope.currentJobNo,
            'img_data': row_data,
            'width': $scope.image_canvas_ctx.canvas.width,
            'blockSize': $scope.blockSize
        });

    };


    $scope.drawRowPoints = function(points) {

        console.log('finished row ' + $scope.currentRow);

        var xBlocks = $scope.image_canvas_ctx.canvas.width / $scope.blockSize;

        for (var x = 0; x < xBlocks; x++) {

            var d = points[x];

            var p = {
                x: x * $scope.blockSize,
                y: $scope.currentRow * $scope.blockSize,
                radius: d * $scope.holeSize
            };
            $scope.drawPoint(p, '#fdc');
        }

        $scope.currentRow++;

        var yBlocks = $scope.image_canvas_ctx.canvas.height / $scope.blockSize;
        if ($scope.currentRow < yBlocks) {
            $scope.updateNextRowPoints();
        }
    };



    $scope.imagepoints_worker = new Worker('app/scripts/controllers/gridpoints_worker.js?v=' + Math.random());
    $scope.imagepoints_worker.addEventListener('message', $scope.handleWorkerMessage, false);

}]);
