
angular.module('imagepoints').directive('ipLabeledSlider', function(){
    return {
        restrict: 'E',
        scope: {
            min: "@",
            max: "@",
            step: "@",
            value: "@",
            label: "@"
        },
        link: function(scope, element, attributes) {
            console.log(attributes);
            scope.min = attributes.min;
            scope.max = attributes.max;
            scope.step = attributes.step;
            scope.value = attributes.value;
            scope.label = element[0].innerText;
            console.log(element[0]);
        },
        templateUrl: 'app/scripts/directives/ipLabeledSlider.html'
    }
});

