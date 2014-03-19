'use strict';

// Create an instance
var wavesurfer = Object.create(WaveSurfer);

var timeline;

var isStudent = true;

// Init & load audio file
document.addEventListener('DOMContentLoaded', function() {

    // hide student / teacher part depending on who i am
    if (isStudent) {
        $("#teacher-markers").css('display', 'none');
        $("#teacher-tools").css('display', 'none');
        $("#student-markers").css('visibility', 'visible');
        $("#student-tools").css('visibility', 'visible');
    }
    else {
        $("#teacher-markers").css('visibility', 'visible');
        $("#teacher-tools").css('visibility', 'visible');
        $("#student-markers").css('display', 'none');
        $("#student-tools").css('display', 'none');
    }

    var options = {
        container: document.querySelector('#waveform'),
        waveColor: 'lightgrey',
        progressColor: 'black',
        loaderColor: 'purple',
        cursorColor: 'navy',
        markerWidth: 1
    };

    if (location.search.match('scroll')) {
        options.minPxPerSec = 100;
        options.scrollParent = true;
    }

    /* Progress bar */
    var progressDiv = document.querySelector('#progress-bar');
    var progressBar = progressDiv.querySelector('.progress-bar');
    wavesurfer.on('loading', function(percent, xhr) {
        progressDiv.style.display = 'block';
        progressBar.style.width = percent + '%';
    });
    wavesurfer.on('ready', function() {
        // progressDiv.style.display = 'none';
    });

    // listen to progress event
    wavesurfer.on('progress', function() {
        $('#time').text(secondsToHms(wavesurfer.backend.getCurrentTime()));
    });

    // Init
    wavesurfer.init(options);
    // Load audio from URL
    wavesurfer.load('media/demo_jpp.mp3');

    // Start listening to drag'n'drop on document
    wavesurfer.bindDragNDrop('#drop');
});

// Won't work on iOS until you touch the page
wavesurfer.on('ready', function() {
    var progressDiv = document.querySelector('#progress-bar');
    progressDiv.style.display = 'none';
    // init time-text with current time
    $('#time').text(secondsToHms(wavesurfer.backend.getCurrentTime()));

    // load red marks & draw them to teacher markers zone
    var duration = wavesurfer.backend.getDuration();
    var markerGap = (duration / 4);
    var mTime = markerGap;

    var red = Object.create(WaveSurfer.Mark);
    red.id = wavesurfer.util.getId();
    red.position = mTime;
    red.color = '#ff0000';
    red.type = 'teacher';
    wavesurfer.mark(red);

    var comment = 'Comment 1';

    var id = generateId();
    var time = secondsToHms(mTime);
    var wsTime = mTime;
    addTeacherComment(wsTime, time, id, comment);

    mTime += markerGap;

    red = Object.create(WaveSurfer.Mark);
    red.id = wavesurfer.util.getId();
    red.position = mTime;
    red.color = '#ff0000';
    red.type = 'teacher';
    wavesurfer.mark(red);

    comment = 'Comment 2';
    id = generateId();
    time = secondsToHms(mTime);
    wsTime = mTime;
    addTeacherComment(wsTime, time, id, comment);

    mTime += markerGap;

    red = Object.create(WaveSurfer.Mark);
    red.id = wavesurfer.util.getId();
    red.position = mTime;
    red.color = '#ff0000';
    red.type = 'teacher';
    wavesurfer.mark(red);

    id = generateId();
    time = secondsToHms(mTime);
    wsTime = mTime;
    addTeacherComment(wsTime, time, id);

    // avoid creating timeline object twice (after drag&drop for example)
    if (timeline) {
        $('#wave-timeline wave').remove();
    }
    else {
        // create timeline object
        timeline = Object.create(WaveSurfer.Timeline);
    }

    timeline.init({
        wavesurfer: wavesurfer,
        container: '#wave-timeline'
    });
});

// Bind buttons and keypresses
(function() {
    var eventHandlers = {
        'play': function() {
            wavesurfer.playPause();
        },
        'green-mark': function() {
            var id = generateId();
            var time = secondsToHms(wavesurfer.backend.getCurrentTime());
            var wsTime = wavesurfer.backend.getCurrentTime();
            addStudentComment(wsTime, time, id);

            wavesurfer.mark({
                color: 'rgba(0, 255, 0, 0.5)',
                id: id
            });

        },
        'red-mark': function() {
            var id = generateId();
            var time = secondsToHms(wavesurfer.backend.getCurrentTime());
            var wsTime = wavesurfer.backend.getCurrentTime();
            addTeacherComment(wsTime, time, id);

            wavesurfer.mark({
                color: 'rgba(255, 0, 0, 0.5)',
                id: id,
                type: 'teacher'
            });
        },
        'back': function() {
            moveBackward();
        },
        'forth': function() {
            moveForward();
        },
        'toggle-mute': function() {
            wavesurfer.toggleMute();
        },
        'play-segment': function() {
            wavesurfer.seekTo(2);
        },
        'delete-marks': function() {
            // depending on who i am (student or teacher) only remove red or green markers
 
            Object.keys(wavesurfer.markers).forEach(function(id) {
                var marker = wavesurfer.markers[id];
                var type = marker.type;
                // green markers
                if ('student' === type && isStudent) {
                    wavesurfer.markers[id].remove();
                }
                else if ('teacher' === type && !isStudent) {
                    wavesurfer.markers[id].remove();
                }
                wavesurfer.redrawMarks();
            });
            // also delete li(s) in DOM
            if (isStudent)
                $('#student-comments > li').remove();
            else
                $('#teacher-comments > li').remove();
        },
        'change-speed': function(e) {
            // console.log(wavesurfer.backend.source);
            var value = e.target.dataset && e.target.dataset.value; 
            wavesurfer.playPause();
            wavesurfer.backend.setPlaybackRate(value);
            wavesurfer.playPause();
           
            
            /*var audio = document.getElementById('audio-test');
            console.log(audio.playbackRate);
            audio.playbackRate = value;*/
            //console.log(listener.dopplerFactor);
           // var dopplerShift = 1; // Initialize to default value
           // var dopplerFactor = listener.dopplerFactor;
            
            
            //wavesurfer.backend.source.playbackRate.value = value;
            //console.log(wavesurfer.backend.source);
            //wavesurfer.playPause();
           
            
            //wavesurfer.setParam('audioRate', value);
            //wavesurfer.playPause();
        }
    };

    // keyboard events
    document.addEventListener('keydown', function(e) {
        var map = {
            20: 'delete-marks', //caps lock 
            32: 'play', // space
            38: 'green-mark', // up
            40: 'red-mark', // down
            37: 'back', // left
            39: 'forth'       // right
        };
        if (e.keyCode in map) {
            var handler = eventHandlers[map[e.keyCode]];
            e.preventDefault();
            handler && handler(e);
        }
    });

    document.addEventListener('click', function(e) {
        var action = e.target.dataset && e.target.dataset.action;
        if (action && action in eventHandlers) {
            eventHandlers[action](e);
        }
    });
}());

// Flash mark when it's played over
wavesurfer.on('mark', function(marker) {
    if (marker.timer) {
        return;
    }

    marker.timer = setTimeout(function() {
        var origColor = marker.color;
        marker.update({color: 'yellow'});

        setTimeout(function() {
            marker.update({color: origColor});
            delete marker.timer;
        }, 100);
    }, 100);
});

wavesurfer.on('error', function(err) {
    console.error(err);
});


// STUDENT MARKER EVENTS 

/**
 * Delete marker
 */
$(document).on("click", ".remove", function() {
    var id = $(this).parents("li").attr("id");
    wavesurfer.markers[id].remove();
    wavesurfer.redrawMarks();
    $(this).parents("li").remove();
});

/**
 * Move marker to current cursor position
 */
$(document).on("click", ".move-to-current-time", function() {
    var time = wavesurfer.backend.getCurrentTime();
    updateMarker(time, $(this));
});

/**
 * Move playing cursor at marker location
 */
$(document).on("click", ".move-cursor-to", function() {
    var time = parseFloat($(this).parents("li").attr("data-time"));
    var delta = time - wavesurfer.backend.getCurrentTime();
    wavesurfer.skip(delta);
});

// FUNCTIONS

function updateMarker(time, btn) {
    var id = btn.parents("li").attr("id");
    btn.parents("li").find(".time").html(secondsToHms(time));
    btn.parents("li").attr("data-time", time);
    wavesurfer.markers[id].update({
        id: id,
        position: time,
    });
    wavesurfer.redrawMarks();
}

function secondsToHms(d) {
    if (d > 0) {
        d = Number(d);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);

        var str = d.toString();
        var substr = str.split('.');

        var ms = substr[1].substring(0, 2);

        return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s + ":" + ms);
    }
    else {

        return "00:00:00";
    }
}

function generateId() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });

    return uuid;
}

function addStudentComment(wsTime, time, id) {

    // insert new comment in the right place (between previous and next comment)

    // the li after wich we have to create the new comment
    var liBefore = null;
    // the li before wich we have to create the new comment
    var liAfter = null;

    $('#student-comments > li').each(function() {

        var cComment = $(this);
        var cTime = cComment.attr('data-time');
        if (cComment && wsTime > cTime) {
            var nComment = $(this).next();
            var nTime = nComment.attr('data-time');
            if (!nComment || nTime > wsTime) {
                // append new li here
                liBefore = cComment;
                return false;
            }
        }
        else if (wsTime < cTime) { // just on marker or we want to place the new comment before the first one
            liAfter = cComment;
            return false;
        }
    });

    var content = '<li data-time="' + wsTime + '" id="' + id + '" class="commment list-group-item">\n\
                    <div class="row">\n\
                        <div class="buttons col-md-4">\n\
                            <button type="button" class="btn btn-success btn-xs move-cursor-to" title="Move cursor to">\n\
                                <span class="glyphicon glyphicon-move"></span>\n\
                            </button>\n\
                            <button type="button" class="btn btn-primary btn-xs move-to-current-time" title="Move marker to current time">\n\
                                    <span class="glyphicon glyphicon-screenshot"></span>\n\
                            </button>\n\
                            <button type="button" class="btn btn-danger btn-xs remove" title="Delete marker">\n\
                                <span class="glyphicon glyphicon-trash"></span>\n\
                            </button>\n\
                        </div>\n\
                        <div class="col-md-4">\n\
                             <span class="time">' + time + '</span>\n\
                        </div>\n\
                        <div class="col-md-4">\n\
                            <label>Commentaire</label>\n\
                        </div>\n\
                        <textarea class="comment-text"></textarea>\n\
                    </div>\n\
                   </li>';

    // Happend to DOM
    if (null == liBefore && null == liAfter) {
        $('#student-comments').append(content);
    }
    else if (liBefore && null == liAfter) {
        $(liBefore).after(content);
    }
    else if (liAfter && null == liBefore) {
        $(liAfter).before(content);
    }
}

function addTeacherComment(wsTime, time, id, comment) {
    // insert new comment in the right place (between previous and next comment)

    // the li after wich we have to create the new comment
    var liBefore = null;
    // the li before wich we have to create the new comment
    var liAfter = null;

    $('#teacher-comments > li').each(function() {

        var cComment = $(this);
        var cTime = cComment.attr('data-time');

        if (cComment && wsTime > cTime) {
            var nComment = $(this).next();
            var nTime = nComment.attr('data-time');
            if (!nComment || nTime > wsTime) {
                liBefore = cComment;
                return false;
            }
        }
        else if (wsTime < cTime) { // just one marker or we want to place the new comment before the first one
            liAfter = cComment;
            return false;
        }
    });

    var myComment = comment == null ? '' : comment;

    var content = '<li data-time="' + wsTime + '" id="' + id + '" class="commment list-group-item">\n\
                    <div class="row">\n\
                        <div class="buttons col-md-4">\n\
                            <button type="button" class="btn btn-success btn-xs move-cursor-to" title="Move cursor to">\n\
                                <span class="glyphicon glyphicon-move"></span>\n\
                            </button>\n\
                            <button type="button" class="btn btn-primary btn-xs move-to-current-time" title="Move marker to current time">\n\
                                    <span class="glyphicon glyphicon-screenshot"></span>\n\
                            </button>\n\
                            <button type="button" class="btn btn-danger btn-xs remove" title="Delete marker">\n\
                                <span class="glyphicon glyphicon-trash"></span>\n\
                            </button>\n\
                        </div>\n\
                        <div class="col-md-4">\n\
                             <span class="time">' + time + '</span>\n\
                        </div>\n\
                        <div class="col-md-4">\n\
                            <label>Commentaire</label>\n\
                        </div>\n\
                        <textarea class="comment-text">' + myComment + '</textarea>\n\
                    </div>\n\
                   </li>';

    // Happend to DOM
    if (null == liBefore && null == liAfter) {
        $('#teacher-comments').append(content);
    }
    else if (liBefore && null == liAfter) {
        $(liBefore).after(content);
    }
    else if (liAfter && null == liBefore) {
        $(liAfter).before(content);
    }
}



/**
 * move to :
 * - nearest previous marker (relatively to cursor position) if exists
 * - begining of the file if no marker 
 */
function moveBackward() {

    // get markers
    var markers = wavesurfer.markers;
    var currentTime = wavesurfer.backend.getCurrentTime();
    var delta = 0;

    for (var marker in markers) {
        // current marker position
        var mPosition = markers[marker].position;
        // previous marker ?
        if (mPosition < currentTime) {
            // get delta between cursor current position && marker position (negative values)
            var tempDelta = mPosition - wavesurfer.backend.getCurrentTime();
            // is it the nearest previous marker ?
            if (delta === 0 || tempDelta > delta) {
                delta = tempDelta;
            }
        }
    }
    if (delta !== 0)
        wavesurfer.skip(delta);
    else
        wavesurfer.seekTo(0);
}

/**
 * move to :
 * - nearest next marker (relatively to cursor position) if exists
 * - end of the file if no marker 
 */
function moveForward() {

    // get markers
    var markers = wavesurfer.markers;
    var currentTime = wavesurfer.backend.getCurrentTime();
    var delta = wavesurfer.backend.getDuration();

    for (var marker in markers) {
        // current marker position
        var mPosition = markers[marker].position;

        // is marker position greater than current position ?
        if (mPosition > currentTime) {
            // get delta between cursor current position && marker position
            var tempDelta = mPosition - wavesurfer.backend.getCurrentTime();
            // is it the nearest next marker ?
            if (tempDelta < delta) {
                delta = tempDelta;
            }
        }
    }
    wavesurfer.skip(delta);
}
