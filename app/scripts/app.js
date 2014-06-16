
var app = angular.module("imagepoints", []).config(function(){

});

app.controller("GridController", ['$scope', function($scope){
    $scope.blockSize = 10;
    $scope.holeSize = 10;
}]);

app.controller("DiscController", ['$scope', function($scope){
    $scope.minSpacing = 5;
    $scope.maxSpacing = 9;
    $scope.brightnessEffect = 1.5;
}]);


