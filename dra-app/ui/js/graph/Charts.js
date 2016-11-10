/**
 * 
 */

define([ "models", "chai", "views", "application"], function(models, chai,
		views, app) {

	var scope = {};

	function ChartsPanelView() {

		views.GraphicalPanelView.call(this, "charts", "Charts", "svg");
		this.x = new XAxisLabel(this.getDocument());
		this.xTop = new XTopAxisLabel(this.getDocument());
		this.y = new YAxisLabel(this.getDocument());
		this.d3().append("div").classed("buttons", true);
		this.setDimensions(1000, 1000);

	}

	ChartsPanelView.prototype = Object.create(views.GraphicalPanelView.prototype);
	ChartsPanelView.prototype.constructor = ChartsPanelView;
	scope.ChartsPanelView = ChartsPanelView;

	ChartsPanelView.prototype.createModelView = function() {
		return new ChartView(this.modelContent.node());
	}

	ChartsPanelView.prototype.setDimensions = function (width, height){
		var mv = this.getModelView();
		this.d3().style("width", width + "px");
		this.d3().style("height", height + "px");
		
		if (mv){
			mv.setDimensions(width, height);
		}
	}

	ChartsPanelView.prototype.showChanges = function() {
		views.GraphicalPanelView.prototype.showChanges.call(this);

		this.x.showChanges();
		this.xTop.showChanges();
		this.y.showChanges();
	}
	
	
	function AxisLabel(targetDocument) {
		views.AbstractView.call(this, targetDocument);

		this.label = this.d3().append("div");
		this.label.append("ul").attr("role", "menu");

		this.label.style("display", "none");

	}

	AxisLabel.prototype = Object.create(views.AbstractView.prototype);
	AxisLabel.prototype.constructor = AxisLabel;

	AxisLabel.prototype.setMetricSet = function(metricSet) {
		var items = this.label.select(".dropdown-menu");
		items.selectAll("li").remove();

		metricSet.getMetrics().forEach(function(m) {
			if (m instanceof models.RiskMetric) {
				var item = items.append("li");
				item.append("a").text(m.name);
			}
		}, this);
	}

	AxisLabel.prototype.setMetric = function(metric) {
		this.label.select("text").text(metric.name);
	}

	AxisLabel.prototype.showChanges = function() {
		this.label.style("display", "block");
	}
	function XAxisLabel(targetDocument) {
		AxisLabel.call(this, targetDocument);
		this.label.attr("id", "xControl");
		this.label.attr("class", "dropup axisLabel");
		var svg = this.label.insert("svg", ":first-child").attr("class", "dropdown-toggle").attr("data-toggle", "dropdown");
		var g = svg.append("g");
		g.append("polygon").attr("points", "40,9 40,34 126,34 126,9 102,9 97,0 92,9 0,9");
		g.append("text").attr("transform", "translate(57,27)").text("Severity");

		var ul = this.label.select("ul").attr("class",
				"dropdown-menu dropdown-menu-right").attr(
				"aria-labelledby", "xControl");
	}
	XAxisLabel.prototype = Object.create(AxisLabel.prototype);
	XAxisLabel.prototype.constructor = XAxisLabel;
	scope.XAxisLabel = XAxisLabel;
	
	function XTopAxisLabel(targetDocument) {
		AxisLabel.call(this, targetDocument);
		this.label.attr("id", "xControl");
		this.label.attr("class", "dropup axisLabel");
		var svg = this.label.insert("svg", ":first-child").attr("class", "dropdown-toggle").attr("data-toggle", "dropdown");
		var g = svg.append("g");
		g.append("polygon").attr("points", "40,9 40,34 126,34 126,9 102,9 97,0 92,9 0,9");
		g.append("text").attr("transform", "translate(57,27)").text("Severity");

		var ul = this.label.select("ul").attr("class",
				"dropdown-menu dropdown-menu-right").attr(
				"aria-labelledby", "xControl");
	}
	XTopAxisLabel.prototype = Object.create(AxisLabel.prototype);
	XTopAxisLabel.prototype.constructor = XTopAxisLabel;
	scope.XTopAxisLabel = XTopAxisLabel;

	function YAxisLabel(targetDocument) {
		AxisLabel.call(this, targetDocument);
		var svg = this.label.insert("svg", ":first-child").attr("class", "dropdown-toggle").attr("data-toggle", "dropdown");
		var g = svg.append("g");
		g.append("polygon").attr("points", "0,25 24,25 29,34 34,25 80,25 80,0 0,0");
		g.append("text").attr("transform", "translate(10,18)").text("Likihood");
		
		this.label.attr("id", "yControl");
		this.label.attr("class", "dropdown axisLabel");
		this.label.select("ul").attr("class", "dropdown-menu").attr(
				"aria-labelledby", "xControl");
	}
	YAxisLabel.prototype = Object.create(AxisLabel.prototype);
	YAxisLabel.prototype.constructor = YAxisLabel;
	scope.YAxisLabel = YAxisLabel;
	
	function ChartView(targetDocument) {
		chai.assert.isNotNull(targetDocument);
		
		views.RiskModelView.call(this, targetDocument, "svg");
		
		var xPos = 300;
		var yPos = 0;
		var riskBoxWidth = 80;
		var riskBoxHeight = 50;
		var dragMeHeight = 24;
		/*var dragBox = this.d3().insert("g", ":first-child").classed("dragBox", true);
		dragBox.append("rect").attr("x", xPos).attr("y", yPos).attr("width", riskBoxWidth).attr("height", dragMeHeight).attr("class", "dragMe");
		dragBox.append("text").text("Drag Me").attr("x", xPos + 8).attr("y", yPos + 16);
		dragBox.append("rect").attr("x", xPos).attr("y", yPos + dragMeHeight).attr("width", riskBoxWidth).attr("height", riskBoxHeight).attr("class", "riskBox");*/
		var defs = this.d3().select(".content").insert("defs", ":first-child");
		this.gap = 5;

		this.clipGap = 0;
		this.graphClip = defs.append("clipPath").attr("id", "graphClipPath");
		this.graphClip.append("rect").attr("x", 0).attr("y", 0).style("fill", "red");
			
//		this.graphArea.insert("g", ":first-child").classed("regions", true);
//		this.graphArea.attr("clip-path", "url(#graphClipPath)");
//		
//		this.contentClip = defs.append("clipPath").attr("id", "contentClip");
//		this.contentClip.append("rect").attr("x", 0).attr("y", 0);
//		
//		this.xAxisClip = defs.append("clipPath").attr("id", "xAxisClip");
//		this.xAxisClip.append("rect").attr("x", 0).attr("y", 0);

		var gradient = defs.append("linearGradient").attr("id", "graphGradient");
		gradient.attr("x1", "0%");
		gradient.attr("y1", "100%");
		gradient.attr("x2", "100%");
		gradient.attr("y2", "0%");
		

		
		//gradient.attr("gradientUnits", "objectBoundingBox");
		//gradient.attr("gradientTransform", "rotate(55)");
		gradient.attr("spreadMethod", "pad");
		
		gradient.append("stop").attr("offset", "25%").attr("class", "stop1");
		gradient.append("stop").attr("offset", "50%").attr("class", "stop2");
		gradient.append("stop").attr("offset", "75%").attr("class", "stop3");
		

		
		this.graphArea.insert("g", ":first-child").classed("regions", true);
		this.graphArea.attr("clip-path", "url(#graphClipPath)");
		this.graphArea.insert("rect", ":first-child").attr("x", 0).attr("y", 0).attr("class", "background").style("fill", "url(#graphGradient)");
		
		this.contentClip = defs.append("clipPath").attr("id", "contentClip");
		this.contentClip.append("rect").attr("x", 0).attr("y", 100);
		
		this.xAxisClip = defs.append("clipPath").attr("id", "xAxisClip");
		this.xAxisClip.append("rect").attr("x", 0).attr("y", 0);

		this.xmetric = null;
		this.xtopmetric = null;
		this.ymetric = null;
		
		this.scale = 1;

		this.metricsChanged = false;
		
//		this.setDimensions(1000, 800);
		
		this.hide();
	}

	scope.ChartView = ChartView;

	ChartView.prototype = Object.create(views.RiskModelView.prototype);
	ChartView.prototype.constructor = ChartView;
	
	ChartView.prototype.setDimensions = function (width, height) {

		views.RiskModelView.prototype.setDimensions.call(this, width, height);
	
		this.d3().attr("width", width);

		var margin = {
			top : 145,
			right : 80,
			bottom : 100,
			left : 90
		};
		this.margin = margin;
		this.axisLabelsHeight = 60;
		
		this.contentWidth = width - margin.left - margin.right;
		this.contentHeight = height - margin.top - margin.bottom - this.axisLabelsHeight;
		
		if (this.contentWidth < 650){
			this.contentWidth = 650;
		}

		this.graphArea.select(".background").attr("width", this.contentWidth).attr("height", this.contentHeight);

		this.graphClip.select("rect").attr("width", this.contentWidth + 2*this.clipGap)
		.attr("height","100%" ) //this.contentHeight + 2*this.clipGap
		.attr("x", -this.clipGap).attr("y", -this.clipGap - 150);
		
		this.contentClip.select("rect").attr("width", width).attr("height", height).attr("x", -margin.left);
	
		this.content.attr("transform", "translate(" + margin.left
				+ "," + margin.top + ")");
		
		this.positionAxes();
	
	}
	
	ChartView.prototype.positionAxes = function (){
		this.xAxisPos = this.contentHeight + this.gap;
		this.xTopAxisPos = 0;
		this.yAxisPos = 0 - this.gap;
		
		if (this.xAxis){
			this.xAxis.translate = "translate(0, " + this.xAxisPos + ")";
			this.xAxis.d3().attr("transform", this.xAxis.translate);
		}
		
		if (this.xTopAxis){
			this.xTopAxis.translate = "translate(0, " + this.xTopAxisPos + ")";
			this.xTopAxis.d3().attr("transform", this.xTopAxis.translate);
		}
		
		if (this.yAxis){
			this.yAxis.translate = "translate(" + this.yAxisPos + ",0)";
			this.yAxis.d3().attr("transform", this.yAxis.translate);
		}

	}

	ChartView.prototype.getLayoutDimensions = function() {
		return {
			width : this.contentWidth,
			height : this.contentHeight
		};
	}
	
	ChartView.prototype.createRiskView = function(risk) {
		var rv = views.RiskModelView.prototype.createRiskView
				.call(this, risk);
		rv.setRadius(Math.floor(this.height / 60));
		return rv;
	}

	ChartView.prototype.createLinkView = function(link) {
		// No link views are created for this view type.
	}

	ChartView.prototype.createGroupViews = function() {
		// No group views are created for this view type.
	}

	ChartView.prototype.update = function() {
		this.updateRisks();
	}

	ChartView.prototype.animate = function() {

		var ls = this.getLayoutStrategy();
		ls.animate(this, this.getWidth(), this.getHeight());
	}

	ChartView.prototype.setAxes = function(xAxis, xTopAxis, yAxis) {
		this.removeContent();
		
		if (this.xAxis) {
			this.xAxis.d3().remove();
		}
		if (this.xTopAxis) {
			this.xTopAxis.d3().remove();
		}
		if (this.yAxis) {
			this.yAxis.d3().remove();
		}

		
		this.xAxis = xAxis;
		this.xTopAxis = xTopAxis;
		this.yAxis = yAxis;

		this.xmetric = xAxis.getMetric();
		this.xtopmetric = xTopAxis.getMetric();
		this.ymetric = yAxis.getMetric();

		this.setModelChanged(true);

		this.metricsChanged = true;
		
		this.positionAxes();
	}
	
	ChartView.prototype.setMetrics = function(xMetric, yMetric){
		var am = this.getApplicationModel();
		var xInterval = am.getMetricBounds().get(xMetric.getName()).getInterval();
		var yInterval = am.getMetricBounds().get(yMetric.getName()).getInterval();

		var xAxis = new XAxis(this, xMetric, xInterval);
		var xTopAxis = new XTopAxis(this, xMetric, xInterval);
		var yAxis = new YAxis(this, yMetric, yInterval);
		this.setAxes(xAxis, xTopAxis, yAxis);
	}

	ChartView.prototype.modelChanged = function(model) {
		views.RiskModelView.prototype.modelChanged.call(this, model);

		var ms = model.getMeasurementSet();
		var metricSet = ms.getMetricSet();
		this.xmetric = this.xmetric ? this.xmetric : metricSet.getMetric("Severity");
		this.ymetric = this.ymetric ? this.ymetric : metricSet.getMetric("Likelihood");
	}

	ChartView.prototype.showMetrics = function() {
		
		this.d3().selectAll(".regions rect").remove();

		var measurementSet = this.getModel().getMeasurementSet();

		var metricSet = measurementSet.getMetricSet();
		if (metricSet.isEmpty()){
			return;
		}
		
		this.layoutStrategy = new GraphLayoutStrategy(
				this.xAxis.getInterval().getEndpoints(), 
				this.yAxis.getInterval().getEndpoints(), 
				this.xAxis.getMetric(), 
				this.yAxis.getMetric());
		
		this.decorateGraph();
	}
	
	ChartView.prototype.decorateGraph = function (){

		this.xAxis.setRange([0, this.contentWidth]);
		this.xTopAxis.setRange([0, this.contentWidth]);
		this.yAxis.setRange([this.contentHeight, 0]);

		var x = this.xAxis.getScale();
		var xTop = this.xTopAxis.getScale();
		var y = this.yAxis.getScale();

//		var numberOfShades = this.xAxis.getIntervalSequence().length()
//				+ this.yAxis.getIntervalSequence().length() - 1;
//		var variance = 1 / (numberOfShades - 1);
		var ivsX = this.xAxis.getIntervalSequence().getIntervals();
		var ivsXTop = this.xTopAxis.getIntervalSequence().getIntervals();
		var ivsY = this.yAxis.getIntervalSequence().getIntervals();
		
		var colour = "#98c6ea";
		var gap = 3;
		
		ivsX.forEach(function (ivx, i){
			this.addGridLineX(ivx.getRightEndpoint());
		}, this);
		ivsXTop.forEach(function (ivx, i){
			this.addGridLineX(ivx.getRightEndpoint());
		}, this);
		ivsY.forEach(function (ivy, i){
			this.addGridLineY(ivy.getRightEndpoint());
		}, this);

		
//		ivsX.forEach(function(ivx) {
//			ivsY.forEach(
//					function(ivy) {
//						var width = Math.abs(x(ivx.getRightEndpoint())
//								- x(ivx.getLeftEndpoint()));
//						var height = Math.abs(y(ivy.getRightEndpoint())
//								- y(ivy.getLeftEndpoint()));
//						var shadeFactor = ivsX.indexOf(ivx)
//								+ ivsY.indexOf(ivy);
//						var opacity = shadeFactor * variance;
//						var areaWidth = width > gap ? width - gap : 0;
//						var areaHeight = height > gap ? height - gap
//								: 0;
//
//						var area = this.graphArea.select(".regions").insert("rect",
//								":first-child").classed("zone", true).attr("x",
//								x(ivx.getLeftEndpoint())).attr("y",
//								y(ivy.getRightEndpoint())).attr(
//								"width", areaWidth).attr("height",
//								areaHeight).style("fill", colour)
//								.style("opacity", opacity);
//						area.datum({ivx: ivx, ivy: ivy, area: area});
//
//					}, this);
//		}, this);
	}
	
	ChartView.prototype.addGridLineX = function (x){
		var xVal = this.xAxis.getScale()(x);
		this.graphArea.select(".regions").append("line").classed("gridline", true)
		.attr("x1", xVal).attr("y1", 0)
		.attr("x2", xVal).attr("y2", this.contentHeight);
	}
	
	ChartView.prototype.addGridLineY = function (y){
		var yVal = this.yAxis.getScale()(y);
		this.graphArea.select(".regions").append("line").classed("gridline", true)
		.attr("x1", 0).attr("y1", yVal)
		.attr("x2", this.contentWidth).attr("y2", yVal);
	}

	
	ChartView.prototype.showChanges = function() {
		this.removeContent();
		
//		if (this.xAxis) {
//			this.xAxis.d3().remove();
//		}
//
//		if (this.yAxis) {
//			this.yAxis.d3().remove();
//		}

		this.showMetrics();
		views.RiskModelView.prototype.showChanges.call(this);
	}

	/**
	 * An axis view displays an axis for a given metric.
	 */
	function Axis(parentView, metric, interval, labels) {
		chai.assert.instanceOf(metric, models.Metric);

		this.metric = metric;
		
		views.View.call(this, parentView, "g");
		var domain = interval.getEndpoints();
		this.scale = d3.scale.linear().domain(domain).clamp(true);
		

		this.labels = labels ? labels : [ "very low", "low", "medium", "high", "very high" ];
		if (metric.name == "Degree"  || metric.name == "OutDegree" || metric.name == "InDegree"){
			this.labels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		}

		var numberOfIntervals = this.labels.length - 1;
		
		// If the interval is unbounded then use the metric's interval
		// argument to make it bounded.
		this.interval = metric.interval.makeBound(interval);
		this.intervalSequence = this.interval.divideInto(numberOfIntervals);

		var allIntervals = this.intervalSequence;
		var intervals = allIntervals.getOverlappingIntervals(interval);
		var allDelimiters = allIntervals.getDelimiters();
		var delimiters = intervals.getDelimiters();
		var axis = this;

		this.d3Axis = d3.svg.axis().scale(this.scale).tickValues(delimiters)
				.tickFormat(function (v){
					return axis.getLabel(v);
				});

		
		this.intervals = intervals;
	}

	views.Axis = Axis;
	Axis.prototype = Object.create(views.View.prototype);
	Axis.prototype.constructor = Axis;

	Axis.prototype.getMetric = function (){
		return this.metric;
	}
	Axis.prototype.getLabel = function (v){
		var interval = this.intervalSequence.getInterval(v);
		var index = this.intervalSequence.indexOf(interval);
		
		if (index + 1 == this.intervalSequence.length() && v == interval.getRightEndpoint()){
			index++;
		}

		var label = this.labels[index];
		return label;
	}
	
	Axis.prototype.getScale = function() {
		return this.scale;
	}
	Axis.prototype.getInterval = function (){
		return this.interval;
	}

	Axis.prototype.getIntervalSequence = function() {
		return this.intervals;
	}

	Axis.prototype.getPosition = function(value) {
		return this.scale(value);
	}

	/**
	 * Determines whether the value (expressed in visual coordinates) is contained by the axis.
	 * 
	 * @param value
	 */
	Axis.prototype.contains = function(value){
		if (!this.scale.range()){
			return false;
		}
		
		var di = this.bound.getInterval();
		var sl = this.scale(di.getLeftEndpoint());
		var sr = this.scale(di.getRightEndpoint());
		var interval = new models.Closed(sl, sr);
		var contains = interval.contains(value);
		return contains;
	}

	Axis.prototype.getInsertionPoint = function() {
		return this.getParent().d3().select(".contentViewport");
	}
	
	Axis.prototype.setRange = function (range){
		this.scale.range(range);
		this.d3().call(this.d3Axis);
	}

	function XAxis(parentView, metric, interval, labels) {
		if (!labels){
			labels = JSON.parse(localStorage.getItem("xLegends"));
		}
		Axis.call(this, parentView, metric, interval, labels);

		this.d3Axis.orient("bottom");
		this.d3().attr("class", "x axis")
				//.attr("clip-path", "url(#xAxisClipPath)")
				;
	}

	XAxis.prototype = Object.create(Axis.prototype);
	XAxis.prototype.constructor = XAxis;
	
	function XTopAxis(parentView, metric, interval, labels) {
		if (!labels){
			labels = JSON.parse(localStorage.getItem("xLegends"));
		}
		Axis.call(this, parentView, metric, interval, labels);

		this.d3Axis.orient("top");
		this.d3().attr("class", "x axis")
				//.attr("clip-path", "url(#xAxisClipPath)")
				;
	}

	XTopAxis.prototype = Object.create(Axis.prototype);
	XTopAxis.prototype.constructor = XTopAxis;

	function YAxis(parentView, metric, interval, labels) {
		if (!labels){
			labels = JSON.parse(localStorage.getItem("yLegends"));
		}
		Axis.call(this, parentView, metric, interval, labels);
		this.d3Axis.orient("left");
		this.d3().attr("class", "y axis");

	}

	YAxis.prototype = Object.create(Axis.prototype);
	YAxis.prototype.constructor = YAxis;

	function GraphLayoutStrategy(xDomain, yDomain, m1, m2) {
		this.xDomain = xDomain;
		this.yDomain = yDomain;
		this.m1 = m1;
		this.m2 = m2;
		this.xscale = d3.scale.linear().domain(this.xDomain);
		this.yscale = d3.scale.linear().domain(this.yDomain);
	}

	GraphLayoutStrategy.prototype = Object
			.create(views.LayoutStrategy.prototype);
	GraphLayoutStrategy.prototype.constructor = GraphLayoutStrategy;

	GraphLayoutStrategy.prototype.layout = function(riskNetworkView,
			width, height) {

		// Scales and axes. Note the inverted domain for the y-scale:
		// bigger is up!
		var x = this.xscale.range([ 0, width ]);
		var y = this.yscale.range([ height, 0 ]);

		var rnv = riskNetworkView;
		var ms = rnv.getModel().getMeasurementSet();

		rnv.riskViews.forEach(function(rv) {
			var m1Val = ms.getMeasurement(this.m1, rv.risk);
			var m2Val = ms.getMeasurement(this.m2, rv.risk);
			
			if (!m1Val){
				m1Val = 0; //this.random(this.xDomain);
				ms.setMetric(this.m1, rv.risk, m1Val);
			}
			
			if (!m2Val){
				m2Val = 0;  //this.random(this.yDomain);
				ms.setMetric(this.m2, rv.risk, m2Val);
			}
			
			rv.x = x(m1Val);
			rv.y = y(m2Val);
				
		}, this);

		riskNetworkView.update();
	}
	
	GraphLayoutStrategy.prototype.random = function(b){
		return b[0] + Math.random() * (b[1] - b[0]);
	}

	GraphLayoutStrategy.prototype.animate = function(view, width,
			height) {
		chai.assert.instanceOf(view, RiskModelView);

		var ms = view.getMeasurementSet();
		var sets = ms.getMeasurementSets();
		if (sets.length < 2) {
			return;
		}

		var ls = this;

		view.riskViews.forEach(function(rv) {
			ls.animateRiskView(rv, ms, width, height);
		});
	}

	GraphLayoutStrategy.prototype.animateRiskView = function(view, ms,
			width, height) {
		chai.assert.instanceOf(view, RiskView);
		chai.assert.isNumber(width);
		chai.assert.isNumber(height);
		chai.assert.instanceOf(ms, models.AggregateMeasurementSet);

		var x = this.xscale.range([ 0, width ]).clamp(true);
		var y = this.yscale.range([ height, 0 ]).clamp(true);

		var ls = this;
		var mms = ms.getMeasurementSets();

		var risk = view.getRisk();
		var subject = risk;

		var f = function() {
			return ls.getRiskViewInterpolator(subject, x, y, view, ms);
		}

		view.d3().transition().duration(5000).delay(2000).attrTween(
				"t", f);

	}

	GraphLayoutStrategy.prototype.getRiskViewInterpolator = function(
			subject, x, y, view, ms) {

		var intX = this.getInterpolator(subject, this.m1, x, ms);
		var intY = this.getInterpolator(subject, this.m2, y, ms);

		var newInt = function(t) {

			view.x = intX(t);
			view.y = intY(t);
			view.update();

			return t;
		};

		return newInt;
	}

	GraphLayoutStrategy.prototype.getInterpolator = function(subject,
			metric, scale, ms) {
		var interpolators = [];
		var seq = ms.getMeasurementSequence(metric, subject);
		for (var i = 1; i < seq.length; i++) {
			var r = d3.interpolateNumber(seq[i - 1], seq[i]);
			interpolators.push(r);
		}
		var interpolator = function(t) {
			var index = Math.floor(t / (seq.length - 1));
			var intp = interpolators[index];
			var newT = t / seq[index + 1];
			return scale(intp(newT));
		};

		return interpolator;

	}
	
	return scope;
})
