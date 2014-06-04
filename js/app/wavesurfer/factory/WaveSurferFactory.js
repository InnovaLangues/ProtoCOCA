'use strict';
/**
 * WaveSurferFactory
 */
function WaveSurferFactory() {

    return {
        moveForward: function(wsInstance) {
            // get markers
            var markers = wsInstance.markers;
            var currentTime = wsInstance.backend.getCurrentTime();
            var end = wsInstance.backend.getDuration();
            // if markers
            if (this.countMarkers(markers) > 0) {
                var nextMarker = this.getNextMarker(markers, currentTime, end);
                if (nextMarker) {
                    wsInstance.seekAndCenter(nextMarker.position / end);
                }
                else {
                    // can't set progress arg to 1 (=100%) because of wavesurfer getDuration() method
                    wsInstance.seekAndCenter(0.999);
                }
            }
            else {
                wsInstance.seekAndCenter(0.999);
            }
        },
        moveBackward: function(wsInstance) {
            // get markers
            var markers = wsInstance.markers;
            var currentTime = wsInstance.backend.getCurrentTime();
            if (this.countMarkers(markers) > 0) {
                var prevMarker = this.getPreviousMarker(markers, currentTime);
                if (prevMarker) {
                    wsInstance.seekAndCenter(prevMarker.position / wsInstance.backend.getDuration());
                }
                else {
                    wsInstance.seekAndCenter(0);
                }
            }
            else {
                wsInstance.seekAndCenter(0);
            }
        },
        countMarkers: function(markers) {
            var nb = 0;
            for (var marker in markers) {
                nb++;
            }
            return nb;
        },
        getNextMarker: function(markers, currentTime, totalLength) {
            // base marker position, we are searching for the nearest marker after this position
            var sPosition = currentTime;
            // nearest next marker result
            var result = null;
            // time diffenrence between current marker position and next one
            var delta = totalLength - sPosition;
            for (var marker in markers) {
                // current marker position
                var cPosition = markers[marker].position;
                // is marker position greater than reference marker position ? (many markers can verify this condition)
                if (cPosition > sPosition) {
                    // get delta between cursor current position && marker position
                    var tempDelta = cPosition - sPosition;
                    // is it the nearest next marker ?
                    if (tempDelta <= delta) {
                        delta = tempDelta;
                        result = markers[marker];
                    }
                }
            }
            return result;
        },
        getPreviousMarker: function(markers, currentTime) {
            // base marker position, we are searching for the nearest marker after this position
            var sPosition = currentTime;
            // nearest next marker result
            var result = null;
            // time diffenrence between current marker position and next one
            var delta = 0;
            for (var marker in markers) {
                // current marker position
                var cPosition = markers[marker].position;
                // previous marker ?
                if (cPosition < sPosition) {
                    // get delta between cursor current position && marker position (negative values)
                    var tempDelta = cPosition - sPosition;
                    // is it the nearest previous marker ?
                    if (delta === 0 || tempDelta > delta) {
                        delta = tempDelta;
                        result = markers[marker];
                    }
                }
            }
            return result;
        },
        getPreviousMarkerForSelection: function(markers, currentTime) {
            // base marker position, we are searching for the nearest marker after this position
            var sPosition = currentTime;
            // nearest next marker result
            var result = null;
            // time diffenrence between current marker position and next one
            var delta = 0;
            for (var marker in markers) {
                // current marker position
                var cPosition = markers[marker].position;
                // previous marker ?
                if (cPosition <= sPosition) {
                    // get delta between cursor current position && marker position (negative values)
                    var tempDelta = cPosition - sPosition;
                    // is it the nearest previous marker ?
                    if (delta === 0 || tempDelta > delta) {
                        delta = tempDelta;
                        result = markers[marker];
                    }
                }
            }
            return result;
        },
        getNextMarkerForSelection: function(markers, currentTime, totalLength) {
            // base marker position, we are searching for the nearest marker after this position
            var sPosition = currentTime;
            // nearest next marker result
            var result = null;
            // time diffenrence between current marker position and next one
            var delta = totalLength - sPosition;
            for (var marker in markers) {
                // current marker position
                var cPosition = markers[marker].position;
                // is marker position greater than reference marker position ? (many markers can verify this condition)
                if (cPosition >= sPosition) {
                    // get delta between cursor current position && marker position
                    var tempDelta = cPosition - sPosition;
                    // is it the nearest next marker ?
                    if (tempDelta <= delta) {
                        delta = tempDelta;
                        result = markers[marker];
                    }
                }
            }
            return result;
        },
        isFirstOrLastMarker: function(current, duration) {
            return current === 0 || current === duration;
        },
        checkMarkerNewPosition: function(cMarker, newPosition, markers, length) {
            var nextMarker = this.getNextMarker(markers, cMarker.position, length);
            var prevMarker = this.getPreviousMarker(markers, cMarker.position);
            return newPosition > prevMarker.position && newPosition < nextMarker.position;
        },
        checkNewMarkerPosition: function(markers, position) {
            for (var marker in markers) {
                if (position === markers[marker].position) {
                    return false;
                }
            }
            return true;
        },
        updateMarker: function(wavesurfer, time, mId) {

            wavesurfer.markers[mId].update({
                id: mId,
                position: time
            });
            wavesurfer.redrawMarks();
        },
        getSortedMarkersArray: function(markers) {
            var sortable = [];
            for (var id in markers) {
                sortable.push(markers[id]);
            }
            sortable.sort(function(a, b) {
                return a.position - b.position;
            });
            return sortable;
        }
    };
}

