'use strict';


function ProgressModalCtrl($scope, $modal, $modalInstance) {
    /*$scope.files = [];

    $scope.fileNameChanged = function(element) {

        $scope.$apply(function() {
            $scope.files = element.files;
            console.log('Ok' + $scope.files.length);
        });
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.ok = function() {
        $modalInstance.close($scope.files);
    };*/
    
    console.log('ctrl called');
    
    //console.log('url ' + url + ' data ' + data + ' callback ' + callback);

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
            var response = JSON.parse(request.responseText);
            callback(response);
            $('.progress-bar').css('width', '0%');
            // $('#pleaseWaitDialog').modal('hide');
            $modalInstance.dismiss('cancel');
        }
    };

    // open modal progress window
    $('#pleaseWaitDialog').modal();
    request.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            $('.progress-bar').css('width', ((e.loaded / e.total) * 100) + '%');
        }
    };
    request.open('POST', url);
    request.send(data);
}

