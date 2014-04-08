'use strict';

angular.module('WaveSurferDirective', [])
        .value('myWaveSurferConfig', {})
        .directive('myWaveSurfer', ['myWaveSurferConfig', 'UtilsFactory', 'WaveSurferFactory', function(myWaveSurferConfig, UtilsFactory, WaveSurferFactory) {
                //console.log('dir called');
                //var wavesurfer = Object.create(WaveSurfer);
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
                    restrict: "A",
                    scope: {
                        myFile: '=file',
                        waveSurfer: '=instance'
                    }, // isolated scope
                    link: function($scope, el, attrs) {
                        $scope.$emit('wsLoading');

                        var $container = document.querySelector('#waveform');
                        // Reinject jQuery object into wavesurfer config
                        options.container = $container;

                        // Wavesurfer Progress bar
                        var progressDiv = document.querySelector('#progress-bar');
                        var progressBar = progressDiv.querySelector('.progress-bar');
                        if (!$scope.waveSurfer) {
                            $scope.waveSurfer = Object.create(WaveSurfer);
                            $scope.waveSurfer.init(options);
                        }
                        else {
                            console.log('la');
                            if ($scope.waveSurfer.markers)
                                $scope.waveSurfer.clearMarks();
                        }
                        $scope.waveSurfer.load($scope.myFile.url);

                        $scope.waveSurfer.on('loading', function(percent, xhr) {
                            progressDiv.style.display = 'block';
                            progressBar.style.width = percent + '%';
                        });

                        // Won't work on iOS until you touch the page
                        $scope.waveSurfer.on('ready', function() {
                            
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
                                wavesurfer: $scope.waveSurfer,
                                container: '#wave-timeline'
                            });

                            $scope.$apply(function() {
                                $scope.time = UtilsFactory.secondsToHms($scope.waveSurfer.backend.getCurrentTime());
                            });

                            // HERE :: STRANGE BEHAVIOR emit is called twice but only when i upload a second file                                                        
                            $scope.$emit('wsLoaded', $scope.waveSurfer);
                        });
                        // listen to progress event
                        $scope.waveSurfer.on('progress', function() {
                            $scope.time = UtilsFactory.secondsToHms($scope.waveSurfer.backend.getCurrentTime());
                        });
                        progressDiv.style.display = 'none';
                    },
                    templateUrl: 'js/app/wavesurfer/partials/wave.html',
                    controller: ['$scope', function($scope) {
                            $scope.play = function() {
                                $scope.waveSurfer.playPause();
                            };
                            // go to previous marker
                            $scope.back = function() {
                                //moveBackward();
                                WaveSurferFactory.moveBackward($scope.waveSurfer);
                            };
                            // go to next marker
                            $scope.forth = function() {
                                //moveForward();
                                WaveSurferFactory.moveForward($scope.waveSurfer);
                            };
                            $scope.zoomIn = function() {
                                if ($scope.waveSurfer.minPxPerSec < maxZoom) {
                                    $scope.waveSurfer.params.scrollParent = true;
                                    $scope.waveSurfer.minPxPerSec += 1;
                                    $scope.waveSurfer.params.minPxPerSec += 1;
                                    $scope.waveSurfer.drawBuffer();
                                }
                            };
                            $scope.zoomOut = function() {
                                if ($scope.waveSurfer.minPxPerSec > minZoom) {
                                    $scope.waveSurfer.params.scrollParent = true;
                                    $scope.waveSurfer.params.minPxPerSec -= 1;
                                    $scope.waveSurfer.minPxPerSec -= 1;
                                    $scope.waveSurfer.params.minPxPerSec -= 1;
                                    $scope.waveSurfer.drawBuffer();
                                }
                            };
                            $scope.changeSpeed = function(e) {
                                var value = e.target.dataset && e.target.dataset.value;
                                $scope.waveSurfer.playPause();
                                $scope.waveSurfer.backend.setPlaybackRate(value);
                                $scope.waveSurfer.playPause();
                            };
                        }]
                };
            }]);


