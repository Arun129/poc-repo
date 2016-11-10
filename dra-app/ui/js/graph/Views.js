/**
 * 
 */

define(
		[ "models", "chai", "application", "server"],
		function(models, chai, app, svr) {

			var views = {};

			function AbstractView(document) {
				chai.assert.isNotNull(document);

				this.document = document;
				this.childViews = [];
				this.model = null;
				this.event = null;
				this.measurementSet = null;
				this.modelChangeFlag = false;
				this.groupChangeFlag = false;
				this.riskChangeFlag = false;
				this.group = null;
				this.organisation = null;
				this.listeners = [];

			}

			views.AbstractView = AbstractView;

			AbstractView.prototype.addListener = function(listener) {
				if (!listener.viewChanged) {
					return;
				}

				if (_.contains(this.listeners, listener)) {
					return;
				}

				this.listeners.push(listener);
			}

			AbstractView.prototype.getChildInsertionPoint = function() {
				return this.d3();
			}

			AbstractView.prototype.removeListener = function(listener) {
				this.listeners = _.without(this.listeners, listener);
			}

			AbstractView.prototype.notifyListeners = function(event) {
				var v = this;
				this.listeners.forEach(function(listener) {
					listener.viewChanged(v, event);
				});
			}
			
			AbstractView.prototype.organisationChanged = function (organisation){
				this.organisation = organisation;
			}
			
			AbstractView.prototype.getOrganisation = function (){
				return this.organisation;
			}

			AbstractView.prototype.transform = function(e) {
				this.content.attr("transform", "translate(" + e.translate
						+ ") scale(" + e.scale + ")");
			}

			AbstractView.prototype.getBBox = function() {
				return this.document.getBoundingClientRect();
			}

			AbstractView.prototype.detach = function() {
				var parentNode = this.document.parentNode;
				parentNode.removeChild(this.document);
				
				this.document = null;
			}

			AbstractView.prototype.reset = function() {
				this.childViews.forEach(function(v) {
					v.reset()
				});
			}
			
			AbstractView.prototype.translate = function(x, y) {
				var transform = this.d3().attr("transform");
				var suffix = transform ? " " + transform : "";
				this.d3().attr("transform", "translate(" + x + ", " + y + ")" + suffix);
			}
			
			AbstractView.prototype.rotate = function(angle, x, y) {
				var transform = this.d3().attr("transform");
				var suffix = transform ? " " + transform : "";
				var xy = x ? "," + x + ", " + y : ""; 
				this.d3().attr("transform", "rotate(" + angle + xy + ")" + suffix);
			}
			

			AbstractView.prototype.addChild = function(view) {
				view.parentView = this;
				this.childViews.push(view);
			}

			AbstractView.prototype.getDocument = function() {
				return this.document;
			}

			AbstractView.prototype.d3 = function() {
				return d3.select(this.document);
			}

			AbstractView.prototype.removeChild = function(child) {
				var i = this.childViews.indexOf(child);
				if (i !== -1) {
					this.childViews.splice(i, 1);
				}
			}

			AbstractView.prototype.show = function(animate) {
				var v = this;
				v.d3().style("display", "block");
				if (animate) {
					this.animateShow();
				}

				if (this.modelHasChanged()) {
					this.showChanges();
					this.showGroupChanges();
					this.showRiskChanges();
					this.notifyListeners("modelChanged");
				}

				if (this.groupHasChanged()) {
					this.showGroupChanges();
					this.notifyListeners("groupChanged");
				}

				if (this.riskHasChanged()) {
					this.showRiskChanges();
					this.notifyListeners("riskChanged");
				}

				if (this.eventHasChanged()) {
					this.showEventChanges();
					this.notifyListeners("eventChanged");
				}

			}

			AbstractView.prototype.showing = function() {
				return this.d3().style("display") !== "none";
			}

			/**
			 * This method is overridden if there is a need to animate the
			 * showing of this view.
			 */
			AbstractView.prototype.animateShow = function() {
				this.d3().style("left", window.innerWidth + "px").transition()
						.style("left", 0 + "px").duration(500);
			}

			AbstractView.prototype.animateHide = function() {
				var v = this;
				this.d3().style("left", 0).transition().style("left",
						-window.innerWidth + "px").duration(500).each("end",
						function() {
							v.d3().style("display", "none");
						});

			}

			AbstractView.prototype.getGroup = function() {
				return this.group;
			}

			AbstractView.prototype.showChanges = function() {
				this.setModelChanged(false);
			}

			AbstractView.prototype.showEventChanges = function() {
				this.setEventChanged(false);
			}

			AbstractView.prototype.showGroupChanges = function() {
				this.setGroupChanged(false);
			}

			AbstractView.prototype.showRiskChanges = function() {
				this.setRiskChanged(false);
			}

			AbstractView.prototype.modelChanged = function(model) {
				this.modelChangeFlag = true;
				this.model = model;
			}

			AbstractView.prototype.setModelChanged = function(flag) {
				this.modelChangeFlag = flag;
			}

			AbstractView.prototype.setGroupChanged = function(flag) {
				this.groupChangeFlag = flag;
			}

			AbstractView.prototype.setRiskChanged = function(flag) {
				this.riskChangeFlag = flag;
			}

			AbstractView.prototype.riskChanged = function(risk) {
				this.riskChangeFlag = true;
				this.risk = risk;

				if (this.showing()) {
					this.show();
				}
			}

			AbstractView.prototype.setEventChanged = function(flag) {
				this.eventChangeFlag = flag;
			}

			AbstractView.prototype.eventChanged = function(event) {
				this.eventChangeFlag = true;
				this.event = event;

				if (this.showing()) {
					this.show();
				}
			}

			AbstractView.prototype.groupChanged = function(group) {
				this.group = group;
				this.groupChangeFlag = true;
			}

			AbstractView.prototype.getModel = function() {
				return this.model;
			}

			AbstractView.prototype.getRisk = function() {
				return this.risk;
			}

			AbstractView.prototype.getEvent = function() {
				return this.event;
			}

//			AbstractView.prototype.getMeasurementSet = function() {
//				return this.measurementSet;
//			}

			AbstractView.prototype.modelHasChanged = function() {
				return this.modelChangeFlag;
			}

			AbstractView.prototype.groupHasChanged = function() {
				return this.groupChangeFlag;
			}

			AbstractView.prototype.riskHasChanged = function() {
				return this.riskChangeFlag;
			}

			AbstractView.prototype.eventHasChanged = function() {
				return this.eventChangeFlag;
			}

			AbstractView.prototype.getInsertionPoint = function() {
				return this.d3();
			}

			AbstractView.prototype.hide = function(animate) {
				var v = this;
				if (animate) {
					this.animateHide();
				} else {
					v.d3().style("display", "none");
				}
			}

			AbstractView.prototype.resize = function() {

			}

			function View(parentView, baseElement, insertFirst) {
				chai.assert.isNotNull(parentView);
				chai.assert.isNotNull(baseElement);

				chai.assert.instanceOf(parentView, AbstractView);

				parentView.addChild(this);
				
				// If the child knows its insertion point within the parent then use it otherwise 
				// use the generic child insertion point of the parent.
				var ip = this.getInsertionPoint(parentView);
				var insertionPoint =  ip.node() ? ip : parentView.getChildInsertionPoint(this);

				var d3Element = insertFirst 
						? insertionPoint.insert(baseElement, ":first-child") 
						: insertionPoint.append(baseElement);

				AbstractView.call(this, d3Element.node());
			}

			View.prototype = Object.create(AbstractView.prototype);
			View.prototype.constructor = View;
			views.View = View;

			View.prototype.getParent = function() {
				return this.parentView;
			}

			View.prototype.detach = function() {
				this.getParent().removeChild(this);
				AbstractView.prototype.detach.call(this);
			}

			View.prototype.getParentDocument = function() {
				if (this.parentView == null) {
					return null;
				}
				return this.parentView.getDocument();
			}

			function TopLevelView(targetDocument, element) {
				chai.assert.isNotNull(targetDocument);

				var node = element ? d3.select(targetDocument).append(element)
						.node() : targetDocument;

				AbstractView.call(this, node);
			}

			TopLevelView.prototype = Object.create(AbstractView.prototype);
			TopLevelView.prototype.constructor = TopLevelView;

			function LayoutStrategy() {

			}
			views.LayoutStrategy = LayoutStrategy;
			
			LayoutStrategy.prototype.stop = function (){
				
			}
			
			LayoutStrategy.prototype.start = function (){
				
			}

			function AbstractRiskModelView(targetDocument, element) {

				TopLevelView.call(this, targetDocument, element);

				this.content = this.d3().append("g").classed("content", true);
				this.graphArea = this.content.append("g").classed("graphArea",
				"true");
				this.graphArea.append("g").classed("links", true);
				this.graphArea.append("g").classed("risks", true);
				this.graphArea.append("g").classed("labelLinks", true);
				this.graphArea.append("g").classed("labels", true);


				this.riskViews = [];
				this.linkViews = [];
				this.groupViews = [];
				this.centralNode = null;
				this.layoutStrategy = null;
				this.wrapLength = 130;
				var headerHeight = 97;
				this.headerHeight = headerHeight;
				this.labelFontSize = 12;
					
				// Properties for linking components.
				this.componentLinks = [];

				this.riskIdToViewMap = d3.map();
				this.linkToViewMap = d3.map();

				this.d3().attr("class", "viewportX");
				this.applicationModel = new app.Application();

			}
			AbstractRiskModelView.prototype = Object
					.create(TopLevelView.prototype);
			AbstractRiskModelView.prototype.constructor = AbstractRiskModelView;
			views.AbstractRiskModelView = AbstractRiskModelView;

			AbstractRiskModelView.prototype.setApplicationModel = function (am){
				this.applicationModel = am;
				am.registerListener("model", this);
				am.registerListener("group", this);
				am.registerListener("risk", this);
				
			}
			
			AbstractRiskModelView.prototype.getApplicationModel = function (){
				return this.applicationModel;
			}

			AbstractRiskModelView.prototype.showChanges = function() {
				TopLevelView.prototype.showChanges.call(this);
				
				//this.setSize();

				this.createViews();
			}
			
			
			AbstractRiskModelView.prototype.removeContent = function (){
				this.d3().selectAll(".riskView").remove();
				this.d3().selectAll(".riskLabel").remove();
				this.d3().selectAll(".link").remove();
				this.d3().selectAll(".labelLine").remove();

			}
						
			AbstractRiskModelView.prototype.setDimensions = function(width, height){
				this.width = width;
				this.height = height;

				this.d3().attr("width", this.width);
				this.d3().attr("height", this.height);
			}
			
			AbstractRiskModelView.prototype.modelChanged = function (model){
				TopLevelView.prototype.modelChanged.call(this, model);
				
				var bm = model.getBaseModel();
				bm.addListener("linkAdded", this, this.addLink.bind(this));
				bm.addListener("linkRemoved", this, this.removeLink.bind(this));
				bm.addListener("riskAdded", this, this.riskAdded.bind(this));
				
			}
			
			AbstractRiskModelView.prototype.riskAdded = function (risk){
				
			}


			AbstractRiskModelView.prototype.createViews = function() {
				this.createRiskViews();
				this.createLinkViews();
				this.connectComponents();

				this.layout();
			}

			AbstractRiskModelView.prototype.createRiskViews = function() {

				var risks = this.getModel().getBaseModel().getRisks();
				this.riskIdToViewMap = d3.map();
				this.riskViews = [];

				var rvs = this.riskViews;
//				var isSavedSurvey = JSON.parse(localStorage.getItem("isSavedSurvey"));
//				if (!isSavedSurvey) {
//					risks = _.shuffle(risks);
//				}
				risks.forEach(function(risk) {
					this.addRiskView(risk);
				}, this);
			}
			
			AbstractRiskModelView.prototype.createRiskLabel = function (riskView, risk){
				
				// Add a label view
				return new LabelView(this, riskView, risk.name,
						"riskLabel", this.wrapLength, this.labelFontSize);
			}
			
			AbstractRiskModelView.prototype.addRiskView = function (risk){
				var rvs = this.riskViews;
				var rv = this.createRiskView(risk);
				var lv = this.createRiskLabel(rv, risk);
				this.riskIdToViewMap.set(risk.id, rv);
				rvs.push(rv);
				rv.id = rvs.indexOf(rv);
				return rv;
			}
			
			AbstractRiskModelView.prototype.getHeight = function() {
				return this.height;
			}

			AbstractRiskModelView.prototype.getWidth = function() {
				return this.width;
			}

			AbstractRiskModelView.prototype.getLayoutStrategy = function() {
				return this.layoutStrategy;
			}

			AbstractRiskModelView.prototype.getRiskViews = function() {
				return this.riskViews;
			}

			AbstractRiskModelView.prototype.getLinkViews = function() {
				return this.linkViews;
			}

			AbstractRiskModelView.prototype.layout = function() {
				if (! this.layoutStrategy){
					return;
				}
				chai.assert.isNotNull(this.layoutStrategy);

				var dim = this.getLayoutDimensions();

				this.layoutStrategy.layout(this, dim.width, dim.height);
			}

			/**
			 * Some layout algorithms involve constraint solving and may
			 * continue to operate until told to stop by this method.
			 */
			AbstractRiskModelView.prototype.stopLayout = function() {

			}

			AbstractRiskModelView.prototype.getLayoutDimensions = function() {
				return {
					width : this.width,
					height : this.height
				};
			}
			
			AbstractRiskModelView.prototype.removeLink = function (link){
				var lv = this.getLinkView(link);
				if (! lv){
					return;
				}

				this.linkToViewMap.remove(link);
				lv.detach();
				
				this.linkViews.splice(this.linkViews.indexOf(lv), 1);
				this.notifyListeners();
			}
			
			AbstractRiskModelView.prototype.addLink = function (link){
				var lv = this.createLinkView(link);
				if (lv == null) {
					return;
				}
				this.linkToViewMap.set(link, lv);
				lv.source = this.getView(link.src);
				lv.target = this.getView(link.dest);
				lv.show(false);
				this.linkViews.push(lv);
				this.notifyListeners();
				return lv;
			}

			AbstractRiskModelView.prototype.createLinkViews = function() {
				this.linkToViewMap = d3.map();
				this.linkViews = [];

				var i = 0;
				this.getModel().getBaseModel().links.forEach(function(link) {
					var lv = this.addLink(link);
					if (lv){
						lv.d3().attr("id", "lv" + i);
					}
					i++;
				}, this);
			}

			AbstractRiskModelView.prototype.createGroupViews = function(groups) {
				this.groupViews = [];
				groups.forEach(function(group) {
					var gv = this.createGroupView(group);
					this.groupViews.push(gv);
				}, this);

			}

			AbstractRiskModelView.prototype.getViewByRiskId = function(riskId) {
				if (this.riskIdToViewMap.has(riskId)) {
					return this.riskIdToViewMap.get(riskId);
				};

				return undefined;
			}

			AbstractRiskModelView.prototype.getView = function(risk) {
				return this.getViewByRiskId(risk.id);
			}

			AbstractRiskModelView.prototype.getLinkView = function(link) {

				// TODO There will be a more efficient way to find a view from a
				// link.
				for (var i = 0; i < this.linkViews.length; i++) {
					var lv = this.linkViews[i];
					if (lv.link == link) {
						return lv;
					}
				}

				return undefined;
			}

			AbstractRiskModelView.prototype.highlightLinks = function(links){
				var lvs = this.linkViews.forEach(function(lv) {
					if (links.indexOf(lv.link) >= 0) {
						lv.highlight();		
					}
				}, this);
			}

			AbstractRiskModelView.prototype.greyOut = function(opacity) {

				this.riskViews.forEach(function(rv) {
					rv.greyOut(opacity);
				});

				this.linkViews.forEach(function(lv) {
					lv.greyOut(opacity);
				});

			}

			AbstractRiskModelView.prototype.updateRisks = function() {
				this.riskViews.forEach(function(rv) {
					rv.update();
				});
			}


			AbstractRiskModelView.prototype.highlightRiskArea = function(risk) {
				// this.greyOut(0.4);

				this.highlightRisk(risk);

				// Highlight each of the associated links
				this.highlightRelatedLinks(risk);

				// Highlight the neighbours
				this.showNeighbours(risk);

			}

			AbstractRiskModelView.prototype.showNeighbours = function(risk) {
				var neighbours = this.model.findNeighbours(risk);
				neighbours.forEach(function(risk) {
					var view = this.riskIdToViewMap.get(risk.id);
					view.reset();
				}, this);
			}

			AbstractRiskModelView.prototype.bounds = function() {
				var b = {
					x : {
						min : this.width,
						max : 0
					},
					y : {
						min : this.height,
						max : 0
					}
				};
				this.riskViews.forEach(function(rv) {
					b.x.min = rv.x < b.x.min ? rv.x : b.x.min;
					b.x.max = rv.x > b.x.max ? rv.x : b.x.max;
					b.y.min = rv.y < b.y.min ? rv.y : b.y.min;
					b.y.max = rv.y > b.y.max ? rv.y : b.y.max;
				});

				return b;
			}

			AbstractRiskModelView.prototype.reset = function() {

				this.riskViews.forEach(function(rv) {
					rv.reset();
				});

				this.linkViews.forEach(function(lv) {
					lv.reset();
				});

			}
			
//			AbstractRiskModelView.prototype.setSize = function (){
//				this.setDimensions($("#viewportX").width(), window.innerHeight - this.headerHeight);				
//			}
			
			AbstractRiskModelView.prototype.resize = function (){
				this.setSize();
				this.showChanges();
				this.showGroupChanges();
				this.showRiskChanges();

				this.notifyListeners();
			}
			
			AbstractRiskModelView.prototype.highlightGroup = function(group,
					color) {
				chai.assert.instanceOf(group, models.RiskGroup);
				var v = this;

				group.risks.forEach(function(r) {
					var view = v.getView(r);
					if (view != null) {
						view.setColour(color);
					}
				});
			}

			AbstractRiskModelView.prototype.showGroupChanges = function() {
				TopLevelView.prototype.showGroupChanges.call(this);

				this.highlightGroups();
			}
			
			AbstractRiskModelView.prototype.showRiskChanges = function() {
				TopLevelView.prototype.showRiskChanges.call(this);
				if (! this.getRisk()){
					return;
				}


				this.getView(this.getRisk()).show(false);
			}


			AbstractRiskModelView.prototype.highlightGroups = function() {
				var group = this.getGroup();
				if (!group){
					return;
				}
				var groups = group.getGroups();

				var risks = this.getModel().getBaseModel().getRisks();
				risks.forEach(function(r) {
					var riskGroup = group.getGroupOfRisk(r.id);
					var view = this.getView(r);
					if (view != null) {
						var index = groups.indexOf(riskGroup);
						view.setGroup(index);
					}
				}, this);

				var risk = this.getRisk();
				if (risk && this.getView(risk)) {
					this.getView(risk).highlight();
				}
			}

			/**
			 * For drawing purposes we need to connect all components so that
			 * the graph layout algorithms can deal nicely with the graph.
			 */
			AbstractRiskModelView.prototype.connectComponents = function() {
				var components = this.getModel().getBaseModel().getComponents();
				
				this.componentLinks = [];

				if (components.length <= 1) {
					return;
				}

				var prev = null;
				components.forEach(function(c) {
					var node = this.getView(c[0]);
					if (prev != null) {
						var link = {
							source : prev,
							target : node
						};
						this.componentLinks.push(link);
					}

					prev = node;
				}, this);

			}

			AbstractRiskModelView.prototype.update = function() {

				this.updateRisks();

				this.linkViews.forEach(function(link) {
					link.update();
				});

				this.groupViews.forEach(function(gv) {
					gv.update();
				});

			}
			

			function RiskModelView(targetDocument, element) {
				AbstractRiskModelView.call(this, targetDocument, "svg");
			}

			views.RiskModelView = RiskModelView;

			RiskModelView.prototype = Object
					.create(AbstractRiskModelView.prototype);
			RiskModelView.prototype.constructor = RiskModelView;

			RiskModelView.prototype.createLinkView = function(link) {
				var lv = new LinkView(this, link);
				return lv;
			}

			RiskModelView.prototype.getChildInsertionPoint = function() {
				return this.content;
			}

			RiskModelView.prototype.createRiskView = function(risk) {

				// Add a risk view
				var rv = new RiskView(this, risk);

				return rv;
			}

			RiskModelView.prototype.createGroupView = function(group) {
				var gv = new GroupHullView(this, group);

				return gv;
			}

//			RiskModelView.prototype.showRiskChanges = function() {
//				AbstractRiskModelView.prototype.showRiskChanges.call(this);
//
//				var risk = this.getRisk();
//				if (!risk) {
//					return;
//				}
//				this.highlightRiskArea(risk);
//
//			}

			/**
			 * Provides the chart view of the risk model.
			 */

			function GroupLegend(targetDocument) {
				TopLevelView.call(this, targetDocument, "div");
				this.d3().attr("class", "groupLegend");

				var control = this.d3().append("div").attr("class",
						"btn-group groupHighlightControl dropdown");
				var button = control.append("button");
				button
						.attr("class",
								"btn btn-success btn-xs dropdown-toggle groupHighlightButton")
						.attr("data-toggle", "dropdown").attr("data-placement",
								"bottom").attr("type", "button").attr("title",
								"Risk Group Highlighting");

				button.append("span").attr("class", "btn-text").text(
						"Basic Highlighting ");
				button.append("span").attr("class", "caret");

				var selections = control.append("ul").attr("class",
						"dropdown-menu").attr("role", "menu");

				var items = [ "Basic Highlighting",
						"Edge Betweeness Highlighting",
						"Top 5 Effect Centrality" ];
				this.items = items;

				items.forEach(function(item) {
					var li = selections.append("li");
					var a = li.append("a").attr("href", "#");
					a.text(item);
				});

				app.App.registerListener("group", this);

			}

			views.GroupLegend = GroupLegend;
			GroupLegend.prototype = Object.create(TopLevelView.prototype);
			GroupLegend.prototype.constructor = GroupLegend;

			GroupLegend.prototype.getItems = function() {
				return this.items;
			}

			GroupLegend.prototype.groupChanged = function(group) {
				TopLevelView.prototype.groupChanged.call(this, group);

				this.d3().select("svg").remove();
				var svg = this.d3().append("svg");

				var group = this.getGroup();
				var groups = group.getChildren();

				var control = this.d3().select(".groupHighlightControl")
				control.select(".btn-text").text(group.getName());
				control.style("display", "inline");

				var gap = 4;
				var xPos = gap;

				var cs = new ColourStrategy();

				groups.forEach(function(g) {
					var groupLabel = svg.append("g")
							.attr("class", "groupLabel");
					var colour = cs.getColourForGroup(g, group);
					var swatch = groupLabel.append("rect").attr("width", 20)
							.attr("height", 20).style("fill", colour);
					var label = groupLabel.append("text").text(g.getName());
					var bb = swatch.node().getBBox();
					var bbt = label.node().getBBox();
					var textY = bb.height / 1.5;
					var textX = bb.width + 5;
					label.attr("transform", "translate(" + textX + "," + textY
							+ ")");

					groupLabel.attr("transform", "translate(" + xPos + ","
							+ gap + ")");
					xPos += groupLabel.node().getBBox().width + 5;
				}, this);

				var bb = svg.node().getBBox();

				var width = bb.width + 2 * gap;
				var height = bb.height + 2 * gap;
				svg.attr("width", width).attr("height", height);
				svg.insert("rect", ":first-child").attr("width", width).attr(
						"height", height).attr("class", "container").style(
						"fill", "white");

			}

			function AbstractLinkView(parentView, link) {
				chai.assert.instanceOf(link, models.RiskLink);

				View.call(this, parentView, "g", true);
				this.d3().classed("link", true).attr("data-src", link.src.id)
				.attr("data-dest", link.dest.id);

				this.d3().datum(link);


				this.source = -1;
				this.target = -1;
				this.link = link;
				this.s = d3.scale.linear();
				this.s.domain([ 0, 1 ]);
				this.s.range([ 20, 150 ]);
				this.weight = null;

			}

			AbstractLinkView.prototype = Object.create(View.prototype);
			AbstractLinkView.prototype.constructor = AbstractLinkView;
			views.AbstractLinkView = AbstractLinkView;

			AbstractLinkView.prototype.getLink = function() {
				return this.link;
			}
			
			AbstractLinkView.prototype.getInsertionPoint = function (parent){
				return parent.d3().select(".links");
			}


			AbstractLinkView.prototype.getWeight = function() {
				

				if (!this.weight) {
					var ms = this.getParent().getModel().getMeasurementSet();
					var metric = ms.getMetric("Weight");
					if (!metric){
						this.weight = 1.0;
						return this.weight;
					}
					this.weight = ms.getMeasurement(metric, this.link);
					if (! this.weight) {
						this.weight = 1.0;
					}
				}

				return this.weight;
			}

			AbstractLinkView.prototype.getLinkWidth = function(widths) {
				if (!this.linkWidth) {
					var weight = this.getWeight();
					if (weight == 0){
						this.linkWidth = 2;
						return this.linkWidth;
					}
					var interval = new models.Closed(0.0, 1.0);
					var intervalSet = interval.divideInto(widths.length);
					var index = intervalSet.indexOf(intervalSet
							.getInterval(weight));
					this.linkWidth = widths[index];
				}

				return this.linkWidth;

			}
			
			AbstractLinkView.prototype.reset = function (){
				
			}

			/**
			 * 
			 */

			function reduce(s, e, r) {
				var l = lineLength(s, e);
				var nl = Math.abs(l - r);
				var xv = (e.x - s.x) / l;
				var x = s.x + xv * r;
				var yv = (e.y - s.y) / l;
				var y = s.y + yv * r;

				return {
					x : x,
					y : y
				};
			}

			function lineLength(s, e) {
				return Math.sqrt(Math.pow(e.y - s.y, 2)
						+ Math.pow(e.x - s.x, 2));
			}

			function AbstractRiskView(parentView, risk, element) {
				chai.assert.isNotNull(parentView);
				chai.assert.instanceOf(risk, models.Risk);

				View.call(this, parentView, element);
				this.d3().attr("class", "riskView");
				this.d3().datum(risk);

				this.risk = risk;
				this.setGroup(-1);
			}

			AbstractRiskView.prototype = Object.create(View.prototype);
			AbstractRiskView.prototype.constructor = AbstractRiskView;
			views.AbstractRiskView = AbstractRiskView;

			AbstractRiskView.prototype.startPulse = function (){
				this.d3().select(".shape").classed("pulsing", true);
			}
			
			AbstractRiskView.prototype.stopPulse = function (){
				this.d3().select(".shape").classed("pulsing", false);
			}


			AbstractRiskView.prototype.getRisk = function() {
				return this.risk;
			}
			
			AbstractRiskView.prototype.highlight = function (){
				this.labelView.highlight();
				this.d3().classed("highlighted", true);
				//this.startPulse();

			}
			
			AbstractRiskView.prototype.reset = function (){
				this.labelView.reset();
				this.d3().classed("highlighted", false);
				this.stopPulse();

			}
			
			AbstractRiskView.prototype.getInsertionPoint = function (parent){
				return parent.d3().select(".risks");
			}



			/**
			 * Some risk views do not support the setting of the group name.
			 * 
			 * @param text
			 */
			AbstractRiskView.prototype.setText = function(text) {

			}
			
			AbstractRiskView.prototype.setGroup = function (index){
				this.d3().attr("data-group", index);
			}

			/**
			 * 
			 */
			function RiskView(parentView, risk) {
			
				AbstractRiskView.call(this, parentView, risk, "g");
				this.id = -1;
				this.x = 0;
				this.y = 0;
				this.z = 0;
				this.riskMap = JSON.parse(localStorage.getItem("riskMap"));
                var plottedRisk =  JSON.parse(localStorage.getItem("riskStatuses"));
                this.riskStatusLocal = _.findWhere(plottedRisk, {name: risk.name});
				
				this.d3().attr("cx", this.x).attr("cy", this.y);
				this.radius = 10;

				// Render the circle
				var shadow = this.d3().append("circle").attr("class", "shadow");
				shadow.style("stroke-width", 2);

				var shape = this.d3().append("circle").attr("class", "shape");

	            var text = this.d3().append("text").text("");
				text.attr("pointer-events", "none");
				this.labelLink = null;

				try {
					var bb = this.getDocument().getBBox();
					this.width = bb.width;
					this.height = bb.height;
				} catch(exception) {
				}

			}
			
			RiskView.prototype = Object.create(AbstractRiskView.prototype);
			RiskView.prototype.constructor = RiskView;

			RiskView.prototype.getRadius = function() {
				return this.radius;
			}
			
			RiskView.prototype.dragUpdate = function() {
				angular.element(document.getElementById('LikeVsSeve')).scope().setdirty();
                if(this.riskStatusLocal.isPlotted == false){
                	this.riskStatusLocal.isPlotted = true;
                	angular.element(document.getElementById('LikeVsSeve')).scope().updateRiskStatusAsPloted(this.risk.id);
                	angular.element(document.getElementById('LikeVsSeve')).scope().remingRiskCalculateLike();
                	angular.element(document.getElementById('LikeVsSeve')).scope().calculatePercentagerSevVsLike();
                	angular.element(document.getElementById('LikeVsSeve')).scope().resetTimer();
                }
				this.x = d3.event.x;
				this.y = d3.event.y;
				this.update();
			}
			
			RiskView.prototype.setRadius = function(radius) {
				this.radius = radius;
			}
			

			RiskView.prototype.reset = function() {
				AbstractRiskView.prototype.reset.call(this);

				this.d3().select(".shape").classed("pulsing", false);
				if (this.menu){
					this.menu.d3().remove();
					this.menu = null;
				}

			}
			
			RiskView.prototype.getMenu = function (){
				return this.menu;
			}

			RiskView.prototype.pulse = function() {
				this.d3().classed("pulsing", true);

			}

			RiskView.prototype.setColour = function(colour) {
				this.d3().select(".shape").style("fill", colour).style(
						"stroke", colour);
				this.d3().select(".shadow").style("stroke", colour).style(
						"fill", "none");

				this.colour = colour;
			}


			RiskView.prototype.greyOut = function(opacity) {
				this.d3().style("opacity", opacity);
			}

			RiskView.prototype.highlight = function() {
				AbstractRiskView.prototype.highlight.call(this);
				highlightRiskOnClickAndDrag(this);
			
			}
			
			function highlightRiskOnClickAndDrag(riskObj){
				
				riskObj.d3().select(".shape").style('fill','#D8D7D7');
				if(d3.event != null && (d3.event.type=="drag" || d3.event.type=="click")){
					if (riskObj.riskMap){
						var riskName = riskObj.risk.name;
                        var riskDesc = riskObj.riskMap[riskName];
						var riskNameSize = 0;
						var riskDescSize = 0;
						if(riskName) {
							riskNameSize = riskName.length;
							document.getElementById('selectedRiskName').innerHTML = riskName +" : ";
						}else {
							document.getElementById('selectedRiskName').innerHTML = "";
						}
						if(riskDesc) {
							riskDescSize = riskDesc.length;
							document.getElementById('selectedRiskDesc').innerHTML = riskNameSize+riskDescSize > 100 ? 
									riskDesc.substring(0,100-riskNameSize)+"..." : riskDesc;
							
						}else{
							document.getElementById('selectedRiskDesc').innerHTML = "";
						}
					}
					if(views.prevRisk){
						views.prevRisk.labelView.d3().select('text').style('fill','#666666').style('font-weight','normal');
						views.prevRisk.d3().select(".shape").style('fill','#D8D7D7');
					}
					views.prevRisk = riskObj;
					riskObj.d3().select(".shape").style('fill','#0091DA');
					riskObj.labelView.d3().select('text').style('fill','#0091DA').style('font-weight','bold');
				}
			}
			
		
			RiskView.prototype.update = function() {
				var shape = this.d3().select(".shape");
				var shadow = this.d3().select(".shadow");
				
				highlightRiskOnClickAndDrag(this);
				
				this.d3().attr("transform",
						"translate(" + this.x + "," + this.y + ")");
				shape.attr("r", this.radius);
				var plottedRisk =  JSON.parse(localStorage.getItem("riskStatuses"));
                this.riskStatusLocal = _.findWhere(plottedRisk, {name: this.risk.name});
                
				if(this.x == 0 && this.y==695  ){
					if(this.riskStatusLocal.isPlotted == true){
						angular.element(document.getElementById('LikeVsSeve')).scope().updateRiskStatusAsNotPloted(this.risk.id);
	                	angular.element(document.getElementById('LikeVsSeve')).scope().remingRiskCalculateLike();
	                	angular.element(document.getElementById('LikeVsSeve')).scope().calculatePercentagerSevVsLike();
	                	angular.element(document.getElementById('LikeVsSeve')).scope().resetTimer();
					}
				}
				
				this.d3().select("text").attr("dx", "-0.25em").attr("dy",
						"0.27em");
				shadow.attr("r", this.radius + 3);

				if (!this.labelView.offsetX){
					this.labelView.offsetX = 0;
				}
				
				if (!this.labelView.offsetY){
					this.labelView.offsetY = this.getRadius() + 10;
				}

				this.labelView.update();
			}

			RiskView.prototype.getShapeBBox = function() {
				return this.d3().select(".shape").node().getBBox();
			}

//			function RiskDetailView (){
//				TopLevelView.call(this, d3.select("body").node(), "div");
//				
//				this.d3().classed("risk-detail-view", false);
//				this.d3().classed("riskless", true);
//				this.d3().classed("editable", true);
//				this.d3().classed("editing", true);
//				
//				var main = this.d3().append("div").classed("main", true);
//
//				var ta = main.append("textarea").classed("risk-name-input", true);
//				ta.attr("disabled", "disabled");
//				ta.attr("cols", 30);
//				main.append("div").classed("separator", true);
//				this.d3().append("span").attr("class", "toggle glyphicon glyphicon-triangle-right");
//
//				this.dotSize = 20;
//
//				var s = this.dotSize;
//				var list = main.append("div").attr("class", "risk-categories list-group");
//				
////				var newItem = list.append("div").classed("list-group-item", true);
////				newItem.append("span").attr("class", "glyphicon glyphicon-plus").classed("item-icon", true);
////				newItem.append("input").attr("placeholder", "New Category").classed("item-text", true);
////				newItem.append("a").text("Add").classed("add", true);
////				newItem.classed("new", true);
//				
//				var buttons = main.append("div").classed("buttons", true);
//				this.deleteButton = new Button(buttons.node(), "delete");
//				this.doneButton = new Button(buttons.node(), "done");
//				this.editButton = new Button(buttons.node(), "edit");
//				this.doneButton.disable();
//								
//				app.App.registerListener("group", this);
//				app.App.registerListener("risk", this);
//			}
//			
//			RiskDetailView.prototype = Object.create(TopLevelView.prototype);
//			RiskDetailView.prototype.constructor = RiskDetailView;
//			views.RiskDetailView = RiskDetailView;
//			
//			RiskDetailView.prototype.clearCategories = function(){
//				this.d3().selectAll(".risk-category").remove();
//			}
//			
//			RiskDetailView.prototype.setSelected = function (group){
//				this.d3().selectAll(".risk-categories a").classed("selected", false);
//				var selectedItem = this.d3().selectAll(".risk-categories a").filter(function (d){
//					return d == group;
//				});
//				selectedItem.classed("selected", true);
//			}
//			
//			RiskDetailView.prototype.addCategory = function (group, i){
//				/*var s = this.dotSize;
//				var m = this.d3().select(".risk-categories");
//				var item = m.insert("a", ".new").classed("list-group-item", true).classed("risk-category", true);
//				var icon = item.append("span").classed("item-icon", true);
//				icon.append("span").attr("class", "tick glyphicon glyphicon-ok");
//				var svg1 = icon.append("svg").attr("height", s).attr("width", s);
//				var circle = svg1.append("circle").attr("cx", s/2).attr("cy", s/2).attr("r", s/2);
//				var name = group.getName() == "Categories" ? "Uncategorized" : group.getName();
//				item.append("span").text(name).classed("item-text", true);
//				item.datum(group);
//				item.append("span").classed("view", true).classed("active", true);
//				circle.attr("data-group", i);*/
//			}
//			
//			RiskDetailView.prototype.showGroupChanges = function (){
//				TopLevelView.prototype.showGroupChanges();
//				var group = this.getGroup();
//				this.addCategories(group);
//				var risk = app.App.getRisk();
//				
//				if (risk){
//					var g = group.getGroupOfRisk(risk.id);
//					this.setSelected(g);
//				}
//			}
//			
//			RiskDetailView.prototype.addCategories = function (group){
//				this.clearCategories();
//				if (group){
//					this.addCategory(group, -1);
//
//					group.getChildren().forEach(function (g, i){
//						this.addCategory(g, i);
//					}, this);
//				}
//				this.notifyListeners();
//			}
//			
//			RiskDetailView.prototype.riskChanged = function (risk){
//				if (risk == null){
//					this.d3().classed("riskless", true);
//					return;
//				}
//				
//				this.d3().classed("riskless", false);
//				var rows = Math.ceil(risk.getName().length/30);
//				var input = this.d3().select(".risk-name-input").attr("rows", rows);
//				input.node().value = risk.getName();
//				
//				var g = app.App.getGroup().getGroupOfRisk(risk.id);
//				this.setSelected(g);
//
//			}
//			
//			RiskDetailView.prototype.groupChanged = function (group){
//				TopLevelView.prototype.groupChanged.call(this, group);
//				
//				this.addCategories(group);
//			}
			
			function TextBox(text, width, fontSize) {
				this.text = text;
				this.width = width;
				this.fontSize = fontSize;
				this.lineHeight = 1.2;
				this.maxWidth = 0;

				this.lines = [];
				this.wrap();

			}
			views.TextBox = TextBox;

			TextBox.prototype.wrap = function() {
				var text = this.text;
				var width = this.width;

				var words = text.trim().split(/\s+/).reverse();
				var word = null;
				var wordList = [];
				var maxWidth = 0;

				while (word = words.pop()) {
					wordList.push(word);
					var textLine = wordList.join(" ");
					if (this.getTextWidth(textLine) > width) {
						wordList.pop();
						this.addLine(wordList);
						wordList = [ word ];
					}
				}

				// Famous last words.
				this.addLine(wordList);
			}

			TextBox.prototype.addLine = function(wordList) {
				if (wordList.length === 0){
					return;
				}
				var textLine = wordList.join(" ");
				var lineWidth = this.getTextWidth(textLine);
				this.maxWidth = lineWidth > this.maxWidth ? lineWidth
						: this.maxWidth;
				this.lines.push(textLine);
			}

			TextBox.prototype.getTextWidth = function(text) {

				var d3Text = d3.select("#textBox").append("text").style(
						"font-size", this.fontSize + "px");
				d3Text.text(text);
				var node = d3Text.node();
				var width = node.getComputedTextLength();
				d3Text.remove();
				return width;
			}

			TextBox.prototype.getLineCount = function() {
				return this.lines.length;
			}

			TextBox.prototype.putText = function(d3Node) {
				var lines = this.lines;
				var lineHeight = this.lineHeight;
				for (var i = 1; i <= lines.length; i++) {
					var line = d3Node.append("text");
					line.text(lines[i - 1]);
					line.attr("dy", lineHeight * i + "em");
					line.style("font-size", this.fontSize + "px");
				}

				return lines.length;
			}

			TextBox.prototype.getMaxWidth = function() {
				return this.maxWidth;
			}

			TextBox.prototype.getHeight = function() {
				return this.lines.length * this.fontSize * this.lineHeight;
			}

			function BaseRect(targetDoc) {
				TopLevelView.call(this, targetDoc, "g");

				this.xMargin = 10;
				this.yMargin = 10;
				this.contentWidth = 0;
				this.contentHeight = 0;

				this.content = this.d3().append("g");

				this.rect = this.d3().insert("rect", ":first-child").attr("rx",
						6).attr("ry", 6).attr("width", 100)
						.attr("height", 50);

				this.content.attr("transform", "translate(" + this.xMargin
						+ "," + this.yMargin + ")");

			}

			BaseRect.prototype = Object.create(TopLevelView.prototype);
			BaseRect.prototype.constructor = BaseRect;

			BaseRect.prototype.setContentHeight = function(contentHeight) {
				this.height = 2 * this.yMargin + contentHeight;
				this.contentHeight = contentHeight;
				this.rect.attr("height", this.height);
			}

			BaseRect.prototype.setContentWidth = function(contentWidth) {
				this.contentWidth = contentWidth;
				this.width = this.contentWidth + 2 * this.xMargin;
				this.rect.attr("width", this.width);
			}

			BaseRect.prototype.getContentWidth = function() {
				return this.contentWidth;
			}

			BaseRect.prototype.getContentHeight = function() {
				return this.contentHeight;
			}

			BaseRect.prototype.getHeight = function() {
				return this.height;
			}

			BaseRect.prototype.getWidth = function() {
				return this.width;
			}

			BaseRect.prototype.getContent = function() {
				return this.content;
			}

			function TextRect(targetDoc, text, targetWidth, fontSize) {
				BaseRect.call(this, targetDoc);

				var textBox = new TextBox(text, targetWidth - 2 * this.xMargin,
						fontSize);
				var content = this.content;
				textBox.putText(content);
				content.selectAll("text").style("fill", "white").attr(
						"font-family", "Tahoma").attr("font-size", fontSize);

				var textHeight = textBox.getHeight();
				this.setContentHeight(textHeight);
				this.setContentWidth(textBox.getMaxWidth());
			}
			TextRect.prototype = Object.create(BaseRect.prototype);
			TextRect.prototype.constructor = TextRect;

			TextRect.prototype.getWidth = function() {
				return this.width;
			}

			TextRect.prototype.getHeight = function() {
				return this.height;
			}

			function EventRectView(targetDoc, event, width, fontSize) {
				chai.assert.instanceOf(event, models.AbstractEvent);

				TopLevelView.call(this, targetDoc, "g");
				this.event = event;

				var base = new BaseRect(targetDoc);
				this.base = base;
				base.d3().classed("event-view", true);

				var gap = fontSize;
				var margin = 5;
				var titleg = base.getContent().append("g");
				titleg.classed("event-title", true);
				var title = new TextBox(event.getName(), width - 2
						* base.xMargin, 12);
				var maxWidth = title.getMaxWidth();
				title.putText(titleg);
				titleg.selectAll("text");
				base.d3().select("rect").attr("data-event", event.getName());

				var contentHeight = title.getHeight();
				var y = title.getHeight() + 2 * gap;
				var x = 0;
				var circleRadius = 3;
				var bulletWidth = 2 * circleRadius + 4;

				event.getComments().forEach(
						function(c) {
							var box = new TextBox(c, width - bulletWidth - 2 * margin,
									fontSize);
							if (box.getMaxWidth() > maxWidth) {
								maxWidth = box.getMaxWidth();
							}

							// Create the comment line
							var cg = base.getContent().append("g").classed(
									"comment", true);
							var circle = cg.append("circle").attr("r",
									circleRadius).attr("cx", circleRadius)
									.style("fill", "white");
							var tg = cg.append("g");
							box.putText(tg);
							var boxHeight = box.getHeight();
							circle.attr("cy", circleRadius);

							// Position the text line.
							translate(tg, bulletWidth, 0 - fontSize / 2);

							// Position the comment
							translate(cg, x, y);
							contentHeight += boxHeight + gap;
							y += boxHeight + gap;
						});
				base.d3().selectAll(".comment").style("fill", "white").attr(
						"font-family", "Tahoma").attr("font-size", 10);

				base.setContentHeight(contentHeight + gap);
				base.setContentWidth(maxWidth);
			}
			EventRectView.prototype = Object.create(TopLevelView.prototype);
			EventRectView.prototype.constructor = EventRectView;

			EventRectView.prototype.getHeight = function() {
				return this.base.getHeight();
			}

			EventRectView.prototype.getWidth = function() {
				return this.base.getWidth();
			}

			function AbstractLabelView(parentView, targetView, label,
					labelClass, wrapLength, element, fontSize) {

				View.call(this, parentView, element);

				this.x = null;
				this.y = null;
				this.label = label;

				this.targetView = targetView;
				this.targetView.labelView = this;
				this.wrapLength = wrapLength;
				this.fontSize = fontSize;
				
				this.setLabel(label);
			}

			AbstractLabelView.prototype = Object.create(View.prototype);
			AbstractLabelView.prototype.constructor = AbstractLabelView;
			views.AbstractLabelView = AbstractLabelView;
			
			AbstractLabelView.prototype.getInsertionPoint = function (parent){
				return parent.d3().select(".labels");
			}
			
			AbstractLabelView.prototype.setLabel = function (newLabel){
				this.d3().selectAll("text").remove();
				var textBox = new TextBox(newLabel, this.wrapLength, this.fontSize);
				textBox.putText(this.d3());
				this.textHeight = textBox.getHeight();
				this.textWidth = textBox.getMaxWidth();
			}

			function LabelView(parentView, targetView, label, labelClass,
					wrapLength, fontSize) {
				if (label.length > 15) {
					label = label.substring(0, 20) + "..."; 
				}

				AbstractLabelView.call(this, parentView, targetView, label,
						labelClass, wrapLength, "g", fontSize);

				// Render the label
				this.d3().attr("class", labelClass + " modelLabel");
				this.d3().datum(targetView);

				this.labelLink = new LabelLink(parentView, this, targetView);
				this.offsetX = null;
				this.offsetY = null;

			}

			LabelView.prototype = Object.create(AbstractLabelView.prototype);
			LabelView.prototype.constructor = LabelView;
			views.LabelView = LabelView;

			LabelView.prototype.getHeight = function (){
				return this.textHeight;
			}
			
			LabelView.prototype.getWidth = function (){
				return this.textWidth;
			}

			LabelView.prototype.highlight = function (){
				this.d3().classed("highlighted", true);
			}
			
			LabelView.prototype.reset = function (){
				this.d3().classed("highlighted", false);
			}
			

			LabelView.prototype.update = function() {
				var bb = this.getBBox();
				this.x = this.targetView.x + this.offsetX;
				this.y = this.targetView.y + this.offsetY;

				this.d3().attr("transform",
						"translate(" + this.x + "," + this.y + ")");

				//this.labelLink.hide();
				this.labelLink.update();
			}

			LabelView.prototype.dragUpdate = function() {

				this.x = d3.event.x;
				this.y = d3.event.y;
				this.d3().attr("transform",
						"translate(" + this.x + "," + this.y + ")");
				this.offsetX = this.x - this.targetView.x;
				this.offsetY = this.y - this.targetView.y;

				this.labelLink.d3().style("display", "inline");
				this.labelLink.update();
			}

			function LabelLink(parentView, labelView, targetView) {
				View.call(this, parentView, "g", true);
				this.labelView = labelView;
				this.targetView = targetView;
				this.d3().attr("class", "labelLine");
				this.line = this.d3().append("line");
				this.circle1 = this.d3().append("circle").attr("r", 2).classed("labelLineDot", true);
				this.circle2 = this.d3().append("circle").attr("r", 2).classed("labelLineDot", true);
				//this.d3().style("display", "none");
			}

			LabelLink.prototype = Object.create(views.View.prototype);
			LabelLink.prototype.constructor = LabelLink;

			LabelLink.prototype.update = function() {

				var bb = this.labelView.getBBox();

				this.circle1.attr("cx", this.labelView.x);
				this.circle1.attr("cy", this.labelView.y + bb.height/2);
				this.circle2.attr("cx", this.targetView.x);
				this.circle2.attr("cy", this.targetView.y);
				
				this.line.attr("x1", this.labelView.x).attr(
						"y1", this.labelView.y + + bb.height/2).attr("x2",
						this.targetView.x).attr("y2", this.targetView.y);
			}
			LabelLink.prototype.getInsertionPoint = function (parent){
				return parent.d3().select(".labelLinks");
			}


			function LinkView(parentView, link) {
				chai.assert.instanceOf(parentView, RiskModelView);
				chai.assert.instanceOf(link, models.RiskLink);

				AbstractLinkView.call(this, parentView, link);

				var d3Doc = this.d3();

				// Create a scale for line weighting
				var s = d3.scale.linear();
				s.domain([ 0, 1 ]);
				s.range([ 0, 10 ]);

				var weight = this.getWeight();
				var strokeWidth = this.getLinkWidth([ 2, 4, 6, 8, 10 ]);
				
				this.d3().insert("line", ":first-child").attr("class",
				"baseline");

				var highlights = this.d3().insert("g", ":first-child").attr(
						"class", "highlight");
				highlights.append("line").style("stroke-width", strokeWidth);


				var weightBadge = highlights.append("g").attr("class",
						"weightBadge");

				var tn = weightBadge.append("text").text(weight.toFixed(2));

				weightBadge.insert("rect", ":first-child");

				this.badgeLocation = {
					x : 0,
					y : 0
				};

				this.highlights = highlights;
				this.weightBadge = weightBadge;

				this.reset();

			}

			LinkView.prototype = Object
					.create(views.AbstractLinkView.prototype);
			LinkView.prototype.constructor = LinkView;

			LinkView.prototype.hide = function() {
				this.d3().style("display", "none");
			}

			LinkView.prototype.reset = function() {
				this.d3().classed("highlighted", false);
				this.d3().select(".weightBadge").style("opacity", 0);
			}

			LinkView.prototype.getLength = function() {
				return this.s(this.weight);
			}

			LinkView.prototype.greyOut = function(opacity) {
				this.d3().select(".highlight").style("opacity", opacity);
				this.d3().select(".weightBadge").style("opacity", 0);
				this.d3().select(".baseline").style("opacity", opacity);
			}

			LinkView.prototype.highlight = function() {
				this.d3().classed("highlighted", true);
			}

			LinkView.prototype.update = function() {
				var baseline = this.d3().select(".baseline");

				if (this.source.x == this.target.x
						&& this.source.y == this.target.y) {
					return;
				}
				var source = new Vector2(this.source.x, this.source.y);
				var target = new Vector2(this.target.x, this.target.y);
				var diff = target.subtract(source);
				var direction = target.subtract(source).divide(diff.magnitude());
				var p1 = source.add(direction.multiply(this.source.getRadius() + 10));
				var p2 = target.add(direction.multiply(- this.target.getRadius() - 10));
				
				
//				var p1 = reduce(this.source, this.target, this.source
//						.getRadius() + 5);
//				var p2 = reduce(this.target, this.source, this.target
//						.getRadius() + 5);

				baseline.attr("x1", p1.x).attr("y1", p1.y).attr("x2", p2.x)
						.attr("y2", p2.y);
				
				var p3 = target.add(direction.multiply(-diff.magnitude()/2));

				this.highlights.select("line").attr("x1", p3.x)
						.attr("y1", p3.y).attr("x2", p2.x).attr("y2", p2.y);

				this.badgeLocation = {
					x : p3.x,
					y : p3.y
				};

				var bb = this.weightBadge.select("text").node()
						.getBoundingClientRect();

				var p = this.badgeLocation;
				var pad = 1;

				this.weightBadge.select("text").attr("x",
						p.x - bb.width / 2 + pad)
						.attr("y", p.y - bb.height / 2).attr("dy", "1em");

				this.weightBadge.select("rect").attr("x", p.x - bb.width / 2)
						.attr("y", p.y - bb.height / 2).attr("width",
								bb.width + 2 * pad).attr("height", bb.height);
			}

			/**
			 * 
			 */

			function MeasurementView(targetDoc, mm, ms, colour, width, height) {
				TopLevelView.call(this, targetDoc, "svg");
				this.d3().attr("width", width).attr("height", height).attr(
						"class", "measurementView");

				var metric = mm.getMetric();

				var interval = metric.interval.makeBound(ms.getMetricBounds(mm
						.getMetric()));
				var domain = interval.getEndpoints();
				var range = [ 0, width ];
				var scale = d3.scale.linear().domain(domain).range(range)
						.clamp(true);
				var value = scale(mm.getValue());

				var marker = this.d3().append("rect").attr("width", value)
						.attr("height", height).style("fill", colour);

				marker.attr("transform", "translate(5,0)");
			}

			MeasurementView.prototype = Object.create(TopLevelView.prototype);
			MeasurementView.prototype.constructor = MeasurementView;
			
			function FixedLayoutStrategy(positions){
				this.positions = positions;
			}

			FixedLayoutStrategy.prototype = Object
					.create(LayoutStrategy.prototype);
			FixedLayoutStrategy.prototype.constructor = FixedLayoutStrategy;
			views.FixedLayoutStrategy = FixedLayoutStrategy;


			FixedLayoutStrategy.prototype.layout = function (view, width, height){
				this.positions.forEach(function (p){
					var v = view.getView(p.uri);
					v.x = p.x;
					v.y = p.y;
				});
			} 
			/**
			 * 
			 */
			function ForceLayoutStrategy() {
				this.layoutEngine = cola.d3adaptor();
			}

			views.ForceLayoutStrategy = ForceLayoutStrategy;

			ForceLayoutStrategy.prototype = Object
					.create(LayoutStrategy.prototype);
			ForceLayoutStrategy.prototype.constructor = ForceLayoutStrategy;
			views.ForceLayoutStrategy = ForceLayoutStrategy;

			ForceLayoutStrategy.prototype.stop = function() {
				this.layoutEngine.stop();
			}
			
			ForceLayoutStrategy.prototype.start = function() {
				this.layoutEngine.start();
			}
			ForceLayoutStrategy.prototype.layout = function(view, width, height) {

				this.layoutEngine.on("tick", function() {
					view.update()
				});

				var ms = view.getModel().getMeasurementSet();
				var s = d3.scale.linear();
				var numLinks = view.linkViews.length;
				
				s.domain([ 0, 1 ]);
				s.range([ 100, 200 ]);

				function f(x) {
					if (x.getLink) {
						var weight = ms.getMeasurementByName("Weight", x
								.getLink());
						var linkDistance = s(1 - weight);
						return linkDistance;
					}
					return 80;
				}
				this.layoutEngine.size([ width, height ]).avoidOverlaps(true)
						.handleDisconnected(true);
				this.layoutEngine.defaultNodeSize(20);
				this.layoutEngine.linkDistance(f);
				
				var nodes = view.riskViews;
				var links = view.linkViews;

				if (view.componentLinks.length > 0) {
					links = view.linkViews.concat(view.componentLinks);
					
				}

				this.layoutEngine.nodes(nodes).links(links).start(60, 60, 60, 60);

			}

			function PanelView(name, title) {
				var panelName = name + "Panel";
				var element = null;

				// See if the panel is already there.
				var node = d3.select("#" + panelName).node();

				// If not then get the content pane
				if (!node) {
					node = d3.select("#content").node();
					element = "div";
				}

				TopLevelView.call(this, node, element);

				this.name = name;
				this.title = title;
				
				var height = d3.select("#content").style("height");

				// NB The content pane is made the same height as the content element.
				this.d3().attr("id", panelName).classed("content-pane", true)
						.classed("col-md-12", true).style("height", height);
			}
			;

			PanelView.prototype = Object.create(TopLevelView.prototype);
			PanelView.prototype.constructor = PanelView;
			views.PanelView = PanelView;

			PanelView.prototype.getTitle = function() {
				return this.title;
			}
			
			PanelView.prototype.setSize = function (width, height){
				this.d3().style("width", width +"px");
				this.d3().style("height", height + "px");

			}

			function ModelPanelView(name, title, modelElement) {
				PanelView.call(this, name, title);

				this.modelContent = this.d3().append("div").attr("id", name);
				this.applicationModel = new app.Application();

				//this.modelChangedFlag = false;

			}

			ModelPanelView.prototype = Object.create(PanelView.prototype);
			ModelPanelView.prototype.constructor = ModelPanelView;

			ModelPanelView.prototype.hideModelSelector = function() {
				this.d3().select(".model-selector").style("display", "none");
			}
			
			ModelPanelView.prototype.getApplicationModel = function (){
				return this.applicationModel;
			}
			
			ModelPanelView.prototype.setApplicationModel = function (am){
				this.applicationModel = am;
				am.registerListener("model", this);
				am.registerListener("group", this);
				am.registerListener("risk", this);
			}
	

			function GraphicalPanelView(name, title, modelElement) {
				ModelPanelView.call(this, name, title, modelElement);

				this.modelView = this.createModelView();
				var id = GraphicalPanelView.prototype.count++;
			}

			GraphicalPanelView.prototype = Object
					.create(ModelPanelView.prototype);
			GraphicalPanelView.prototype.constructor = GraphicalPanelView;
			GraphicalPanelView.prototype.count = 0;
			views.GraphicalPanelView = GraphicalPanelView;

			GraphicalPanelView.prototype.getModelView = function() {
				return this.modelView;
			}
			
			GraphicalPanelView.prototype.show = function (animate){
				ModelPanelView.prototype.show.call(this, animate);
				
				if (this.modelView){
					this.modelView.show(false);
				}
			}
			
			GraphicalPanelView.prototype.setApplicationModel = function (am){
				ModelPanelView.prototype.setApplicationModel.call(this, am);
				
				if (this.modelView){
					this.modelView.setApplicationModel(am);
				}
			}

			
			function NetworkPanelView(name, title, modelElement) {
				GraphicalPanelView.call(this, name, title, modelElement);
				
				var buttons = this.d3().append("div").classed("buttons", true);

				this.thresholdGroup = buttons.append("div").classed(
						"thresholdControl", true).classed("btn-group", true);
				this.down = this.createButton(this.thresholdGroup);
				this.down.classed("downThreshold", true).classed(
						"glyphicon-minus", true).attr("title",
						"Decrease the threshold for link weight");

				this.up = this.up = this.createButton(this.thresholdGroup);
				this.up.classed("upThreshold", true).classed("glyphicon-plus",
						true).attr("title",
						"Increase the threshold for link weight");

			}

			NetworkPanelView.prototype = Object
					.create(GraphicalPanelView.prototype);
			NetworkPanelView.prototype.constructor = NetworkPanelView;
			views.NetworkPanelView = NetworkPanelView;

			NetworkPanelView.prototype.hideThresholdGroup = function() {
				this.thresholdGroup.style("display", "none");
			}

			NetworkPanelView.prototype.createButton = function(target) {
				var btn = target.append("button").attr("class",
						"btn btn-primary btn-xs glyphicon").attr("type",
						"button").attr("data-toggle", "tooltip").attr(
						"data-placement", "bottom");
				btn.attr("disabled", "disabled");

				return btn;
			}

			NetworkPanelView.prototype.showChanges = function() {
				GraphicalPanelView.prototype.showChanges.call(this);

				this.up.attr("disabled", null);
				this.down.attr("disabled", null);
			}

			function BottlenosePanel() {
				PanelView.call(this, "bottlenose", "Current Events");
				this.initialised = false;
				this.d3().append("h3");
				var comments = this.d3().append("ul").classed("comments", true);

				var row = this.d3().append("div").classed("row", true);
				var c1 = row.append("div").attr("class", "col-md-4 col1");
				var c2 = row.append("div").attr("class", "col-md-4 col2");
				var c3 = row.append("div").attr("class", "col-md-4 col3");
				
				var tbl = c1.append("table").classed("events-metric-table",
						true);
				var tr1 = tbl.append("tr");
				tr1.append("td").text("Activity Score:");
				tr1.append("td").text("2.5/10");

				var tr2 = tbl.append("tr");
				tr2.append("td").text("Volume (Wk):");
				tr2.append("td").text("37 mentions");

				var tr3 = tbl.append("tr");
				tr3.append("td").text("Velocity (Wk):");
				tr3.append("td").text("67% against last period");
				
				c1.append("div").classed("visualisations", true);
				c2.append("div").classed("visualisations", true);
				c3.append("div").classed("visualisations", true);

				this.hide();
			}

			BottlenosePanel.prototype = Object.create(PanelView.prototype);
			BottlenosePanel.prototype.constructor = BottlenosePanel;
			views.BottlenosePanel = BottlenosePanel;

			BottlenosePanel.prototype.showEventChanges = function() {

				var e = this.getEvent();
				var components = this.d3().selectAll(".visualisations .component");
				components.remove();

				if (e == null) {
					this.d3().select("h3").text("No Event Selected");
					return;
				}
				
				this.d3().select("h3").text(e.name);
				var comments = this.d3().select(".comments");
				comments.selectAll("li").remove();
				e.getComments().forEach(function (c){
					comments.append("li").text(c);
				});

				var ctx = new models.Context();
				ctx.organisation = this.getOrganisation();
				
				var rq = new svr.GetRequest();
				rq.setContext(ctx);
				rq.setPath("/events/visualisations");
				rq.addParameter("eventId", e.id);
				rq.setSuccess(this.showVisualisations.bind(this));
				rq.run();

			}
			
			BottlenosePanel.prototype.showVisualisations = function (visualisations){
				
				visualisations.forEach(function (mv){
					switch (mv.title){
					case "Total Volume (Week)":
						var vis = this.d3().select(".col2 .visualisations");
						var comp = vis.append("div").classed("component", true);
						comp.append("h3").text(mv.title);
						comp.append("iframe").attr("src", mv.contentURI).classed("volume", true);
						break;
					case "Sentiment (Week)":
						var vis = this.d3().select(".col1 .visualisations");
						var comp = vis.insert("div", ":first-child").classed("component", true);
						comp.append("h3").text(mv.title);
						comp.append("iframe").attr("src", mv.contentURI).classed("sentiment", true);
						break;
					case "Most Mentions Topic Leaderboard (Week)":
						var vis = this.d3().select(".col1 .visualisations");
						var comp = vis.append("div").classed("component", true);
						comp.append("h3").text(mv.title);
						comp.append("iframe").attr("src", mv.contentURI).classed("leaderboard", true);
						break;
					case "Most Common Mentions Table (Week)":
						var vis = this.d3().select(".col3 .visualisations");
						var comp = vis.append("div").classed("component", true);
						comp.append("h3").text(mv.title);
						comp.append("iframe").attr("src", mv.contentURI).classed("tweets", true);
						break;
					case "Sonar":
						var vis = this.d3().select(".col2 .visualisations");
						var comp = vis.append("div").classed("component", true);
						comp.append("h3").text(mv.title);
						comp.append("iframe").attr("src", mv.contentURI).classed("sonar", true);
						break;

					default:
							
					var vis = this.d3().select(".visualisations");
					var comp = vis.append("div").classed("component", true);
					comp.append("h3").text(mv.title);
					comp.append("iframe").attr("src", mv.contentURI);
						
					}
					
					
					
				}, this);		
			}


			function ErrorView() {
				TopLevelView.call(this, d3.select("body").node(), "div");

				this.d3().attr("class",
						"alert alert-dismissable")
						.attr("role", "alert");
				var btn = this.d3().append("button").attr("type", "button").attr("class",
						"close").attr("data-dismiss", "alert");
				btn.append("span").attr("class", "glyphicon glyphicon-remove-circle");
				this.d3().append("span").attr("class", "alertContent message");

				this.hide();

			}
			
			ErrorView.prototype = Object.create(TopLevelView.prototype);
			ErrorView.prototype.constructor = ErrorView;
			views.ErrorView = ErrorView;
			
			ErrorView.prototype.showMessage = function (message){
				this.d3().select(".alertContent.message").text(message);
				this.show();
			}


			function ColourStrategy() {

				// var scheme = new colorScheme;
				// scheme.from_hue(50).scheme("triade");
				this.groupFillColours = [ "00338d", "009fda", "00257a",
						"9e3039", "6464c8", "007c92", "c84e00", "7ab800",
						"8e258d", "f7d415", "007ead", "55AA55", "801515",
						"804515", "0D4D4D", "116611" ];

			}

			views.ColourStrategy = ColourStrategy;

			ColourStrategy.prototype.getColourForRisk = function(riskId, model,
					group) {

				if (! group){
					return 
				}
				var g = group.getGroupOfRisk(riskId);
				if (typeof g === "undefined") {
					return "#333333";
				}

				if (!g) {
					g = model.risks;
				}

				return this.getColourForGroup(g, group);
			}

			ColourStrategy.prototype.getColourForGroup = function(group,
					parentGroup) {
				chai.assert.instanceOf(group, models.RiskGroup);
				chai.assert.instanceOf(parentGroup, models.RiskGroup);

				var groupId = parentGroup.getChildren().indexOf(group) + 1;
				if (groupId >= this.groupFillColours.length) {
					groupId = 0;
				}
				return "#" + this.groupFillColours[groupId];
			}

			function BowTieView() {

				PanelView.call(this, "bowTie", "Bow Tie");
				this.d3().classed("bowTie", true);

				var header = this.d3().append("div").classed("header", true);

				header.append("h3").attr("class", "title").text(
						"Risk Causes and Impacts");
				this.title = "Bow Tie";
				this.currentEvent = null;
				this.eventViews = [];
				this.bowTie = null;
				this.fontSize = 12;

				this.hide();

			}

			BowTieView.prototype = Object.create(PanelView.prototype);
			BowTieView.prototype.constructor = BowTieView;
			views.BowTieView = BowTieView;

			BowTieView.prototype.showRiskChanges = function() {
				PanelView.prototype.showRiskChanges.call(this);

				var risk = this.getRisk();
				if (!risk) {
					return;
				}

				var svg = this.d3().select("svg");
				if (svg) {
					svg.remove();
				}

				var org = app.App.getOrganisation();
				
				var ctx = new models.Context();
				ctx.organisation = org;
				
				var rq = new svr.GetRequest();
				rq.setPath("/risks/bowTie");
				rq.addParameter("modelId", this.getModel().getBaseModel().id);
				rq.addParameter("riskId", risk.id);
				rq.setTransform(rq.makeBowTie.bind(this));
				rq.setSuccess(this.showBowTie.bind(this));
				rq.run();

			}

			BowTieView.prototype.getTitle = function() {
				return this.title;
			}

			BowTieView.prototype.eventChanged = function(event) {
				this.currentEvent = event;

				this.eventViews.forEach(function(v) {
					var test = event != null && v.event.name === event.name;
					v.base.d3().classed("highlighted", test);
				});
			}

			BowTieView.prototype.showBowTie = function(bowTie) {
				this.eventViews = [];
				this.currentView = null;
				this.bowTie = bowTie;

				var svg = this.d3().select("svg");
				if (svg) {
					svg.remove();
				}

				var risk = bowTie.getRisk();
				var svg = this.d3().append("svg");
				this.svg = svg;

				var svggroup = svg.append("g");
				this.svggroup = svggroup;

				var gap = 10 // Vertical gap between events.
				var marginX = 20;
				var marginY = 10;
				var lineSpace = 60;

				var rectWidth = 300;
				this.rectWidth = rectWidth;
				var nCauses = bowTie.getCauses().length;
				var nImpacts = bowTie.getImpacts().length;
				
				var centreWidth = 150;

				var width = centreWidth + 2 * marginX;

				if (nCauses > 0) {
					width += rectWidth + lineSpace; // For the causes and the
					// space for lines.
				}
				if (nImpacts > 0) {
					width += rectWidth + lineSpace;
				}

				// Create the views.
				var causeViews = _.map(bowTie.getCauses(), this.createCauseView
						.bind(this));
				var impactViews = _.map(bowTie.getImpacts(),
						this.createImpactView.bind(this));

				var h = function(m, v) {
					return m + v.getHeight() + gap
				};
				var causesHeight = _.reduce(causeViews, h, 0);
				var impactsHeight = _.reduce(impactViews, h, 0)

				var height = causesHeight > impactsHeight ? causesHeight
						: impactsHeight;

				var rect = new TextRect(this.svggroup.node(), risk.name,
						centreWidth, 12);
				rect.d3().classed("central-risk", true);
				height = height < rect.getHeight() ? rect.getHeight() : height;
				height += 2 * marginY;

				// Determine where to place the centre rectangle.
				var x = width / 2 - rect.getWidth() / 2;
				var y = height / 2 - rect.getHeight() / 2;

				// Determine the glue points for the centre rectangle.
				var glueLeft = {
					x : width / 2 - rect.getWidth() / 2,
					y : height / 2
				};
				var glueRight = {
					x : width / 2 + rect.getWidth() / 2,
					y : height / 2
				};

				rect.d3().attr("transform", "translate(" + x + "," + y + ")");

				this.riskHeight = rect.getHeight();

				var f = function(s, v) {
					var x = s.x - s.d * v.getWidth();
					v.base.d3().attr("transform",
							"translate(" + x + "," + s.y + ")");
					return {
						x : s.x,
						y : s.y + v.getHeight() + gap,
						d : s.d
					};
				};

				// Put them in place.
				_.reduce(causeViews, f, {
					x : marginX + rectWidth,
					y : marginY,
					d : 1
				});
				_.reduce(impactViews, f, {
					x : width - rectWidth - marginX,
					y : marginY,
					d : 0
				});

				var g = function(rp2, v) {
					var gp2 = {
						x : rp2.x,
						y : rp2.y + v.getHeight() / 2
					};
					var line = svggroup.insert("line", ":first-child").attr(
							"x1", rp2.gp.x).attr("x2", gp2.x).attr("y1",
							rp2.gp.y).attr("y2", gp2.y);

					var iconWidth = 25;
					var cx = gp2.x - iconWidth / 2;
					var cy = gp2.y - iconWidth / 2;
					var icon = svggroup.append("image").attr("xlink:href",
							"img/icons/svg/cross.svg").attr("width", iconWidth)
							.attr("height", iconWidth).attr("x", cx).attr("y",
									cy);

					return {
						x : rp2.x,
						y : rp2.y + v.getHeight() + gap,
						gp : rp2.gp
					};
				};

				// Create the lines
				_.reduce(causeViews, g, {
					x : marginX + rectWidth,
					y : gap,
					gp : glueLeft
				})
				_.reduce(impactViews, g, {
					x : width - rectWidth - marginX,
					y : gap,
					gp : glueRight
				});

				var bb = svggroup.node().getBBox();

				this.width = width;
				this.height = height;
				svg.attr("height", height);
				this.d3().style("min-height", window.innerHeight - 75 + "px");
				this.d3().style("min-width", width + "px");
				this.notifyListeners();
			}

			BowTieView.prototype.createCauseView = function(event) {
				var v = new EventRectView(this.svggroup.node(), event,
						this.rectWidth, this.fontSize);
				this.eventViews.push(v);
				v.base.d3().classed("cause", true);
				return v;
			}

			BowTieView.prototype.createImpactView = function(event) {
				var v = new EventRectView(this.svggroup.node(), event,
						this.rectWidth, this.fontSize);
				this.eventViews.push(v);
				v.base.d3().classed("impact", true);
				return v;
			}
			
			function ButtonGroup (document){
				TopLevelView.call(this, document, "div");
				this.d3().attr("class", "btn-group btn-group-sm");	
			}
			ButtonGroup.prototype = Object.create(TopLevelView.prototype);
			ButtonGroup.prototype.constructor = ButtonGroup;
			
			ButtonGroup.prototype.add = function (btnClass, text){
				var b = new Button(this.d3().node(), btnClass, text);
			}
			
			function Button (document, btnClass, text){
				TopLevelView.call(this, document, "button");
				this.d3().attr("type", "button").attr("class", "btn-primary btn").classed(btnClass, true);
				if (text){
					this.d3().text(text);
				}
			}
			Button.prototype = Object.create(TopLevelView.prototype);
			Button.prototype.constructor = Button;

			Button.prototype.disable = function (){
				this.d3().attr("disabled", "disabled");
			}
			Button.prototype.enable = function (){
				this.d3().attr("disabled", null);
			}
			
			function NexusPanelView (){
				GraphicalPanelView.call(this, "nexus", "Nexus", "div");
													
			}
			
			NexusPanelView.prototype = Object.create(GraphicalPanelView.prototype);
			NexusPanelView.prototype.constructor = NexusPanelView;
			views.NexusPanelView = NexusPanelView;

			NexusPanelView.prototype.createModelView = function() {
				return new NexusView(this.modelContent.node());
			}

			function NexusView(targetDocument) {
				AbstractRiskModelView.call(this, targetDocument, "svg");
				
				this.d3().classed("nexus", true);
				this.viewportWidth = 800;
				this.viewportHeight = 800;
				
				this.arcLength = null;
				this.centralRiskView = null;
				this.offset = 100;
				this.labelFontSize = 16;
				this.rotation = 0;
				this.segmentCount = 0;
				this.linkSelectionStrategy = new models.Outgoing();
				this.name = "nexus";
			}

			NexusView.prototype = Object.create(AbstractRiskModelView.prototype);
			NexusView.prototype.constructor = NexusView;
			views.NexusView = NexusView;
			
			NexusView.prototype.setViewportSize = function (width, height){
				this.d3().attr("width", width);
				this.d3().attr("height", height);
				this.viewportWidth = width;
				this.viewportHeight = height;
			}
							
			NexusView.prototype.setDimensions = function(width, height) {
				
				this.wrapLength = 200;
				this.width = Math.min(width, height);
				this.arcWidth = 0.6 * this.width;

				// TODO Hack to get the nexus past the panels buttons.
				//this.cx = 170 + this.width/2;
				//this.cy = this.width/2 + 50;
				
				this.cx = this.viewportWidth/2;
				this.cy = this.width/4 + 250;

				this.outerRadius = this.width/2;
				this.innerRadius = 0.6 * this.width/2;

				translate(this.content, this.cx, this.cy);
				
				this.d3().attr("width", width);
				this.d3().attr("height", height+100);

			}
			NexusView.prototype.createLinkView = function(link) {
				var lv = new SegmentLinkView(this, link);
				lv.highlight();
				
				lv.hide(false);
				
				return lv;
			}
			
			NexusView.prototype.showRiskChanges = function (){
				var risk = this.getRisk();
				if (! risk){
					return;
				}
				var rv = this.getView(risk);
				var riskName = risk.getName().length > 20 ? risk.getName().substring(0,19)+"...." : risk.getName();
				rv.labelView.setLabel(riskName);
			}
			
			NexusView.prototype.setMode = function (mode){
				this.linkSelectionStrategy = mode;
				if (!this.getModel()){
					return;
				}
				
				var lvs = this.linkViews.forEach(function(lv) {
					lv.reset();
				});
				this.highlightLinks(mode.selectLinks(this.getModel().getBaseModel(), this.getRisk()));

				
				this.getRiskViews().forEach(function (rv){
					rv.update(this.getModel().getBaseModel());
				}, this);
			}
			
			NexusView.prototype.setIncomingMode = function (){
				this.setMode(new models.Incoming());
				
			}
			
			NexusView.prototype.setOutgoingMode = function (){
				this.setMode(new models.Outgoing(this));
			}

			NexusView.prototype.selectLinks = function (model, risk){
				return this.linkSelectionStrategy.selectLinks(model, risk);
			}
			
			/**
			 * Calculate the arc length in radians.
			 * 
			 * @param noArcs
			 */
			NexusView.prototype.calculateArcLength = function (noOfArcs){
				return 2 * Math.PI / noOfArcs;
				
			}
			
			NexusView.prototype.createRiskView = function(risk) {

				var index = this.segmentCount++;
				var model = this.getModel().getBaseModel();
				var nRisks = model.size();
				var radius = Math.PI * 2 * this.innerRadius / ((1.5 * nRisks - 1) * 2);
				radius = radius > 20 ? 20 : radius;
				
				// Add a risk view
				//var rv = new RiskSegmentView(this, risk, index, this.innerRadius, this.outerRadius, this.arcLength);
                var completerisk =  JSON.parse(localStorage.getItem("riskStatuses"));
                var risklocal = _.findWhere(completerisk, {name: risk.name});
                var rv = new RiskCircleView(this, risk, index, this.innerRadius, this.arcLength, radius, risklocal , model);
				rv.update(model);

				return rv;
			}
			
			
			NexusView.prototype.createRiskLabel = function (riskView, risk){
//				var lv = new SegmentLabelView(this, riskView, risk.name,
//						"riskLabel", this.wrapLength, this.labelFontSize);
				var fontSize = riskView.radius < 18 ? riskView.radius : 18;
				var riskName = risk.name.length > 20 ? risk.name.substring(0,19)+"...." : risk.name;
				var lv = new RiskLabelView(this, riskView, riskName,
						"riskLabel", fontSize * 15, fontSize);

				return lv;

			}
				
			NexusView.prototype.addLink = function (link){
				

				AbstractRiskModelView.prototype.addLink.call(this, link);
				
				var rv1 = this.getView(link.src);
				rv1.update(this.getModel().getBaseModel());
				
				var rv2 = this.getView(link.dest);
				rv2.update(this.getModel().getBaseModel());

			}
						
			NexusView.prototype.removeLink = function (link){

				AbstractRiskModelView.prototype.removeLink.call(this, link);
				
				var rv1 = this.getView(link.src);
				rv1.update(this.getModel().getBaseModel());
				
				var rv2 = this.getView(link.dest);
				rv2.update(this.getModel().getBaseModel());
//				rv1.d3().classed("connected", false);
//				if (rv1.labelView){
//					rv1.labelView.d3().classed("connected", false);
//				}
				rv2.d3().classed("connected", false);
				if (rv2.labelView){
					rv2.labelView.d3().classed("connected", false);
				}
			}
			NexusView.prototype.showChanges = function (){
				var riskModel = this.getModel().getBaseModel();
				var risks = riskModel.getRisks();

				this.segmentCount = 0;
				this.arcLength = this.calculateArcLength(risks.length);
				
				this.removeContent();
								
				AbstractRiskModelView.prototype.showChanges.call(this);
								
			}
			
			NexusView.prototype.layout = function () {
					
			}
			
			NexusView.prototype.offsetSegment = function (segment, offset){
				var x = this.cx + offset * Math.cos(segment.rotationAngle);
				var y = this.cy + offset * Math.sin(segment.rotationAngle);
				segment.d3().attr("transform", "translate(" + x + ", " + y + ")");
			}
			
		
			function SegmentLinkView (parentView, link){
				AbstractLinkView.call(this, parentView, link);
				
				var rv1 = parentView.getView(link.src);
				var rv2 = parentView.getView(link.dest);
				this.rv1 = rv1;
				this.rv2 = rv2;
				
				this.d3().append("line").classed("referenceLine", true).classed("to", true)
				.attr("x1", 0).attr("y1", 0).attr("x2", rv2.cx).attr("y2", rv2.cy);
				
				var ref = new Vector2(rv2.cx, rv2.cy);
				var norm = ref.norm();
				var mag = ref.magnitude();
				var anchor = norm.multiply(mag - rv2.radius);
				var lineAnchor = norm.multiply(mag - rv2.radius - 16);
				
				var linkName = link.src.id + "-" + link.dest.id;
				var midX = (rv1.cx + rv2.cx)/2;
				var midY = (rv1.cy + rv2.cy)/2;
				var lineData = [
						{x: rv1.cx, y: rv1.cy},
						{x: midX, y: midY},
						{x: rv2.cx, y:rv2.cy}
						];
				
				var span = 100;
				var rv1Ctl = {x: rv1.cx - Math.cos(rv1.rotationAngle) * span, y: rv1.cy - Math.sin(rv1.rotationAngle) * span};
				var rv2Ctl = {x: rv2.cx - Math.cos(rv2.rotationAngle) * span, y: rv2.cy - Math.sin(rv2.rotationAngle) * span};
						
				var path = "M" + rv1.cx + "," + rv1.cy 
				+ " C" + rv1Ctl.x +"," + rv1Ctl.y 
				+ " " + rv2Ctl.x + "," + rv2Ctl.y
				+ " " + lineAnchor.x + "," + lineAnchor.y;
				
				this.smallestWidth = 2;
				
				var arrowHeadPath = "M0,0 L8,3 L0,6 Z"; 
				var arrowHeadTransform = " translate (" + anchor.x + "," + anchor.y + ") scale(3) rotate(" + rv2.rotationAngle*180/Math.PI + ") translate (-8, -3)"
					
				this.d3().append("path").attr("d", path).attr("data-link", linkName).attr("style", "stroke-width:" + this.smallestWidth + ";");
				this.d3().append("path").attr("d", arrowHeadPath).classed("arrowhead", true).attr("transform", arrowHeadTransform);
					
					
				
			}
			
			SegmentLinkView.prototype = Object.create(AbstractLinkView.prototype);
			SegmentLinkView.prototype.constructor = SegmentLinkView;
			views.SegmentLinkView = SegmentLinkView;

			SegmentLinkView.prototype.reset = function (){
				
				this.rv1.d3().classed("connected", false);
				this.rv1.labelView.d3().classed("connected", false);
				this.rv2.d3().classed("connected", false);
				this.rv2.labelView.d3().classed("connected", false);

				this.hide(false);
			}
			
			SegmentLinkView.prototype.highlight = function (){
				
				this.rv1.d3().classed("connected", true);
				this.rv1.labelView.d3().classed("connected", true);
                this.rv2.d3().classed("connected", true); //.style({fill: "#000000"})
				this.rv2.labelView.d3().classed("connected", true);
				this.show(false);


			}
			
			SegmentLinkView.prototype.step = function (){
				var path = this.d3().select(".link path");
				var width = parseInt(path.style("stroke-width"));
				var newWidth = 2 + width % 10;
				path.style("stroke-width", newWidth);
				
				
			}
			
			
			SegmentLinkView.prototype.getInsertionPoint = function (parent){
				return parent.d3().select(".links");
			}

            function RiskCircleView (parentView, risk, index, distance, arcLength, radius, risklocal,model) {
                AbstractRiskView.call(this, parentView, risk, "g");

                if (risklocal) {
                	this.isRiskTouched = risklocal.isConnected;
                } else {
                	this.isRiskTouched = false;
                }
                this.riskStatuses = parentView.riskStatuses;
                var startAngle = index * arcLength;
                this.linkCount = 0;
                this.radius = radius;
                
                this.distance = distance;
                this.innerRadius = 0;
                this.index = index;
                this.startAngle = startAngle;

                var rotateAngle = startAngle - Math.PI/2 + arcLength/2;
                this.d3().attr("data-rotationAngle", rotateAngle);
                this.cx = distance *  Math.cos(rotateAngle);
                this.cy = distance *  Math.sin(rotateAngle);

                var value = radius/2;
                this.tx = this.cx + (value)  * Math.cos(0);
                this.ty = this.cy + (value) * Math.sin(0);

                var origin = new Vector2(-2, 2);
                this.reference = new Vector2(this.cx, this.cy);
                this.textDisp = this.reference.add(new Vector2(-4, 4));
                
                this.referencecompleteIcon = new Vector2(this.tx, this.ty);
                this.completeIconPosition = this.referencecompleteIcon.add(new Vector2(-2, 2));
                
                var rg = this.d3();
                var hl = rg.append("circle");
                hl.classed("highlight", true);
                hl.attr("r", radius + 0.5 * radius);
                hl.attr("cx", this.reference.x);
                hl.attr("cy", this.reference.y);
                
                var path = rg.append("svg:circle");
                path.attr("r", radius);
                path.attr("cx", this.reference.x);
                path.attr("cy", this.reference.y);
                path.classed("shape", true);
                
                path.on("mouseenter", function (risk) {
                	showDestinationRiskDetails(risk);
                })
                
                  path.on("mouseleave", function (risk) {
                	  clearData();
                })
                
                var path1 = rg.append("svg:image")
                	.attr("xlink:href","https://cdn0.iconfinder.com/data/icons/social-messaging-ui-color-shapes/128/check-circle-blue-512.png")
	                .attr("x", this.completeIconPosition.x)
	                .attr("y",  this.completeIconPosition.y)
	                .attr("height", 15)
	                .attr("width", 15);
                path1.classed("completed",true);
                
                var linkCount = this.getParent().selectLinks(model, risk).length;
                
                var requiredStyle = this.isRiskTouched || linkCount > 0 ? "link-count" : "link-count-hide";
                if(!this.isRiskTouched && linkCount > 0 ){
//                    console.log(risk);
                	angular.element(document.getElementById('RiskMapCtrlDiv')).scope().updateRiskStatusAsConnected(risk.id);
                	angular.element(document.getElementById('RiskMapCtrlDiv')).scope().remingRiskCalculate();
                	angular.element(document.getElementById('RiskMapCtrlDiv')).scope().calculatePercentagerRiskMap();
                }
                
                this.d3().append("text").classed(requiredStyle, true).text("0").attr("transform","translate (" + this.textDisp.x + "," + this.textDisp.y +")");
                this.rotationAngle = rotateAngle;

			}
            
            function showDestinationRiskDetails(risk) {
            	var riskMap = JSON.parse(localStorage.getItem("riskMap"));
				if (riskMap){
					document.getElementById('moverHoverRiskName').innerHTML =	risk.name +" : " ;
					document.getElementById('moverHoverRiskDesc').innerHTML = riskMap[risk.name];
				}
            }
            
            
            function clearData(){
            	document.getElementById('moverHoverRiskName').innerHTML = "";
				document.getElementById('moverHoverRiskDesc').innerHTML = "";
            }

			RiskCircleView.prototype = Object.create(AbstractRiskView.prototype);
			RiskCircleView.prototype.constructor = RiskCircleView;
			views.RiskCircleView = RiskCircleView;
			
			RiskCircleView.prototype.setColour = function (color){
			                this.d3().select("path").style("fill", color);
			}
			
			RiskCircleView.prototype.update = function (model){
			    var risk = this.getRisk();
			    var linkCount = this.getParent().selectLinks(model, risk).length;
			    if(linkCount>0) {
			    	this.isRiskTouched = true;
			    }  
			    this.d3().select(".link-count").text(linkCount);
                this.d3().select(".link-count-hide").text(linkCount);
			    var tickImg = this.d3().select(".completed");
			    if (this.riskStatuses) {
			    	this.riskStatuses.forEach(function(riskStatus){
			    		if (risk.name == riskStatus.name && riskStatus.isConnected) {
			    			tickImg.classed("completedflag", true);
			    		} 
			    	})
			    }
			}
			
			RiskCircleView.prototype.highlight = function (){
			    AbstractRiskView.prototype.highlight.call(this);
			    this.isRiskTouched = true;
                this.d3().selectAll("text").classed("link-count-hide",false).classed("link-count",true);
			}
			
			RiskCircleView.prototype.reset = function () {
				var isRiskTouched = this.isRiskTouched;
			    AbstractRiskView.prototype.reset.call(this);
			    this.d3().select(".highlight").classed("highlighted", false);
			    if (isRiskTouched) {
			    	this.d3().select(".completed").classed("completedflag", true);
			    }
			}
						
			RiskCircleView.prototype.setGroup = function (index){
				AbstractRiskView.prototype.setGroup.call(this, index);
				
				if (this.labelView){
					this.labelView.d3().attr("data-group", index);
				}
			}
			
			function RiskLabelView(parentView, riskView, label, labelClass,
					wrapLength, fontSize) {

				LabelView.call(this, parentView, riskView, label,
						labelClass, wrapLength, fontSize);
								
				var h = -this.getHeight()/2;
				var textOffset = 40;
				var norm = riskView.reference.norm();
				var mag = textOffset;
				var disp = riskView.reference.add(norm.multiply(mag));
				this.translate(0, h);
				var rotateAngleDeg = rad2Deg(riskView.rotationAngle);
				if (riskView.startAngle > Math.PI){
					this.d3().selectAll("text").classed("left", true);
					rotateAngleDeg = 180 + rotateAngleDeg;
				} 
				
				this.rotate(rotateAngleDeg);
				this.translate(disp.x, disp.y);

			}

			RiskLabelView.prototype = Object.create(LabelView.prototype);
			RiskLabelView.prototype.constructor = RiskLabelView;

			RiskLabelView.prototype.getInsertionPoint = function (parent){
				return parent.d3().select(".labels");
			}
			
			RiskLabelView.prototype.setLabel = function (label){
				LabelView.prototype.setLabel.call(this, label);
				this.d3().selectAll("text").attr("pointer-events", "none");
				if (this.targetView.startAngle > Math.PI){
					this.d3().selectAll("text").classed("left", true);
				} 

				
			}

			function RiskSegmentView (parentView, risk, index, innerRadius, outerRadius, arcLength) {
				AbstractRiskView.call(this, parentView, risk, "g");

				var startAngle = index * arcLength;
				this.linkCount = 0;

				var arc = d3.svg.arc();
				this.arc = arc;
				arc.innerRadius(innerRadius);
				arc.outerRadius(outerRadius);
				arc.startAngle(startAngle);
				arc.endAngle(startAngle + arcLength);
				this.innerRadius = innerRadius;
				this.index = index;
				this.startAngle = startAngle;
				
				var rg = this.d3();
				var path = rg.append("path").attr("d", arc());
				path.classed("shape", true);

				var rotateAngle = startAngle - Math.PI/2 + arcLength/2;
				this.d3().attr("data-rotationAngle", rotateAngle);
				this.cx = innerRadius * Math.cos(rotateAngle);
				this.cy = innerRadius * Math.sin(rotateAngle);

				var outerX = (innerRadius - 10) * Math.cos(rotateAngle);
				var outerY = (innerRadius - 10) * Math.sin(rotateAngle);
				this.d3().append("text").classed("link-count", true).text("0").attr("transform","translate (" + outerX + "," + outerY +")");
		
				this.rotationAngle = rotateAngle;
				this.innerRadius = innerRadius;
			
			}
			
			RiskSegmentView.prototype = Object.create(AbstractRiskView.prototype);
			RiskSegmentView.prototype.constructor = RiskSegmentView;
			views.RiskSegmentView = RiskSegmentView;

			RiskSegmentView.prototype.setColour = function (color){
				this.d3().select("path").style("fill", color);
			}
			
			RiskSegmentView.prototype.update = function (model){
				var risk = this.getRisk();
				var linkCount = this.getParent().selectLinks(model, risk).length;
				this.d3().select(".link-count").text(linkCount);
			}
					

			RiskSegmentView.prototype.highlight = function (){
				AbstractRiskView.prototype.highlight.call(this);
			}
			
			RiskSegmentView.prototype.reset = function (){
				AbstractRiskView.prototype.reset.call(this);
			}
						
			
			RiskSegmentView.prototype.setGroup = function (index){
				AbstractRiskView.prototype.setGroup.call(this, index);
				this.d3().select(".link-count").attr("data-group", index);
			}
			
			
		
			function SegmentLabelView(parentView, riskView, label, labelClass,
					wrapLength, fontSize) {

				LabelView.call(this, parentView, riskView, label,
						labelClass, wrapLength, fontSize);
				
				var textOffset = 20;
				var innerRadius = riskView.innerRadius;

				var tx = (innerRadius + textOffset) * Math.cos(riskView.rotationAngle);
				var ty = (innerRadius + textOffset) * Math.sin(riskView.rotationAngle);
				var h = -this.getHeight()/2;
				
				var rotateAngleDeg = rad2Deg(riskView.rotationAngle);
				if (riskView.startAngle > Math.PI){
					this.rotate(180, this.getWidth()/2, this.getHeight()/2);
				} 

				this.translate(0, h);
				this.rotate(rotateAngleDeg);
				this.translate(tx, ty);

			}

			SegmentLabelView.prototype = Object.create(LabelView.prototype);
			SegmentLabelView.prototype.constructor = SegmentLabelView;
			
			SegmentLabelView.prototype.getInsertionPoint = function (parent){
				return parent.d3().select(".labels");
			}
			
			SegmentLabelView.prototype.setLabel = function (label){
				LabelView.prototype.setLabel.call(this, label);
				this.d3().selectAll("text").attr("pointer-events", "none");
				
			}


			function translate (d3, x, y) {
				d3.attr("transform", "translate(" + x + ", " + y + ")");
			}
			
			function rad2Deg (rad){
				return (rad / (2 * Math.PI)) * 360.0;
			}
			views.rad2Deg = rad2Deg;

			var animEndEventNames = {
				'WebkitAnimation' : 'webkitAnimationEnd',
				'OAnimation' : 'oAnimationEnd',
				'msAnimation' : 'MSAnimationEnd',
				'animation' : 'animationend'
			};
			// animation end event name
			var animEndEventName = animEndEventNames[Modernizr
					.prefixed('animation')];
			views.animEndEventName = animEndEventName;
			
			function RiskMenu(targetDoc) {
				TopLevelView.call(this, targetDoc, "g");
				this.d3().classed("riskViewMenu", true);
				this.d3().append("circle").attr("cx", 0).attr("cy", 0).attr("r", 0).transition().duration(200).attr("r", 30);

				this.d3().append("use")
				.classed("bowTieButton", true)
				.attr("xlink:xlink:href", "img/icons/svg/bowTie.svg#layer1")
				.attr("width", 45)
				.attr("height", 29)
				.attr("x", 0)
				.attr("y", 0)
				.transition()
				.duration(500)
				.attr("x", 20)
				.attr("y", 20);
			}

			RiskMenu.prototype = Object.create(TopLevelView.prototype);
			RiskMenu.prototype.constructor = RiskMenu;
			
			RiskMenu.prototype.hide = function (){
				TopLevelView.prototype.hide.call(this);
			}

			function DynamicTable (parent, columns, layout) {
				var div = parent.append("div").attr("class", "col-sm-6");
				var table = div.append("table").attr("class", "table");
				var header = table.append("tr");
				
				columns.forEach(function (col){
					header.append("th").text(col);	
				});
				header.append("th"); //for the control.
				
				var span = div.append("div").attr("class", "new").text(" Create new ");
				span.insert("span", ":first-child").attr("class", "glyphicon glyphicon-plus-sign");
			}
			
			function SelectTask (){
				PanelView.call(this, "SelectTask", "Select Task");
				new Button(this.d3().node(), "create-engagement", "Create Engagement");
				this.d3().append("div").classed("task-list-header", true).text("Your Tasks");
				this.list = this.d3().append("div").attr("class", "list-group task-list");
			}

			SelectTask.prototype = Object.create(PanelView.prototype);
			SelectTask.prototype.constructor = SelectTask;
			views.SelectTask = SelectTask;
			
			SelectTask.prototype.addTask = function (task){
				var ename = task.engagementName ? task.engagementName : "";
				var item = this.list.append("div").attr("class", "list-group-item task");
				var e = item.append("div").classed("engagement", true);
				e.append("img").attr("class","engagementIcon").attr("src", "img/icons/svg/Engagement.svg");
				e.append("span").classed("engagement-name", true).text(ename);
				item.append("div").classed("task-name", true).text(task.taskName);
				item.append("a").attr("class", "glyphicon glyphicon-play-circle doTask").datum(task);
			}
			
			SelectTask.prototype.clear = function (){
				
			}

			function EngagementDetails(){
				this.totalWidth = "col-sm-12";
				this.colWidth = "col-sm-9";
				PanelView.call(this, "Engagement", "Engagement Details")
				var form = this.d3().append("form").classed("form-horizontal", true);
				this.firstParticipant = true;
				
				var org = form.append("div").attr("class", "organisations form-group", true);
				this.makeLabel(org, "organisation", "Organisation");
				var dd = new Dropdown(org);
				dd.d3().select(".selected").text("Select");
				dd.d3().classed("organisation", true).classed(this.colWidth, true);
				
				var orgInput = form.append("div").attr("class", "organisation-input form-group hidden", true);
				orgInput.append("div").classed("col-sm-3", true);
				var orgName = orgInput.append("input").attr("type", "text")
				.attr("id", "orgName").attr("placeholder", "Organisation Name")
				.classed(this.colWidth, true);

				var previous = form.append("div").attr("class", "previousEngagement form-group", true);
				this.makeLabel(previous, "previous", "Previous Engagement");
				var dd2 = new Dropdown(previous);
				dd2.d3().select(".selected").text("Select");
				dd2.d3().classed("previousEngagements", true).classed(this.colWidth, true);
				
				var engagementName = form.append("div").attr("class", "form-group engagementName");
				this.makeLabel(engagementName, "ename", "Engagement Name");
				engagementName.append("input").attr("type", "text").attr("id", "ename").attr("class", this.colWidth);
				
				var divisionGroup = form.append("div").attr("class", "form-group divisionTable");
				this.makeLabel(divisionGroup, "divisions", "Division Names");
				
				var userFormGroup = form.append("div").attr("class", "form-group userTable");
				this.makeLabel(userFormGroup, "users", "Participants");

				var options = form.append("div").classed("options", true).classed("form-group", true);
				options.append("label").attr("for", "options").text("Data Collection Options").attr("class", "control-label col-sm-2");
				var d = options.append("div").attr("id", "options").attr("class", "col-sm-8");
				var ob = d.append("div");
				this.makeOptionButton(ob, "Likelihood");
				this.makeOptionButton(ob, "Severity");
				this.makeOptionButton(ob, "Velocity");
				this.makeOptionButton(ob, "Connections");
			}
			

			EngagementDetails.prototype = Object.create(PanelView.prototype);
			EngagementDetails.prototype.constructor = EngagementDetails;
			views.EngagementDetails = EngagementDetails;
			
			
			EngagementDetails.prototype.makeLabel = function (parent, id, text){
				parent.append("label").attr("class", "control-label col-sm-3").attr("for", id).text(text);
			}
			
			EngagementDetails.prototype.addParticipant = function (parent){
				var table = this.d3().select(".userTable");
				
				var div = table.append("div").attr("class", "participant " + this.colWidth);
				div.classed("col-sm-offset-3", true);

				div.append("input").attr("type", "email").attr("class", "form-control emailAddress").attr("placeholder", "Email Address");
				var div2 = div.append("div").attr("class", "division-line");
				div2.append("span").text("Division");
				var dd = new Dropdown(div2);
				dd.d3().select(".selected").text("Select");
				dd.d3().classed("participantDivision", true);
				
				new Button(div2.node(), "delete");
				new Button(div2.node(), "add");
				return div;
				
			}
			
			EngagementDetails.prototype.addDivision = function (){
				var table = this.d3().select(".divisionTable");
				
				var d1 = table.append("div").attr("class", "division " + this.colWidth);
				d1.classed("col-sm-offset-3", true);

				d1.append("input").classed("division-name", true);
				this.deleteButton = new Button(d1.node(), "delete");
				this.addButton = new Button(d1.node(), "add");

				return d1;
			}

			EngagementDetails.prototype.makeButton = function (parent, id, glyphicon){
				var btn = parent.append("button").attr("type", "button").attr("id", id).attr("class", "btn btn-block");
				btn.append("i").attr("class", "glyphicon " + glyphicon);
			}
			
			EngagementDetails.prototype.makeOptionButton = function(parent, text){
				var btn = parent.append("button").attr("type", "button").attr("class", "btn btn-default btn-sm optionButton");
				btn.attr("value", text);
				var span = btn.append("span").classed("glyphicon glyphicon-ok", true);
				span.text(" " + text);
			}
			
			EngagementDetails.prototype.makeDropDown = function (parent, text){
				var dd = parent.append("span").classed("dropdown", true);
				var btn = dd.append("button").attr("class", "btn btn-default btn-sm dropdown-toggle")
							.attr("type", "button").attr("data-toggle", "dropdown");
				btn.append("span").classed("caret", true);
				btn.append("span").classed("selected", true).text(" " + text);
				dd.append("ul").classed("dropdown-menu", true);
				return dd;
			}
			
			EngagementDetails.prototype.addPreviousEngagements = function (engagements){
				var pe = this.d3().select(".previousEngagements ul");
				pe.selectAll("li").remove();
				engagements.forEach(function (e){
					var li = pe.append("li");
					li.datum(e);
					li.append("a").text(e.name);
				});
			}
			
			EngagementDetails.prototype.setUsers = function (users){
				var ms = this.d3().select("#multiselect");
				ms.selectAll("option").remove();
				var msTo = this.d3().select("#multiselect_to");
				msTo.selectAll("option").remove();
				
				users.forEach(function(u){
					var option = ms.append("option");
					option.datum(u);
					option.text(u.name);	
				});

			}
			
			function Vector2 (x, y){
				chai.assert.isNumber(x);
				chai.assert.isNumber(y);
				this.x = x;
				this.y = y;
			}
			Vector2.prototype.magnitude = function (){
				return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
			}
			Vector2.prototype.subtract = function (v){
				return new Vector2(this.x - v.x, this.y - v.y);
			}
			Vector2.prototype.add = function (v){
				return new Vector2(this.x + v.x, this.y + v.y);
			}
			Vector2.prototype.divide = function (s){
				return new Vector2(this.x / s, this.y / s);
			}
			Vector2.prototype.multiply = function (s){
				return new Vector2(this.x * s, this.y * s);
			}
			Vector2.prototype.norm = function (s){
				var m = this.magnitude();
				var x = this.x /m;
				var y = this.y/m;
				return new Vector2(x, y);
			}
			
			/**
			 * Enable labels to be well positioned on charts and graphs.
			 */
			function LabelLayout (){
				
			}
			
			LabelLayout.prototype.layout = function (view){
				
			}
			
			function CustomLayout (){
				this.g = 1;
				this.distanceFromCentre = 200;
				this.k = 150;
				this.c = 1;
				this.iterations = 20;
				this.interval = 0;
			}
			CustomLayout.prototype = Object.create(LayoutStrategy.prototype);
			CustomLayout.prototype.constructor = CustomLayout;
			views.CustomLayout = CustomLayout;
			
			CustomLayout.prototype.layout = function(view, width, height) {
				var c = 1;
				var rvs = view.getRiskViews();
				var model = view.getModel();
				rvs.forEach(function (v){
					v.pos = new Vector2(Math.random() * width, Math.random() * height);
				});
				var initialTemp = 0.1 * width;
				
				var network = model.getBaseModel();
				var maxDegree = 0;
				network.getRisks().forEach(function (r){
					var degree = network.getAdjacentLinks(r).length;
					if (degree > maxDegree){
						maxDegree = degree;
					}
				});
				var metric = app.App.getMetricSet().getMetric("Degree");
				
				var temperature = initialTemp;
				var i = 0;
				var layout = this;
				var interval = setInterval(function (){
					view.getRiskViews().forEach(function (rv){
						rv.x = rv.pos.x;
						rv.y = rv.pos.y;
					});

					view.update();

					layout.iterate(view, temperature, width, height, maxDegree);
					temperature = initialTemp - initialTemp * i/layout.iterations;
					i++;
					if (i == layout.iterations){
						clearInterval(interval);
					}
				}, this.interval);
			}
			
			CustomLayout.prototype.centroid = function (view){
				var xsi = new Vector2(0, 0);
				view.getRiskViews().forEach(function (v){
					xsi = xsi.add(v.pos);
				}, this);
				xsi = xsi.divide(view.getRiskViews().length);
				return xsi;

			}
			
			CustomLayout.prototype.gravitate = function (view, maxDegree){
				if (maxDegree == 0){
					return;
				}
				// Gravitational forces.
				var xsi = this.centroid(view);
				
				view.getRiskViews().forEach(function (v){
					var ms = view.getModel().getMeasurementSet();
					var rm = view.getModel().getBaseModel();
					var degree = rm.getAdjacentLinks(v.getRisk()).length;
					var diff = xsi.subtract(v.pos);
					var mag = diff.magnitude();
					var direction = diff.divide(mag);
					
					var k = this.distanceFromCentre * (1 - degree/maxDegree);
					if (k == 0){
						k = 0.001;
					}
					
					// Attraction for degree
					var displacement = direction.multiply(this.g *  Math.pow(mag, 2)/k);
					v.disp = v.disp.add(displacement);
				}, this);
			}
			
			CustomLayout.prototype.attract = function (view){

				// Attractive forces
				view.getLinkViews().forEach(function (lv){
					var l = lv.getLink();
					var u = view.getView(l.dest);
					var v = view.getView(l.src);
					var diff = v.pos.subtract(u.pos);
					var magnitude = diff.magnitude();
					
					var levelOfAttraction = Math.pow(magnitude, 2) / this.k;
					var direction = diff.divide(magnitude);
					var attraction = direction.multiply(levelOfAttraction);
					v.disp = v.disp.subtract(attraction);
					u.disp = u.disp.add(attraction);
		
				}, this);
			}

			CustomLayout.prototype.repulse = function (view){
				// Repulsive forces
				view.getRiskViews().forEach(function (v){
					v.disp = new Vector2(0, 0);
					view.getRiskViews().forEach (function (u){
						if (v.id == u.id){
							return;
						}
						var diff = v.pos.subtract(u.pos);
						var magnitude = diff.magnitude();
						if (magnitude == 0) {
							magnitude = 1.0;
						}
						var levelOfRepulsion = Math.pow(this.k, 2) / magnitude;
						var direction = diff.divide(magnitude);
						var repulsion = direction.multiply(levelOfRepulsion);
						v.disp = v.disp.add(repulsion);
					}, this);
				}, this);			
			}
			
			CustomLayout.prototype.limit = function (view, temperature, width, height){
				
				// Apply limits and position
				view.getRiskViews().forEach(function (v){
					var mag = v.disp.magnitude();
					if (mag == 0){
						return;
					}
					var direction = v.disp.divide(mag);
					var displacement = direction.multiply(Math.min(mag, temperature));
					v.pos = v.pos.add(displacement);
					//v.pos.x = Math.min(width/2, Math.max(-width/2, v.pos.x));
					//v.pos.y = Math.min(height/2, Math.max(-height/2, v.pos.y));
					
	
				}, this);
			}

			
			CustomLayout.prototype.iterate = function (view, temperature, width, height, maxDegree){
				
				this.repulse(view);
				this.attract(view);
				this.gravitate(view, maxDegree);
				this.limit(view, temperature, width, height);
				
			}
			
			function Dropdown(parent) {
				TopLevelView.call(this, parent.node(), "div");
				var dd = this.d3().classed("dropdown", true);
				var btn = dd.append("button").attr("class", "btn btn-default btn-sm dropdown-toggle")
							.attr("type", "button").attr("data-toggle", "dropdown");
				btn.append("span").attr("class", "glyphicon glyphicon-triangle-bottom");
				btn.append("span").classed("selected", true);
				dd.append("ul").classed("dropdown-menu", true);
			}
			
			Dropdown.prototype = Object.create(TopLevelView.prototype);
			Dropdown.prototype.constructor = Dropdown;
			
			Dropdown.prototype.addItem = function (){
				var li = this.d3().select(".dropdown-menu").append("li");
				li.append("a");
				return li;
			}
			
			Dropdown.prototype.clear = function (){
				this.d3().selectAll(".dropdown-menu li a").remove();
			}
			
			
			function Modal(){
				TopLevelView.call(this, d3.select("body").node(), "div");
				this.d3().classed("modal", true).classed("fade", true);
				this.d3().attr("id", "myModal").attr("tabindex", "-1").attr("role", "dialog");
				var md = this.d3().append("div")
				md.classed("modal-dialog", true).attr("role", "document");
				var mc = md.append("div").classed("modal-content", true);
				var h = mc.append("div");
				h.classed("modal-header", true);
				h.append("button").attr("type", "button").classed("close", true).attr("data-dismiss", "modal").append("span").attr("class", "glyphicon glyphicon-remove-circle");
				h.append("h4").classed("modal-title", true).text("Modal title");
				mc.append("div").classed("modal-body", true);
				var f = mc.append("div").classed("modal-footer", true);
				f.append("button").attr("type", "button").attr("class", "btn btn-default").attr("data-dismiss", "modal").text("OK");

			}
			
			Modal.prototype = Object.create(TopLevelView.prototype);
			Modal.prototype.constructor = Modal;
			views.Modal = Modal;
			
			Modal.prototype.show = function (){
				$("#myModal").modal("show");
			}

			
			return views;
		});
