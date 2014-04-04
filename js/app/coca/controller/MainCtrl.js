'use strict';

/**
 * 
 * @param {type} $scope scope
 */
function MainCtrl($scope, $location) {

    // connected user
    $scope.user =
            {
                'id': '150062f4-2493-4b6c-8a94-7cdea51c248e',
                'name': 'Pitrack',
                'teacher': true
            };

    $scope.navClass = function(page) {
        var currentRoute = $location.path().substring(1) || 'weditor';
        return page === currentRoute ? 'active' : '';
    };

   
}