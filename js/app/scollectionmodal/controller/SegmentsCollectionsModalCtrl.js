'use strict';


function SegmentsCollectionsModalCtrl($scope, $modalInstance, collections, current) {
    // list of project
    $scope.collections = collections;
    // project currently selected
    $scope.current = current;
    $scope.source = {
        selected: {}
    };
    
    $scope.handleChange = function(){
         $scope.result = angular.fromJson($scope.source.selected);
    };
    
   
    
    /*$scope.$watch('source.selected', function(newValue, oldValue) {
        console.log(newValue, oldValue);
    });*/
    
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.ok = function() {
        //var result = {};
        //result = angular.fromJson($scope.source.selected);
        $modalInstance.close($scope.result);
    };
}

