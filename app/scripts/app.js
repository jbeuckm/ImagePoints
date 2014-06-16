
var app = angular.module("imagepoints", []).config(function(){

});

angular.module("imagepoints").controller("OutputController", ['$scope', function($scope){

    $scope.outputWidth = 10;

    $scope.outputGcode = function() {
        alert('hi');
    };

}]);


