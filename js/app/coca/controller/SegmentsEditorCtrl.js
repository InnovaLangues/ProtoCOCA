'use strict';

/**
 * 
 * @param {type} $scope scope
 */
function SegmentsEditorCtrl($scope, $modal, $filter, UtilsFactory, WaveSurferFactory, SegmentFactory, SegmentCollectionFactory, MarkerFactory) {

    $scope.file = {};
    $scope.isEditing = false;
    // existing projects
    $scope.segmentCollections = SegmentCollectionFactory.loadExistingProjects();
    // current project working on
    $scope.currentProject = {};

    // wavesurfer instance from directive
    $scope.wsInstance;

    // events thrown by wave surfer directive
    $scope.$on('wsLoading', function() {
        console.log('wavesurfer loading');
        $scope.wsInstance = null;
    });

    $scope.$on('wsLoaded', function(e, value) {
        console.log('wavesurfer loaded');
        $scope.$apply(function() {
            $scope.wsInstance = value;
            $scope.wsInstance.clearMarks();
        });

        // are we editing an existing project or not
        if ($scope.isEditing) {
            $scope.drawSegments($scope.currentProject.segments);
        }

        // listen to wavesurfer drag-mark event
        $scope.wsInstance.drawer.on('drag-mark', function(drag, mark) {
            //console.log(mark);
        });
    });

    $scope.init = function() {
        $scope.currentProject = null;
        $scope.file = null;
        if ($scope.wsInstance.markers)
            $scope.wsInstance.clearMarks();
    };

    $scope.loadFile = function() {
        var modal = $modal.open({
            templateUrl: 'js/app/uploadmodal/partials/upload-file.html',
            controller: 'UploadModalCtrl'
        });
        modal.result.then(function(files) {
            $scope.file = {};
            $scope.uploadFile(files[0].name, files[0], 'media/');
        });
    };

    $scope.uploadFile = function(filename, file, directory) {
        $scope.formData = new FormData();
        $scope.formData.append('filename', filename);
        $scope.formData.append('file', file);
        $scope.formData.append('directory', directory);

        // POST
        UtilsFactory.xhr('save.php', $scope.formData, function(response) {
            var url = response.dirname + '/' + response.basename;
            var id = UtilsFactory.generateUUID();
            $scope.isEditing = false;
            $scope.file = {url: url, id: id};

            $scope.currentProject = {};
            $scope.currentProject.id = UtilsFactory.generateUUID();
            $scope.currentProject.name = $filter('split')($filter('split')(url, '/', 1), '.', 0);
            $scope.currentProject.fId = id;
            $scope.currentProject.fUrl = url;
            $scope.currentProject.segments = [];
        });
    };


    $scope.loadSegmentProject = function() {
        //$scope.loadExistingProjects();
        // open modal
        var modal = $modal.open({
            templateUrl: 'js/app/scollectionmodal/partials/segments-collections-modal.html',
            controller: 'SegmentsCollectionsModalCtrl',
            resolve: {
                collections: function() {
                    return $scope.segmentCollections;
                },
                current: function() {
                    return $scope.currentProject;
                }
            }
        });
        modal.result.then(function(result) {
            if (result.id) {
                $scope.currentProject = null;
                $scope.currentProject = result;
                $scope.isEditing = true;
                $scope.file = {url: $scope.currentProject.fUrl, id: $scope.currentProject.fId};
            }
        });
    };

    $scope.createSegmentsFromMarkers = function() {
        if (WaveSurferFactory.countMarkers($scope.wsInstance.markers)) {
            var markers = $scope.wsInstance.markers;
            var duration = $scope.wsInstance.backend.getDuration();
            // if no marker at beginning add it
            if (WaveSurferFactory.checkNewMarkerPosition(markers, 0)) {
                var id = UtilsFactory.generateUUID();
                $scope.wsInstance.mark({
                    color: 'rgba(255, 0, 0, 1)',
                    id: id,
                    type: 'teacher',
                    position: 0
                });
            }

            // if no marker at the end ad it
            if (WaveSurferFactory.checkNewMarkerPosition(markers, duration)) {
                var id = UtilsFactory.generateUUID();
                $scope.wsInstance.mark({
                    color: 'rgba(255, 0, 0, 1)',
                    id: id,
                    type: 'teacher',
                    position: duration
                });
            }

            var sStart = 0;
            var sEnd;
            var segments = [];
            // sort markers by position
            var sortedMarkers = WaveSurferFactory.getSortedMarkersArray(markers);
            var i = 0;
            for (var index in sortedMarkers) {
                // get next marker position
                var nMarker = WaveSurferFactory.getNextMarker(markers, sStart, duration);
                if (nMarker) {
                    sEnd = nMarker.position;
                    var temp_name = i + '_' + $filter('split')($filter('split')($scope.file.url, '/', 1), '.', 0);
                    var s = SegmentFactory.create(UtilsFactory.generateUUID(), $scope.file.url, $scope.file.id, temp_name, '', sStart, sortedMarkers[index].id, sEnd, nMarker.id);
                    segments.push(s);
                    sStart = sEnd;
                }
                i++;
            }
            $scope.currentProject.segments = segments;
        }
        else {
            var alertMsg = '';
            alertMsg += '<p class="alert">';
            alertMsg += '   No marker drawn. Can not create segments!';
            alertMsg += '</p>';
            bootbox.alert(alertMsg);
        }
    };

    $scope.drawSegments = function(segmentCollection) {
        $scope.wsInstance.clearMarks();
        var nbSegments = segmentCollection.length;
        for (var i = 0; i < nbSegments; i++) {
            var s = segmentCollection[i];
            // in all cases draw first marker
            var m1 = Object.create(WaveSurfer.Mark);
            m1.id = s.mStartId;
            m1.position = parseFloat(s.start);
            m1.color = '#ff0000';
            m1.type = 'teacher';
            $scope.wsInstance.mark(m1);
            // if last segment draw also last marker
            if (i === (nbSegments - 1)) {
                var m2 = Object.create(WaveSurfer.Mark);
                m2.id = s.mEndId;
                m2.position = parseFloat(s.end);
                m2.color = '#ff0000';
                m2.type = 'teacher';
                $scope.wsInstance.mark(m2);
            }
        }
    };

    $scope.autoDrawMarkers = function() {

        //$("#create-segments").prop('disabled', false);
        //$("#auto-draw").prop('disabled', true);

        var duration = $scope.wsInstance.backend.getDuration();
        var markerGap = (duration / 4);
        var mTime = markerGap;

        // marker 0 en début de fichier
        var red = Object.create(WaveSurfer.Mark);
        red.id = UtilsFactory.generateUUID();  //wavesurfer.util.getId();
        red.position = 0;
        red.color = '#ff0000';
        red.type = 'teacher';
        $scope.wsInstance.mark(red);

        // marker 1
        red = Object.create(WaveSurfer.Mark);
        red.id = UtilsFactory.generateUUID();
        red.position = mTime;
        red.color = '#ff0000';
        red.type = 'teacher';
        $scope.wsInstance.mark(red);

        mTime += markerGap;

        red = Object.create(WaveSurfer.Mark);
        red.id = UtilsFactory.generateUUID();
        red.position = mTime;
        red.color = '#ff0000';
        red.type = 'teacher';
        $scope.wsInstance.mark(red);

        mTime += markerGap;

        red = Object.create(WaveSurfer.Mark);
        red.id = UtilsFactory.generateUUID();
        red.position = mTime;
        red.color = '#ff0000';
        red.type = 'teacher';
        $scope.wsInstance.mark(red);

        // last marker
        red = Object.create(WaveSurfer.Mark);
        red.id = UtilsFactory.generateUUID();
        red.position = duration;
        red.color = '#ff0000';
        red.type = 'teacher';
        $scope.wsInstance.mark(red);
    };

    $scope.saveSegmentCollection = function() {

        var modal = $modal.open({
            templateUrl: 'js/app/scollectionmodal/partials/save-collection.html',
            controller: 'SaveCollectionCtrl',
            resolve: {
                current: function() {
                    return $scope.currentProject;
                }
            }
        });
        modal.result.then(function(result) {
            if (result) {
                if ($scope.isEditing) {
                    // need to do that explicitly to update the collection
                    for (var i = 0; i < $scope.segmentCollections.length; i++) {
                        if ($scope.currentProject.id === $scope.segmentCollections[i].id) {
                            $scope.segmentCollections.splice(i, 1, $scope.currentProject);
                        }
                    }
                }
                else {
                    $scope.segmentCollections.push($scope.currentProject);
                }
                $scope.isEditing = true;
            }
        });
    };



    $scope.splitAudio = function() {
        var formData = new FormData();
        formData.append('fUrl', $scope.file.url);
        var temp = [];
        for (var i = 0; i < $scope.currentProject.segments.length; i++) {
            var s = {};
            s.start = UtilsFactory.secondsToHms($scope.currentProject.segments[i].start);
            s.end = UtilsFactory.secondsToHms($scope.currentProject.segments[i].end);
            temp.push(s);
        }
        formData.append('segments', JSON.stringify(temp));
        // POST
        var result = UtilsFactory.xhr('split.php', formData, function(response) {
            // return an array of processed url files
            console.log(response);
        });
    };

    $scope.deleteSegment = function(sId) {
        var confirmMsg = '';
        confirmMsg += '<p class="confirm">';
        confirmMsg += ' Are you sure you want to delete this segment ?';
        confirmMsg += '</p>';
        bootbox.confirm(confirmMsg, function(result) {
            if (result) {
                var segment = SegmentFactory.getSegmentById(sId, $scope.currentProject.segments);
                var sIndex = SegmentFactory.getSegmentIndexById(sId, $scope.currentProject.segments);
                if (segment) {
                    $scope.$apply(function() {
                        $scope.currentProject.segments = SegmentFactory.mergeSegments(segment, sIndex, $scope.currentProject.segments, $scope.wsInstance.markers);
                    });
                }
                else {
                    console.log('Error - segment not found');
                }
            }
        });
    };

    $scope.deleteAllSegments = function() {
        var confirmMsg = '';
        confirmMsg += '<p class="confirm">';
        confirmMsg += ' Are you sure you want to delete all segments ?';
        confirmMsg += '</p>';
        bootbox.confirm(confirmMsg, function(result) {
            if (result) {
                $scope.$apply(function() {
                    $scope.currentProject.segments = [];
                });

                if ($scope.wsInstance.markers)
                    $scope.wsInstance.clearMarks();
            }
        });
    };

    $scope.moveCursorTo = function(val) {
        var delta = val - $scope.wsInstance.backend.getCurrentTime();
        $scope.wsInstance.skip(delta);
    };

    $scope.moveMarkerToCurrentTime = function(object) {
        var mId = object.mId;
        var sId = object.sId;
        var time = $scope.wsInstance.backend.getCurrentTime();

        var cMarker = $scope.wsInstance.markers[mId];
        // can not move first or last segment
        if (WaveSurferFactory.isFirstOrLastMarker(cMarker.position, $scope.wsInstance.backend.getDuration())) {
            var alertMsg = '';
            alertMsg += '<p class="alert">';
            alertMsg += '   You can not move first or last marker!';
            alertMsg += '</p>';
            bootbox.alert(alertMsg);
        }
        else {
            // check that new position is between next and previous marker position
            if (WaveSurferFactory.checkMarkerNewPosition(cMarker, time, $scope.wsInstance.markers, $scope.wsInstance.backend.getDuration())) {
                var segment = SegmentFactory.getSegmentById(sId, $scope.currentProject.segments);
                // retrieve segment index in collection 
                var sIndex = SegmentFactory.getSegmentIndexById(sId, $scope.currentProject.segments);
                // update segment
                if (cMarker.position === Number(segment.start)) {
                    // find previous segment and update it's end
                    var prevS = SegmentFactory.getPreviousSegment(segment, $scope.currentProject.segments);
                    if (prevS) {
                        prevS.end = time;
                        var prevSIndex = SegmentFactory.getSegmentIndexById(prevS.id, $scope.currentProject.segments);
                        $scope.currentProject.segments[prevSIndex] = prevS;
                    }
                    segment.start = time;
                }
                else if (cMarker.position === Number(segment.end)) {
                    // find next segment and update it's start
                    var nextS = SegmentFactory.getNextSegment(segment, $scope.currentProject.segments);
                    if (nextS) {
                        nextS.start = time;
                        var nextSIndex = SegmentFactory.getSegmentIndexById(nextS.id, $scope.currentProject.segments);
                        $scope.currentProject.segments[nextSIndex] = nextS;
                    }
                    segment.end = time;
                }

                $scope.currentProject.segments[sIndex] = segment;
                // update marker position
                WaveSurferFactory.updateMarker($scope.wsInstance, time, mId);
            }
            else {
                var alertMsg = '';
                alertMsg += '<p class="alert">';
                alertMsg += '   You can only move a marker between next or previous marker position of the current segment.';
                alertMsg += '</p>';
                bootbox.alert(alertMsg);
            }
        }
    };

    $scope.deleteMarker = function(object) {

        var mId = object.mId;
        var sId = object.sId;
        var cMarker = $scope.wsInstance.markers[mId];
        if (WaveSurferFactory.isFirstOrLastMarker(cMarker, $scope.wsInstance.backend.getDuration())) {
            var alertMsg = '';
            alertMsg += '<p class="alert">';
            alertMsg += '   You can not delete first or last marker!';
            alertMsg += '</p>';
            bootbox.alert(alertMsg);
        }
        else {
            var confirmMsg = '';
            confirmMsg += '<p class="confirm">';
            confirmMsg += ' If you delete this marker you will also delete the segment.';
            confirmMsg += '</p>';
            confirmMsg += '<p class="confirm">';
            confirmMsg += ' Are you sure you want to continue ?';
            confirmMsg += '</p>';
            bootbox.confirm(confirmMsg, function(result) {
                if (result) {
                    var segment = SegmentFactory.getSegmentById(sId, $scope.currentProject.segments);
                    var sIndex = SegmentFactory.getSegmentIndexById(sId, $scope.currentProject.segments);
                    if (segment) {
                        $scope.$apply(function() {
                            $scope.currentProject.segments = SegmentFactory.mergeSegments(segment, sIndex, $scope.currentProject.segments, $scope.wsInstance.markers);
                        });
                    }
                    else {
                        console.log('Error - segment not found');
                    }
                }
            });
        }
    };

    $scope.mark = function() {
        // check if no other marker already exists at the same position
        var position = $scope.wsInstance.backend.getCurrentTime();
        var alertMsg = '';

        if (!WaveSurferFactory.checkNewMarkerPosition($scope.wsInstance.markers, position)) {
            alertMsg += '<p class="alert">';
            alertMsg += '   A marker already exists at the same position !';
            alertMsg += '</p>';
            bootbox.alert(alertMsg);
        }
        else {
            var newMId = UtilsFactory.generateUUID();
            // update segments concerned by the new marker if any
            if ($scope.currentProject.segments.length > 0) {
                // find corresponding segment                    
                var segment = SegmentFactory.getSegmentByCurrentPosition(position, $scope.currentProject.segments);
                if (segment) {
                    // find segment index in order to delete it and insert the two new segments at the right place
                    var sIndex = SegmentFactory.getSegmentIndexById(segment.id, $scope.currentProject.segments);
                    // find name and comment of the existing segment from html
                    var name = $('#' + segment.id + '-name').val();
                    var comment = $('#' + segment.id + '-comment').val();
                    // create two new segments
                    var firstS = new Segment();
                    firstS.init(
                            UtilsFactory.generateUUID(),
                            $scope.file.url,
                            $scope.file.id,
                            name,
                            comment,
                            segment.start,
                            segment.mStartId,
                            position,
                            newMId
                            );

                    var secondS = new Segment();
                    secondS.init(
                            UtilsFactory.generateUUID(),
                            $scope.file.url,
                            $scope.file.id,
                            '',
                            '',
                            position,
                            newMId,
                            segment.end,
                            segment.mEndId
                            );
                    // insert the two new segments in the collection (at the good index) and remove the old one 
                    $scope.currentProject.segments.splice(sIndex, 1, firstS, secondS);
                    // create new wavesurfer marker
                    $scope.wsInstance.mark({
                        color: 'rgba(255, 0, 0, 1)',
                        id: newMId,
                        type: 'teacher',
                        draggable: true
                    });
                }
                else {
                    console.log('Error - No segment found');
                }
            }
            else {
                $scope.wsInstance.mark({
                    color: 'rgba(255, 0, 0, 1)',
                    id: newMId,
                    type: 'teacher',
                    draggable: true
                });
            }
        }
    };

    /*function playBackwardBuilding(currentStart) {
        $scope.wsInstance.play(currentStart, $scope.wsInstance.backend.getDuration());
        var last = false;
        $scope.wsInstance.on('finish', function() {
            // get new start
            var prevMarker = MarkerFactory.getPreviousMarker($scope.wsInstance.markers, currentStart);
            if (prevMarker) {
                playBackwardBuilding(prevMarker.position);
            }
            else if(!last) {
                last = true;
                $scope.wsInstance.seekTo(0);
                $scope.wsInstance.playPause();                
            }
        });

    };*/
}