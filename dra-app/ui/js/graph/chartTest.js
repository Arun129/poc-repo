/**
 * 
 */
configure();

require([ 'domReady!', 'controllers', 'views', 'application', 'test', 'charts', 'chartControls' ],
		function(domReady, cs, views, app, test, cv, cc) {

			var ds = new test.DataSource();
			var metrics = ds.getMetrics1();
			var app = new app.Application();

			var view = new cv.ChartsPanelView();
			view.setApplicationModel(app);

			var c = new cc.ChartPanelControl("CC", null, ["Likelihood", "Severity"]);
			c.setView(view);

			app.setMetricSet(metrics);
			app.setMetricBounds(ds.getMetricBounds1(metrics));
			app.setModel(ds.getModel2(metrics));
						
			view.show();

		});
