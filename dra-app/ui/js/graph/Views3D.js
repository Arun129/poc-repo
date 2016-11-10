/**
 * 
 */
define(
		[ "models", "chai", "views", "application", "three"],
		function(models, chai, views, app, THREE) {

			var scope = {};
			
			function LabelLink3D(parentView, labelView, targetView) {
				views.View.call(this, parentView, "line", true);
				this.labelView = labelView;
				this.targetView = targetView;

			}

			LabelLink3D.prototype = Object.create(views.View.prototype);
			LabelLink3D.prototype.constructor = LabelLink3D;

			LabelLink3D.prototype.update = function() {
				var scene = this.getParent().getScene();

				if (this.arrow) {
					scene.remove(this.arrow);
				}
				var labelPos = this.labelView.sprite.position;
				var riskPos = this.targetView.shape.position;
				var pos = labelPos.clone();
				pos.x = pos.x - 50;
				pos.y = pos.y + 50;

				var dir = pos.clone().sub(riskPos).normalize();
				this.arrow = new THREE.ArrowHelper(dir, riskPos, riskPos
						.distanceTo(labelPos), 0xffff00);
				scene.add(this.arrow);

			}

			function LabelView3D(parentView, targetView, label, labelClass,
					wrapLength) {
				views.AbstractLabelView.call(this, parentView, targetView, label,
						labelClass, wrapLength, "span");

				var scene = this.getParent().getScene();

				var message = label;
				var fontface = "Arial";
				this.fontface = fontface;

				var fontsize = 24;
				this.fontsize = fontsize;
				var textBox = new views.TextBox(label, wrapLength, fontsize);

				var lines = textBox.lines;

				var canvas = document.createElement('canvas');
				var width = wrapLength;
				var height = lines.length * fontsize + (lines.length - 1)
						* fontsize * 0.4;

				var context = canvas.getContext('2d');
				canvas.width = width;

				// Use this code for debugging. It shows the canvas so the
				// sprite can be positioned.
				// context.fillStyle = "green";
				// context.fillRect(0, 0, canvas.width, canvas.height);

				context.font = this.fontsize + "px " + this.fontface;

				// text color
				context.fillStyle = "#333333";

				var pos = fontsize;
				for (var i = 0; i < lines.length; i++) {
					context.fillText(lines[i], 0, pos);
					pos = pos + fontsize;
				}

				// canvas contents will be used for a texture
				var texture = new THREE.Texture(canvas)
				texture.needsUpdate = true;
				texture.minFilter = THREE.NearestFilter;

				var spriteMaterial = new THREE.SpriteMaterial({
					map : texture,
					useScreenCoordinates : false
				});

				var sprite = new THREE.Sprite(spriteMaterial);

				// The initial geometry of sprites is small so they need to be
				// scaled up.
				this.scaleFactor = 80;
				sprite.scale.set(this.scaleFactor, this.scaleFactor, 1);
				scene.add(sprite);
				this.sprite = sprite;

				$(canvas).remove();

				this.labelLink = new LabelLink3D(parentView, this, targetView);

			}

			LabelView3D.prototype = Object.create(views.AbstractLabelView.prototype);
			LabelView3D.prototype.constructor = LabelView3D;

			LabelView3D.prototype.detach = function() {
				var scene = this.getParent().getScene();
				if (this.sprite) {
					scene.remove(this.sprite);
				}
			}
			
			LabelView3D.prototype.setLabel = function (newLabel){

			}	

			LabelView3D.prototype.getTextWidth = function(text) {
				var canvas = document.createElement('canvas');
				// canvas.width = wrapLength;
				var context = canvas.getContext('2d');

				context.font = "Bold " + this.fontsize + "px " + this.fontface;

				// get size data (height depends only on font size)
				var metrics = context.measureText(text);
				var textWidth = metrics.width;
				$(canvas).remove();
				return textWidth;
			}

			LabelView3D.prototype.update = function() {
				var offset = this.scaleFactor / 2;
				var radius = this.targetView.getRadius();
				this.posX = this.x;
				this.posY = this.y - offset + this.fontsize / 2;
				this.posZ = this.z + radius;
				this.sprite.position.set(this.posX, this.posY, this.posZ);

				// Label links are left out for now mainly because sprites turn
				// to face the camera.
				// this.labelLink.update();
			}
			
			function LinkView3D(parentView, link) {
				chai.assert.instanceOf(parentView, RiskModelView3D);
				chai.assert.instanceOf(link, models.RiskLink);
				this.shape = null;
				this.linkHighlight = null;

				views.AbstractLinkView.call(this, parentView, link);

			}

			LinkView3D.prototype = Object.create(views.AbstractLinkView.prototype);
			LinkView3D.prototype.constructor = LinkView3D;

			LinkView3D.prototype.greyOut = function(opacity) {
				if (this.shape){
				this.shape.material.opacity = opacity;
				}
				if (this.linkHighlight){
					this.linkHighlight.material.opacity = opacity;
				}
			}

			
			LinkView3D.prototype.highlight = function() {
				if (this.linkHighlight){
					this.linkHighlight.material.opacity = 1;
				}
			}

			LinkView3D.prototype.reset = function() {
				if (this.linkHightlight){
					this.linkHighlight.material.opacity = 1;
				}
				if (this.shape){
				this.shape.material.opacity = 1;
				}

			}

			LinkView3D.prototype.detach = function() {
				var scene = this.getParent().getScene();
				if (this.shape) {
					scene.remove(this.shape);
					scene.remove(this.linkHighlight);
				}
			}

			LinkView3D.prototype.update = function() {
				var scene = this.parentView.getScene();
				this.detach();

				var radius = this.getLinkWidth([ 2, 4, 6 ]);

				var sv = new THREE.Vector3(this.source.posX, this.source.posY,
						this.source.z);
				var tv = new THREE.Vector3(this.target.posX, this.target.posY,
						this.target.z);
				var pv = tv.clone().sub(sv).multiplyScalar(0.5).add(sv);

				var shapeCyl = new Cylinder3D(sv, tv, 0.5, 0.5, "#666666");
				var shape = shapeCyl.getMesh();

				var highlightCyl = new Cylinder3D(pv, tv, radius, radius,
						"#666666");

				var highlight = highlightCyl.getMesh();

				this.shape = shape;
				this.linkHighlight = highlight;

				scene.add(highlight);
				scene.add(shape);
			}

			/**
			 * 
			 * @param vstart
			 * @param vend
			 * @returns {@link http://stackoverflow.com/questions/15139649/three-js-two-points-one-cylinder-align-issue}
			 */
			function Cylinder3D(vstart, vend, rstart, rend, colour) {

				var HALF_PI = Math.PI * .5;
				var distance = vstart.distanceTo(vend);
				var position = vend.clone().add(vstart).divideScalar(2);

				var material = new THREE.MeshPhongMaterial({
					color : colour
				});
				var cylinder = new THREE.CylinderGeometry(rstart, rend,
						distance, 10, 10, false);

				var orientation = new THREE.Matrix4();// a new orientation
				// matrix to offset
				// pivot
				var offsetRotation = new THREE.Matrix4();// a matrix to fix
				// pivot rotation
				var offsetPosition = new THREE.Matrix4();// a matrix to fix
				// pivot position
				orientation.lookAt(vstart, vend, new THREE.Vector3(0, 1, 0));// look
				// at
				// destination
				offsetRotation.makeRotationX(HALF_PI);// rotate 90 degs on X
				orientation.multiply(offsetRotation);// combine orientation
				// with rotation
				// transformations
				cylinder.applyMatrix(orientation)

				var mesh = new THREE.Mesh(cylinder, material);
				mesh.position.x = position.x;
				mesh.position.y = position.y;
				mesh.position.z = position.z;

				this.mesh = mesh;

			}

			Cylinder3D.prototype.getMesh = function() {
				return this.mesh;
			}
			
			function Network3DPanelView() {
				views.NetworkPanelView.call(this, "network3D", "Network 3D", "div");
			}

			Network3DPanelView.prototype = Object
					.create(views.NetworkPanelView.prototype);
			Network3DPanelView.prototype.constructor = Network3DPanelView;
			scope.Network3DPanelView = Network3DPanelView;

			Network3DPanelView.prototype.createModelView = function() {
				return new views.RiskModelView3D(this.modelContent.node());
			}

			function RiskModelView3D(targetDocument) {

				views.AbstractRiskModelView.call(this, targetDocument, "div");
				
				var canvas = this.d3().append("canvas");

				var canvasNode = canvas.node();

				var renderer = new THREE.WebGLRenderer({
					canvas : canvasNode,
					alpha : true,
					antialias : true
				});

				if (renderer == null) {
					return;
				}


				this.wrapLength = 300;
				this.d3().style("position", "relative");
				this.d3().style("display", "block");

				var scene = new THREE.Scene();
				this.scene = scene;

				var width = this.getWidth();
				var height = this.getHeight();

				this.raycaster = new THREE.Raycaster();

				var camera = new THREE.PerspectiveCamera(45, width / height, 1,
						2000);
				camera.position.z = 500;
				camera.position.x = 0;
				camera.position.y = 0;
				this.camera = camera;

				this.camera = camera;

				var controls = new THREE.OrbitControls(camera);
				this.controls = controls;

				controls.damping = 0.2;
				controls.addEventListener('change', this.render.bind(this));

				// add subtle ambient lighting
				var ambientLight = new THREE.AmbientLight(0x000044);
				scene.add(ambientLight);

				// directional lighting
				var directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
				directionalLight.position.set(0, 0, 1).normalize();
				directionalLight.castShadow = true;
				directionalLight.shadowDarkness = 0.5;
				scene.add(directionalLight);

				var lightBelow = new THREE.DirectionalLight(0xffffff, 1);
				lightBelow.position.set(0, 0, -1).normalize();
				lightBelow.castShadow = true;
				lightBelow.shadowDarkness = 0.5;
				scene.add(lightBelow);

				// var xyPlaneGeometry = new THREE.PlaneGeometry(2000, 2000);
				// var planeMaterial = new THREE.MeshLambertMaterial({color:
				// "white"});
				// var xyPlane = new THREE.Mesh(xyPlaneGeometry, planeMaterial);
				// scene.add(xyPlane);
				//
				renderer.setSize(500, 500);

				var axisHelper = new THREE.AxisHelper(30);
				scene.add(axisHelper);

				//renderer.setSize(width, height);
				 renderer.setClearColor(0xc1e2ec, 1);
				//renderer.setClearColor(0xffffff, 1);

				renderer.shadowMapEnabled = true;

				this.renderer = renderer;
				//this.hide();
				this.animate();
			}

			views.RiskModelView3D = RiskModelView3D;
			RiskModelView3D.prototype = Object
					.create(views.AbstractRiskModelView.prototype);
			RiskModelView3D.prototype.constructor = RiskModelView3D;
			
			RiskModelView3D.prototype.show = function (animate){
				views.AbstractRiskModelView.prototype.show.call(this, animate);
			}

			RiskModelView3D.prototype.showChanges = function() {

				// Delete all the risks from the view.
				this.getRiskViews().forEach(function(rv) {
					rv.detach();
				});

				this.getLinkViews().forEach(function(lv) {
					lv.detach();
				});

				var ls = new views.ForceLayoutStrategy();
				ls.layoutEngine.on("end", this.render.bind(this));
				this.layoutStrategy = ls;

				views.AbstractRiskModelView.prototype.showChanges.call(this);

				this.render();
			};

			RiskModelView3D.prototype.setDimensions = function (width, height){
				views.AbstractRiskModelView.prototype.setDimensions(width, height);
				
				this.renderer.setSize(width, height);
			}
			RiskModelView3D.prototype.render = function() {
				if (this.renderer == null){
					// TODO This point should not be reached unless the 3D view is showing.
					return;
				}
				this.renderer.render(this.scene, this.camera);
			}

			RiskModelView3D.prototype.update = function() {
				views.AbstractRiskModelView.prototype.update.call(this);
				this.render();
			}

			RiskModelView3D.prototype.getPosition = function(evt) {
				var rect = this.renderer.domElement.getBoundingClientRect();
				return {
					x : evt.clientX - rect.left,
					y : evt.clientY - rect.top
				};
			}

			RiskModelView3D.prototype.getCamera = function() {
				return this.camera;
			}

			RiskModelView3D.prototype.animate = function() {
				requestAnimationFrame(this.animate.bind(this));
				this.controls.update();
				this.update();
			}

			RiskModelView3D.prototype.getPickedRisk = function(evt) {

				var width = this.width;
				var height = this.height;

				var point = new THREE.Vector2();

				// Get the position for this event.
				var pos = this.getPosition(evt);

				// Calculate the position relative to the 3D scene.
				point.x = (pos.x / width) * 2 - 1;
				point.y = -(pos.y / height) * 2 + 1;

				// Set up the raycaster for the "picking" ray.
				this.raycaster.setFromCamera(point, this.camera);

				// Cast the ray and find the objects that intersect it.
				var intersects = this.raycaster
						.intersectObjects(this.scene.children);

				// Return the first risk that is interesected.
				for (var i = 0; i < intersects.length; i++) {
					var object = intersects[i].object;
					if (object.risk) {
						return object.risk;
					}

				}
				return null;

			}

			RiskModelView3D.prototype.createRiskView = function(risk) {
				// Add a risk view
				var rv = new RiskView3D(this, risk);

				return rv;

			}
			
			RiskModelView3D.prototype.createRiskLabel = function (riskView, risk){
				
			}

			RiskModelView3D.prototype.createLinkView = function(link) {
				var lv = new LinkView3D(this, link);
				return lv;
			}

			RiskModelView3D.prototype.createGroupViews = function(groups) {

			}

			RiskModelView3D.prototype.getScene = function() {
				return this.scene;
			}
			
			function RiskView3D(parentView, risk) {
				chai.assert.instanceOf(parentView, RiskModelView3D);

				views.AbstractRiskView.call(this, parentView, risk, "div");
				this.radius = 15;

				// Coordinates after translating the origin
				this.posX = 0;
				this.posY = 0;

				var geometry = new THREE.SphereGeometry(this.getRadius(), 32,
						32);
				this.geometry = geometry;
				var material = new THREE.MeshPhongMaterial({
					color : "red"
				});

				this.shape = new THREE.Mesh(geometry, material);

				// Add the risk to this shape so that we can find it later.
				this.shape.risk = risk;
				this.shape.castShadow = true;
				parentView.getScene().add(this.shape);

				var measurementSet = parentView.getModel().getMeasurementSet();

				// Set the z-value according to the combined likelihood and
				// severity values.
				var severity = measurementSet.getMeasurementByName("Severity",
						risk);
				var likelihood = measurementSet.getMeasurementByName(
						"Likelihood", risk);
				var value = severity * likelihood;

				var s = d3.scale.linear().domain([ 0, 1 ]).range([ -300, 300 ]);
				var sv = s(value);
				this.shape.position.z = sv;
				this.z = sv;

				this.labelView = new LabelView3D(parentView, this, risk.name,
						"riskLabel", parentView.wrapLength);

			}

			RiskView3D.prototype = Object.create(views.AbstractRiskView.prototype);
			RiskView3D.prototype.constructor = RiskView3D;
			views.RiskView3D = RiskView3D;

			RiskView3D.prototype.detach = function() {
				var scene = this.getParent().getScene();
				if (this.shape) {
					scene.remove(this.shape);
					this.labelView.detach();
				}
			}
			RiskView3D.prototype.getRadius = function (){
				return this.radius;
			}

			RiskView3D.prototype.convertColour = function(color) {
				// The colour is in css hexadecimal form. We change it here.
				var newColor = new THREE.Color();
				newColor.setStyle(color);
				
				return newColor;
			}

			RiskView3D.prototype.setColour = function(color) {
				// The colour is in css hexadecimal form. We change it here.

				this.shape.material.color = this.convertColour(color);
				
				this.colour = color;
			}
			

			RiskView3D.prototype.update = function() {

				var width = this.getParent().width;
				var height = this.getParent().height;

				// Need to transform the coordinates to match the 3D origin of
				// three.js.
				// We assume that the x and y values of this object are relative
				// to the usual display axes.

				var x = this.x - width / 2;
				var y = height / 2 - this.y;

				this.posX = x;
				this.posY = y;

				this.shape.position.x = x
				this.shape.position.y = y;

				this.labelView.x = x;
				this.labelView.y = y;
				this.labelView.z = this.z;

				this.labelView.update();

			}

			RiskView3D.prototype.getPosition = function() {
				return this.shape.position;
			}

			RiskView3D.prototype.greyOut = function(opacity) {
				this.shape.material.opacity = opacity;
			}

			RiskView3D.prototype.highlight = function() {
				this.shape.material.color = this.convertColour("yellow");
			}

			RiskView3D.prototype.reset = function() {
				this.setColour(this.colour);

			}
			return scope;

		})