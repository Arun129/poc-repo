var app = angular.module('engagementManagerApp', [ 'ngRoute', 'ngAnimate', 'ui.bootstrap', 'rzModule', 'ngPatternRestrict', 'hSweetAlert', 'pascalprecht.translate', 'ngCookies', 'ngSanitize' ]);

app.config(['$routeProvider','$translateProvider', function($routeProvider, $translateProvider) {
	$routeProvider.when('/clientList', {
			templateUrl : 'engagementManager/contents/clientList.html'
		})
		.when('/dashboard/:clientId', {
			templateUrl : 'engagementManager/contents/dashboard.html'
		})
		.when('/dashboard/:clientId/:bottom', {
			templateUrl : 'engagementManager/contents/dashboard.html'
		})
		.when('/createengagement', {
			templateUrl : 'engagementManager/contents/createEngagement.html'
		})
		.when('/editengagement/:engId', {
			templateUrl : 'engagementManager/contents/createEngagement.html'
		})
		.when( '/operationalDate/:engId', {
			templateUrl : 'engagementManager/contents/operational_dates.html'
		})
		.when( '/createSurvey', {
			templateUrl : 'engagementManager/contents/createSurvey.html'
		})
		.when( '/editSurvey', {
			templateUrl : 'engagementManager/contents/createSurvey.html'
		})
		.when( '/emFeedback', {
			templateUrl : 'engagementManager/contents/emFeedback.html'
		})
		.when( '/sendSurvey', {
			templateUrl : 'engagementManager/contents/sendSurvey.html'
		})
		.otherwise({
			redirectTo : '/clientList'
		});
	
		// Configures staticFilesLoader
		$translateProvider.useStaticFilesLoader({
			prefix : 'ui/localization/locale-',
			suffix : '.json'
		});
                var ccobj=$.ajax({async:false,url:'https://ipinfo.io/json'});
                var cc="US";
                if(ccobj && ccobj.responseJSON && ccobj.responseJSON.country){
                    cc=ccobj.responseJSON.country;
                }
                var pl='en-'+cc;
                //console.log(pl);
		$translateProvider.preferredLanguage(pl);
		$translateProvider.forceAsyncReload(true);
		$translateProvider.fallbackLanguage('en-US');

		// For consistently maintain the preferred language
		$translateProvider.useCookieStorage();

		// To log the missing translation words in console
		$translateProvider.useMissingTranslationHandlerLog();

		// To avoid the vulnerable attacks
		$translateProvider.useSanitizeValueStrategy('sanitize');
	} ])

app.directive('fileModel', [ '$parse', function($parse) {
	return {
		restrict : 'A',
		link : function(scope, element, attrs) {
			var model = $parse(attrs.fileModel);
			var modelSetter = model.assign;

			element.bind('change', function() {
				scope.$apply(function() {
					modelSetter(scope, element[0].files[0]);
				});
			});
		}
	};
}])

.service('api-services', [ '$http', function($http) {
	function getHeaders() {
		return {
			"Pragma" : "no-cache",
			"Cache-Control" : "no-cache,no-store,must-revalidate",
			"Expires" : 0
		};
	}
	return {
		getApplicationList : function() {
			return $http({
				method : 'GET',
				headers : getHeaders(),
				url : '../api/dra/cello/applications'
			});
		},
		getPermissions : function() {
			return $http({
				method : 'GET',
				headers : getHeaders(),
				url : '../api/dra/cello/permissions'
			});
		},
		logout : function() {
			return $http({
				method : 'GET',
				headers : getHeaders(),
				url : '../api/dra/cello/logout'
			});
		},
		getUserInfo : function() {
			return $http({
				method : 'GET',
				headers : getHeaders(),
				url : '../api/dra/cello/userinfo'
			});
		},
		getClientList : function() {
			return $http({
				method : 'GET',
				headers : getHeaders(),
				url : '../api/dra/cello/clients'
			});
		},
		getEngagements : function(clientId) {
			return $http({
				method : 'GET',
				headers : getHeaders(),
				url : '../api/dra/engagementManager/getClientEngagement?client='
						+ clientId
			});
		},
		getSurveys : function(clientId) {
			return $http({
				method : 'GET',
				headers : getHeaders(),
				url : '../api/dra/engagementManager/getClientSurvey?client='
						+ clientId
			});
		},
		getSurveyReportHistory : function(engagementId) {
			return $http({
				method : 'GET',
				headers : getHeaders(),
				url : '../api/dra/engagementManager/getEngagementReportHistory?engagementId='
						+ engagementId
			});
		},
		getParticipants : function(clientId) {
			return $http({
				method : 'GET',
				headers : getHeaders(),
				url : '../api/dra/engagementManager/getClientParticipants?client='
						+ clientId
			});
		},
		getEngagementsById : function(engagementId) {
			return $http({
				method : 'GET',
				headers : getHeaders(),
				url : '../api/dra/engagementManager/getEngagementById?engageId='
						+ engagementId
			});
		},
		updateSelectedEngagement : function(
				selectedEngagement, data) {

			if (data['survey'] != null) {
				selectedEngagement['survey'] = data['survey'];
				if (data['participants'] != null) {
					selectedEngagement.survey['participants'] = data['participants'];
				}
				if (data['risks'] != null) {
					selectedEngagement.survey['risks'] = data['risks'];
					selectedEngagement.survey.risks
							.forEach(function(r) {
								r.desc = r.description;
							});
				}
				selectedEngagement['survey'] = data['survey'];
				selectedEngagement.survey['participants'] = data['participants'];
				selectedEngagement.survey['risks'] = data['risks'];
				selectedEngagement.survey.velocity = [];
				selectedEngagement.survey.severity = [];
				selectedEngagement.survey.likelihood = [];
				selectedEngagement.survey.velocity[0] = data.survey.velocityScale1;
				selectedEngagement.survey.velocity[1] = data.survey.velocityScale2;
				selectedEngagement.survey.velocity[2] = data.survey.velocityScale3;
				selectedEngagement.survey.velocity[3] = data.survey.velocityScale4;
				selectedEngagement.survey.velocity[4] = data.survey.velocityScale5;
				selectedEngagement.survey.likelihood[0] = data.survey.likelihoodScale1;
				selectedEngagement.survey.likelihood[1] = data.survey.likelihoodScale2;
				selectedEngagement.survey.likelihood[2] = data.survey.likelihoodScale3;
				selectedEngagement.survey.likelihood[3] = data.survey.likelihoodScale4;
				selectedEngagement.survey.likelihood[4] = data.survey.likelihoodScale5;
				selectedEngagement.survey.severity[0] = data.survey.severityScale1;
				selectedEngagement.survey.severity[1] = data.survey.severityScale2;
				selectedEngagement.survey.severity[2] = data.survey.severityScale3;
				selectedEngagement.survey.severity[3] = data.survey.severityScale4;
				selectedEngagement.survey.severity[4] = data.survey.severityScale5;
				this.convertIntToBoolean(selectedEngagement.survey,"riskListSignedOff");
				this.convertIntToBoolean(selectedEngagement.survey,"published");
				this.convertIntToBoolean(selectedEngagement.survey,"closed");
			}
		
			if(selectedEngagement != null){
				this.convertIntToBoolean(selectedEngagement,"platinumAccount");
				this.convertIntToBoolean(selectedEngagement,"secRegistrant");
			}
		},
		convertBooleanToInt:function(bean,prop){
            bean[prop]=bean[prop]?1:0;
        },
        convertIntToBoolean:function(bean,prop){
            bean[prop] = bean[prop] != null && bean[prop] == 1 ? true : false;
        },

		getEngagementResponse : function(engagementId) {
			return $http({
				method : 'GET',
				headers : getHeaders(),
				url : '../api/dra/engagementManager/getEngagementResponseSummary?engagementId='
						+ engagementId
			});
		},
		getEngagementResponseReport : function(engagementId) {
			return $http({
				method : 'GET',
				headers : getHeaders(),
				url : '../api/dra/engagementManager/getEngagementResponseReport?engagementId='
						+ engagementId
			});
		},
		getEngagementReport : function(engagementId, reportId) {
			return $http({
				method : 'GET',
				headers : getHeaders(),
				url : '../api/dra/engagementManager/getEngagementReport?engagementId='
						+ engagementId+"&reportId="+reportId
			});
		},
		saveOperationalDate : function(taskId, opDates) {
			return $http.put(
					'../api/dra/engagementManager/saveOperationalDate?taskId='
							+ taskId, angular
							.toJson(opDates));
		},
		getOperationalDates : function(taskId) {
			return $http({
				method : 'GET',
				headers : getHeaders(),
				url : '../api/dra/engagementManager/getOperationalDates?taskId='
						+ taskId
			});
		},
		saveSurvey : function(taskId, survey) {
			this.convertBooleanToInt(survey.survey,"riskListSignedOff");
			this.convertBooleanToInt(survey.survey,"published");
			this.convertBooleanToInt(survey.survey,"closed");
			return $http.put(
					'../api/dra/engagementManager/saveSurvey?taskId='
							+ taskId, angular
							.toJson(survey));
		},
		createEngagement : function(engagement) {
			this.convertBooleanToInt(engagement,"platinumAccount");
			this.convertBooleanToInt(engagement,"secRegistrant");
			return $http.post(
					'../api/dra/engagementManager/createEngagement',
					angular.toJson(engagement));
		},
		addParticipants : function(participants, taskId) {
			return $http.put(
					'../api/dra/engagementManager/addParticipants?taskId='
							+ taskId, angular
							.toJson(participants));
		},
		closeSurvey : function(taskId) {
			return $http
					.put('../api/dra/engagementManager/closeSurvey?taskId='
							+ taskId);
		},
		sendEmail : function(mailOptions) {
			return $http.post(
					'../api/dra/cello/emailsend',
					mailOptions);
		},
		storeObject : function(key, obj) {
			localStorage.setItem(key, angular
					.toJson(obj));
		},
		getObject : function(key) {
 			return JSON.parse(localStorage.getItem(key));
		},
		removeObject : function(key) {
			localStorage.removeItem(key);
		},
		uploadFileToUrl : function(file, uploadUrl) {
			var fd = new FormData();
			fd.append('file', file);
			return $http.post(uploadUrl, fd, {
				transformRequest : angular.identity,
				headers : {
					'Content-Type' : undefined
				}
			});
		},
		validateEmail : function(email) {
			 var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			     re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
			 return re.test(email);
		},
		getDateFormat : function() {
	            return $.ajax({
	                type: 'GET',
	                async: false,
	                url: '../api/dra/engagementManager/dateFormat'
	            });
		},
		getTimeFromMilliseconds : function(millis) {
			var d = new Date(millis);
		    var hh = d.getHours();
		    var min = d.getMinutes();
		    var sec = d.getSeconds();
		    var dd = "am";
		    var hour = hh;
		    
		    //Checking for afternoon timing
		    if (hour >= 12) {
		    	hour = hh-12;
		        dd = "pm";
		    }
		    // Reset to 12 If time is 0 or 24
		    if (hour == 0) {
		    	hour = 12;
		    }
		    
		    // Add '0' before to the <10 values 
		    min = min < 10 ? ("0" + min) : min;
		    sec = sec < 10 ? ("0" + sec) : sec;
		    hour = hour < 10 ? ("0" + hour) : hour;

		    var result = hour + ":" + min + " " + dd;

		    return result;
		},
		handleError : function(data, status, headers, config) {
			if (status == 401) {
				if ((data != null) && (data.message != null) && (data.message == "Un authenticated session" || data.message=="Expired or Unauthenticated session")) {
					window.location = "../login.jsp";
				} else {
					window.location = 'error401.html';
				}
			} else if (status == 409) {
				window.location = 'error409.html';
			} else if (status == 403 || status == 500) {
				window.location = 'error.html';
			}
		},
		getFeedbackFromEngagement : function(
				engagement, email) {
			if (engagement != null
					&& engagement.survey != null
					&& engagement.survey.participants != null) {
				for (var count = 0; count < engagement.survey.participants.length; count++) {
					if (engagement.survey.participants[count].emailId == email) {
						return engagement.survey.participants[count].feedback;
					}
				}
			}
			return null;
		}
	}
} ])

.filter('pagination', [ 'api-services', function(apiServices) {
	return function(input, start) {
		if (input) {
			start = +start;
			var paginatedTasks = input.slice(start);
			apiServices.storeObject("paginatedTasks", paginatedTasks);
			return paginatedTasks;
		}
		return null;
	};
} ])

.run(function ($rootScope) {
  $rootScope.inArray = function (item, array) {
    return (-1 !== array.indexOf(item));
  };
})


		// Header controller
.controller('headerCtrl', ['$rootScope', '$scope', '$http', 'api-services', '$location', '$window', function($rootScope, $scope, $http, apiServices, $location, $window) {
	$scope.navbarCollapsed = true;
	$scope.userNavbarCollapsed = true;
	apiServices.getApplicationList().success(
		function(data) {
			if(data){
				$scope.app_list = data;
				for (var appCount = 0; appCount < $scope.app_list.length; appCount++) {
					if ($scope.app_list[appCount].Name == "DRAService") {
						$scope.app_list.splice(appCount, 1);
					}
				}
			}
		}).error(function(d, s, h, c) {
			apiServices.handleError(d, s, h, c);
		});
	apiServices.getUserInfo().success(
		function(data) {
			$scope.user_info = data;
			apiServices.storeObject("currentUser",$scope.user_info);
			if($scope.user_info.roles.indexOf("DRAAdmin") != -1) {
				$scope.userRole = "DRA Admin";
			} else if($scope.user_info.roles.indexOf("Engagement Manager") != -1) {
				$scope.userRole = "Engagement Manager";
			} else if($scope.user_info.roles.indexOf("DRAAssociate") != -1) {
				$scope.userRole = "DRA Associate";
			} else {
				$scope.userRole ="";
			}
		}).error(function(d, s, h, c) {
			apiServices.handleError(d, s, h, c);
		});
	apiServices.getPermissions().success(
			function(data) {
				$rootScope.user_permissions = data;
			} 
		).error(function(d, s, h, c) {
			apiServices.handleError(d, s, h, c);
		});
	$scope.logout = function() {
		apiServices.logout().success(function(data) {
			// console.log(data);
			$scope.app_list = [];
			$scope.user_info = null;
			$window.location.href = "../login.jsp";
		}).error(function(d, s, h, c) {
			apiServices.handleError(d, s, h, c);
		})
	}
}])

//Client list controller
.controller('ClientListCtrl', ['$scope', '$http', 'api-services', function($scope, $http, apiServices) {
	apiServices.getClientList().success(
		function(data) {
			$scope.clientList = [];
			for ( var client in data) {
				if (data[client].name
						.toUpperCase() != 'KPMG') {
					var t = data[client];
					t['id'] = client;
					$scope.clientList
							.push(t);
				}
			}
			apiServices.storeObject(
					"clientList",
					$scope.clientList);
			apiServices
					.removeObject("selectedEngagement");
		}).error(function(d, s, h, c) {
			apiServices.handleError(d, s, h, c);
		});
}])

//Dash board controller
.controller('DashboardCtrl',['$rootScope', '$scope','$http',"$routeParams","$uibModal","api-services","$uibModal","$location","orderByFilter", "$timeout",function($rootScope, $scope, $http, $routeParams, $uibModal, apiServices, uibModal, $location, orderBy,$timeout) {
	window.scrollTo(1, 1);
	// Page Number
	$scope.curPage = 0;
	
	apiServices.getDateFormat().success(function(data) {
		$rootScope.dateFormat = data.message.toUpperCase();
	}).error(function(d, s, h, c) {
		apiServices.handleError(d, s, h, c);
	});
	
	$scope.closeSurveyVisiblity = false;
	$scope.pageSize = 4;
	$scope.tasks = null;
	$scope.loadNillEngagements = function() {
	    return new Array(1);   
	}
	$scope.selectedParticipants = null;
	$scope.tableHeader = null;
	$scope.clientList = apiServices.getObject("clientList");
	$scope.selectedClient = apiServices.getObject("selectedClient");
	var clientId = $routeParams.clientId;
	if ($scope.selectedClient == null
			|| $scope.selectedClient.id != clientId) {
		for (var clientCount = 0; clientCount < $scope.clientList.length; clientCount++) {
			if (clientId == $scope.clientList[clientCount].id) {
				$scope.selectedClient = $scope.clientList[clientCount];
				apiServices.storeObject(
						"selectedClient",
						$scope.selectedClient);
			}
		}
	}

	$scope.loadEngagements = function() {
		$scope.reportError = false;
		$scope.numberOfParticipants = 0;
		$scope.numberOfCompletedSurveys = 0;
		$scope.numberOfInProgressSurveys = 0;
		$scope.numberOfFeedBacks = 0;
		apiServices.getEngagements($scope.selectedClient.id).success(
			function(data) {
				$scope.tasks = data;
				//$scope.tasks = orderBy($scope.tasks,'createdDate', true);
				apiServices.storeObject("engagements",$scope.tasks);
				$scope.selectedEngagement = apiServices.getObject("selectedEngagement");
				if ($scope.selectedEngagement) {
					$scope.selectedEngagementIndex = $scope.findIndexOfEngagement(
						$scope.tasks,
						$scope.selectedEngagement.engagementId);
					$scope.curPage = Math.floor($scope.selectedEngagementIndex / 4);
					$scope.selectedEngagementIndex = $scope.selectedEngagementIndex % 4;
				}
				if (!$scope.selectedEngagement) {
					$scope.selectedEngagementIndex = (!$scope.selectedEngagementIndex ? 0
							: $scope.selectedEngagementIndex);
					$scope.selectedEngagement = $scope.tasks[0];
				}
				if($routeParams.bottom){
                                    $scope.scrollToReports($routeParams.clientId,$routeParams.bottom);
                                }else{
                                    $scope.getSelectedEngagementDetails();
                                }
			}).error(
					function(d, s, h, c) {apiServices.handleError(d,s, h, c);
			});
		document.getElementById('participant').className = "count active";
		document.getElementById('response').className = "tab response active";
		$scope.participantsVisiblity = true;
		$scope.feedbackVisiblity = false;
		$scope.tableHeader="Participants";
	}

	$scope.responses = function() {
		document.getElementById('new').className = "tab new";
		document.getElementById('prepare').className = "tab prepare";
		document.getElementById('send').className = "tab send";
		document.getElementById('response').className = "tab response active";
		document.getElementById('feedback').className = "count";
		document.getElementById('completed').className = "count active";
		document.getElementById('inprogress').className = "count ";
		document.getElementById('participant').className = "count";
		$scope.participantsVisiblity = true;
		$scope.feedbackVisiblity = false;
		$scope.closeSurveyVisiblity = true;
		$scope.countDetailsBasedonSelectedStatus('COMPLETE','completed');
	}
 
	$scope.generateReport = function() {
		$scope.reportError = false;
		$scope.selectedEngagement = apiServices.getObject("selectedEngagement");
        var modalInstance = $uibModal.open({
            animation : true,
            templateUrl : 'engagementManager/contents/GenerateReportConfirmation.html',
            controller : 'generateReportPopupController',
            backdrop : 'static',
            keyboard : false
        });
        modalInstance.result.then(function(fileType) {
        	$scope.fileType = fileType;
        	if($scope.fileType == "1") {
        		apiServices.getEngagementResponseReport($scope.selectedEngagement.taskId)
        		.success(function(data){})
        		.error(function(d, s, h, c) {
        			$scope.reportError = true;
        			$scope.reportErrorMessage = d.message;
        		});
        	} else {
        		window.open('../api/dra/engagementManager/getEngagementResponseSummary?engagementId='+ $scope.selectedEngagement.taskId,'_blank');
        	}
        });

    }

	$scope.numberOfPages = function() {
		if ($scope.tasks) {
			return Math.ceil($scope.tasks.length
					/ $scope.pageSize);
		}
	};
	$scope.findIndexOfEngagement = function(tasks,
			taskId) {
		for (var i = 0; i < tasks.length; i++) {
			if (tasks[i].engagementId == taskId) {
				return i;
			}
		}
		return null;
	}
	$scope.loadEngagements();

	$scope.viewFeedbackDetails = function(feedback) {
		var modalInstance = $uibModal.open({
			animation : true,
			templateUrl : 'viewFeedbackPopup.html',
			controller : 'emFeedbackPopupController',
			backdrop : 'static',
			keyboard : false,
			resolve : {
				feedback : function() {
					return feedback;
				}
			}
		});
		modalInstance.result.then(function(
				updatedEngagement) {
			// TODO commented below list to find what
			// details needed to save
			// $scope.selectedEngagement =
			// updatedEngagement;
			// apiServices.saveEngagement($scope.selectedEngagement).error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
		}, function() {
		});
	};
	
	$scope.downloadReport = function(reportId) {
		window.open('../api/dra/engagementManager/getEngagementReport?engagementId='+ $scope.selectedEngagement.taskId+"&reportId="+reportId,'_blank');
	}

	/**
	 * Assign the details of Survey, Risk and
	 * Participant to the Selected Engagement mentioned
	 * in the Scope.
	 */
	$scope.getSelectedEngagementDetails = function() {
		if ($scope.selectedEngagement) {
			apiServices.getSurveyReportHistory($scope.selectedEngagement.taskId).success(
					function(data){
						if(data instanceof Array){
							$scope.reportsHistory = data;
							$scope.reportsHistory.forEach(function(history, index) {
								$scope.reportsHistory[index].date = moment($scope.reportsHistory[index].createdTime).format($rootScope.dateFormat);
								$scope.reportsHistory[index].time = apiServices.getTimeFromMilliseconds($scope.reportsHistory[index].createdTime);
							});
						}
					}).error(function(d, s, h, c) {
						apiServices.handleError(d,s, h, c);
					});
			
			apiServices.getEngagementsById($scope.selectedEngagement.taskId).success(
				function(data) {
					$scope.selectedEngagement = data['engagement'];
					apiServices.updateSelectedEngagement($scope.selectedEngagement,data);
					apiServices.storeObject("selectedEngagement",$scope.selectedEngagement);
                                        $scope.numberOfFeedBacks=0;
                                        $scope.feedbacks=[];
					if ($scope.selectedEngagement != null && $scope.selectedEngagement.survey != null
							&& $scope.selectedEngagement.survey.participants != null) {
                                                if(data.feedback){
                                                    $scope.numberOfFeedBacks = data.feedback.length;
                                                    $scope.feedbacks = data.feedback;
                                                }
						$scope.feedbacks.forEach(function(f, index) {
							$scope.feedbacks[index].ftimeFormatted = moment(f.submittedDate).format($rootScope.dateFormat);
						});
						$scope.numberOfParticipants = $scope.selectedEngagement.survey.participants.length;
						$scope.numberOfCompletedSurveys = 0;
						for (var partCount = 0; partCount < $scope.numberOfParticipants; partCount++) {
							if ($scope.selectedEngagement.survey.participants[partCount].status) {
								if ($scope.selectedEngagement.survey.participants[partCount].status == "COMPLETE") {
									$scope.numberOfCompletedSurveys++;
								}
								if ($scope.selectedEngagement.survey.participants[partCount].status == "INPROGRESS") {
									$scope.numberOfInProgressSurveys++;
								}
							}
						}
					}
					// Published/Unpublished
					// flag for lock/unlock
					// indicator
					if ($scope.selectedEngagement == null
							|| $scope.selectedEngagement.survey == null) {
						$scope.published = false;
					} else {
						$scope.published = $scope.selectedEngagement.survey.published;
					}
					$scope.countDetailsBasedonSelectedStatus('ALL','participant');
				})
				.error(
					function(d, s, h, c) {apiServices.handleError(d,s, h, c);
				});
			window.scrollTo(1, 1);
		}
	}
	
	
	$scope.refreshReports = function() {
		if ($scope.selectedEngagement) {
			apiServices.getSurveyReportHistory($scope.selectedEngagement.taskId).success(
					function(data){
						if(data instanceof Array){
							$scope.reportsHistory = data;
							$scope.reportsHistory.forEach(function(history, index) {
								$scope.reportsHistory[index].date = moment($scope.reportsHistory[index].createdTime).format($rootScope.dateFormat);
								$scope.reportsHistory[index].time = apiServices.getTimeFromMilliseconds($scope.reportsHistory[index].createdTime);
							});
                                                        window.scrollBy(1,document.body.scrollHeight);
						}
					}).error(function(d, s, h, c) {
						apiServices.handleError(d,s, h, c);
					});
		}
	}

	// Select task
	$scope.selectEngagement = function(index) {
		$scope.numberOfParticipants = 0;
		$scope.numberOfCompletedSurveys = 0;
		$scope.numberOfInProgressSurveys = 0;
		$scope.numberOfFeedBacks = 0;
		index = (!index ? 0 : index);
		$scope.selectedEngagementIndex = index;
		var paginatedTasks = apiServices
				.getObject("paginatedTasks");
		$scope.selectedEngagement = paginatedTasks[index];
		// Assign the details of Survey, Participants
		// and Risks to the Selected Engagement
		$scope.getSelectedEngagementDetails();
        $scope.highlightselectEngagement($scope.selectedEngagement.engagementId);

		if ($scope.feedbacks != null) {
			$scope.numberOfFeedBacks = $scope.feedbacks.length;
		}
		// Published/Unpublished flag for lock/unlock
		// indicator
		if ($scope.selectedEngagement.survey == null) {
			$scope.published = false;
		} else {
			$scope.published = $scope.selectedEngagement.survey.published;
		}
	}

    $scope.highlightselectEngagement = function(engagementId) {
        $scope.tasks.forEach(function(engagement) {
        	if(document.getElementById(engagement.engagementId))
            	document.getElementById(engagement.engagementId).className ="label_deactive ";
        });
        if(document.getElementById(engagementId)){
            document.getElementById(engagementId).className ="label_deactive active";
        }
    }
    
	$scope.highlightFirstEngagement = function(id) {
		if(id == $scope.selectedEngagement.engagementId) {
			return "label_deactive  active";
		}else {
			return "label_deactive ";
		}
	}
							
	$scope.generateSummary = function() {
		window.open('../api/dra/engagementManager/getEngagementResponseSummary?engagementId='+ $scope.selectedEngagement.taskId,'_blank');
	}

	$scope.viewFeedback = function(email) {
		$location.path("/emFeedback");
	}

	$scope.closeSurvey = function() {
		
		var modalInstance = $uibModal
		.open({
			animation : true,
			templateUrl : 'engagementManager/contents/closeSurveyConfirmation.html',
			controller : 'surveyCloseConfirmModalController',
			backdrop : 'static',
			keyboard : false,
			resolve : {
				engagement : function() {
					apiServices
							.storeObject(
									"selectedEngagement",
									$scope.selectedEngagement);
					return $scope.selectedEngagement;
				}
			}
 		}).closed.then(function(){
			$scope.selectedEngagement = apiServices.getObject("selectedEngagement");
			apiServices.getEngagements(
					$scope.selectedClient.id).success(
					function(data) {
						$scope.tasks = data;
					}).error(function(d, s, h, c) {
				apiServices.handleError(d, s, h, c);
			});
		});	
	}
	
	$scope.countDetailsBasedonSelectedStatus = function(currentStatus,activeId ) {
		var participantsList = {};
		if ($scope.selectedEngagement != null && $scope.selectedEngagement.survey != null && $scope.selectedEngagement.survey.participants != null) {

			participantsList = $scope.selectedEngagement.survey.participants;
			
			participantsList.forEach(function(p, index) {
				participantsList[index].sentDateFormatted = moment(p.sentDate).format($rootScope.dateFormat);
			});
		}
		$scope.participantsVisiblity = true;
		$scope.feedbackVisiblity = false;

		if (participantsList != null) {
			if (currentStatus == "ALL") {
				$scope.selectedParticipants = participantsList;
			} else {
				$scope.selectedParticipants = _.where(
						participantsList, {
							status : currentStatus
						});
			}
		}
		
		if(activeId == 'participant') {
			$scope.tableHeader="Participants";
		}
		if(activeId == 'inprogress') {
			$scope.tableHeader="In-progress Surveys";
		}
		if(activeId == 'completed') {
			$scope.tableHeader="Completed Surveys";
		}
		if(activeId == 'feedback') {
			$scope.tableHeader="Feedbacks";
		}
		
		if(activeId == 'completed') {
			$scope.closeSurveyVisiblity = true;
		}else {
			$scope.closeSurveyVisiblity = false;
		}
		
		document.getElementById('feedback').className = "count ";
		document.getElementById('completed').className = "count ";
		document.getElementById('inprogress').className = "count ";
		document.getElementById('participant').className = "count ";
		document.getElementById(activeId).className = "count active";
	}

	$scope.viewFeedback = function(activeId) {
		document.getElementById('feedback').className = "count ";
		document.getElementById('completed').className = "count ";
		document.getElementById('inprogress').className = "count ";
		document.getElementById('participant').className = "count ";
		document.getElementById(activeId).className = "count active";
		$scope.feedbackVisiblity = true;
		$scope.participantsVisiblity = false;
		$scope.closeSurveyVisiblity = false;
	
	}
	
	$scope.getFileStatus = function(fileStatus) {
		var status = "";
		switch (fileStatus) {
        case "INPROGRESS":
        	status="In Progress";
        	break;
        case "COMPLETE":
        	status="Completed";
        	break;
        case "FAILED":
            status="Failed";
            break;
      }
		return status;
	}
        $scope.scrollToReports=function(clientId,engId){
                apiServices.getClientList().success(
                    function(data) {
                        $scope.clientList = [];
                        for (var client in data) {
                            if (data[client].name.toUpperCase() != 'KPMG') {
                                var t = data[client];
                                t['id'] = client;
                                $scope.clientList.push(t);
                                if (clientId == client) {
                                    apiServices.storeObject("selectedClient", t);
                                }
                            }
                        }
                        apiServices.storeObject("clientList", $scope.clientList);
                        apiServices.getEngagements($scope.selectedClient.id).success(
                            function(data) {
                                $scope.tasks = data;
                                //$scope.tasks = orderBy($scope.tasks,'createdDate', true);
                        
                                apiServices.storeObject("engagements", $scope.tasks);
                                if (engId) {
                                    var ind = 0;
                                    var sel = 0;
                                    $scope.tasks.forEach(function(eng) {
                                        if (eng.taskId == engId) {
                                            sel = ind;
                                            $scope.selectedEngagement = eng;
                                            apiServices.storeObject("selectedEngagement", $scope.selectedEngagement);
                                        } else {
                                            ind++;
                                        }
                                    });
                                    $scope.curPage = Math.floor(sel / 4);
                                    $scope.selectedEngagementIndex = sel % 4;
                                    $scope.selectEngagement($scope.selectedEngagementIndex);
                                    $timeout(function() {
                                        $scope.responses();
                                        $scope.refreshReports();
                                    }, 3000);
                                }
                            }).error(function(d, s, h, c) {
                                apiServices.handleError(d, s, h, c);
                            });
                        
                    }).error(function(d, s, h, c) {
                    apiServices.handleError(d, s, h, c);
                });
        }
}])

.controller('sendSurveyController',['$scope','$http','$location','api-services','$uibModal',function($scope, $http, $location, apiServices, $uibModal) {
	$scope.selectedEngagement = apiServices.getObject("selectedEngagement");
	$scope.engagementList = apiServices.getObject("engagements");
	$scope.selectedClient = apiServices.getObject("selectedClient");
	$scope.loadEngagements = function() {
		apiServices.getEngagementsById($scope.selectedEngagement.taskId)
			.success(function(data) {
					$scope.selectedEngagement = data['engagement'];
					apiServices.updateSelectedEngagement($scope.selectedEngagement,data);
					apiServices.storeObject("selectedEngagement",$scope.selectedEngagement);
				})
			.error(function(d, s, h, c) {
					apiServices.handleError(d,s, h, c);
				});
		apiServices.getEngagements(
				$scope.selectedClient.id).success(
				function(data) {
					$scope.tasks = data;
				}).error(function(d, s, h, c) {
			apiServices.handleError(d, s, h, c);
		});
	}
	$scope.loadEngagements();
	$scope.emailNote = "";
	$scope.emailInprogress = false;
	$scope.sendEmail = function() {
		$scope.isSaveAction = true;
		var modalInstance = $uibModal.open({
			animation : true,
			templateUrl : 'confirmSendSurvey.html',
			controller : 'confirmSendSurveyController',
			keyboard : false,
			resolve : {
				engagement : function() {
					apiServices.storeObject("emailNote",$scope.emailNote);
					apiServices.storeObject("selectedEngagement",$scope.selectedEngagement);
					return $scope.selectedEngagement;
				}
			}
		});
		 modalInstance.result.then(function(returnObj) { 
	        	if(returnObj) {
	        		$scope.emailInprogress = true;
	        		var baseurl = $location.protocol() + "://" + $location.host();
	        		if ($location.port() != 80) {
	        			baseurl = baseurl + ":" + $location.port();
	        		}
	        		$scope.showMessage = "none";
	        		if ($scope.emailNote) {
	        			$scope.showMessage = "block";
	        		}
	        		var clickurl = baseurl
	        				+ window.location.pathname.replace('engagementManager.html','sponsor.html')
	        				+ "?engageId="
	        				+ $scope.selectedEngagement.taskId
	        				+ '&user='
	        				+ $scope.selectedEngagement.clientLeadId
	        				+ "#/?engageId="
	        				+ $scope.selectedEngagement.taskId
	        				+ '&user='
	        				+ $scope.selectedEngagement.clientLeadId;
	        		var emailopts = {
	        			"notification_name" : "DRAClientLeadSurvey",
	        			"to" : $scope.selectedEngagement.clientLeadEmail,
	        			"placeholders" : {
	        				"url" : clickurl,
	        				"engagementManager_email": apiServices.getObject("currentUser").email,
	        				"engagementManager_firstName":$scope.selectedEngagement.engagementManagerName,
	        				"engagementManager_lastName":$scope.selectedEngagement.engagementManagerSurName,
	        				"email_content" : $scope.emailNote,
	        				"showMessage" : $scope.showMessage,
	        				"engagement_id" : $scope.selectedEngagement.engagementId,
	        				"lead_name" : $scope.selectedEngagement.clientFirstName
	        			},
	        			"client_id" : $scope.selectedEngagement.clientId
	        		};
	        		apiServices.sendEmail(emailopts).success(function() {
	        				$scope.emailInprogress = false;
	        				document.getElementById('sccessVisiblity').style.display = "block";
	        				$scope.emailNote ="";
	        			}).error(function(d, s, h, c) {
	        					apiServices.handleError(d,s, h, c);
	        					$scope.errorMessage = "Couldn't send email, Please try again !!!";
	        					$scope.emailInprogress = false;
	        					$scope.emailNote ="";
	        			});	
	        	}
		 });
	}
	
	
	$scope.navigateTodashboard = function() {
		$location
		.path("/dashboard/"
				+ $scope.selectedEngagement.clientId);
	};
	
} ])

.controller('surveyCloseConfirmModalController',['$scope','$http','$location','api-services','$uibModalInstance', function($scope, $http, $location, apiServices, $uibModalInstance) {
	$scope.selectedEngagement = apiServices.getObject("selectedEngagement");
	$scope.selectedEngagement = apiServices.getObject("selectedEngagement");

	$scope.closeSurvey = function() {
		$scope.selectedEngagement.survey.closed = true;
		apiServices.closeSurvey($scope.selectedEngagement.taskId).success(
			function(data, status, headers,config) {
				$uibModalInstance.dismiss('cancel');
				$location.path("/dashboard/" + $scope.selectedEngagement.clientId);
				apiServices.storeObject("selectedEngagement",$scope.selectedEngagement);
			})
			.error(function(data, status, headers,config) {
				var responseData = data;
				if (responseData != null && responseData.errorMessage != null) {
					sweet.show({
						title : 'Error While saving Engagment',
						text : responseData.errorMessage,
						type : error,
						showConfirmButton : true
					});
				} else {
					apiServices.handleError(data,status,headers,config);
				}
			});
	};
	
	$scope.closeSendSurveyPopup = function() {
		$uibModalInstance.dismiss('cancel');
	};

}])


.controller('generateReportPopupController',['$scope','$http','$location','api-services','$uibModalInstance', function($scope, $http, $location, apiServices, $uibModalInstance) {
	
	$scope.closeGenerateReportPopup = function() {
		$uibModalInstance.dismiss('cancel');
	};
	
	$scope.generateSummary = function() {
		$uibModalInstance.close($scope.fileType);
	}
	
}])


.controller('confirmSendSurveyController',['$scope','$http','$location','api-services','$uibModalInstance', function($scope, $http, $location, apiServices, $uibModalInstance) {
	$scope.selectedEngagement = apiServices.getObject("selectedEngagement");
	$scope.modalTitle = "Send Published Survey";
	$scope.errorMessage = null;
	$scope.emailNote = apiServices.getObject("emailNote");
	
	$scope.hideSuccessMessage = function() {
		document.getElementById('sccessVisiblity').style.display = "none";
	}
	
	$scope.hideSuccessMessage();
	
	$scope.sendSurvey = function() {
		$uibModalInstance.close(true);
	}
	
	// close publish survey popup
	$scope.closeSendSurveyPopup = function() {
		$uibModalInstance.dismiss('cancel');
	};

}])


// Engagement Manager Feedback Controller
.controller('emFeedbackCtrl', ['$scope', '$http', "$uibModal", "api-services", function($scope, $http, $uibModal, apiServices) {
	$scope.selectedClient = apiServices.getObject("selectedClient");
	$scope.selectedEngagement = apiServices.getObject("selectedEngagement");
	$scope.feedbacks = $scope.selectedEngagement.feedbacks;

	// Share survey modal Popup
	$scope.viewFeedback = function(feedback) {
		var modalInstance = $uibModal.open({
			animation : true,
			templateUrl : 'viewFeedbackPopup.html',
			controller : 'emFeedbackPopupController',
			backdrop : 'static',
			keyboard : false,
			resolve : {
				feedback : function() {
					return feedback;
				}
			}
		});
		modalInstance.result.then(function(
				updatedEngagement) {
			// TODO commented below list to find what
			// details needed to save
			// $scope.selectedEngagement =
			// updatedEngagement;
			// apiServices.saveEngagement($scope.selectedEngagement).error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
		}, function() {
		});
	};
} ])

// EM feedback popup Controller
.controller('emFeedbackPopupController',
	function($scope, $http, $uibModalInstance, feedback) {
		$scope.feedback = feedback;
		// close share survey popup
		$scope.closePopup = function() {
			$uibModalInstance.dismiss('cancel');
		};
	})

// Create engagement controller
.controller("CreateEngagementCtrl", ["$scope", "$http", "$routeParams", '$location', 'api-services', 'sweet', "$rootScope",
	function($scope, $http, $routeParams, $location, apiServices, sweet, $rootScope) {
		$scope.saveInProgress = false;
		$scope.engagementList = apiServices.getObject("engagements");
		$scope.selectedClient = apiServices.getObject("selectedClient");
		$scope.loadEngagements = function() {
			apiServices.getEngagements(
					$scope.selectedClient.id).success(
					function(data) {
						$scope.tasks = data;
					}).error(function(d, s, h, c) {
				apiServices.handleError(d, s, h, c);
			});
		}
		$scope.loadEngagements();
		var selectedTaskId = $routeParams.engId;
		if (selectedTaskId == null) {
			apiServices.removeObject("selectedEngagement");
			$scope.engagement = {
				taskId : null,
				clientId : $scope.selectedClient.id,
				clientName : $scope.selectedClient.name,
				createdDate : "",
				engagementManagerName : '',
				engagementManagerSurName : '',
				engagementId : '',
				workshopFacilitorName : '',
				workshopFacilitorSurName : '',
				engagementDescription : '',
				keySponsor : '',
				sentinelApprovalNumber : '',
				clientFirstName : '',
				clientSurName : '',
				clientLeadEmail : '',
				projectManager : '',
				projectManagerSurName : '',
				engagementPartner : '',
				engagementPartnerSurName : '',
				platinumAccount : 0,
				secRegistrant : 0,
			/*
			 * update:false, opDates : null
			 */
			};
		} else {
			$scope.engagement = apiServices.getObject("selectedEngagement");
		}

	$scope.createEngagement = function() {
		// Adding validations for create engagement
		// fields
		$scope.showReqFieldError = false;
		$scope.showEngagementIdAlreadyExist = false;
		$scope.showValidFieldError = false;
		$scope.showValidNumberFieldError = false;
		$scope.isSaveAction = true;
		var reqFieldAlert = angular.element(document.querySelector('#reqFieldAlert'));
		var engagementIdAlreadyExistAlert = angular.element(document.querySelector('#engagementIdAlreadyExist'));
		var validFieldAlert = angular.element(document.querySelector('#validFieldAlert'));
		var clientLeadEmailId = angular.element(document.querySelector('#clientLeadEmailId'));
		var validNumberFieldAlert = angular.element(document.querySelector('#validNumberFieldAlert'));
		var sentinelApprovalNumberId = angular.element(document.querySelector('#sentinelApprovalNumberId'));
		var pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		var regex = /^[0-9]*$/;

		$scope.showErrorsCheckValidity = true;

		// $scope.engagement.update = $scope.update;

		if ($scope.engagementForm.$invalid) {
			reqFieldAlert.removeClass('ng-hide');
			validFieldAlert.addClass('ng-hide');
			$scope.showReqFieldError = true;
			window.scrollTo(1, 1);
		} else if (!regex.test($scope.engagement.sentinelApprovalNumber)) {
			reqFieldAlert.addClass('ng-hide');
			validFieldAlert.addClass('ng-hide');
			validNumberFieldAlert.removeClass('ng-hide');
			sentinelApprovalNumberId.addClass('has-error');
			$scope.showReqFieldError = false;
			$scope.showValidFieldError = false;
			$scope.showValidNumberFieldError = true;
			window.scrollTo(1, 1);
		} else if (!pattern.test($scope.engagement.clientLeadEmail)) {
			reqFieldAlert.addClass('ng-hide');
			validNumberFieldAlert.addClass('ng-hide');
			validFieldAlert.removeClass('ng-hide');
			clientLeadEmailId.addClass('has-error');
			$scope.showReqFieldError = false;
			$scope.showValidNumberFieldError = false;
			$scope.showValidFieldError = true;
			window.scrollTo(1, 1);
		} else {
			$scope.engagement.createdDate = moment().format($rootScope.dateFormat);
			$scope.saveInProgress = true;
			if ($scope.engagement.survey != null) {
				delete $scope.engagement.survey;
			}
			apiServices.createEngagement($scope.engagement).success(function(data, status,headers, config) {
				$location.path("/dashboard/" + $scope.engagement.clientId);
			}).error(function(data, status,headers, config) {
				if (data.errorMessage != null) {
					$scope.saveInProgress = false;
					validFieldAlert.addClass('ng-hide');
					reqFieldAlert.addClass('ng-hide');
					engagementIdAlreadyExistAlert.removeClass('ng-hide');
					$scope.showEngagementIdAlreadyExist = true;
					window.scrollTo(1,1);
				} else {
					apiServices.handleError(data,status,headers,config);
				}
			});
		}
	}
} ])

// Operational Dates controller
.controller("OperationalDatesCtrl", ["$scope", "$http", "$routeParams", "$location", 'api-services', function($scope, $http, $routeParams, $location, apiServices) {
	apiServices.getDateFormat().success(function(data) {
		$scope.format = data.message;
	}).error(function(d, s, h, c) {
		apiServices.handleError(d, s, h, c);
	});
	$scope.engagementList = apiServices.getObject("engagements");
	$scope.client = apiServices.getObject("selectedClient");
	$scope.engagement = apiServices.getObject("selectedEngagement");
	apiServices.getOperationalDates($scope.engagement.taskId).success(function(data) {
		$scope.opDates = data;
		//console.log(data);
		$scope.setDateFromServer(data);
	}).error(function(d, s, h, c) {
		apiServices.handleError(d, s, h, c);
	});
	$scope.setDateFromServer = function(data) {
		if (data == null) {
			$scope.opDates = {};
		}
		// Populating operation dates
		if ($scope.opDates.kickOffMeetingWithClientLead) {
			$scope.opDates.kickOffMeetingWithClientLead = moment(
					data.kickOffMeetingWithClientLead)
					.toDate();
		}
		if ($scope.opDates.kickOffMeetingWithGCE) {
			$scope.opDates.kickOffMeetingWithGCE = moment(
					data.kickOffMeetingWithGCE)
					.toDate();
		}
		if ($scope.opDates.planningMeetingForWorkshops) {
			$scope.opDates.planningMeetingForWorkshops = moment(
					$scope.opDates.planningMeetingForWorkshops)
					.toDate();
		}
		if ($scope.opDates.interviewMeetingWithParticipants) {
			$scope.opDates.interviewMeetingWithParticipants = moment(
					$scope.opDates.interviewMeetingWithParticipants)
					.toDate();
		}
		if ($scope.opDates.interviewMeetingWithParticipantsList != null
				&& $scope.opDates.interviewMeetingWithParticipantsList.length > 0) {
			for (var interviewMeetingCount = 0; interviewMeetingCount < $scope.opDates.interviewMeetingWithParticipantsList.length; interviewMeetingCount++) {
				$scope.opDates.interviewMeetingWithParticipantsList[interviewMeetingCount] = moment(
						$scope.opDates.interviewMeetingWithParticipantsList[interviewMeetingCount])
						.toDate();
			}
		}
		if ($scope.opDates.workshops) {
			$scope.opDates.workshops = moment(
					$scope.opDates.workshops).toDate();
		}
		if ($scope.opDates.workshopsList != null
				&& $scope.opDates.workshopsList.length > 0) {
			for (var workshopCount = 0; workshopCount < $scope.opDates.workshopsList.length; workshopCount++) {
				$scope.opDates.workshopsList[workshopCount] = moment(
						$scope.opDates.workshopsList[workshopCount])
						.toDate();
			}
		}
		if ($scope.opDates.commencementOfSurveyProcess) {
			$scope.opDates.commencementOfSurveyProcess = moment(
					$scope.opDates.commencementOfSurveyProcess)
					.toDate();
		}
		if ($scope.opDates.closerOfSurveyProcess) {
			$scope.opDates.closerOfSurveyProcess = moment(
					$scope.opDates.closerOfSurveyProcess)
					.toDate();
		}
		if ($scope.opDates.expectedFirstDraft) {
			$scope.opDates.expectedFirstDraft = moment(
					$scope.opDates.expectedFirstDraft)
					.toDate();
		}
		if ($scope.opDates.discussionOfFirstDraft) {
			$scope.opDates.discussionOfFirstDraft = moment(
					$scope.opDates.discussionOfFirstDraft)
					.toDate();
		}
		if ($scope.opDates.finalWorkshop) {
			$scope.opDates.finalWorkshop = moment(
					$scope.opDates.finalWorkshop)
					.toDate();
		}
		if ($scope.opDates.finalReportDelivery) {
			$scope.opDates.finalReportDelivery = moment(
					$scope.opDates.finalReportDelivery)
					.toDate();
		}
		// Populating operation dates ends here
	}

	$scope.addInterviewDate = function() {
		if ($scope.opDates.interviewMeetingWithParticipantsList == null) {
			$scope.opDates.interviewMeetingWithParticipantsList = [];
		}
		$scope.opDates.interviewMeetingWithParticipantsList
				.push("");
		$scope.calendar.interviewDateOpened.push({
			"opened" : false
		});
		var index = $scope.opDates.interviewMeetingWithParticipantsList.length - 1;
		if ($scope.calendar.interviewDateOptions[index] == null) {
			$scope.calendar.interviewDateOptions[index] = {};
			if (index == 0) {
				$scope.calendar.interviewDateOptions[index].minDate = $scope.opDates['interviewMeetingWithParticipants'];
			} else {
				$scope.calendar.interviewDateOptions[index].minDate = $scope.opDates.interviewMeetingWithParticipantsList[index - 1];
			}
		}
	}

	$scope.removeInterviewDate = function($index) {
		if ($index == 0
				&& $scope.opDates.interviewMeetingWithParticipantsList.length == 1) {
			$scope.opDates.interviewMeetingWithParticipantsList = [];
		}
		$scope.opDates.interviewMeetingWithParticipantsList
				.pop();
		$scope.calendar.interviewDateOpened.pop();
		$scope.calendar.interviewDateOptions.pop();
	}

	$scope.addWorkshopDate = function() {
		if ($scope.opDates.workshopsList == null) {
			$scope.opDates.workshopsList = [];
		}
		$scope.opDates.workshopsList.push("");
		$scope.calendar.workshopDateOpened.push({
			"opened" : false
		});
		var index = $scope.opDates.workshopsList.length - 1;
		if ($scope.calendar.workshopDateOptions[index] == null) {
			$scope.calendar.workshopDateOptions[index] = {};
			if (index == 0) {
				$scope.calendar.workshopDateOptions[index].minDate = $scope.opDates['workshops'];
			} else {
				$scope.calendar.workshopDateOptions[index].minDate = $scope.opDates.workshopsList[index - 1];
			}
		}
	}

	$scope.removeWorkshopDate = function($index) {
		if ($index == 0
				&& $scope.opDates.workshopsList.length == 1) {
			$scope.opDates.workshopsList = [];
		}
		$scope.opDates.workshopsList.pop();
		$scope.calendar.workshopDateOpened.pop();
		$scope.calendar.workshopDateOptions.pop();
	}

	$scope.saveDates = function() {
		// $scope.engagement.update = true;
		$scope.isSaveAction = true;

		if ($scope.opDates.interviewMeetingWithParticipantsList) {
			for (var i = 0; i < $scope.opDates.interviewMeetingWithParticipantsList.length; i++) {
				if (!$scope.opDates.interviewMeetingWithParticipantsList[i]
						|| $scope.opDates.interviewMeetingWithParticipantsList[i] == '') {
					$scope.removeInterviewDate(i);
				}
			}
		}

		if ($scope.opDates.workshopsList) {
			for (var i = 0; i < $scope.opDates.workshopsList.length; i++) {
				if (!$scope.opDates.workshopsList[i]
						|| $scope.opDates.workshopsList[i] == '') {
					$scope.removeWorkshopDate(i);
				}
			}
		}

		apiServices.saveOperationalDate($scope.engagement.taskId,$scope.opDates).success(function(data, status, headers,config) {
			$location.path("/dashboard/" + $scope.engagement.clientId);
		}).error(function(d, s, h, c) {
			apiServices.handleError(d,s, h, c);
		});
		apiServices.getOperationalDates($scope.engagement.taskId).success(function(data) {
			$scope.opDates = data;
		}).error(function(d, s, h, c) {
			apiServices.handleError(d, s, h, c);
		});
	}

	$scope.resetOpenedDatePicker = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.calendar.interviewDateOpened = [];
		$scope.calendar.workshopDateOpened = [];
		$scope.calendar.opened = {};

		// Assign the updated date list to calendar
		if ($scope.opDates.interviewMeetingWithParticipantsList) {
			for (var i = 0; i < $scope.opDates.interviewMeetingWithParticipantsList.length; i++) {
				$scope.calendar.interviewDateOpened.push({
					"opened" : false
				});
			}

			var index = $scope.opDates.interviewMeetingWithParticipantsList.length - 1;
			if ($scope.calendar.interviewDateOptions[index] == null) {
				$scope.calendar.interviewDateOptions[index] = {};
			}

			if (index == 0) {
				$scope.calendar.interviewDateOptions[index].minDate = $scope.opDates['interviewMeetingWithParticipants'];
			} else {
				$scope.calendar.interviewDateOptions[index].minDate = $scope.opDates.interviewMeetingWithParticipantsList[index - 1];
			}
		}
		if ($scope.opDates.workshopsList) {
			for (var i = 0; i < $scope.opDates.workshopsList.length; i++) {
				$scope.calendar.workshopDateOpened.push({
					"opened" : false
				});
			}

			var index = $scope.opDates.workshopsList.length - 1;
			if ($scope.calendar.workshopDateOptions[index] == null) {
				$scope.calendar.workshopDateOptions[index] = {};
			}

			if (index == 0) {
				$scope.calendar.workshopDateOptions[index].minDate = $scope.opDates['workshops'];
			} else {
				$scope.calendar.workshopDateOptions[index].minDate = $scope.opDates.workshopsList[index - 1];
			}
		}

		if ($scope.opDates.kickOffMeetingWithClientLead) {
			$scope.calendar.opened['kickOffMeetingWithClientLead'] = false;
			$scope.calendar.dateOptions['kickOffMeetingWithGCE'].minDate = $scope.opDates.kickOffMeetingWithClientLead;
		}
		if ($scope.opDates.kickOffMeetingWithGCE) {
			$scope.calendar.opened['kickOffMeetingWithGCE'] = false;
			$scope.calendar.dateOptions['planningMeetingForWorkshops'].minDate = $scope.opDates.kickOffMeetingWithGCE;
		}
		if ($scope.opDates.planningMeetingForWorkshops) {
			$scope.calendar.opened['planningMeetingForWorkshops'] = false;
			$scope.calendar.dateOptions['interviewMeetingWithParticipants'].minDate = $scope.opDates.planningMeetingForWorkshops;
		}
		if ($scope.opDates.interviewMeetingWithParticipants) {
			$scope.calendar.opened['interviewMeetingWithParticipants'] = false;
			$scope.calendar.dateOptions['workshops'].minDate = $scope.opDates.interviewMeetingWithParticipants;
		}
		if ($scope.opDates.workshops) {
			$scope.calendar.opened['workshops'] = false;
			$scope.calendar.dateOptions['commencementOfSurveyProcess'].minDate = $scope.opDates.workshops;
		}
		if ($scope.opDates.commencementOfSurveyProcess) {
			$scope.calendar.opened['commencementOfSurveyProcess'] = false;
			$scope.calendar.dateOptions['closerOfSurveyProcess'].minDate = $scope.opDates.commencementOfSurveyProcess;
		}
		if ($scope.opDates.closerOfSurveyProcess) {
			$scope.calendar.opened['closerOfSurveyProcess'] = false;
			$scope.calendar.dateOptions['expectedFirstDraft'].minDate = $scope.opDates.closerOfSurveyProcess;
		}
		if ($scope.opDates.expectedFirstDraft) {
			$scope.calendar.opened['expectedFirstDraft'] = false;
			$scope.calendar.dateOptions['discussionOfFirstDraft'].minDate = $scope.opDates.expectedFirstDraft;
		}
		if ($scope.opDates.discussionOfFirstDraft) {
			$scope.calendar.opened['discussionOfFirstDraft'] = false;
			$scope.calendar.dateOptions['finalWorkshop'].minDate = $scope.opDates.discussionOfFirstDraft;
		}
		if ($scope.opDates.finalWorkshop) {
			$scope.calendar.opened['finalWorkshop'] = false;
			$scope.calendar.dateOptions['discussionOfFirstDraft'].minDate = $scope.opDates.finalWorkshop;
		}
		if ($scope.opDates.finalReportDelivery) {
			$scope.calendar.opened['finalReportDelivery'] = false;
		}

	}

	$scope.calendar = {
		opened : {},
		enabled : {},
		interviewDateOpened : [],
		interviewDateOptions : [],
		workshopDateOpened : [],
		workshopDateOptions : [],
		dateFormat : $scope.format,
		openInterViewDate : function($event, index) {
			var event = $event || window.event;
			$scope.resetOpenedDatePicker(event);

			if ($scope.opDates.interviewMeetingWithParticipantsList[index + 1]) {
				swal("There are other dates dependent on this date. Please clear all dependent dates");
			} else {
				$scope.calendar.interviewDateOpened[index].opened = true;
			}
		},
		openWorkshopDate : function($event, index) {
			var event = $event || window.event;
			$scope.resetOpenedDatePicker(event);

			if ($scope.opDates.workshopsList[index + 1]) {
				swal("There are other dates dependent on this date. Please clear all dependent dates");
			} else {
				$scope.calendar.workshopDateOpened[index].opened = true;
			}
		},
		open : function($event, which, next) {
			var event = $event || window.event;
			$scope.resetOpenedDatePicker(event);

			if ($scope.opDates[next]) {
				swal("There are other dates dependent on this date. Please clear all dependent dates");
			} else {
				$scope.calendar.opened[which] = true;
				if ($scope.calendar.dateOptions[next] == null) {
					$scope.calendar.dateOptions[next] = {};
				}
			}
		},
		change : function($event, which, next) {
			if ($scope.opDates[which]) {
				$scope.calendar.dateOptions[next].minDate = $scope.opDates[which];
				$scope.calendar.enabled[next] = true;
			} else {
				$scope.calendar.enabled[next] = false;
			}
		}
	};
} ])

// Create survey page
.controller("createSurvey", ["$scope", "$http","$uibModal","$routeParams","api-services","sweet","$location","$q","$timeout", function($scope, $http, $uibModal, $routeParams,apiServices, sweet, $location, $q, $timeout) {
	window.scrollTo(1, 1);
	$scope.client = apiServices.getObject("selectedClient");
	$scope.engagement = apiServices.getObject("selectedEngagement");
	apiServices.getEngagementsById($scope.engagement.taskId)
	.success(
			function(data) {
				$scope.selectedEngagement = data['engagement'];
				apiServices.updateSelectedEngagement($scope.selectedEngagement,data);
				apiServices.storeObject("selectedEngagement",$scope.selectedEngagement);
			}).error(function(d, s, h, c) {
				apiServices.handleError(d,s, h, c);
			});
	$scope.engagement = apiServices.getObject("selectedEngagement");
	$scope.allEngagement = apiServices.getObject("engagements");
	$scope.otherEngagements = [];

	$scope.allEngagement.forEach(function(eng) {
		if (eng.taskId != $scope.engagement.taskId) {
			apiServices.getEngagementsById(eng.taskId)
			.success( function(data) {
				$scope.otherEngagement = data['engagement'];
				apiServices.updateSelectedEngagement($scope.otherEngagement,data);

				// Push the engagements which survey is not null by checking that country is not null
				if($scope.otherEngagement.survey != null && $scope.otherEngagement.survey.country != null) {
					$scope.otherEngagements.push(eng);
				}
			}).error(function(d, s, h, c) {
				apiServices.handleError(d,s, h, c);
			});
		}
	});

	$scope.saveInProgress = false;
	$scope.publishInProgress = false;
	$scope.surveySavedSuccessfully = false;
	$scope.riskname = '';
	$scope.riskdesc = '';
	$scope.participantEmails = [];
	$scope.staticContent = {countries : [
	                                     {
	                                    	 name : 'Afghanistan',
	                                    	 code : 'AF'
	                                     },
	                                     {
	                                    	 name : 'Aland Islands',
	                                    	 code : 'AX'
	                                     },
	                                     {
	                                    	 name : 'Albania',
	                                    	 code : 'AL'
	                                     },
	                                     {
	                                    	 name : 'Algeria',
	                                    	 code : 'DZ'
	                                     },
	                                     {
	                                    	 name : 'American Samoa',
	                                    	 code : 'AS'
	                                     },
	                                     {
	                                    	 name : 'Andorra',
	                                    	 code : 'AD'
	                                     },
	                                     {
	                                    	 name : 'Angola',
	                                    	 code : 'AO'
	                                     },
	                                     {
	                                    	 name : 'Anguilla',
	                                    	 code : 'AI'
	                                     },
	                                     {
	                                    	 name : 'Antarctica',
	                                    	 code : 'AQ'
	                                     },
	                                     {
	                                    	 name : 'Antigua and Barbuda',
	                                    	 code : 'AG'
	                                     },
	                                     {
	                                    	 name : 'Argentina',
	                                    	 code : 'AR'
	                                     },
	                                     {
	                                    	 name : 'Armenia',
	                                    	 code : 'AM'
	                                     },
	                                     {
	                                    	 name : 'Aruba',
	                                    	 code : 'AW'
	                                     },
	                                     {
	                                    	 name : 'Australia',
	                                    	 code : 'AU'
	                                     },
	                                     {
	                                    	 name : 'Austria',
	                                    	 code : 'AT'
	                                     },
	                                     {
	                                    	 name : 'Azerbaijan',
	                                    	 code : 'AZ'
	                                     },
	                                     {
	                                    	 name : 'Bahamas',
	                                    	 code : 'BS'
	                                     },
	                                     {
	                                    	 name : 'Bahrain',
	                                    	 code : 'BH'
	                                     },
	                                     {
	                                    	 name : 'Bangladesh',
	                                    	 code : 'BD'
	                                     },
	                                     {
	                                    	 name : 'Barbados',
	                                    	 code : 'BB'
	                                     },
	                                     {
	                                    	 name : 'Belarus',
	                                    	 code : 'BY'
	                                     },
	                                     {
	                                    	 name : 'Belgium',
	                                    	 code : 'BE'
	                                     },
	                                     {
	                                    	 name : 'Belize',
	                                    	 code : 'BZ'
	                                     },
	                                     {
	                                    	 name : 'Benin',
	                                    	 code : 'BJ'
	                                     },
	                                     {
	                                    	 name : 'Bermuda',
	                                    	 code : 'BM'
	                                     },
	                                     {
	                                    	 name : 'Bhutan',
	                                    	 code : 'BT'
	                                     },
	                                     {
	                                    	 name : 'Bolivia',
	                                    	 code : 'BO'
	                                     },
	                                     {
	                                    	 name : 'Bosnia and Herzegovina',
	                                    	 code : 'BA'
	                                     },
	                                     {
	                                    	 name : 'Botswana',
	                                    	 code : 'BW'
	                                     },
	                                     {
	                                    	 name : 'Bouvet Island',
	                                    	 code : 'BV'
	                                     },
	                                     {
	                                    	 name : 'Brazil',
	                                    	 code : 'BR'
	                                     },
	                                     {
	                                    	 name : 'British Indian Ocean Territory',
	                                    	 code : 'IO'
	                                     },
	                                     {
	                                    	 name : 'Brunei Darussalam',
	                                    	 code : 'BN'
	                                     },
	                                     {
	                                    	 name : 'Bulgaria',
	                                    	 code : 'BG'
	                                     },
	                                     {
	                                    	 name : 'Burkina Faso',
	                                    	 code : 'BF'
	                                     },
	                                     {
	                                    	 name : 'Burundi',
	                                    	 code : 'BI'
	                                     },
	                                     {
	                                    	 name : 'Cambodia',
	                                    	 code : 'KH'
	                                     },
	                                     {
	                                    	 name : 'Cameroon',
	                                    	 code : 'CM'
	                                     },
	                                     {
	                                    	 name : 'Canada',
	                                    	 code : 'CA'
	                                     },
	                                     {
	                                    	 name : 'Cape Verde',
	                                    	 code : 'CV'
	                                     },
	                                     {
	                                    	 name : 'Cayman Islands',
	                                    	 code : 'KY'
	                                     },
	                                     {
	                                    	 name : 'Central African Republic',
	                                    	 code : 'CF'
	                                     },
	                                     {
	                                    	 name : 'Chad',
	                                    	 code : 'TD'
	                                     },
	                                     {
	                                    	 name : 'Chile',
	                                    	 code : 'CL'
	                                     },
	                                     {
	                                    	 name : 'China',
	                                    	 code : 'CN'
	                                     },
	                                     {
	                                    	 name : 'Christmas Island',
	                                    	 code : 'CX'
	                                     },
	                                     {
	                                    	 name : 'Cocos (Keeling) Islands',
	                                    	 code : 'CC'
	                                     },
	                                     {
	                                    	 name : 'Colombia',
	                                    	 code : 'CO'
	                                     },
	                                     {
	                                    	 name : 'Comoros',
	                                    	 code : 'KM'
	                                     },
	                                     {
	                                    	 name : 'Congo',
	                                    	 code : 'CG'
	                                     },
	                                     {
	                                    	 name : 'Congo, The Democratic Republic of the',
	                                    	 code : 'CD'
	                                     },
	                                     {
	                                    	 name : 'Cook Islands',
	                                    	 code : 'CK'
	                                     },
	                                     {
	                                    	 name : 'Costa Rica',
	                                    	 code : 'CR'
	                                     },
	                                     {
	                                    	 name : 'Cote D\'Ivoire',
	                                    	 code : 'CI'
	                                     },
	                                     {
	                                    	 name : 'Croatia',
	                                    	 code : 'HR'
	                                     },
	                                     {
	                                    	 name : 'Cuba',
	                                    	 code : 'CU'
	                                     },
	                                     {
	                                    	 name : 'Cyprus',
	                                    	 code : 'CY'
	                                     },
	                                     {
	                                    	 name : 'Czech Republic',
	                                    	 code : 'CZ'
	                                     },
	                                     {
	                                    	 name : 'Denmark',
	                                    	 code : 'DK'
	                                     },
	                                     {
	                                    	 name : 'Djibouti',
	                                    	 code : 'DJ'
	                                     },
	                                     {
	                                    	 name : 'Dominica',
	                                    	 code : 'DM'
	                                     },
	                                     {
	                                    	 name : 'Dominican Republic',
	                                    	 code : 'DO'
	                                     },
	                                     {
	                                    	 name : 'Ecuador',
	                                    	 code : 'EC'
	                                     },
	                                     {
	                                    	 name : 'Egypt',
	                                    	 code : 'EG'
	                                     },
	                                     {
	                                    	 name : 'El Salvador',
	                                    	 code : 'SV'
	                                     },
	                                     {
	                                    	 name : 'Equatorial Guinea',
	                                    	 code : 'GQ'
	                                     },
	                                     {
	                                    	 name : 'Eritrea',
	                                    	 code : 'ER'
	                                     },
	                                     {
	                                    	 name : 'Estonia',
	                                    	 code : 'EE'
	                                     },
	                                     {
	                                    	 name : 'Ethiopia',
	                                    	 code : 'ET'
	                                     },
	                                     {
	                                    	 name : 'Falkland Islands (Malvinas)',
	                                    	 code : 'FK'
	                                     },
	                                     {
	                                    	 name : 'Faroe Islands',
	                                    	 code : 'FO'
	                                     },
	                                     {
	                                    	 name : 'Fiji',
	                                    	 code : 'FJ'
	                                     },
	                                     {
	                                    	 name : 'Finland',
	                                    	 code : 'FI'
	                                     },
	                                     {
	                                    	 name : 'France',
	                                    	 code : 'FR'
	                                     },
	                                     {
	                                    	 name : 'French Guiana',
	                                    	 code : 'GF'
	                                     },
	                                     {
	                                    	 name : 'French Polynesia',
	                                    	 code : 'PF'
	                                     },
	                                     {
	                                    	 name : 'French Southern Territories',
	                                    	 code : 'TF'
	                                     },
	                                     {
	                                    	 name : 'Gabon',
	                                    	 code : 'GA'
	                                     },
	                                     {
	                                    	 name : 'Gambia',
	                                    	 code : 'GM'
	                                     },
	                                     {
	                                    	 name : 'Georgia',
	                                    	 code : 'GE'
	                                     },
	                                     {
	                                    	 name : 'Germany',
	                                    	 code : 'DE'
	                                     },
	                                     {
	                                    	 name : 'Ghana',
	                                    	 code : 'GH'
	                                     },
	                                     {
	                                    	 name : 'Gibraltar',
	                                    	 code : 'GI'
	                                     },
	                                     {
	                                    	 name : 'Greece',
	                                    	 code : 'GR'
	                                     },
	                                     {
	                                    	 name : 'Greenland',
	                                    	 code : 'GL'
	                                     },
	                                     {
	                                    	 name : 'Grenada',
	                                    	 code : 'GD'
	                                     },
	                                     {
	                                    	 name : 'Guadeloupe',
	                                    	 code : 'GP'
	                                     },
	                                     {
	                                    	 name : 'Guam',
	                                    	 code : 'GU'
	                                     },
	                                     {
	                                    	 name : 'Guatemala',
	                                    	 code : 'GT'
	                                     },
	                                     {
	                                    	 name : 'Guernsey',
	                                    	 code : 'GG'
	                                     },
	                                     {
	                                    	 name : 'Guinea',
	                                    	 code : 'GN'
	                                     },
	                                     {
	                                    	 name : 'Guinea-Bissau',
	                                    	 code : 'GW'
	                                     },
	                                     {
	                                    	 name : 'Guyana',
	                                    	 code : 'GY'
	                                     },
	                                     {
	                                    	 name : 'Haiti',
	                                    	 code : 'HT'
	                                     },
	                                     {
	                                    	 name : 'Heard Island and Mcdonald Islands',
	                                    	 code : 'HM'
	                                     },
	                                     {
	                                    	 name : 'Holy See (Vatican City State)',
	                                    	 code : 'VA'
	                                     },
	                                     {
	                                    	 name : 'Honduras',
	                                    	 code : 'HN'
	                                     },
	                                     {
	                                    	 name : 'Hong Kong',
	                                    	 code : 'HK'
	                                     },
	                                     {
	                                    	 name : 'Hungary',
	                                    	 code : 'HU'
	                                     },
	                                     {
	                                    	 name : 'Iceland',
	                                    	 code : 'IS'
	                                     },
	                                     {
	                                    	 name : 'India',
	                                    	 code : 'IN'
	                                     },
	                                     {
	                                    	 name : 'Indonesia',
	                                    	 code : 'ID'
	                                     },
	                                     {
	                                    	 name : 'Iran, Islamic Republic Of',
	                                    	 code : 'IR'
	                                     },
	                                     {
	                                    	 name : 'Iraq',
	                                    	 code : 'IQ'
	                                     },
	                                     {
	                                    	 name : 'Ireland',
	                                    	 code : 'IE'
	                                     },
	                                     {
	                                    	 name : 'Isle of Man',
	                                    	 code : 'IM'
	                                     },
	                                     {
	                                    	 name : 'Israel',
	                                    	 code : 'IL'
	                                     },
	                                     {
	                                    	 name : 'Italy',
	                                    	 code : 'IT'
	                                     },
	                                     {
	                                    	 name : 'Jamaica',
	                                    	 code : 'JM'
	                                     },
	                                     {
	                                    	 name : 'Japan',
	                                    	 code : 'JP'
	                                     },
	                                     {
	                                    	 name : 'Jersey',
	                                    	 code : 'JE'
	                                     },
	                                     {
	                                    	 name : 'Jordan',
	                                    	 code : 'JO'
	                                     },
	                                     {
	                                    	 name : 'Kazakhstan',
	                                    	 code : 'KZ'
	                                     },
	                                     {
	                                    	 name : 'Kenya',
	                                    	 code : 'KE'
	                                     },
	                                     {
	                                    	 name : 'Kiribati',
	                                    	 code : 'KI'
	                                     },
	                                     {
	                                    	 name : 'Korea, Democratic People\'s Republic of',
	                                    	 code : 'KP'
	                                     },
	                                     {
	                                    	 name : 'Korea, Republic of',
	                                    	 code : 'KR'
	                                     },
	                                     {
	                                    	 name : 'Kuwait',
	                                    	 code : 'KW'
	                                     },
	                                     {
	                                    	 name : 'Kyrgyzstan',
	                                    	 code : 'KG'
	                                     },
	                                     {
	                                    	 name : 'Lao People\'s Democratic Republic',
	                                    	 code : 'LA'
	                                     },
	                                     {
	                                    	 name : 'Latvia',
	                                    	 code : 'LV'
	                                     },
	                                     {
	                                    	 name : 'Lebanon',
	                                    	 code : 'LB'
	                                     },
	                                     {
	                                    	 name : 'Lesotho',
	                                    	 code : 'LS'
	                                     },
	                                     {
	                                    	 name : 'Liberia',
	                                    	 code : 'LR'
	                                     },
	                                     {
	                                    	 name : 'Libyan Arab Jamahiriya',
	                                    	 code : 'LY'
	                                     },
	                                     {
	                                    	 name : 'Liechtenstein',
	                                    	 code : 'LI'
	                                     },
	                                     {
	                                    	 name : 'Lithuania',
	                                    	 code : 'LT'
	                                     },
	                                     {
	                                    	 name : 'Luxembourg',
	                                    	 code : 'LU'
	                                     },
	                                     {
	                                    	 name : 'Macao',
	                                    	 code : 'MO'
	                                     },
	                                     {
	                                    	 name : 'Macedonia, The Former Yugoslav Republic of',
	                                    	 code : 'MK'
	                                     },
	                                     {
	                                    	 name : 'Madagascar',
	                                    	 code : 'MG'
	                                     },
	                                     {
	                                    	 name : 'Malawi',
	                                    	 code : 'MW'
	                                     },
	                                     {
	                                    	 name : 'Malaysia',
	                                    	 code : 'MY'
	                                     },
	                                     {
	                                    	 name : 'Maldives',
	                                    	 code : 'MV'
	                                     },
	                                     {
	                                    	 name : 'Mali',
	                                    	 code : 'ML'
	                                     },
	                                     {
	                                    	 name : 'Malta',
	                                    	 code : 'MT'
	                                     },
	                                     {
	                                    	 name : 'Marshall Islands',
	                                    	 code : 'MH'
	                                     },
	                                     {
	                                    	 name : 'Martinique',
	                                    	 code : 'MQ'
	                                     },
	                                     {
	                                    	 name : 'Mauritania',
	                                    	 code : 'MR'
	                                     },
	                                     {
	                                    	 name : 'Mauritius',
	                                    	 code : 'MU'
	                                     },
	                                     {
	                                    	 name : 'Mayotte',
	                                    	 code : 'YT'
	                                     },
	                                     {
	                                    	 name : 'Mexico',
	                                    	 code : 'MX'
	                                     },
	                                     {
	                                    	 name : 'Micronesia, Federated States of',
	                                    	 code : 'FM'
	                                     },
	                                     {
	                                    	 name : 'Moldova, Republic of',
	                                    	 code : 'MD'
	                                     },
	                                     {
	                                    	 name : 'Monaco',
	                                    	 code : 'MC'
	                                     },
	                                     {
	                                    	 name : 'Mongolia',
	                                    	 code : 'MN'
	                                     },
	                                     {
	                                    	 name : 'Montserrat',
	                                    	 code : 'MS'
	                                     },
	                                     {
	                                    	 name : 'Morocco',
	                                    	 code : 'MA'
	                                     },
	                                     {
	                                    	 name : 'Mozambique',
	                                    	 code : 'MZ'
	                                     },
	                                     {
	                                    	 name : 'Myanmar',
	                                    	 code : 'MM'
	                                     },
	                                     {
	                                    	 name : 'Namibia',
	                                    	 code : 'NA'
	                                     },
	                                     {
	                                    	 name : 'Nauru',
	                                    	 code : 'NR'
	                                     },
	                                     {
	                                    	 name : 'Nepal',
	                                    	 code : 'NP'
	                                     },
	                                     {
	                                    	 name : 'Netherlands',
	                                    	 code : 'NL'
	                                     },
	                                     {
	                                    	 name : 'Netherlands Antilles',
	                                    	 code : 'AN'
	                                     },
	                                     {
	                                    	 name : 'New Caledonia',
	                                    	 code : 'NC'
	                                     },
	                                     {
	                                    	 name : 'New Zealand',
	                                    	 code : 'NZ'
	                                     },
	                                     {
	                                    	 name : 'Nicaragua',
	                                    	 code : 'NI'
	                                     },
	                                     {
	                                    	 name : 'Niger',
	                                    	 code : 'NE'
	                                     },
	                                     {
	                                    	 name : 'Nigeria',
	                                    	 code : 'NG'
	                                     },
	                                     {
	                                    	 name : 'Niue',
	                                    	 code : 'NU'
	                                     },
	                                     {
	                                    	 name : 'Norfolk Island',
	                                    	 code : 'NF'
	                                     },
	                                     {
	                                    	 name : 'Northern Mariana Islands',
	                                    	 code : 'MP'
	                                     },
	                                     {
	                                    	 name : 'Norway',
	                                    	 code : 'NO'
	                                     },
	                                     {
	                                    	 name : 'Oman',
	                                    	 code : 'OM'
	                                     },
	                                     {
	                                    	 name : 'Pakistan',
	                                    	 code : 'PK'
	                                     },
	                                     {
	                                    	 name : 'Palau',
	                                    	 code : 'PW'
	                                     },
	                                     {
	                                    	 name : 'Palestinian Territory, Occupied',
	                                    	 code : 'PS'
	                                     },
	                                     {
	                                    	 name : 'Panama',
	                                    	 code : 'PA'
	                                     },
	                                     {
	                                    	 name : 'Papua New Guinea',
	                                    	 code : 'PG'
	                                     },
	                                     {
	                                    	 name : 'Paraguay',
	                                    	 code : 'PY'
	                                     },
	                                     {
	                                    	 name : 'Peru',
	                                    	 code : 'PE'
	                                     },
	                                     {
	                                    	 name : 'Philippines',
	                                    	 code : 'PH'
	                                     },
	                                     {
	                                    	 name : 'Pitcairn',
	                                    	 code : 'PN'
	                                     },
	                                     {
	                                    	 name : 'Poland',
	                                    	 code : 'PL'
	                                     },
	                                     {
	                                    	 name : 'Portugal',
	                                    	 code : 'PT'
	                                     },
	                                     {
	                                    	 name : 'Puerto Rico',
	                                    	 code : 'PR'
	                                     },
	                                     {
	                                    	 name : 'Qatar',
	                                    	 code : 'QA'
	                                     },
	                                     {
	                                    	 name : 'Reunion',
	                                    	 code : 'RE'
	                                     },
	                                     {
	                                    	 name : 'Romania',
	                                    	 code : 'RO'
	                                     },
	                                     {
	                                    	 name : 'Russian Federation',
	                                    	 code : 'RU'
	                                     },
	                                     {
	                                    	 name : 'Rwanda',
	                                    	 code : 'RW'
	                                     },
	                                     {
	                                    	 name : 'Saint Helena',
	                                    	 code : 'SH'
	                                     },
	                                     {
	                                    	 name : 'Saint Kitts and Nevis',
	                                    	 code : 'KN'
	                                     },
	                                     {
	                                    	 name : 'Saint Lucia',
	                                    	 code : 'LC'
	                                     },
	                                     {
	                                    	 name : 'Saint Pierre and Miquelon',
	                                    	 code : 'PM'
	                                     },
	                                     {
	                                    	 name : 'Saint Vincent and the Grenadines',
	                                    	 code : 'VC'
	                                     },
	                                     {
	                                    	 name : 'Samoa',
	                                    	 code : 'WS'
	                                     },
	                                     {
	                                    	 name : 'San Marino',
	                                    	 code : 'SM'
	                                     },
	                                     {
	                                    	 name : 'Sao Tome and Principe',
	                                    	 code : 'ST'
	                                     },
	                                     {
	                                    	 name : 'Saudi Arabia',
	                                    	 code : 'SA'
	                                     },
	                                     {
	                                    	 name : 'Senegal',
	                                    	 code : 'SN'
	                                     },
	                                     {
	                                    	 name : 'Serbia and Montenegro',
	                                    	 code : 'CS'
	                                     },
	                                     {
	                                    	 name : 'Seychelles',
	                                    	 code : 'SC'
	                                     },
	                                     {
	                                    	 name : 'Sierra Leone',
	                                    	 code : 'SL'
	                                     },
	                                     {
	                                    	 name : 'Singapore',
	                                    	 code : 'SG'
	                                     },
	                                     {
	                                    	 name : 'Slovakia',
	                                    	 code : 'SK'
	                                     },
	                                     {
	                                    	 name : 'Slovenia',
	                                    	 code : 'SI'
	                                     },
	                                     {
	                                    	 name : 'Solomon Islands',
	                                    	 code : 'SB'
	                                     },
	                                     {
	                                    	 name : 'Somalia',
	                                    	 code : 'SO'
	                                     },
	                                     {
	                                    	 name : 'South Africa',
	                                    	 code : 'ZA'
	                                     },
	                                     {
	                                    	 name : 'South Georgia and the South Sandwich Islands',
	                                    	 code : 'GS'
	                                     },
	                                     {
	                                    	 name : 'Spain',
	                                    	 code : 'ES'
	                                     },
	                                     {
	                                    	 name : 'Sri Lanka',
	                                    	 code : 'LK'
	                                     },
	                                     {
	                                    	 name : 'Sudan',
	                                    	 code : 'SD'
	                                     },
	                                     {
	                                    	 name : 'Suriname',
	                                    	 code : 'SR'
	                                     },
	                                     {
	                                    	 name : 'Svalbard and Jan Mayen',
	                                    	 code : 'SJ'
	                                     },
	                                     {
	                                    	 name : 'Swaziland',
	                                    	 code : 'SZ'
	                                     },
	                                     {
	                                    	 name : 'Sweden',
	                                    	 code : 'SE'
	                                     },
	                                     {
	                                    	 name : 'Switzerland',
	                                    	 code : 'CH'
	                                     },
	                                     {
	                                    	 name : 'Syrian Arab Republic',
	                                    	 code : 'SY'
	                                     },
	                                     {
	                                    	 name : 'Taiwan, Province of China',
	                                    	 code : 'TW'
	                                     },
	                                     {
	                                    	 name : 'Tajikistan',
	                                    	 code : 'TJ'
	                                     },
	                                     {
	                                    	 name : 'Tanzania, United Republic of',
	                                    	 code : 'TZ'
	                                     },
	                                     {
	                                    	 name : 'Thailand',
	                                    	 code : 'TH'
	                                     },
	                                     {
	                                    	 name : 'Timor-Leste',
	                                    	 code : 'TL'
	                                     },
	                                     {
	                                    	 name : 'Togo',
	                                    	 code : 'TG'
	                                     },
	                                     {
	                                    	 name : 'Tokelau',
	                                    	 code : 'TK'
	                                     },
	                                     {
	                                    	 name : 'Tonga',
	                                    	 code : 'TO'
	                                     },
	                                     {
	                                    	 name : 'Trinidad and Tobago',
	                                    	 code : 'TT'
	                                     },
	                                     {
	                                    	 name : 'Tunisia',
	                                    	 code : 'TN'
	                                     },
	                                     {
	                                    	 name : 'Turkey',
	                                    	 code : 'TR'
	                                     },
	                                     {
	                                    	 name : 'Turkmenistan',
	                                    	 code : 'TM'
	                                     },
	                                     {
	                                    	 name : 'Turks and Caicos Islands',
	                                    	 code : 'TC'
	                                     },
	                                     {
	                                    	 name : 'Tuvalu',
	                                    	 code : 'TV'
	                                     },
	                                     {
	                                    	 name : 'Uganda',
	                                    	 code : 'UG'
	                                     },
	                                     {
	                                    	 name : 'Ukraine',
	                                    	 code : 'UA'
	                                     },
	                                     {
	                                    	 name : 'United Arab Emirates',
	                                    	 code : 'AE'
	                                     },
	                                     {
	                                    	 name : 'United Kingdom',
	                                    	 code : 'GB'
	                                     },
	                                     {
	                                    	 name : 'United States',
	                                    	 code : 'US'
	                                     },
	                                     {
	                                    	 name : 'United States Minor Outlying Islands',
	                                    	 code : 'UM'
	                                     }, {
	                                    	 name : 'Uruguay',
	                                    	 code : 'UY'
	                                     }, {
	                                    	 name : 'Uzbekistan',
	                                    	 code : 'UZ'
	                                     }, {
	                                    	 name : 'Vanuatu',
	                                    	 code : 'VU'
	                                     }, {
	                                    	 name : 'Venezuela',
	                                    	 code : 'VE'
	                                     }, {
	                                    	 name : 'Vietnam',
	                                    	 code : 'VN'
	                                     }, {
	                                    	 name : 'Virgin Islands, British',
	                                    	 code : 'VG'
	                                     }, {
	                                    	 name : 'Virgin Islands, U.S.',
	                                    	 code : 'VI'
	                                     }, {
	                                    	 name : 'Wallis and Futuna',
	                                    	 code : 'WF'
	                                     }, {
	                                    	 name : 'Western Sahara',
	                                    	 code : 'EH'
	                                     }, {
	                                    	 name : 'Yemen',
	                                    	 code : 'YE'
	                                     }, {
	                                    	 name : 'Zambia',
	                                    	 code : 'ZM'
	                                     }, {
	                                    	 name : 'Zimbabwe',
	                                    	 code : 'ZW'
	                                     } ],
	                                     regions : [ "North America", "EMEA", "ASPAC" ],
	                                     industries : [ "Ageing", "Agribusiness",
	                                                    "Asia business", "Automotive",
	                                                    "Banking & Capital Markets",
	                                                    "Chemicals",
	                                                    "Defence & National Security",
	                                                    "Education", "Financial Services",
	                                                    "Food, Drink & Consumer Products",
	                                                    "Government & Public Sector", "Health",
	                                                    "Human Services",
	                                                    "Industrial Manufacturing",
	                                                    "Infrastructure", "Insurance",
	                                                    "Justice & Security", "Media",
	                                                    "Mining", "Not-for-profit",
	                                                    "Oil & Gas", "Pharmaceuticals",
	                                                    "Power & Utilities", "Private Equity",
	                                                    "Real Estate & Construction", "Retail",
	                                                    "Technology", "Telecommunication",
	                                                    "Transport & Logistics",
	                                                    "Wealth Management" ],
	                                                    businessUnits : [ "Financial Services",
	                                                                      "Consumer Markets",
	                                                                      "Industrial Markets",
	                                                                      "SMEs and Self-Employed Individuals",
	                                                                      "Information",
	                                                                      "Communications & Entertainment",
	                                                                      "Infrastructure",
	                                                                      "Government & Health Care" ],
	                                                                      noOfRespondent : "",

	};
	$scope.survey = $scope.engagement.survey;
	if ($scope.survey == null) {
		$scope.surveyCreated = false;
		$scope.survey = {
				country : "",
				region : "",
				industry : "",
				businessUnit : "",
				riskListSignedOff : "",
				noOfRespondent : "",
				risks : [ {
					name : "",
					desc : "",
					editMode : "true"
				} ],
				severity : [ "Very Low", "Low", "Medium", "High", "Very High" ],
				likelihood : [ "Very Low", "Low", "Medium", "High", "Very High" ],
				velocity : [ "Immediately", "6 Months", "12 Months","24 Months","> 48 Months" ],
				published : false,
				closed : false,
				participants : [ {
					name : "",
					lName : "",
					emailId : "",
					editMode : true
				} ]
		};
	} else {
		$scope.participantEmails = [{
			name : "",
			lname : "",
			emailId : "",
			editMode : true
		}];
		if($scope.survey.country){
			$scope.surveyCreated = true;
		} else{
			$scope.surveyCreated = false;
		}
		for (var riskCount = 0; riskCount < $scope.survey.risks.length; riskCount++) {
			if ($scope.survey.risks[riskCount].name != "") {
				$scope.survey.risks[riskCount].editMode = false;
			}
		}
	}

	$scope.showMaxRiskError = false;
	var maxRiskAlert = angular.element(document
			.querySelector('#maxRiskAlert'));
	// Currently one is maximum risk details required
	$scope.maximumRiskRequired = 20;

	$scope.addRisk = function() {
		if ($scope.survey.risks.length == $scope.maximumRiskRequired) {
			$scope.showMaxRiskError = true;
			$scope.showMinRiskError = false;

			window.scrollTo(1, 1);
		} else {
			$scope.showMaxRiskError = false;
			$scope.survey.risks.push({
				'name' : $scope.riskname,
				'desc' : $scope.riskdesc,
				editMode : "false"
			});
			$scope.riskname = '';
			$scope.riskdesc = '';
		}
	}

	$scope.updateRisk = function() {
		$scope.engagement.survey = $scope.survey;
	}

	$scope.remove = function($index) {
		var risk = $scope.survey.risks[$index];
		if(risk.name != "" || risk.desc != ""){
			$scope.userForm.$dirty = true;
		}
		$scope.survey.risks.splice($index, 1);
	}
	$scope.showUploadError = false;
	$scope.showUploadSuccess = false;

	// Publish survey modal Popup
	$scope.confirmPublishSurvey = function() {
		$scope.isSaveAction = true;
		var modalInstance;
		if( $scope.selectedEngagement.survey.participants.length == 0) {
			modalInstance = $uibModal.open({
				animation : true,
				templateUrl : 'engagementManager/contents/directPublishSurveyConfirmModal.html',
				controller : 'publishSurveyConfirmModalController',
				backdrop : 'static',
				keyboard : false,
				resolve : {
					engagement : function() {
						return $scope.engagement;
					}
				}
			});
		} else {
			modalInstance = $uibModal.open({
				animation : true,
				templateUrl : 'engagementManager/contents/publishSurveyConfirmModal.html',
				controller : 'publishSurveyConfirmModalController',
				backdrop : 'static',
				keyboard : false,
				resolve : {
					engagement : function() {
						return $scope.engagement;
					}
				}
			});
		}
	};
	// Currently five is minimum risk details required
	$scope.minimumRiskRequired = 5;
	$scope.showMinRiskError = false;
	$scope.showReqFieldError = false;
	$scope.showRiskDuplicatedAlert = false;
	var minRiskAlert = angular.element(document.querySelector('#minRiskAlert'));
	var reqFieldAlert = angular.element(document.querySelector('#reqFieldAlert'));
	var riskDuplicatedAlert = angular.element(document.querySelector('#riskDuplicatedAlert'));

	$scope.saveSurvey = function() {
		$scope.showErrorsCheckValidity = true;
		$scope.duplicatedRiskName = $scope.getDuplicatedRisk();
		$scope.riskEdited = false;
		$scope.engagement = apiServices.getObject("selectedEngagement");
		// Checking whether Risks edited
		if($scope.engagement.survey != null && $scope.engagement.survey.surveyid != null){
			if($scope.engagement.survey.risks.length != $scope.survey.risks.length){
				$scope.riskEdited = true;
			}else{
				var riskNameList = [];
				$scope.survey.risks.forEach(function(risk){
					riskNameList.push(risk.name.toLowerCase());
				});
				$scope.engagement.survey.risks.forEach(function(risk){
					if(!$scope.riskEdited){
						if(riskNameList.indexOf(risk.name.toLowerCase()) == -1){
							$scope.riskEdited = true;
						}
					}
				});
			}
		}


		$scope.engagement.survey = $scope.survey;
		$scope.removeEmptyRisks();
		if (!$scope.isMinimumRiskEntered($scope.minimumRiskRequired) && $scope.userForm.$invalid) {
			$scope.showMinRiskError = true;
			$scope.showUploadSuccess = false;
			$scope.showReqFieldError = true;
			$scope.showMaxRiskError = false;
			window.scrollTo(1, 1);

		} else if (!$scope.isMinimumRiskEntered($scope.minimumRiskRequired)) {
			$scope.showMinRiskError = true;
			$scope.showUploadSuccess = false;
			$scope.showReqFieldError = false;
			$scope.showMaxRiskError = false;
			window.scrollTo(1, 1);
		} else if ($scope.userForm.$invalid) {
			$scope.showReqFieldError = true;
			$scope.showMaxRiskError = false;
			$scope.showMinRiskError = false;
			window.scrollTo(1, 1);
		} else if ($scope.duplicatedRiskName != null) {
			$scope.showRiskDuplicatedAlert = true;
			$scope.showReqFieldError = false;
			$scope.showMaxRiskError = false;
			$scope.showMinRiskError = false;
			window.scrollTo(1, 1);
		} else {
			$scope.showMinRiskError = false;
			apiServices.storeObject("selectedEngagement",$scope.engagement);
			$scope.saveInProgress = true;
			$scope.isSaveAction = true;
			var saveSurveyOject = {};
			saveSurveyOject['surveyid'] = $scope.engagement.survey.surveyid;
			saveSurveyOject['surveyEngagementid'] = $scope.engagement.taskId;
			saveSurveyOject['country'] = $scope.engagement.survey.country;
			saveSurveyOject['region'] = $scope.engagement.survey.region;
			saveSurveyOject['industry'] = $scope.engagement.survey.industry;
			saveSurveyOject['businessUnit'] = $scope.engagement.survey.businessUnit;
			saveSurveyOject['noOfRespondent'] = $scope.engagement.survey.noOfRespondent;
			saveSurveyOject['riskListSignedOff'] = $scope.engagement.survey.riskListSignedOff;
			saveSurveyOject['severityScale1'] = $scope.engagement.survey.severity[0];
			saveSurveyOject['severityScale2'] = $scope.engagement.survey.severity[1];
			saveSurveyOject['severityScale3'] = $scope.engagement.survey.severity[2];
			saveSurveyOject['severityScale4'] = $scope.engagement.survey.severity[3];
			saveSurveyOject['severityScale5'] = $scope.engagement.survey.severity[4];
			saveSurveyOject['likelihoodScale1'] = $scope.engagement.survey.likelihood[0];
			saveSurveyOject['likelihoodScale2'] = $scope.engagement.survey.likelihood[1];
			saveSurveyOject['likelihoodScale3'] = $scope.engagement.survey.likelihood[2];
			saveSurveyOject['likelihoodScale4'] = $scope.engagement.survey.likelihood[3];
			saveSurveyOject['likelihoodScale5'] = $scope.engagement.survey.likelihood[4];
			saveSurveyOject['velocityScale1'] = $scope.engagement.survey.velocity[0];
			saveSurveyOject['velocityScale2'] = $scope.engagement.survey.velocity[1];
			saveSurveyOject['velocityScale3'] = $scope.engagement.survey.velocity[2];
			saveSurveyOject['velocityScale4'] = $scope.engagement.survey.velocity[3];
			saveSurveyOject['velocityScale5'] = $scope.engagement.survey.velocity[4];
			saveSurveyOject['published'] = $scope.engagement.survey.published;
			saveSurveyOject['closed'] = $scope.engagement.survey.closed;
			saveSurveyOject['emailnote'] = $scope.engagement.survey.emailNote;
			var sso = {};
			sso['survey'] = saveSurveyOject;
			sso['orgid'] = $scope.engagement.clientId;
			sso['risks'] = $scope.engagement.survey.risks;
			sso['isRiskEdited'] = $scope.riskEdited;
			apiServices.saveSurvey($scope.engagement.taskId, sso).success(function(data, status, headers, config) {
				$scope.disableShare = false;
				$scope.error = "";
				$scope.participantEmail = "";
				$scope.emailNote = "";
				$scope.selectedEngagement = JSON.parse(localStorage.getItem("selectedEngagement"));
				apiServices.getEngagementsById($scope.selectedEngagement.taskId).success(function(data) {
					$scope.selectedEngagement = data['engagement'];
					apiServices.updateSelectedEngagement($scope.selectedEngagement,data);
					apiServices.storeObject("selectedEngagement",$scope.selectedEngagement);
					if ($scope.selectedEngagement.survey != null
							&& $scope.selectedEngagement.survey.closed) {
						$scope.disableShare = true;
						$scope.error = "This survey is now closed by the KPMG Engagement Manager. You are unable to share the survey.";
					}
				}).error(function(d, s, h, c) {
					apiServices.handleError(d, s, h, c);
				});
				$scope.surveyCreated = true;
				$scope.surveySavedSuccessfully = true;
				$scope.saveInProgress = false;
				if ($scope.selectedEngagement.survey != null) {
					$scope.isParticipantMail = !$scope.selectedEngagement.survey.published;
					//$scope.participantEmails = $scope.selectedEngagement.survey.participants;
				}
			})
			.error(function(d, s, h, c) {
				$scope.saveInProgress = false;
				apiServices.handleError(d,s, h, c);
			});
		}
	}

	/**
	 * Method is used to navigate in the same page to
	 * the given id of div.
	 */
	$scope.navigateToScreen = function(value) {
		if (value != 'top') {
			// navigate to the given id of the screen
			document.getElementById(value).scrollIntoView();
		} else {
			document.body.scrollTop = document.documentElement.scrollTop = 0;
		}

	};

	$scope.navigateTodashboard = function() {

		$location.path("/dashboard/" + $scope.engagement.clientId);
	};

	$scope.navigateTosendView = function() {

		$location.path("/sendSurvey");
	};

	$scope.getDuplicatedRisk = function() {
		var riskNames = [];
		var duplicatedRiskName = null;
		$scope.survey.risks.forEach(function(risk) {
			if (riskNames.length != 0 && riskNames.indexOf(risk.name) != -1) {
				duplicatedRiskName = risk.name;
			} else {
				riskNames.push(risk.name);
			}
		});
		return duplicatedRiskName;
	}

	$scope.isMinimumRiskEntered = function(minimumRiskRequired) {
		var risks = $scope.engagement.survey.risks;
		if (risks != null && risks.length >= minimumRiskRequired) {
			for (var arrayIndex = 0; arrayIndex < minimumRiskRequired; arrayIndex++) {
				var risk = risks[arrayIndex];
				if (risk == null || risk.name == null
						|| risk.name == "") {
					return false;
				}
			}
			return true;
		} else {
			return false;
		}
	}

	$scope.removeEmptyRisks = function() {
		$scope.allRisks = [];
		$scope.engagement.survey.risks.forEach(function(risk) {
			if (risk.name) {
				$scope.allRisks.push(risk);
			}
		})
		$scope.engagement.survey.risks = $scope.allRisks;
	}

	$scope.radioModel = 'Published';
	$scope.radioModel1 = 'NO';
	$scope.disableShare = false;
	$scope.error = "";
	$scope.participantEmail = "";
	$scope.emailNote = "";
	$scope.selectedEngagement = JSON.parse(localStorage.getItem("selectedEngagement"));

	apiServices.getEngagementsById($scope.selectedEngagement.taskId).success(function(data) {
		$scope.selectedEngagement = data['engagement'];
		apiServices.updateSelectedEngagement($scope.selectedEngagement,data);
		apiServices.storeObject("selectedEngagement",$scope.selectedEngagement);
		if ($scope.selectedEngagement.survey != null && $scope.selectedEngagement.survey.closed) {
			$scope.disableShare = true;
			$scope.error = "This survey is now closed by the KPMG Engagement Manager. You are unable to share the survey.";
		}
	}).error(function(d, s, h, c) {
		apiServices.handleError(d, s, h, c);
	});

	if ($scope.selectedEngagement.survey != null) {
		$scope.isParticipantMail = !$scope.selectedEngagement.survey.published;
		//$scope.participantEmails = $scope.selectedEngagement.survey.participants;
	}

	$scope.modalTitle = $scope.isParticipantMail ? "Share Test Survey" : "Share Survey";
	$scope.addParticipantEmail = function() {
		$scope.participantEmails.push({
			name : "",
			lname : "",
			emailId : "",
			editMode : true
		});
	}

	$scope.validateParticipant = function(participant){
		$scope.isValidParticipant = false;
		$scope.showErrorMessage = false;
		$scope.mailSendSuccessfully = false;
		participant.editMode = false;
		if(participant != null){
			if($scope.isValidParticipantName(participant.name)) {
				if($scope.isValidParticipantName(participant.lname)) {
					if($scope.isValidParticipantMailID(participant.emailId)) {
						if(!$scope.isDuplicatParticipantMailID(participant.emailId)){
							$scope.isValidParticipant = true;
						} else {
							$scope.errorMessage= "Duplicate Email address exists in recipients.";
						}
					} else {
						$scope.errorMessage= "Invalid Email address exists in recipients.";
					}
				} else {
					$scope.errorMessage= "Invalid Surname exists in recipients.";
				}
			}else {
				$scope.errorMessage= "Invalid First Name exists in recipients.";
			}
			if(!$scope.isValidParticipant){
				$scope.showErrorMessage = true;
				participant.editMode = true;
				document.getElementById("uploadError").scrollIntoView();
			}
		}
		
		return $scope.isValidParticipant;
	}

	$scope.isDuplicatParticipantMailID = function(emailId) {
		var isDuplicate = false;
		$scope.participantEmails.forEach(function(participant, rootIndex) {
			if (participant.emailId.toLowerCase() === emailId.toLowerCase()) {
				$scope.participantEmails.forEach(function(p, index) {
					if(rootIndex != index && p.emailId.toLowerCase() === emailId.toLowerCase()){
						isDuplicate = true;
					}
				});
			}		
		});
		return isDuplicate;
	}

	$scope.isValidParticipantMailID = function(emailId) {
		var isValidMail = false;
		var emailRegexPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (emailId && emailRegexPattern.test(emailId)) {
			isValidMail = true;
		}
		return isValidMail;
	}

	$scope.isValidParticipantName = function(name) {
		var isValidName = false;
		var nameRegexPattern =/^[a-zA-Z ']+$/;
		if (name && nameRegexPattern.test(name)) {
			isValidName = true;
		}
		return isValidName;
	}

	$scope.removeParticipantEmail = function($index) {
		var participant = $scope.participantEmails[$index];
		if(participant.name != "" || participant.lname != "" || participant.emailId != ""){
			$scope.userForm.$dirty = true;
		}
		$scope.participantEmails.splice($index, 1);
	}

	$scope.sendEmail = function() {
		// validate all the participant details
		if($scope.participantEmails.length != 0) {
			var isAllValidParticipant = true;
			$scope.participantEmails.forEach(function(participant) {
				if(!$scope.validateParticipant(participant)){
					isAllValidParticipant = false;
				}
			});

			if(isAllValidParticipant){
				$scope.showErrorMessage = false;
				$scope.showMessage = "none";
				$scope.mailSendSuccessfully = false;
				apiServices.storeObject("selectedEngagement",$scope.selectedEngagement);
				apiServices.storeObject("participantEmails",$scope.participantEmails);

				var modalInstance = $uibModal.open({
					animation : true,
					templateUrl : 'sendDraftSurveyConfirmation.html',
					controller : 'confirmationSendDraftSurveyController',
					backdrop : 'static',
					keyboard : false,
					resolve : {
						engagement : function() {
							return $scope.selectedEngagement;
						}
					}
				});

				modalInstance.result.then(function(returnObj) { 
					if(returnObj) {
						$scope.participantsList = [];
						$scope.sendEmailInProgress = true; // Show spinner
						$scope.selectedEngagement.survey.emailNote = $scope.emailNote;
						$scope.showMessage = "none";
						$scope.participantEmails.forEach(function(participant) {
							var participantEmail= participant.emailId;
							var existingParticipant =false;
							$scope.selectedEngagement.survey.participants.forEach(function(p) {
								if (p.emailId.toLowerCase() == participantEmail.toLowerCase()) {
									p.name = participant.name;
									p.lname = participant.lname;
									existingParticipant= true;
									$scope.participantsList.push(p);
								}
							});
							if(!existingParticipant) {
								$scope.participantsList.push({
									name : participant.name,
									lname : participant.lname,
									emailId : participantEmail

								});
							}			
						})
						apiServices.addParticipants($scope.participantsList, $scope.selectedEngagement.taskId).success(function(data, status,headers, config) {
							apiServices.getEngagementsById($scope.selectedEngagement.taskId).success(function(data) {
								apiServices.updateSelectedEngagement($scope.selectedEngagement,data);
								var baseurl = $location.protocol()+ "://"+ $location.host();
								if ($location.port() != 80) {
									baseurl = baseurl+ ":"+ $location.port();
								}
								$scope.participantsList.forEach(function(p) {
									for (var index = 0; index < $scope.selectedEngagement.survey.participants.length; index++) {
										if (p.emailId.toLowerCase() == $scope.selectedEngagement.survey.participants[index].emailId.toLowerCase()) {
											p.participantId= $scope.selectedEngagement.survey.participants[index].participantId;
										}
									}
								});
								var count = 0;
								var isMailSent = $scope.participantsList.length;
								$scope.participantsList.forEach(function(p) {
									var clickurl = baseurl+ window.location.pathname.replace('engagementManager.html','participant.html')
										+ "?engageId="+ $scope.selectedEngagement.taskId
										+ '&user='+ p.participantId
										+ '#/login?engageId='+ $scope.selectedEngagement.taskId
										+ '&user='+ p.participantId;
									if ($scope.emailNote && $scope.emailNote.length > 0) {
										$scope.showMessage = "block";
									}
									var emailopts = {
											"notification_name" : "DRAParticipantTestSurvey",
											"placeholders" : {
												"url" : clickurl,
												"email_content" : $scope.emailNote,
												"showMessage" : $scope.showMessage,
												"engagementManager_email": apiServices.getObject("currentUser").email,
												"engagement_id" : $scope.selectedEngagement.engagementId,
												"engagementManager_firstName" :  $scope.selectedEngagement.engagementManagerName,
												"engagementManager_lastName" : $scope.selectedEngagement.engagementManagerSurName,
												"firstName" : p.name
											},
											"client_id" : $scope.selectedEngagement.clientId
									};

									emailopts.to = p.emailId;

									$scope.emailSent = apiServices.sendEmail(emailopts).success(function(){
										$scope.showErrorMessage = false;
										var index = $scope.participantEmails.map(function(key){return key.emailId.toLowerCase()}).indexOf(p.emailId.toLowerCase());
										if(index != -1){
											$scope.participantEmails.splice(index, 1);
											count++;
											isMailSent--;
										}
										if(isMailSent == 0){
											$scope.emailNote = "";
											$scope.sendEmailInProgress = false;
											$scope.mailSendSuccessfully= true;
											$scope.sentEmailNote = "Your survey was sent successfully to "+count+" recipient/s.";
											if($scope.userForm != null){
												$scope.userForm.$dirty = false;
											} 
										}
									})
									.error(function(d,s,h,c) {
										isMailSent--;
										if(isMailSent == 0){
											$scope.emailNote = "";
											$scope.sendEmailInProgress = false;
											$scope.mailSendSuccessfully= true;
											if($scope.userForm != null){
												$scope.userForm.$dirty = false;
											}
											if(count > 0){
												$scope.sentEmailNote = "Your survey was sent successfully to "+count+" recipient/s.";
											}else{
												apiServices.handleError(d,s,h,c);
											}
										}
									});
								})
							})
							.error(function(d,s,h,c) {
								$scope.sendEmailInProgress = false;
								apiServices.handleError(d,s,h,c);
							});
						})
						.error(function(data, s, h, c) {
							var responseData = data;
							$scope.sendEmailInProgress = false;
							if (responseData != null && responseData.errorMessage != null) {
								$scope.error = responseData.errorMessage;
							} else {
								apiServices.handleError(data,s,h,c);
							}
						});
					} 		
				});
			} else {
				$scope.showErrorMessage = true;
			}
		} else{
			$scope.showErrorMessage = true;
			$scope.errorMessage = "Survey can't be sent, please add at least one recipient.";
		}
	};
	$scope.showUploadError = false;
	$scope.showUploadSuccess = false;
	$scope.uploadErrorMessage = null;
	$scope.uploadfileObj = null;

	$scope.riskEntered = function() {
		$scope.showUploadError = false;
		$scope.showUploadSuccess = false;
		$scope.showMaxRiskError = false;
		$scope.showMinRiskError = false;
		$scope.showRiskDuplicatedAlert = false;
	};

	$scope.riskUpload = function() {
		var modalInstance = $uibModal.open({
			animation : true,
			templateUrl : 'riskUpload.html',
			controller : 'riskUploadPopupController',
			backdrop : 'static',
			keyboard : false,
			resolve : {
				engagement : function() {
					return $scope.selectedEngagement;
				}
			}
		});
		modalInstance.result.then(function(returnObj) {
			$scope.userForm.$dirty = true;
			$scope.survey.risks = [];
			$scope.showUploadError = false;
			minRiskAlert.addClass('ng-hide');
			$scope.showMinRiskError = false;
			$scope.showUploadSuccess = true;
			if (returnObj.risks) {
				var risks = returnObj.risks;
				var totalCount = risks.length;
				if ($scope.survey && $scope.survey.risks) {
					totalCount = risks.length + $scope.survey.risks.length;
				}
				if (totalCount > 20) {
					$scope.showUploadError = true;
					$scope.showUploadSuccess = false;
					$scope.uploadErrorMessage = "Cannot add more than 20 risks";
				} else {

					risks.forEach(function(risk) {
						isDuplicate = false;
						delete risk['velocityValue'];
						for (var index = $scope.survey.risks.length - 1; index >= 0; index--) {
							if (!$scope.survey.risks[index].name && !$scope.survey.risks.desc ) {
								$scope.survey.risks.splice(index, 1);
							}
							if ($scope.survey.risks[index] && $scope.survey.risks[index].name == risk.name) {
								isDuplicate = true;
							}
						}

						if (!isDuplicate) {
							$scope.survey.risks.push(
									{
										name : risk.name,
										desc : risk.description
									}
							);
						} else {
							if(!$scope.showUploadError) {
								$scope.uploadErrorMessage = "The following risk/s already exists.";
							}		
							$scope.showUploadSuccess = false;
							$scope.showUploadError = true;
							$scope.uploadErrorMessage += "\n" + risk.name;
						}
					});
					if($scope.showUploadError)
						$scope.uploadErrorMessage += "\nPlease check data and re-upload.";
				}
			} else {
				$scope.showUploadError = true;
				$scope.showUploadSuccess = false;
				$scope.uploadErrorMessage = returnObj.err;
				$scope.uploadfileObj = "";
			}
			if($scope.showUploadSuccess) {
				$scope.uploadSuccessMessage ="Risks uploaded successfully";
			}
		});
	};

	$('body').on('change','#file input[type="file"]', function () {  	
		var o = this.value || 'No file selected.';
		var filename = o.replace(/^.*[\\\/]/, '')
		$(this).closest('#file').find('#text').text(filename);


	});

	$scope.participantEmailUpload = function() {
		$scope.showErrorMessage = false;
		$scope.mailSendSuccessfully = false;
		var modalInstance = $uibModal.open({
			animation : true,
			templateUrl : 'participantsEmailUpload.html',
			controller : 'participantEmailUploadController',
			backdrop : 'static',
			keyboard : false,
			resolve : {
				engagement : function() {
					return $scope.selectedEngagement;
				}
			}
		});
		modalInstance.result.then(function(returnObj) {
			if (returnObj.emails) {
				$scope.userForm.$dirty = true;
				var emails = returnObj.emails;
				$scope.showUploadError = false;
				minRiskAlert.addClass('ng-hide');
				$scope.showMinRiskError = false;
				$scope.showUploadSuccess = true;
				$scope.participantEmails=[];
				emails.forEach(function(p) {
					isDuplicate = false;
					for (var index = $scope.participantEmails.length - 1; index >= 0; index--) {
						if (!$scope.participantEmails[index].name && !$scope.participantEmails[index].lname && !$scope.participantEmails[index].emailId ) {
							$scope.participantEmails.splice(index, 1);
						}
						if ($scope.participantEmails[index] && $scope.participantEmails[index].emailId.toLowerCase() == p.emailId.toLowerCase()) {
							isDuplicate = true;
						}
					}
					if (!isDuplicate) {
						$scope.participantEmails.push({
							emailId : p.emailId,
							name : p.name,
							lname:p.lname
						});
					} else {
						$scope.showUploadSuccess = false;
						$scope.showUploadError = true;
						$scope.uploadErrorMessage = "Email should be unique";
					}
				});
			} else {
				$scope.showUploadError = true;
				$scope.showUploadSuccess = false;
				$scope.uploadErrorMessage = returnObj.err;
				$scope.uploadfileObj = "";
			}
			if($scope.showUploadSuccess) {
				$scope.uploadSuccessMessage ="Participant emails are uploaded successfully.";
			}
		});
	};

	$scope.changedValue = function(item) {

		if(item == "") {
			$scope.survey = {
					country : "",
					region : "",
					industry : "",
					businessUnit : "",
					riskListSignedOff : "",
					noOfRespondent : "",
					risks : [ {
						name : "",
						desc : "",
						editMode : "true"
					} ],
					severity : [ "Very Low", "Low", "Medium", "High", "Very High" ],
					likelihood : [ "Very Low", "Low", "Medium", "High", "Very High" ],
					velocity : [ "Immediately", "6 Months", "12 Months","24 Months","> 48 Months" ],
					published : false,
					closed : false,
					participants : [ {
						name : "",
						lName : "",
						emailId : "",
						editMode : true
					} ]
			};
		}
		if (item) {
			apiServices.getEngagementsById(item).success(function(data) {
				$scope.selectedEngagement = data['engagement'];
				apiServices.updateSelectedEngagement($scope.selectedEngagement,data);
				// Creating survey from existing engagement survey
				$scope.survey = {
						country : $scope.selectedEngagement.survey.country,
						region : $scope.selectedEngagement.survey.region,
						industry : $scope.selectedEngagement.survey.industry,
						businessUnit : $scope.selectedEngagement.survey.businessUnit,
						riskListSignedOff : $scope.selectedEngagement.survey.riskListSignedOff,
						noOfRespondent : $scope.selectedEngagement.survey.noOfRespondent,
						risks : [],
						severity : [
						            $scope.selectedEngagement.survey.severity[0],
						            $scope.selectedEngagement.survey.severity[1],
						            $scope.selectedEngagement.survey.severity[2],
						            $scope.selectedEngagement.survey.severity[3],
						            $scope.selectedEngagement.survey.severity[4] ],
						            likelihood : [
						                          $scope.selectedEngagement.survey.likelihood[0],
						                          $scope.selectedEngagement.survey.likelihood[1],
						                          $scope.selectedEngagement.survey.likelihood[2],
						                          $scope.selectedEngagement.survey.likelihood[3],
						                          $scope.selectedEngagement.survey.likelihood[4] ],
						                          velocity : [
						                                      $scope.selectedEngagement.survey.velocity[0],
						                                      $scope.selectedEngagement.survey.velocity[1],
						                                      $scope.selectedEngagement.survey.velocity[2],
						                                      $scope.selectedEngagement.survey.velocity[3],
						                                      $scope.selectedEngagement.survey.velocity[4] ],
						                                      published : false,
						                                      closed : false
				};

				// Creating empty risks for survey
				for (var index = 0; index < $scope.selectedEngagement.survey.risks.length; index++) {
					$scope.survey.risks[index] = {};
					$scope.survey.risks[index].name = $scope.selectedEngagement.survey.risks[index].name;
					$scope.survey.risks[index].desc = $scope.selectedEngagement.survey.risks[index].desc;
					$scope.survey.risks[index].editMode = "true";
				}

			})
			.error(function(d, s, h, c) {
				apiServices.handleError(d, s, h, c);
			});
			window.scrollTo(1, 1);
		}
	}
}])
.controller('confirmationSendDraftSurveyController', ["$scope", "$http", "$uibModalInstance", "$routeParams", "api-services", "sweet", "$location",
                                    
                                                      function($scope, $http, $uibModalInstance, $routeParams, apiServices, sweet, $location , engagement) {

	$scope.selectedEngagement = apiServices.getObject("selectedEngagement");
	$scope.participantEmails = apiServices.getObject("participantEmails");
	
	
    $scope.modalTitle ="Send Draft Survey";
    $scope.closeSendDraftPopup = function() {
        $uibModalInstance.dismiss('cancel');
    };
    
    $scope.sendEmail = function() {
    	$uibModalInstance.close(true);
    }
    
}])

.controller('riskUploadPopupController', ["$scope", "$http", "$uibModalInstance", "$routeParams", "api-services", "sweet", "$location",
                                          function($scope, $http, $uibModalInstance, $routeParams, apiServices, sweet, $location) {
	$scope.closeRiskUploadPopup = function() {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.uploadRiskObj = function(element) {
		$scope.$apply(function(scope) {
			$scope.riskFile = element.files[0];
		});
	};

	$scope.finaluploadRisks = function() {
		if ($scope.riskFile != null) {
			var file = $scope.riskFile;
			if (file) {
				var uploadUrl = "../api/dra/engagementManager/upload/risks";
				var obj = {};
				apiServices.uploadFileToUrl(file,uploadUrl)
				.success(
						function(risks) {
							obj.risks = risks;
							$uibModalInstance.close(obj);
							$scope.uploadfileObj = "";
						})
				.error(function(err) {
					if(!err){
					obj.err = "Please upload a file in the required format. Download the template for Bulk Risks Upload by clicking Download Template link.";
					}else {
						obj.err = err;
					}
					
					$uibModalInstance.close(obj);
					$scope.uploadfileObj = "";
				});
			}
		} else {
			$scope.showUploadError = true;
			$scope.uploadErrorMessage = true;
			$scope.uploadErrorMessage = "Please select file with unique risks to upload. ";
		}
	};
} ])

.controller( 'participantEmailUploadController', [ "$scope", "$http", "$uibModalInstance", "$routeParams", "api-services", "sweet", "$location", function($scope, $http, $uibModalInstance, $routeParams, apiServices, sweet, $location) {
	$scope.uploadfileObj = null;
	$scope.isUploading = false;
	$scope.closeParticipantEmaiUploadPopup = function() {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.uploadParticipantEmail = function(element) {
		$scope.$apply(function(scope) {
			$scope.participantFile = element.files[0];
		});
	};

	
	
	$scope.finaluploadParticipantEmail = function() {
		$scope.isUploading = true;
		var file = $scope.participantFile;
		if (file) {
			var uploadUrl = "../api/dra/engagementManager/upload/emails";
			var obj = {};
			apiServices.uploadFileToUrl(file, uploadUrl).success(function(emails) {
				obj.emails = emails;
				$uibModalInstance.close(obj);
				$scope.uploadfileObj = "";
			}).error(function(err) {
				obj.err = err;
				$uibModalInstance.close(obj);
				$scope.uploadfileObj = "";
			});
		}
	};
} ])

.controller('publishSurveyConfirmModalController',['$scope','$uibModalInstance', '$location', 'api-services', function($scope, $uibModalInstance, $location,apiServices) {
		$scope.engagement = apiServices.getObject("selectedEngagement");
		$scope.modalTitle = "Publish Survey";
		$scope.errorMessage = null;
		$scope.publishSurvey = function() {
			$scope.engagement = apiServices.getObject("selectedEngagement");
			$scope.errorMessage = null;
			$scope.isSaveAction = true;
			var sso = {};
			if ($scope.engagement.survey == null) {
				$scope.engagement.survey = {};
				return;
			}
			$scope.engagement.survey.published = 1;
			$scope.engagement.survey.riskListSignedOff = 1;
			$scope.engagement.survey.participants = [];
			//apiServices.storeObject("selectedEngagement", $scope.engagement);
			sso['orgid'] = $scope.engagement.clientId;
			sso['risks'] = $scope.engagement.survey.risks;
			sso['survey'] = $scope.engagement.survey;
			delete sso.survey.participants;
			delete sso.survey.risks;
			apiServices.saveSurvey($scope.engagement.taskId,sso)
				.success(function(data, status, headers,config) {
					$location.path("/sendSurvey");
					$uibModalInstance.dismiss('cancel');
				})
				.error(function(data, status, headers,config) {
					if (data.errorMessage != null) {
						$scope.errorMessage = data.errorMessage;
						window.scrollTo(1, 1);
					} else {
						apiServices.handleError(data,status,headers,config);
					}
				});
		}
		// close publish survey popup
		$scope.closePublishSurveyPopup = function() {
			$uibModalInstance.dismiss('cancel');
		};
} ])

		.directive(
				'showErrors',
				function() {
					return {
						restrict : 'A',
						require : '^form',
						link : function(scope, el, attrs, formCtrl) {
							// find the text box element, which has the 'name' attribute
							var inputEl = el[0].querySelector("[name]");
							// convert the native text box element to an angular element
							var inputNgEl = angular.element(inputEl);
							// get the name on the text box
							var inputName = inputNgEl.attr('name');

							// only apply the has-error class after the user leaves the text box
							inputNgEl.bind('blur', function() {
								el.toggleClass('has-error',
										formCtrl[inputName].$invalid);
							});

							scope.$watch(function() {
								return scope.showErrorsCheckValidity;
							}, function(newVal, oldVal) {
								if (!newVal) {
									return;
								}
								if(formCtrl[inputName]) {
									el.toggleClass('has-error',
											formCtrl[inputName].$invalid);
								}
							});
						}
					}
				})

		.directive(
				'confirmOnExit',
				function() {
					return {
						link : function($scope, elem, attrs) {
							$scope
									.$on(
											'$locationChangeStart',
											function(event, next, current) {
												if (!$scope.isSaveAction
														&& $scope[attrs["name"]].$dirty) {
													if (!confirm("There are unsaved changes in the page, do you want to proceed?")) {
														event.preventDefault();
													}
												}
											});
						}
					};
				});


