/**
 * 
 */
define(
		[ "models", "chai" ],
		function(models, chai) {
			
			var scope = {};
			function Application (){
				this.context = null;
				this.model = null;
				this.group = null;
				this.groups = [];
				this.risk = null;
				this.event = null;
				this.metricSet = null;
				this.metricBounds = null;
				this.filteredModel = null;
				this.fullFilteredModel = null;
				this.baseThreshold = 0.5;
				this.engagement = null;
				this.user = null;
				this.listeners = d3.map();
				this.listeners.set("model", []);
				this.listeners.set("event", []);
				this.listeners.set("risk", []);
				this.listeners.set("group", []);
				this.listeners.set("organisation", []);
				this.listeners.set("filteredModel", []);
				this.listeners.set("fullyFilteredModel", []);
				this.listeners.set("groups", []);
				
			};
			scope.Application = Application;
	
			Application.prototype.registerListener = function (type, listener){
				var listeners = this.listeners.get(type);
				
				if (listeners.indexOf(listener) >= 0){
					return;
				}
				listeners.push(listener);
			}
			
			Application.prototype.deregisterListener = function (type, listener){
				var ls = this.listeners.get(type);
				var i = ls.indexOf(listener);
				if (i >= 0){
					ls.splice(i, 1);
				}
			}
			
		
			Application.prototype.getModel = function(){
				return this.model;
			}
			
			
			Application.prototype.getGroup = function (){
				return this.group;
			}
			
			Application.prototype.setModel = function (model){
				chai.assert.instanceOf(model, models.QuantifiedModel);
				
				this.listeners.get("model").forEach(function (l){
					l.modelChanged(model);
				});
				
				this.model = model;
				this.setRisk(null);
			}
			
			Application.prototype.setFilteredModel = function (filteredModel){
				this.listeners.get("filteredModel").forEach(function (l){
					l.modelChanged(filteredModel);
				});
				
				this.filteredModel = filteredModel;
				var ffm = filteredModel.filterSingletons();
				this.setFullyFilteredModel(ffm);
			}
			
			Application.prototype.setFullyFilteredModel = function (model){
				this.listeners.get("fullyFilteredModel").forEach(function (l){
					l.modelChanged(model);
				});
				
				this.fullyfilteredModel = model;

			}

			Application.prototype.getMetricSet = function (){
				return this.metricSet;
			}

			Application.prototype.setMetricSet = function (metricSet){
				this.metricSet = metricSet;
			}

			
			Application.prototype.getEngagement = function (){
				return this.engagement;
			}

			Application.prototype.setEngagement = function (engagement){
				this.engagement = engagement;
			}
			
			Application.prototype.getGroups = function (){
				return this.groups;
			}
			Application.prototype.setGroups = function(groups){
				this.groups = groups;
				this.listeners.get("groups").forEach(function (l){
					l.groupsChanged(groups);
				});
				
				if (!groups){
					return;
				}
				this.groups.forEach(function(g){
					if (g.name == "Default"){
						this.setGroup(g);
						return;
					}
				}, this);
			}
						
			Application.prototype.setGroup = function (group){
				this.group = group;
				
				this.listeners.get("group").forEach(function (l){
					l.groupChanged(group);
				});
			}
			
			Application.prototype.setRisk = function (risk){
				this.risk = risk;
				this.listeners.get("risk").forEach(function(l){
					l.riskChanged(risk);
				});
				
				this.setEvent(null);
			}
			
			Application.prototype.getRisk = function (){
				return this.risk;
			}
			
			Application.prototype.setEvent = function (event){
				this.event = event;
				this.listeners.get("event").forEach(function(l){
					l.eventChanged(event);
				});
			}
			
			Application.prototype.getEvent = function (){
				return this.event;
			}
			
			Application.prototype.setOrganisation = function (organisation){
				this.organisation = organisation;
				this.listeners.get("organisation").forEach(function(l){
					l.organisationChanged(organisation);
				});
			}
			
			Application.prototype.getOrganisation = function (){
				return this.organisation;
			}
			
			
			Application.prototype.getUser = function (){
				return this.user;
			}

			Application.prototype.setUser = function (user){
				this.user = user;
			}
			
			Application.prototype.getMetricBounds = function (){
				return this.metricBounds;
			}
			Application.prototype.setMetricBounds = function (metricBounds){
				this.metricBounds = metricBounds;
			}
			
	

			scope.App = new Application();
			return scope;
			
		});