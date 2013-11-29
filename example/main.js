'use strict';

// Create an instance
var wavesurfer = Object.create(WaveSurfer);

// Init & load audio file
document.addEventListener('DOMContentLoaded', function () {
    var options = {
        container     : document.querySelector('#waveform'),
        waveColor     : 'violet',
        progressColor : 'purple',
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

            var time = secondsToHms(wavesurfer.backend.getCurrentTime());
            addComment(time);

            wavesurfer.mark({
                color: 'rgba(0, 255, 0, 0.5)'
            });

            //alert('marked at position : ' + wavesurfer.backend.getCurrentTime().toFixed(2));
        },

        'red-mark': function () {
            //wavesurfer.pause();
            wavesurfer.mark({
                color: 'rgba(255, 0, 0, 0.5)'
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
    };

    document.addEventListener('keydown', function (e) {
        var map = {
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


/*Dono*/
function addComment(time) {
    $('#student-coments').append('<li class="list-group-item"><div class="row"><div class="col-xs-2 col-md-2"><div class="action"><button type="button" class="btn btn-success btn-xs" title="Approved"><span class="glyphicon glyphicon-play"></span></button><button type="button" class="btn btn-primary btn-xs" title="Edit"><span class="glyphicon glyphicon-pencil"></span></button><button type="button" class="btn btn-danger btn-xs" title="Delete"><span class="glyphicon glyphicon-trash"></span></button></div></div><div class="col-xs-10 col-md-10"><h3>'+time+'</h3><div class="comment-text">Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibheuismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim</div></div></div></li>');
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

function seekSegmentAndPlay(time) {

}