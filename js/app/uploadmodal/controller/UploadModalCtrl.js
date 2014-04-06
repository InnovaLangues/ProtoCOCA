'use strict';


function UploadModalCtrl($scope, $modalInstance) {
    $scope.files = [];

    $scope.fileNameChanged = function(element) {        

        $scope.$apply(function() {
            $scope.files = element.files;
        });
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.ok = function() {
        $modalInstance.close($scope.files);
    };
}

