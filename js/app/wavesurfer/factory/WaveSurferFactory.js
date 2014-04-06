'use strict';

/**
 * WaveSurferFactory
 */
function WaveSurferFactory(UtilsFactory) {
 
    return {
        
        moveForward: function(wsInstance) {

            // get markers
            var markers = wsInstance.markers;
            var currentTime = wsInstance.backend.getCurrentTime();
            var end = wsInstance.backend.getDuration();
            var delta = 0;

            // if markers
            if (this.countMarkers(markers) > 0) {
                var nextMarker = this.getNextMarker(markers, currentTime, end);
                if (nextMarker) {
                    delta = nextMarker.position - wsInstance.backend.getCurrentTime();
                }
                else {
                    delta = end - wsInstance.backend.getCurrentTime();
                }
            }
            else {
                delta = end - wsInstance.backend.getCurrentTime();
            }
            wsInstance.skip(delta);
        },
        moveBackward: function(wsInstance) {

            // get markers
            var markers = wsInstance.markers;
            var currentTime = wsInstance.backend.getCurrentTime();
            var delta = 0;
            if (this.countMarkers(markers) > 0) {
                var prevMarker = this.getPreviousMarker(markers, currentTime);
                if (prevMarker) {
                    delta = prevMarker.position - wsInstance.backend.getCurrentTime();
                    wsInstance.skip(delta);
                }
                else{
                    wsInstance.seekTo(0);
                }
            }
            else {
                wsInstance.seekTo(0);
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
        }
    };
}

