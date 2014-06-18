

var app = angular.module("imagepoints", []).config(function(){

});


angular.module("imagepoints").controller("ImagepointsController", ['$scope', function($scope){

    $scope.main_canvas = angular.element('#main-canvas').get(0);
    $scope.main_ctx = $scope.main_canvas.getContext("2d");

    $scope.imageUrl = "img/child.jpg";
    $scope.outputWidth = 10;
    $scope.showImage = true;


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

        angular.element("#black-background").width(img.width).height(img.height);

        var image_canvas = angular.element('<canvas width="' + img.width + '" height="' + img.height + '"></canvas>');
        $scope.image_canvas_ctx = angular.element(image_canvas).get(0).getContext("2d");
        $scope.image_canvas_ctx.drawImage(img, 0, 0);

        $scope.image_data = $scope.image_canvas_ctx.getImageData(0, 0, img.width, img.height);

    };


    $scope.outputGcode = function() {
        alert('hi');
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


