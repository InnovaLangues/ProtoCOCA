'use strict';

// Declare app level module which depends on filters, and services
var CocaApp = angular.module('cocaApp', [
    'ngRoute',
    'ui.bootstrap',
    'ui.bootstrap.progressbar',
    'WaveSurferDirective'
]);

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
                    redirectTo: '/weditor'
                });
    }]);

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

// Factories
CocaApp.factory('WaveSurferFactory', WaveSurferFactory);
CocaApp.factory('UtilsFactory', UtilsFactory);
CocaApp.factory('SegmentCollectionFactory', SegmentCollectionFactory);
CocaApp.factory('SegmentFactory', SegmentFactory);