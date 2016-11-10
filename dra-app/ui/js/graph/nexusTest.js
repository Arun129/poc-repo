/**
 * 
 */
configure();

require([ 'domReady!', 'controllers', 'views', 'application', 'test' ],
		function(domReady, cs, views, app, test) {

			var ds = new test.DataSource();
			var metrics = ds.getMetrics1();
			var app = new app.Application();

			var view = new views.NexusPanelView();
			view.setApplicationModel(app);
			view.getModelView().setViewportSize(window.innerWidth, window.innerHeight);

			var c = new cs.NexusPanelControl(null);
			c.setView(view);

			var zc = new cs.ZoomControl(this, "#nexus svg", "#nexus svg .content");
			zc.setView(view.getModelView());

			app.setMetricSet(metrics);
			app.setModel(ds.getModel1(metrics));
			

			view.show();

		});
