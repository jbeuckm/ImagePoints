
angular.module("imagepoints").controller("GridController", ['$scope', function($scope){

    $scope.blockSize = 10;
    $scope.holeSize = 10;

    $scope.generateGridPoints = function() {
        $scope.resetGridPoints();
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

        $scope.holes[$scope.currentRow] = new Array();

        console.log('finished row ' + $scope.currentRow);


        var xBlocks = $scope.image_canvas_ctx.canvas.width / $scope.blockSize;

        for (var x = 0; x < xBlocks; x++) {

            var d = points[x];

            $scope.main_ctx.fillStyle = '#fdc';
            $scope.main_ctx.beginPath();
            $scope.main_ctx.arc(x * $scope.blockSize, $scope.currentRow * $scope.blockSize, d * $scope.holeSize, 0, Math.PI*2, true);
            $scope.main_ctx.closePath();
            $scope.main_ctx.fill();

            $scope.holes[$scope.currentRow][x] = d * $scope.holeSize;
        }

        $scope.currentRow++;

        var yBlocks = $scope.image_canvas_ctx.canvas.height / $scope.blockSize;
        if ($scope.currentRow < yBlocks) {
            $scope.updateNextRowPoints();
        }
    };


    $scope.resetGridPoints = function() {
        $scope.currentRow = 0;
        $scope.holes = new Array();
        $scope.currentJobNo = (new Date).getTime();
    };


    $scope.finalWidthSlide = function() {
        var cols = holes.length;
        var rows = holes[0].length;
        var blockSpacing = finalWidthSlider.slider('value') / cols;
        console.log(cols, rows);

        $('#final-width-value').val(cols * blockSpacing);
        $('#final-height-value').val(rows * blockSpacing);
    };

    $scope.DEPTH_THRESHOLD = .001;

    $scope.generateGcode = function() {

        var gcode = "g20 g90 f60\n";
        gcode += "g00z0.125\n";

//  var coefficientOfDepth = 1.733; // 60 degree bit
        var coefficientOfDepth = 1; // 90 degree bit

        var rows = $scope.holes.length;
        var cols = $scope.holes[0].length;
        var blockSpacing = finalWidthSlider.slider('value') / cols;

        for (var row = 0; row < rows; row++) {
            for (var col = 0; col < cols; col++) {

                // use radius scale from visual image with physical block spacing
                var radius = $scope.holes[row][col] / $scope.blockSize * blockSpacing;

                var depth = coefficientOfDepth * radius;

                if (depth > $scope.DEPTH_THRESHOLD) {
                    gcode += "g00x" + (blockSpacing * col).toPrecision(4) + "y-" + (blockSpacing * row).toPrecision(4) + "\n";
                    gcode += "g01z-" + (depth).toPrecision(4) + "\n";
                    gcode += "g00z0.125\n";
                }
            }
        }

//    $('#g-code').text(gcode);
        var data = "application/text;charset=utf-8," + encodeURIComponent(gcode);
        var gcode_url = "data:" + data;
//    window.open(gcode_url);

        $scope.downloadWithName(gcode_url, "imagepoints.nc");
    };

    $scope.imagepoints_worker = new Worker('scripts/gridpoints_worker.js?v=' + Math.random());
    $scope.imagepoints_worker.addEventListener('message', $scope.handleWorkerMessage, false);

}]);
