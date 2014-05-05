'use strict';

// Declare app level module which depends on filters, and services
var CocaApp = angular.module('cocaApp', [
    'ngRoute',
    'ui.bootstrap',
    'ui.bootstrap.progressbar',
    'WaveSurferDirective'
]);

// for now only sceditor is shown and usable
CocaApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
                when('/weditor', {
                    templateUrl: 'js/app/coca/partials/weditor.html',
                    controller: 'WaveEditorCtrl'
                }).
                when('/sceditor', {
                    templateUrl: 'js/app/coca/partials/sceditor.html',
                    controller: 'SegmentsEditorCtrl'
                }).
                when('/pleditor', {
                    templateUrl: 'js/app/coca/partials/pleditor.html',
                    controller: 'PlaylistEditorCtrl'
                }).
                otherwise({
                    redirectTo: '/sceditor'
                });
    }]);

// FILTERS

CocaApp.filter('split', function() {
    return function(input, splitChar, splitIndex) {
        // do some bounds checking here to ensure it has that index
        return input.split(splitChar)[splitIndex];
    };
});

CocaApp.filter('flToHHmmss', function() {
    return function(value) {        
         value = Number(value);
            if (value > 0) {
                var hours = Math.floor(value / 3600);
                var minutes = Math.floor(value % 3600 / 60);
                var seconds = Math.floor(value % 3600 % 60);
                // ms
                var str = value.toString();
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
});

// CONTROLLERS

// main controller
CocaApp.controller('MainCtrl', MainCtrl);


// controller for the creation of segments interface
CocaApp.controller('SegmentsEditorCtrl', SegmentsEditorCtrl);

// controller for the audio editing interface
CocaApp.controller('WaveEditorCtrl', WaveEditorCtrl);

// controller for the playlist creation interface
CocaApp.controller('PlaylistEditorCtrl', PlaylistEditorCtrl);

// controller for upload file modal
CocaApp.controller('UploadModalCtrl', UploadModalCtrl);

// controller for xhr progress modal
CocaApp.controller('ProgressModalCtrl', ProgressModalCtrl);

CocaApp.controller('SegmentsCollectionsModalCtrl', SegmentsCollectionsModalCtrl);

CocaApp.controller('SaveCollectionCtrl', SaveCollectionCtrl);

// FACTORIES

CocaApp.factory('WaveSurferFactory', WaveSurferFactory);
CocaApp.factory('UtilsFactory', UtilsFactory);
CocaApp.factory('SegmentCollectionFactory', SegmentCollectionFactory);
CocaApp.factory('SegmentFactory', SegmentFactory);