
var main_canvas, main_ctx, image_canvas, image_canvas_ctx;
var image_data;


var app = angular.module("imagepoints", []).config(function(){

});


angular.module("imagepoints").controller("ImagepointsController", ['$scope', function($scope){

    main_canvas = $('#main-canvas').get(0);
    main_ctx = main_canvas.getContext("2d");

    $scope.imageUrl = "img/child.jpg";
    $scope.outputWidth = 10;
    $scope.showImage = true;


    $scope.loadImage = function() {
        var url;

        if ($('#use-proxy').is(':checked')) {
            url = 'ba-simple-proxy.php?mode=native&url=' + $scope.imageUrl;
        }
        else {
            url = $scope.imageUrl;
        }

        // update stage when image data is available to display
        var img = $('#main-image').get(0);
        img.onload = $scope.handleImageLoaded;
        img.src = url;

    };


    $scope.handleImageLoaded = function() {

        var img = this;

        console.log('loaded image ' + img.width + ', ' + img.height);

        $("#black-background").width(img.width).height(img.height);

        image_canvas = $('<canvas width="' + img.width + '" height="' + img.height + '"></canvas>');
        image_canvas_ctx = $(image_canvas).get(0).getContext("2d");
        image_canvas_ctx.drawImage(img, 0, 0);

        image_data = image_canvas_ctx.getImageData(0, 0, img.width, img.height);

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


