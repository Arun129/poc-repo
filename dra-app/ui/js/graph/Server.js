define(
		[ "models", "chai", "underscore", "application", "spin" ],
		function(models, chai, _, app, Spinner) {
			var scope = {};

			function ResourceRequest() {
				this.setDraPath();
				
				this.path = "/";

				this.context = new models.Context();
				this.url = null;
				this.success = this.doSuccess.bind(this);
				this.successFn = this.log.bind("Running success function");
				this.fail = this.doFail.bind(this);
				this.processData = true;
				this.contentType = "application/json";
				this.type = "GET";
				this.cache = false;
				this.dataType = "json";
				this.queryString = "";
				this.transform = null;
				this.failFn = this.log.bind("Running fail function");
				
				this.resetURI();
			}
			
			ResourceRequest.prototype.setDraPath = function (){
				this.setRestPath(window.location.pathname.replace("participant.html","../api/dra"));
			}
			
			ResourceRequest.prototype.setBpmPath = function (){
				this.setRestPath("/camunda/api/engine/engine/default");
			}

			
			ResourceRequest.prototype.run = function() {
				spinner.spin();

				$.ajax(this).fail(this.fail);
			}

			ResourceRequest.prototype.log = function (message){
					console.log(message);
			}
			
			ResourceRequest.prototype.setRestPath = function (restPath){
				this.baseURL = window.location.protocol + "//"
				+ window.location.host +  restPath;
			}
			
			ResourceRequest.prototype.doSuccess = function (data){
				spinner.stop();

				if (this.transform){
						var result = this.transform(data);
						return this.successFn(result);
					}
				
				return this.successFn(data);
			}
			
			ResourceRequest.prototype.setSuccess = function (success){
				this.successFn = success;
			}
			
			ResourceRequest.prototype.setFail = function (fail){
				this.failFn = fail;
			}
			
			ResourceRequest.prototype.setTransform = function (transform){
				this.transform = transform;
			}
			
			ResourceRequest.prototype.setContext = function (context){
				this.context = context;

				if (context.organisation){
					this.addParameter("organisation", context.organisation.name);
				}
				if (context.model){
					this.addParameter("modelName", context.modelName);
				}
				if (context.group){
					this.addParameter("groupName", context.group);
				}
				
				this.resetURI();

			}
			
			ResourceRequest.prototype.setPath = function (path){
				this.path = path;
				this.resetURI();
			}
			
			ResourceRequest.prototype.addParameter = function (name, value){
				var encodedValue = encodeURIComponent(value);
				
				this.queryString = this.queryString == "" ? "?" : this.queryString + "&";

				this.queryString += name + "=" + encodedValue;
			
				this.resetURI();
				
			}
			
			
			ResourceRequest.prototype.resetURI = function (){
				this.url = encodeURI(this.baseURL + this.path) + this.queryString;
			}
			
			ResourceRequest.prototype.doFail = function(xhr, textStatus, error){
				spinner.stop();

				var err = xhr.responseJSON && xhr.responseJSON.message ?
					xhr.responseJSON.message :
						textStatus + ", " + error + " " + this.type + " " + this.url;
				this.failFn(err);

			}
			
			function GetRequest() {
				ResourceRequest.call(this);
			}

			GetRequest.prototype = Object.create(ResourceRequest.prototype);
			GetRequest.prototype.constructor = GetRequest;
			scope.GetRequest = GetRequest;
			
			GetRequest.prototype.makeMeasurementSet = function (model, metricSet, json) {
				var ms = new models.MeasurementSet(json.uri, model, metricSet);
				this.addMeasurements(json.measurements, ms);
				return ms;
			}
			
			GetRequest.prototype.makeMetricBounds = function (json, metricSet){
				if (!json){
					return null;
				}
				var metricBounds = d3.map();
				json.forEach(function (b) {
					var mb = new models.MetricBound(metricSet.getMetric(b.metricName), 
							this.makeInterval(b.interval), b.numberOfIntervals);
					metricBounds.set(b.metricName, mb);
				}, this);
				
				return metricBounds;
			}

			GetRequest.prototype.makeMetricSet = function (metrics) {
				var ms = new models.MetricSet();
				
				var r = this;

				metrics
						.forEach(function(b) {
							var type = b.type;
							var metric = null;
							
							var interval = r.makeInterval(b.interval);


							if (type == "ModelMetric") {
								metric = new models.ModelMetric(b.name,
										interval);
							}

							if (type == "RiskMetric") {
								metric = new models.RiskMetric(b.name,
										interval);
							}

							if (type == "LinkMetric") {
								metric = new models.LinkMetric(b.name,
										interval);
							}
							
							if (type == "EventMetric") {
								metric = new models.EventMetric(b.name,
										interval);
							}
							
							ms.add(metric);
						});
				
				return ms;

			}
			
			GetRequest.prototype.makeInterval = function (json){
				var map = {
						"open" : models.Open,
						"closed" : models.Closed,
						"leftClosedRightOpen" : models.LeftClosedRightOpen,
						"leftOpenRightClosed" : models.LeftOpenRightClosed,
						"leftOpen" : models.LeftOpen,
						"leftClosed" : models.LeftClosed,
						"rightOpen" : models.RightOpen,
						"rightClosed" : models.RightClosed,
						"unbounded" : models.Unbounded
					};

				var rv = json.rightEndpoint;
				var lv = json.leftEndpoint;

				var interval = Object
						.create(map[json.type].prototype);

				interval.rightEndpoint = rv == "null" ? null
						: parseFloat(rv);
				interval.leftEndpoint = lv == "null" ? null
						: parseFloat(lv);
				
				return interval;
				
			}

			GetRequest.prototype.makeTaskDetails = function (d){
				if (_.isEmpty(d)){
					return null;
				}
				return {
					model: this.makeModel(d.model),
					organisation: this.makeOrganisation(d.organisation),
					engagement: this.makeEngagement(d.engagement),
					groups: this.makeGroups(d.groups),
					user: this.makeUser(d.user),
					qmodel: this.makeQModel(d.qmodel, app.App.getMetricSet()),
					taskType: d.taskType,
					metricBounds: this.makeMetricBounds(d.metricBounds, app.App.getMetricSet()),
					organisations: this.makeOrganisations(d.organisations),
					engagementNames: d.engagementNames,
					userNames: d.userNames,
					collectLikelihood: d.collectLikelihood,
					collectSeverity: d.collectSeverity,
					collectVelocity: d.collectVelocity,
					collectConnections: d.collectConnections,
					taskId:d.taskId,
					isRiskMap: d.riskMap
				};
				
			}
			
			GetRequest.prototype.makeQModel = function (d, ms){
				if (!d){
					return null;
				}
				var m = this.makeModel(d.model);
				var ms = this.makeMeasurementSet(m, ms, d.measurementSet);
				var qm = new models.QuantifiedModel(d.uri, m, ms);
				qm.weightThreshold = d.weightThreshold;
				return qm;
			}
			
			GetRequest.prototype.makeParticipants = function (d){
				if (!d){
					return null;
				}
				
				var participants = [];
				d.forEach(function (p){
					var np = {
							user: this.makeUser(p.user),
							engagementId: p.engagementId,
							division: p.division
						
					};
					participants.push(np);
				}, this);
				
				return participants;
			}
			
			GetRequest.prototype.makeUsers = function (d){
				if (!d){
					return null;
				}
				d.forEach(function(u){
					this.makeUser(u);
				}, this);
			}
			
			GetRequest.prototype.makeUser = function (d){
				if (!d){
					return null;
				}
				
				var u = new models.User(d.uri, d.name);
				
				return u;
				
			}
			GetRequest.prototype.addMeasurements = function (measurements, ms) {
				chai.assert.instanceOf(ms, models.MeasurementSet);
				
				if (measurements.length == 0){
					return;
				}

				var model = ms.getModel();

				measurements.forEach(function(b) {
					var type = b.subject.type;
					var metric = null;
					var value = parseFloat(b.measuredValue);
					var subject = null;

					if (type == "model") {
						subject = model;
					}

					if (type == "risk") {
						subject = model.getRisk(b.subject.uri);
					}

					if (type == "link") {

						var r1 = model.getRisk(b.subject.source);
						var r2 = model.getRisk(b.subject.target);
						subject = new models.RiskLink(b.subject.uri, r1, r2);
					}
					var metric = ms.getMetricSet().getMetric(b.metricName);
					ms.setMetric(metric, subject, value);

				});
			}
			GetRequest.prototype.makeClusters = function(json) {
				var cluster = [];
				var i = 0;
				json.forEach(function(group) {
					var rg = new models.RiskGroup("Group " + i);
					cluster.push(rg);
					i++;

					group.risks.forEach(function(name) {
						var risk = new models.Risk(name, name);
						rg.addRisk(risk);
					});
				});

				var g = new models.RiskGroup(clusterName);
				g.addGroups(cluster);
				
				return g;
			}
	
			GetRequest.prototype.makeModel = function (json) {
				if (!json){
					return null;
				}
				if (json.model == "none"){
					return null;
				}
				var model = new models.RiskNetwork(json.uri, json.name);

				json.risks.forEach(function (r){
					model.addRisk(new models.Risk(r.uri, r.name));
				});
				
				json.links.forEach(function(l) {
					model.addLink(l.uri, l.source, l.target);
				});

				return model;
			}


			GetRequest.prototype.makeBowTie = function (json){

				var risk = new models.Risk(json.risk.uri, json.risk.name);
				var bt = new models.BowTie(risk);

				json.causes.forEach(function(cause) {
					var ae = cause.type == "Risk" ? new models.Risk(cause.uri,
							cause.name)
							: new models.Event(cause.uri, cause.name);
					ae.addComments(cause.definitions);
					bt.addCause(ae);
				});

				json.impacts.forEach(function(impact) {
					var ae = impact.type == "Risk" ? new models.Risk(impact.uri,
							impact.name) : new models.Event(impact.uri,
							impact.name);
					ae.addComments(impact.definitions);
					bt.addImpact(ae);
				});
				
				return bt;
			}
				
			GetRequest.prototype.makeGroups = function (json){
				if (!json){
					return null;
				}
				var groups = [];
				
				json.forEach(function (jg){
					var g = this.makeGroup(jg);
					groups.push(g);
				}, this);
				
				return groups;
			}
			GetRequest.prototype.makeGroup = function (json) {
				var group = new models.RiskGroup(json.name);

				json.risks.forEach(function(r) {
					group.addRisk(new models.Risk(r.uri, r.name));
				});

				json.groups.forEach(function(g) {
					var ng = this.makeGroup(g);
					group.addGroup(ng);
				}, this);

				return group;
			}
			
			
			GetRequest.prototype.makeOrganisations = function (json){
				var orgs = [];
				json.forEach(function (jorg){
					var org = this.makeOrganisation(jorg);
					orgs.push(org);
				}, this);
				
				return orgs;
			}

			GetRequest.prototype.makeOrganisation = function (json){
				if (!json){
					return null;
				}
				var org = new models.Organisation(json.uri, json.name);
				org.logoURI = json.logo;
				
				return org;
			}
			
			GetRequest.prototype.makeOrganisations = function (json){
				if (!json){
					return null;
				}
				
				var organisations = [];
				json.forEach(function (org){
					organisations.push(this.makeOrganisation(org));
				}, this);
				
				return organisations;
				
			}
			GetRequest.prototype.makeEngagement = function (json){
				if (!json){
					return null;
				}
				var e = new models.Engagement(json.uri, json.name);
				
				return e;
			}
			
			function UpdateRequest (){
				ResourceRequest.call(this);

				this.setData({});
				this.processData = false;

			}
			
			UpdateRequest.prototype = Object.create(ResourceRequest.prototype);
			UpdateRequest.prototype.constructor = UpdateRequest;
			
			UpdateRequest.prototype.setData = function (data){
				this.data = JSON.stringify(data);
			}


			function PutRequest() {
				UpdateRequest.call(this);

				this.type = "PUT";
			}

			PutRequest.prototype = Object.create(UpdateRequest.prototype);
			PutRequest.prototype.constructor = PutRequest;
			scope.PutRequest = PutRequest;
		
			function PostRequest() {
				UpdateRequest.call(this);

				this.type = "POST";
				this.data = {};
			}

			PostRequest.prototype = Object.create(UpdateRequest.prototype);
			PostRequest.prototype.constructor = PostRequest;
			scope.PostRequest = PostRequest;

			function GlobalSpinner() {
				var opts = {
					lines : 13, // The number of lines to draw
					length : 20, // The length of each line
					width : 10, // The line thickness
					radius : 30, // The radius of the inner circle
					corners : 1, // Corner roundness (0..1)
					rotate : 0, // The rotation offset
					direction : 1, // 1: clockwise, -1: counterclockwise
					color : 'black', // #rgb or #rrggbb or array of colors
					speed : 1, // Rounds per second
					trail : 60, // Afterglow percentage
					shadow : false, // Whether to render a shadow
					hwaccel : false, // Whether to use hardware acceleration
					className : 'spinner', // The CSS class to assign to the
					// spinner
					zIndex : 2e9, // The z-index (defaults to 2000000000)
					top : '50%', // Top position relative to parent
					left : '50%' // Left position relative to parent
				};
				this.spinner = new Spinner(opts);
			}
			GlobalSpinner.prototype.spin = function() {
				this.spinner.spin(d3.select("#spinner").node());
			}

			GlobalSpinner.prototype.stop = function() {
				this.spinner.stop();
			}
			var spinner = new GlobalSpinner();

			function Context (){
				this.organisation = null;
				this.model = null;
				this.group = null;
			}
			scope.Context = Context;


			// Module return
			return scope;

		});

