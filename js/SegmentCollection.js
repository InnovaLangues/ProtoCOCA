'use strict';

/**
 * 
 * @param {string}  id segment collection uuid
 * @param {string}  name segment collection name
 * @param {string}  fId segment collection source file id
 * @param {string}  fUrl segment collection source file url
 * @param {array}   segments segment collection segments
 * @returns {SegmentCollection}
 */
function SegmentCollection(id, name, fId, fUrl, segments) {
    this.id = id;
    this.name = name;
    this.fId = fId;
    this.fUrl = fUrl;
    this.segments = segments;
    
}


