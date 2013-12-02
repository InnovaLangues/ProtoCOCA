'use strict';

// Create an instance
var wavesurfer = Object.create(WaveSurfer);

// Init & load audio file
document.addEventListener('DOMContentLoaded', function () {
    var options = {
        container     : document.querySelector('#waveform'),
        waveColor     : 'lightgrey',
        progressColor : 'black',
        loaderColor   : 'purple',
        cursorColor   : 'navy',
        markerWidth   : 2
    };

    if (location.search.match('scroll')) {
        options.minPxPerSec = 100;
        options.scrollParent = true;
    }

    if (location.search.match('normalize')) {
        options.normalize = true;
    }

    /* Progress bar */
    var progressDiv = document.querySelector('#progress-bar');
    var progressBar = progressDiv.querySelector('.progress-bar');
    wavesurfer.on('loading', function (percent, xhr) {
        progressDiv.style.display = 'block';
        progressBar.style.width = percent + '%';
    });
    wavesurfer.on('ready', function () {
        progressDiv.style.display = 'none';
    });

    // Init
    wavesurfer.init(options);
    // Load audio from URL
    wavesurfer.load('example/media/demo.wav');

    // Start listening to drag'n'drop on document
    wavesurfer.bindDragNDrop('#drop');
});

// Play at once when ready
// Won't work on iOS until you touch the page
wavesurfer.on('ready', function () {
    //wavesurfer.play();
});

// Bind buttons and keypresses
(function () {
    var eventHandlers = {
        'play': function () {
            wavesurfer.playPause();
        },

        'green-mark': function () {
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

        'red-mark': function () {
            var id = generateId();
            var time = secondsToHms(wavesurfer.backend.getCurrentTime());

            //wavesurfer.pause();
            wavesurfer.mark({
                color: 'rgba(255, 0, 0, 0.5)',
                id: id
            });

        },

        'back': function () {
            wavesurfer.skipBackward();
        },

        'forth': function () {
            wavesurfer.skipForward();
        },

        'toggle-mute': function () {
            wavesurfer.toggleMute();
        },

        'play-segment': function () {
            wavesurfer.seekTo(2);
        },

        'delete-marks': function () {
            wavesurfer.clearMarks();
        },
    };

    document.addEventListener('keydown', function (e) {
        var map = {
            20: 'delete-marks', //caps lock 
            32: 'play',       // space
            38: 'green-mark', // up
            40: 'red-mark',   // down
            37: 'back',       // left
            39: 'forth'       // right
        };
        if (e.keyCode in map) {
            var handler = eventHandlers[map[e.keyCode]];
            e.preventDefault();
            handler && handler(e);
        }
    });

    document.addEventListener('click', function (e) {
        var action = e.target.dataset && e.target.dataset.action;
        if (action && action in eventHandlers) {
            eventHandlers[action](e);
        }
    });
}());

// Flash mark when it's played over
wavesurfer.on('mark', function (marker) {
    if (marker.timer) { return; }

    marker.timer = setTimeout(function () {
        var origColor = marker.color;
        marker.update({ color: 'yellow' });

        setTimeout(function () {
            marker.update({ color: origColor });
            delete marker.timer;
        }, 100);
    }, 100);
});

wavesurfer.on('error', function (err) {
    console.error(err);
});


// EVENTS 

$( document ).on("click", ".remove", function() {
    var id = $(this).parents("li").attr("id");
    wavesurfer.markers[id].remove();
    wavesurfer.redrawMarks();
    $(this).parents("li").remove();
}); 


$( document ).on("click", ".move-to-current-time", function() {
    var time = wavesurfer.backend.getCurrentTime();
    updateMarker(time, $(this));
}); 

$( document ).on("click", ".move-backward", function() {
    var time = parseFloat($(this).parents("li").attr("data-time")) - 0.5;
    updateMarker(time, $(this));
});

$( document ).on("click", ".move-forward", function() {
    var time = parseFloat($(this).parents("li").attr("data-time")) + 0.5;
    updateMarker(time, $(this));
}); 

$( document ).on("click", ".play", function() {
    var time = parseFloat($(this).parents("li").attr("data-time"));
    wavesurfer.backend.play(time, time + 2);
});



// FUNCTIONS

function updateMarker(time, btn){
    var id = btn.parents("li").attr("id");
    btn.parents("li").find(".time").html(secondsToHms(time));
    btn.parents("li").attr("data-time",time);
    wavesurfer.markers[id].update({
        id: id,
        position: time,
    });
    wavesurfer.redrawMarks();
}

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var str = d.toString();
    var substr = str.split('.');
    var ms = substr[1].substring(0,2);

    return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s + ":" + ms);
}

function generateId(){
   var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });

    return uuid;
}

function addComment(wsTime, time, id) {
    $('#student-coments').append('<li data-time="'+wsTime+'" id="'+ id +'" class="commment list-group-item"><div class="row"><div class="col-xs-9 col-md-9"><div class="buttons"><button type="button" class="btn btn-success btn-xs play" title="Play"><span class="glyphicon glyphicon-play"></span></button><button type="button" class="btn btn-primary btn-xs edit" title="Edit"><span class="glyphicon glyphicon-pencil"></span><button type="button" class="btn btn-primary btn-xs move-backward" title="Backward 50 ms"><span class="glyphicon glyphicon-backward"></span></button><button type="button" class="btn btn-primary btn-xs move-to-current-time" title="Move to current time"><span class="glyphicon glyphicon-screenshot"></span><button type="button" class="btn btn-primary btn-xs move-forward" title="Forward 50 ms"><span class="glyphicon glyphicon-forward"></span></button><button type="button" class="btn btn-danger btn-xs remove" title="Delete"><span class="glyphicon glyphicon-trash"></span></button></div><h3 class="time">'+time+'</h3><div class="comment-text">Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibheuismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim</div></div></div></li>');
}