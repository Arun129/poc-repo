var app = angular.module('participantApp', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'rzModule','pascalprecht.translate', 'ngCookies', 'ngSanitize']);

app.config(['$routeProvider','$translateProvider', function($routeProvider, $translateProvider) {
	$routeProvider.when('/login', {
		templateUrl: 'participant/contents/surveyLogin.html'
    })
    .when('/login/:home', {
		templateUrl: 'participant/contents/surveyLogin.html'
    })
    .when('/riskMap', {
    	templateUrl: 'participant/contents/riskMap.html'
    })
    .when('/seveVsLike', {
    	templateUrl: 'participant/contents/seveVsLike.html'
    })
    .when('/velocity', {
    	templateUrl: 'participant/contents/velocity.html'
    })
    .when('/feedback', {
    	templateUrl: 'participant/contents/feedback.html'
    })
    .when('/error', {
    	templateUrl: 'participant/contents/error.html'
    })
    .when('/complete', {
    	templateUrl: 'participant/contents/complete.html'
    })
    .when('/sessionExpired', {
    	templateUrl: 'participant/contents/sessionExpired.html'
    })
    .otherwise({
    	templateUrl: 'participant/contents/surveyLogin.html'
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
	
}])

.service('api-services', ['$http', "$location", "$log","$window", function($http, $location, $log, $window){
	function getHeaders(){
		return { "Pragma": "no-cache", "Cache-Control":"no-cache,no-store,must-revalidate","Expires": 0};
	}
	return {
                convertBooleanToInt:function(bean,prop){
                    bean[prop]=bean[prop]?1:0;
                },
                convertIntToBoolean:function(bean,prop,val){
                    bean[prop]=val==1;
                },
		updateParticipant:function(id,participant) {
                    this.convertBooleanToInt(participant,'acceptTerms');
			return $http.post('../api/dra/participant/saveParticipant?engageId='+id, angular.toJson(participant));
		},
		getEngagementById:function(engageId) {
			return $http({
				method: 'GET',
				headers:getHeaders(),
				url: '../api/dra/participant/getEngagementById?engageId=' + engageId
			});
		},
		getVelocityRating:function(taskId, participantId, clientOrgId, participantEmail) {
			return $http({
				method: 'GET',
				headers:getHeaders(),
				url: '../api/dra/participant/getVelocityRating?engagementURN=' + taskId + '&participantId=' + participantId + '&clientOrgId=' + clientOrgId + '&participantEmail=' + participantEmail
            });
		},
                updateSelectedEngagement:function(scope,data){
                    scope.engagement=data['engagement'];
                    var selectedEngagement=scope.engagement;
                    
                        if (data['survey'] != null) {
                            selectedEngagement['survey'] = data['survey'];
                            if (data['participant'] != null) {
                                selectedEngagement.survey['participant'] = data['participant'];
                                selectedEngagement.survey.participant['id']=selectedEngagement.survey.participant.participantId;
                                scope.participantId=selectedEngagement.survey.participant['id'];
                                scope.participantEmail=selectedEngagement.survey.participant['emailId'];
                            }
                            if (data['risks']) {
                                selectedEngagement.survey.participant['risks'] = data['risks'];
                                selectedEngagement.survey.participant.risks.forEach(function(r) {
                                    r.desc = r.description;
                                    r.isConnected=r.isConnected==1;
                                    r.isPlotted=r.isPlotted==1;
                                    r.isRated=r.isRated==1;
//                                    delete r['isconnected'];
//                                    delete r['isplotted'];
//                                    delete r['israted'];
                                });
                                this.storeObject("riskStatuses",selectedEngagement.survey.participant.risks);
                            }
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
                        }
                        
                    },
		riskConnected : function(riskid, participantId) {
			return $http.put('../api/dra/participant/riskupdate?riskid=' + riskid +
                                '&field=connect&val=1&participantId=' + participantId);
		},
		riskRated : function(riskid, participantId) {
			return $http.put('../api/dra/participant/riskupdate?riskid=' + riskid +
                                '&field=rate&val=1&participantId=' + participantId);
		},
		riskPlotted : function(riskid, participantId) {
			return $http.put('../api/dra/participant/riskupdate?riskid=' + riskid +
                                '&field=plot&val=1&participantId=' + participantId);
		},
		riskNotConnected : function(riskid, participantId) {
			return $http.put('../api/dra/participant/riskupdate?riskid=' + riskid +
                                '&field=connect&val=0&participantId=' + participantId);
		},
		riskNotRated : function(riskid, participantId) {
			return $http.put('../api/dra/participant/riskupdate?riskid=' + riskid +
                                '&field=rate&val=0&participantId=' + participantId);
		},
		riskNotPlotted : function(riskid, participantId) {
			return $http.put('../api/dra/participant/riskupdate?riskid=' + riskid +
                                '&field=plot&val=0&participantId=' + participantId);
		},
		saveVelocityRating:function(velocityRating) {
			return $http.put('../api/dra/participant/saveVelocityRating', angular.toJson(velocityRating));
		},
        ajaxSaveVelocityRating: function(velocityRating) {
            return $.ajax({
                type: 'put',
                async: false,
                url: '../api/dra/participant/saveVelocityRating',
                contentType: 'application/json',
                data : angular.toJson(velocityRating)
            });
        },
        saveVelocityRatingAndExit:function(velocityRating) {
            return $http.put('../api/dra/participant/saveVelocityRatingAndExit', angular.toJson(velocityRating));
        },
        saveGraphAndExit:function(queryString, data) {
            return $http.put('../api/dra/participant/saveGraphAndExit'+queryString, data);
            
        },
        saveGraph:function(queryString, data) {
            return $http.put('../api/dra/participant/userModel'+queryString, data);
        },
        ajaxSaveGraph:function(queryString, data) {
            //return $http.put('../api/dra/participant/userModel'+queryString, data, false);
            return $.ajax({
                type: 'put',
                async: false,
                url: '../api/dra/participant/userModel'+queryString,
                contentType: 'application/json',
                data : data
            });
        },
        storeObject:function(key, obj) {
            localStorage.setItem(key, angular.toJson(obj));
        },
        getObject:function(key) {
            return JSON.parse(localStorage.getItem(key));
        },
        sendEmail:function(mailOptions){
        	return $http.post('../api/dra/cello/participantEmailSend',mailOptions);
        },
        converToPdf: function(viewRiskId){
        	html2canvas(viewRiskId, {
                onrendered: function (canvas) {
                    var data = canvas.toDataURL("image/jpeg");
                    var doc ;
                    if(canvas.height < canvas.width){
                        doc = new jsPDF("l","pt",[canvas.width,canvas.height]);
                    } else{
                    	doc = new jsPDF("p","pt",[canvas.height,canvas.width]);
                    }
                    doc.setProperties({
                    	title: 'Risk Details',
                    });
                    doc.addImage(data, 'JPEG', 0, 0, canvas.width, canvas.height);
                    var blob = doc.output("blob");
                    if (navigator.appVersion.toString().indexOf('.NET') > 0){
                    	var myWindow = window.open();
                        var doc = myWindow.document;
                        doc.open();
                        doc.write( "<link rel=\"stylesheet\" href=\"ui/css/style.css\" type=\"text/css\" />" );
                        doc.write( "<link rel=\"stylesheet\" href=\"ui/css/bootstrap.min.css\" type=\"text/css\" />" );
                        doc.write( "<link rel=\"stylesheet\" href=\"ui/css/fonts.css\" type=\"text/css\" />" );
                        doc.write( "<link rel=\"stylesheet\" href=\"ui/css/font-awesome.min.css\" type=\"text/css\" />" );
                        doc.write( "<title>Risk Details</title>" );
                        doc.write(viewRiskId.outerHTML);
                        doc.close();
                	} else{
                        window.open(URL.createObjectURL(blob));
                	}
                }
            });
        },
        handleError:function(data, status, headers, config) {
            if(status==401){
                if((data!=null)&&(data.message!=null)&&(data.message.startsWith("Expired or Unauthenticated session"))){
                    var v='engageId='+this.getObject("selectedEngagement").taskId+'&user='+this.getObject("userId");
                    window.location.href='participant.html?'+v+"#/login?"+v;
                    window.location.reload();
                }else{
                  window.location='error401.html';
                }
            }else if(status==409){
                  window.location='error409.html';
            } else if (status == 403 || status == 500) {
                  window.location='error.html';
            }else if(status == 400){
            	$window.onbeforeunload = undefined;
            	window.location='../invalidUser.html';
            	window.location.reload();
            }else{
                $log.warn('error occured while accessing server resource '+data);
            }
        },
        /*getFeedbackFromEngagement:function(engagement, email) {
            if (engagement != null && engagement.survey!= null && engagement.survey.participants != null) {
                  for (var count =0; count<engagement.survey.participants.length; count++) {
                        if (engagement.survey.participants[count].emailId == email) {
                              return engagement.survey.participants[count].feedback;
                        }
                  }
            }
            return null;
        },*/
        loadSliderPart:function() {
//                  var n = $(".risk_steps .img_container_parent .img_container" ).length; 
//                  var setwidth = 100/n;
//                  $(".img_container").css("width", setwidth + "%");
//                  var rightposi= $(".container.riskasses").width();  
//                  var reducewdth = rightposi - 30; 
//                  $(".risk_process").css("right", -reducewdth + "px");
//                  $(".open").click(function(){
//                        $(".risk_process").toggleClass("animateslider");
//                  });
//              
//                var highestBox1 = 0;
//                $(' .content_section').each(function(){  
//                        if($(this).height() > highestBox1){  
//                        highestBox1 = $(this).height();  
//                }
//            });  
//                  $('.content_section').height(highestBox1);  
        },          
        navigateTo:function(pagePath) {
        	$location.path(pagePath);
        },
        getParticipantPage : function(participantId){
			return $http({
				method: 'GET',
				headers:getHeaders(),
				url: '../api/dra/participant/getParticipantPage?participantId=' + participantId
			});
        }
	}
}])

.controller('participantHeaderCtrl', ['$scope', "$location", '$window',"api-services", function(scope, location, $window, apiServices){
	scope.taskId = location.search().engageId;
	scope.returnToHome = function() {
		return location.absUrl().replace(/velocity|riskMap|seveVsLike/gi,'login/home');
	}
	 apiServices.getEngagementById(scope.taskId).success(function(data) {
         apiServices.updateSelectedEngagement(scope,data);
         apiServices.storeObject("selectedEngagement", scope.engagement);
	 }).error(function(d,s,h,c){
		  apiServices.handleError(d,s,h,c);
	  });
	 
	 scope.participantExit = function (){
		window.close();
	 }
}])

// Survey Login controller
.controller('surveyLoginCtrl', [ '$scope', "$routeParams", "$uibModal", "$http", "api-services", "$location","$timeout","$rootScope", function($scope, $routeParams, $uibModal, $http, apiServices, $location, $timeout, $rootScope) {
      $scope.participantName = "";
      $scope.participantLastName = "";
      $scope.participantId = "";
      $scope.participantSurveyId = "";
      $scope.isCollapsed = false;
      $scope.acceptTerms = false;
      $scope.completed = false;
      $scope.closed = false;
      $scope.engagement;
      $scope.email = '';
      $scope.queryParam = $location.search();
      $scope.user = $scope.queryParam.user;
      $scope.taskId = $scope.queryParam.engageId;
      $scope.clntName = '';
      if($rootScope.feedbackCompleted) {
		    $scope.savingInProgress = true;
		    $scope.savingFeedback = true;
    	    $timeout(function() {
    	    	$scope.savingInProgress = false;
    	    }, 5000);
    	    $timeout(function() {
    	    	$scope.savingFeedback = false;
    	    	$rootScope.feedbackCompleted = false;
    	    }, 7000);
      }
      
      if ($scope.taskId == null || $scope.user == null) {
            $location.path('login');
      } else {
    	  apiServices.getEngagementById($scope.taskId).success(function(data) {
				apiServices.updateSelectedEngagement($scope,data);
				$scope.clntName = $scope.engagement.clientName;
				$scope.email = $scope.engagement.survey.participant.emailId;
				$scope.risks = $scope.engagement.survey.participant.risks;
				$scope.participantName = $scope.engagement.survey.participant.name;
				$scope.participantLastName = $scope.engagement.survey.participant.lname;
				$scope.completed = $scope.engagement.survey.participant.status;
				$scope.participantId = $scope.engagement.survey.participant.participantId;
				$scope.participantSurveyId = $scope.engagement.survey.participant.participantSurveyId;
				$scope.acceptTerms = $scope.engagement.survey.participant.acceptTerms;
				apiServices.storeObject("selectedEngagement",$scope.engagement);
				$scope.closed = $scope.engagement.survey.closed;
				if ($scope.completed == "COMPLETE" || $scope.closed) {
				apiServices.navigateTo("/complete");
				}
				if ($scope.completed == "INPROGRESS" && !$routeParams.home) {
					apiServices.getParticipantPage($scope.participantId)
						.success(function(data) {
							if(data != null && data.length >0){
								$scope.participantPageDetails = data[0];
								if($scope.participantPageDetails.isConnectedAll == 0){
									apiServices.navigateTo("/riskMap");
								}else if($scope.participantPageDetails.isPlottedAll == 0) {
									apiServices.navigateTo("/seveVsLike");
								}else {
									apiServices.navigateTo("/velocity");
								}
							} else{
								apiServices.navigateTo("/riskMap");
							}
						})
						.error(function(d,s,h,c) {
			    			  apiServices.handleError(d,s,h,c);
			    		});
				}
				if($routeParams.home){
					$scope.acceptedTerm = true;
					document.getElementById("terms").checked = true;
				}
    		 }).error(function(d,s,h,c){
    			  apiServices.handleError(d,s,h,c);
    		  });
      }
      
      $scope.termsAccepted = function() {
    	// Validation for Name field
          $scope.showReqFieldError = false;
          $scope.showReqFieldForSurNameError = false;
          apiServices.storeObject("participantName", $scope.participantName);

          $scope.showErrorsCheckValidity = true;
          $scope.engagement = $scope.engagement;

          // Update the status of survey into InProgress
          var parti={
                    emailId:$scope.email,
                    name:$scope.participantName,
                    lname:$scope.participantLastName,
                    participantId:$scope.participantId,
                    participantSurveyId:$scope.participantSurveyId,
                    status:"INPROGRESS",
                    acceptTerms :true
                };
       
          apiServices.updateParticipant($scope.engagement.taskId,parti)
           .success(function(data, status, headers, config) {
        	   
            }).
            error(function(d,s,h,c){
            	apiServices.handleError(d,s,h,c);});
          apiServices.storeObject("selectedEngagement", $scope.engagement);
          apiServices.navigateTo("/riskMap");
      }
      
      $scope.viewRiskDetails = function(){
//    	$scope.engagement = apiServices.getObject("selectedEngagement");
//		$scope.risks = $scope.engagement.survey.participant.risks;
		apiServices.converToPdf(document.getElementById('viewriskdetails'));
      } 
      
      $scope.killSessionNotificationTimer = function (){
 		 if(document.getElementById('LikeVsSeve') != null) {
 				angular.element(document.getElementById('LikeVsSeve')).scope().stopNotificationTimer();
 			}
 			if(document.getElementById('RiskMapCtrlDiv') != null) {	
 				angular.element(document.getElementById('RiskMapCtrlDiv')).scope().stopNotificationTimerRiskMap();
 			}
 			
 			if(document.getElementById('velocityRatingCtrl') != null) {	
 				angular.element(document.getElementById('velocityRatingCtrl')).scope().stopSessionExpiryNotificationTimer();
 			}
 	 	}
      
      $scope.killSessionNotificationTimer();
 	 
      $scope.startContactUs = function(){
    	  $scope.saveInProgress = false;
    	  $scope.sentMessage = false;
    	  $scope.contactUsHide = false;
    	  $scope.showReqFieldContactUsError = false;
    	  $scope.contactUsForm.$setPristine();
    	  $scope.contactUsName = "";
    	  $scope.contactUsEmailId = "";
    	  $scope.contactUsCompanyName = "";
    	  $scope.contactUsPhoneNo = "";
    	  $scope.contactUsComments = "";
    	  $('span.holder').show();
    	  document.getElementById('contactUSName').style.borderColor = "#CCCCCC";
    	  document.getElementById('contactEmail').style.borderColor = "#CCCCCC";
    	  document.getElementById('contactUsCompnyName').style.borderColor = "#CCCCCC";
    	  document.getElementById('contactusphoneNo').style.borderColor = "#CCCCCC";
    	  document.getElementById('contactUsComment').style.borderColor = "#CCCCCC";
      }
	  $scope.contactUsSubmit = function() {
	
	      document.getElementById('contactUSName').style.borderColor = "#CCCCCC";
	      document.getElementById('contactEmail').style.borderColor = "#CCCCCC";
	      document.getElementById('contactUsCompnyName').style.borderColor = "#CCCCCC";
	      document.getElementById('contactusphoneNo').style.borderColor = "#CCCCCC";
	      document.getElementById('contactUsComment').style.borderColor = "#CCCCCC";
	      
	      var namePattern = /^[a-zA-Z\s]*$/;
	      var pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	      var regex = /^\d{10}$/;
	      
	      //all errors
	      $scope.showReqFieldContactUsError = false;
	      $scope.showReqFieldContactUsErrorMessage = "";
	      
	      var errorMessage = "";
 
	      if ($scope.contactUsForm.contactUSName.$error.required) {
	          $scope.showReqFieldContactUsError = true;
	          document.getElementById('contactUSName').style.borderColor = "#a94442";
	          errorMessage = "Whoops! Looks like you forgot to enter a full name.";
	      }
	      if ($scope.contactUsForm.contactEmail.$error.required) {
	          $scope.showReqFieldContactUsError = true;
	          document.getElementById('contactEmail').style.borderColor = "#a94442";
	          errorMessage = "Don't forget to enter an email address.";
	      }
	      if ($scope.contactUsForm.contactUsCompnyName.$error.required) {
	          $scope.showReqFieldContactUsError = true;
	          document.getElementById('contactUsCompnyName').style.borderColor = "#a94442";
	          errorMessage = "Looks like you forgot to enter a company name.";
	      }
	      if ($scope.contactUsForm.contactusphoneNo.$error.required) {
	          $scope.showReqFieldContactUsError = true;
	          document.getElementById('contactusphoneNo').style.borderColor = "#a94442";
	          errorMessage = "Don't forget to fill in your contact number.";
	      }
	      if ($scope.contactUsForm.contactUsComment.$error.required) {
	          $scope.showReqFieldContactUsError = true;
	          document.getElementById('contactUsComment').style.borderColor = "#a94442";
	          errorMessage = "Please don't forget to add your comments which are important to us.";
	      }
	      if ($scope.showReqFieldContactUsError) {
	          // Checking for more than one field is missing
	          if ($scope.contactUsForm.$error.required.length > 1) {
	              $scope.showReqFieldContactUsErrorMessage = "Please ensure you fill all the fields.";
	          } else {
	              $scope.showReqFieldContactUsErrorMessage = errorMessage;
	          }
	      } else {
	          if ($scope.contactUsName != undefined && $scope.contactUsName != null) {
	              if (!namePattern.test($scope.contactUsName)) {
	                  $scope.showReqFieldContactUsError = true;
	                  $scope.showReqFieldContactUsErrorMessage = "Please enter a first name using alphabetical characters.";
	                  document.getElementById('contactUSName').style.borderColor = "#a94442";
	              } else if ($scope.contactUsName.length > 200) {
	                  $scope.showReqFieldContactUsError = true;
	                  $scope.showReqFieldContactUsErrorMessage = "Please enter a first name that does not exceed 200 characters.";
	                  document.getElementById('contactUSName').style.borderColor = "#a94442";
	              }
	          }
	          if (!$scope.showReqFieldContactUsError && $scope.contactUsEmailId != undefined && $scope.contactUsEmailId != null) {
	              if (!pattern.test($scope.contactUsEmailId)) {
	                  $scope.showReqFieldContactUsError = true;
	                  $scope.showReqFieldContactUsErrorMessage = "Please enter an email using a valid email format.";
	                  document.getElementById('contactEmail').style.borderColor = "#a94442";
	              } else if ($scope.contactUsEmailId.length > 500) {
	                  $scope.showReqFieldContactUsError = true;
	                  $scope.showReqFieldContactUsErrorMessage = "Please enter an email address that does not exceed 500 characters.";
	                  document.getElementById('contactEmail').style.borderColor = "#a94442";
	              }
	          }
	          if (!$scope.showReqFieldContactUsError && $scope.contactUsCompanyName != undefined && $scope.contactUsCompanyName != null && $scope.contactUsCompanyName.length > 200) {
	              $scope.showReqFieldContactUsError = true;
	              $scope.showReqFieldContactUsErrorMessage = "Please enter a company name that does not exceed 200 characters.";
	              document.getElementById('contactUsCompnyName').style.borderColor = "#a94442";
	          }
	          if (!$scope.showReqFieldContactUsError && $scope.contactUsPhoneNo != undefined && $scope.contactUsPhoneNo != null && !regex.test($scope.contactUsPhoneNo)) {
 
	              $scope.showReqFieldContactUsError = true;
	              $scope.showReqFieldContactUsErrorMessage = "Please enter a valid contact number using numeric characters only.";
	              document.getElementById('contactusphoneNo').style.borderColor = "#a94442";
	          }
	          if (!$scope.showReqFieldContactUsError) {
	              var emailopts = {
	                  "notification_name": "DRAServiceContactUs",
	                  "placeholders": {
	                      "companyName": $scope.engagement.clientName,
	                      "engagementId": $scope.engagement.engagementId,
	                      "contactUsName": $scope.contactUsName,
	                      "contactUsEmailId": $scope.contactUsEmailId,
	                      "contactUsCompanyName": $scope.contactUsCompanyName,
	                      "contactUsPhoneNo": $scope.contactUsPhoneNo,
	                      "contactUsComments": $scope.contactUsComments
		                },
	              "client_id": $scope.engagement.clientId
                  
	              };
	              $scope.saveInProgress = true;
	              apiServices.sendEmail(emailopts).success(function(data) {
	                  $scope.contactUsHide = true;
	                  $scope.sentMessage = true;
	                  $scope.saveInProgress = false;
	              }).error(function(d, s, h, c) {
	                  apiServices.handleError(d, s, h, c);
	              });
	          }
	      }
	   }
}])

.controller('RiskMapCtrl', [ '$scope', '$http', 'api-services', "$location", "$timeout", "$uibModal", "$window", function($scope, $http, apiServices, $location, $timeout, $uibModal, $window ) {
	var instructionsCollapsed = false;
	var currentJSTaskRunner = null;
	var zoom = null;
//	var svgGraphSaved = false;
	var riskMapZoomSliderVal = apiServices.getObject("RiskMapZoomSliderVal");
	var timer = null;
	var notificationTimerRiskMap = null;
	$scope.remainingRisk  = 0;
	$scope.isCollapsed = false;
	$scope.baseTranslate = null;
	$scope.timerCountMinute = 19;
	$scope.closed = false;
	$scope.operationInProgress = false;
	$scope.saveMessage = false;
	$scope.dirtyCheckRiskMap = false;
//	$scope.engagement = apiServices.getObject("selectedEngagement");
//	$scope.participantId = apiServices.getObject("userId");

	apiServices.loadSliderPart();
	apiServices.getEngagementById($location.search()['engageId']).success(function(data) {
                apiServices.updateSelectedEngagement($scope,data);
		var surveyComplete=$scope.engagement.survey.participant.status;
                $scope.init();
//		$scope.engagement.survey.participants.forEach( function(participant) {
//            if (participant.id == $scope.participantId) {
//            	svgGraphSaved = participant.svgGraphSaved;
//            	apiServices.storeObject("isSavedSurvey", $scope.engagement.survey.participant.svgGraphSaved);
            	
//            	surveyComplete=participant.status;
//            }
//		});
        if (surveyComplete == "COMPLETE" || $scope.engagement.survey.closed) {
            apiServices.navigateTo("/complete");
        }
	}).error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
	
	
   	$scope.remingRiskCalculate = function(){
  		$scope.remainingRisk=0;
            $scope.engagement.survey.participant.risks.forEach( function(risk){
				if(risk.isConnected == false){
					$scope.remainingRisk++;
				}
			});
	}

    // Required js function
        $scope.init=function(){
                
                $scope.risks = $scope.engagement.survey.participant.risks;
                apiServices.storeObject("xLegends", $scope.engagement.survey.severity);
                apiServices.storeObject("yLegends", $scope.engagement.survey.likelihood);
           
            configure();
            require(['domReady!', 'controllers', 'tasks'], function (domReady, cs, ts) {
                    ts.taskRunner = new ts.TaskRunner("participant.html", $scope.engagement.taskId, true, 
                                    $scope.engagement.engagementId, $scope.participantEmail, $scope.participantId);
                    ts.taskRunner.runTask($scope.engagement.taskId, true, $scope.engagement.engagementId, $scope.engagement.taskId);
                    currentJSTaskRunner = ts.taskRunner;
                    zoom = d3.behavior.zoom().scaleExtent([ 0.1, 10 ]);
                    populateRiskMap();
            }); 
              $scope.remingRiskCalculate();
	    	  $scope.calculatePercentagerRiskMap();
        };

	var populateRiskMap = function() {
		var riskMap = new Object();
		var currentRisk = null;
		var arrayLength = $scope.risks.length;
		for (var i = 0; i < arrayLength; i++) {
			currentRisk = $scope.risks[i];
			riskMap[currentRisk.name] = currentRisk.desc;
		}
		apiServices.storeObject("riskMap", riskMap);
	}
	
	$scope.isCollapsed = false;
	$scope.instructionToggleName = "CLOSE";
      $scope.toggleInstructions = function() {
            if ($scope.isCollapsed) {
                  $scope.isCollapsed = false;
                  $scope.instructionToggleName = "CLOSE";
            } else {
                  $scope.isCollapsed = true;
                  $scope.instructionToggleName = "SHOW INSTRUCTIONS";
            }
      }
      
      $scope.calculatePercentagerRiskMap = function(){
      	var noOfCompleteRiskMap = 0;
      	var noOfCompleteSeveVsLike = 0;
      	var noOfCompleteVelocity = 0;
      	  		$scope.engagement.survey.participant.risks.forEach( function(riskstatus){
  	    			if(riskstatus.isConnected == true){
  	    				noOfCompleteRiskMap++;
  	    			}
  	    			if(riskstatus.isPlotted == true){
  	    				noOfCompleteSeveVsLike++;
  	      			}
  	      			if(riskstatus.isRated == true){
  	      				noOfCompleteVelocity++;
  	      			}
  	  		  });
  	      var totalNoRisk = $scope.engagement.survey.participant.risks.length;
	   	  var percentageRiskMap = ((noOfCompleteRiskMap / totalNoRisk) * 100).toFixed(0);
	  	  var percentagesereVsLike = ((noOfCompleteSeveVsLike / totalNoRisk) * 100).toFixed(0);
	  	  var percentagevelocity = ((noOfCompleteVelocity / totalNoRisk) * 100).toFixed(0);
  	  		  
		  document.getElementById("riskMapprogressBar").style.width  = percentageRiskMap+"%"; 
		  document.getElementById("riskMapSevProgressBar").style.width = percentagesereVsLike+"%";
		  document.getElementById("riskMapVelProgressBar").style.width = percentagevelocity+"%";
  		  
		  if(percentageRiskMap < 100 || percentagesereVsLike < 100 || percentagevelocity <100  ){
			  document.getElementById("saveRiskMap").disabled = true;
		  }else{
			  document.getElementById("saveRiskMap").disabled = false;
		  }
  		  
        }
    
      $scope.save = function() {
            $scope.operationInProgress = true;
            $scope.saveMessage = true;
            $scope.closed = $scope.engagement.survey.closed;
            $scope.remingRiskCalculate();
            $scope.dirtyCheckRiskMap = false;
            $scope.calculatePercentagerRiskMap();
            if ($scope.completed == "COMPLETE" || $scope.closed) {
                  apiServices.navigateTo("/complete");
            } else {
//                  currentJSTaskRunner.task.setApplication();
                  var saveQuery = currentJSTaskRunner.task.getSaveQuery();
                  apiServices.saveGraph(
                		  saveQuery.queryString 
                		  + "&organisation=" + $scope.engagement.clientId,
//                		  + "&svgGraphSaved" + svgGraphSaved,                		  
                		  saveQuery.data).success(function(data) {
                      	$timeout(function(){
                      		$scope.operationInProgress = false;
                            $scope.saveMessage = false;
                      	},2000);
                	    
                  }).error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
            }
    //        $scope.loadProgressDelayRiskMap();
            $scope.startTimer();
      }
      
      $scope.returnToHome = function() {
    	  $scope.dirtyCheckRiskMap = false;
          $scope.closed = $scope.engagement.survey.closed;
    	  $scope.stopTimer();
          if ($scope.completed == "COMPLETE" || $scope.closed) {
                apiServices.navigateTo("/complete");
          } else {
//                currentJSTaskRunner.task.setApplication();
                var saveQuery = currentJSTaskRunner.task.getSaveQuery();
                apiServices.saveGraph(
              		  saveQuery.queryString 
              		  + "&organisation=" + $scope.engagement.clientId,
//              		  + "&svgGraphSaved" + svgGraphSaved,                		  
              		  saveQuery.data).success(function(data) {
              			window.location = $location.absUrl().replace(/velocity|riskMap|seveVsLike/gi,'login/home');
              		  }).error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
          }
  	  }
      
//      $scope.loadProgressDelayRiskMap = function() {
//	      $timeout(function() {
//	    	  $scope.calculatePercentagerRiskMap();
//	  		}, 20);
//      }
      
//      $scope.loadProgressDelayRiskMap();

      $scope.updateRiskStatusAsConnected = function(riskid) {
    	  $scope.resetTimer();
          var rid=riskid.replace("urn:uuid:","");
    	  apiServices.riskConnected(riskid, $scope.participantId);
   		  $scope.engagement.survey.participant.risks.forEach( function(riskStatus){
		  if(riskStatus.uri == rid){
				riskStatus.isConnected = true;
			}
		  apiServices.storeObject("riskStatuses", $scope.engagement.survey.participant.risks);
		  }); 
      } 
      
      $scope.viewRiskDetails = function(){
      	//$scope.engagement = apiServices.getObject("selectedEngagement");
  	//	$scope.risks = $scope.engagement.survey.participant.risks;
  		apiServices.converToPdf(document.getElementById('viewriskdetails'));
        }  

    $scope.navigate = function(pagePath) {
    	  	$scope.remingRiskCalculate();
    	 	$scope.stopTimer();
    	 	$scope.dirtyCheckRiskMap= false;
    	 	$scope.calculatePercentagerRiskMap();
            $scope.closed = $scope.engagement.survey.closed;
            if ($scope.completed == "COMPLETE" || $scope.closed) {
                  apiServices.navigateTo("/complete");
            } else {
//                  currentJSTaskRunner.task.setApplication();
                  var saveQuery = currentJSTaskRunner.task.getSaveQuery();
                  apiServices.saveGraph(
                		  saveQuery.queryString 
                		  + "&organisation=" + $scope.engagement.clientId,
//                		  + "&svgGraphSaved" + svgGraphSaved,                		  
                		  saveQuery.data).success(function(data) {
                	  apiServices.navigateTo("/" + pagePath);
                  }).error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
            }
      }

    
    
    $scope.startNotificationTimerRiskMap = function() {
        if (notificationTimerRiskMap != null ) {
              $timeout.cancel(notificationTimerRiskMap);
        }
        notificationTimerRiskMap = $timeout(function() {
        	var modalInstance = $uibModal.open({
    			animation : true,
    			templateUrl : 'engagementManager/contents/notificationTimerModal.html',
    			controller : 'notificationTimerModalController',
    			backdrop : 'static',
    			keyboard : false
    		});
        }, 14 * 60000);
    }
    
    $scope.submitSurvey = function() {
    	$scope.resetTimer();
    	$scope.dirtyCheckRiskMap= false;
    	var modalInstance = $uibModal.open({
            animation : true,
            templateUrl : 'participant/contents/SubmitSurveyConfirmation.html',
            controller : 'submitSurveyPopupController',
            backdrop : 'static',
            keyboard : false
        });
        modalInstance.result.then(function(returnObj) {
			  if(returnObj) {
				  // Update the status of survey into Completed
				  $scope.submitInProgress = true;
		          $scope.save();
		          var participantDetails = apiServices.getObject("selectedEngagement").survey.participant;
		          $scope.email = participantDetails.emailId;
		          var parti={
		                  emailId : $scope.email,
		                  name : participantDetails.name,
		                  lName : participantDetails.lName,
		                  participantId : participantDetails.participantId,
		                  participantSurveyId : participantDetails.participantSurveyId,
		                  status:"COMPLETE",
		                  acceptTerms :true
		              };
		          apiServices.updateParticipant($scope.engagement.taskId,parti)
		           .success(function(data, status, headers, config) {
		            }).
		            error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
		          $scope.stopNotificationTimerRiskMap();
		          apiServices.storeObject("selectedEngagement", $scope.engagement);
		          apiServices.storeObject("feedback","true");
		          $location.path("/feedback");
			  }
	        });
	    }
    
    $scope.startNotificationTimerRiskMap();
    
    $scope.stopNotificationTimerRiskMap = function() {
  	  $timeout.cancel(notificationTimerRiskMap);
  	  notificationTimerRiskMap = null;
    }
    
      // Save and Exit timer
      $scope.startTimer = function() {
            if (timer != null) {
                  $timeout.cancel(timer);
            }
            timer = $timeout(function() {
                  $scope.operationInProgress = true;
                  var mm=document.getElementById('sessionNotification');
                  if(mm){
                      angular.element(mm).scope().closenotificationTimerModalPopup();
                  }
                  var saveQuery = currentJSTaskRunner.task.getSaveQuery();
                  apiServices.saveGraphAndExit(saveQuery.queryString + "&organisation=" + $scope.engagement.clientId, saveQuery.data)
                  .success(function(data) {
                        apiServices.navigateTo("/sessionExpired");
                        $scope.operationInProgress = false;
                        $scope.dirtyCheckRiskMap = false;
                        $scope.stopNotificationTimerRiskMap();
                  }).error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
            }, $scope.timerCountMinute * 60000);
      	}

      $scope.resetTimer = function() {
    	  $scope.stopTimer();
    	  $scope.startTimer();
      }
      
      $scope.stopTimer = function() {
    	  $timeout.cancel(timer);
    	  timer = null;
    	  $scope.stopNotificationTimerRiskMap();
      }
      $scope.startTimer();
      
      $scope.resetNotificationTimerRiskMap = function() {
    	  $scope.stopNotificationTimerRiskMap();
    	  $scope.startNotificationTimerRiskMap();
      }

      // Zoom slider and fitToScreen are below
      $scope.graphFitToScreen = function() {
    	  $scope.slider.value = 6;
    	  zoomGraph($scope.slider.value);
      }

      $scope.slider = {
                value: riskMapZoomSliderVal,
                options: {
                  hidePointerLabels: true,
                  hideLimitLabels: true,
                    floor: 6,
                    ceil: 11,
                    step: 1,
                    onEnd: function() {
                        zoomGraph($scope.slider.value);
                        apiServices.storeObject("RiskMapZoomSliderVal", $scope.slider.value);
                    },
                    translate: function(value) {
                        return '';
                    }
                }
      };

      var zoomGraph = function(scale) {
        var svg = d3.select("body").select("#nexus").select("svg");
        var container = svg.select("g");
        var tr = container.attr("transform");
        scale = scale/6;
        if ($scope.baseTranslate == null) {
            $scope.baseTranslate = d3.transform(tr).translate;
        }
        var translate = [$scope.baseTranslate[0] + scale, $scope.baseTranslate[1] + scale];
        container.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
      }
      
      $scope.setdirty  = function() {
    	  $scope.dirtyCheckRiskMap = true;
      }
    	  
      $window.onbeforeunload = function (event) {
    	  if($scope.dirtyCheckRiskMap){
    		  var saveQuery = currentJSTaskRunner.task.getSaveQuery();
              apiServices.ajaxSaveGraph(saveQuery.queryString + "&organisation=" + $scope.engagement.clientId, saveQuery.data);
              
              var event = event || window.event;
              
              if (event) {
            	  event.returnValue = 'Are you sure you want to close the page?';
              }
              return event.returnValue;

            } else {
    		  event.preventDefault();
    	  }
      };
      $scope.$on('$destroy', function(e){
    	  $window.onbeforeunload = undefined;
      });
      

      $timeout(function() { 
    	  riskMapZoomSliderVal = apiServices.getObject("RiskMapZoomSliderVal");
    	  if (riskMapZoomSliderVal) {
    		  zoomGraph(riskMapZoomSliderVal);
    	  } else {
    		  riskMapZoomSliderVal = 6;
    	  }
    	}, 300);
      
}])

.controller('LikeVsSeveCtrl', [ '$scope', '$http', 'api-services', "$location","$timeout", "$uibModal", "$window", function($scope, $http, apiServices, $location, $timeout,$uibModal, $window) {
	  var instructionsCollapsed = false;
	  var currentJSTaskRunner = null;
      var zoom = null;
      var timerLikeVsSeve=null;
      var notificationTimerLikeVsSeve=null;
      var likeVsSeveZoomSliderVal = apiServices.getObject("LikeVsSeveZoomSliderVal");
      var mappedRisk = new Set();
      $scope.showRisksCompleteImg = false;
      $scope.remainingRiskLike  = 0;
      $scope.baseTranslate = null;
      $scope.timerCountMinute = 19;
//      $scope.engagement = apiServices.getObject("selectedEngagement");
      $scope.operationInProgress = false;
      $scope.saveMessage = false;
      $scope.dirtyCheckLikeVsSeve = false;
//      $scope.participantEmail = apiServices.getObject("email");
//      $scope.participantId = apiServices.getObject("userId");
      apiServices.loadSliderPart();
      apiServices.getEngagementById($location.search()['engageId']).success(function(data) {
            
                apiServices.updateSelectedEngagement($scope,data);
		var surveyComplete=$scope.engagement.survey.participant.status;
//            var surveyComplete="INPROGRESS";
//            $scope.engagement.survey.participants.forEach( function(participant) {
//                if (participant.id == $scope.participantId) {
//                	var svgGraphSaved = participant.svgGraphSaved;
//            	apiServices.storeObject("isSavedSurvey", $scope.engagement.survey.participant.svgGraphSaved);
//                	surveyComplete=participant.status;
//                }
//    		});
            if (surveyComplete == "COMPLETE" || $scope.engagement.survey.closed) {
                apiServices.navigateTo("/complete");
            }
            $scope.init();
      }).error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
      $scope.init=function(){
      $scope.risks = $scope.engagement.survey.participant.risks;
      apiServices.storeObject("xLegends", $scope.engagement.survey.severity);
      apiServices.storeObject("yLegends", $scope.engagement.survey.likelihood);
      // Required js function
      configure();
      require(['domReady!', 'controllers', 'tasks'], function (domReady, cs, ts) {
            ts.taskRunner = new ts.TaskRunner("participant.html", $scope.engagement.taskId, false, 
                        $scope.engagement.engagementId, $scope.participantEmail, $scope.participantId);
            ts.taskRunner.runTask($scope.engagement.taskId, false, $scope.engagement.engagementId, $scope.engagement.taskId);
            currentJSTaskRunner = ts.taskRunner;
            zoom = d3.behavior.zoom().scaleExtent([ 0.1, 10 ]);
      });
      $scope.remingRiskCalculateLike();
      $scope.calculatePercentagerSevVsLike();
      };
      $timeout(function() { 
    	  likeVsSeveZoomSliderVal = apiServices.getObject("LikeVsSeveZoomSliderVal");
    	  if (likeVsSeveZoomSliderVal) {
    		  zoomGraph(likeVsSeveZoomSliderVal);
    	  } else {
    		  likeVsSeveZoomSliderVal = 6;
    	  }
    	}, 300);

      $scope.calculatePercentagerSevVsLike = function(){
      	var noOfCompleteRiskMapSeve = 0;
      	var noOfCompleteSeveVsLikeSeve = 0;
      	var noOfCompleteVelocitySeve = 0;
    	  		$scope.engagement.survey.participant.risks.forEach( function(riskstatus){
    	    			if(riskstatus.isConnected == true) {
    	    				noOfCompleteRiskMapSeve++;
    	    			}
    	    			if(riskstatus.isPlotted == true || mappedRisk.has(riskstatus.name)) {
    	    				noOfCompleteSeveVsLikeSeve++;
    	      			}
    	      			if(riskstatus.isRated == true) {
    	      			noOfCompleteVelocitySeve++;
    	      			}
    	  		  });
        	  var totalNoRisk = $scope.engagement.survey.participant.risks.length;
    	  	  var percentageRiskMapSeve = ((noOfCompleteRiskMapSeve / totalNoRisk) * 100).toFixed(0);
    	  	  var percentageSeveVsLike = ((noOfCompleteSeveVsLikeSeve / totalNoRisk) * 100).toFixed(0);
    	  	  var percentageVelocity = ((noOfCompleteVelocitySeve / totalNoRisk) * 100).toFixed(0);
    	  		
    	  	  if (percentageSeveVsLike == 100) {
    	  		  $scope.showRisksCompleteImg = true;
    	  	  } else {
    	  		$scope.showRisksCompleteImg = false;
    	  	  }
    		  document.getElementById("severityRiskMapProgressBar").style.width  = percentageRiskMapSeve+"%"; 
    		  document.getElementById("severityProgressBar").style.width = percentageSeveVsLike+"%";
    		  document.getElementById("severityVelProgressBar").style.width = percentageVelocity+"%";
    		  
    		  if(percentageRiskMapSeve < 100 || percentageSeveVsLike < 100 || percentageVelocity <100  ){
    			  document.getElementById("seveVsLikeSubmit").disabled = true;
    			  }else{
    			  document.getElementById("seveVsLikeSubmit").disabled = false;
    			  }
          }
      
//      $scope.loadProgressDelay = function() {
//	      $timeout(function() {
//	    	  $scope.calculatePercentagerSevVsLike();
//	  		}, 20);
//      }
      
//      $scope.loadProgressDelay();
        
      $scope.viewRiskDetails = function(){
      	//$scope.engagement = apiServices.getObject("selectedEngagement");
  		//$scope.risks = $scope.engagement.survey.participant.risks;
  		apiServices.converToPdf(document.getElementById('viewriskdetails'));
        }  
      
      $scope.addRisks = function(riskName){
    	 var remainingCount = parseInt(document.getElementById('remainingLike').innerHTML)-1;
    	 remainingCount = remainingCount > 0 ? remainingCount-- : 0;
    	 document.getElementById('remainingLike').innerHTML = remainingCount;
    	 mappedRisk.add(riskName);
      }
     
      function decrementCount() {
    	  $scope.remainingRiskLike++;
      }
      
      $scope.savePlottedStatus = function(){
    	  mappedRisk.forEach(function (selectedRisk) {
    		  $scope.updateRiskStatusAsPloted(selectedRisk.toString());
    		});
      }

      $scope.updateRiskStatusAsPloted = function(riskName) {
    	  $scope.resetTimer();
    	  var rid=riskName.replace("urn:uuid:","");
    	  apiServices.riskPlotted( riskName, $scope.participantId);
    		  $scope.engagement.survey.participant.risks.forEach(function(riskStatus){
  	  			if(riskStatus.uri == rid){
  	  				riskStatus.isPlotted = true;
  	  			}
    		  });
    		  apiServices.storeObject("riskStatuses", $scope.engagement.survey.participant.risks);
      }
      
      $scope.updateRiskStatusAsNotPloted = function(riskName) {
     	  apiServices.riskNotPlotted( riskName, $scope.participantId);
    	  $scope.engagement.survey.participant.risks.forEach(function(riskStatus){
	  			if(riskStatus.name == riskName){
	  				riskStatus.isPlotted = false;
	  			}
  		  });
  		  apiServices.storeObject("riskStatuses", $scope.engagement.survey.participant.risks);
      }
      
      $scope.remingRiskCalculateLike = function(){
    		$scope.remainingRiskLike=0;
  		$scope.engagement.survey.participant.risks.forEach( function(risks){
  			if(risks.isPlotted==false){
  				$scope.remainingRiskLike++;
  			}
		  })
  	  }
//      $scope.remingRiskCalculateLike();
      
      
      $scope.save = function() {
  	  	$scope.remingRiskCalculateLike();
  	    $scope.dirtyCheckLikeVsSeve = false;
  	  	$scope.calculatePercentagerSevVsLike();
          $scope.operationInProgress = true;
          $scope.saveMessage = true;
          $scope.closed = $scope.engagement.survey.closed;
          if ($scope.completed == "COMPLETE" || $scope.closed) {
                apiServices.navigateTo("/complete");
          } else {
//                currentJSTaskRunner.task.setApplication();
                var saveQuery = currentJSTaskRunner.task.getSaveQuery();
                apiServices.saveGraph(saveQuery.queryString + "&organisation=" + $scope.engagement.clientId, saveQuery.data).success(function(data) {
              	  $timeout(function(){
              		  $scope.operationInProgress = false;
                        $scope.saveMessage = false;
                  	},2000);
                }).error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
          }
          $scope.startTimer();
    }
    
    $scope.returnToHome = function() {
  	  $scope.closed = $scope.engagement.survey.closed;
  	$scope.dirtyCheckLikeVsSeve = false;
  	  $scope.stopTimer();
        if ($scope.completed == "COMPLETE" || $scope.closed) {
              apiServices.navigateTo("/complete");
        } else {
//              currentJSTaskRunner.task.setApplication();
              var saveQuery = currentJSTaskRunner.task.getSaveQuery();
              apiServices.saveGraph(saveQuery.queryString + "&organisation=" + $scope.engagement.clientId, saveQuery.data).success(function(data) {
              	window.location = $location.absUrl().replace(/velocity|riskMap|seveVsLike/gi,'login/home');
              }).error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
        }
 	  }

    $scope.navigate = function(pagePath) {
  	 /* $scope.savePlottedStatus();*/
      $scope.dirtyCheckLikeVsSeve = false;
  	  $scope.stopTimer();
          $scope.closed = $scope.engagement.survey.closed;
          if ($scope.completed == "COMPLETE" || $scope.closed) {
                apiServices.navigateTo("/complete");
          } else {
//                currentJSTaskRunner.task.setApplication();
                var saveQuery = currentJSTaskRunner.task.getSaveQuery();
                apiServices.saveGraph(saveQuery.queryString + "&organisation=" + $scope.engagement.clientId, saveQuery.data).success(function(data) {
                      apiServices.navigateTo("/" + pagePath);
                      $scope.operationInProgress = false;
                }).error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
          }
         $scope.remingRiskCalculateLike();
  	  	$scope.calculatePercentagerSevVsLike();
    }
    
    
    $scope.startNotificationTimer = function() {
        if (notificationTimerLikeVsSeve != null ) {
              $timeout.cancel(notificationTimerLikeVsSeve);
        }
        notificationTimerLikeVsSeve = $timeout(function() {
        	var modalInstance = $uibModal.open({
    			animation : true,
    			templateUrl : 'engagementManager/contents/notificationTimerModal.html',
    			controller : 'notificationTimerModalController',
    			backdrop : 'static',
    			keyboard : false
    		});
        }, 14 * 60000);
  }
    
    $scope.stopNotificationTimer = function() {
  	  $timeout.cancel(notificationTimerLikeVsSeve);
  	  notificationTimerLikeVsSeve = null;
    }
    
      // Save and Exit timer
      $scope.startTimer = function() {
            if (timerLikeVsSeve != null ) {
                  $timeout.cancel(timerLikeVsSeve);
            }
            timerLikeVsSeve = $timeout(function() {
                  $scope.operationInProgress = true;
//                  currentJSTaskRunner.task.setApplication();
                  var mm=document.getElementById('sessionNotification');
                  if(mm){
                      angular.element(mm).scope().closenotificationTimerModalPopup();
                  }
                  var saveQuery = currentJSTaskRunner.task.getSaveQuery();
                  apiServices.saveGraphAndExit(saveQuery.queryString + "&organisation=" + $scope.engagement.clientId, saveQuery.data)
                  .success(function(data) {
                        apiServices.navigateTo("/sessionExpired");
                        $scope.operationInProgress = false;
                        $scope.stopNotificationTimer();
                        $scope.dirtyCheckLikeVsSeve = false;
                  }).error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
            }, $scope.timerCountMinute * 60000);
      }
      // Save and Exit timer
      $scope.startNotificationTimer();
      $scope.startTimer();
      
      $scope.resetNotificationTimer = function() {
    	  $scope.stopNotificationTimer();
    	  $scope.startNotificationTimer();
      }
      
      $scope.resetTimer = function() {
    	  $scope.stopTimer();
    	  $scope.startTimer();
    	  $scope.resetNotificationTimer();
      }
      
      $scope.stopTimer = function() {
    	  $timeout.cancel(timerLikeVsSeve);
    	  timerLikeVsSeve = null;
    	  $scope.stopNotificationTimer();
      }
      
      
      $scope.submitSurvey = function() {
    	  $scope.resetTimer();
	  	  $scope.dirtyCheckRiskMap= false;
		  var modalInstance = $uibModal.open({
	        animation : true,
	        templateUrl : 'participant/contents/SubmitSurveyConfirmation.html',
	        controller : 'submitSurveyPopupController',
	        backdrop : 'static',
	        keyboard : false
	      });
	      	modalInstance.result.then(function(returnObj) {
			  if(returnObj) {
				  // Update the status of survey into Completed
				  $scope.submitInProgress = true;
		          $scope.save();
		          var participantDetails = apiServices.getObject("selectedEngagement").survey.participant;
		          $scope.email = participantDetails.emailId;
		          var parti={
		                  emailId : $scope.email,
		                  name : participantDetails.name,
		                  lName : participantDetails.lName,
		                  participantId : participantDetails.participantId,
		                  participantSurveyId : participantDetails.participantSurveyId,
		                  status:"COMPLETE",
		                  acceptTerms :true
		              };
		          apiServices.updateParticipant($scope.engagement.taskId,parti)
		           .success(function(data, status, headers, config) {
		            }).
		            error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
		          $scope.stopNotificationTimer();
		          apiServices.storeObject("selectedEngagement", $scope.engagement);
		          apiServices.storeObject("feedback","true");
		          $location.path("/feedback");
			  }
	        });
	    }
     
      // Zoom slider and fitToScreen are below
      $scope.graphFitToScreen = function() {
    	  $scope.slider.value = 1;
    	  zoomGraph($scope.slider.value);
      }

      $scope.slider = {
                value: likeVsSeveZoomSliderVal,
                options: {
                  hidePointerLabels: true,
                  hideLimitLabels: true,
                    floor: 0,
                    ceil: 5,
                    step: 1,
                    onEnd: function() {
                        zoomGraph($scope.slider.value);
                        apiServices.storeObject("LikeVsSeveZoomSliderVal", $scope.slider.value);
                    },
                    translate: function(value) {
                        return '';
                    }
                }
      };

      var zoomGraph = function(scale) {
        var svg = d3.select("body").select("#charts").select("svg");
        var container = svg.select("g");
        var tr = container.attr("transform");
        scale = scale/36+1;
        if ($scope.baseTranslate == null) {
            $scope.baseTranslate = d3.transform(tr).translate;
        }
        var translate = [$scope.baseTranslate[0] + scale, $scope.baseTranslate[1] + scale];
        container.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
      }
      
      
      $scope.setdirty  = function() {
    	  $scope.dirtyCheckLikeVsSeve = true;
      }
    	  
      $window.onbeforeunload = function (event) {
    	  if($scope.dirtyCheckLikeVsSeve){
    		  var saveQuery = currentJSTaskRunner.task.getSaveQuery();
              apiServices.ajaxSaveGraph(saveQuery.queryString + "&organisation=" + $scope.engagement.clientId, saveQuery.data);
              
              var event = event || window.event;

              if (event) {
            	  event.returnValue = 'Are you sure you want to close the page?';
              }
              return event.returnValue;
		    	  } else {
    		  event.preventDefault();
    	  }
      };
      $scope.$on('$destroy', function(e){
    	  $window.onbeforeunload = undefined;
      });
}])

.controller('velocityRatingCtrl', [ '$scope', '$http', 'api-services', '$location', "$timeout","$window","$uibModal", function($scope, $http, apiServices, $location, $timeout, $window, $uibModal) {
	var instructionsCollapsed = false;  
	var currentJSTaskRunner = null;
	var velocityGraphSaved = false;
	var timerVelocity = null;
	var timervelocityExpiryNotification = null;
	var rattedRisks = new Set();
	$scope.rattedRisk = null;
	$scope.remainingRiskVelocity=0;
	$scope.timerCountMinute = 19;
	$scope.closed = false;
	$scope.submitInProgress = false;
	$scope.operationInProgress = false;
	$scope.saveMessage = false;
	$scope.sliderOptionsList = [];
	$scope.dirtyCheckvelocity = false;
    	  
	 $scope.populateRisk = function(riskOb) {
		  $scope.dirtyCheckvelocity = true;
     	  var riskObj = _.find($scope.risksWithVelocityValues, function(risk) { return risk.name == riskOb });
     	  $scope.resetTimer();
     	  var unselectedRiskName = $scope.selectedRisk.name.replace(" : ", "");
     	  var unselectedRisk = document.getElementById(unselectedRiskName);
     	  if (unselectedRisk) {
     		  unselectedRisk.className = unselectedRisk.className.replace(/\blight-blue\b|\bbold\b/gi,'small text-muted');
     	  }
     	  $scope.selectedRisk.name = riskObj.name + " : ";
     	  $scope.selectedRisk.desc = riskMap[riskObj.name];
        	  document.getElementById(riskObj.name).className = "light-blue bold";
        	  if(riskObj.velocityValue > 3 &&  riskObj.velocityValue <= 95) {
        		  $scope.updateRiskRated(riskObj.uri);
        		  $scope.riskcountCalculater();
        		  $scope.calculatePercentagerVelocity();
        	  }else{
        		  var selectedRiskStatus = _.find($scope.engagement.survey.participant.risks, function(risk) { return risk.name == riskOb });
        		  if(selectedRiskStatus.isRated ){
        			  if(riskObj.velocityValue < 3 ){
        				  riskObj.velocityValue = 4;
        			  }
        			  if(riskObj.velocityValue > 95 ){
        				  riskObj.velocityValue = 95;
        			  }
        		  }
        	  }
        $scope.resetTimer();
       };
	
	$scope.sliderOptions = {
   		 value: 0,
   		 options: {
   			 id:"",                                                                        
   			 floor: 1,
   			 ceil: 100,
   			 showTicks: false,
   			 disabled: false,
   			 hidePointerLabels: true,
   			 hideLimitLabels: true,
   			 getPointerColor: function(value) {
   				 if ((value < 4) || (value > 95))
   					 return '#999999';
   				 return '#0091DA';
   			 },
   			 onChange : function(sliderId, modelValue, highValue, pointerType){
   				 if((modelValue >= 4)|| (modelValue <= 95) ){
   					$scope.populateRisk(sliderId);
   				 }
   			 }
           }
    }
  	  
      apiServices.loadSliderPart();
      var riskMap = apiServices.getObject("riskMap");
      apiServices.getEngagementById($location.search()['engageId']).success(function(data) {
            
            apiServices.updateSelectedEngagement($scope,data);
            var surveyComplete=$scope.engagement.survey.participant.status;
            var surveyComplete="INPROGRESS";

            if (surveyComplete == "COMPLETE" || $scope.engagement.survey.closed) {
                apiServices.navigateTo("/complete");
            }
            $scope.init();
            
      }).error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
      
      $scope.init = function() {
    	  $scope.risks = $scope.engagement.survey.participant.risks;
	      apiServices.getVelocityRating($scope.engagement.taskId, $scope.participantId, $scope.engagement.clientId, $scope.participantEmail).success(function(data) {
	            $scope.velocityRating = data;
	            if (data.risksWithVelocityValues) {
	                  $scope.risksWithVelocityValues = $scope.velocityRating.risksWithVelocityValues;
	                  $scope.resetRiskRatedFlag();
	            }
	            $scope.rattedRisk = data;
	            $scope.riskcountCalculater();
	            $scope.calculatePercentagerVelocity();
	            
	            $scope.risksWithVelocityValues.forEach(function(risk){
	      		  var sliderTemplate =   angular.copy($scope.sliderOptions.options);
	      		  sliderTemplate.id=risk.name;
	      		  $scope.sliderOptionsList.push(sliderTemplate);
	      	  });
	      }).error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
	      
	      $scope.label_slider = {
                  value: 0,
                  options: {
                      floor: 1,
                      ceil: 5,
                      showTicks: true,
                      disabled: true,
                      showTicksValues: true,
                      hidePointerLabels: true,
                      hideLimitLabels: true,
                      getPointerColor: function(value) {
                        return '#FFFFFF';
                    },
                      translate: function(value) {
                        if (value > 0 && value < 6) {
                              return $scope.engagement.survey.velocity[value-1];
                        }
                      }
                  }
	      }
      }

      $scope.calculatePercentagerVelocity = function(){
    	  var noOfCompleteRiskMapVelocity = 0;
    	  var noOfCompleteSeveVsLikeVelocity=0;
    	  var noOfCompleteVelocity=0;
        	$scope.engagement.survey.participant.risks.forEach( function(riskstatus){
    	    			if(riskstatus.isConnected == true) {
    	    				noOfCompleteRiskMapVelocity++; 
    	    			}
    	    			if(riskstatus.isPlotted == true ) {
    	    				noOfCompleteSeveVsLikeVelocity++;
    	      			}
    	      			if(riskstatus.isRated == true ) {
    	      				noOfCompleteVelocity++;
    	      			}
    	  		  })
        	  var totalNoRisk = $scope.engagement.survey.participant.risks.length;
    		  var riskMapPercentage = ((noOfCompleteRiskMapVelocity / totalNoRisk) * 100).toFixed(0);
    		  var severityPercentage = ((noOfCompleteSeveVsLikeVelocity / totalNoRisk) * 100).toFixed(0);
    	  	  var velocityPercentage =	((noOfCompleteVelocity / totalNoRisk) * 100).toFixed(0);
    	  	  document.getElementById("velocityRiskMapProgressBar").style.width  = riskMapPercentage+"%"; 
    		  document.getElementById("velocityseverityProgressBar").style.width = severityPercentage+"%";
    		  document.getElementById("velocityProgressBar").style.width = velocityPercentage+"%";
    		  
    		  if(riskMapPercentage < 100 || severityPercentage < 100 || velocityPercentage <100  ) {
    			  document.getElementById("velocitySubmited").disabled = true;
    			  }else{
    			  document.getElementById("velocitySubmited").disabled = false;
    			  }
          }
      
      $scope.save = function() {
           $scope.operationInProgress = true;
        	$scope.saveMessage = true;
        	$scope.riskcountCalculater();
        	$scope.dirtyCheckvelocity = false;
        	$scope.calculatePercentagerVelocity();
            $scope.closed = $scope.engagement.survey.closed;
            if ($scope.completed == "COMPLETE" || $scope.closed) {
                  apiServices.navigateTo("/complete");
            } else if ($scope.risks) {
                  $scope.velocityRating.risksWithVelocityValues = $scope.risksWithVelocityValues;
                  apiServices.saveVelocityRating($scope.velocityRating).success(function(data) {
                        $scope.participantModelId = data.participantModelId;
                        $timeout(function(){
                      		$scope.operationInProgress = false;
                            $scope.saveMessage = false;
                      	},2000);
                  }).error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
            }
            $scope.startTimer();
      }
      

      $scope.returnToHome = function() {
    	  $scope.dirtyCheckvelocity = false;
    	  $scope.closed = $scope.engagement.survey.closed;
    	  $scope.stopTimer();
          if ($scope.completed == "COMPLETE" || $scope.closed) {
                apiServices.navigateTo("/complete");
          } else if ($scope.risks) {
                $scope.velocityRating.risksWithVelocityValues = $scope.risksWithVelocityValues;
                apiServices.saveVelocityRating($scope.velocityRating).success(function(data) {
                	window.location = $location.absUrl().replace(/velocity|riskMap|seveVsLike/gi,'login/home');
                }).error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
          }
   	  }

     setTimeout(function(){ 
  		var scrollheight =  document.getElementById('scroll').offsetHeight; 
  		var scrollheight = $scope.risks.length * 53;
  		if (scrollheight > 500) {
  			scrollheight = 480;
  		}
  		document.getElementById("dashed-vertical-line").style.height = scrollheight + "px" ;
  		document.getElementById("dashed-vertical-line1").style.height = scrollheight + "px" ;
  		document.getElementById("dashed-vertical-line2").style.height = scrollheight + "px" ;
  		document.getElementById("dashed-vertical-line3").style.height = scrollheight + "px" ;
  		document.getElementById("dashed-vertical-line4").style.height = scrollheight + "px" ;
  		}, 1000);
      
      /* Get Selected Risk Name and corresponding Description*/
      $scope.selectedRisk = {
    		  name : '',
    		  desc : ''
      };
      
      $scope.submitSurvey = function() {
    	  apiServices.storeObject("selectedEngagement", $scope.engagement);
    	  $scope.resetTimer();
	  	  $scope.dirtyCheckRiskMap= false;
	  	  
		  var modalInstance = $uibModal.open({
	        animation : true,
	        templateUrl : 'participant/contents/SubmitSurveyConfirmation.html',
	        controller : 'submitSurveyPopupController',
	        backdrop : 'static',
	        keyboard : false
	      });
		  modalInstance.result.then(function(returnObj) {
			  if(returnObj) {
				  // Update the status of survey into Completed
				  $scope.submitInProgress = true;
		          $scope.save();
		          var participantDetails = apiServices.getObject("selectedEngagement").survey.participant;
		          $scope.email = participantDetails.emailId;
		          var parti={
		                  emailId : $scope.email,
		                  name : participantDetails.name,
		                  lName : participantDetails.lName,
		                  participantId : participantDetails.participantId,
		                  participantSurveyId : participantDetails.participantSurveyId,
		                  status:"COMPLETE",
		                  acceptTerms :true
		              };
		          apiServices.updateParticipant($scope.engagement.taskId,parti)
		           .success(function(data, status, headers, config) {
		            }).
		            error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
		          $scope.stopSessionExpiryNotificationTimer();
		          apiServices.storeObject("selectedEngagement", $scope.engagement);
		          apiServices.storeObject("feedback","true");
		          $location.path("/feedback");
			  }
	        });
	    }
      
      $scope.updateRiskRated = function(riskid){
 	  $scope.engagement.survey.participant.risks.forEach(function(riskStatus){
	  			if(riskStatus.uri == riskid && riskStatus.isRated == false  ){
	  				riskStatus.isRated = true;
    				apiServices.riskRated(riskid, $scope.participantId);
	  			}
		  });
      }
      
      $scope.updateRiskNotRated = function(riskid){
     	  $scope.engagement.survey.participant.risks.forEach(function(riskStatus){
    	  			if(riskStatus.uri == riskid) {
    	  				riskStatus.isRated = false;
        				apiServices.riskNotRated(riskid, $scope.participantId);
    	  			}
    		  });
          }
      $scope.resetRiskRatedFlag = function(){
    	  for(var count =0;count<$scope.risksWithVelocityValues.length;count++){
    		  if($scope.risksWithVelocityValues[count].velocityValue < 4 ||  $scope.risksWithVelocityValues[count].velocityValue > 95  ){
    				  $scope.updateRiskNotRated($scope.risksWithVelocityValues[count].name); 
    	  }
      }
     }
      
      $scope.riskcountCalculater = function(){
    	  $scope.remainingRiskVelocity=0;
    	   $scope.engagement.survey.participant.risks.forEach(function(riskStatus){
    		  			if(	riskStatus.isRated == false  ){
    		  				$scope.remainingRiskVelocity++;
    		  			}
    			  })
      }
      
      $scope.navigate = function(pagePath) {
            $scope.stopTimer();
            $scope.dirtyCheckvelocity = false;
            $scope.stopSessionExpiryNotificationTimer();
            $scope.riskcountCalculater();
            $scope.calculatePercentagerVelocity();
            $scope.closed = $scope.engagement.survey.closed;
            if ($scope.completed == "COMPLETE" || $scope.closed) {
                  apiServices.navigateTo("/complete");
            } else if ($scope.risks) {
                  $scope.velocityRating.risksWithVelocityValues = $scope.risksWithVelocityValues;
                  apiServices.saveVelocityRating($scope.velocityRating).success(function(data) {
                        $scope.participantModelId = data.participantModelId;
                        apiServices.navigateTo("/" + pagePath);
                  }).error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
            }
      }

      $scope.viewRiskDetails = function(){
      	//$scope.engagement = apiServices.getObject("selectedEngagement");
  		//$scope.risks = $scope.engagement.survey.participant.risks;
  		apiServices.converToPdf(document.getElementById('viewriskdetails'));
        } 
      
      $scope.startSessionExpiryNotificationTimerVelocity = function() {
          if (timervelocityExpiryNotification != null ) {
                $timeout.cancel(timervelocityExpiryNotification);
          }
          timervelocityExpiryNotification = $timeout(function() {
          	var modalInstance = $uibModal.open({
      			animation : true,
      			templateUrl : 'engagementManager/contents/notificationTimerModal.html',
      			controller : 'notificationTimerModalController',
      			backdrop : 'static',
      			keyboard : false
      		});
          }, 14 * 60000);
      }
      
      $scope.stopSessionExpiryNotificationTimer = function() {
    	  $timeout.cancel(timervelocityExpiryNotification);
    	  timervelocityExpiryNotification = null;
      }
      
      // Save and Exit timer
      $scope.startTimer = function() {
            if (timerVelocity != null) {
                  $timeout.cancel(timerVelocity);
            }
            timerVelocity = $timeout(function() {
                  $scope.operationInProgress = true;
                  if ($scope.risks) {
                	var mm=document.getElementById('sessionNotification');
                        if(mm){
                            angular.element(mm).scope().closenotificationTimerModalPopup();
                        }
                        $scope.velocityRating.risksWithVelocityValues = $scope.risksWithVelocityValues;
                        apiServices.saveVelocityRatingAndExit($scope.velocityRating).success(function(data) {
                        	  angular.element(document.getElementById('sessionNotification')).scope().closenotificationTimerModalPopup();
                        	  $scope.stopSessionExpiryNotificationTimer();
                              apiServices.navigateTo("/sessionExpired");
                              $scope.operationInProgress = false;
                              $scope.dirtyCheckvelocity = false;
                        }).error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
                  }
            }, $scope.timerCountMinute * 60000);
      }
      
      $scope.startSessionExpiryNotificationTimerVelocity();
    
      $scope.stopTimer = function() {
    	  $timeout.cancel(timerVelocity);
    	  timerVelocity = null;
    	  $scope.stopSessionExpiryNotificationTimer();
      }
      
      $scope.resetSessionExpiryNotificationTimer = function() {
    	  $scope.stopSessionExpiryNotificationTimer();
    	  $scope.startSessionExpiryNotificationTimerVelocity();
      }
      
      $scope.resetTimer = function() {
    	  $scope.stopTimer();
    	  $scope.startTimer();
    	  $scope.resetSessionExpiryNotificationTimer();
      }
      
      $scope.startTimer();
      
      $window.onbeforeunload = function (event) {
    	  if ($scope.dirtyCheckvelocity) {
			apiServices.ajaxSaveVelocityRating($scope.velocityRating);
			var event = event || window.event;
			if (event) {
				event.returnValue = 'Are you sure you want to close the page?';
			}
			return event.returnValue;
		} else {
			event.preventDefault();
		}
      };
      
      $scope.$on('$destroy', function(e){
    	  $window.onbeforeunload = undefined;
      });

}])

.controller('submitSurveyPopupController',['$scope','$http','$location','api-services','$uibModalInstance', function($scope, $http, $location, apiServices, $uibModalInstance) {
	$scope.modelTitle = "Submit Survey";
	$scope.submitSurveyPopUp = function() {
		$uibModalInstance.close(true);
	}
	$scope.closeSubmitSurveyPopup = function() {
		$uibModalInstance.dismiss('cancel');
	};
}])
.controller('notificationTimerModalController',['$scope','$uibModalInstance','$location','api-services',function($scope, $uibModalInstance, $location,apiServices) {
			$scope.renewMySession = function() {
				if(document.getElementById('LikeVsSeve') != null) {
					angular.element(document.getElementById('LikeVsSeve')).scope().resetTimer();
				}
				if(document.getElementById('RiskMapCtrlDiv') != null) {	
					angular.element(document.getElementById('RiskMapCtrlDiv')).scope().resetTimer();
				}
				
				if(document.getElementById('velocityRatingCtrl') != null) {	
					angular.element(document.getElementById('velocityRatingCtrl')).scope().resetTimer();
				}
				$uibModalInstance.dismiss('cancel');
			};
			$scope.closenotificationTimerModalPopup = function() {
				$uibModalInstance.dismiss('cancel');
			};
		}])


.controller('feedbackCtrl', [ '$scope', "$routeParams", "$uibModal", "$http", "$location","api-services", "$window" ,"$rootScope", function($scope, $routeParams, $uibModal, $http, $location,apiServices , $window, $rootScope) {
      $scope.user = apiServices.getObject("email");
      $scope.participantName = apiServices.getObject("participantName");
      $scope.isFeedbackSubmitted = false;
      $scope.engagement = apiServices.getObject("selectedEngagement");
      
      $scope.killSessionNotificationTimer = function (){
  		 if(document.getElementById('LikeVsSeve') != null) {
  				angular.element(document.getElementById('LikeVsSeve')).scope().stopNotificationTimer();
  			}
  			if(document.getElementById('RiskMapCtrlDiv') != null) {	
  				angular.element(document.getElementById('RiskMapCtrlDiv')).scope().stopNotificationTimerRiskMap();
  			}
  			
  			if(document.getElementById('velocityRatingCtrl') != null) {	
  				angular.element(document.getElementById('velocityRatingCtrl')).scope().stopSessionExpiryNotificationTimer();
  			}
  	 	}
       
      $scope.killSessionNotificationTimer();
      
      apiServices.getEngagementById($location.search()['engageId']).success(function(data) {
            
            apiServices.updateSelectedEngagement($scope,data);
      }).error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
      $scope.feedbackind=-1;
      if($scope.engagement.feedbacks){
            $scope.feedbackind=$scope.engagement.feedbacks.length;
            var ind=0;
            $scope.engagement.feedbacks.forEach(function(feedback){
                  if($scope.user==feedback.emailId){
                        $scope.feedbackind=ind;
                  }
                  ind++;
            });
      }else{
            $scope.engagement.feedbacks=[];
            $scope.feedbackind=0;
      }
      $scope.feedback=$scope.engagement.feedbacks[$scope.feedbackind];
      if(!$scope.feedback){
            $scope.feedback={};
      }
      $scope.saveFeedback = function(){
            $scope.dirtyCheckfeedback = false;
            if ($scope.completed == "COMPLETE" || $scope.closed) {
                  apiServices.navigateTo("/complete");
            } else {
                  if ($scope.engagement.feedbacks == null) {
                        $scope.engagement.feedbacks = [];
                  }
                  $scope.feedback['feedbackId']= '';
                  $scope.feedback['feedbackSurveyId'] = $scope.engagement.survey.surveyid; 
                  $scope.feedback['emailId'] = $scope.engagement.survey.participant.emailId;
                  $scope.feedback['name'] = $scope.participantName;
                  $scope.feedback['lName'] = $scope.engagement.survey.participant.lname;
                  $scope.feedback['ftime'] = new Date().getTime();
                  $scope.feedback['comments'] = $scope.comments;
                  $scope.feedback['answer'] = $scope.answer;
                  $rootScope.feedbackCompleted = true;
                  $http.post('../api/dra/participant/saveFeedback', angular.toJson($scope.feedback) ).success(function(data) {
                      apiServices.navigateTo("/complete");
                  }).error(function(d,s,h,c){apiServices.handleError(d,s,h,c);});
            }
      }
      
      $window.onbeforeunload = function (event) {
    	  $scope.dirtyCheckfeedback = $scope.myForm.commentOne.$dirty || $scope.myForm.commentTwo.$dirty ? true : false ;
    	  if($scope.dirtyCheckfeedback){
    		  var event = event || window.event;
    		  if (event) {
            	  event.returnValue = 'Are you sure you want to close the page?';
              }
              
              return event.returnValue;
    	  } else {
    		  event.preventDefault();
    	  }
      };
      $scope.$on('$destroy', function(e){
    	  $window.onbeforeunload = undefined;
       });
}])

;