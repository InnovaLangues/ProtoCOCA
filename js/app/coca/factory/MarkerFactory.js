'use strict';


function MarkerFactory() {

    return{
        countMarkers: function(markers) {
            var nb = 0;
            for (var marker in markers) {
                nb++;
            }
            return nb;
        },
        isFirstMarker : function(current, markers){
            return this.getPreviousMarker(markers, current.position) === null;
        },
        isLastMarker : function (current, markers, mediaLength){
            return this.getNextMarker(markers, current.position, mediaLength) === null;
        },
        isFirstOrLastMarker: function(cMarker, duration) {
            return cMarker.position === 0 || cMarker.position === duration;
        },
        getPreviousMarker: function(markers, cMarkerPosition) {
            // base marker position, we are searching for the nearest marker after this position
            var sPosition = cMarkerPosition;
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
        /**
         * Retrieve the nearest next marker from a ref position
         * @param {object} markers collection of markers object
         * @param {number} cMarkerPosition current marker position (time search reference)
         * @param {number} totalLength length of the sound file
         * @returns {WavesurferMarker} marker found or null if no marker found
         */
        getNextMarker: function(markers, cMarkerPosition, totalLength) {
            // base marker position, we are searching for the nearest marker after this position
            var sPosition = cMarkerPosition;
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
        
        /**
         * When creating a new marker check if position is valid (!start, !end) 
         * and if no marker exists at the same positions
         * @param {Object} markers Object list of marker
         * @param {numeric} position the position where we want to create new marker
         * @returns {bool} true if new marker position is valid
         */
        checkNewMarkerPosition: function(markers, position) {

            for (var marker in markers) {
                if (position === markers[marker].position) {
                    return false;
                }
            }
            return true;
        },
        
        /**
         * Check if the new position wanted for the current Marker is correct (between previous / next marker positions)
         * Note that we can not move first or last marker so nextMarker and prevMarker are always existing
         * @param {Wavesurfer.Marker} cMarker current marker
         * @param {number} newPosition the position asked for marker
         * @param {List of Wavesurfer.Marker} markers
         * @param {number} length length of file
         * @returns {bool} true if correct position
         */
        checkMarkerNewPosition: function(cMarker, newPosition, markers, length) {
            var nextMarker = this.getNextMarker(markers, cMarker.position, length);
            var prevMarker = this.getPreviousMarker(markers, cMarker.position);
            return newPosition > prevMarker.position && newPosition < nextMarker.position;
        }
    };
};

