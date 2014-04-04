'use strict';

/**
 * WaveSurferFactory
 */
function WaveSurferFactory(UtilsFactory) {
    var wavesurfer = Object.create(WaveSurfer);
    var timeline;
    var audioSrcUrl = '';
    var currentAudioId;
    var options;
    var maxZoom = 50;
    var minZoom = 13;

    var progressDiv;
    var progressBar;

    var utils = UtilsFactory.getUtil();

    return {
        initWaveSurfer: function() {
            var options = {
                container: document.querySelector('#waveform'),
                waveColor: 'lightgrey',
                progressColor: 'black',
                loaderColor: 'purple',
                cursorColor: 'navy',
                markerWidth: 1,
                minPxPerSec: minZoom
            };

            //wavesurfer.init(options);
            //wavesurfer.load('media/demo_jpp.mp3');

            // Wavesurfer Progress bar
            progressDiv = document.querySelector('#progress-bar');
            progressBar = progressDiv.querySelector('.progress-bar');


            wavesurfer.on('loading', function(percent, xhr) {
                progressDiv.style.display = 'block';
                progressBar.style.width = percent + '%';
            });

            // Won't work on iOS until you touch the page
            wavesurfer.on('ready', function() {
                progressDiv.style.display = 'none';
                // init time-text with current time
                $('#time').text(utils.secondsToHms(wavesurfer.backend.getCurrentTime()));
                // TIMELINE
                // avoid creating timeline object twice (after drag&drop for example)
                if (timeline) {
                    $('#wave-timeline wave').remove();
                }
                else {
                    // create timeline object
                    timeline = Object.create(WaveSurfer.Timeline);
                }

                timeline.init({
                    wavesurfer: wavesurfer,
                    container: '#wave-timeline'
                });

                /*if (isEditing) {
                 drawMarkerCollection(segments);
                 }*/

            });
            // listen to progress event
            wavesurfer.on('progress', function() {
                $('#time').text(utils.secondsToHms(wavesurfer.backend.getCurrentTime()));
            });
            // hide wavesurfer progress bar
            progressDiv.style.display = 'none';
            $('#waveform wave').remove();
            return wavesurfer;
        },
        showWaveForm: function(url) {
            $('#waveform wave').remove();
            wavesurfer.init(options);
            $('#no-file').css('display', 'none');
            wavesurfer.load(url);
        },
        showBeginPanel: function() {
            $('#waveform wave').remove();
            $('#no-file').css('display', '');
            progressDiv = document.querySelector('#progress-bar');
            progressDiv.style.display = 'none';
            console.log(wavesurfer.backend.getCurrentTime());
            $('#time').text(utils.secondsToHms(wavesurfer.backend.getCurrentTime()));
        }
    };
}

