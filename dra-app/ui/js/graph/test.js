define([ "server" ], function(svr) {
	var scope = {};

	function DataSource() {
	}
	scope.DataSource = DataSource;

	DataSource.prototype.getModel1 = function(metrics) {
		var req = new svr.GetRequest();

		var jmodel = {
			"model" : {
				"links" : [],
				"risks" : [ {
					"name" : "Risk0",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:85f0e620-2b2b-11b2-8031-9089875f5b57"
				}, {
					"name" : "Risk1",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:85f0e621-2b2b-11b2-8031-9089875f5b57"
				}, {
					"name" : "Risk2",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:85f0e622-2b2b-11b2-8031-9089875f5b57"
				}, {
					"name" : "Risk3",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:85f0e623-2b2b-11b2-8031-9089875f5b57"
				}, {
					"name" : "Risk4",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:85f0e624-2b2b-11b2-8031-9089875f5b57"
				}, {
					"name" : "Risk5",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:85f0e625-2b2b-11b2-8031-9089875f5b57"
				}, {
					"name" : "Risk6",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:85f0e626-2b2b-11b2-8031-9089875f5b57"
				}, {
					"name" : "Risk7",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:85f0e627-2b2b-11b2-8031-9089875f5b57"
				}, {
					"name" : "Risk8",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:85f0e628-2b2b-11b2-8031-9089875f5b57"
				}, {
					"name" : "Risk9",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:85f0e629-2b2b-11b2-8031-9089875f5b57"
				}, {
					"name" : "Risk10",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:85f0e62a-2b2b-11b2-8031-9089875f5b57"
				}, {
					"name" : "Risk11",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:85f0e62b-2b2b-11b2-8031-9089875f5b57"
				}, {
					"name" : "Risk12",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:85f0e62c-2b2b-11b2-8031-9089875f5b57"
				}, {
					"name" : "Risk13",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:85f0e62d-2b2b-11b2-8031-9089875f5b57"
				}, {
					"name" : "Risk14",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:85f0e62e-2b2b-11b2-8031-9089875f5b57"
				}, {
					"name" : "Risk15",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:85f0e62f-2b2b-11b2-8031-9089875f5b57"
				}, {
					"name" : "Risk16",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:85f0e630-2b2b-11b2-8031-9089875f5b57"
				}, {
					"name" : "Risk17",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:85f0e631-2b2b-11b2-8031-9089875f5b57"
				}, {
					"name" : "Risk18",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:85f0e632-2b2b-11b2-8031-9089875f5b57"
				}, {
					"name" : "Risk19",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:85f0e633-2b2b-11b2-8031-9089875f5b57"
				} ],
				"uri" : "urn:uuid:85f0e634-2b2b-11b2-8031-9089875f5b57"
			},
			"measurementSet" : {
				"measurements" : [ {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e620-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.581707270719222
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e620-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.4163998520046065
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e620-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.9397930044079826
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e621-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.15567544916706266
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e621-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.2272657464996336
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e621-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.5429087579441129
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e622-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.2912959915333784
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e622-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.4949290007714152
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e622-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.6636007842965959
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e623-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.7402319248978766
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e623-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.12919659279404738
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e623-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.7465426420395239
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e624-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.8045273541965794
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e624-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.8516386645199274
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e624-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.37229395595532155
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e625-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.2231091061608742
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e625-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.40057456064889985
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e625-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.1709392485433292
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e626-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.40995735463510463
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e626-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.13278771244081988
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e626-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.6352339565571379
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e627-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.3817011509258247
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e627-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.5516636528022072
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e627-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.5340452736094761
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e628-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.9469892142328568
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e628-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.2040053669816001
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e628-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.06945783968372421
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e629-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.4306300274414995
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e629-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.5723971144015544
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e629-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.6426933359166548
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e62a-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.21386049123637896
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e62a-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.10239019521718196
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e62a-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.6150598474521439
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e62b-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.7359392217757855
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e62b-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.5964410270818533
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e62b-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.6005566013947786
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e62c-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.4111488706551263
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e62c-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.614114461878689
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e62c-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.5012211665575301
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e62d-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.5753663566735351
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e62d-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.5842114185711658
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e62d-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.4962943131847998
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e62e-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.012268120419775763
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e62e-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.24941283427847205
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e62e-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.4603102245754235
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e62f-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.9753892580533564
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e62f-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.3262824265068517
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e62f-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.4018646858847841
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e630-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.449118208577588
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e630-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.5727666178824975
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e630-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.2566808142122755
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e631-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.6867044624006946
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e631-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.587409407257147
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e631-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.07936062410138933
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e632-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.7296195423963449
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e632-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.4723953768311453
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e632-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.6884585616147108
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e633-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.6426522874350449
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e633-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.022599058332794186
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:85f0e633-2b2b-11b2-8031-9089875f5b57"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.6608924246159753
				} ],
				"uri" : "urn:uuid:85f0e635-2b2b-11b2-8031-9089875f5b57"
			},
			"weightThreshold" : 0.0,
			"uri" : "urn:uuid:85f0e904-2b2b-11b2-8031-9089875f5b57"
		};

		return req.makeQModel(jmodel, metrics);
	}

	DataSource.prototype.getMetrics1 = function() {
		var req = new svr.GetRequest();

		var jmetrics = [ {
			"name" : "Likelihood",
			"interval" : {
				"type" : "closed",
				"leftEndpoint" : "0.0",
				"rightEndpoint" : "1.0"
			},
			"type" : "RiskMetric",
			"uri" : "urn:uuid:89b6229e-2b2b-11b2-80a4-9089875f5b57"
		}, {
			"name" : "Severity",
			"interval" : {
				"type" : "closed",
				"leftEndpoint" : "0.0",
				"rightEndpoint" : "1.0"
			},
			"type" : "RiskMetric",
			"uri" : "urn:uuid:89b6229d-2b2b-11b2-80a4-9089875f5b57"
		}, {
			"name" : "Velocity",
			"interval" : {
				"type" : "closed",
				"leftEndpoint" : "0.0",
				"rightEndpoint" : "1.0"
			},
			"type" : "RiskMetric",
			"uri" : "urn:uuid:89b6229f-2b2b-11b2-80a4-9089875f5b57"
		}, {
			"name" : "Weight",
			"interval" : {
				"type" : "leftClosed",
				"leftEndpoint" : "0.0",
				"rightEndpoint" : "null"
			},
			"type" : "LinkMetric",
			"uri" : "urn:uuid:89b622a1-2b2b-11b2-80a4-9089875f5b57"
		} ];

		return req.makeMetricSet(jmetrics);

	}

	DataSource.prototype.getModel2 = function(metrics) {
		var req = new svr.GetRequest();

		var jmodel = {
			"model" : {
				"links" : [],
				"risks" : [ {
					"name" : "Risk0",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:1dbfb6da-2b30-11b2-80bf-5c514f554df8"
				}, {
					"name" : "Risk1",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:1dbfb6db-2b30-11b2-80bf-5c514f554df8"
				}, {
					"name" : "Risk2",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:1dbfb6dc-2b30-11b2-80bf-5c514f554df8"
				}, {
					"name" : "Risk3",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:1dbfb6dd-2b30-11b2-80bf-5c514f554df8"
				}, {
					"name" : "Risk4",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:1dbfb6de-2b30-11b2-80bf-5c514f554df8"
				}, {
					"name" : "Risk5",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:1dbfb6df-2b30-11b2-80bf-5c514f554df8"
				}, {
					"name" : "Risk6",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:1dbfb6e0-2b30-11b2-80bf-5c514f554df8"
				}, {
					"name" : "Risk7",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:1dbfb6e1-2b30-11b2-80bf-5c514f554df8"
				}, {
					"name" : "Risk8",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:1dbfb6e2-2b30-11b2-80bf-5c514f554df8"
				}, {
					"name" : "Risk9",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:1dbfb6e3-2b30-11b2-80bf-5c514f554df8"
				}, {
					"name" : "Risk10",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:1dbfb6e4-2b30-11b2-80bf-5c514f554df8"
				}, {
					"name" : "Risk11",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:1dbfb6e5-2b30-11b2-80bf-5c514f554df8"
				}, {
					"name" : "Risk12",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:1dbfb6e6-2b30-11b2-80bf-5c514f554df8"
				}, {
					"name" : "Risk13",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:1dbfb6e7-2b30-11b2-80bf-5c514f554df8"
				}, {
					"name" : "Risk14",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:1dbfb6e8-2b30-11b2-80bf-5c514f554df8"
				}, {
					"name" : "Risk15",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:1dbfb6e9-2b30-11b2-80bf-5c514f554df8"
				}, {
					"name" : "Risk16",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:1dbfb6ea-2b30-11b2-80bf-5c514f554df8"
				}, {
					"name" : "Risk17",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:1dbfb6eb-2b30-11b2-80bf-5c514f554df8"
				}, {
					"name" : "Risk18",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:1dbfb6ec-2b30-11b2-80bf-5c514f554df8"
				}, {
					"name" : "Risk19",
					"definitions" : [],
					"type" : "Risk",
					"uri" : "urn:uuid:1dbfb6ed-2b30-11b2-80bf-5c514f554df8"
				} ],
				"uri" : "urn:uuid:1dbfb6ee-2b30-11b2-80bf-5c514f554df8"
			},
			"measurementSet" : {
				"measurements" : [ {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6da-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6da-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6da-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6db-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6db-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6db-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6dc-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6dc-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6dc-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6dd-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6dd-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6dd-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6de-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6de-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6de-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6df-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6df-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6df-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e0-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e0-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e0-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e1-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e1-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e1-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e2-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e2-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e2-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e3-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e3-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e3-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e4-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e4-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e4-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e5-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e5-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e5-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e6-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e6-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e6-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e7-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e7-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e7-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e8-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e8-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e8-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e9-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e9-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6e9-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6ea-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6ea-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6ea-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6eb-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6eb-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6eb-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6ec-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6ec-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6ec-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6ed-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Likelihood",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6ed-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Severity",
					"measuredValue" : 0.0
				}, {
					"subject" : {
						"type" : "risk",
						"source" : null,
						"target" : null,
						"uri" : "urn:uuid:1dbfb6ed-2b30-11b2-80bf-5c514f554df8"
					},
					"metricName" : "Velocity",
					"measuredValue" : 0.0
				} ],
				"uri" : "urn:uuid:1dbfb6ef-2b30-11b2-80bf-5c514f554df8"
			},
			"weightThreshold" : 0.0,
			"uri" : "urn:uuid:1dbfb7fc-2b30-11b2-80bf-5c514f554df8"
		};

		return req.makeQModel(jmodel, metrics);
	}

	DataSource.prototype.getMetrics1 = function() {
		var req = new svr.GetRequest();

		var jmetrics = [ {
			"name" : "Likelihood",
			"interval" : {
				"type" : "closed",
				"leftEndpoint" : "0.0",
				"rightEndpoint" : "1.0"
			},
			"type" : "RiskMetric",
			"uri" : "urn:uuid:89b6229e-2b2b-11b2-80a4-9089875f5b57"
		}, {
			"name" : "Severity",
			"interval" : {
				"type" : "closed",
				"leftEndpoint" : "0.0",
				"rightEndpoint" : "1.0"
			},
			"type" : "RiskMetric",
			"uri" : "urn:uuid:89b6229d-2b2b-11b2-80a4-9089875f5b57"
		}, {
			"name" : "Velocity",
			"interval" : {
				"type" : "closed",
				"leftEndpoint" : "0.0",
				"rightEndpoint" : "1.0"
			},
			"type" : "RiskMetric",
			"uri" : "urn:uuid:89b6229f-2b2b-11b2-80a4-9089875f5b57"
		}, {
			"name" : "Weight",
			"interval" : {
				"type" : "leftClosed",
				"leftEndpoint" : "0.0",
				"rightEndpoint" : "null"
			},
			"type" : "LinkMetric",
			"uri" : "urn:uuid:89b622a1-2b2b-11b2-80a4-9089875f5b57"
		} ];

		return req.makeMetricSet(jmetrics);

	}

	DataSource.prototype.getMetricBounds1 = function(metricSet) {
		var jmetricBounds = [ {
			"metricName" : "Likelihood",
			"interval" : {
				"type" : "closed",
				"leftEndpoint" : "0.0",
				"rightEndpoint" : "0.9152519870725097"
			},
			"numberOfIntervals" : 4
		}, {
			"metricName" : "Severity",
			"interval" : {
				"type" : "closed",
				"leftEndpoint" : "0.0",
				"rightEndpoint" : "0.9860262348010652"
			},
			"numberOfIntervals" : 4
		}, {
			"metricName" : "Velocity",
			"interval" : {
				"type" : "closed",
				"leftEndpoint" : "0.0",
				"rightEndpoint" : "0.807363406701302"
			},
			"numberOfIntervals" : 4
		} ];
		var rq = new svr.GetRequest();
		return rq.makeMetricBounds(jmetricBounds, metricSet);

	}
	return scope;
});
