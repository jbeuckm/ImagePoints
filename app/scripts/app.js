
var app = angular.module("imagepoints", []).config(function(){

});


angular.module("imagepoints").controller("ImagepointsController", ['$scope', function($scope){

    main_canvas = $('#main-canvas').get(0);
    main_ctx = main_canvas.getContext("2d");

    $scope.outputWidth = 10;


    $scope.loadImage = function() {
        var url;

        if ($('#use-proxy').is(':checked')) {
            url = 'ba-simple-proxy.php?mode=native&url=' + $('#image-url').val();
        }
        else {
            url = $('#image-url').val();
        }

        // update stage when image data is available to display
        var img = $('#main-image').get(0);
        img.onload = handleImageLoaded;
        img.src = url;

    };


    $scope.outputGcode = function() {
        alert('hi');
    };

}]);


