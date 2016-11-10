	define(
		[ "application", "server", "controllers", "chartControls", "views", "controls2D", "models", "charts"],
		function(app, svr, cs, cc, views, c2D, models, cv) {
			var scope = {};		

			function Task (details) {
				this.taskId = details.taskId;
				this.taskType = details.taskType;
				this.engagement = details.engagement;
				this.user = details.user;
				this.taskName = "Unknown Task";
				this.isRiskMap = details.isRiskMap;
				if (!this.isRiskMap) {
					this.isRiskMap = details.riskMap;
				}
				if (this.engagement != null && this.engagement.id != null) {
					this.engagement.id = this.engagement.id.replace("urn:uuid:", "");
				}
				this.participantEmail = details.participantEmail;
				this.participantId = details.participantId;
			}
			
			Task.prototype = Object.create(cs.Control.prototype);
			Task.prototype.constructor = Task;

			Task.prototype.save = function (continuation){
				if (continuation){
					continuation();
					return;
				}
				this.exit();
			}
			
			Task.prototype.complete = function (continuation){
				if (continuation){
					this.save(contination);
					return;
				}
				this.save(this.sendComplete.bind(this, this.exit.bind(this)));
			}

			Task.prototype.exit = function (){
				window.location.href = this.callbackUrl;
			}

			
			Task.prototype.getTaskName = function (){
				return this.taskName;
			}
			
			Task.prototype.setView = function (){

				d3.select(".dra-task").text(this.getTaskName());
				if (this.user){
					d3.select(".userEngagement .username .text").text(this.user.name);
				}
				
				if (this.engagement){
					d3.select(".engagement .text").text(this.engagement.name);	
				}
			}
						
			Task.prototype.setControllers = function (){
				d3.select(".task-cancel").on("click", this.exit.bind(this));
				d3.select(".task-save").on("click", this.save.bind(this));
				d3.select(".task-complete").on("click", this.complete.bind(this));
			}
			
			Task.prototype.setApplication = function (){
				app.App.setEngagement(this.engagement);
				app.App.setUser(this.user);
			}
			
			Task.prototype.run = function (){
				this.setView();
				this.setControllers();
				this.setApplication();

			}
			
			Task.prototype.makeButton = function (parent, text, aClass){
				var btn = parent.append("button").attr("type", "button").classed("btn-primary", true).classed("btn", true).classed(aClass, true);
				if (text){
					btn.text(text);
				}

			}
			Task.prototype.makeButtonGroup = function (parent){
				var bg = parent.append("div").classed("btn-group", true).classed("btn-group-sm", true);
				return bg;
			}
			
			Task.prototype.sendComplete = function (sfn){
				var q = new svr.PutRequest();
				q.addParameter("taskId", this.taskId);
				q.setPath("/tasks/complete");
				q.setSuccess(sfn);
				q.setFail(this.fail.bind(this));
				q.setData({});
				q.run();
			}
			
			Task.prototype.fail = function fail(error){
				var m = new views.Modal();
				m.d3().select(".modal-title").text("Error");
				m.d3().select(".modal-body").text(error);
				m.show();
			}
			Task.prototype.armButtons = function (){
			}
						
			function EditModel (details){
				Task.call(this, details);
								
				this.organisation = details.organisation;
				this.engagement = details.engagement;
				this.qmodel = details.qmodel;
				this.groups = details.groups;
				this.metricBounds = details.metricBounds;
			}
			EditModel.prototype = Object.create(Task.prototype);
			EditModel.prototype.constructor = EditModel;

			EditModel.prototype.setControllers = function (){
				Task.prototype.setControllers.call(this);
				
				if (this.isRiskMap) {
					var view = this.nexusView;
					//d3.select("#chartsPanel .nav").on("click", view.show.bind(view));
					this.nexusPanelControl = new cs.NexusPanelControl(null);
					this.nexusPanelControl.setView(view);

					//var zc = new cs.ZoomControl(this.nexusPanelControl, "#nexus svg", "#nexus svg g");
					//zc.setView(view.getModelView());

				} else {
					var view = this.chartView;
					d3.select("#chartsPanel").style("top", "-100px");
					//d3.select("#nexusPanel .nav").on("click", view.show.bind(view));
					this.chartPanelControl = new cc.ChartPanelControl("CC", null, ["Likelihood", "Severity"]);
					this.chartPanelControl.setView(view);

				}
			}
			
			
			EditModel.prototype.setView = function (){
				Task.prototype.setView.call(this);
				if (this.isRiskMap) {
					this.nexusView = new views.NexusPanelView();
					this.nexusView.setApplicationModel(app.App);
					
					var width = d3.select("#content").node().offsetWidth;
					var height = 800;
					this.nexusView.setSize(width, height);
					this.nexusView.getModelView().setViewportSize(width, height);
					this.nexusView.getModelView().setDimensions(width, height);
					this.nexusView.show();
				} else {
					// TODO: Remove Velocity after demo in below line
					var metricNames = ["Likelihood", "Severity"];
					this.chartView = new cv.ChartsPanelView();
					this.chartView.setApplicationModel(app.App);
					this.chartView.show();
				}
					
				/*var tb = this.chartView.d3().append("div").classed("task-buttons", true);
				tb.append("button").attr("class", "btn btn-sm btn-default nav").attr("type", "button").text("Previous");
				tb.append("button").attr("class", "btn btn-sm btn-default task-cancel").attr("type", "button").text("Cancel");
				tb.append("button").attr("class", "btn btn-sm btn-default task-save").attr("type", "button").text("Save");
				tb.append("button").attr("class", "btn btn-sm btn-default task-complete").attr("type", "button").text("Complete");
				
				var tb1 = this.nexusView.d3().append("div").classed("task-buttons", true);
				tb1.append("button").attr("class", "btn btn-sm btn-default nav").attr("type", "button").text("Next");*/
			}

			EditModel.prototype.setApplication = function (){

				app.App.setGroups(this.groups);
				if (this.groups.length > 0){
					app.App.setGroup(this.groups[0]);
				}
				
				app.App.setMetricBounds(this.metricBounds);
				app.App.setOrganisation(this.organisation);
				app.App.setEngagement(this.engagement);
				app.App.setModel(this.qmodel);
			}
						
			EditModel.prototype.getSaveQuery = function (){
				var data = app.App.getModel().toJson();
				var q = new svr.PutRequest();
				q.addParameter("engagement", this.engagement.name);
				q.addParameter("participantEmail", this.participantEmail);
				q.addParameter("participantId", this.participantId);
				q.addParameter("engagementId", this.engagement.id); // TODO:Engagement Id
				q.setData(data);
				
				return q;
			}
			
			EditModel.prototype.save = function (continuation){
				var q = this.getSaveQuery();
				q.setSuccess(Task.prototype.save.bind(this, continuation));
				q.setFail(this.fail.bind(this));
				q.run();
			}
			
			function EditBaseModel (details){
				EditModel.call(this, details);
				this.taskName = "Edit Initial Model";
				
				// Shuffle the risks before the risk model is provided to the user.
//				var isSavedSurvey = JSON.parse(localStorage.getItem("isSavedSurvey"));
//				 if (!isSavedSurvey) {
//					this.qmodel.getBaseModel().shuffle();
//				}
			}
			EditBaseModel.prototype = Object.create(EditModel.prototype);
			EditBaseModel.prototype.constructor = EditBaseModel;
			
			EditBaseModel.prototype.getSaveQuery = function (){
				var q = EditModel.prototype.getSaveQuery.call(this);
				q.setPath("/participant/userModel");
				// TODO: to save userModel, to commented base model
//				q.setPath("/engagements/baseModel");
				return q;
			}
			
			EditBaseModel.prototype.save = function (continuation){
				var q = this.getSaveQuery();
				q.setSuccess(this.saveGroup.bind(this, continuation));
				q.setFail(this.fail.bind(this));
//				q.run();
			}
			
			EditBaseModel.prototype.saveGroup = function (continuation){
				var g = app.App.getGroup();
				if (!g){
					Task.prototype.save.call(this);
				}
//				var q = new svr.PutRequest();
//				q.setPath("/particpant/group");
//				q.addParameter("engagement", app.App.getEngagement().id)
//				q.setData(g.toJson());
//				q.setSuccess(Task.prototype.save.bind(this, continuation));
//				q.setFail(this.fail.bind(this));
//				q.run();
			}

						
			function EditAggregateModel (taskId, details){
				EditModel.call(this, taskId, details);
			}
			EditAggregateModel.prototype = Object.create(EditModel.prototype);
			EditAggregateModel.prototype.constructor = EditAggregateModel;
			
			EditAggregateModel.prototype.getSaveQuery = function (){
				var q = EditModel.prototype.getSaveQuery.call(this);
				q.setPath("/engagements/aggregateModel");
				return q;
			}
			
			function EditUserModel (details){
				EditModel.call(this, details);
				this.user = details.user;
				this.taskName = "Edit Risk Model";
				
				this.collectLikelihood = details.collectLikelihood;
				this.collectSeverity = details.collectSeverity;
				this.collectVelocity = details.collectVelocity;
				this.collectConnections = details.collectConnections;

			}
			EditUserModel.prototype = Object.create(EditModel.prototype);
			EditUserModel.prototype.constructor = EditUserModel;
			
			EditUserModel.prototype.getSaveQuery = function (){
				var q = EditModel.prototype.getSaveQuery.call(this);
				q.setPath("/participant/userModel");
				//q.addParameter("userId", app.App.getUser().id);
				return q;
			}
			EditUserModel.prototype.setApplication = function (){
				EditModel.prototype.setApplication.call(this);
				app.App.setUser(this.user);
			}
			
			EditUserModel.prototype.setView = function (){
				Task.prototype.setView.call(this);
				
				var metricNames = ["Likelihood", "Severity", "Velocity"];
				var v = null;

				if (this.collectVelocity || this.collectLikelihood || this.collectSeverity){
						this.chartView = new cv.ChartsPanelView();

						var tb = this.chartView.d3().append("div").classed("task-buttons", true);
						tb.append("button").attr("class", "btn btn-sm btn-default task-cancel").attr("type", "button").text("Cancel");
						tb.append("button").attr("class", "btn btn-sm btn-default task-save").attr("type", "button").text("Save");
						tb.append("button").attr("class", "btn btn-sm btn-default task-complete").attr("type", "button").text("Complete");

						var cp = this.chartPanelControl;
						var mc = cp.getModelController();
						var fixedMetrics = [];
						if (!this.collectLikelihood){
							fixedMetrics.push("Likelihood");
						}
						if (!this.collectSeverity){
							fixedMetrics.push("Severity");
						}
						if (!this.collectVelocity){
							fixedMetrics.push("Velocity");
						}

						mc.fixedMetrics = fixedMetrics;
						
						v = this.chartView;
				}
				
				if (this.collectConnections){
					this.nexusView = new views.NexusPanelView();

					this.nexusView.d3().select(".editRisk").style("display", "none");
					this.nexusView.d3().append("div").classed("task-buttons", true);

					v = this.nexusView;
					if (this.chartView){

						this.chartView.d3().select(".task-buttons").insert("button", ":first-child").attr("class", "btn btn-sm btn-default nav").attr("type", "button").text("Previous");
						this.nexusView.d3().select(".task-buttons").append("button").attr("class", "btn btn-sm btn-default nav").attr("type", "button").text("Next");

					} else {
						tb.append("button").attr("class", "btn btn-sm btn-default task-cancel").attr("type", "button").text("Cancel");
						tb.append("button").attr("class", "btn btn-sm btn-default task-save").attr("type", "button").text("Save");
						tb.append("button").attr("class", "btn btn-sm btn-default task-complete").attr("type", "button").text("Complete");
					}
				}
						
				d3.select(".risk-detail-view").classed("editable", false);
				v.show();
			}
			

			function TaskRunner (callbackUrl, tId, isRkMap, engName, partEmail, partId) {
				this.callbackUrl = callbackUrl;
				this.map = d3.map();
				this.map.set("EditBaseModel", EditBaseModel);
				this.map.set("EditAggregateModel", EditAggregateModel);
				this.map.set("EditUserModel", EditUserModel);
				this.taskId = tId;
				this.isRiskMap = isRkMap;
				this.engagementName = engName;
				this.task = null;
				this.participantEmail = partEmail;
				this.participantId = partId;
				this.loadMetricSet(this.setMetricSet.bind(this));
			}
			scope.TaskRunner = TaskRunner;
			
									
			TaskRunner.prototype.runDetailedTask = function (details){
				if (details ==  null) {
					this.displayBaseModel.call(this, this.taskId, this.isRiskMap, this.engagementName);
					return;
				}
				var fn = this.map.get(details.taskType);
				if (!fn){
					return null;
				}

				details.participantEmail = this.participantEmail;
				details.participantId = this.participantId;
				var task = new fn(details);
				task.callbackUrl = this.callbackUrl;
				this.task = task;
				task.run();
			}
			
			TaskRunner.prototype.fail = function (){
				window.location.href = this.callbackUrl;
			}
			
			TaskRunner.prototype.loadMetricSet = function (continuation){
				var rq = new svr.GetRequest();
				rq.setPath("/participant/metrics");
				rq.setSuccess(continuation);
				rq.setTransform(rq.makeMetricSet);
				rq.run();
			}
			
			TaskRunner.prototype.setMetricSet = function (ms){
				app.App.setMetricSet(ms);
			}

			TaskRunner.prototype.runTask = function (taskId, isRiskMap, engagementName, engagement) {
				if (!taskId){
					return;
				}

				var getExistingParticipantModelReq = new svr.GetRequest();
				getExistingParticipantModelReq.setPath("/participant/userModel");
				getExistingParticipantModelReq.addParameter("engagement", engagement);
				getExistingParticipantModelReq.addParameter("isRiskMap", isRiskMap);
				getExistingParticipantModelReq.addParameter("participantId", this.participantId);
				getExistingParticipantModelReq.addParameter("participantEmail", this.participantEmail);
				getExistingParticipantModelReq.setSuccess(this.runDetailedTask.bind(this));
				getExistingParticipantModelReq.setFail(this.displayBaseModel.bind(this, taskId, isRiskMap, engagementName));
				getExistingParticipantModelReq.setTransform(getExistingParticipantModelReq.makeTaskDetails.bind(getExistingParticipantModelReq));
				getExistingParticipantModelReq.run();
			}
			
			TaskRunner.prototype.displayBaseModel = function (taskId, isRiskMap, engagementName) {
				var getBaseModelReq = new svr.GetRequest();
				getBaseModelReq.setPath("/participant/details");
				getBaseModelReq.addParameter("id", taskId);
				getBaseModelReq.addParameter("isRiskMap", isRiskMap);
				getBaseModelReq.addParameter("engagementName", engagementName);
				getBaseModelReq.setSuccess(this.runDetailedTask.bind(this));
				getBaseModelReq.setFail(this.fail.bind(this));
				getBaseModelReq.setTransform(getBaseModelReq.makeTaskDetails.bind(getBaseModelReq));
				getBaseModelReq.run();
			}

			TaskRunner.prototype.startEngagement = function (){
				
				var q = new svr.GetRequest();
				q.setPath("/engagements/new");
				q.setSuccess(this.runDetailedTask.bind(this));
				q.setFail(this.fail.bind(this));
				q.setTransform(q.makeTaskDetails.bind(q));
				q.run();		
				
			}

			return scope;
		});		
					
				
