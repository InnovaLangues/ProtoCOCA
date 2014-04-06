'use strict';

angular.module('WaveSurferDirective', [])
        .value('myWaveSurferConfig', {})
        .directive('myWaveSurfer', ['myWaveSurferConfig', 'UtilsFactory', 'WaveSurferFactory', function(myWaveSurferConfig, UtilsFactory, WaveSurferFactory) {

                var wavesurfer = Object.create(WaveSurfer);
                var maxZoom = 50;
                var minZoom = 13;
                var timeline;

                // Set some default options
                var options = {
                    waveColor: 'lightgrey',
                    progressColor: 'black',
                    loaderColor: 'purple',
                    cursorColor: 'navy',
                    markerWidth: 2,
                    minPxPerSec: minZoom
                };

                myWaveSurferConfig = myWaveSurferConfig || {};

                // Merge default config with user config
                angular.extend(options, myWaveSurferConfig);

                return {
                    restrict: "AE",
                    scope: {
                        myFile:'=file',
                        myWs:'@'
                    }, // isolated scope
                    link: function($scope, el, attrs) {

                        $scope.$emit('wsLoading');

                        var $container = document.querySelector('#waveform');
                        // Reinject jQuery object into wavesurfer config
                        options.container = $container;

                        // Wavesurfer Progress bar
                        var progressDiv = document.querySelector('#progress-bar');
                        var progressBar = progressDiv.querySelector('.progress-bar');

                        wavesurfer.init(options);
                        wavesurfer.load($scope.myFile.url);

                        wavesurfer.on('loading', function(percent, xhr) {
                            progressDiv.style.display = 'block';
                            progressBar.style.width = percent + '%';
                        });

                        // Won't work on iOS until you touch the page
                        wavesurfer.on('ready', function() {
                            progressDiv.style.display = 'none';

                            // TIMELINE
                            // avoid creating timeline object twice (after uploading a new file for example)
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
                            
                            $scope.$apply(function() {
                                $scope.time = UtilsFactory.secondsToHms(wavesurfer.backend.getCurrentTime());
                            });

                            // HERE :: STRANGE BEHAVIOR emit is called twice but only when i upload a second file
                            /*if($scope.$parent){
                                $scope.$parent.wsInstance = wavesurfer;
                                console.log('parent');
                            }
                            else{
                                $scope.wsInstance = wavesurfer;
                                console.log('directive');
                            }*/
                            
                            $scope.$emit('wsLoaded', wavesurfer);
                        });
                        // listen to progress event
                        wavesurfer.on('progress', function() {
                            $scope.time = UtilsFactory.secondsToHms(wavesurfer.backend.getCurrentTime());
                        });
                        // hide wavesurfer progress bar
                        progressDiv.style.display = 'none';
                    },
                    templateUrl: 'js/app/wavesurfer/partials/wave.html',
                    controller: ['$scope', function($scope) {
                            $scope.play = function() {
                                wavesurfer.playPause();
                            };
                            // go to previous marker
                            $scope.back = function() {
                                //moveBackward();
                                WaveSurferFactory.moveBackward(wavesurfer);
                            };
                            // go to next marker
                            $scope.forth = function() {
                                //moveForward();
                                WaveSurferFactory.moveForward(wavesurfer);
                            };
                            $scope.zoomIn = function() {
                                if (wavesurfer.minPxPerSec < maxZoom) {
                                    wavesurfer.params.scrollParent = true;
                                    wavesurfer.minPxPerSec += 1;
                                    wavesurfer.params.minPxPerSec += 1;
                                    wavesurfer.drawBuffer();
                                }
                            };
                            $scope.zoomOut = function() {
                                if (wavesurfer.minPxPerSec > minZoom) {
                                    wavesurfer.params.scrollParent = true;
                                    wavesurfer.params.minPxPerSec -= 1;
                                    wavesurfer.minPxPerSec -= 1;
                                    wavesurfer.params.minPxPerSec -= 1;
                                    wavesurfer.drawBuffer();
                                }
                            };
                            $scope.changeSpeed = function(e) {
                                var value = e.target.dataset && e.target.dataset.value;
                                wavesurfer.playPause();
                                wavesurfer.backend.setPlaybackRate(value);
                                wavesurfer.playPause();
                            };
                        }]
                };
            }]);


