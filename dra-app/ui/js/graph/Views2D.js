/**
 * 
 */

define(
		[ "models", "chai", "views", ],
		function(models, chai, views) {

			var scope = {};
			
			function RiskModelView2D(targetDocument) {
				views.RiskModelView.call(this, targetDocument, "svg");
				
				this.groupViews = [];
			}

			scope.RiskModelView2D = RiskModelView2D;

			RiskModelView2D.prototype = Object.create(views.RiskModelView.prototype);
			RiskModelView2D.prototype.constructor = RiskModelView2D;

			RiskModelView2D.prototype.createRiskView = function(risk) {

				var rv = views.RiskModelView.prototype.createRiskView
						.call(this, risk);
				var qmodel = this.getModel();
				var ms = qmodel.getMeasurementSet();

				var metric = ms.getMetric("Severity");
				if (metric == null){
					rv.setRadius(10);
					return rv;
				}
				var intervalSet = metric.getInterval().divideInto(3);
				var value = ms.getMeasurement(metric, risk);

				var radius = 10;
				if (value){	
					var interval = intervalSet.getInterval(value);
					var index = intervalSet.indexOf(interval);
					var radii = [ 5, 10, 15 ];
					radius = radii[index];
				}
				rv.setRadius(radius);
				return rv;
			}

			RiskModelView2D.prototype.createLinkView = function(link) {

				var lv = views.RiskModelView.prototype.createLinkView
						.call(this, link);
				return lv;
			}
			
			RiskModelView2D.prototype.showChanges = function() {

				//$(this.graphArea.node()).children().remove();
				this.removeContent();
			
				//this.layoutStrategy = new views.ForceLayoutStrategy();
				this.layoutStrategy = new views.CustomLayout();

				views.RiskModelView.prototype.showChanges.call(this);
			}
			
			RiskModelView2D.prototype.stopLayout = function (){
				if (! this.layoutStrategy){
					return;
				}
				this.layoutStrategy.stop();
			}

			RiskModelView2D.prototype.highlightGroupsX = function (){
				views.RiskModelView.prototype.highlightGroups.call(this);
				var group = this.getGroup();
				
				this.groupViews.forEach(function (hv){
					hv.detach();
				});
				this.groupViews = [];
				
				if (!group){
					return;
				}
				
				group.getGroups().forEach(function (g){
					h = new GroupHullView(this, group, g);
					h.update();
					this.groupViews.push(h);
					
				}, this);
				this.notifyListeners();
				
			}
			RiskModelView2D.prototype.modelChanged = function(model) {
				views.RiskModelView.prototype.modelChanged.call(this, model);
				this.layoutStrategy = new views.CustomLayout();
			}
			
			/**
			 * 
			 */
			function GroupHullView(parentView, parentGroup, group) {
				// chai.assert.instanceOf(parentView, RiskModelView2D);
				chai.assert.instanceOf(group, models.RiskGroup);

				views.View.call(this, parentView, "g", true);

				// Note: the field "parent" is reserved for the use of cola.
				this.group = group;
				this.leaves = [];
				this.groups = [];

				this.d3().attr("class", "groupView");

				this.d3().datum(this);
				var cs = new views.ColourStrategy();
				
				this.colour = cs.getColourForGroup(group, parentGroup);

				// Add a label view
				this.labelView = new views.LabelView(parentView, this, group.name,
						"groupLabel", 150);
				this.labelView.d3().selectAll("text")
						.style("font-size", "12pt").style("fill", this.colour);
			}

			views.GroupHullView = GroupHullView;
			GroupHullView.prototype = Object.create(views.View.prototype);
			GroupHullView.prototype.constructor = GroupHullView;

			GroupHullView.prototype.detach = function (){
				views.View.prototype.detach.call(this);
				this.labelView.detach();
			}
			GroupHullView.prototype.update = function() {
				var risks = this.group.risks;

				if (risks.length == 0) {
					this.labelView.hide();
					return;
				}
				var vertices = [];
				risks.forEach(function(r) {
					var v = this.getParent().getView(r);
					
					if (v) {
						vertices.push([ v.x, v.y ]);
					}
				}, this);
				
				if (vertices.length <= 1){

					return;
				}

				// Add a midpoint vertex if there are only two vertices
				// otherwise the hull algorithm doesn't work
				if (vertices.length == 2) {
					var v0 = vertices[0];
					var v1 = vertices[1];
					var n = [];

					n[0] = (v0[0] + v1[0]) / 2;
					n[1] = (v0[1] + v1[1]) / 2;

					vertices.push(n);
				}

				this.d3().select("path").remove();
				var hullView = this.d3().append("path").attr("class", "hull");
				var d = d3.geom.hull(vertices);
				var path = "M" + d.join("L") + "Z";
				hullView.attr("d", path);
				hullView.attr("stroke", this.colour);
				hullView.attr("fill", this.colour);

				var bb = hullView.node().getBBox();

				this.labelView.x = bb.x + bb.width / 2;
				this.labelView.y = bb.y + bb.height / 2;
				
				this.x = this.labelView.x;
				this.y = this.labelView.y;

				this.labelView.update();
			}
			
			RiskModelView2D.prototype.update = function (){
				views.RiskModelView.prototype.update.call(this);
				this.updateGroupViews();
			}
			
			
			RiskModelView2D.prototype.updateGroupViews = function (){
				this.groupViews.forEach(function(hv){
					hv.update();
				});
			}

			function Network2DPanelView() {
				views.NetworkPanelView.call(this, "network", "Network", "svg");
			}

			Network2DPanelView.prototype = Object
					.create(views.NetworkPanelView.prototype);
			Network2DPanelView.prototype.constructor = Network2DPanelView;
			scope.Network2DPanelView = Network2DPanelView;

			Network2DPanelView.prototype.createModelView = function() {
				return new RiskModelView2D(this.modelContent.node());
			}
			
			
			


return scope;
})