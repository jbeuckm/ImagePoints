
angular.module('imagepoints').directive('ipLabeledSlider', function(){
    return {
        restrict: 'E',
        link: function(scope, element, attributes) {
            console.log(attributes);
        },
        templateUrl: 'app/scripts/directives/ipLabeledSlider.html'
    }
});

