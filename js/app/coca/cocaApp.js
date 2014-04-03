'use strict';

// Declare app level module which depends on filters, and services
var CocaApp = angular.module('cocaApp', [
    'ngRoute'
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
                    controller: 'SegmentsCreationCtrl'
                }).
                when('/pleditor', {
                    templateUrl: 'js/app/coca/partials/pleditor.html',
                    controller: 'PlaylistCreationCtrl'
                }).
                otherwise({
                    redirectTo: '/weditor'
                });
    }]);

// main controller
CocaApp.controller('MainCtrl', MainCtrl);

// controller for the creation of segments interface
CocaApp.controller('SegmentsCreationCtrl', SegmentsCreationCtrl);

// controller for the audio editing interface
CocaApp.controller('WaveEditorCtrl', WaveEditorCtrl);

// controller for the playlist creation interface
CocaApp.controller('PlaylistCreationCtrl', PlaylistCreationCtrl);


CocaApp.controller('WaveSurferCtrl', WaveSurferCtrl);
