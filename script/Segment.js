'use strict';

/**
 * Object constructor
 */
function Segment() {
    this.id = null;
    this.furl = null;
    this.pid = null;
    this.name = null;
    this.text = null;
    this.start = null;
    this.mStartId = null;
    this.end = null;
    this.mEndId = null;
}

/**
 * Properties assignement
 * @param {string}  id     : uuid for the segment
 * @param {string}  furl   : segment file url can be null
 * @param {int}     pid    : parent file id
 * @param {string}  name   : name of the segment
 * @param {string}  text   : text of the segment can be null
 * @param {numeric}  start : start of the segment
 * @param {numeric}  end   : end of the segment 
 */
Segment.prototype.init = function(id, furl, pid, name, text, start, mStartId, end, mEndId) {
    this.id = id;
    this.furl = furl;
    this.pid = pid;
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
 * Persists the segment
 * @param {Segment} s the Segment to save or update
 */
Segment.prototype.saveOrUpdate = function(s){
    console.log('not implemented');
}

/**
 * Delete a segment in database
 * @param {Segment} s the segment to delete
 */
Segment.prototype.delete = function(s){
    console.log('not implemented');
}



