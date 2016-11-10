/**
 * 
 */
/**
 * 
 */

define(
		[ "chai", "uuid", "underscore" ],
		function(chai, UUID, _) {

			var scope = {};

			function Context() {
				this.organisation = null;
			}
			scope.Context = Context;

			function Measureable() {

			}

			function AbstractEvent(id, name) {
				this.name = name;
				this.id = id ? id : UUID.create().toURN();
				this.comments = [];
			}
			AbstractEvent.prototype = Object.create(Measureable.prototype);
			AbstractEvent.prototype.constructor = AbstractEvent;
			scope.AbstractEvent = AbstractEvent;

			AbstractEvent.prototype.getName = function() {
				return this.name;
			}
			AbstractEvent.prototype.addComment = function(comment) {
				this.comments.push(comment);
			}

			AbstractEvent.prototype.addComments = function(comments) {
				comments.forEach(function(c) {
					this.comments.push(c);
				}, this);
			}
			
			AbstractEvent.prototype.toJson = function (){
				return {uri: this.id, name: this.name, definitions:this.comments.slice(0)};
			}

			AbstractEvent.prototype.getComments = function() {
				return this.comments;
			}

			function Event(id, name) {
				AbstractEvent.call(this, id, name);
			}

			Event.prototype = Object.create(AbstractEvent.prototype);
			Event.prototype.constructor = Event;
			
			Event.prototype.toJson = function (){
				var json = AbstractEvent.prototype.toJson.call(this);
				json.type = "Event";
			}
	

			function Risk(id, name) {
				AbstractEvent.call(this, id, name);
			}

			Risk.prototype = Object.create(AbstractEvent.prototype);
			Risk.prototype.constructor = Risk;

			Risk.prototype.getName = function() {
				return this.name;
			}
			
			Risk.prototype.getType = function (){
				return "Risk";
			}

			Risk.prototype.toJson = function (){
				var json = AbstractEvent.prototype.toJson.call(this);
				json.type = "Risk";
				return json;
			}
			scope.Risk = Risk;

			function BowTie(risk) {
				this.risk = risk;
				this.causes = [];
				this.impacts = [];
			}

			scope.BowTie = BowTie;

			BowTie.prototype.addCause = function(cause) {
				this.causes.push(cause);
			}

			BowTie.prototype.addImpact = function(impact) {
				this.impacts.push(impact);
			}

			BowTie.prototype.getRisk = function() {
				return this.risk;
			}


			BowTie.prototype.getCauses = function() {
				return this.causes;
			}

			BowTie.prototype.getImpacts = function() {
				return this.impacts;
			}

			BowTie.prototype.getCause = function(name) {
				for (var i = 0; i < this.causes.length; i++) {
					var cause = this.causes[i];
					if (cause.getName() === name) {
						return cause;
					}
				}

				return undefined;
			}

			function RiskLink(id, src, dest) {
				chai.assert.instanceOf(src, Risk);
				chai.assert.instanceOf(dest, Risk);
				this.src = src;
				this.dest = dest;
				this.id = id ? id : UUID.create().toURN();
			}

			RiskLink.prototype = Object.create(Measureable.prototype);
			RiskLink.prototype.constructor = RiskLink;

			RiskLink.prototype.toJson = function (){
				return {uri: this.id, source:this.src.id, target:this.dest.id, type:"riskLink"}
			}
			
			RiskLink.prototype.getType = function (){
				return "Link";
			}

			
			RiskLink.prototype.links = function (risk){
				return this.src.id == risk.id || this.dest.id == risk.id;
			}

			scope.RiskLink = RiskLink;

			function RiskGroup(name) {
				chai.assert.isString(name);
				this.name = name;
				this.risks = [];
				this.idToRiskMap = d3.map();
				this.groups = [];
				this.idToGroupMap = d3.map();
				this.nameToGroupMap = d3.map();

			}

			scope.RiskGroup = RiskGroup;

			RiskGroup.prototype.toJson = function (){
				var risks = [];
				this.risks.forEach (function (r){
					var jr = r.toJson();
					risks.push(jr);
				});
				
				var groups = [];
				this.groups.forEach(function (g){
					var jg = g.toJson();
					groups.push(jg);
				});
				return {name: this.name, risks: risks, groups:groups};
			}
			RiskGroup.prototype.addRisk = function(risk) {
				chai.assert.instanceOf(risk, Risk);

				if (this.idToRiskMap.get(risk.id)) {
					return;
				}

				this.risks.push(risk);
				this.idToRiskMap.set(risk.id, risk);

			}
			
			RiskGroup.prototype.removeRisk = function (id){
				var risk = this.idToRiskMap.get(id);
				if (!risk){
					return;
				}
				this.risks.splice(this.risks.indexOf(risk), 1);
				this.idToRiskMap.remove(id);
			}

			RiskGroup.prototype.filter = function(risks) {
				var rg = new RiskGroup(this.name);

				this.risks.forEach(function(r) {
					var rx = risks.getRisk(r.id);
					if (rx) {
						rg.addRisk(rx);
					}
				});

				this.groups.forEach(function(g) {
					var result = g.filter(risks);
					if (result)
						rg.addGroup(result);
				});

				return rg;
			}

			RiskGroup.prototype.getRisk = function(id) {
				var r = this.idToRiskMap.get(id);

				if (r)
					return r;

				for (var i = 0; i < this.groups.length; i++) {
					var g = this.groups[i];
					r = g.getRisk(id);
					if (r)
						return r;
				}

				return undefined;
			}

			RiskGroup.prototype.getGroupOfRisk = function(id) {
				if (this.idToRiskMap.get(id)) {
					return this;
				}

				var groups = this.groups;
				for (var i = 0; i < groups.length; i++) {
					var group = groups[i];
					var result = group.getGroupOfRisk(id);
					if (result) {
						return result;
					}
				}

				return undefined;
			}

			RiskGroup.prototype.getRiskGroupByName = function(name) {

				// TODO this should be recursive.
				var g = this.nameToGroupMap.get(name);

				if (typeof g == "undefined") {
					g = new RiskGroup(name);
					this.addGroup(g);
				}

				return g;
			}

			RiskGroup.prototype.addRisks = function(risks) {
				risks.forEach(function(r) {
					this.addRisk(r);
				}, this);
			}

			RiskGroup.prototype.addGroups = function(groups) {
				groups.forEach(function(g) {
					this.addGroup(g);
				}, this);
			}
			RiskGroup.prototype.addGroup = function(group) {
				chai.assert.instanceOf(group, RiskGroup);

				this.groups.push(group);
				this.nameToGroupMap.set(group.name, group);
			}
			RiskGroup.prototype.getName = function() {
				return this.name;
			}

			RiskGroup.prototype.getDirectRisks = function() {
				return this.risks;
			}

			RiskGroup.prototype.getRisks = function() {
				return this.getRisksHelper([]);
			}

			RiskGroup.prototype.getRisksHelper = function(risks) {
				this.risks.forEach(function(r) {
					risks.push(r);
				});

				this.groups.forEach(function(g) {
					g.getRisksHelper(risks);
				});

				return risks;
			}

			RiskGroup.prototype.getGroups = function() {
				return this.getGroupsHelper([]);
			}

			RiskGroup.prototype.getChildren = function() {
				return this.groups;
			}

			RiskGroup.prototype.getGroupsHelper = function(groups) {
				this.groups.forEach(function(g) {
					groups.push(g);
				});

				this.groups.forEach(function(g) {
					g.getGroupsHelper(groups);
				});

				return groups;
			}
			
			function Map(){
				this.entries = [];
			}
			
			Map.prototype.getEntry = function (key){
				var e = _.find(this.entries, function(e){
					return e.key == key;
				});
				return e;
			}
			
			Map.prototype.get = function (key){
				var e = this.getEntry(key);
				
				return e ? e.value : undefined;
			}
			Map.prototype.set = function (key, value){
				var e = this.getEntry();
				if (e){
					e.value = value;
				} else {
					this.entries.push({key: key, value: value});
				}
			}
			Map.prototype.forEach = function (fn){
				this.entries.forEach(function(e){
					fn(e.key, e.value);
				});
			}
			
			function Subject (){
				this.listeners = new Map();
			}
			
			Subject.prototype.addListener = function (event, listener, callback){
				var map = this.listeners.get(event);
				if (!map){
					this.listeners.set(event, new Map());
				}
				map = this.listeners.get(event);
				
				map.set(listener, callback);
			}
			
			Subject.prototype.removeListener = function (event, listener){
				var map = this.listeners.get(event);
				if (!map ){
					return;
				}
				
				return map.get(listener);
			}
			
			Subject.prototype.fire = function (event, value){
				var map = this.listeners.get(event);
				if (!map){
					return;
				}
				
				// Execute all the callback functions
				map.forEach(function (listener, callback){
					callback(value); 
					});
			}
			
			
			function RiskNetwork(id) {
				this.id = id;
				this.links = [];
				this.risks = [];
				this.components = [];
				this.idToRiskMap = d3.map();
				this.riskToComponentMap = d3.map();
				this.subjectDelegate = new Subject();

			}

			RiskNetwork.prototype = Object.create(Measureable.prototype);
			RiskNetwork.prototype.constructor = RiskNetwork;
			
			RiskNetwork.prototype.getType = function (){
				return "Model";
			}

			RiskNetwork.prototype.addListener = function (event, listener, callback){
				this.subjectDelegate.addListener(event, listener, callback);
			}
			RiskNetwork.prototype.fire = function (event, value){
				this.subjectDelegate.fire(event, value);
			}
			RiskNetwork.prototype.removeListener = function (listener){
				this.subjectDelegate.removeListener(listener);
			}

			RiskNetwork.prototype.toJson = function (){
				var risks = _.map(this.risks, function(r){
					return r.toJson();
				});
				
				var links = _.map(this.links, function(l){
					return l.toJson();
				});

					
				return {name: this.name, uri: this.id, risks: risks, links: links};
			}

			RiskNetwork.prototype.getURI = function() {
				return this.id;
			}

			scope.RiskNetwork = RiskNetwork;

			RiskNetwork.prototype.addRisk = function(risk) {
				
				chai.assert.instanceOf(risk, Risk);
				
				// Risks can only be added once.
				var id = this.idToRiskMap.get(risk.id);
				if (id){
					return;
				}
				this.risks.push(risk);
				this.idToRiskMap.set(risk.id, risk);
				this.fire("riskAdded", risk);
			}
			
			RiskNetwork.prototype.removeRisk = function(risk){
				chai.assert.instanceOf(risk, Risk);

				this.risks.splice(this.risks.indexOf(risk), 1);
				this.idToRiskMap.remove(risk.id);
				this.fire("riskDeleted", risk);
				
				var links = this.getAdjacentLinks(risk);
				links.forEach(this.removeLink.bind(this));

			}
			
			RiskNetwork.prototype.shuffle = function (){
//				var isSavedSurvey = JSON.parse(localStorage.getItem("isSavedSurvey"));
//				 if (!isSavedSurvey) {
//					this.risks = _.shuffle(this.risks);
//				}
			}

			RiskNetwork.prototype.getLink = function(r1, r2) {
				for (var i = 0; i < this.links.length; i++) {
					var link = this.links[i];
					if (link.src.id == r1.id && link.dest.id == r2.id) {
						return link;
					}
				}

				return undefined;
			}

			RiskNetwork.prototype.equals = function(model) {
				return model instanceof models.RiskNetwork
						&& model.getName() == this.getName();
			}

			RiskNetwork.prototype.size = function() {
				return this.getRisks().length;
			}

			RiskNetwork.prototype.getRisk = function(id) {
				return this.idToRiskMap.get(id);
			}

			RiskNetwork.prototype.getRisks = function() {
				return this.risks;
			}

			RiskNetwork.prototype.getLinks = function() {
				return this.links;
			}

			RiskNetwork.prototype.addLink = function(id, id1, id2) {
				var r1 = this.getRisk(id1);
				var r2 = this.getRisk(id2);

				if (r1 == null || r2 == null) {
					return;
				}

				var link = new RiskLink(id, r1, r2);
				this.links.push(link);
				this.fire("linkAdded", link);
				return link;
			}
			
			RiskNetwork.prototype.removeLink = function (l){
				if (l){
					this.links.splice(this.links.indexOf(l), 1);
					this.fire("linkRemoved", l);
				}
				
			}

			RiskNetwork.prototype.has = function(risk) {
				var r = this.getRisk(risk.id);

				return r ? true : false;
			}


			RiskNetwork.prototype.filter = function(threshold, measurementSet) {
				var rn = new RiskNetwork(this.id, this.name);

				var metric = measurementSet.getMetric("Weight");
				var maxWeight = measurementSet.max(metric, this.getLinks());
				var thresholdWeight = threshold * maxWeight;

				var newLinks = this.links.filter(function(link) {
					var metric = measurementSet.getMetric("Weight");
					var weight = measurementSet.getMeasurement(metric, link);
					return weight >= thresholdWeight;
				});
				
				this.risks.forEach(function (r){
					rn.addRisk(r);
				});
			
				newLinks.forEach(function (l){
					rn.addLink(l.id, l.src.id, l.dest.id);
				});
				
				// Consistency Check
				newLinks.forEach(function(l) {
					if (!rn.getRisk(l.src.id) || !rn.getRisk(l.dest.id)) {
						console.log("Panic" + l);
						console.log("Source " + l.src.id + " " + l.src.name);
						console.log("Target " + l.dest.id + " " + l.dest.name);

					}
				});

				return rn;
			}
			
			RiskNetwork.prototype.filterSingletons = function(){
				var rn = new RiskNetwork(this.id, this.name);
				this.getLinks().forEach(function (l){
					rn.addRisk(l.src);
					rn.addRisk(l.dest);
					rn.addLink(l.id, l.src.id, l.dest.id);
				});
				
				return rn;
				
			}

			RiskNetwork.prototype.findNeighbours = function(risk) {
				var neighbours = [];
				this.links.forEach(function(l) {
					if (l.src == risk) {
						neighbours.push(l.dest);
					}
					if (l.dest == risk) {
						neighbours.push(l.src);
					}

				});

				return neighbours;
			}

			/**
			 * Determines whether the given risk is linked to something within the network.
			 */
			RiskNetwork.prototype.isLinked = function(risk){
				return _.find(this.links, function (l){
					return l.links(risk);
				});
			}
			RiskNetwork.prototype.getAdjacentLinks = function(risk) {
				var links = this.links.filter(function(l) {
					return l.links(risk);
				});

				return links;
			}
			
			
			RiskNetwork.prototype.getOutgoingLinks = function(risk) {
				if (risk == null){
					return [];
				}

				var links = this.links.filter(function(l) {
					return risk.id == l.src.id
				});

				return links;
			}
			
			RiskNetwork.prototype.getIncomingLinks = function(risk) {
				if (risk == null){
					return [];
				}
				var links = this.links.filter(function(l) {
					return risk.id == l.dest.id
				});

				return links;
			}



			RiskNetwork.prototype.getConnectionCount = function(risk) {
				return getAdjacentLinks().length;
			}

			RiskNetwork.prototype.getComponents = function() {
				var riskMap = d3.map();
				var components = [];
				var n = 0;

				this.getRisks().forEach(function(r) {

					// If this item is already in a component then continue
					if (riskMap.get(r)) {
						return;
					}

					// Create a stack for investigating this component.
					var stack = [ r ];

					while (stack.length != 0) {

						// Get a vertex from the stack
						var v = stack.pop();

						// If this vertex is already in a component then don't
						// continue with it.
						if (typeof riskMap.get(v.name) != "undefined") {
							continue;
						}

						if (typeof components[n] == "undefined") {
							components[n] = [];
						}

						// Indicate that this vertex has been included within a
						// component.
						riskMap.set(v.name, n);

						// Add it to a component
						components[n].push(v);

						// Get its adjacent links and continue the search
						// through them.
						this.getAdjacentLinks(v).forEach(function(l) {
							stack.push(l.src == v ? l.dest : l.src);
						});

					}
					n++;
				}, this);

				return components;
			}

			function diameter(vertices, links) {

				var n = vertices.length;
				var dist = [];

				// 1 let dist be a |V| Ã— |V| array of minimum distances
				// initialized to âˆž (infinity)
				// 2 for each vertex v
				// 3 dist[v][v] â†? 0

				for (var i = 0; i < n; i++) {
					dist[i] = [];
					for (var j = 0; j < n; j++) {
						dist[i][j] = i == j ? 0 : Number.POSITIVE_INFINITY;
					}
				}

				// 4 for each edge (u,v)
				// 5 dist[u][v] â†? w(u,v) // the weight of the edge (u,v)
				links.forEach(function(l) {
					var i = vertices.indexOf(l.source.id);
					var j = vertices.indexOf(l.target.id);

					dist[i][j] = 1;
				});
				// 6 for k from 1 to |V|
				// 7 for i from 1 to |V|
				// 8 for j from 1 to |V|
				// 9 if dist[i][j] > dist[i][k] + dist[k][j]
				// 10 dist[i][j] â†? dist[i][k] + dist[k][j]
				// 11 end if
				for (var k = 0; k < n; k++) {
					for (var i = 0; i < n; i++) {
						for (var j = 0; j < n; j++) {
							var len = dist[i][k] + dist[k][j];
							if (dist[i][j] > len){
								dist[i][j] = len
							}
						}
					}
				}
				
				var diameter = 0;
				for (var i = 0; i < n; i++) {
					for (var j = 0; j < n; j++) {
						
						if (dist[i][j] > diameter && dist[i][j] < Number.POSITIVE_INFINITY){
							diameter = dist[i][j];
						}
					}
				};
				
				return diameter;

			}

			function Metric(name, interval) {
				chai.assert.isString(name);

				this.name = name;
				this.type = null;
				this.interval = interval;
			}

			scope.Metric = Metric;
			Metric.prototype.getName = function() {
				return this.name;
			}

			Metric.prototype.getInterval = function() {
				return this.interval;
			}

			function MetricSet() {
				this.metrics = [];
			}

			scope.MetricSet = MetricSet;
			MetricSet.prototype.add = function(metric) {
				chai.assert.instanceOf(metric, Metric);

				for (var i = 0; i < this.metrics.length; i++) {
					if (this.metrics[i].equals(metric)) {
						return;
					}
				}

				this.metrics.push(metric);
			}

			MetricSet.prototype.getMetric = function(name) {
				chai.assert.isString(name);

				for (var i = 0; i < this.metrics.length; i++) {
					if (this.metrics[i].name == name) {
						return this.metrics[i];
					}
				}

				return null;
			}

			MetricSet.prototype.getModelMetrics = function() {
				var modelMetrics = [];

				this.getMetrics().forEach(function(m) {
					if (m instanceof ModelMetric) {
						modelMetrics.push(m);
					}
					;
				});

				return modelMetrics;
			}

			MetricSet.prototype.contains = function(metric) {
				chai.assert.instanceOf(metric, Metric);

				for (var i = 0; i < this.metrics.length; i++) {
					if (this.metrics[i].equals(metric)) {
						return true;
					}
				}

				return false;
			}

			MetricSet.prototype.getMetrics = function() {
				return this.metrics;
			}

			MetricSet.prototype.addMetricSet = function(ms) {
				chai.assert.instanceOf(ms, MetricSet);
				ms.getMetrics().forEach(function(m) {
					this.add(m);
				}, this);
			}

			MetricSet.prototype.isEmpty = function() {
				return this.metrics.length == 0;
			}
			Metric.prototype.equals = function(metric) {

				if (this === metric) {
					return true;
				}

				if (this.type != metric.type) {
					return false;
				}

				return this.name == metric.name;
			}

			function RiskMetric(name, interval) {
				Metric.call(this, name, interval);
				this.type = "Risk";
			}

			scope.RiskMetric = RiskMetric;

			RiskMetric.prototype = Object.create(Metric.prototype);
			RiskMetric.prototype.constructor = RiskMetric;

			function ModelMetric(name, interval) {
				Metric.call(this, name, interval);
				this.type = "Model";
			}
			scope.ModelMetric = ModelMetric;

			ModelMetric.prototype = Object.create(Metric.prototype);
			ModelMetric.prototype.constructor = ModelMetric;

			function LinkMetric(name, interval) {
				Metric.call(this, name, interval);
				this.type = "Link";

			}

			scope.LinkMetric = LinkMetric;

			LinkMetric.prototype = Object.create(Metric.prototype);
			LinkMetric.prototype.constructor = LinkMetric;

			function EventMetric(name, interval) {
				Metric.call(this, name, interval);
				this.type = "Risk";
			}

			scope.EventMetric = EventMetric;

			EventMetric.prototype = Object.create(Metric.prototype);
			EventMetric.prototype.constructor = EventMetric;

			function AbstractMeasurementSet(id, model, metricSet) {
				chai.assert.instanceOf(model, RiskNetwork);

				this.model = model;
				this.metricSet = metricSet;
				this.id = id;
			}

			scope.AbstractMeasurementSet = AbstractMeasurementSet;
			
			AbstractMeasurementSet.prototype.getId = function (){
				return this.id;
			}

			AbstractMeasurementSet.prototype.getModel = function() {
				return this.model;
			}

			AbstractMeasurementSet.prototype.getMetricSet = function() {
				return this.metricSet;
			}

			AbstractMeasurementSet.prototype.addMetric = function(m) {
				chai.assert.instanceOf(m, Metric);
				this.metricSet.add(m);
			}

			AbstractMeasurementSet.prototype.getMetric = function(name) {
				return this.getMetricSet().getMetric(name);
			}

			function MeasurementSet(id, model, metricSet) {
				AbstractMeasurementSet.call(this, id, model, metricSet);

				this.allValues = [];
				this.subjectIdToValuesMap = d3.map();
			}

			scope.MeasurementSet = MeasurementSet;

			MeasurementSet.prototype = Object
					.create(AbstractMeasurementSet.prototype);
			MeasurementSet.prototype.constructor = MeasurementSet;

			MeasurementSet.prototype.getMeasurementSets = function() {
				return [ this ];
			}
			
			MeasurementSet.prototype.removeSubject = function (subject){
				this.allValues = _.filter(this.allValues, function (m){
					return m.getSubject().id != subject.id;
				});
				
				this.subjectIdToValuesMap.remove(subject.id);
			}

			MeasurementSet.prototype.setMetric = function(metric, subject,
					value) {
				chai.assert.instanceOf(subject, Measureable);
				chai.assert.instanceOf(metric, Metric);
				chai.assert.isNumber(value);
				
				var mo = this.getMeasurementObject(metric, subject);
				if (!mo){
					mo = new Measurement(metric, subject, value);
					this.add(mo);
				} else {
					mo.value = value;
				}	
			}

			MeasurementSet.prototype.add = function(mv){
				this.allValues.push(mv);

				var vs = this.getValues(mv.getSubject());
				vs.push(mv);

			}
			MeasurementSet.prototype.isEmpty = function (){
				return this.allValues.length == 0;
			}

			MeasurementSet.prototype.topN = function(metricName, subjects, n) {

				var values = [];
				var metric = this.getMetric(metricName);
				if (metric == null) {
					return [];
				}
				subjects.forEach(function(subject) {
					var value = this.getMeasurement(metric, subject);
					values.push({
						subject : subject,
						value : value
					});
				}, this);

				values = values.sort(function(a, b) {
					return b.value - a.value
				});

				var topN = [];

				for (var i = 0; i < n; i++) {
					topN.push(values[i].subject);
				}

				return topN;
			}

			MeasurementSet.prototype.getValues = function(subject) {
				var id = subject.id;
				var values = this.subjectIdToValuesMap.get(id);

				if (!values) {
					values = [];
					this.subjectIdToValuesMap.set(id, values);
				}

				return values;
			}

			MeasurementSet.prototype.getModelMetrics = function() {
				return this.getMetricSet().getModelMetrics();
			}

			MeasurementSet.prototype.getMeasurement = function(metric, subject) {
				var mo = this.getMeasurementObject(metric, subject);
				
				if (!mo){
					return null;
				}
				return mo.value;
			}			
			
			MeasurementSet.prototype.getMeasurementObject = function(metric, subject) {
				chai.assert.isNotNull(subject);
				chai.assert.isDefined(subject);
				chai.assert.instanceOf(metric, Metric);

				var mvs = this.getValues(subject);

				for (var i = 0; i < mvs.length; i++) {
					var mv = mvs[i];
					if (metric.equals(mv.metric)) {
						return mv;
					}
				}

				return undefined;
			}

			MeasurementSet.prototype.getMeasurementByName = function(
					metricName, subject) {
				var metric = this.getMetric(metricName);
				if (!metric) {
					return null;
				}
				return this.getMeasurement(metric, subject);
			}

			MeasurementSet.prototype.getMetricBounds = function(metric) {
				chai.assert.instanceOf(metric, Metric);

				var bounds = new Unbounded();

				this.allValues.forEach(function(mv) {
					if (metric.equals(mv.metric)) {
						var v = mv.value;

						bounds = bounds.adjustWith(v);
					}
				});
				return bounds;
			}

			MeasurementSet.prototype.max = function(metric, subjects) {
				chai.assert.instanceOf(metric, Metric);

				var max = 0;
				subjects.forEach(function(subject) {
					var value = this.getMeasurement(metric, subject);
					if (value > max) {
						max = value;
					}
				}, this);

				return max;
			}
			
			MeasurementSet.prototype.toJson = function (){
				var jmeasurements = _.map(this.allValues, function(m){
					return m.toJson();
				});
				
				return {uri: this.getId(), measurements: jmeasurements};
				
			}

			function Measurement(metric, subject, value) {
				chai.assert.instanceOf(metric, Metric);
				chai.assert.instanceOf(subject, Measureable);
				chai.assert.isNumber(value);

				this.metric = metric;
				this.subject = subject;
				this.value = value;
			}

			scope.Measurement = Measurement;

			Measurement.prototype.getMetric = function() {
				return this.metric;
			}

			Measurement.prototype.getValue = function() {
				return this.value;
			}
			

			Measurement.prototype.getSubject = function() {
				return this.subject;
			}

			Measurement.prototype.toJson = function (ms){
				var type = this.subject.getType();
				return {metricName: this.metric.getName(), subject: { uri:this.subject.id, type: type}, measuredValue: this.value};
			}
			function AggregateModel(name) {
				RiskNetwork.call(this, name);

				this.models = [];
			}

			scope.AggregateModel = AggregateModel;

			AggregateModel.prototype = Object.create(RiskNetwork.prototype);
			AggregateModel.prototype.constructor = AggregateModel;

			AggregateModel.prototype.addModel = function(model) {
				chai.assert.instanceOf(model, RiskNetwork);

				this.models.push(model);

				// Add all the risks
				model.getRisks().forEach(function(r) {
					if (this.has(r)) {
						return;
					}

					this.addRisk(r);
				}, this);

				// Add all the links
				model.getLinks().forEach(function(l) {
					this.addLink(l.id, l.src.id, l.dest.id);
				}, this);

				// Add all the groups
				model.getGroups().forEach(function(g) {
					this.addGroup(g);
				}, this);
			}

			AggregateModel.prototype.getModels = function() {
				return this.models;
			}

			function AggregateMeasurementSet(model) {
				chai.assert.instanceOf(model, AggregateModel);

				MeasurementSet.call(this, model, new Date());

				this.measurementSets = [];

			}
			scope.AggregateMeasurementSet = AggregateMeasurementSet;

			AggregateMeasurementSet.prototype = Object
					.create(AbstractMeasurementSet.prototype);
			AggregateMeasurementSet.prototype.constructor = AggregateMeasurementSet;

			AggregateMeasurementSet.prototype.getMeasurementSets = function() {
				return this.measurementSets;
			}

			AggregateMeasurementSet.prototype.addMeasurementSet = function(mm) {
				chai.assert.instanceOf(mm, MeasurementSet);

				this.measurementSets.push(mm);

				this.getMetricSet().addMetricSet(mm.getMetricSet());

				// Ensure that the model metrics are always sorted in time so
				// that
				// the correct metrics can be found for a given time.
				this.measurementSets = this.measurementSets.sort(function(mm1,
						mm2) {
					return mm1.getDate().getTime() - mm2.getDate().getTime();
				});

			}

			AggregateMeasurementSet.prototype.getCurrent = function(date) {
				chai.assert.instanceOf(date, Date);

				if (this.measurementSets.length == 0) {
					return null;
				}

				var prior = null;
				for (var i = 0; i < this.measurementSets.length; i++) {
					if (date.getTime() < this.measurementSets[i].getDate()
							.getTime()) {
						return prior;
					}
					prior = this.measurementSets[i];
				}

				return prior;
			}

			AggregateMeasurementSet.prototype.getValues = function(subject) {
				chai.assert.instanceOf(subject, Measureable);

				var mm = this.getCurrent(new Date());
				if (mm == null) {
					return [];
				}

				return mm.getValues(subject);

			}

			AggregateMeasurementSet.prototype.getSequence = function(metric,
					subject) {
				var sequence = [];
				this.measurementSets.forEach(function(mm) {
					sequence.push(mm.getMetric(metric, subject));
				});

				return sequence;
			}

			AggregateMeasurementSet.prototype.getLine = function(mx, my,
					subject) {
				chai.assert.instanceOf(mx, Metric);
				chai.assert.instanceOf(my, Metric);
				chai.assert.instanceOf(subject, Measureable);

				var points = [];

				this.measurementSets.forEach(function(mm) {
					var p = {};

					p.x = mm.getMetric(mx, subject);
					p.y = mm.getMetric(my, subject);
					points.push(p);
				});

				var line = d3.svg.line().x(function(d) {
					return d.x;
				}).y(function(d) {
					return d.y;
				}).interpolate("linear");

				return line(points);

			}

			AggregateMeasurementSet.prototype.getMeasurementAtTime = function(
					metric, subject, date) {
				chai.assert.instanceOf(subject, Measureable);
				chai.assert.instanceOf(date, Date);
				chai.assert.instanceOf(metric, Metric);

				var mm = this.getCurrent(date);
				if (mm == null) {
					return "undefined";
				}

				return mm.getMeasurement(metric, subject, date);
			}

			AggregateMeasurementSet.prototype.max = function(metricName,
					subjects) {
				var max = 0;
				this.measurementSets.forEach(function(mm) {
					var mmax = mm.max(metricName, subjects);
					max = mmax > max ? mmax : max;
				});

				return max;

			}

			AggregateMeasurementSet.prototype.getMeasurementSequence = function(
					metric, subject) {
				var seq = [];
				this.measurementSets.forEach(function(ms) {
					seq.push(ms.getMeasurement(metric, subject));
				});

				return seq;
			}

			AggregateMeasurementSet.prototype.getMeasurement = function(metric,
					subject) {
				return this.getMeasurementAtTime(metric, subject, new Date());
			}

			AggregateMeasurementSet.prototype.getMetricBounds = function(m) {
				var b = new Unbounded();

				this.measurementSets.forEach(function(mm) {
					var b1 = mm.getMetricBounds(m);
					b = b.addInterval(b1);
				});

				return b;

			}

			function Interval(leftEndpoint, rightEndpoint) {
				this.leftEndpoint = leftEndpoint;
				this.rightEndpoint = rightEndpoint;
			}

			scope.Interval = Interval;

			Interval.prototype.getLeftEndpoint = function() {
				return this.leftEndpoint;
			}

			Interval.prototype.getRightEndpoint = function() {
				return this.rightEndpoint;
			}

			Interval.prototype.getEndpoints = function() {
				return [ this.getLeftEndpoint(), this.getRightEndpoint() ];
			}

			Interval.prototype.addInterval = function(interval) {
				chai.assert.instanceOf(interval, Interval);
				return this.adjustLeft(interval.getLeftEndpoint()).adjustRight(
						interval.getRightEndpoint());
			}

			Interval.prototype.adjustWith = function(v) {
				return this.adjustLeft(v).adjustRight(v);
			}

			/**
			 * Use the bound interval to make this interval bound.
			 * 
			 * @param boundInterval
			 */
			Interval.prototype.makeBound = function(boundInterval) {
				return null;
			}

			Interval.prototype.getMidPoint = function() {
				return null;
			}

			function Bounded(leftEndpoint, rightEndpoint) {
				Interval.call(this, leftEndpoint, rightEndpoint);
			}

			scope.Bounded = Bounded;

			Bounded.prototype = Object.create(Interval.prototype);
			Bounded.prototype.constructor = Bounded;

			Bounded.prototype.getMidPoint = function() {
				return this.getLeftEndpoint()
						+ (this.getRightEndpoint - this.getLeftEndpoint) / 2;
			}

			Bounded.prototype.makeBound = function(boundInterval) {
				return this;
			}

			Bounded.prototype.getWidth = function() {
				return Math.abs(this.getRightEndpoint()
						- this.getLeftEndpoint());
			}
			Bounded.prototype.divideInto = function(n) {

				var intervals = new IntervalSequence();
				if (n == 1) {
					return this;
				}

				var lv = this.getLeftEndpoint();
				var rv = this.getRightEndpoint();
				var gap = (rv - lv) / n;

				var newRv = lv + gap;
				var first = this.isLeftClosed() ? new LeftClosedRightOpen(lv,
						newRv) : new LeftOpenRightClosed(lv, newRv);
				intervals.add(first);

				for (var i = 1; i < n - 1; i++) {
					var newLV = newRv;
					newRv = newLV + gap;
					var iv = new LeftClosedRightOpen(newLV, newRv);
					intervals.add(iv);
				}

				var last = this.isRightClosed() ? new Closed(newRv, rv)
						: new LeftClosedRightOpen(newRv, rv);
				intervals.add(last);

				return intervals;
			}

			Bounded.prototype.leftIsUnbound = function() {
				return false;
			}

			Bounded.prototype.rightIsUnbound = function() {
				return false;
			}

			function Open(leftEndpoint, rightEndpoint) {
				Interval.call(this, leftEndpoint, rightEndpoint);
			}

			scope.Open = Open;

			Open.prototype = Object.create(Bounded.prototype);
			Open.prototype.constructor = Open;

			Open.prototype.contains = function(x) {
				chai.assert.isNumber(x);

				return x > this.getLeftEndpoint()
						&& x < this.getRightEndpoint();
			}

			Open.prototype.adjustLeft = function(x) {

				if (x <= this.getLeftEndpoint) {
					return new LeftClosedRightOpen(x, this.getRightEndpoint());
				}

				return this;
			}

			Open.prototype.adjustRight = function(x) {

				if (x >= this.getRightEndpoint()) {
					return new LeftOpenRightClosed(this.getLeftEndpoint(), x);
				}

				return this;
			}

			Open.prototype.isLeftClosed = function() {
				return false;
			}

			Open.prototype.isRightClosed = function() {
				return false;
			}

			function Closed(leftEndpoint, rightEndpoint) {
				Interval.call(this, leftEndpoint, rightEndpoint);
			}

			scope.Closed = Closed;
			Closed.prototype = Object.create(Bounded.prototype);
			Closed.prototype.constructor = Closed;

			Closed.prototype.contains = function(x) {
				chai.assert.isNumber(x);

				return x >= this.getLeftEndpoint()
						&& x <= this.getRightEndpoint();
			}

			Closed.prototype.adjustLeft = function(x) {

				if (x < this.getLeftEndpoint()) {
					return new Closed(x, this.getRightEndpoint());
				}

				return this;
			}

			Closed.prototype.adjustRight = function(x) {

				if (x > this.getRightEndpoint()) {
					return new Closed(this.getLeftEndpoint(), x);
				}

				return this;
			}

			Closed.prototype.isLeftClosed = function() {
				return true;
			}

			Closed.prototype.isRightClosed = function() {
				return true;
			}

			function LeftClosedRightOpen(leftEndpoint, rightEndpoint) {
				Interval.call(this, leftEndpoint, rightEndpoint);
			}

			scope.LeftClosedRightOpen = LeftClosedRightOpen;
			LeftClosedRightOpen.prototype = Object.create(Bounded.prototype);
			LeftClosedRightOpen.prototype.constructor = LeftClosedRightOpen;

			LeftClosedRightOpen.prototype.contains = function(x) {
				chai.assert.isNumber(x);

				return x >= this.getLeftEndpoint()
						&& x < this.getRightEndpoint();
			}

			LeftClosedRightOpen.prototype.adjustLeft = function(x) {

				if (x < this.getLeftEndpoint) {
					return new LeftClosedRightOpen(x, this.getRightEndpoint());
				}

				return this;
			}

			LeftClosedRightOpen.prototype.adjustRight = function(x) {

				if (x >= this.getRightEndpoint()) {
					return new Closed(this.getLeftEndpoint(), x);
				}

				return this;
			}

			LeftClosedRightOpen.prototype.isLeftClosed = function() {
				return true;
			}

			LeftClosedRightOpen.prototype.isRightClosed = function() {
				return false;
			}

			function LeftOpenRightClosed(leftEndpoint, rightEndpoint) {
				Interval.call(this, leftEndpoint, rightEndpoint);
			}

			scope.LeftOpenRightClosed = LeftOpenRightClosed;

			LeftOpenRightClosed.prototype = Object.create(Interval.prototype);
			LeftOpenRightClosed.prototype.constructor = LeftOpenRightClosed;

			LeftOpenRightClosed.prototype.contains = function(x) {
				chai.assert.isNumber(x);

				return x > this.getLeftEndpoint()
						&& x <= this.getRightEndpoint();
			}

			LeftOpenRightClosed.prototype.adjustLeft = function(x) {

				if (x <= this.getLeftEndpoint) {
					return new Closed(x, this.getRightEndpoint());
				}

				return this;
			}

			LeftOpenRightClosed.prototype.adjustRight = function(x) {

				if (x > this.getRightEndpoint()) {
					return new LeftOpenRightClosed(this.getLeftEndpoint(), x);
				}

				return this;
			}

			LeftOpenRightClosed.prototype.isLeftClosed = function() {
				return false;
			}

			LeftOpenRightClosed.prototype.isRightClosed = function() {
				return false;
			}

			function LeftOpen(leftEndpoint) {
				Interval.call(this, leftEndpoint, null);
			}

			scope.LeftOpen = LeftOpen;
			LeftOpen.prototype = Object.create(Interval.prototype);
			LeftOpen.prototype.constructor = LeftOpen;

			LeftOpen.prototype.contains = function(x) {
				chai.assert.isNumber(x);

				return x > this.getLeftEndpoint();
			}

			LeftOpen.prototype.adjustLeft = function(x) {

				if (x <= this.getLeftEndpoint) {
					return new LeftClosed(x, this.getRightEndpoint());
				}

				return this;
			}

			LeftOpen.prototype.adjustRight = function(x) {
				return new LeftOpenRightClosed(this.getLeftEndpoint(), x);
			}

			LeftOpen.prototype.makeBound = function(boundInterval) {
				return this.adjustRight(boundInterval.getRightEndpoint());
			}

			function LeftClosed(leftEndpoint) {
				Interval.call(this, leftEndpoint, null);
			}
			scope.LeftClosed = LeftClosed;

			LeftClosed.prototype = Object.create(Interval.prototype);
			LeftClosed.prototype.constructor = LeftClosed;

			LeftClosed.prototype.contains = function(x) {
				chai.assert.isNumber(x);

				return x >= this.getLeftEndpoint();
			}

			LeftClosed.prototype.adjustLeft = function(x) {

				if (x < this.getLeftEndpoint) {
					return new LeftClosed(x, this.getRightEndpoint());
				}

				return this;
			}

			LeftClosed.prototype.adjustRight = function(x) {
				return new Closed(this.getLeftEndpoint(), x);
			}

			LeftClosed.prototype.makeBound = function(boundInterval) {
				return this.adjustRight(boundInterval.getRightEndpoint());
			}

			scope.RightOpen = RightOpen;
			function RightOpen(rightEndpoint) {
				Interval.call(this, null, rightEndpoint);
			}

			RightOpen.prototype = Object.create(Interval.prototype);
			RightOpen.prototype.constructor = RightOpen;

			RightOpen.prototype.contains = function(x) {
				chai.assert.isNumber(x);

				return x < this.getRightEndpoint();
			}

			RightOpen.prototype.adjustLeft = function(x) {
				return new LeftClosedRightOpen(x, this.getRightEndpoint());
			}

			RightOpen.prototype.adjustRight = function(x) {
				if (x > this.getRightEndpoint) {
					return new RightClosed(x, this.getRightEndpoint());
				}

				return this;
			}

			RightOpen.prototype.makeBound = function(boundInterval) {
				return this.adjustLeft(boundInterval.getLeftEndpoint());
			}

			function RightClosed(rightEndpoint) {
				Interval.call(this, null, rightEndpoint);
			}

			scope.RightClosed = RightClosed;
			RightClosed.prototype = Object.create(Interval.prototype);
			RightClosed.prototype.constructor = RightClosed;

			RightClosed.prototype.contains = function(x) {
				chai.assert.isNumber(x);

				return x <= this.getRightEndpoint();
			}

			RightClosed.prototype.adjustLeft = function(x) {
				return new Closed(x, this.getRightEndpoint());
			}

			RightClosed.prototype.adjustRight = function(x) {
				if (x >= this.getRightEndpoint) {
					return new RightClosed(x, this.getRightEndpoint());
				}

				return this;
			}

			RightClosed.prototype.makeBound = function(boundInterval) {
				return this.adjustLeft(boundInterval.getLeftEndpoint());
			}

			function Unbounded() {
				Interval.call(this, null, null);
			}

			scope.Unbounded = Unbounded;

			Unbounded.prototype = Object.create(Interval.prototype);
			Unbounded.prototype.constructor = Unbounded;

			Unbounded.prototype.adjustLeft = function(x) {
				return new LeftClosed(x, this.getRightEndpoint());
			}

			Unbounded.prototype.adjustRight = function(x) {
				return new RightClosed(x, this.getRightEndpoint());
			}
			Unbounded.prototype.makeBound = function(boundInterval) {
				return boundInterval;
			}

			function IntervalSequence() {
				this.intervals = [];
			}

			scope.IntervalSequence = IntervalSequence;

			IntervalSequence.prototype.getIntervals = function() {
				return this.intervals;
			}
			IntervalSequence.prototype.add = function(interval) {
				chai.assert.instanceOf(interval, Interval);
				this.intervals.push(interval);
			}

			IntervalSequence.prototype.getDelimiters = function() {
				var values = [];
				if (this.intervals.length == 0) {
					return [];
				}
				values.push(this.intervals[0].getLeftEndpoint());
				this.intervals.forEach(function(iv) {
					values.push(iv.getRightEndpoint());
				});

				return values;
			}

			IntervalSequence.prototype.length = function() {
				return this.intervals.length;
			}

			IntervalSequence.prototype.indexOf = function(interval) {
				chai.assert.instanceOf(interval, Interval);
				return this.intervals.indexOf(interval);
			}
			IntervalSequence.prototype.getInterval = function(value) {
				for (var i = 0; i < this.intervals.length; i++) {
					var iv = this.intervals[i];
					if (iv.contains(value)) {
						return iv;
					}
				}

				return null;
			}

			IntervalSequence.prototype.getRightEndpoint = function() {
				var iv = this.intervals[this.intervals.length - 1];
				if (iv == null) {
					return null;
				}

				return iv.getRightEndpoint();
			}

			IntervalSequence.prototype.getOverlappingIntervals = function(
					interval) {
				chai.assert.instanceOf(interval, Interval);

				var is = new IntervalSequence();
				for (var i = 0; i < this.intervals.length; i++) {
					var iv = this.intervals[i];
					if (iv.contains(interval.getLeftEndpoint())
							|| iv.contains(interval.getRightEndpoint())
							|| interval.contains(iv.getLeftEndpoint())
							|| interval.contains(iv.getRightEndpoint())) {
						is.add(iv);
					}

				}
				;

				return is;
			}
			
			function LinkSelectionStrategy (){
				
			}
			
			function Outgoing (){
				
			}
			Outgoing.prototype = Object.create(LinkSelectionStrategy.prototype);
			Outgoing.prototype.constructor = Outgoing;
			
			Outgoing.prototype.selectLinks = function(model, risk){
				return model.getOutgoingLinks(risk);
			}
			scope.Outgoing = Outgoing;
			
			function Incoming (){
				
			}
			Incoming.prototype = Object.create(LinkSelectionStrategy.prototype);
			Incoming.prototype.constructor = Incoming;

			Incoming.prototype.selectLinks = function(model, risk){
				return model.getIncomingLinks(risk);
			}
			scope.Incoming = Incoming;


			function Organisation(id, name) {
				this.id = id;
				this.name = name;
				this.logoURI = null;
			}

			Organisation.prototype.getName = function() {
				return this.name;
			}
			scope.Organisation = Organisation;
			
			function Engagement(id, name){
				this.id = id;
				this.name = name;
			}
			scope.Engagement = Engagement;

			function User(id, name){
				this.id = id;
				this.name = name;
			}
			scope.User = User;

			function QuantifiedModel (id, model, measurementSet){
				this.id = id;
				this.model = model;
				this.measurementSet = measurementSet;
			}
			scope.QuantifiedModel = QuantifiedModel;
			
			QuantifiedModel.prototype.getBaseModel = function (){
				return this.model;
			}
						
			QuantifiedModel.prototype.getMeasurementSet = function (){
				return this.measurementSet;
			}
			QuantifiedModel.prototype.toJson = function (){
				return {
					model: this.model.toJson(),
					measurementSet: this.measurementSet.toJson()
				};
			}
			
			QuantifiedModel.prototype.addLink = function (risk1, risk2){
				var link = this.model.addLink(null, risk1.id, risk2.id);
				var metric = this.measurementSet.getMetricSet().getMetric("Weight");
				this.measurementSet.setMetric(metric, link, 1.0);
			}
			
			QuantifiedModel.prototype.removeLink = function (l){
				this.model.removeLink(l);
				this.measurementSet.removeSubject(l);
			}

			QuantifiedModel.prototype.addRisk = function (risk){
				this.model.addRisk(risk);
				
				var ms = this.measurementSet.getMetricSet();
				
				this.measurementSet.setMetric(ms.getMetric("Likelihood"), risk, Math.random());
				this.measurementSet.setMetric(ms.getMetric("Severity"), risk, Math.random());
				this.measurementSet.setMetric(ms.getMetric("Velocity"), risk, Math.random());
			}
			
			QuantifiedModel.prototype.removeRisk = function (risk){
				var links = this.model.getAdjacentLinks(risk);
				links.forEach(function (l){
					this.measurementSet.removeSubject(l);
				}, this);
				
				this.model.removeRisk(risk);
				this.measurementSet.removeSubject(risk);
			}

			
			QuantifiedModel.prototype.filter = function (threshold){
				var ms = this.getMeasurementSet();
				if (ms && !ms.isEmpty() && this.getBaseModel().getLinks().length != 0){
					var qm = 
						new QuantifiedModel(null, 
								this.getBaseModel().filter(threshold, ms), ms);
					return qm;
					
				}
		
				return this;
			}
			
			QuantifiedModel.prototype.filterSingletons = function (){
				var ms = this.getMeasurementSet();
				if (ms && !ms.isEmpty()){
					return new QuantifiedModel(null, this.getBaseModel().filterSingletons(), ms);
				}
				
				return this;
			}
			
			function MetricBound(metric, interval, numberOfIntervals, labels){
				this.metric = metric;
				this.numberOfIntervals = numberOfIntervals;
				
				var domain = interval.getEndpoints();
				this.scale = d3.scale.linear().domain(domain).clamp(true);

				// If the interval is unbounded then use the metric's interval
				// argument to make it bounded.
				this.interval = metric.interval.makeBound(interval);
				this.intervalSequence = this.interval.divideInto(numberOfIntervals);
				
				this.labels = labels ? labels : [ "very low", "low", "medium", "high", "very high" ];
				
				if (metric.name == "Degree"  || metric.name == "OutDegree" || metric.name == "InDegree"){
					this.labels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
				}

			}
			
			MetricBound.prototype.getLabel = function (v){
				var interval = this.intervalSequence.getInterval(v);
				var index = this.intervalSequence.indexOf(interval);
				
				if (index + 1 == this.intervalSequence.length() && v == interval.getRightEndpoint()){
					index++;
				}

				var label = this.labels[index];
				return label;
			}
						
			MetricBound.prototype.getMetric = function (){
				return this.metric;
			}
			
			MetricBound.prototype.getInterval = function (){
				return this.interval;
			}
			
			scope.MetricBound = MetricBound;
			// Exports

			scope.Risk = Risk;
			scope.MeasurementSet = MeasurementSet;
			scope.Open = Open;
			scope.Closed = Closed;
			scope.LeftClosed = LeftClosed;
			scope.LeftOpenRightClosed = LeftOpenRightClosed;
			scope.RightClosed = RightClosed;
			scope.RightOpen = RightOpen;
			scope.LeftClosedRightOpen = LeftClosedRightOpen;
			scope.Unbounded = Unbounded;
			scope.Event = Event;

			return scope;
		});
