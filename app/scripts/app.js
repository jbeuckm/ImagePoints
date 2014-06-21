

var app = angular.module("imagepoints", ['mgcrea.ngStrap']).config(function(){

});


angular.module("imagepoints").controller("ImagepointsController", ['$scope', function($scope){

    $scope.main_canvas = angular.element('#main-canvas').get(0);
    $scope.main_ctx = $scope.main_canvas.getContext("2d");

    $scope.imageUrl = "img/child.jpg";
    $scope.showImage = true;

    $scope.outputWidth = 10;
    $scope.outputHeight = 10;
    $scope.holes = [];

    $scope.clearPoints = function() {
        $scope.main_canvas.width = $scope.main_canvas.width;

        $scope.holes = [];
    };

    $scope.loadImage = function() {
        var url;

        if ($scope.useProxy) {
            url = 'ba-simple-proxy.php?mode=native&url=' + $scope.imageUrl;
        }
        else {
            url = $scope.imageUrl;
        }

        // update stage when image data is available to display
        var img = angular.element('#main-image').get(0);
        img.onload = $scope.handleImageLoaded;
        img.src = url;

    };


    $scope.handleImageLoaded = function() {

        var img = this;

        console.log('loaded image ' + img.width + ', ' + img.height);

        $scope.main_canvas.width = img.width;
        $scope.main_canvas.height = img.height;

        angular.element("#black-background").width(img.width).height(img.height);

        var image_canvas = angular.element('<canvas width="' + img.width + '" height="' + img.height + '"></canvas>');
        $scope.image_canvas_ctx = angular.element(image_canvas).get(0).getContext("2d");
        $scope.image_canvas_ctx.drawImage(img, 0, 0);

        $scope.image_data = $scope.image_canvas_ctx.getImageData(0, 0, img.width, img.height);
        $scope.outputWidth = 10;

    };

    $scope.$watch("outputWidth", function(newValue, oldValue){

        if (!$scope.image_canvas_ctx) return;

        var ratio = $scope.image_canvas_ctx.canvas.height / $scope.image_canvas_ctx.canvas.width;

        $scope.outputHeight = newValue * ratio;
    });
    $scope.$watch("outputHeight", function(newValue, oldValue){

        if (!$scope.image_canvas_ctx) return;

        var ratio = $scope.image_canvas_ctx.canvas.height / $scope.image_canvas_ctx.canvas.width;

        $scope.outputWidth = newValue / ratio;
    });

    $scope.drawPoint = function(p, color) {

        $scope.main_ctx.fillStyle = color || '#fff';
        $scope.main_ctx.beginPath();
        $scope.main_ctx.arc(p.x, p.y, p.radius || .75, 0, Math.PI*2, true);
        $scope.main_ctx.closePath();
        $scope.main_ctx.fill();

        $scope.holes.push(p);
    };

    $scope.DEPTH_THRESHOLD = .001;

    $scope.generateGcode = function() {

        var gcode = "g20 g90 f60\n";
        gcode += "g00z0.125\n";

//  var coefficientOfDepth = 1.733; // 60 degree bit
        var coefficientOfDepth = 1; // 90 degree bit

        var blockSpacing = $scope.outputWidth / $scope.image_canvas_ctx.canvas.width;

        for (var i = 0, l=$scope.holes.length; i<l; i++) {

            var p = $scope.holes[i];

            var depth = blockSpacing * coefficientOfDepth * p.radius;

            if (depth > $scope.DEPTH_THRESHOLD) {
                gcode += "g00x" + (blockSpacing * p.x).toPrecision(4) + "y-" + (blockSpacing * p.y).toPrecision(4) + "\n";
                gcode += "g01z-" + (depth).toPrecision(4) + "\n";
                gcode += "g00z0.125\n";
            }
        }

        var data = "application/text;charset=utf-8," + encodeURIComponent(gcode);
        var gcode_url = "data:" + data;

        $scope.downloadWithName(gcode_url, "imagepoints.nc");
    };

    $scope.downloadWithName = function(uri, name) {

        function eventFire(el, etype){
            if (el.fireEvent) {
                (el.fireEvent('on' + etype));
            } else {
                var evObj = document.createEvent('Events');
                evObj.initEvent(etype, true, false);
                el.dispatchEvent(evObj);
            }
        }

        var link = document.createElement("a");
        link.download = name;
        link.href = uri;
        eventFire(link, "click");

    };

}]);


