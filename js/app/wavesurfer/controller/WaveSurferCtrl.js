'use strict';

/**
 * 
 * @param {type} $scope scope
 */
function WaveSurferCtrl($scope, $modal, WaveSurferFactory) {
    //$scope.title = 'Wav surfer ui';
    //$scope.wavesurfer = WaveSurferFactory.getWaveSurfer();

    $scope.initWs = function() {
        //$scope.wavesurfer = WaveSurferFactory.initWaveSurfer();
    };

    $scope.loadFile = function() {
        console.log('load');
        //WaveSurferFactory.loadFile();
        /*var content = '';
        content += '<div class="row">';
        content += '    <div class="col-md-12">';
        content += '        <input type="file" id="myFile" accept="audio/mpeg">';
        content += '    </div>';
        content += '</div>';
        bootbox.dialog({
            message: content,
            title: "Choose a file to work on",
            buttons: {
                cancel: {
                    label: "Cancel",
                    className: "btn-default"
                },
                main: {
                    label: "OK",
                    className: "file-ok btn-primary",
                    callback: function() {
                        var selected_file = $('#myFile').get(0).files[0];
                        if (selected_file) {
                            // upload file to media folder
                            uploadFile(selected_file.name, selected_file, 'media/');
                            initUI();
                        }
                    }
                }
            }
        });
        // disable OK button while no file selected
        $('.file-ok').prop('disabled', true);
        $('#myFile').change(function() {
            $('.file-ok').prop('disabled', false);
        });*/
        var modal = $modal.open({
            templateUrl:'js/app/uploadmodal/partials/upload-file.html',
            controller: 'UploadModalCtrl'
        });
        modal.result.then(function(files) {
            console.log(files);
        });
    };

}