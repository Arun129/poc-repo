define([ "models", "chai", "application", "controllers", "views2D" ], function(
		models, chai, app, cs, views2D) {

	var scope = {};
	
	function add2DPanel(wb){
		var networkView = new views2D.Network2DPanelView();
		wb.networkView = networkView;
		app.App.registerListener("model", networkView.getModelView());
		app.App.registerListener("group", networkView.getModelView());

		var network2DControl = new Network2DPanelControl("network",
				wb, app.App.baseThreshold);
		network2DControl.setView(networkView);
		app.App.registerListener("risk", network2DControl.getModelController());

		wb.addController(network2DControl);
		wb.addView(networkView);
		return networkView;

	}
	scope.add2DPanel = add2DPanel;
	
	function RiskNetwork2DControl(parent, baseModel, threshold,
			targetDoc) {

		cs.RiskNetworkController.call(this, parent);
		
		this.zoomDragControl = new ZoomDragControl(this, "svg", ".graphArea");

	}


	RiskNetwork2DControl.prototype = Object
			.create(cs.RiskNetworkController.prototype);
	RiskNetwork2DControl.prototype.constructor = RiskNetwork2DControl;

	RiskNetwork2DControl.prototype.setView = function(view) {
		cs.RiskNetworkController.prototype.setView.call(this, view);
		this.zoomDragControl.setView(view);
	}

	RiskNetwork2DControl.prototype.viewChanged = function(view) {
		cs.RiskNetworkController.prototype.viewChanged.call(this, view);
		var v = this.getView();
		if (v != null) {
			v.layoutStrategy.start();
		}
	}

	function Network2DPanelControl(name, parent, threshold) {
		cs.NetworkPanelControl.call(this, name, parent, threshold);


	}

	Network2DPanelControl.prototype = Object
			.create(cs.NetworkPanelControl.prototype);
	Network2DPanelControl.prototype.constructor = Network2DPanelControl;
	scope.Network2DPanelControl = Network2DPanelControl;

	Network2DPanelControl.prototype.createController = function() {
		return new RiskNetwork2DControl(this, app.App.getModel(),
				this.threshold);
	}

	function ZoomDragControl (controller, hostSelector, targetSelector){
		cs.ZoomControl.call(this, controller, hostSelector, targetSelector);

		this.drag = d3.behavior.drag();
	
	}
	
	ZoomDragControl.prototype = Object.create(cs.ZoomControl.prototype);
	ZoomDragControl.prototype.constructor = ZoomDragControl;

	ZoomDragControl.prototype.viewChanged = function (view){
		cs.ZoomControl.prototype.viewChanged.call(this, view);
		
		var c = this;
		this.drag.on("dragend", function(e){
			c.dragging = false;
		});
		
		this.drag.on("dragstart", function (e){
			c.dragging = true;
		});

		
		this.drag.on("drag", function(item) {
			if (! (item instanceof models.Risk || item.labelView)){
				return;
			}
			if (item instanceof models.Risk) {
				c.dragUpdate(item);
			} else {
				chai.assert.property(item, "labelView");
				item.labelView.dragUpdate();
			}
			
			d3.event.sourceEvent.stopPropagation();
			d3.event.sourceEvent.preventDefault();
		});
		
		//view.d3().selectAll(".riskView").call(this.drag);
		view.d3().selectAll(".riskLabel").call(this.drag);
		view.d3().selectAll(".groupLabel").call(this.drag);
	}
	
	ZoomDragControl.prototype.zoomUpdate = function(e) {
		if (this.dragging){
			return;
		}

		cs.ZoomControl.prototype.zoomUpdate.call(this, e);

	}

	ZoomDragControl.prototype.dragUpdate = function(risk) {
		var view = this.getView();
		var d = view.getView(risk);
		d.x = d3.event.x;
		d.y = d3.event.y;

		d.update();

		view.model.getAdjacentLinks(risk).forEach(function(l) {
			var v = view.getLinkView(l);
			if (typeof v !== "undefined") {
				v.update();
			}
		});

		// Update all the group views because we are too lazy to
		// determine what groups contain this risk.
		this.getParent().getView().updateGroupViews();
	}

	return scope;
});