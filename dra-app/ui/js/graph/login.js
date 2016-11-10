var myApp = angular.module('myApp', []);


myApp.controller('LoginController', ['$scope', '$http', function($scope, $http) {
    $scope.login = function(user) {
    	$http.post("j_security_check", "j_username="+user.name+"&"+"j_password="+user.password).then(function (a,b,c){
    		console.log("Here I am");
    	},
    	function (a,b,c){
    		console.log("Epic fail");
    	});
        console.log("Logged in " + user.name);
    };
}]);