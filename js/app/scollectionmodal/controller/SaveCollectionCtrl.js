'use strict';

function SaveCollectionCtrl ($scope, $modalInstance, current){
    
    // project currently selected
    $scope.current = current;
    
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.ok = function() {
        $modalInstance.close($scope.current);
    };
}

