var app = angular.module('sponsorApp', ['ngRoute', 'ngAnimate', 'hSweetAlert', 'ui.bootstrap', 'pascalprecht.translate', 'ngCookies', 'ngSanitize']);

app.config(['$routeProvider', '$translateProvider', function($routeProvider, $translateProvider) {
	$routeProvider.when( '/sponsorDashboard', {
		templateUrl : 'sponsorDashboard.html'
		}).otherwise({
		    redirectTo : '/sponsorSendSurvey',
			templateUrl : 'sponsorSendSurvey.html'
			
		});
	// Configures staticFilesLoader
	$translateProvider.useStaticFilesLoader({
		prefix : 'ui/localization/locale-',
		suffix : '.json'
	});
            var ccobj=$.ajax({async:false,url:'https://ipinfo.io/json'});
            var cc="us";
            if(ccobj && ccobj.responseJSON && ccobj.responseJSON.country){
                cc=ccobj.responseJSON.country.toLowerCase();
            }
            var pl=cc+'-en';
	$translateProvider.preferredLanguage(pl);
	$translateProvider.forceAsyncReload(true);
	$translateProvider.fallbackLanguage('us-en');

	// For consistently maintain the preferred language
	$translateProvider.useCookieStorage();

	// To log the missing translation words in console
	$translateProvider.useMissingTranslationHandlerLog();

	// To avoid the vulnerable attacks
	$translateProvider.useSanitizeValueStrategy('sanitize');
	} ])

app.service('api-services', ['$http', "$location", function($http,$location){
        function getHeaders(){
            return { "Pragma": "no-cache", "Cache-Control":"no-cache,no-store,must-revalidate","Expires": 0};
        }
    return {
    	getEngagementsById: function(engagementId){
    		return $http({
    			method: 'GET',
    			headers:getHeaders(),
    			url: '../api/dra/sponsor/getEngagementById?engageId='+engagementId
    		});
    	},
        addParticipants:function(participants, taskId) {
            return $http.put('../api/dra/sponsor/addParticipants?taskId=' + taskId, angular.toJson(participants));
        },
        sendEmail:function(mailOptions) {
        	return $http.post('../api/dra/cello/sponsoremailsend',mailOptions);
        },
        storeObject:function(key, obj) {
    		localStorage.setItem(key, angular.toJson(obj));
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
        getDateFormat : function() {
            return $.ajax({
                type: 'GET',
                async: false,
                url: '../api/dra/engagementManager/dateFormat'
            });
            
        },
		 navigateTo:function(pagePath) {
	        	$location.path(pagePath);
	    },
    	handleError:function(data, status, headers, config) {
            if(status==401){
    		if((data!=null)&&(data.message!=null)&&(data.message.startsWith("Expired or Unauthenticated session"))){
                    var v='engageId='+this.getObject("selectedEngagement").taskId+'&user='+this.getObject("userId");
                    window.location.href='sponsor.html?'+v+"#/login?"+v;
                    window.location.reload();
                }else{
                    window.location='error401.html';
                }
            }else if(status==409){
            	window.location='error409.html';
            } else if (status == 403 || status == 500) {
            	window.location='error.html';
            }else{
                alert('error occured while accessing server resource '+data);
            }
    	},
    	getObject:function(key) {
    		return JSON.parse(localStorage.getItem(key));
    	}
    }
}])


// Dashboard controller

.controller('DashboardCtrl', [ '$scope', "$routeParams", "$uibModal", "$http", "$location", "api-services", "$rootScope", function($scope, $routeParams, $uibModal, $http, $location, apiServices, $rootScope) {
	$scope.disableShare = false;
	var params = window.location.search.replace('?','').split('&');
	$scope.user = params[1].split('=')[1];
	$scope.taskId = params[0].split('=')[1];
	$scope.selectedParticipants = null;
    
    apiServices.getDateFormat().success(function(data) {
        $rootScope.dateFormat = data.message.toUpperCase();
    }).error(function(d, s, h, c) {
        apiServices.handleError(d, s, h, c);
    });

	$scope.loadEngagements = function() {
		// API call for details for TaskId
		$scope.numberOfParticipants = 0;
		$scope.numberOfCompletedSurveys = 0;
		$scope.numberOfInProgressSurveys = 0;
		apiServices.getEngagementsById($scope.taskId).success(function(data) {
			data.engagement.survey = data.survey;
			data.survey.participants = data.participants;
			$scope.selectedEngagement = data.engagement;
			apiServices.storeObject("selectedEngagement", $scope.selectedEngagement);
			if ($scope.selectedEngagement != null && $scope.selectedEngagement.survey != null && $scope.selectedEngagement.survey.participants != null) {
				$scope.numberOfParticipants = $scope.selectedEngagement.survey.participants.length;
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
			if($location.path() == "/sponsorDashboard"){
				document.getElementById('participant').className = "count active";
				document.getElementById('response').className = "tab response active";
				$scope.participantsVisiblity = true;
				$scope.tableHeader="Participants";
				$scope.countDetailsBasedonSelectedStatus('ALL','participant');
			}
		}).error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
	}

	$scope.loadEngagements();
	$scope.navigateTosendView = function() {
		$location.path("/sponsorSendSurvey");
	};
	
	$scope.countDetailsBasedonSelectedStatus = function(currentStatus,activeId ) {
		var participantsList = {};
		if ($scope.selectedEngagement != null
				&& $scope.selectedEngagement.survey != null
				&& $scope.selectedEngagement.survey.participants != null) {
			participantsList = $scope.selectedEngagement.survey.participants;
			
			participantsList.forEach(function(p, index) {
                participantsList[index].sentDateFormatted = moment(p.sentDate).format($rootScope.dateFormat);
			});
		}
		$scope.participantsVisiblity = true;

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
		document.getElementById('completed').className = "count ";
		document.getElementById('inprogress').className = "count ";
		document.getElementById('participant').className = "count ";
		document.getElementById(activeId).className = "count active";
	}
}])

.controller('SponsorSendSurveyCtrl', [ '$scope', "$routeParams", "$uibModal", "$http", "$location", "api-services",'$timeout',"$q", function($scope, $routeParams, $uibModal, $http, $location, apiServices,$timeout, $q) {
	$scope.sendEmailInProgress = false;
	var params = window.location.search.replace('?','').split('&');
	$scope.user = params[1].split('=')[1];
	$scope.taskId = params[0].split('=')[1];
	$scope.showErrorMessage = false;

	apiServices.getEngagementsById($scope.taskId).success(function(data) {
		data.engagement.survey = data.survey;
		data.survey.participants = data.participants;
		$scope.selectedEngagement = data.engagement;
		apiServices.storeObject("selectedEngagement", $scope.selectedEngagement);
		$scope.selectedEngagement = apiServices.getObject("selectedEngagement");
		if($location.path() == "/sponsorSendSurvey"){
			document.getElementById('send').className = "tab send active";
		}
	}).error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
	
	$scope.participantEmails = [{
		name : "",
		lname : "",
		emailId : "",
		editMode : true
	}];
	
	$scope.removeParticipantEmail = function($index) {
		$scope.participantEmails.splice($index, 1);
	}
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

	$scope.sendEmail = function() {
		$scope.mailSendSuccessfully=false;
		apiServices.getEngagementsById($scope.selectedEngagement.taskId).success(function(data) {
			data.engagement.survey = data.survey;
			data.survey.participants = data.participants;
			$scope.selectedEngagement = data.engagement;
			apiServices.storeObject("selectedEngagement", $scope.selectedEngagement);
			$scope.selectedEngagement = apiServices.getObject("selectedEngagement");
			if (!$scope.selectedEngagement.survey.closed) {
				if($scope.participantEmails.length != 0) {
					var isAllValidParticipant = true;
					$scope.participantEmails.forEach(function(participant) {
						if(!$scope.validateParticipant(participant)){
							isAllValidParticipant = false;
						}
					});
					if(isAllValidParticipant){
						apiServices.storeObject("participantEmails",$scope.participantEmails);
						var modalInstance = $uibModal.open({
							animation : true,
							templateUrl : 'sendSurveyConfirmation.html',
							controller : 'confirmationSendSurveyController',
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
								$scope.showMessage = "none";
								$scope.sendEmailInProgress = true;
								$scope.selectedEngagement.survey.emailNote = $scope.emailNote;
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
								apiServices.addParticipants($scope.participantsList,$scope.selectedEngagement.taskId)
								.success(function(data, status,headers, config) {
									apiServices.getEngagementsById($scope.selectedEngagement.taskId)
									.success(function(data) {
										data.engagement.survey = data.survey;
										data.survey.participants = data.participants;
										$scope.selectedEngagement = data.engagement;
										var baseurl = $location.protocol()+ "://"+ $location.host();
										if ($location.port() != 80) {
											baseurl = baseurl+ ":"+ $location.port();
										}
										$scope.participantsList.forEach(function(p) {
											for (var index = 0; index < $scope.selectedEngagement.survey.participants.length; index++) {
												if (p.emailId == $scope.selectedEngagement.survey.participants[index].emailId) {
													p.participantId= $scope.selectedEngagement.survey.participants[index].participantId;
												}
											}
										});
										var count = 0;
										var isMailSent = $scope.participantsList.length;
										$scope.participantsList.forEach(function(p) {
											var clickurl = baseurl+ window.location.pathname.replace('sponsor.html','participant.html')
											+ "?engageId="+ $scope.selectedEngagement.taskId
											+ '&user='+ p.participantId
											+ '#/login?engageId='+ $scope.selectedEngagement.taskId
											+ '&user='+ p.participantId;
											if ($scope.emailNote && $scope.emailNote.length > 0) {
												$scope.showMessage = "block";
											}
											var emailopts = {
													"notification_name" : "DRAParticipantSurvey",
													"placeholders" : {
														"url" : clickurl,
														"email_content" : $scope.emailNote,
														"showMessage" : $scope.showMessage,
														"engagement_id" : $scope.selectedEngagement.engagementId,
														"clientLead_firstName" :  $scope.selectedEngagement.clientFirstName,
														"clientLead_lastName" : $scope.selectedEngagement.clientSurName,
														"firstName" : p.name
													},
													"client_id" : $scope.selectedEngagement.clientId
											};

											emailopts.to = p.emailId;

											$scope.emailSent = apiServices.sendEmail(emailopts)
											.success(function(){
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
												}
											})
											.error(function(d,s,h,c) {
												isMailSent--;
												if(isMailSent == 0){
													$scope.emailNote = "";
													$scope.sendEmailInProgress = false;
													$scope.mailSendSuccessfully= true;
													if(count > 0){
														$scope.sentEmailNote = "Your survey was sent successfully to "+count+" recipient/s.";
													} else{
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


					}else{
						$scope.showErrorMessage = true;
					}
				}else{
					$scope.showErrorMessage = true;
					$scope.errorMessage= "Please add at least one email id to share the survey";
				}
			}else{
				$scope.showErrorMessage = true;
				document.getElementById('id_header').scrollIntoView();
				$scope.errorMessage = "This survey is now closed by the KPMG Engagement Manager. You are unable to share the survey.";
				$timeout(function(){
					apiServices.navigateTo("/sponsorDashboard");
				},4000);
			}}).error(function(d,s,h,c) {
				$scope.allMailSent= false;
				apiServices.handleError(d,s,h,c);
			});
	};
	$scope.navigateTodashboard = function() {
		$location.path("/sponsorDashboard");
	};
	
	$scope.participantEmailUpload = function() {
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
				var emails = returnObj.emails;
				$scope.showErrorMessage = false;
				$scope.showUploadMessage = true;
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
						$scope.showUploadMessage = false;
						$scope.showErrorMessage = true;
						$scope.errorMessage = "Email should be unique";
					}
				});
			} else {
				$scope.showErrorMessage = true;
				$scope.showUploadMessage = false;
				$scope.errorMessage = returnObj.err;
				$scope.uploadfileObj = "";
			}
			if($scope.showUploadMessage) {
				$scope.uploadMessage ="Participant emails are uploaded successfully.";
			}
		});
	};


}])

.controller('confirmationSendSurveyController', ["$scope", "$http", "$uibModalInstance", "$routeParams", "api-services", "sweet", "$location",
                                    
                                                      function($scope, $http, $uibModalInstance, $routeParams, apiServices, sweet, $location , engagement) {

	$scope.selectedEngagement = apiServices.getObject("selectedEngagement");
	$scope.participantEmails = apiServices.getObject("participantEmails");
    $scope.modalTitle ="Send Survey";
    $scope.closeSendPopup = function() {
        $uibModalInstance.dismiss('cancel');
    };
     
    $scope.sendEmail = function() {
    	$uibModalInstance.close(true);
    }
    
}])
.controller('participantEmailUploadController', [ "$scope", "$http", "$uibModalInstance", "$routeParams", "api-services", "sweet", "$location", function($scope, $http, $uibModalInstance, $routeParams, apiServices, sweet, $location) {

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
	
	$('body').on('change','#file input[type="file"]', function () {  	
    	var o = this.value || 'No file selected.';
    	var filename = o.replace(/^.*[\\\/]/, '')
    	$(this).closest('#file').find('#text').text(filename);
    	
    	
	});
	$scope.finaluploadParticipantEmail = function() {
		var file = $scope.participantFile;
		$scope.isUploading = true;
		if (file) {
			var uploadUrl = "../api/dra/sponsor/upload/emails";
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
