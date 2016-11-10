function configure (){

require.config({
	baseUrl : 'ui/js/',
	paths : {
		angular: 'lib/angular',
		jquery : 'lib/jquery-2.1.1',
		chai : 'lib/chai',
		d3 : 'lib/d3',
		bootstrap : 'lib/bootstrap',
		cola : 'lib/cola.v3',
		domReady: 'lib/domReady',
		models : 'graph/Models',
		views : 'graph/Views',
		controllers : 'graph/Controllers',
		underscore: 'lib/underscore',
		spin: 'lib/spin',
		application: 'graph/Application',
		charts: 'graph/Charts',
		views2D: 'graph/Views2D',
		controls2D: "graph/Controls2D",
		chartControls: "graph/ChartControls",
//		Slider: "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-slider/6.0.13/bootstrap-slider",
		uuid: "lib/uuid",
		modernizr: "lib/modernizr.custom.55975",
		backbone: "lib/backbone",
		moment: "lib/moment.min",
		'moment-timezone' : "lib/moment-timezone-with-data.min",
		rickshaw: "lib/rickshaw",
		server: "graph/Server",
		test: "graph/test",
		tasks: "graph/Tasks"
	},
	
	shim : {
		d3:{
			exports: 'd3'
		},
		chai: {
			exports: 'chai'
		},
		underscore: {
			exports: '_'
		},
		spin: {
			exports: 'spin'
		},
		cola : {
			exports : 'cola',
			deps : [ "d3" ]
		},
		bootstrap: {
			deps: ["jquery"]
		},
		uuid: {
			exports: 'UUIDjs'
		},
		controllers: {
			exports: 'controllers',
			deps: ["jquery", "bootstrap", "d3", "cola", "chai", "underscore", "uuid"]
		},
		models:{
			deps: ["jquery", "d3", "chai", "underscore"]
		},
		charts:{
			exports: 'charts',
			deps: ["jquery", "chai"]
		},
		tasks:{
			exports: 'tasks'
		},
		views:{
			deps: ["jquery", "d3", "bootstrap", "cola", "chai", "modernizr", "underscore"]
		}

	}
})
}


