'use strict';

/**
 * 
 */
function Utils() {

}

/**
 * Create a unique UUID
 * @returns string unique uuid
 */
Utils.prototype.generateUUID = function() {
    return uuid.v4();
};

/**
 * Convert a time data (125.25 in a hh:mm:ss string)
 * @param {numeric} d
 * @returns {string} hh:mm:ss
 */
Utils.prototype.secondsToHms = function secondsToHms(d) {
    d = Number(d);
    if (d > 0) {
        /*
         var h = Math.floor(d / 3600);
         var m = Math.floor(d % 3600 / 60);
         var s = Math.floor(d % 3600 % 60);
         
         //var str = d.toString();
         //var substr = str.split('.');
         
         //var ms = substr[1].substring(0, 2);
         return ((h > 0 ? h + ":" : "00:") + (m > 0 ? (h > 0 && m < 10 ? "00" : "") + m + ":" : "00:") + (s < 10 ? "00" : "") + s);
         //return ((h > 0 ? h + ":" : "00:") + (m > 0 ? (h > 0 && m < 10 ? "00" : "") + m + ":" : "00:") + (s < 10 ? "00" : "") + s + ":" + ms);
         */
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
};

Utils.prototype.countMarkers = function(markers) {
    var nb = 0;
    for (var marker in markers) {
        nb++;
    }
    return nb;
};

/**
 * When creating a new marker check if position is valid (!start, !end) 
 * and if no marker exists at the same positions
 * @param {Object} markers Object list of marker
 * @param {numeric} position the position where we want to create new marker
 * @returns {bool} true if new marker position is valid
 */
Utils.prototype.checkNewMarkerPosition = function(markers, position) {

    for (var marker in markers) {
        if (position === markers[marker].position) {
            return false;
        }
    }
    return true;
};

/**
 * Retrieve the nearest next marker from a ref position
 * @param {object} markers collection of markers object
 * @param {number} cMarkerPosition current marker position (time search reference)
 * @param {number} totalLength length of the sound file
 * @returns {WavesurferMarker} marker found or null if no marker found
 */
Utils.prototype.getNextMarker = function(markers, cMarkerPosition, totalLength) {
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
};

/**
 * Retrieve the nearest previous marker from a ref position
 * @param {object} markers collection of markers object
 * @param {number} cMarkerPosition current marker position (time search reference)
 * @returns {WavesurferMarker} marker found or null if no marker found
 */
Utils.prototype.getPreviousMarker = function(markers, cMarkerPosition) {
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
};


Utils.prototype.isFirstOrLastMarker = function(cMarker, duration) {
    return cMarker.position === 0 || cMarker.position === duration;
};

/**
 * Check if the new position wanted for the current Marker is correct (between previous / next marker positions)
 * Note that we can not move first or last marker so nextMarker and prevMarker are always existing
 * @param {Wavesurfer.Marker} cMarker current marker
 * @param {number} newPosition the position asked for marker
 * @param {List of Wavesurfer.Marker} markers
 * @param {number} length length of file
 * @returns {bool} true if correct position
 */
Utils.prototype.checkMarkerNewPosition = function(cMarker, newPosition, markers, length) {
    var nextMarker = this.getNextMarker(markers, cMarker.position, length);
    var prevMarker = this.getPreviousMarker(markers, cMarker.position);
    return newPosition > prevMarker.position && newPosition < nextMarker.position;
};


Utils.prototype.getSegmentById = function(id, segments) {
    var result = null;
    for (var i = 0; i < segments.length; i++) {
        if (segments[i].id === id) {
            result = segments[i];
            //console.log(i +  ' segment id ' +  segments[i].id);
            break;
        }
    }
    return result;
};

Utils.prototype.getSegmentIndexById = function(id, segments) {
    var result = null;
    for (var i = 0; i < segments.length; i++) {
        if (segments[i].id === id) {
            result = i;
            //console.log(i +  ' segment id ' +  segments[i].id);
            break;
        }
    }
    return result;
};

Utils.prototype.getSegmentByCurrentPosition = function(position, segments) {
    var result = null;
    for (var i = 0; i < segments.length; i++) {
        //s.start < currentTime && s.end > currentTime
        if (segments[i].start < position && segments[i].end > position) {
            result = segments[i];
            //console.log(i +  ' segment id ' +  segments[i].id);
            break;
        }
    }
    return result;
};

/**
 * Get the segment before the one passed in argument * 
 * @param {Segment} currentSegment the segment for witch we want to get the previous Segment
 * @param {Array} segments array of existing segments
 * @returns {Segment} return the founded segment or null if not found
 */
Utils.prototype.getPreviousSegment = function(currentSegment, segments) {
    var result = null;
    for (var i = 0; i < segments.length; i++) {
        if (segments[i].end === currentSegment.start) {
            result = segments[i];
            break;
        }
    }
    return result;
};

/**
 * Get the segment after the one passed in argument 
 * @param {Segment} currentSegment the segment for witch we want to get the next Segment
 * @param {Array} segments array of existing segments
 * @returns {Segment} return the founded segment or null if not found
 */
Utils.prototype.getNextSegment = function(currentSegment, segments) {
    var result = null;
    for (var i = 0; i < segments.length; i++) {
        if (segments[i].start === currentSegment.end) {
            result = segments[i];
            break;
        }
    }
    return result;
};


Utils.prototype.mergeSegments = function(segment, sIndex, segments, markers) {
    // is first segment ?
    if (appUtils.getPreviousSegment(segment, segments) === null) {
        // get next segment to merge datas of first segment and next one
        var nSegment = appUtils.getNextSegment(segment, segments);
        if (nSegment) {
            // change next segment start
            nSegment.start = segment.start;
            nSegment.mStartId = segment.mStartId;
            // remove current segment end marker
            markers[segment.mEndId].remove();
            // remove first segment from array
            segments.splice(sIndex, 1);
        }
    }
    // is last segment or other segments ?
    else {
        var pSegment = appUtils.getPreviousSegment(segment, segments);
        if (pSegment) {
            // change previous segment end and marker id
            pSegment.end = segment.end;
            pSegment.mEndId = segment.mEndId;
            // remove current segment end marker
            markers[segment.mStartId].remove();
            // remove first segment from array
            segments.splice(sIndex, 1);
        }
    }
    return segments;
};

Utils.prototype.xhr = function(url, data, progress, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {            
            var response = JSON.parse(request.responseText);
            // console.log(response);
            callback(response);
        }
    };

    request.upload.onprogress = function(e) {
        if (!progress)
            return;
        if (e.lengthComputable) {
            progress.value = (e.loaded / e.total) * 100;
            progress.textContent = progress.value; // Fallback for unsupported browsers.
        }

        if (progress.value === 100) {
            progress.value = 0;
        }
    };
    request.open('POST', url);
    request.send(data);
};

