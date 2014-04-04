'use strict';

angular.module('WaveSurferDirective', [])
        .value('myWaveSurferConfig', {})
        .directive('myWaveSurfer', ['myWaveSurferConfig', 'UtilsFactory', function(myWaveSurferConfig, UtilsFactory) {

                var wavesurfer = Object.create(WaveSurfer);
                var timeline;
                var audioSrcUrl = '';
                var audioId;
                var maxZoom = 50;
                var minZoom = 13;
                var utils = UtilsFactory.getUtil();
                var progressDiv;
                var progressBar;

                // Set some default options
                var options = {
                    container: '#waveform',
                    waveColor: 'lightgrey',
                    progressColor: 'black',
                    loaderColor: 'purple',
                    cursorColor: 'navy',
                    markerWidth: 1,
                    minPxPerSec: minZoom
                };

                myWaveSurferConfig = myWaveSurferConfig || {};
                
                //console.log(myWaveSurferConfig);

                // Merge default config with user config
                angular.extend(options, myWaveSurferConfig);

                return {
                    restrict: "A",
                    scope:{
                        url:'=url',
                        fid:'=fid'
                    },
                    link: function($scope, el, attrs) {
                        var $container = document.querySelector('#waveform');
                        
                        // Reinject jQuery object into Picker config
                        options.container = $container;

                        // Wavesurfer Progress bar
                        progressDiv = document.querySelector('#progress-bar');
                        progressBar = progressDiv.querySelector('.progress-bar');

                        wavesurfer.init(options);
       
                        //console.log($scope.url + ' ' + $scope.fid);
                        
                       /* var test = $scope.$eval(attrs.myWaveSurfer);
                         console.log(test);*/
                 
                        audioSrcUrl = $scope.url;
                        audioId = $scope.fid;
                        
                        wavesurfer.load(audioSrcUrl);
                        
                        //console.log(utils);
                        
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
                        });
                        // listen to progress event
                        wavesurfer.on('progress', function() {
                            $('#time').text(utils.secondsToHms(wavesurfer.backend.getCurrentTime()));
                        });
                        // hide wavesurfer progress bar
                        progressDiv.style.display = 'none';
                    },
                    templateUrl: 'js/app/wavesurfer/partials/wave.html'
                };
            }]);


