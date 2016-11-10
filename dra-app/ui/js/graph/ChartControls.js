define([ "chai", "controllers", "charts", "application", "models", "server" ], function(chai, cs, charts, app, models, svr) {

	var scope = {};
	
	function ChartPanelControl(name, parent, metricNames) {
		cs.ModelPanelControl.call(this, name, parent);
		this.metricNames = metricNames;		
	}
	ChartPanelControl.prototype = Object
			.create(cs.ModelPanelControl.prototype);
	ChartPanelControl.prototype.constructor = ChartPanelControl;
	scope.ChartPanelControl = ChartPanelControl;

	ChartPanelControl.prototype.createController = function() {
		return new RNC3(this);
	}

	ChartPanelControl.prototype.setView = function(view) {
		cs.ModelPanelControl.prototype.setView.call(this, view);

		this.modelController.setView(view.modelView);

	}

	ChartPanelControl.prototype.modelChanged = function(model) {
		cs.ModelPanelControl.prototype.modelChanged.call(this, model);

		var ms = model.getMeasurementSet();
		var metricSet = this.getMetricSet(ms);
		if (metricSet.isEmpty()){
			return;
		}
		
		var m1 = this.getView().getModelView().xmetric;
		var m2 = this.getView().getModelView().ymetric;
		
		if (!m1) {
			m1 = metricSet.getMetric("Severity");
		}
		if (!m2) {
			m2 = metricSet.getMetric("Likelihood");
		}
		
		this.setMetrics(m1, m2, metricSet);
	}
	
	ChartPanelControl.prototype.viewChanged = function (view){
		cs.ModelPanelControl.prototype.viewChanged.call(this, view);
		
		var mc = this.getModelController();
		
	}
	
	ChartPanelControl.prototype.getMetricSet = function (ms){
		if (!this.metricNames){
			return ms.getMetricSet();
		}
		
		var names = this.metricNames;
		var metrics = ms.getMetricSet().getMetrics();
		var nm = _.filter(metrics, function (m){
			return names.indexOf(m.getName()) > -1;
		});
		var ms = new models.MetricSet();
		ms.metrics = nm;
		return ms;
	}
	
	
	ChartPanelControl.prototype.setMetrics = function(xmetric, ymetric,
			metricSet) {
		var modelView = this.getView().getModelView();
		chai.assert.isNotNull(modelView);

		var x = this.getView().x;
		var y = this.getView().y;

		x.setMetricSet(metricSet);
		y.setMetricSet(metricSet);

		modelView.setMetrics(xmetric, ymetric);
		this.xmetric = xmetric;
		this.ymetric = ymetric;

		x.setMetric(xmetric);
		y.setMetric(ymetric);

		this.metricSet = metricSet;

		this.connect();

	}

	ChartPanelControl.prototype.connect = function() {
		var c = this;
		var labels = this.getView().d3().selectAll(".axisLabel li a");
		var metricSet = this.metricSet;
		var modelView = this.getView().getModelView();
		

		labels.on("click", function(e) {
			var item = $(this).text();

			chai.assert.isNotNull(c.getModel());
			var id = this.parentElement.parentElement.parentElement.id;

			var metric = metricSet.getMetric(item);
			if (metric == null) {
				return;
			}

			if (id == "xControl") {
				c.xmetric = metric;
				c.getView().x.setMetric(metric);
				modelView.setMetrics(metric, c.ymetric);
			} else {
				c.ymetric = metric;
				c.getView().y.setMetric(metric);
				modelView.setMetrics(c.xmetric, metric);
			}
			modelView.show();

		}, this);

	}
	
	function GraphZoomControl (parent, host, target){
		cs.ZoomControl.call(this, parent, host, target);
		var z = this.zoom;
		var c = this;
		this.gridLineStrokeWidth = 1;
		this.zoom.scaleExtent([1, 10]);
		this.zoom.on("zoomstart", function(){
			var e = d3.event;
			var gsw = parent.getView().d3().select(".gridline").style("stroke-width");
			c.gridLineStrokeWidth = parseFloat(gsw.substring(0, gsw.indexOf('px')));
		});

		
	}
	GraphZoomControl.prototype = Object.create(cs.ZoomControl.prototype);
	GraphZoomControl.prototype.constructor = GraphZoomControl;

	GraphZoomControl.prototype.zoomUpdate = function() {		
		var e = d3.event;
		
		var modelView = this.getParent().getView();
		modelView.scale = e.scale;

		var x = e.translate[0];
		if (isNaN(x) || x > 0){
			x = 0;
		}
		
		var xVal = (modelView.contentWidth ) * (1 - e.scale);
		if ( x  < xVal){
			x = xVal;
		}
		
		var y = e.translate[1];
		if (isNaN(y) || y > 0){
			y = 0;
		}
		
		var yVal = (modelView.contentHeight) * (1 - e.scale);
		if (y < yVal){
			y = yVal;
		}

		var ga = modelView.d3().select(".graphArea");
		var cp = modelView.d3().select("#graphClipPath rect");
		
		var xt = modelView.xAxis.translate + " translate(" + x + ",0)";
		var xTopt = modelView.xTopAxis.translate + " translate(" + x + ",0)";
		var yt = modelView.yAxis.translate + " translate(0," + y + ")";
		
		var invert = 1/d3.event.scale;
		
		//modelView.d3().selectAll(".zone").attr("transform", "scale(" + d3.event.scale +")");
		var gridlines = modelView.d3().selectAll(".gridline");
		gridlines.attr("transform", "scale(" + d3.event.scale +")");
		gridlines.style("stroke-width", this.gridLineStrokeWidth/e.scale + "px");

		modelView.xAxis.d3().attr("transform", xt + " scale(" + d3.event.scale +")");
		modelView.xTopAxis.d3().attr("transform", xTopt + " scale(" + d3.event.scale +")");
		
		//
		modelView.yAxis.d3().attr("transform", yt + " scale(" + d3.event.scale +")");
			
		// unscale text
		modelView.d3().selectAll(".axis text").attr("transform", "scale(" + 1/d3.event.scale +")");
		
		// unscale the tick line.
		modelView.d3().selectAll(".axis .tick line").attr("transform", "scale(" + 1/d3.event.scale +")");
		
		// unscale the line width
		var sw = this.axisStrokeWidth;
				
		// Assume it is in pixels
		if (sw){
		sw = parseFloat(sw.substring(0, sw.indexOf('px')));
		modelView.d3().selectAll(".axis .domain").style("stroke-width", sw/e.scale + "px");
		}

		ga.attr("transform", "translate(" + x + "," + y + ")");
		cp.attr("x", -x - modelView.clipGap).attr("y", -y-modelView.clipGap);

		modelView.getLayoutStrategy().layout(modelView, 
				e.scale * modelView.contentWidth, 
				e.scale * modelView.contentHeight);

	}

	function RNC3(parent) {

		var c = this;

		cs.RiskNetworkController.call(this, parent);

		this.drag = d3.behavior.drag();
		this.dragRisk = d3.behavior.drag();
		this.changedMeasurements = null;
		this.dragOn = d3.behavior.drag();
		
		// Contains the list of risks that have to be placed on the chart.
		this.riskViewsToPlace = [];
		this.riskViewToBePlaced = null;
		
		this.fixedMetrics = [];
		
		
 	//	this.zoomControl = new GraphZoomControl(this, ".content", ".graphArea");

	}

	RNC3.prototype = Object.create(cs.RiskNetworkController.prototype);
	RNC3.prototype.constructor = RNC3;

	RNC3.prototype.saveMeasurements = function(){
		var json = this.changedMeasurements.toJSON();
		
		var q = new svr.PutRequest();
		q.setPath("/models/updateMeasurements");
		q.setData(json);
		q.run();
	}
	
	
	RNC3.prototype.modelChanged = function (model){
		cs.RiskNetworkController.prototype.modelChanged.call(this, model);
		var ms = model.getMeasurementSet();

		if (!this.changedMeasurements || this.changedMeasurements.getModel().id != model.getBaseModel().id){
			this.changedMeasurements = new models.MeasurementSet(null, this.getModel().getBaseModel(), ms.getMetricSet());
		}
		

	}
	RNC3.prototype.viewChanged = function(view) {
		cs.RiskNetworkController.prototype.viewChanged.call(this, view);
		
		//this.zoomControl.viewChanged(view);
		
		// Set the default values for properties fixed under scaling.
		var ap = view.d3().select(".axis path");
		//this.zoomControl.axisStrokeWidth = ap.node() ? ap.style("stroke-width") : "1px";
		
		this.drag.on("dragstart", function(){
			d3.event.sourceEvent.stopPropagation();
		});

		this.drag.on("drag", function(riskView) {
			riskView.labelView.dragUpdate();
		});
		
		this.configureRiskDragging(view);
	
		this.getView().d3().selectAll(".riskLabel").call(this.drag);
		this.getView().d3().selectAll(".riskView").call(this.dragRisk);
		
		// If the model changes go through each of the risks and see whether it has been placed.
		// It is assumed that a risk with zero likelihood and zero severity has not been placed.
		var model = view.getModel();
		
		this.riskViewsToPlace = [];
			var risks = model.getBaseModel().getRisks();
			var ms = model.getMeasurementSet();
			var metricSet = ms.getMetricSet();
			var sm = metricSet.getMetric("Severity");
			var lm = metricSet.getMetric("Likelihood");
			risks.forEach(function (r){
				var likelihood = ms.getMeasurement(sm, r);
				var severity = ms.getMeasurement(lm, r);
				
				if (likelihood == 0 && severity == 0){
					var rv = view.getView(r);
					this.riskViewsToPlace.push(rv);
					rv.hide();
					rv.labelView.hide();
					rv.labelView.labelLink.hide();
				}
			}, this);
		
		this.placeRiskToDragOn();
	}
	
	
	RNC3.prototype.doRiskDrag = function (xFixed, yFixed, risk){
			var v = this.getView().getView(risk);
			if (!v.change){
				v.change = {dx: 0, dy: 0};
			}
						
			v.change = {dx: d3.event.dx + v.change.dx, dy: d3.event.dy + v.change.dy};
			var cv = this.getView(); 
			
			// Should be a ChartView
			chai.assert.instanceOf(cv, charts.ChartView);
			
			v.change = {dx: d3.event.dx + v.change.dx, dy: d3.event.dy + v.change.dy};	
			var ld = cv.getLayoutDimensions();
			if (d3.event.x < 0){
				d3.event.x = 0;
			}
			if (d3.event.x > ld.width){
				d3.event.x = ld.width;
			}
			if (d3.event.y < 0){
				d3.event.y = 0;
			}
			if (d3.event.y > ld.height){
				d3.event.y = ld.height;
			}

			if (yFixed){ d3.event.y += -v.change.dy;}
			if (xFixed){ d3.event.x += -v.change.dx;}
			v.dragUpdate();
		
	}
	
	RNC3.prototype.placeRiskToDragOn = function (){
		if (this.riskViewsToPlace.length == 0){
			return;
		}
		
		var rv = this.riskViewsToPlace.pop();
		rv.x = 148;
		rv.y = -115;
		rv.update();
		
		rv.highlight();

		rv.show();
		rv.labelView.show();
		rv.labelView.labelLink.show();
		this.riskViewToBePlaced = rv;
	}
	
	RNC3.prototype.configureRiskDragging = function(view) {
		var c = this;
		
		var metricSet = this.getModel().getMeasurementSet().getMetricSet();
		var yFixed = this.fixedMetrics.indexOf(view.ymetric.name) >= 0;
		var xFixed = this.fixedMetrics.indexOf(view.xmetric.name) >= 0;

		if (yFixed && xFixed){
			return;
		}

		this.dragRisk.on("dragstart", function(risk){
			d3.event.sourceEvent.stopPropagation();			
		});
		
		this.dragRisk.on("drag", this.doRiskDrag.bind(this, xFixed, yFixed));
		
		this.dragRisk.on("dragend", function (risk){
			var v = c.getView();
			var rv = v.getView(risk);
			if (!rv.change || Math.abs(rv.change.dx) < 5 && Math.abs(rv.change.dy) < 5){
				return;
			}
			
			// Reset the change
			if (rv.change){
				rv.change.dx = 0;
				rv.change.dy = 0;
			}
			var riskView = v.getView(risk);
			var ls = v.getLayoutStrategy();
			var xVal = ls.xscale.invert(riskView.x);
			var yVal = ls.yscale.invert(riskView.y);
			
			var model = v.getModel();
			var ms = model.getMeasurementSet();
			
			ms.setMetric(v.xmetric, risk, xVal);
			ms.setMetric(v.ymetric, risk, yVal);
			
			if (c.riskViewToBePlaced == rv){
				c.placeRiskToDragOn();
			}
			
		}, this);

	}


	return scope;
});