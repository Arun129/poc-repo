/**
 * @author wjenkins1
 * 
 */

define(
		[ "models", "views", "chai", "underscore", "application", "server"],
		function(models, views, chai, _, app, svr) {
			var controllers = {};
			
			function Control(parentControl) {

				this.parentControl = null;
				this.childControls = [];
				this.view = null;
				this.organisation = null;

				this.parentControl = parentControl;
			}
			controllers.Control = Control;

			Control.prototype.addChild = function(child) {
				chai.assert.instanceOf(child, Control);
				this.childControls.push(child);
			}

			Control.prototype.getParent = function() {
				return this.parentControl;
			}

			Control.prototype.setView = function(view) {

				if (this.view) {
					this.view.removeListener(this);
				}

				this.view = view;
				this.view.addListener(this);
			}

			Control.prototype.getView = function() {
				return this.view;
			}
			
			Control.prototype.modelChanged = function(model) {
				this.model = model;
			}

			Control.prototype.getModel = function() {
				return this.model;
			}

			Control.prototype.getMeasurementSet = function() {
				return this.measurementSet;
			}

			
			Control.prototype.showError = function (error){
				var errorView = new views.ErrorView()
				errorView.showMessage(error);
			}

			Control.prototype.getViewDocument = function() {
				if (this.view == null) {
					return null;
				}
				return this.getView().getDocument();
			}

			Control.prototype.viewChanged = function(view) {

			}

			Control.prototype.organisationChanged = function(organisation) {
				this.organisation = organisation;
			}

			Control.prototype.getOrganisation = function() {
				return this.organisation;
			}

			function AbstractRiskModelController(parent) {

				Control.call(this, parent);

				this.highlightedRisk = null;
				this.timesClicked = 0;
				this.riskDetailsView = null;
			}
	
			AbstractRiskModelController.prototype = Object
					.create(Control.prototype);
			AbstractRiskModelController.prototype.constructor = Control;
			controllers.AbstractRiskModelController = AbstractRiskModelController;
			
			AbstractRiskModelController.prototype.setView = function (view){
				Control.prototype.setView.call(this, view);
				
				var am = view.getApplicationModel();
				
				am.registerListener("risk", this);
				am.registerListener("model", this);
			}

			AbstractRiskModelController.prototype.doRiskAction = function(risk) {
				var am = this.getView().getApplicationModel();

				var currentRisk = am.getRisk();
				if (currentRisk != null && risk != null
						&& currentRisk.id == risk.id) {
					risk = null;
				}
				
				am.setRisk(risk);
	
			}
			
			AbstractRiskModelController.prototype.riskChanged = function (risk){
				this.reset();
				
				if (!risk){
					return;
				}
				var rv = this.getView().getView(risk);
				if (rv){
					rv.highlight();
				}
			}
			
			/**
			 * 
			 */
			AbstractRiskModelController.prototype.reset = function() {
				var view = this.getView();
				view.reset();
				this.highlightedRisk = null;
			}

			AbstractRiskModelController.prototype.greyOut = function(opacity) {
				this.getView().greyOut(opacity);
				this.getView().hidePropertyView();
			}

			AbstractRiskModelController.prototype.highlightRiskArea = function(
					risk) {

				this.timesClicked = this.highlightedRisk == risk.id ? this.timesClicked + 1
						: 1;
				d3.event.stopPropagation();

				if (this.timesClicked == 2) {
					this.getView().reset();
					return;
				}

				this.getView().highlightRiskArea(risk);
				this.highlightedRisk = risk.id;
			}


			function ZoomControl(controller, hostSelector, targetSelector) {
				controllers.Control.call(this, controller);

				this.zoom = d3.behavior.zoom();
				this.drag = d3.behavior.drag();
				this.zoom.scaleExtent([ 0.1, 10 ]).translate([ 0, 0 ]).scale(1);
				this.hostSelector = hostSelector;
				this.targetSelector = targetSelector;
				this.target = null;
				this.host = null;

			}

			ZoomControl.prototype = Object.create(Control.prototype);
			ZoomControl.prototype.constructor = ZoomControl;
			controllers.ZoomControl = ZoomControl;

			ZoomControl.prototype.viewChanged = function(view) {
				Control.prototype.viewChanged.call(this, view);

				var c = this;
				
				var target = this.targetSelector ? view.d3().select(
						this.targetSelector) : view.d3();
				this.target = target;
//				TODO Some work needs to be done here on improving the zoom behaviour by restricting the
//				events by which is can be triggered.
				
				var tn = target;
//				tn.on("mousemove.zoom", null);
//				tn.on("dblclick.zoom", function(){console.log("dblclick")});
//				tn.on("touchstart.zoom", null);
//				target.on("wheel.zoom", null);
//				target.on("mousewheel.zoom", null);
//				target.on("MozMousePixelScroll.zoom", null);

						
				this.zoom.on("zoomstart", function (){
					if (!d3.event.sourceEvent){
						return;
					}
					if (d3.event.sourceEvent && d3.event.sourceEvent.type === "mousedown"){
						return;
					}

					d3.event.sourceEvent.stopPropagation();
					d3.event.sourceEvent.preventDefault();
				});
				this.zoom.on('zoom', this.zoomUpdate.bind(this));
				this.drag.on('drag', this.dragUpdate.bind(this));

				view.d3().datum(this).call(this.zoom);
				view.d3().datum(this).call(this.drag);

			}
			
			ZoomControl.prototype.zoomUpdate = function() {
				var e = d3.event;

				var tf = d3.transform(this.target.attr("transform"));
				tf.scale = [e.scale, e.scale];
				
				this.target.attr("transform", tf.toString());
				
			}
			
			ZoomControl.prototype.dragUpdate = function (){
				var e = d3.event;
				
				var tf = d3.transform(this.target.attr("transform"));
				tf.translate[0] += d3.event.dx;
				tf.translate[1] += d3.event.dy;
				this.target.attr("transform", tf.toString());
			}
			

			function RiskNetworkController(parent) {
				AbstractRiskModelController.call(this, parent);
			}

			RiskNetworkController.prototype = Object.create(AbstractRiskModelController.prototype);
			RiskNetworkController.prototype.constructor = RiskNetworkController;
			controllers.RiskNetworkController = RiskNetworkController;

			RiskNetworkController.prototype.viewChanged = function(view) {
				var s = this.getView().d3();

				var c = this;
				//d3.select(window).on('resize', view.resize.bind(view));

				// Clicking on the network causes the display to be reset.
				this.getView().d3().on("click", this.onReset.bind(this));
				
				// Ensure that the risk action is connected to this view.
				s.selectAll(".riskView").select(".shape").on("click", this.onRiskSelection.bind(this));
				AbstractRiskModelController.prototype.viewChanged.call(this,
						view);

			}
			
			RiskNetworkController.prototype.onReset = function (){
				if (d3.event.defaultPrevented)
					return;
				d3.event.stopPropagation();

				this.reset();
			}
			
			RiskNetworkController.prototype.onRiskSelection = function (risk){
				var v = this.getView().getView(risk);
				
				// Measures the change in position of an object. If it has gone
				// more than 10 pixels then consider this action a drag.
				if (v.change && Math.abs(v.change.dx) >= 5 && Math.abs(v.change.dy) >= 5){
					return;
				}

				if (d3.event) {
					d3.event.stopPropagation();
					d3.event.preventDefault();
				}
				this.doRiskAction(risk);
			}
			
			RiskNetworkController.prototype.reset = function (){
				AbstractRiskModelController.prototype.reset.call(this);
				
				this.getView().stopLayout();
			}
			
			
			function NexusController (parent) {
				RiskNetworkController.call(this, parent);
				this.setSelect();
				
				this.linkSelectionStrategy = new models.Outgoing();
				this.connectStrategy = new ConnectFrom();
			}
			
			NexusController.prototype = Object.create(RiskNetworkController.prototype);
			NexusController.prototype.constructor = NexusController;

			NexusController.prototype.doRiskAction = function(risk) {
				this.riskAction(risk);
			}
			
						
			NexusController.prototype.onReset = function (){
//				console.log("Resetting");
				// Dont do anything on reset because in this view it just becomes annoying.
			}

			
			NexusController.prototype.selectRisk = function (risk){
				RiskNetworkController.prototype.doRiskAction.call(this, risk);
				this.highlightedRisk = risk;
                var s = this.getView().d3();
				this.setConnect();
				angular.element(document.getElementById('RiskMapCtrlDiv')).scope().resetTimer();
				angular.element(document.getElementById('RiskMapCtrlDiv')).scope().remingRiskCalculate();
				angular.element(document.getElementById('RiskMapCtrlDiv')).scope().setdirty();
				var riskMap = JSON.parse(localStorage.getItem("riskMap"));
				if (riskMap){
					document.getElementById('selectedRiskName').innerHTML = risk.name + ": ";
					document.getElementById('selectedRiskDesc').innerHTML = riskMap[risk.name];
				}
                s.selectAll(".riskView:not(.connected)").selectAll("text").classed("link-count-hide",true);
                s.selectAll(".connected:not(.highlighted),text").selectAll(".link-count").classed("link-count-hide",true); // to hide risk count for destination 
                s.selectAll(".riskView").selectAll("image").classed("completed completedflag",false).classed("completed",true);
                s.selectAll(".highlighted,text").selectAll(".link-count-hide").classed("link-count-hide",false).classed("link-count",true);
                s.selectAll(".labels").selectAll(".highlighted").classed("connected",true);
			}
			
			NexusController.prototype.connectRisk = function (risk){
				var nv = this.getView();
				var model = nv.getModel();
				var s = this.getView().d3();
				angular.element(document.getElementById('RiskMapCtrlDiv')).scope().resetTimer();
				if (this.highlightedRisk != null && risk != null && this.highlightedRisk.id == risk.id){
					RiskNetworkController.prototype.doRiskAction.call(this, risk);
					this.setSelect();
//                                        console.log(risk.id);
					angular.element(document.getElementById('RiskMapCtrlDiv')).scope().updateRiskStatusAsConnected(risk.id);
					angular.element(document.getElementById('RiskMapCtrlDiv')).scope().remingRiskCalculate();
					angular.element(document.getElementById('RiskMapCtrlDiv')).scope().calculatePercentagerRiskMap();
					angular.element(document.getElementById('RiskMapCtrlDiv')).scope().setdirty();
					document.getElementById('selectedRiskName').innerHTML = "";
					document.getElementById('selectedRiskDesc').innerHTML = "";
					s.selectAll(".connected").classed("connected",false);
					s.selectAll(".riskView").selectAll(".link-count").classed("link-count-hide",false);	
					return;
				}
				
				var risk1 = this.highlightedRisk;
				var risk2 = risk;
				
				this.connectStrategy.connect(model, risk1, risk2);	
			}
			
			NexusController.prototype.setConnectStrategy = function (cs){
				this.connectStrategy = cs;
			}
			

			NexusController.prototype.riskChanged = function (risk){
				
				AbstractRiskModelController.prototype.riskChanged.call(this, risk);
				if (risk == null){
					return;
				}
				var nv = this.getView();
				var model = this.getModel();
				var links = nv.selectLinks(model.getBaseModel(), risk);
				nv.highlightLinks(links);
			}
			
						
			NexusController.prototype.reset = function (){
				var nv = this.getView();
				if (this.highlightedRisk){
					var model = this.getModel();
					var links = nv.selectLinks(model.getBaseModel(), this.highlightedRisk);
					links.forEach(function (l){
						var v = this.getView().getLinkView(l);
						if (v) { v.reset(); }
					}, this);
				}
				AbstractRiskModelController.prototype.reset.call(this);
			}
			
			NexusController.prototype.setSelect = function (){
				this.riskAction = this.selectRisk.bind(this);
			}
			
			NexusController.prototype.setConnect = function (){
				this.riskAction = this.connectRisk.bind(this);
			}
			
			NexusController.prototype.viewChanged = function (view){
				RiskNetworkController.prototype.viewChanged.call(this, view);

				view.d3().selectAll(".link").on("click", this.linkSelected.bind(this));
			}
			
			NexusController.prototype.linkSelected = function (link){
				if (d3.event){
					if (d3.event.defaultPrevented)
						return;
					d3.event.stopPropagation();
					d3.event.preventDefault();
				}
				var lv = this.getView().getLinkView(link);
				lv.step();
			}
			
			
			function ConnectStrategy (){
				
			}
			
			function ConnectTo () {
				
			}
			ConnectTo.prototype = Object.create(ConnectStrategy.prototype);
			ConnectTo.prototype.constructor = ConnectTo;

			ConnectTo.prototype.connect = function (qmodel, risk1, risk2){
				
				// No self reference
				if (risk1.id == risk2.id){
					return;
				}
				
				var model = qmodel.getBaseModel();

				var l = model.getLink(risk2, risk1);
				
				if (l){
					qmodel.removeLink(l);
					return;
				}
				qmodel.addLink(risk2, risk1);
			}
			
			function ConnectFrom () {
				
			}
			ConnectFrom.prototype = Object.create(ConnectStrategy.prototype);
			ConnectFrom.prototype.constructor = ConnectFrom;

			ConnectFrom.prototype.connect = function (qmodel, risk1, risk2){
				// No self reference
				if (risk1.id == risk2.id){
					return;
				}
				
				var model = qmodel.getBaseModel();
				
				var l = model.getLink(risk1, risk2);
				
				if (l){
					qmodel.removeLink(l);
					return;
				}
				
				qmodel.addLink(risk1, risk2);
			}



				function RiskControl(parent) {
				chai.assert.instanceOf(parent, Control);

				var controlView = d3.select(parent.getDocument()).append("div")
						.attr("class", "dropdown");
				Control.call(this, parent, controlView.node());

				var btn = controlView.append("button").attr("class",
						"btn btn-primary btn-sm dropdown-toggle").attr(
						"data-toggle", "dropdown").attr("type", "button").attr(
						"aria-expanded", "true").text("Risks");

				btn.append("span").attr("class", "caret");

				var items = controlView.append("ul").attr("class",
						"dropdown-menu").attr("role", "menu");

				var item = items.append("li");
				var link = item.append("a");
				link.text("Add Risk").attr("data-toggle", "modal").attr(
						"data-target", "#addRiskModel");

			}
				

			RiskControl.prototype = Object.create(Control.prototype);
			RiskControl.prototype.constructor = RiskControl;

			
			function PanelControl(name, parent) {
				Control.call(this, parent, d3.select("#" + name + "Panel")
						.node());

				this.name = name;
			}

			PanelControl.prototype = Object.create(Control.prototype);
			PanelControl.prototype.constructor = PanelControl;

			function ModelPanelControl(name, parent) {
				PanelControl.call(this, name, parent);
				this.modelController = this.createController();
				this.modelChangedFlag = false;
			}

			ModelPanelControl.prototype = Object.create(PanelControl.prototype);
			ModelPanelControl.prototype.constructor = ModelPanelControl;
			controllers.ModelPanelControl = ModelPanelControl;

			ModelPanelControl.prototype.getModelController = function() {
				return this.modelController;
			}
			
			ModelPanelControl.prototype.setModelController = function(
					modelController) {
				this.modelController = modelController;
			}

			ModelPanelControl.prototype.modelChanged = function(model) {
				this.modelChangedFlag = true;
				this.model = model;
			}
			
			ModelPanelControl.prototype.riskChanged = function (risk){
				
			}

			ModelPanelControl.prototype.getModel = function() {
				return this.model;
			}

			ModelPanelControl.prototype.getMeasurementSet = function() {
				return this.measurementSet;
			}

			ModelPanelControl.prototype.setView = function(view) {
				PanelControl.prototype.setView.call(this, view);
				
				var am = view.getApplicationModel();
				
				am.registerListener("risk", this);
				am.registerListener("model", this);
				
				this.modelController.setView(view.modelView);
			}
			function NexusPanelControl(parent) {
				ModelPanelControl.call(this, "nexus", parent);
			}
			NexusPanelControl.prototype = Object
					.create(ModelPanelControl.prototype);
			NexusPanelControl.prototype.constructor = NexusPanelControl;
			controllers.NexusPanelControl = NexusPanelControl;
			
			NexusPanelControl.prototype.createController = function (){
				return new NexusController(this);
			}
						
			NexusPanelControl.prototype.viewChanged = function (view, event){
				if (view == null){
					return;
				}
				
				view.d3().select(".select").on("click", this.setSelect.bind(this));
				view.d3().select(".connect").on("click", this.setConnect.bind(this));
				view.d3().select(".add").on("click", this.addRisk.bind(this));	
				view.d3().select(".delete").on("click", this.removeRisk.bind(this));	
				view.d3().select(".from").on("click", this.setFrom.bind(this));
				view.d3().select(".to").on("click", this.setTo.bind(this));	
				view.d3().select(".editValues").on("click", this.editValues.bind(this));	


			}
			
			NexusPanelControl.prototype.modelChanged = function (model){
				ModelPanelControl.prototype.modelChanged.call(this, model);
				
				this.setSelect();
//				this.setTo();
				this.setFrom();
				
			}

			NexusPanelControl.prototype.editValues = function (model, ms){
				var wb = this.getParent();
				var chartView = wb.getView("charts");
				wb.showView(chartView);
			}
			
			NexusPanelControl.prototype.setSelect = function (){
				var v = this.getView();
				v.d3().select(".select").classed("active", true).attr("disabled", "disabled");
				v.d3().select(".connect").classed("active", false).attr("disabled", null);
				v.d3().select(".add").attr("disabled", null);	
			
				var status = v.getApplicationModel().getRisk() ? null : "disabled";
				v.d3().select(".delete").attr("disabled", status);
				
				v.getModelView().reset();

				var c = this.getModelController();
				c.setSelect();
			}
			
			NexusPanelControl.prototype.setFrom = function (){
				var v = this.getView();
				v.d3().select(".from").classed("active", true).attr("disabled", "disabled");
				v.d3().select(".to").classed("active", false).attr("disabled", null);
				var mc = this.getModelController();
				mc.getView().setOutgoingMode();
				mc.setConnectStrategy(new ConnectFrom());

			}
			
			NexusPanelControl.prototype.setTo = function (){
				var v = this.getView();
				v.d3().select(".from").classed("active", false).attr("disabled", null);
				v.d3().select(".to").classed("active", true).attr("disabled", "disabled");
				var mc = this.getModelController();
				mc.getView().setIncomingMode();
				mc.setConnectStrategy(new ConnectTo());

			}
			
			NexusPanelControl.prototype.setConnect = function (){
				var v = this.getView();
				v.d3().select(".select").classed("active", false).attr("disabled", null);
				v.d3().select(".connect").classed("active", true).attr("disabled", "disabled");
				v.d3().select(".delete").attr("disabled", "disabled");	
				v.d3().select(".add").attr("disabled", "disabled");	

				var c = this.getModelController();
				c.setConnect();

			}
			NexusPanelControl.prototype.riskChanged = function (risk){
				var body = "No Description";
				var header = risk == null ? "Selected Risk" : risk.getName();
				
				var view = this.getView();
				if (! view){
					return;
				}
				
				var state = risk ? null : "disabled";
				view.d3().select(".delete").attr("disabled", state);
//				view.d3().select(".connect").attr("disabled", state);

//				var name = view.d3().select(".riskName");
//				name.node().value = header;
//				name.on("change", this.changeRiskName.bind(this));
//				name.datum(risk);
				view.d3().select(".riskDelete").datum(risk);
			}
			
			NexusPanelControl.prototype.changeRiskName = function (){
				var name = this.getView().d3().select(".riskName");
				var risk = name.datum();
				risk.name = name.node().value;
				var modelView = this.getView().getModelView();
				var riskView = modelView.getView(risk);
				riskView.labelView.setLabel(risk.name);	
			}
						
			NexusPanelControl.prototype.addRisk = function (){
				var r = new models.Risk(null, "NEW RISK");
				var model = this.getModel();
				model.addRisk(r);
				
				var am = this.getView().getApplicationModel();
				am.setModel(model);
				am.setRisk(r);
			}
			NexusPanelControl.prototype.removeRisk = function (){
				var view = this.getView();
				if (! view){
					return;
				}
				
				view.d3().select(".delete").attr("disabled", "disabled");
				var risk = view.getApplicationModel().getRisk();

				if (!risk){
					return;
				}
				var model = this.getModel();
				model.removeRisk(risk);
				view.getApplicationModel().setModel(this.getModel());
				view.getApplicationModel().setRisk(null);
			}
			
			function SelectTaskControl(name, parent, taskRunner){
				PanelControl.call(this, name, parent);
				this.taskRunner = taskRunner;
			}
			
			SelectTaskControl.prototype = Object.create(PanelControl.prototype);
			SelectTaskControl.prototype.constructor = SelectTaskControl;
			controllers.SelectTaskControl = SelectTaskControl;
			
			SelectTaskControl.prototype.setView = function (view){
				var c = this;
				view.d3().select(".create-engagement").on("click", this.startEngagement.bind(this));
				PanelControl.prototype.setView.call(this, view);
				this.getTasks();
			}
			
			SelectTaskControl.prototype.startEngagement = function (){
				window.location.href = "/dra-web/doTask.jsp?processDefinitionKey=Engagement&callbackUrl=/dra-web/index.html";
			}
			
			SelectTaskControl.prototype.fail = function(error){
				var m = new views.Modal();
				m.d3().select(".modal-title").text("Error");
				m.d3().select(".modal-body").text(error);
				m.show();
			}

			SelectTaskControl.prototype.getTasks = function(){
				var rq = new svr.GetRequest();
				rq.setPath("/tasks/tasks");
				rq.setSuccess(this.setTasks.bind(this));
				rq.setFail(this.showError.bind(this, "Cannot get tasks for this user"));
				rq.run();
			}		
			
			SelectTaskControl.prototype.setTasks = function(tasks){
				if (!tasks || _.isEmpty(tasks)){
					
					return;
				}
				var c = this;
				this.getView().d3().selectAll(".task").remove();
				tasks.forEach(function (task){
					this.getView().addTask(task);
				}, this);
				
				this.getView().d3().selectAll(".doTask").on("click", function (d){ 
					window.location.href = "/dra-web/doTask.jsp?taskId=" 
						+ encodeURIComponent(d.taskId)
						+ "&callbackUrl=/dra-web/index.html";

				});
				
			}
			
				
			function NetworkPanelControl(name, parent, threshold) {
				ModelPanelControl.call(this, name, parent);
			}

			NetworkPanelControl.prototype = Object
					.create(ModelPanelControl.prototype);
			NetworkPanelControl.prototype.constructor = NetworkPanelControl;
			controllers.NetworkPanelControl = NetworkPanelControl;

			NetworkPanelControl.prototype.viewChanged = function() {

				ModelPanelControl.prototype.viewChanged.call(this);

				var view = this.getView().d3();
				var down = view.select(".downThreshold");
				var up = view.select(".upThreshold");

				var c = this;
				up.on("click", function() {
					c.changeThreshold(0.1)
				});
				down.on("click", function() {
					c.changeThreshold(-0.1)
				});

			}

			NetworkPanelControl.prototype.changeThreshold = function(delta) {
				if (! this.getModel()){
					return;
				}
				var value = this.getModel().weightThreshold + delta;
				this.setThreshold(value);
			}

			NetworkPanelControl.prototype.setThreshold = function(value) {
				if (this.threshold == value) {
					return;
				}

				this.threshold = value;

				if (this.threshold < 0) {
					this.threshold = 0;
				}

				var controlView = this.getView().d3();

				var state = this.threshold == 0 ? "disabled" : null;
				controlView.select(".downThreshold").attr("disabled", state);

				var state1 = this.threshold == 1 ? "disabled" : null;
				controlView.select(".upThreshold").attr("disabled", state1);
				
				var model = this.getModel();
				var am = this.getView().getApplicationModel();
				
				var rq = new svr.GetRequest();
				rq.setPath("/models/filteredModel");
				rq.addParameter("modelId", model.id);
				rq.addParameter("threshold", value);
				rq.setSuccess(am.setModel.bind(am));
				rq.setTransform(rq.makeQModel.bind(rq));
				rq.setFail(this.showError.bind(this, "Cannot get filtered model"));
				rq.run();

			}


			function EventController() {
				var form = d3.select("#eventsInputForm");

				form.select("#addEventButton").on(
						"click",
						function() {
							var eventName = form.select("#eventNameInput")
									.node().value;
//							console.log("Adding " + eventName);
							var em = new EventManager();
							var e = new models.Event(null, eventName);
							em.create(e);
						});

				var defForm = d3.select("#definitionInputForm");
				var menu = defForm.select(".dropdown-menu");
				var em = new EventManager();
				var f = function(events) {
					events.forEach(function(event) {
						var item = menu.append("li").attr("role",
								"presentation");
						var a = item.append("a").attr("role", "menuitem").attr(
								"tabindex", "-1").attr("href", "#");
						a.text(event.name);
					});
				}
				em.listAll(f);

			}
			controllers.EventController = EventController;
			
			return controllers;

		});

