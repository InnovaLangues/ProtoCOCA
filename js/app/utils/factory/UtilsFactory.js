'use strict';
function UtilsFactory($modal) {
    return {
        /**
         * Create a unique UUID
         * @returns string unique uuid
         */
        generateUUID: function() {
            return uuid.v4();
        },
        /**
         * Convert a number (125.25 in a hh:mm:ss:ms string)
         * @param {numeric} d
         * @returns {string} hh:mm:ss
         */
        secondsToHms: function(d) {
            d = Number(d);
            if (d > 0) {
                var hours = Math.floor(d / 3600);
                var minutes = Math.floor(d % 3600 / 60);
                var seconds = Math.floor(d % 3600 % 60);
                // ms
                var str = d.toString();
                var substr = str.split('.');
                var ms = substr[1].substring(0, 2);
                if (hours < 10) {
                    hours = "0" + hours;
                }
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                if (seconds < 10) {
                    seconds = "0" + seconds;
                }
                var time = hours + ':' + minutes + ':' + seconds + ':' + ms;
                return time;
            }
            else {

                return "00:00:00:00";
            }
        },
        xhr: function(url, data, callback) {
            var pmodal = null;
            var request = new XMLHttpRequest();
            request.onreadystatechange = function() {
                if (request.readyState === 4 && request.status === 200 && null !== pmodal) {
                    var response = JSON.parse(request.responseText);
                    callback(response);
                    // avoid firefox TypeError : n.get(...) is undefined 
                    window.setTimeout(function(){
                        pmodal.close();
                    }, 0);
                    
                }
            };
            // open modal
            pmodal = $modal.open({
                templateUrl: 'js/app/progress/partials/progress_1.html',
                controller: 'ProgressModalCtrl',
                backdrop: 'static'
            });
            request.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    $('.progress-bar').css('width', ((e.loaded / e.total) * 100) + '%');
                }
            };
            request.open('POST', url);
            request.send(data);
        }/*,
        xhr2: function(url, data, callback) {
            var request = new XMLHttpRequest();
            var progress = '';
            progress += '<div class="modal" id="pleaseWaitDialog" data-backdrop="static" data-keyboard="false">';
            progress += '<div class="modal-dialog">';
            progress += '<div class="modal-content">';
            progress += '   <div class="modal-header">';
            progress += '       <h1>Processing...</h1>';
            progress += '   </div>';
            progress += '   <div class="modal-body">';
            progress += '       <div class="progress progress-striped">';
            progress += '           <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">';
            progress += '           </div>';
            progress += '       </div>';
            progress += '   </div>';
            progress += '</div>';
            progress += '   </div>';
            progress += '</div>';
            $('body').append(progress);


            request.onreadystatechange = function() {
                if (request.readyState === 4 && request.status === 200) {
                    var response = JSON.parse(request.responseText);
                    callback(response);
                    $('.progress-bar').css('width', '0%');
                    $('#pleaseWaitDialog').modal('hide');
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
        }*/
    };

}


