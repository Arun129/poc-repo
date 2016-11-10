var app = angular.module('viewRiskDetailsApp', []);
		app.controller('viewRiskDetailsCtrl', function($scope) {
			$scope.engagement = JSON.parse(localStorage.getItem("selectedEngagement"));
			$scope.risks = $scope.engagement.survey.participant.risks;
			$scope.downloadPdf = function(){
				  html2canvas(document.getElementById('viewriskdetails'), {
		              onrendered: function (canvas) {
		                  var data = canvas.toDataURL();
		                  var docDefinition = {
		                      content: [{
		                          image: data,
		                          width: 500,
		                      }]
		                  };
		                  pdfMake.createPdf(docDefinition).download("Risk_Details.pdf");;
		              }
		          });
			}
		});
		