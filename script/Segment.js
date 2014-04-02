'use strict';

/**
 * Object constructor
 */
function Segment() {
    // segment uuid
    this.id = null; 
    // original file url
    this.fUrl = null; 
    // original file id
    this.fId = null;
    // name of the segment (user friendly)
    this.name = null; 
    // segment comments or "subtitle"
    this.text = null; 
    // start of the segment (decimal)
    this.start = null; 
    // start marker uuid 
    this.mStartId = null;
    // end of the segment (decimal)
    this.end = null;
    // end marker uuid 
    this.mEndId = null;
}

/**
 * Properties assignement
 * @param {string}  id          : uuid for the segment
 * @param {string}  fUrl        : segment file url
 * @param {int}     fId         : segment file id
 * @param {string}  name        : name of the segment
 * @param {string}  text        : text of the segment can be null
 * @param {number}  start       : start of the segment
 * @param {number}  end         : end of the segment 
 * @param {string}  mStartId    : start marker uuid 
 * @param {string}  mEndId      : end marker uuid 
 */
Segment.prototype.init = function(id, fUrl, fId, name, text, start, mStartId, end, mEndId) {
    this.id = id;
    this.fUrl = fUrl;
    this.fId = fId;
    this.name = name;
    this.text = text;
    this.start = start;
    this.end = end;
    this.mStartId = mStartId || 0;
    this.mEndId = mEndId || 0;
};

Segment.prototype.toString = function() {
    return 'ID : ' + this.id + ' NAME : ' + this.name + ' START : ' + this.start + ' END ' + this.end;
};


/**
 * Persists the segment in database
 * @param {Segment} s the Segment to save or update
 */
Segment.prototype.saveOrUpdate = function(s){
    console.log('not implemented');
};

/**
 * Delete a segment in database
 * @param {Segment} s the segment to delete
 */
Segment.prototype.delete = function(s){
    console.log('not implemented');
};



