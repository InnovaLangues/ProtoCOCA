'use strict';


function SegmentFactory() {

    return{
        create: function(id, fUrl, fId, name, text, start, mStartId, end, mEndId) {
            var segment = {
                id: id,
                fUrl: fUrl,
                fId: fId,
                name: name,
                text: text,
                start: start,
                end: end,
                mStartId: mStartId || 0,
                mEndId: mEndId || 0
            };
            return segment;
        },
        getSegmentById: function(id, segments) {
            var result = null;
            for (var i = 0; i < segments.length; i++) {
                if (segments[i].id === id) {
                    result = segments[i];
                    break;
                }
            }
            return result;
        },
        getSegmentIndexById: function(id, segments) {
            var result = null;
            for (var i = 0; i < segments.length; i++) {
                if (segments[i].id === id) {
                    result = i;
                    break;
                }
            }
            return result;
        },
        getSegmentByCurrentPosition: function(position, segments) {
            var result = null;
            for (var i = 0; i < segments.length; i++) {
                if (segments[i].start < position && segments[i].end > position) {
                    result = segments[i];
                    break;
                }
            }
            return result;
        },
        /**
         * Get the segment before the one passed in argument
         * @param {Segment} currentSegment the segment for witch we want to get the previous Segment
         * @param {Array} segments array of existing segments
         * @returns {Segment} return the founded segment or null if not found
         */
        getPreviousSegment: function(currentSegment, segments) {
            var result = null;
            for (var i = 0; i < segments.length; i++) {
                if (segments[i].end === currentSegment.start) {
                    result = segments[i];
                    break;
                }
            }
            return result;
        },
        /**
         * Get the segment after the one passed in argument 
         * @param {Segment} currentSegment the segment for witch we want to get the next Segment
         * @param {Array} segments array of existing segments
         * @returns {Segment} return the founded segment or null if not found
         */
        getNextSegment: function(currentSegment, segments) {
            var result = null;
            for (var i = 0; i < segments.length; i++) {
                if (segments[i].start === currentSegment.end) {
                    result = segments[i];
                    break;
                }
            }
            return result;
        },
        mergeSegments: function(segment, sIndex, segments, markers) {
            // is first segment ?
            if (this.getPreviousSegment(segment, segments) === null) {
                console.log('ici');
                // get next segment to merge datas of first segment and next one
                var nSegment = this.getNextSegment(segment, segments);
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
                var pSegment = this.getPreviousSegment(segment, segments);
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
        }

    };
}

