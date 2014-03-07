'use strict';

// Create an instance
var wavesurfer = Object.create(WaveSurfer);

var timeline;

// Init & load audio file
document.addEventListener('DOMContentLoaded', function() {

    var options = {
        container: document.querySelector('#waveform'),
        waveColor: 'lightgrey',
        progressColor: 'black',
        loaderColor: 'purple',
        cursorColor: 'navy',
        markerWidth: 2
    };

    if (location.search.match('scroll')) {
        options.minPxPerSec = 100;
        options.scrollParent = true;
    }

    /*if (location.search.match('normalize')) {
     options.normalize = true;
     }*/

    /* Progress bar */
    var progressDiv = document.querySelector('#progress-bar');
    var progressBar = progressDiv.querySelector('.progress-bar');
    wavesurfer.on('loading', function(percent, xhr) {
        progressDiv.style.display = 'block';
        progressBar.style.width = percent + '%';
    });
    wavesurfer.on('ready', function() {
        progressDiv.style.display = 'none';
    });

    // listen to progress event
    wavesurfer.on('progress', function() {
        $('#time').text(secondsToHms(wavesurfer.backend.getCurrentTime()));
    });

    // Init
    wavesurfer.init(options);
    // Load audio from URL
    wavesurfer.load('example/media/demo.wav');

    // Start listening to drag'n'drop on document
    wavesurfer.bindDragNDrop('#drop');
});

// Won't work on iOS until you touch the page
wavesurfer.on('ready', function() {

    // init current time text
    $('#time').text(secondsToHms(wavesurfer.backend.getCurrentTime()));

    // avoid creating timeline object twice
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
            //wavesurfer.pause();
            var id = generateId();
            var time = secondsToHms(wavesurfer.backend.getCurrentTime());
            var wsTime = wavesurfer.backend.getCurrentTime();
            addComment(wsTime, time, id);

            wavesurfer.mark({
                color: 'rgba(0, 255, 0, 0.5)',
                id: id
            });

        },
        'red-mark': function() {
            var id = generateId();
            var time = secondsToHms(wavesurfer.backend.getCurrentTime());

            //wavesurfer.pause();
            wavesurfer.mark({
                color: 'rgba(255, 0, 0, 0.5)',
                id: id
            });

        },
        'back': function() {
            moveBackward();
            //wavesurfer.skipBackward();
        },
        'forth': function() {
            //wavesurfer.skipForward();
            moveForward();
        },
        'toggle-mute': function() {
            wavesurfer.toggleMute();
        },
        'play-segment': function() {
            wavesurfer.seekTo(2);
        },
        'delete-marks': function() {
            wavesurfer.clearMarks();
            // also delete
            $('#student-coments > li').remove();
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

    // problème de récupération de l'action si click sur icone
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

/*
 $(document).on("click", ".move-backward", function() {
 var time = parseFloat($(this).parents("li").attr("data-time")) - 0.5;
 updateMarker(time, $(this));
 });
 
 $(document).on("click", ".move-forward", function() {
 var time = parseFloat($(this).parents("li").attr("data-time")) + 0.5;
 updateMarker(time, $(this));
 
 });$(document).on("click", ".play", function() {
 var time = parseFloat($(this).parents("li").attr("data-time"));
 wavesurfer.backend.play(time, time + 2);
 });
 */


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

function addComment(wsTime, time, id) {
    /*$('#student-coments').append(
     '<li data-time="' + wsTime + '" id="' + id + '" class="commment list-group-item">\n\
     <div class="row">\n\
     <div class="buttons">\n\
     <button type="button" class="btn btn-success btn-xs play" title="Play">\n\
     <span class="glyphicon glyphicon-play"></span>\n\
     </button>\n\
     <!--<button type="button" class="btn btn-primary btn-xs edit" title="Edit">\n\
     <span class="glyphicon glyphicon-pencil"></span>\n\
     </button>-->\n\
     <!--<button type="button" class="btn btn-primary btn-xs move-backward" title="Backward 50 ms">\n\
     <span class="glyphicon glyphicon-backward"></span>\n\
     </button>-->\n\
     <button type="button" class="btn btn-primary btn-xs move-to-current-time" title="Move to current time">\n\
     <span class="glyphicon glyphicon-screenshot"></span>\n\
     </button>\n\
     <!--<button type="button" class="btn btn-primary btn-xs move-forward" title="Forward 50 ms">\n\
     <span class="glyphicon glyphicon-forward"></span>\n\
     </button>-->\n\
     <button type="button" class="btn btn-danger btn-xs remove" title="Delete">\n\
     <span class="glyphicon glyphicon-trash"></span>\n\
     </button>\n\
     </div>\n\
     <h3 class="time">' + time + '</h3>\n\
     <textarea class="comment-text"></textarea>\n\
     </div>\n\
     </li>'
     );*/

    $('#student-coments').append(
            '<li data-time="' + wsTime + '" id="' + id + '" class="commment list-group-item">\n\
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
                    <hr/>\n\
            </li>'
            );
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

// override wavesurfer method in order to allow the set of playback rate
wavesurfer.playPause = function(playbackRate) {
    //console.log('passed');

    // base
    this.backend.isPaused() ? this.play() : this.pause();

    //this.backend.playbackRate(2);
    //this.backend.isPaused() ? this.play() : this.pause();
    //this.wavesurfer.backend.source.playbackRate = 2;
    //console.log(this.backend.webaudio.source);

    /*
     if (!playbackRate) {
     playbackRate = 1;
     }
     if (this.isLoaded === true) {
     var audio_context = wavesurfer.backend.ac;
     var playSound = wavesurfer.backend.ac.createBufferSource();
     playSound.buffer = wavesurfer.load('example/media/demo.wav');
     playSound.connect(this.panner);
     playSound.playbackRate.value = playbackRate;
     this.panner.connect(this.volume);
     this.volume.connect(audioContext.destination);
     
     }
     */
};
