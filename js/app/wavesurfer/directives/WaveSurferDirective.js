'use strict';
angular.module('WaveSurferDirective', []).value('myWaveSurferConfig', {}).directive('myWaveSurfer', ['myWaveSurferConfig', 'UtilsFactory', 'WaveSurferFactory',
    function(myWaveSurferConfig, UtilsFactory, WaveSurferFactory) {
        //console.log('dir called');
        //var wavesurfer = Object.create(WaveSurfer);
        var maxZoom = 100;
        var minZoom = 13;
        var zoomGap = 5;
        var timeline;
        // Set some default options
        var options = {
            waveColor: 'lightgrey',
            progressColor: 'black',
            loaderColor: 'purple',
            cursorColor: 'navy',
            markerWidth: 2,
            minPxPerSec: minZoom,
            selectionColor: 'rgba(255,0,0, .2)',
            selectionForeground: true,
            selectionBorderColor: '#d42929',
            selectionBorder: false,
            interact: true,
            loopSelection: false,
            dragSelection: false
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
                $scope.playMode = 'normal';
                $scope.loop = false;
                
                var $container = document.querySelector('#waveform');
                options.container = $container;

                // Wavesurfer Progress bar
                var progressDiv = document.querySelector('#progress-bar');
                var progressBar = progressDiv.querySelector('.progress-bar');
                if (!$scope.waveSurfer) {
                    $scope.waveSurfer = Object.create(WaveSurfer);
                    $scope.waveSurfer.init(options);
                } else {
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
                    } else {
                        // create timeline object
                        timeline = Object.create(WaveSurfer.Timeline);
                    }

                    timeline.init({
                        wavesurfer: $scope.waveSurfer,
                        container: '#wave-timeline'
                    });
                    $scope.time = UtilsFactory.secondsToHms($scope.waveSurfer.backend.getCurrentTime());
                    $scope.$emit('wsLoaded', $scope.waveSurfer);
                });

                // listen to progress event
                $scope.waveSurfer.on('progress', function() {
                    // surround the call with setTimeout to avoid that : https://docs.angularjs.org/error/$rootScope/inprog
                    window.setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.time = UtilsFactory.secondsToHms($scope.waveSurfer.backend.getCurrentTime());
                        });
                    }, 0);
                });

                // listen to this event to stop playing if necessary
                $scope.waveSurfer.on('mark', function(mark) {
                    if ($scope.playMode === 'segment' && mark.percentage === $scope.selection.endPercentage) {
                        // if loop
                        if ($scope.loop) {
                            $scope.waveSurfer.playPauseSelection();
                        }
                        else if (!$scope.waveSurfer.backend.isPaused()) {
                            // pause playing
                            $scope.playPause();
                            // move the playing cursor in order to allow to replay the segment (cf problem with getting PrevMarker/NextMarker)
                            $scope.waveSurfer.skip(-0.1);
                            $scope.waveSurfer.clearSelection();
                        }
                    }
                });

                /*
                $scope.markers = null;
                $scope.waveSurfer.on('marked', function(){
                    window.setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.markers = $scope.waveSurfer.markers;
                        });
                    }, 0);
                });
                $scope.waveSurfer.on('mark-update', function(){
                    window.setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.markers = $scope.waveSurfer.markers;
                        });
                    }, 0);
                });
                $scope.waveSurfer.on('mark-removed', function(){
                    window.setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.markers = $scope.waveSurfer.markers;
                        });
                    }, 0);
                });*/
                progressDiv.style.display = 'none';
            },
            templateUrl: 'js/app/wavesurfer/partials/wave.html',
            controller: ['$scope',
                function($scope) {
                    // 'public' methods (callable from wiew)

                    // play / pause method
                    $scope.playPause = function() {
                        // pause if playing 
                        if (!$scope.waveSurfer.backend.isPaused()) {
                            $scope.waveSurfer.playPause();
                        }
                        else {
                            $scope.duration = $scope.waveSurfer.backend.getDuration();

                            if ($scope.playMode === 'normal') {
                                if ($scope.loop) {
                                    playNormalLoop($scope.waveSurfer.backend.getCurrentTime());
                                } else {
                                    $scope.waveSurfer.playPause();
                                }
                            }
                            else if ($scope.playMode === 'segment') {
                                var prevMarker = WaveSurferFactory.getPreviousMarker($scope.waveSurfer.markers, $scope.waveSurfer.backend.getCurrentTime());
                                var start = prevMarker ? prevMarker.position : 0;
                                var nextMarker = WaveSurferFactory.getNextMarker($scope.waveSurfer.markers, $scope.waveSurfer.backend.getCurrentTime(), $scope.duration);
                                var end = nextMarker ? nextMarker.position : $scope.duration;
                                // create a selection
                                $scope.selection = {};
                                $scope.selection.startPercentage = start / $scope.duration;
                                $scope.selection.endPercentage = end / $scope.duration;
                                $scope.waveSurfer.updateSelection($scope.selection);
                                $scope.waveSurfer.playPauseSelection();

                                //console.log('segment');
                                /*var prevMarker = WaveSurferFactory.getPreviousMarker($scope.waveSurfer.markers, $scope.waveSurfer.backend.getCurrentTime());
                                 var start = prevMarker ? prevMarker.position : 0;
                                 var nextMarker = WaveSurferFactory.getNextMarker($scope.waveSurfer.markers, $scope.waveSurfer.backend.getCurrentTime(), $scope.duration);
                                 var end = nextMarker ? nextMarker.position : $scope.duration;
                                 $scope.waveSurfer.play(start, end);
                                 if ($scope.loop) {
                                 $scope.waveSurfer.on('progress', function() {
                                 //console.log('current ' + $scope.waveSurfer.backend.getCurrentTime().toFixed(1) + ' end ' + end.toFixed(1));
                                 if ($scope.waveSurfer.backend.getCurrentTime().toFixed(1) >= end.toFixed(1)) {
                                 //console.log('replay at ' + start);
                                 $scope.waveSurfer.play(start, end);
                                 }
                                 });
                                 }*/
                            }
                            else if ($scope.playMode === 'backward') {
                                console.log('backward called');
                                var prevMarker = WaveSurferFactory.getPreviousMarker($scope.waveSurfer.markers, $scope.duration);
                                if (prevMarker) {
                                    playBackwardBuilding(prevMarker.position, false);
                                }
                                else {
                                    $scope.waveSurfer.seekTo(0);
                                    $scope.waveSurfer.play();
                                }
                            }
                        }
                    };
                    // go to previous marker
                    $scope.back = function() {
                        WaveSurferFactory.moveBackward($scope.waveSurfer);
                    };
                    // go to next marker
                    $scope.forth = function() {
                        WaveSurferFactory.moveForward($scope.waveSurfer);
                    };
                    $scope.zoomIn = function() {
                        if ($scope.waveSurfer.minPxPerSec < maxZoom) {
                            if (!$scope.waveSurfer.params.scrollParent)
                                $scope.waveSurfer.toggleScroll();
                            //$scope.waveSurfer.params.scrollParent = true;
                            $scope.waveSurfer.params.minPxPerSec += zoomGap;
                            $scope.waveSurfer.minPxPerSec += zoomGap;
                            $scope.waveSurfer.drawBuffer();
                        }
                    };
                    $scope.zoomOut = function() {
                        if ($scope.waveSurfer.minPxPerSec > minZoom) {
                            if (!$scope.waveSurfer.params.scrollParent)
                                $scope.waveSurfer.toggleScroll();
                            //$scope.waveSurfer.params.scrollParent = true;
                            $scope.waveSurfer.params.minPxPerSec -= zoomGap;
                            $scope.waveSurfer.minPxPerSec -= zoomGap;
                            $scope.waveSurfer.drawBuffer();
                        }
                        else {
                            if ($scope.waveSurfer.params.scrollParent)
                                $scope.waveSurfer.toggleScroll();
                            //$scope.waveSurfer.params.scrollParent = false;
                            $scope.waveSurfer.params.minPxPerSec = minZoom;
                            $scope.waveSurfer.minPxPerSec = minZoom;
                            $scope.waveSurfer.drawBuffer();
                        }
                    };
                    $scope.changeSpeed = function(e) {
                        var value = e.target.dataset && e.target.dataset.value;
                        if (value) {
                            $scope.waveSurfer.playPause();
                            $scope.waveSurfer.backend.setPlaybackRate(value);
                            $scope.waveSurfer.playPause();
                        }
                    };
                    /**
                     * Change playback mode
                     * We need to handle on the fly (while playing / marker changes...) playing mode switching
                     * @param {Event} e
                     */
                    $scope.togglePlayMode = function(e) {
                        if ($scope.waveSurfer.getSelection()) {
                            $scope.waveSurfer.clearSelection();
                            console.log('clear selection ?');
                        }
                        // pause playing if necessary
                        if (!$scope.waveSurfer.backend.isPaused()) {
                            $scope.waveSurfer.playPause();
                        }
                        var value = e.target.dataset && e.target.dataset.value;
                        if (value) {
                            $scope.playMode = value;
                        } else {
                            // default play mode
                            $scope.playMode = 'normal';
                        }
                        // call play only if currently playing
                        if (!$scope.waveSurfer.backend.isPaused()) {
                            $scope.playPause();
                        }
                    };
                    $scope.mark = function() {
                        $scope.waveSurfer.mark({
                            color: 'rgba(255, 0, 0, 1)',
                            id: UtilsFactory.generateUUID(),
                            type: 'teacher',
                            draggable: true
                        });
                    };
                    $scope.toggleLoop = function() {
                        window.setTimeout(function() {
                            $scope.$apply(function() {
                                $scope.loop = !$scope.loop;
                                $scope.waveSurfer.loopSelection = $scope.loop;
                                console.log($scope.waveSurfer.loopSelection);
                            });
                        }, 0);
                    };

                    // 'private' methods
                    function playBackwardBuilding(currentStart, last) {
                        // create a selection
                        $scope.selection = {};
                        $scope.selection.startPercentage = currentStart / $scope.duration;
                        $scope.selection.endPercentage = 100;
                        $scope.waveSurfer.updateSelection($scope.selection);
                        if (!$scope.waveSurfer.backend.isPaused()) {
                            $scope.playPause();
                        }
                        // play selection
                        $scope.waveSurfer.playPauseSelection();
                        
                        // normalement pas besoin de second argument dans la méthode (par défaut = longueur du fichier)
                        // $scope.waveSurfer.play(currentStart);

                        if (!last) {
                            // when reaching the end
                            $scope.waveSurfer.once('finish', function() {                               
                                // get new start (previous marker position)
                                var prevMarker = WaveSurferFactory.getPreviousMarker($scope.waveSurfer.markers, currentStart);
                                if (prevMarker) {
                                    // recursively call the method with new start
                                    playBackwardBuilding(prevMarker.position, false);
                                }
                                else {
                                    console.log('last');
                                    playBackwardBuilding(0, true);
                                    //$scope.waveSurfer.un('finish');
                                }
                            });
                        }
                        else{
                            $scope.waveSurfer.once('finish', function() {
                                $scope.waveSurfer.clearSelection();
                            });
                        }
                    }

                    // loop the entire file
                    function playNormalLoop(currentStart) {
                        $scope.waveSurfer.play(currentStart, $scope.duration);
                        $scope.waveSurfer.once('finish', function() {
                            if ($scope.loop)
                                playNormalLoop(0);
                            else
                                $scope.waveSurfer.un('finish');
                        });
                    }
                }
            ]
        };
    }
]);