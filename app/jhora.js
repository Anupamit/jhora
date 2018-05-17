const {shell} = require('electron')
const {dialog} = require('electron').remote

let jhora = angular.module('jhora', ['ngRoute', 'ngMaterial', 'ngMessages']);
jhora.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "index2.html"
    })
    .when("/red", {
        templateUrl : "red.htm"
    })
    .when("/green", {
        templateUrl : "green.htm"
    })
    .when("/blue", {
        templateUrl : "blue.htm"
    });
});
jhora.controller('jhoraCtrl', function($scope) {
  $scope.villages = ['Daniyari', 'Gadahia Mohan', 'Koindaha'];
  $scope.currentNavItem = '0';
  $scope.tabs = [{title:'Customer', content:'customer/customer.html'}, 
                 {title:'View Customer', content:'customer/customerView.html'},
                 {title:'Transection', content:'transection/transection.html'},
                 {title:'View Transection', content:'transection/transectionView.html'}
               ];
  $scope.template = $scope.tabs[0].content;
  $scope.goto = function(page) {
    $scope.template = $scope.tabs[page].content;
  };             
});
// .config(function($mdThemingProvider) {
//   $mdThemingProvider.theme('docs-dark', 'default')
//     .primaryPalette('yellow')
//     .dark();
// 
// });
