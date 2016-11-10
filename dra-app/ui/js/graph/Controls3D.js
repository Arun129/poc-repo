define([ "controllers", "views3D", "application" ], function(cs, views3D, app) {

	var scope = {};
	
	function add3DPanel (wb){
		var network3DView = null;
		try {
			network3DView = new views3D.Network3DPanelView();
		} catch (err){
			wb.errorView.showMessage("3D is not supported in this browser", err);
			return;
		}

		app.App.registerListener("risk", network3DView.getModelView());
		app.App.registerListener("model", network3DView.getModelView());
		app.App.registerListener("group", network3DView.getModelView());

		var network3DControl = new Network3DPanelControl("network3D",
				this, app.App.baseThreshold);
		network3DControl.setView(network3DView);
		wb.addController(network3DControl);
		wb.addView(network3DView);

	}
	scope.add3DPanel = add3DPanel;

	
	function Network3DPanelControl(name, parent, threshold) {
		cs.NetworkPanelControl.call(this, name, parent, threshold);
	}
	Network3DPanelControl.prototype = Object
			.create(cs.NetworkPanelControl.prototype);
	Network3DPanelControl.prototype.constructor = Network3DPanelControl;
	scope.Network3DPanelControl = Network3DPanelControl;

	Network3DPanelControl.prototype.createController = function(model) {
		return new RNC2A(this);
	}

	function RNC2A(parent) {
		cs.AbstractRiskModelController.call(this, parent);
	}

	RNC2A.prototype = Object
			.create(cs.AbstractRiskModelController.prototype);
	RNC2A.prototype.constructor = RNC2A;

	RNC2A.prototype.viewChanged = function(view) {
		cs.AbstractRiskModelController.prototype.viewChanged
				.call(this);
		var v = this.getView();
		if (v && v.layoutStrategy) {
			v.layoutStrategy.layoutEngine.start();
		}

		this.riskAction = function(evt) {
			var risk = c.getView().getPickedRisk(evt);
			if (!risk) {
				c.getView().reset();
				v.render();
				return;
			}
			c.doRiskAction(risk);
			v.render();
		};

		var c = this;
		v.d3().select("canvas").node().addEventListener('click',
				this.riskAction);

	}


	RNC2A.prototype.showClusters = function() {
		cs.AbstractRiskModelController.prototype.showClusters.call(this);
		this.getView().render();

	}

	return scope;
});