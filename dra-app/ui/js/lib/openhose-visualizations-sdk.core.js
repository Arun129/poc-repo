/*
// Openhose Visualization SDK Kit (Bottlenose)
// ----------------------------------
// v0.8.0
//
// Copyright (c)2015 Bottlenose Inc.
//
// http://openhose.com
*/

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'backbone', 'd3', 'jquery', 'moment', 'moment-timezone', 'rickshaw'], function(_, Backbone, d3, $, moment, moment_timezone, rickshaw){
      return (root.Openhose = factory(root, _, Backbone, d3, $, moment_timezone, moment_timezone, rickshaw));
    });
  } else {
    root.Openhose = factory(root, root._, root.Backbone, root.d3, (root.jQuery || root.Zepto || root.ender || root.$), root.moment, root.moment, root.Rickshaw);
  }
}(this, function (root, underscore, backbone, d3, jquery, moment, moment_timezone, rickshaw) {
var core, configure, visualization_helpers_format, visualization_number, visualization_leaderboard, visualization_pie, visualization_lib_custom_hover_details, lib_utils, visualization_hover_mixin, visualization_lib_axis_local_time, visualization_lib_dots, visualization_line, visualization_area, visualization_stacked_bar, visualization_time_line, visualization_table, text, text_templates_dot_tool_tiphtml, text_templates_history_dot_tool_tiphtml, visualization_lib_d3extensions, visualization_motion_scatter, visualization_lib_gauge, visualization_gauge, visualization_distribution, visualization_bar_chart, visualization_main, processor_analytics_mixin, processor_number, processor_leaderboard, processor_pie, lib_error_logger, processor_line, processor_area, processor_time_line, processor_table, processor_motion_scatter, processor_gauge, processor_distribution, processor_bar, processor_main, models_analytics_data, lib_mapping_processor, lib_api, lib_parse_stream, models_helpers_timezone_detector, models_period, models_metric, models_helpers_meta, models_trend_metric, models_stream_metric, models_dimension, models_main, widgets_analytics_wrapper, text_templates_color_listjson, widgets_base, widgets_number, widgets_leaderboard, widgets_pie, widgets_line, widgets_area, widgets_stacked_bar, widgets_table, widgets_motion_scatter, widgets_time_line, widgets_gauge, widgets_distribution, widgets_bar, widgets_main, openhose;
core = function (_, $, d3, Backbone, moment, momentTimezone, Rickshaw) {
  var Openhose = {};
  Openhose.VERSION = '0.8.0';
  // For Openhose's purposes, jQuery, Zepto or Ender owns
  // the `$` variable.
  Openhose.$ = $;
  Openhose._ = _;
  Openhose.d3 = d3;
  Openhose.Backbone = Backbone;
  Openhose.moment = moment;
  Openhose.Rickshaw = Rickshaw;
  return Openhose;
}(underscore, jquery, d3, backbone, moment, moment_timezone, rickshaw);
configure = function (Openhose) {
  Openhose.DEFAULTSETTINGS = {
    // API hostname, defaults to bottlenose production API
    apiHost: 'https://bottlenose.com/proxy/openhose/3',
    // use long caching (useful when running something in production)
    cacheLong: false,
    // show loading spinner while requests are being made
    enableProgress: true,
    // when using the same keys for multiple purposes this allows us
    // to give you statistics how much each application is using the API
    // example:
    //    appName: 'Bottlenose Nerve Center'
    appName: 'not specified',
    // send error messages back to your error handling system
    // first argument is the message
    // second argument is related data
    // example:
    //   errorLogger: Raven.captureMessage
    errorLogger: null,
    // id of the stream you want to access
    // this can also be specified in the widget itself
    // example:
    //   streamId: 'ab934ag9uba9u349uasdg93240a'
    streamId: null,
    // your user id (used for authentication)
    // this can also be specified in the widget itself
    // example:
    //   userId: 'ab934ag9uba9u349uasdg93240a'
    userId: null,
    // your user token (used for authentication)
    // this can also be specified in the widget itself
    // example:
    //   userToken: 'ab934ag9uba9u349uasdg93240a'
    userToken: null,
    // your organization id (used for authentication)
    // this can also be specified in the widget itself
    // example:
    //   organizationId: 'ab934ag9uba9u349uasdg93240a'
    organizationId: null,
    // your organization token (used for authentication)
    // this can also be specified in the widget itself
    // example:
    //   organizationToken: 'ab934ag9uba9u349uasdg93240a'
    organizationToken: null,
    // mapping you want to use for a stream
    // this grabs all the correct labels and formattings depending on your mapping file
    // mapping files are located in `{apiHost}/3/mappings/:mapping`
    // this can also be specified in the widget itself
    // example:
    //   mapping: 'social-media'
    mapping: null,
    // mapping you want to use for a set of entities
    // this grabs all the correct labels associated with an entity
    // for example if you have a language entity of `en`,
    // by using the mapping file we can pull in the full name: `English`
    // example:
    //   entityMapping: {
    //     'languages': '/language-info.json',
    //     'countries': '/country-code-info.json'
    //   }
    entityMapping: {}
  };
  Openhose.configureDefaults = function () {
    Openhose.SETTINGS = Openhose._.clone(Openhose.DEFAULTSETTINGS);
  };
  // supplying defaults if nothing is set yet
  if (!Openhose.SETTINGS) {
    Openhose.configureDefaults();
  }
  Openhose.configure = function (settings) {
    var keys = Openhose._.keys(settings);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      Openhose.SETTINGS[key] = settings[key];
    }
  };
  return Openhose;
}(core);
visualization_helpers_format = function (Openhose) {
  var formatPercent = Openhose.d3.format('.1r');
  var formatPercentDiff = Openhose.d3.format('.1f');
  return {
    percent: function (result) {
      if (result < 0.001) {
        return '< 0.001%';
      } else if (result >= 1 && result <= 10) {
        return result.toFixed(1) + '%';
      } else {
        return formatPercent(result) + '%';
      }
    },
    percentDiff: function (result) {
      // Keep percentage positive, because styling will indicate the difference instead of a minus sign
      result = Math.abs(result);
      if (result < 0.001) {
        return 'No change';
      } else {
        return formatPercentDiff(result) + '%';
      }
    },
    bigNumber: function (value, specifier) {
      var formattedValue;
      if (value === null || typeof value == 'undefined') {
        return '-';
      }
      var exponent = parseInt(value.toString().split('+')[1], 10);
      if (exponent > 20) {
        // Necessary because D3.format will parse it as a number:
        // If this is an exponential value and JavaScript is using scientific notation
        // resort to converting number to a comma-separated string manually.
        exponent = exponent - 20;
        value = value / Math.pow(10, exponent);
        formattedValue = value + new Array(exponent + 1).join('0');
        var regex = /(\d+)(\d{3})/;
        while (regex.test(formattedValue)) {
          formattedValue = formattedValue.replace(regex, '$1' + ',' + '$2');
        }
      } else {
        formattedValue = Openhose.d3.format(specifier || ',f1')(value);
      }
      return formattedValue;
    },
    yTickformatter: function (x) {
      if (x < 10) {
        return Openhose.d3.format('.2r')(x);
      } else {
        return Openhose.Rickshaw.Fixtures.Number.formatKMBT(x);
      }
    }
  };
}(core);
visualization_number = function (Openhose, format) {
  var View = Openhose.Backbone.View.extend({
    className: 'visualization summary-number',
    // Options available:
    // ==================
    //
    //   label: 'My Awesome Label',
    //   label: false,                // hides the label
    //   caption                      // the Caption for the number widget
    //   roundThousands               // when displaying numbers, round to the nearest 1000
    //   format                       // d3 format string, to use for numbers
    //   data                         // main data { value: Number, label: String || false }
    //   otherData                    // secondary data, creates a compare
    //   percentDiff                  // use a percentage as diff
    //   diffScale                    // when using percentDiff: use this as a difference scale instead of trying to derive it. (useful with negative values)
    //   subLabelFormatter            // provide a different label formatter for otherData
    initialize: function (options) {
      this.options = options || {};
      if (this.options.events)
        this.events = Openhose._.extend(this.events, this.options.events);
      this.data = this.options.data;
      this.otherData = this.options.otherData;
      this.$el.addClass(this.className);
    },
    updateData: function (data) {
      this.data = data;
      this.render();
    },
    renderNumber: function (data) {
      var number = data.value;
      var value = this.options.convertFn ? this.options.convertFn(number) : number;
      var valueText;
      if (data.percent) {
        valueText = format.percent(number);
      } else if (data.percentDiff) {
        valueText = format.percentDiff(number);
      } else {
        value = this.options.roundThousands ? Math.round(value / 1000) : value;
        // use more decimal points when value is < 1
        if (!this.options.format && value < 1)
          this.options.format = ',.2r';
        valueText = format.bigNumber(value, this.options.format || ',.1');
        if (this.options.roundThousands)
          valueText += 'k';
      }
      var $element = Openhose.$('<div class="number"><span class="value">' + valueText + '</span></div>');
      return $element;
    },
    getDiffClass: function () {
      var diffClass;
      var current = this.data;
      var past = this.otherData;
      if (past.value < current.value) {
        // Increase
        diffClass = 'change-up';
      } else if (past.value > current.value) {
        // Decrease
        diffClass = 'change-down';
      } else {
        // Same
        diffClass = 'change-none';
      }
      return diffClass;
    },
    getPercentDiff: function () {
      var current = this.data;
      var past = this.otherData;
      var diffScale = this.options.diffScale || past.value;
      var diffPercentage;
      if (past.value < current.value) {
        // Increase
        diffPercentage = (current.value - past.value) / diffScale * 100;
      } else if (past.value > current.value) {
        // Decrease
        diffPercentage = (past.value - current.value) / diffScale * 100;
      } else {
        // Same
        diffPercentage = 0;
      }
      return [
        diffPercentage,
        this.getDiffClass()
      ];
    },
    getNumberDiff: function () {
      var current = this.data;
      var past = this.otherData;
      var diffNum = current.value - past.value;
      return [
        diffNum,
        this.getDiffClass()
      ];
    },
    render: function () {
      var $element = this.$el.empty();
      if (this.otherData) {
        var current = this.data;
        var past = this.otherData;
        var diff;
        if (this.options.percentDiff) {
          diff = this.getPercentDiff();
        } else {
          diff = this.getNumberDiff();
        }
        var diffNum = diff[0];
        var diffClass = diff[1];
        var $currentNumber = this.renderNumber({ value: current.value });
        var $pastNumber = this.renderNumber({
          value: diffNum,
          percentDiff: !!this.options.percentDiff
        });
        $pastNumber.addClass('previous');
        $pastNumber.addClass(diffClass);
        if (this.options.subLabelFormatter) {
          $pastNumber.append(this.options.subLabelFormatter({
            current: current.value,
            past: past,
            diff: diffNum,
            label: '<span>' + this.otherData.label + '</span>'
          }));
        } else {
          $pastNumber.append('<span>' + this.otherData.label + '</span>');
        }
        $element.append($currentNumber);
        if (this.data.label)
          $element.append('<span class="score-label">' + this.data.label + '</span>');
        $element.append($pastNumber);
      } else {
        var value = this.data.value;
        var $num = this.renderNumber({ value: value });
        $element.append($num);
        if (this.data.label)
          $num.append('<span class="score-label">' + this.data.label + '</span>');
      }
      if (this.options.caption) {
        $element.append(Openhose.$('<span class="caption">' + this.options.caption + '</span>'));
      }
      this.options.onRender && this.options.onRender();
      return this;
    },
    destroy: function () {
      this.remove();
    }
  });
  // non instance functions.
  View.validate = function (metrics, dimensions) {
    var validated = true;
    var error = null;
    if (metrics.length != 1 && metrics) {
      error = 'Need exactly one metric to render a number summary';
      validated = false;
    }
    return [
      validated,
      error
    ];
  };
  return View;
}(core, visualization_helpers_format);
visualization_leaderboard = function (Openhose, format) {
  var View = Openhose.Backbone.View.extend({
    className: 'visualization leaderboard',
    // Options available:
    // ==================
    //
    // events             backbone events
    // leaderNumbers      show numbers in front
    //
    // data
    //     .values        array of values
    //     .totalVolume   optional total volume to base the percentage on
    //
    // colors             d3 color scheme
    initialize: function (options) {
      this.options = options || {};
      if (options.events)
        this.events = _.extend(this.events, options.events);
      this.leaderNumbers = options.leaderNumbers === undefined ? true : options.leaderNumbers;
      this.data = options.data;
    },
    render: function () {
      var self = this;
      var data = this.data.values;
      var colors = this.options.colors || d3.scale.category20c();
      var percentageOfTotal;
      var x = d3.scale.linear().domain([
        0,
        d3.max(data, function (d) {
          return d.value;
        })
      ]).range([
        0,
        100
      ]);
      if (this.data.totalVolume) {
        percentageOfTotal = d3.scale.linear().domain([
          0,
          this.data.totalVolume
        ]).range([
          0,
          100
        ]);
      }
      var valueFormatter = function (value) {
        var percent = Math.round(percentageOfTotal(value || 0) * 10) / 10;
        if (percent < 1) {
          return '< 1%';
        } else {
          return percent + '%';
        }
      };
      var container = d3.select(this.el);
      var rows = container.selectAll('.row').data(data, function (d) {
        return d.label;
      }).order();
      rows.enter().append('div').attr('class', 'row').html(function (d, i) {
        var html = '<div class="leader-bar" style="background-color: ' + colors(d.value) + '; width: ' + x(d.value) + '%;"></div>' + (self.leaderNumbers ? '<div class="leader-number">' + (i + 1) + '.</div>' : '') + '<div class="leader-title">' + d.label + '</div>' + '<div class="leader-value">' + format.bigNumber(d.value);
        if (self.data.totalVolume) {
          html += '  (' + valueFormatter(d.value) + ')</div>';
        }
        return html;
      });
      rows.exit().remove();
      this.trigger('render');
    },
    destroy: function () {
      this.remove();
    }
  });
  return View;
}(core, visualization_helpers_format);
visualization_pie = function (Openhose) {
  var View = Openhose.Backbone.View.extend({
    className: 'visualization pie',
    legendItemTemplate: '<span class="legend-color" style="background-color: <%= color %>"></span> <%= data.label %>',
    // Options available:
    // ==================
    //
    // events             backbone events
    // hasLabels: true    show labels
    // hasLegend: true    show legend
    // donut              donut size 0..1
    // colors             d3 color scheme
    // width              widget size
    // height
    // align              "left" or "middle"
    // minSizeForLabel:   0.175
    // onMouseOver        callback when the mouse moves over a segment (mouseEvent, d, i)
    // onMouseOut
    // onClick            callback when a segment is clicked (element, d, i)
    // segmentSpacing     move the segment outward by x points, 0.5 by default
    // paddingX           extra space around the pie, 15 by default
    // paddingY           extra space around the pie, 15 by default
    // hoverLabels        set to false to disable mouse over hover labels
    // hoverFormatter     provide a function which returns the content for hoverLabel
    // labelDisplacement  value to displace the label with
    initialize: function (options) {
      this.options = options || {};
      if (options.events)
        this.events = Openhose._.extend(this.events, options.events);
      this.hasLabels = true;
      if (options.hasLabels === false) {
        this.hasLabels = false;
      }
      this.hasLegend = true;
      if (options.hasLegend === false) {
        this.hasLegend = false;
      }
      options.segmentSpacing = Openhose._.isNumber(options.segmentSpacing) ? options.segmentSpacing : 0.5;
      this.paddingX = Openhose._.isNumber(options.paddingX) ? options.paddingX : 15;
      this.paddingY = Openhose._.isNumber(options.paddingY) ? options.paddingY : 15;
      this.minSizeForLabel = options.minSizeForLabel || 0.175;
      this.hoverLabels = options.hoverLabels === false ? false : true;
      this.hoverFormatter = options.hoverFormatter || this.hoverFormatter;
      this.colors = options.colors;
      this.data = options.data;
      this.noDataColors = function () {
        return '#f2f1ed';
      };
    },
    hoverFormatter: function (d, i) {
      return d.label + ': ' + d.value;
    },
    showHover: function (d, i) {
      var mousePos = Openhose.d3.mouse(this.el);
      var l = Openhose.$('<div class="pie-hover"></div>');
      l.html(this.hoverFormatter(d, i));
      l.offset({
        top: mousePos[1],
        left: mousePos[0]
      });
      this.$el.append(l);
    },
    removeHover: function (data) {
      this.$('.pie-hover').remove();
    },
    highlightSegment: function (d, i) {
      var self = this;
      var data = d.data || d;
      // arc generator puts data in a sub object
      var uid = data.uid;
      // highlight pie segment
      Openhose.d3.select('[data-uid=' + uid + '].arc').transition().attr('fill', function (d) {
        return Openhose.d3.hsl(self.colors(i)).brighter(0.3);
      });
      // highlight legend
      Openhose.d3.select(this.el).selectAll('.legend .item:not([data-uid=' + uid + '])').transition().style('opacity', 0.2);
      // callback
      if (self.options.onMouseOver) {
        self.options.onMouseOver(data, i);
      }
      if (self.hoverLabels) {
        self.showHover(data, i);
      }
    },
    removeHighlight: function (d, i) {
      var self = this;
      var data = d.data || d;
      // arc generator puts data in a sub object
      // arcs
      this.svg.selectAll('.arc').transition().attr('fill', function (d, i) {
        return Openhose.d3.rgb(self.colors(i));
      });
      // legend
      Openhose.d3.select(this.el).selectAll('.legend .item').transition().style('opacity', 1);
      if (self.options.onMouseOut) {
        self.options.onMouseOut(data, i);
      }
      if (self.hoverLabels) {
        self.removeHover(data, i);
      }
    },
    render: function () {
      var self = this;
      if (!this.$el.is(':visible')) {
        return setTimeout(this.render.bind(this), 200);
      }
      this.width = this.options.width || this.$el.width();
      this.height = this.options.height || this.$el.height() || this.$el.parent().height();
      this.pieWidth = this.width - this.options.segmentSpacing * 2 - this.paddingX * 2;
      this.pieHeight = this.height - this.options.segmentSpacing * 2 - this.paddingY * 2;
      this.pieSize = Math.min(this.pieWidth, this.pieHeight);
      function mouseOver(d, i) {
        self.highlightSegment(d, i);
      }
      function mouseOut(d, i) {
        self.removeHighlight(d, i);
      }
      function onClick(d, i) {
        if (self.options.onClick) {
          self.options.onClick(this, d, i);
        }
      }
      function addMouseEvents(selection) {
        selection.on('mouseover', mouseOver).on('mouseout', mouseOut).on('click', onClick);
      }
      function drawArcs(selection) {
        selection.append('svg:path').attr('class', 'arc').attr('data-uid', function (d, i) {
          return d.data.uid;
        }).attr('fill', function (d, i) {
          return self.colors(i);
        }).attr('transform', function (d, i) {
          if (self.options.segmentSpacing) {
            var start = d.startAngle * (180 / Math.PI);
            var end = d.endAngle * (180 / Math.PI);
            var centerAngle = start + (end - start) / 2;
            return 'rotate(' + centerAngle + ') translate(0, -' + self.options.segmentSpacing + ') rotate(' + -centerAngle + ')';
          }
        }).attr('d', function (d) {
          return arc(d);
        }).call(addMouseEvents);
      }
      function drawLabels(selection) {
        if (!self.hasLabels) {
          return;
        }
        selection.append('svg:text').filter(function (d, i) {
          var angle = d.endAngle - d.startAngle;
          return angle > self.minSizeForLabel;
        }).attr('transform', function (d) {
          return 'translate(' + textArc.centroid(d) + ')';
        }).attr('data-uid', function (d, i) {
          return d.data.uid;
        }).attr('text-anchor', 'middle').text(function (d, i) {
          return d.data.label;
        }).call(addMouseEvents);
      }
      function drawLegend(selection) {
        if (!self.hasLegend) {
          return;
        }
        self.legend = Openhose.d3.select(self.el).append('div').attr('class', 'legend');
        self.legendItems = self.legend.selectAll('.item').data(self.data.values).enter().append('div').attr('class', 'item').attr('data-uid', function (d) {
          return d.uid;
        }).html(function (d, i) {
          var templateData = {
            data: d,
            color: self.colors(i)
          };
          return Openhose._.template(self.legendItemTemplate)(templateData);
        }).call(addMouseEvents);
      }
      var data = this.data;
      this.colors = this.colors || Openhose.d3.scale.category20c();
      var r = this.pieSize / 2;
      if (!this._calculateTotal()) {
        this.colors = this.noDataColors;
        data = {
          'label': 'Pie 1',
          'values': [{
              'label': 'No Data',
              'value': 100
            }]
        };
      }
      data.values.forEach(function (d) {
        d.uid = 'slice-id-' + Openhose._.uniqueId();
      });
      var piePositionX;
      if (this.options.align == 'left') {
        piePositionX = this.pieSize / 2 + this.paddingX + this.options.segmentSpacing;
      } else {
        // middle align
        piePositionX = this.width / 2;
      }
      this.svg = Openhose.d3.select(this.el).append('svg:svg').data([data.values]).attr('width', this.width).attr('height', this.height).append('svg:g').attr('transform', 'translate(' + piePositionX + ',' + (this.pieSize / 2 + this.paddingY + this.options.segmentSpacing) + ')');
      var pie = Openhose.d3.layout.pie().value(function (d) {
        return d.value;
      });
      // declare an arc generator function
      var arc = Openhose.d3.svg.arc().outerRadius(r);
      if (this.options.donut) {
        arc.innerRadius(r * (1 - this.options.donut));
      }
      var displacement = this.options.labelDisplacement ? this.options.labelDisplacement : 0;
      var textArc = Openhose.d3.svg.arc().outerRadius(r + displacement);
      if (this.options.donut) {
        textArc.innerRadius(r * (1 - this.options.donut) + displacement);
      } else {
        textArc.innerRadius(0);
      }
      // select paths, use arc generator to draw
      this.svg.selectAll('g.slice').data(pie).enter().call(drawArcs).call(drawLabels).call(drawLegend);
    },
    _calculateTotal: function () {
      var segments = this.data.values;
      return Openhose._.reduce(segments, function (total, segment) {
        return total + segment.value;
      }, 0);
    },
    destroy: function () {
      this.remove();
    }
  });
  return View;
}(core);
visualization_lib_custom_hover_details = function (Rickshaw, Openhose) {
  return Rickshaw.Class.create(Rickshaw.Graph.HoverDetail, {
    enableItemHover: false,
    enableHoverDot: true,
    hoverArea: 'closest',
    // options are: closest, bar
    update: function (e) {
      e = e || this.lastEvent;
      if (!e)
        return;
      this.lastEvent = e;
      if (!e.target.nodeName.match(/^(path|svg|rect|circle)$/))
        return;
      var graph = this.graph;
      var eventX = e.offsetX || e.layerX;
      var eventY = e.offsetY || e.layerY;
      var j = 0;
      var points = [];
      var nearestPoint;
      this.graph.series.active().forEach(function (series) {
        var data = this.graph.stackedData[j++];
        if (!data.length)
          return;
        var domainX = graph.x.invert(eventX);
        var domainIndexScale = Openhose.d3.scale.linear().domain([
          data[0].x,
          data.slice(-1)[0].x
        ]).range([
          0,
          data.length - 1
        ]);
        var approximateIndex = Math.round(domainIndexScale(domainX));
        var dataIndex = Math.min(approximateIndex || 0, data.length - 1);
        if (this.hoverArea == 'closest') {
          for (var i = approximateIndex; i < data.length - 1;) {
            if (!data[i] || !data[i + 1])
              break;
            if (data[i].x <= domainX && data[i + 1].x > domainX) {
              dataIndex = Math.abs(domainX - data[i].x) < Math.abs(domainX - data[i + 1].x) ? i : i + 1;
              break;
            }
            if (data[i + 1].x <= domainX) {
              i++;
            } else {
              i--;
            }
          }
        } else if (this.hoverArea == 'bar') {
          // don't be smart and just try to see if it fits the bar
          for (var d = 0; d < data.length; d++) {
            var point = data[d];
            var barWidth = (domainIndexScale.domain()[1] - domainIndexScale.domain()[0]) / domainIndexScale.range()[1];
            var canvasX = graph.x(point.x);
            var canvasXEnd = graph.x(point.x + barWidth);
            if (eventX > canvasX && eventX < canvasXEnd) {
              dataIndex = d;
            }
          }
        }
        if (dataIndex < 0)
          dataIndex = 0;
        var value = data[dataIndex];
        var distance = Math.sqrt(Math.pow(Math.abs(graph.x(value.x) - eventX), 2) + Math.pow(Math.abs(graph.y(value.y + value.y0) - eventY), 2));
        var xFormatter = series.xFormatter || this.xFormatter;
        var yFormatter = series.yFormatter || this.yFormatter;
        //xFormatter and yFormatter are customized
        var point = {
          //formattedXValue: xFormatter(value.x),
          //formattedYValue: yFormatter(series.scale ? series.scale.invert(value.y) : value.y),
          series: series,
          value: value,
          distance: distance,
          order: j,
          name: series.name
        };
        //and added down here
        point.formattedXValue = xFormatter(value.x, point);
        point.formattedYValue = yFormatter(series.scale ? series.scale.invert(value.y) : value.y, point);
        if (!nearestPoint || distance < nearestPoint.distance) {
          nearestPoint = point;
        }
        points.push(point);
      }, this);
      if (!nearestPoint)
        return;
      nearestPoint.active = true;
      var domainX = nearestPoint.value.x;
      var formattedXValue = nearestPoint.formattedXValue;
      this.element.innerHTML = '';
      this.element.style.left = graph.x(domainX) + 'px';
      this.visible && this.render({
        points: points,
        detail: points,
        // for backwards compatibility
        mouseX: eventX,
        mouseY: eventY,
        formattedXValue: formattedXValue,
        domainX: domainX
      });
    },
    _removeHighlightDots: function (svg, animate) {
      if (!svg) {
        svg = Openhose.d3.select(this.graph.element).select('svg');
      }
      var selection = svg.selectAll('circle.graph-highlight-dot');
      function stuff(selection) {
        selection.attr('r', 0).attr('stroke-width', 0).remove();
      }
      if (animate) {
        selection.transition().ease('linear').call(stuff);
      } else {
        selection.call(stuff);
      }
    },
    render: function (args) {
      var graph = this.graph;
      var points = args.points;
      var point = points.filter(function (p) {
        return p.active;
      }).shift();
      var svg = Openhose.d3.select(this.graph.element).select('svg');
      this._removeHighlightDots(svg);
      var barOffset = 0;
      if (this.hoverArea == 'bar') {
        barOffset = this.graph.renderer.barWidth(point.series) / 2;
      }
      if (this.enableHoverDot) {
        for (var i = 0; i < points.length; i++) {
          var circle = svg.append('circle').attr('cx', this.graph.x(points[i].value.x) + barOffset).attr('cy', this.graph.y(points[i].value.y + points[i].value.y0)).attr('r', 6).attr('fill', points[i].series.color).attr('class', 'graph-highlight-dot').attr('stroke', 'white').attr('stroke-width', 3);
          if (points[i].value.highlight) {
            circle.classed('dot-highlight', true);
          }
        }
      }
      var formattedXValue = point.formattedXValue;
      var formattedYValue = point.formattedYValue;
      this.element.innerHTML = '';
      this.element.style.left = graph.x(point.value.x) + barOffset + 'px';
      var xLabel = document.createElement('div');
      xLabel.className = 'x_label';
      xLabel.innerHTML = formattedXValue;
      this.element.appendChild(xLabel);
      // invert the scale if this series displays using a scale
      var series = point.series;
      //var dot = document.createElement('div');
      //dot.className = 'dot';
      //dot.style.top = item.style.top;
      //dot.style.borderColor = series.color;
      //    this.element.appendChild(dot);
      var outer = this.graph.element.getBoundingClientRect().right;
      var xInner = xLabel.getBoundingClientRect().right;
      if (xInner > outer) {
        Openhose.$(xLabel).css('left', -xLabel.getBoundingClientRect().width + 1);
      }
      // NOTE: item is the old style hover label for a value.
      if (this.enableItemHover) {
        var item = document.createElement('div');
        item.className = 'item';
        // invert the scale if this series displays using a scale
        var actualY = series.scale ? series.scale.invert(point.value.y) : point.value.y;
        item.innerHTML = this.formatter(series, point.value.x, actualY, formattedXValue, formattedYValue, point);
        item.style.top = this.graph.y(point.value.y0 + point.value.y) + 'px';
        this.element.appendChild(item);
        //var dot = document.createElement('div');
        //dot.className = 'dot';
        //dot.style.top = item.style.top;
        //dot.style.borderColor = series.color;
        //    this.element.appendChild(dot);
        var inner = item.getBoundingClientRect().right;
        if (point.active) {
          //dot.className = 'dot active';
          if (inner > outer) {
            item.className = 'item active left';
          } else {
            item.className = 'item active right';
          }
        }
      }
      this.show();
    },
    hide: function () {
      this.visible = false;
      this.element.classList.add('inactive');
      if (typeof this.onHide == 'function') {
        this.onHide();
      }
      this._removeHighlightDots(null, true);
    }
  });
}(rickshaw, core);
lib_utils = function (Openhose) {
  return {
    // TODO: can this be replaced with a normal new Date(iso8601) ?
    fromISO: function (iso8601) {
      if (iso8601 instanceof Date) {
        return iso8601;
      }
      //XXX improve function
      var s = Openhose.$.trim(iso8601);
      s = s.replace(/\.\d\d\d+/, '');
      // remove milliseconds
      s = s.replace(/-/, '/').replace(/-/, '/');
      s = s.replace(/T/, ' ').replace(/Z/, ' UTC');
      s = s.replace(/([\+\-]\d\d)\:?(\d\d)/, ' $1$2');
      // -04:00 -> -0400
      return new Date(s);
    },
    isNewYorkDST: function (date) {
      //http://www.timetemperature.com/tzus/daylight_saving_time.shtml
      var dstYears = {
        '2009': {
          start: [
            2,
            8
          ],
          end: [
            10,
            1
          ]
        },
        '2010': {
          start: [
            2,
            14
          ],
          end: [
            10,
            7
          ]
        },
        '2011': {
          start: [
            2,
            13
          ],
          end: [
            10,
            6
          ]
        },
        '2012': {
          start: [
            2,
            11
          ],
          end: [
            10,
            4
          ]
        },
        '2013': {
          start: [
            2,
            10
          ],
          end: [
            10,
            3
          ]
        },
        '2014': {
          start: [
            2,
            9
          ],
          end: [
            10,
            2
          ]
        },
        '2015': {
          start: [
            2,
            8
          ],
          end: [
            10,
            1
          ]
        },
        '2016': {
          start: [
            2,
            13
          ],
          end: [
            10,
            6
          ]
        }
      };
      var dst = dstYears[date.getFullYear()];
      var startDst = new Date(date.getFullYear(), dst.start[0], dst.start[1], 2);
      var endDst = new Date(date.getFullYear(), dst.end[0], dst.end[1], 2);
      return startDst < date && date < endDst;
    },
    convertToNewYorkTime: function (date) {
      //clone date
      date = new Date(date.getTime());
      var tz = date.getTimezoneOffset() / 60;
      var nycDelta = tz - 5;
      // nyc utc
      date.setHours(date.getHours() + nycDelta);
      //dst start and ends 2 am
      if (this.isNewYorkDST(date)) {
        date.setHours(date.getHours() + 1);
      }
      return date;
    },
    // TODO: change formatting to moment, this consumes moment objects already would be nice if we used .format
    getShortTimeRangeLabel: function (start, end, options) {
      if (!options)
        options = {};
      var months = [];
      if (options.longMonths) {
        months = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December'
        ];
      } else {
        months = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec'
        ];
      }
      var str = '';
      str += start.date();
      if (start.month() != end.month()) {
        str += ' ' + months[start.month()];
      }
      if (start.hours() == 1 && end - start == 82800000) {
        return start.date() + ' ' + months[end.month()];
      }
      str += ' - ' + end.date() + ' ' + months[end.month()];
      return str;
    },
    round: function (num, decimals) {
      var factor = Math.pow(10, decimals);
      num = num * factor;
      num = Math.round(num);
      return num / factor;
    },
    truncate: function (str, limit, end) {
      var bits, i;
      if (!str || typeof str != 'string')
        return '';
      bits = str.split('');
      if (bits.length > limit) {
        for (i = bits.length - 1; i > -1; --i) {
          if (i > limit) {
            bits.length = i;
          } else if (' ' === bits[i]) {
            bits.length = i;
            break;
          }
        }
        bits.push(end || '...');
      }
      return bits.join('');
    }
  };
}(core);
visualization_hover_mixin = function (Openhose, CustomHoverDetail, Utils) {
  return {
    getHover: function (options) {
      var Hover = Openhose.Rickshaw.Class.create(CustomHoverDetail, { hoverArea: this.hoverArea });
      // TODO: move these 2 out, and make configurable
      //var yFormat = this.metrics[0] ? this.metrics[0].getFormatter() : Openhose.d3.format('.3');
      var yFormat = options.yFormat || Openhose.d3.format('.3');
      var showHours = options.showHours;
      var period = this.mainPeriod;
      var hoverDetail = new Hover({
        graph: this.graph,
        xFormatter: function (x, point) {
          var label = '';
          // find x position in the data array
          var xPos;
          for (var i = 0; i < this.graph.series[0].data.length; i++) {
            if (this.graph.series[0].data[i].x == x) {
              xPos = i;
            }
          }
          var actives = this.graph.series.active();
          if (this.renderer == 'bar' || this.renderer == 'area') {
            actives = actives.slice().reverse();  // copy and reverse
          }
          var dataPoints = [];
          function compare(a, b) {
            if (a.timeDelta > b.timeDelta) {
              return -1;
            } else if (a.timeDelta < b.timeDelta) {
              return 1;
            }
            // a must be equal to b
            return 0;
          }
          actives.sort(compare);
          label += '<div class="hover-header">';
          label += '<table class="hover-table">';
          var prevTime = 0;
          var metricIds = [];
          if (this.metrics) {
            metricIds = this.metrics.map(function (m) {
              return m.get('metricId');
            });
          }
          var showMetric = true;
          if (!this.metrics || !this.metrics.length) {
            showMetric = false;
          }
          // make sure they are all the same
          if (metricIds.length > 0) {
            for (i = 1; i < metricIds.length; i++) {
              if (metricIds[i] !== metricIds[0]) {
                showMetric = false;
                break;
              }
            }
          }
          showMetric = showMetric && this.metrics[0].get('dimensionId');
          var metricDisplay = '';
          if (showMetric) {
            metricDisplay = this.options.xFieldName;
          }
          var line;
          var hasPrediction = false;
          if (!this.options.noPrediction) {
            for (i = 0; i < actives.length; i++) {
              line = actives[i];
              if (line.data[xPos].yNonPredicted !== undefined) {
                hasPrediction = true;
                break;
              }
            }
          }
          // collect data
          for (i = 0; i < actives.length; i++) {
            line = actives[i];
            dataPoints.push(line.data[i]);
            // show percentage sign or not
            var percentageText = line.data[xPos].yRelative !== undefined && !this.noTotals && this.options.includePercentage ? '<span class="percentage">(%)</span>' : '';
            if (prevTime !== line.timeDelta) {
              var dTs = x * 1000;
              if (line.isHistory) {
                dTs = period.decrementMomentByPeriod(dTs).valueOf();
              }
              var displayTime;
              var d;
              var d2;
              // revert the offset.
              if (this.doOffsetOneBucket) {
                d = moment(dTs - this.mainPeriod.getBucketMs()).tz(period.timezone());
              } else {
                d = moment(dTs).tz(period.timezone());
              }
              if (showHours) {
                displayTime = d.format('MMMM D, YYYY');
                d2 = period.incrementMomentByBucket(d).tz(period.timezone());
                displayTime += '<span class="time">';
                displayTime += d.format('hh:mm A');
                displayTime += ' - ' + d2.format('hh:mm A');
                if (line.data[xPos].atTime) {
                  displayTime += ' @ ' + Openhose.moment(line.data[xPos].atTime).tz(period.timezone()).format('hh:mm A');
                }
                displayTime += '</span>';
              } else {
                d2 = period.incrementMomentByBucket(d).tz(period.timezone());
                displayTime = '<span class="time">';
                displayTime += d.format('Do MMMM');
                if (d.date() !== d2.date() || d.month() !== d2.month()) {
                  displayTime += ' - ';
                  displayTime += d2.format('Do MMMM');
                }
                displayTime += '</span>';
                // @ time for current time frames
                if (line.data[xPos].atTime) {
                  displayTime += '<span class="time">';
                  displayTime += ' ' + Openhose.moment(line.data[xPos].atTime).tz(period.timezone()).format('MMMM D @ hh:mm A');
                  displayTime += '</span>';
                }
              }
              var collspan = hasPrediction ? '3' : '2';
              label += '<tr class="header"><td colspan="' + collspan + '"> ' + displayTime + '</td></tr>';
              if (line.data[xPos].yNonPredicted !== undefined) {
                label += '<tr><th></th><th>Current ' + metricDisplay + ' ' + percentageText + '</th><th>Estimated ' + metricDisplay + '</th></tr>';
              } else if (metricDisplay) {
                label += '<tr><th></th><th>' + metricDisplay + ' ' + percentageText + '</th></tr>';
              }
            }
            prevTime = line.timeDelta;
            if (line.data[xPos].yNonPredicted !== undefined) {
              label += '<tr class="hover-item">';
              label += '  <td><span class="hover-label" style="color: ' + line.color + '"> ' + (line.lineLabel || line.name) + ' </span></td>';
              label += '  <td>' + yFormat(line.data[xPos].yNonPredicted);
              if (line.data[xPos].yRelative && !this.noTotals) {
                label += '<span class="percentage">(' + Math.round(line.data[xPos].yRelative * 10000) / 100 + '%)</span>';
              }
              label += '</td>';
              label += '  <td>' + yFormat(line.data[xPos].y) + '</td>';
              label += '</tr>';
            } else {
              label += '<tr class="hover-item">';
              label += '  <td><span class="hover-label" style="color: ' + line.color + '"> ' + (line.lineLabel || line.name) + ' </span></td>';
              label += '  <td>' + (line.data[xPos].y !== null ? yFormat(line.data[xPos].y) : '-');
              if (line.data[xPos].yRelative !== undefined && !this.noTotals && this.options.includePercentage) {
                label += '<span class="percentage">(' + Math.round(line.data[xPos].yRelative * 10000) / 100 + '%)</span>';
              }
              label += '</td>';
              label += '</tr>';
            }
          }
          if (!this.options.noTotals && this.metrics && this.metrics[0] && this.metrics[0].get('relativeMetric') && this.metrics[0].get('relativeMetric').collection.at(xPos)) {
            // yup..
            label += '<tr><td>Total:</td><td>' + yFormat(this.metrics[0].get('relativeMetric').collection.at(xPos)[metricIds[0]]) + '</td></tr>';
          }
          label += '</table>';
          label += '</div>';
          return label;
        }.bind(this)
      });
      return hoverDetail;
    }
  };
}(core, visualization_lib_custom_hover_details, lib_utils);
visualization_lib_axis_local_time = function (Rickshaw) {
  return function (args) {
    var self = this;
    this.graph = args.graph;
    this.elements = [];
    this.ticksTreatment = args.ticksTreatment || 'plain';
    this.fixedTimeUnit = args.timeUnit;
    this.tzOffset = args.tzOffset || 0;
    var time = args.timeFixture || new Rickshaw.Fixtures.Time();
    this.appropriateTimeUnit = function () {
      var unit;
      var units = time.units;
      var domain = this.graph.x.domain();
      var rangeSeconds = domain[1] - domain[0];
      units.forEach(function (u) {
        if (Math.floor(rangeSeconds / u.seconds) >= 2) {
          unit = unit || u;
        }
      });
      return unit || time.units[time.units.length - 1];
    };
    this.tickOffsets = function () {
      var domain = this.graph.x.domain();
      var unit = this.fixedTimeUnit || this.appropriateTimeUnit();
      var count = Math.ceil((domain[1] - domain[0]) / unit.seconds);
      var runningTick = domain[0] - this.tzOffset;
      var offsets = [];
      for (var i = 0; i < count; i++) {
        var tickValue = time.ceil(runningTick + 1, unit);
        runningTick = tickValue + unit.seconds / 2;
        offsets.push({
          value: tickValue,
          unit: unit
        });
      }
      return offsets;
    };
    this.render = function () {
      var extraContainer = self.graph.element.querySelector('.x_axis_container') || document.createElement('div');
      extraContainer.classList.add('x_axis_container');
      self.graph.element.appendChild(extraContainer);
      this.elements.forEach(function (e) {
        e.parentNode.removeChild(e);
      });
      this.elements = [];
      var offsets = this.tickOffsets();
      offsets.forEach(function (o) {
        if (self.graph.x(o.value + self.tzOffset) > self.graph.x.range()[1])
          return;
        var element = document.createElement('div');
        element.style.left = self.graph.x(o.value + self.tzOffset) + 'px';
        element.classList.add('x_tick');
        element.classList.add(self.ticksTreatment);
        var title = document.createElement('div');
        title.classList.add('title');
        title.innerHTML = o.unit.formatter(new Date(o.value * 1000));
        element.appendChild(title);
        extraContainer.appendChild(element);
        self.elements.push(element);
      });
    };
    this.graph.onUpdate(function () {
      self.render();
    });
  };
}(rickshaw);
visualization_lib_dots = function (Openhose, Rickshaw) {
  return Rickshaw.Class.create({
    initialize: function (args) {
      var self = this;
      this.graph = args.graph;
      this.graph.onUpdate(function () {
        self.render();
      });
    },
    render: function () {
      var self = this;
      var graphLines = Openhose.d3.select(this.graph.element.getElementsByTagName('svg')[0]).selectAll('path')[0];
      for (var l = 0; l < this.graph.series.length; l++) {
        var line = this.graph.series[l];
        if (line.disabled) {
          continue;
        }
        var lineName = line.name;
        if (Openhose._.isArray(lineName))
          lineName = lineName[0];
        var lineId = lineName.replace(/[^\w]/g, '') + '-' + l;
        var selection = Openhose.d3.select(this.graph.element.getElementsByTagName('svg')[0])  //.selectAll("circle.line-id-"+lineId).data(this.graph.stackedData[l]);
.selectAll('circle.line-id-' + lineId).data(this.graph.series[l].data);
        selection.enter().append('circle').attr('class', 'line-id-' + lineId).attr('fill', line.color).attr('r', 3).attr('cx', function (d) {
          return self.graph.x(d.x);
        }).attr('cy', function (d) {
          return self.graph.y(d.y + d.y0);
        }).each(function (d) {
          // NASTY hack, assumes the order of the lines are the same as they are in the data series.
          // Lines do not have a class i can select on :/
          graphLines[l].parentNode.insertBefore(this, graphLines[l].nextSibling);
          // insert After
          //
          if (d.highlight) {
            Openhose.d3.select(this).classed('dot-highlight', true);
          }
        });
      }  // sort the Dots
    }
  });
}(core, rickshaw);
visualization_line = function (Openhose, HoverMixin, Utils, LocalTime, Dots, Formatters) {
  var View = Openhose.Backbone.View.extend(HoverMixin).extend({
    className: 'visualization line',
    // Options available:
    // ==================
    //
    // data
    // events                      backbone events
    // height
    // legend (true)               true to show legend
    // doOffsetOneBucket (true)    Offset tick labels by one bucket
    // disablePreviousTimeLine     Hide the previous timeline on render. (true)
    // noLineDots (false)          Do not render data point dots on lines
    // noPrediction (false)        Turn off extrapolation
    // onClick                     calls given callback when clicking in chart
    // !annotations                list of annotations with format ??
    // logScale                    Use a logarithmic scale instead of linear
    // minValue                    Use this value as the minimum value for the graph
    // maxValue                    Use this value as the maximum value for the graph
    // yTickformatter              Formatter function for Y-Axis
    // yHoverFormat                Formatter function for the Hover label on the Y-Axis
    // !noTotals
    defaults: {
      legend: true,
      doOffsetOneBucket: true,
      disablePreviousTimeLine: true,
      noLineDots: false,
      noPrediction: false,
      yTickformatter: Formatters.yTickformatter
    },
    initialize: function (options) {
      this.options = Openhose._.extend({}, this.defaults, options);
      if (options.events)
        this.events = Openhose._.extend(this.events, options.events);
      this.dimensions = options.dimensions || [];
      this.metrics = options.metrics || [];
      this.mainPeriod = options.period;
      this.noPrediction = options.noPrediction;
      this.noTotals = options.noTotals || false;
      this.noLineDots = options.noLineDots;
      this.doOffsetOneBucket = this.options.doOffsetOneBucket === true || this.doOffsetOneBucket === true ? true : false;
      this.id = Openhose._.uniqueId('line');
      this.el.id = this.id;
      this.data = options.data;
    },
    render: function () {
      var data = this.data.values;
      this.mainPeriod = this.mainPeriod || data[0].period;
      if (!data || !data[0] || !data[0].data.length) {
        this.trigger('noData');
        return this.$el.empty();
      }
      if (!this.$el.is(':visible')) {
        return setTimeout(this.render.bind(this), 200);
      }
      var availableHeight = this.options.height || this.$el.parent().height();
      this.$el.append('<div class="legend"/><div class="graphwrapper"><div class="y_axes" /><div class="secondgraph rickshaw_graph" /><div class="x_axes" /></div>');
      if (this.options.minValue === undefined) {
        this.options.minValue = 'auto';
      }
      if (typeof this.options.maxValue !== 'number') {
        this.options.maxValue = undefined;
      }
      this.graph = new Openhose.Rickshaw.Graph({
        element: this.$('.secondgraph')[0],
        series: data,
        renderer: 'line',
        min: this.options.minValue,
        max: this.options.maxValue,
        height: availableHeight,
        interpolation: 'monotone',
        lineBreakpoint: this.lineBreakpoint,
        noPrediction: this.options.noPrediction
      });
      this.graph.configure({
        height: this.graph.height,
        width: this.graph.width
      });
      var showHours = data[0].period.getDuration().asDays() < 1;
      this.getHover({
        showHours: showHours,
        yFormat: this.options.yHoverFormat
      });
      if (this.options.annotations) {
        var annotations = this.options.annotations;
        var annotationData = annotations.data;
        var style = annotations.style;
        var labelStyle = annotations.labelStyle;
        this.$el.append('<div class="annotations"/></div>');
        var annotationsEl = this.$('.annotations').get(0);
        this.annotator = new Openhose.Rickshaw.Graph.CustomAnnotate({
          graph: this.graph,
          element: annotationsEl,
          ranges: style,
          showLabels: labelStyle
        });
        // add existing annotations
        annotationData.map(function (annotation) {
          var end = annotation.x2 || undefined;
          var series = annotation.series || undefined;
          // this needs to be a reference to the rickshaw graph line.
          this.annotator.add(annotation.x, annotation.label, end, series, annotation.click);
        }.bind(this));
        this.annotator.update();
        this.$('.annotations.rickshaw_annotation_timeline').css('height', '300px');  // FIXME: remove me!
      }
      if (this.options.onClick) {
        this.clicker = new Openhose.Rickshaw.Graph.Click({
          graph: this.graph,
          onClick: this.options.onClick,
          annotator: this.annotator
        });  //var timestamp = data[0].data[0].x;
             //var message = "test";
             //this.annotator.add(timestamp, message);
      }
      if (data.length > 1 && this.options.legend) {
        var legend = new Openhose.Rickshaw.Graph.Legend({
          graph: this.graph,
          element: this.$('.legend')[0]
        });
        new Openhose.Rickshaw.Graph.Behavior.Series.Toggle({
          graph: this.graph,
          legend: legend
        });
        new Openhose.Rickshaw.Graph.Behavior.Series.Highlight({
          graph: this.graph,
          legend: legend
        });
      }
      var yAxis;
      if (this.options.logScale) {
        yAxis = new Openhose.Rickshaw.Graph.Axis.Y.Scaled({
          graph: this.graph,
          tickFormat: this.options.yTickformatter,
          scale: Openhose.d3.scale.log()
        });
      } else {
        yAxis = new Openhose.Rickshaw.Graph.Axis.Y({
          graph: this.graph,
          tickFormat: this.options.yTickformatter
        });
      }
      yAxis.render();
      var timeFixture = new Rickshaw.Fixtures.Time();
      function formatTime(d) {
        return moment(d).utc().format('h:mm A');
      }
      // Override hour:minute formatter for 12h instead of 24h.
      timeFixture.formatTime = formatTime;
      var xAxis = new LocalTime({
        graph: this.graph,
        timeFixture: timeFixture,
        tzOffset: this.mainPeriod.toMoments().end.zone() * 60
      });
      xAxis.render();
      this.graph.render();
      if (!this.noLineDots) {
        var dots = new Dots({ graph: this.graph });
        dots.render();
      }
    },
    destroy: function () {
      this.remove();
    }
  });
  return View;
}(core, visualization_hover_mixin, lib_utils, visualization_lib_axis_local_time, visualization_lib_dots, visualization_helpers_format);
visualization_area = function (Openhose, HoverMixin, Utils, LocalTime) {
  var View = Openhose.Backbone.View.extend(HoverMixin).extend({
    // Options available:
    // ==================
    //
    // data
    // events                      backbone events
    // height
    // doOffsetOneBucket (true)    Offset tick labels by one bucket
    // legend (true)               true to show legend
    // minValue                    Use this value as the minimum value for the graph
    // maxValue                    Use this value as the maximum value for the graph
    defaults: { legend: true },
    className: 'visualization area',
    renderer: 'area',
    hoverArea: 'closest',
    doOffsetOneBucket: true,
    initialize: function (options) {
      this.options = Openhose._.extend({}, this.defaults, options);
      if (options.events)
        this.events = Openhose._.extend(this.events, options.events);
      this.dimensions = options.dimensions || [];
      this.metrics = options.metrics || [];
      this.mainPeriod = options.period;
      this.id = 'area-' + Openhose._.uniqueId('line');
      this.el.id = this.id;
      // override from options
      if (this.options.doOffsetOneBucket !== undefined) {
        this.doOffsetOneBucket = this.options.doOffsetOneBucket;
      }
      this.data = options.data;
    },
    render: function () {
      var data = this.data.values;
      this.mainPeriod = this.mainPeriod || data[0].period;
      // NOTE: this shows empty chart when data contains null values
      // TODO: determine in what cases should 'noData' be triggered
      // if (!this._isEmpty()) {
      //   this.trigger('noData');
      //   return this.$el.empty();
      // }
      if (!this.$el.is(':visible')) {
        return setTimeout(this.render.bind(this), 200);
      }
      var availableHeight = this.options.height || this.$el.parent().height();
      this.$el.append('<div class=legend /><div class=graphwrapper><div class=y_axes /><div class="secondgraph rickshaw_graph" /><div class=x_axes /></div>');
      if (this.options.minValue === undefined) {
        this.options.minValue = 'auto';
      }
      if (typeof this.options.maxValue !== 'number') {
        this.options.maxValue = undefined;
      }
      var graph = new Openhose.Rickshaw.Graph({
        element: this.$('.secondgraph')[0],
        series: data,
        renderer: this.renderer,
        height: availableHeight,
        min: this.options.minValue,
        max: this.options.maxValue,
        padding: { top: 0.02 }
      });
      this.graph = graph;
      graph.render();
      var showHours = data[0].period.getDuration().asDays() < 1;
      this.getHover({ showHours: showHours });
      if (this.options.legend) {
        var legend = new Openhose.Rickshaw.Graph.Legend({
          graph: graph,
          element: this.$('.legend')[0]
        });
        new Openhose.Rickshaw.Graph.Behavior.Series.Toggle({
          graph: graph,
          legend: legend
        });
        new Openhose.Rickshaw.Graph.Behavior.Series.Highlight({
          graph: graph,
          legend: legend
        });
      }
      var yAxis = new Openhose.Rickshaw.Graph.Axis.Y({
        graph: graph,
        tickFormat: this.yTickformatter
      });
      yAxis.render();
      // fix 0, 0
      function fixZeroPointZero() {
        var $ax = Openhose.$(yAxis.graph.element);
        var zeroLabel = $ax.find('.tick.major text').first();
        if (zeroLabel.parent().length && zeroLabel.parent().attr('transform').split(',')[1].slice(0, -1) == '' + availableHeight) {
          zeroLabel.attr('transform', 'translate(0, -6)');
        }
      }
      graph.onUpdate(fixZeroPointZero);
      fixZeroPointZero();
      var timeFixture = new Rickshaw.Fixtures.Time();
      function formatTime(d) {
        return moment(d).utc().format('h:mm A');
      }
      // Override hour:minute formatter for 12h instead of 24h.
      timeFixture.formatTime = formatTime;
      var xAxis = new LocalTime({
        graph: graph,
        orientation: 'bottom',
        timeFixture: timeFixture,
        tzOffset: this.mainPeriod.toMoments().end.zone() * 60
      });
      xAxis.render();
    },
    _isEmpty: function () {
      var data = this.data.values;
      for (var i = 0; i < data.length; i++) {
        var line = data[i];
        for (var j = 0; j < line.data.length; j++) {
          var value = line.data[j].y;
          if (!Openhose._.isNumber(value) || Openhose._.isNaN(value))
            return true;
        }
      }
      return false;
    },
    destroy: function () {
      this.remove();
    }
  });
  // non instance functions.
  View.validate = function (metrics, dimensions) {
    var validated = true;
    var error = null;
    if (dimensions.length) {
      if (metrics.length != 1) {
        error = 'Need exactly one metric to render a line chart with dimensions';
        validated = false;
      }
      var supportedDimensions = [
        'topics',
        'tags'
      ];
      dimensions.forEach(function (dimension) {
        if (supportedDimensions.indexOf(dimension.get('dimensionId')) == -1) {
          error = 'Area chart doesn\'t support this dimension yet';
          validated = false;
          return;
        }
      });
    } else {
      if (!metrics.length) {
        error = 'Need at least one dimension or metric to render line chart';
        validated = false;
      }
    }
    return [
      validated,
      error
    ];
  };
  return View;
}(core, visualization_hover_mixin, lib_utils, visualization_lib_axis_local_time);
visualization_stacked_bar = function (Area) {
  var View = Area.extend({
    renderer: 'bar',
    hoverArea: 'bar',
    doOffsetOneBucket: false
  });
  return View;
}(visualization_area);
visualization_time_line = function (Openhose, HoverMixin, Utils) {
  var View = Openhose.Backbone.View.extend({
    labelFormat: 'hh:mm A MMM Do',
    className: 'visualization time-line',
    margin: {
      top: 40,
      right: 14,
      bottom: 0,
      left: 14
    },
    width: 0,
    height: 50,
    initialize: function (options) {
      options = options || {};
      this.options = options;
      this.onClick = this._clickHandler.bind(this);
      this.onHover = this._onHover;
      this.width = options.width || this.width;
      this.period = options.period;
      this.data = options.data;
      this.snapGrid = options.snapGrid;
    },
    _clickHandler: function (e) {
      var positionIndicator = this.positionIndicator;
      var x = this.x;
      var parentOffset = Openhose.$(e.target).offset();
      var offset = e.pageX - parentOffset.left;
      var position = this.snapToGrid(e, offset);
      var date = Openhose.moment(this.x.invert(position));
      positionIndicator.selectAll('text').text(date.format(this.labelFormat));
      this.updatePosition({ date: date });
      this.selectedPoint = date;
      this.options.onClick(x.invert(offset), this.slot);
    },
    updatePosition: function (options) {
      var date = Openhose.moment(options.date);
      this.positionIndicator.selectAll('text').text(date.format(this.labelFormat));
      this.positionIndicator.attr('transform', 'translate(' + this.x(date.valueOf()) + ', 49)');
    },
    hidePosition: function () {
      this.positionIndicator.attr('transform', 'translate(-300, 8)');
      this.selectedPoint = null;
    },
    renderLine: function () {
      var data = this.data.values[0];
      if (!data)
        return;
      data = data.data;
      if (!data)
        return;
      var margin = 2;
      var yMax = Openhose.d3.max(data, function (d) {
        return d.y;
      });
      var yMin = Openhose.d3.min(data, function (d) {
        return d.y;
      });
      var xMax = Openhose.d3.max(data, function (d) {
        return d.x;
      });
      var xMin = Openhose.d3.min(data, function (d) {
        return d.x;
      });
      var x = Openhose.d3.scale.linear().range([
        this.margin.left,
        this.width + this.margin.left
      ]).domain([
        xMin,
        xMax
      ]);
      var y = Openhose.d3.scale.linear().range([
        margin,
        20
      ]).domain([
        yMax,
        yMin
      ]);
      var line = Openhose.d3.svg.line()  //.interpolate("monotone")
.interpolate('linear').x(function (d) {
        return x(d.x);
      }).y(function (d) {
        return y(d.y);
      });
      this.svg.append('path').datum(data).attr('class', 'sparkline').attr('d', function (d) {
        return line(d);
      });
    },
    render: function () {
      setTimeout(this.render2.bind(this), 10);
    },
    render2: function () {
      if (!this.options.from && !this.options.to) {
        var period = this.period || this.data.values[0].period;
        this.range = [
          period.get('start'),
          period.decrementMomentByBucket(period.get('end') + 1)
        ];
      } else {
        this.range = [
          this.options.from,
          this.options.to
        ];
      }
      this.width = this.width || this.$el.parent().width() - this.margin.left - this.margin.right;
      var customTimeFormat = Openhose.d3.time.format.multi([
        [
          '.%L',
          function (d) {
            return d.getMilliseconds();
          }
        ],
        [
          '%I:%M:%S',
          function (d) {
            return d.getSeconds();
          }
        ],
        [
          '%I:%M',
          function (d) {
            return d.getMinutes();
          }
        ],
        [
          '%I %p',
          function (d) {
            return d.getHours();
          }
        ],
        [
          '%a %d',
          function (d) {
            return d.getDay() && d.getDate() != 1;
          }
        ],
        [
          '%b %d',
          function (d) {
            return d.getDate() != 1;
          }
        ],
        [
          '%B',
          function (d) {
            return d.getMonth();
          }
        ],
        [
          '%Y',
          function () {
            return true;
          }
        ]
      ]);
      this.x = Openhose.d3.time.scale().domain(this.range).range([
        0,
        this.width
      ]);
      this.xAxis = Openhose.d3.svg.axis().scale(this.x).orient('top').tickPadding(8).outerTickSize(4).innerTickSize(4).tickFormat(customTimeFormat);
      Openhose.d3.select(this.el).select('svg').remove();
      this.svg = Openhose.d3.select(this.el).append('svg').attr('width', this.width + this.margin.left + this.margin.right).attr('height', this.height);
      this.svg.append('g').attr('class', 'chart').attr('transform', 'translate(' + this.margin.left + ',' + (this.height - 1) + ')').call(this.xAxis);
      this.controlsG = this.svg.append('g').attr('class', 'controls').attr('transform', 'translate(' + this.margin.left + ', 0)');
      this.controlsG.append('rect').attr('class', 'background-rect').attr('x', 0).attr('y', 0).attr('width', this.width).attr('height', this.height);
      if (this.options.line || true) {
        // TODO: remove true
        this.renderLine();
      }
      this.positionIndicator = this.controlsG.append('g').attr('class', 'indicators').attr('transform', 'translate(-30,49)').style('pointer-events', 'none');
      if (this.selectedPoint) {
        this.updatePosition({ date: this.selectedPoint });
      }
      this.positionIndicator.append('polyline').attr('class', 'position-indicator').attr('points', '-4,0 4,0 0,-6 0,-49 -0.5,-49 -0.5,-6 -4,0 4,0');
      this.positionIndicator.append('text').attr('y', '-34').attr('text-anchor', 'middle').text('');
      this.hoverIndicator = this.controlsG.append('g').attr('class', 'indicators').attr('transform', 'translate(-30,49)').style('pointer-events', 'none');
      this.hoverIndicator.append('polyline').attr('class', 'text-back').attr('points', '-50,-31  50,-31  50,-44 -50,-44');
      this.hoverIndicator.append('polyline').attr('class', 'hover-indicator').attr('points', '-4,0 4,0 0,-6 0,-49 -0.5,-49 -0.5,-6 -4,0 4,0');
      this.hoverIndicator.append('text').attr('y', '-34').attr('text-anchor', 'middle').text('');
      var hoverCircle = this.hoverIndicator;
      var x = this.x;
      var timer;
      var self = this;
      this.$('.background-rect').on('mouseover', function () {
        hoverCircle.style('visibility', 'visible');
        clearTimeout(timer);
      }).on('mousemove', function (e) {
        var parentOffset = Openhose.$(this).offset();
        var offset = e.pageX - parentOffset.left;
        var text = hoverCircle.selectAll('text');
        var position = offset;
        position = self.snapToGrid(e, position);
        hoverCircle.attr('transform', 'translate(' + position + ', 49)');
        text.text(Openhose.moment(x.invert(position)).format(self.labelFormat));
        text.attr('transform', 'translate(0, 0)');
        // keep text inside the svg canvas
        var textBB = text.node().getBoundingClientRect();
        var svgBB = self.svg.node().getBoundingClientRect();
        var left = textBB.left - svgBB.left;
        var right = svgBB.right - textBB.right;
        if (left < 0) {
          text.attr('transform', 'translate(' + -left + ', 0)');
        } else if (right < 0) {
          text.attr('transform', 'translate(' + right + ', 0)');
        }
      }).on('mouseout', function () {
        timer = setTimeout(function () {
          hoverCircle.style('visibility', 'hidden');
        }, 250);
      }).on('click', this.onClick);
    },
    snapToGrid: function (e, position) {
      var distance;
      var closestI = 0;
      var value;
      if (this.snapGrid) {
        distance = this.snapGrid[0];
        closestI = 0;
        this.snapGrid.forEach(function (x, i) {
          var newDistance = Math.abs(this.x.invert(position).valueOf() - x);
          if (newDistance < distance) {
            distance = newDistance;
            closestI = i;
            value = x;
          }
        }.bind(this));
        position = this.x(value);
      }
      this.slot = closestI;
      return position;
    },
    destroy: function () {
      this.remove();
    }
  });
  // non instance functions.
  View.validate = function (metrics, dimensions) {
    return [
      true,
      null
    ];
  };
  return View;
}(core, visualization_hover_mixin, lib_utils);
visualization_table = function (Openhose, format) {
  var View = Openhose.Backbone.View.extend({
    className: 'visualization table',
    // Options available:
    // ==================
    //
    // data
    // events
    // timeComparisonDimensions
    // colors
    // columnTitleLabel                     Sets the first header
    // columnWidths                         Array with css width of columns
    // columns                              Custom columns definitions TODO: get some documentation for this
    // format                               If no other formatter is specified, fallback to this. // TODO: replace with formatter helper?
    // formats                              Override d3 formatter {'<fieldId>': '<d3 format string>', ... }
    // labels                               Override labels {'<fieldId>': '<label>', ... }
    // onRender                             Callback after render
    // showImages [true]                    Show images if it has a imageUrl
    // urlPrefix                            TODO: unused?
    initialize: function (options) {
      this.options = _.defaults({}, options || {}, { showImages: true });
      if (options.events)
        this.events = _.extend(this.events, options.events);
      this.metrics = options.metrics || [];
      this.dimensions = options.dimensions || [];
      this.timeComparisonDimensions = options.timeComparisonDimensions;
      this.data = options.data;
      this.valueLabels = {};
      this.percentageColumns = [];
      this.hideColumns = [];
      this.showChangeColumns = [];
      (options.columns || []).forEach(this._setColumnOptions.bind(this));
    },
    _setColumnOptions: function (column) {
      var id = column.id;
      // TODO: unify this, make sure keeping the indexes below is not needed anymore
      if (column.percentages)
        this.percentageColumns.push(id);
      if (column.hidden)
        this.hideColumns.push(id);
      if (column.showChange)
        this.showChangeColumns.push(id);
      if (column.valueLabels) {
        this.valueLabels[id] = column.valueLabels;
      }
    },
    render: function () {
      if (!this.data) {
        this.trigger('noData');
        return this.$el.empty();
      }
      var $table = $('<table>');
      var $tr = $('<tr>');
      var self = this;
      var hideColumns = this.hideColumns;
      var percentageColumns = this.percentageColumns;
      var columnWidths = this.options.columnWidths || [];
      var columnTitleLabel = this.options.columnTitleLabel || '&nbsp;';
      var labelKeys = _.keys(this.data.labels);
      if (hideColumns.length) {
        labelKeys = labelKeys.filter(function (l) {
          return hideColumns.indexOf(l) === -1;
        });
      }
      [].concat(['label'], labelKeys).forEach(function (k, i) {
        var $th;
        if (k === 'label') {
          $th = $('<th class="label">' + columnTitleLabel + '</th>');
        } else {
          $th = $('<th>').html(self.data.labels[k]);
        }
        if (columnWidths[i]) {
          $th.css('width', columnWidths[i]);
        }
        if (self.showChangeColumns.indexOf(k) !== -1) {
          // Take extra column for comparison number into account
          $th.attr('colspan', 2);
        }
        $tr.append($th);
      });
      var $tHead = $('<thead>');
      $tHead.append($tr);
      $table.append($tHead);
      var blindClass = 'odd';
      var colors = [];
      // Colors need to be cached first because the passed in colors function
      // seems to mess up if colors aren't called by index in ascending order.
      // When re-sorting the table, this can be an issue
      if (this.options.colors) {
        this.data.values.forEach(function (value, i) {
          colors.push(this.options.colors(i));
        }.bind(this));
      }
      var totals = {};
      if (percentageColumns) {
        var values = this.data.values;
        percentageColumns.forEach(function (column) {
          totals[column] = _.reduce(values, function (sum, item) {
            return sum + item[column];
          }, 0);
        });
      }
      this.data.values.forEach(function (value, i) {
        this._applyValueLabels(value);
        var $tr = $('<tr>').addClass(blindClass);
        Object.keys(value).map(function (k) {
          $tr.data(k, value[k]).attr('data-' + k, value[k]);
        });
        var href = this.options.urlPrefix ? this.options.urlPrefix + value.title : '#';
        // TODO: why is data-title being used here in $labelTd?
        var dataAttributes = {
          id: value.id,
          title: value.title
        };
        if (value.entityType)
          dataAttributes.entitytype = value.entityType;
        var $labelTd = $('<td class="label"><a target="_blank" title="' + value.title + '" href="' + href + '" ' + this._getDataAttributesHtml(dataAttributes) + '>' + (value.imageUrl && this.options.showImages ? '<span class="image"><img onload="this.style.display=\'inline\'" src="' + value.imageUrl + '"></span>' : '') + (this.options.labelPrefix || '') + value.label + '</a></td>');
        if (this.options.colors) {
          var color;
          if (this.options.sortBy) {
            color = colors[value.originalIndex];
          } else {
            color = colors[i];
          }
          $labelTd.addClass('color-label').css('border-left-color', color);
        }
        $tr.append($labelTd);
        labelKeys.forEach(function (k) {
          var valueText = value[k];
          if (percentageColumns.length && percentageColumns.indexOf(k) !== -1) {
            var percent = valueText / totals[k] * 100;
            valueText = format.percent(percent);
          } else if (this.options.formats && this.options.formats[k]) {
            if (typeof this.options.formats[k] === 'function') {
              valueText = this.options.formats[k](valueText, this.data.values);
            } else {
              valueText = d3.format(this.options.formats[k])(value[k]);
            }
          } else if (typeof value[k] === 'number') {
            valueText = this._prettyNumber(valueText);
          }
          if (!valueText)
            valueText = '-';
          var valueCell = $('<td class="' + k + '">' + (valueText || '') + '</td>');
          $tr.append(valueCell);
          if (this.showChangeColumns.indexOf(k) !== -1) {
            // Only supporting one previous data set right now
            var previousValues = this.data.previousMapping;
            if (!previousValues) {
              console.warn('No previous values available, were they fetched?');
            }
            var diffElement = $('<td>');
            var previous = previousValues[value.id];
            if (previous) {
              var previousValue = previous.get(k);
              var currentValue = value[k];
              var diffPercentage, diffClass;
              if (previousValue < currentValue) {
                // Increase
                diffPercentage = (currentValue - previousValue) / previousValue * 100;
                diffClass = 'change-up';
              } else if (previousValue > currentValue) {
                // Decrease
                diffPercentage = (previousValue - currentValue) / previousValue * 100;
                diffClass = 'change-down';
              } else {
                // Same
                diffPercentage = 0;
                diffClass = 'change-none';
              }
              diffElement.addClass(diffClass).text(format.percentDiff(diffPercentage));
            } else {
              diffElement.addClass('change-none').text('-');
            }
            $tr.append(diffElement);
          }
        }.bind(this));
        $table.append($tr);
        blindClass = blindClass === 'odd' ? 'even' : 'odd';
      }.bind(this));
      var $inner = $('<div>').addClass('inner');
      // Quick dirty fix for showing titles in table headers
      // adding it to the th when it is created doesn't work for reasons of no idea.
      $table.find('th').each(function (i, th) {
        var $th = $(th);
        $th.attr('title', $th.text());
      });
      $inner.append($table);
      this.$el.append($inner);
      this.trigger('render');
      this.options.onRender && this.options.onRender();
    },
    destroy: function () {
      this.remove();
    },
    _applyValueLabels: function (value) {
      var valueLabels = this.valueLabels;
      Object.keys(value).forEach(function (key) {
        var valueLabel = valueLabels[key];
        if (valueLabel) {
          var originalValue = value[key];
          value[key] = valueLabel[originalValue] || originalValue;
        }
      });
    },
    _getDataAttributesHtml: function (attributes) {
      var html = '';
      Object.keys(attributes).forEach(function (attr) {
        html += ' data-' + attr + '="' + attributes[attr] + '"';
      });
      return $.trim(html);
    },
    _prettyNumber: function (number) {
      if (!number)
        return '';
      return d3.format(this.options.format || ',.1')(number);
    }
  });
  // non instance functions.
  View.validate = function (metrics, dimensions) {
    var validated = true;
    var error = null;
    if (dimensions.length) {
      if (dimensions.length !== 1) {
        error = 'Table needs exactly one dimension';
        validated = false;
      }
      if (dimensions[0].get('metrics').length < 1) {
        error = 'Table needs at least one metric when used with dimension.';
        validated = false;
      }
    } else if (metrics.length < 1) {
      error = 'Table needs at least one metric';
      validated = false;
    }
    return [
      validated,
      error
    ];
  };
  return View;
}(core, visualization_helpers_format);
text_templates_dot_tool_tiphtml = '<h2 class"title">\n  <%= title %>\n</h2>\n<p class="legend">Date: <%= new Date(data[0]).toLocaleDateString() + \' \' + new Date(data[0]).toLocaleTimeString().replace(/\\:\\d\\d\\s/,\' \') %></p>\n<p class="legend"><%= xField.slice(0, 1).toUpperCase() + xField.slice(1) %>: <%= d3.format(scatter.options.format)(data[1]) %></p>\n<p class="legend"><%= yField.slice(0, 1).toUpperCase() + yField.slice(1) %>: <%= d3.format(scatter.options.format)(data[2]) %></p>\n<% if (zField) { %>\n<p class="legend"><%= zField.slice(0, 1).toUpperCase() + zField.slice(1) %>: <%= d3.format(scatter.options.format)(data[3]) %></p>\n<% } %>\n</p>\n';
text_templates_history_dot_tool_tiphtml = '<span>\n    <img class="topmenuico" src="/images/ico-topmenuuser.png"><% print(bn.utils.timeago.inWords(new Date().getTime() - data[0])) %>\n</span>\n';
visualization_lib_d3extensions = {
  moveToFront: function (selection) {
    return selection.each(function () {
      this.parentNode.appendChild(this);
    });
  },
  moveToBack: function (selection) {
    return selection.each(function () {
      this.parentNode.insertBefore(this, this.parentNode.firstChild);
    });
  },
  // by Johan.
  moveBehind: function (selection, before) {
    return selection.each(function () {
      this.parentNode.insertBefore(this, before);
    });
  },
  moveInFront: function (selection, after) {
    return selection.each(function () {
      this.parentNode.insertBefore(this, after.nextSibling);
    });
  }
};
visualization_motion_scatter = function (Openhose, dotToolTipTemplate, historyDotToolTipTemplate, d3Extensions) {
  var View = Openhose.Backbone.View.extend({
    className: 'visualization motion-scatter',
    controlsTemplate: '<div class="graph-container"></div>' + '<div class="controls scatter-controls">' + '<button class="history-animation-play-pause"><span class="icon play play-pause-icon"></span></button>' + '<div class="time-line" style="height: 100px"></div>' + '</div>',
    defaults: {
      legend: true,
      format: ',.1',
      xScale: 'linear',
      yScale: 'linear',
      zScale: 'sqrt'
    },
    // Options available:
    // ==================
    //
    // data
    // events             backbone events
    // legend: true       show labels
    // format             d3 format string
    // colors             d3 color scheme
    // width              widget size
    // height
    // xScale: linear     Scale type: linear, sqrt, pow or log
    // yScale: linear     Scale type: linear, sqrt, pow or log
    // zScale: sqrt       Scale type: linear, sqrt, pow or log
    // zRange             Min and Max size of dots. Default: { min: 5, max: 40 }
    // autoplay           Start playing when done loading
    // xField             Specify what field to put on x Axis (eg. 'volume')
    // yField             Specify what field to put on y Axis
    // zField             Specify what field to put on z Axis
    // xFieldName         Use this label on the x axis
    // yFieldName         Use this label on the y axis
    initialize: function (options) {
      this.options = Openhose._.extend({}, this.defaults, options);
      if (options.events)
        this.events = Openhose._.extend(this.events, options.events);
      this.metrics = options.metrics;
      this.period = options.period;
      this.height = options.height;
      this.width = options.width;
      this.zRange = options.zRange || {
        min: 5,
        max: 40
      };
      this.xField = options.xField;
      this.yField = options.yField;
      this.zField = options.zField;
      this.playing = false;
      this.$timeText = null;
      this.animationTimeout = null;
      this.$el.append(this.controlsTemplate);
      this.color = this.options.colors || Openhose.d3.scale.category20b();
      this.$el.find('.history-animation-play-pause').click(this._togglePlay.bind(this));
      this.animateButton = this.$el.find('.play-pause-icon');
      this.appendix = '';
      this.isRendered = false;
      this.step = 0;
      if (this.options.data) {
        this.data = this.options.data.values;
      }
    },
    render: function () {
      this.xField = this.xField || this.data[0].xField;
      this.yField = this.yField || this.data[0].yField || this.xField;
      this.zField = this.zField || this.data[0].zField || this.xField;
      if (this.isRendered) {
        this._renderAxis();
        this._renderBalls();
        return;
      }
      if (!this.$el.is(':visible')) {
        return setTimeout(this.render.bind(this), 100);
      }
      var parent = this.$el.closest('.openhose-widget');
      if (!parent.length)
        parent = this.$el.parent();
      var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
      };
      var width = this.$el.width() - 102 - margin.left - margin.right;
      var height = (this.height || parent.height()) - margin.top - margin.bottom - 45;
      this.margin = margin;
      this.width = width;
      this.height = height;
      function scaleCreator(style, range) {
        var scale;
        switch (style) {
        case 'sqrt':
          scale = Openhose.d3.scale.sqrt();
          break;
        case 'pow':
          scale = Openhose.d3.scale.pow();
          break;
        case 'log':
          scale = Openhose.d3.scale.log();
          break;
        default:
          scale = Openhose.d3.scale.linear();
          break;
        }
        scale.range(range);
        return scale;
      }
      this.x = scaleCreator(this.options.xScale, [
        0,
        width
      ]);
      this.y = scaleCreator(this.options.yScale, [
        height,
        0
      ]);
      this.z = scaleCreator(this.options.zScale, [
        this.zRange.min,
        this.zRange.max
      ]);
      // min / max dot size
      Openhose.d3.select(this.el.getElementsByClassName('graph-container')[0]).attr('style', 'height:' + (height + 30) + 'px;');
      var svg = Openhose.d3.select(this.el.getElementsByClassName('graph-container')[0]).append('svg').attr('style', 'height:' + (height + 40) + '; margin-bottom:20px;').append('g').attr('pointer-events', 'all').append('svg:g').append('svg:g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
      this.svg = svg;
      //var timeScaleSvg = d3.select(this.el.getElementsByClassName("scatter-history-slider-scale")[0])
      //  .append("svg")
      //    .attr('style', 'height: 30px;')
      //  .append("g");
      //this.timeScaleSvg = timeScaleSvg;
      Openhose.d3.select(this.el).append('div').attr('class', 'tooltip-container').attr('position', 'fixed').attr('top', '0px').attr('left', '0px').attr('height', '100%').attr('width', '100%');
      Openhose.d3.select(this.el).append('div').attr('class', 'history-tooltip-container').attr('position', 'fixed').attr('top', '0px').attr('left', '0px');
      svg.append('svg:rect').attr('width', width).attr('height', height).attr('class', 'background').attr('fill', 'white');
      var topics = this.data;
      var xMin = Openhose.d3.min(topics, function (t) {
        return Openhose.d3.min(t.data, function (d) {
          return d[1];
        });
      });
      var xMax = Openhose.d3.max(topics, function (t) {
        return Openhose.d3.max(t.data, function (d) {
          return d[1];
        });
      });
      var yMin = Openhose.d3.min(topics, function (t) {
        return Openhose.d3.min(t.data, function (d) {
          return d[2];
        });
      });
      var yMax = Openhose.d3.max(topics, function (t) {
        return Openhose.d3.max(t.data, function (d) {
          return d[2];
        });
      });
      var zMin = Openhose.d3.min(topics, function (t) {
        return Openhose.d3.min(t.data, function (d) {
          return d[3];
        });
      });
      var zMax = Openhose.d3.max(topics, function (t) {
        return Openhose.d3.max(t.data, function (d) {
          return d[3];
        });
      });
      this.x.domain([
        xMin,
        xMax
      ]);
      this.y.domain([
        yMin,
        yMax
      ]);
      this.z.domain([
        zMin,
        zMax
      ]);
      var firstSegment = this.data[0];
      var period = firstSegment.period;
      this.subDataLength = firstSegment.data.length;
      // create a list of snapping points from the data
      var snapGrid = firstSegment.data.map(function (d) {
        return d[0];
      });
      var from = firstSegment.data[0][0];
      var to = firstSegment.data.slice(-1)[0][0];
      // get last timestamp
      // render timeline
      this.timeLine = new Openhose.Visualization.TimeLine({
        el: this.$('.time-line'),
        from: from,
        to: to,
        data: { values: [] },
        onClick: this._onClickTimeLine.bind(this),
        snapGrid: snapGrid,
        width: width
      });
      this.timeLine.render2();
      this._changeValue(this.subDataLength - 1);
      this._showTime(this.subDataLength - 1);
      // draw axis
      this._renderAxis();
      if (this.options.legend) {
        // draw legend.
        this._renderLegend();
      }
      this.isRendered = true;
      if (this.options.autoplay) {
        this._togglePlay();
      }
    },
    _renderLegend: function () {
      var legend = this.svg.selectAll('.legend').data(this.data).enter().append('g').attr('class', 'legend').attr('transform', function (d, i) {
        return 'translate(0,' + i * 20 + ')';
      });
      legend.append('rect').attr('x', this.width + 120 - 18).attr('class', 'legend-rect').attr('data-id', function (d) {
        return 'legend-rect-' + this._classNameForTitle(d.title);
      }.bind(this)).attr('width', 18).attr('height', 18).style('fill', function (d) {
        return this.color(d.title);
      }.bind(this)).on('mouseover', function (d) {
        this.highlightNode(d);
      }.bind(this)).on('mouseout', function (d) {
        this.unHighlightNode(d);
      }.bind(this));
      legend.append('text').attr('x', this.width + 120 - 24).attr('y', 9).attr('dy', '.35em').attr('class', 'legend-text').attr('data-id', function (d) {
        return 'legend-text-' + this._classNameForTitle(d.title);
      }.bind(this)).style('text-anchor', 'end').text(function (d) {
        return d.title;
      }).on('mouseover', function (d) {
        this.highlightNode(d);
      }.bind(this)).on('mouseout', function (d) {
        this.unHighlightNode(d);
      }.bind(this));
    },
    _updateTimeLine: function (data, currentSlot) {
      var time = this.data[0].data[currentSlot][0];
      this.timeLine.updatePosition({ date: time });
    },
    _onClickTimeLine: function (date, slot) {
      this._changeValue(slot);
    },
    renderGraph: function (currentSlot) {
      if (currentSlot !== undefined) {
        if (this.currentSlot !== undefined) {
          currentSlot = this.currentSlot;
        } else {
          currentSlot = this.subDataLength - 1;
        }
      }
      this._updateTimeLine(this.data, currentSlot);
      this._renderAxis(this.data);
      this._renderBalls(this.data, currentSlot);
    },
    _renderAxis: function () {
      this.svg.selectAll('.x.gridline, .x.axis, .x-grid').remove();
      this.svg.selectAll('.y.gridline, .y.axis, .y-grid').remove();
      var xAxis = Openhose.d3.svg.axis().scale(this.x).tickSize(6, 0).tickFormat(function (d) {
        return this._prettyNumber(d);
      }.bind(this)).orient('bottom');
      var yAxis = Openhose.d3.svg.axis().scale(this.y).tickFormat(function (d) {
        return this._prettyNumber(d);
      }.bind(this)).orient('left');
      // Determine location of x axis. It should be at y 0 when 0 is in the range.
      var xAxisLocation = this.height;
      if (0 > this.y.domain()[0] && 0 < this.y.domain()[1]) {
        xAxisLocation = this.y(0);
      }
      this.svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + xAxisLocation + ')').call(xAxis).append('text').attr('class', 'label').attr('x', this.width).attr('y', -6).style('text-anchor', 'end').text(this.options.xFieldName || this.xField.slice(0, 1).toUpperCase() + this.xField.slice(1) + this.appendix);
      this.svg.append('g').attr('class', 'y axis').call(yAxis).append('text').attr('class', 'label').attr('transform', 'rotate(-90)').attr('y', 6).attr('dy', '.71em').style('text-anchor', 'end').text(this.options.yFieldName || this.yField.slice(0, 1).toUpperCase() + this.yField.slice(1) + this.appendix);
      var backgroundEl = Openhose.$(this.svg[0]).find('.background')[0];
      // fetch the translations of the ticks so we can use them ourselves.
      var $svg = Openhose.$(this.svg[0]);
      var xTicks = $svg.find('.x.axis .tick.major');
      var xTicksTranslations = xTicks.map(function () {
        return this.getAttribute('transform');
      });
      var yTicks = $svg.find('.y.axis .tick.major');
      var yTicksTranslations = yTicks.map(function () {
        return this.getAttribute('transform');
      });
      // create container groups for the lines
      var xGrid = this.svg.append('g').attr('class', 'x-grid').attr('transform', 'translate(0, ' + this.height + ')');
      var yGrid = this.svg.append('g').attr('class', 'y-grid');
      // create the lines and use the translations.
      xGrid.selectAll('.x.axis .tick.major').data(xTicksTranslations).enter().append('line').attr('class', 'x gridline').attr('transform', function (d) {
        return d;
      }).attr('x2', 0).attr('y2', -this.height);
      yGrid.selectAll('.y.axis .tick.major').data(yTicksTranslations).enter().append('line').attr('class', 'y gridline').attr('transform', function (d) {
        return d;
      }).attr('x2', this.width).attr('y2', 0);
      xGrid.call(function (selection) {
        d3Extensions.moveInFront(selection, backgroundEl);
      });
      yGrid.call(function (selection) {
        d3Extensions.moveInFront(selection, backgroundEl);
      });
    },
    walkTheTimes: function () {
      var value;
      try {
        value = this.currentSlot;
      } catch (err) {
        return;
      }
      value++;
      if (value > this.subDataLength - 1) {
        value = 0;
      }
      this._changeValue(value);
      this._showTime(value);
      this.animationTimeout = setTimeout(this.walkTheTimes.bind(this), 1000);
    },
    drawArrowsBetweenDots: function (dots, color) {
      var lineStrings = [];
      var xAxisEl = Openhose.$(this.svg[0]).find('.axis')[0];
      // Filter all the dots containing nulls
      var fdots = dots.filter(function (dot) {
        return dot[1] !== null || dot[2] !== null;
      });
      if (fdots.length > 1) {
        var prevPointX = this.x(fdots[0][1]);
        var prevPointY = this.y(fdots[0][2]);
        var sliced = fdots.slice(1, fdots.length);
        for (var i in sliced) {
          var lineString = this.getArrow(prevPointX, prevPointY, this.x(sliced[i][1]), this.y(sliced[i][2]));
          lineStrings.push(lineString);
          prevPointX = this.x(sliced[i][1]);
          prevPointY = this.y(sliced[i][2]);
        }
      }
      var paths = this.svg.selectAll('.scatter-trail-arrow').data(lineStrings);
      paths.enter().append('svg:path').attr('class', 'scatter-trail-arrow').attr('opacity', '0').attr('stroke', color).attr('fill', color).attr('d', function (d) {
        return d;
      });
      paths.exit().transition().attr('opacity', '0').remove();
      paths.call(function (selection) {
        d3Extensions.moveBehind(selection, xAxisEl);
      }).transition().attr('opacity', '1').attr('stroke', color).attr('fill', color).attr('d', function (d) {
        return d;
      });
    },
    // return a arrow between 2 points in the middle.
    getArrow: function (sourceX, sourceY, targetX, targetY) {
      var d3LineLinear = Openhose.d3.svg.line().interpolate('linear');
      var points = [];
      var arrowSize = 4;
      var quarterAngle = Math.PI / 2;
      var angle = Math.atan2(targetY - sourceY, targetX - sourceX);
      var midpointsX = sourceX - (sourceX - targetX) / 2;
      var midpointsY = sourceY - (sourceY - targetY) / 2;
      var backPointX = midpointsX + Math.cos(angle - Math.PI) * arrowSize;
      var backPointY = midpointsY + Math.sin(angle - Math.PI) * arrowSize;
      // get the 90 degree angle
      var lineAngle = angle - quarterAngle;
      points.push([
        backPointX + Math.cos(lineAngle) * arrowSize,
        backPointY + Math.sin(lineAngle) * arrowSize
      ]);
      points.push([
        midpointsX,
        midpointsY
      ]);
      points.push([
        backPointX - Math.cos(lineAngle) * arrowSize,
        backPointY - Math.sin(lineAngle) * arrowSize
      ]);
      // original line
      var pointString = d3LineLinear(points);
      return pointString + 'z';
    },
    _renderBalls: function (graphData, currentSlot) {
      var animationLength = 1000;
      var height = this.height;
      var dots = this.svg.selectAll('.dot').data(graphData, function (d) {
        return d.title;
      });
      dots.enter().append('circle').attr('class', function (d) {
        return 'dot dot-' + this._classNameForTitle(d.title);
      }.bind(this)).attr('data-id', function (d) {
        return 'dot-' + this._classNameForTitle(d.title);
      }.bind(this)).attr('r', 0)  // 0 for a nice fade in effect.
.attr('cx', function (d) {
        if (!d.data[currentSlot][1])
          return;
        return this.x(d.data[currentSlot] ? d.data[currentSlot][1] : 0);
      }.bind(this)).attr('cy', function (d) {
        if (!d.data[currentSlot][2])
          return;
        return this.y(d.data[currentSlot] ? d.data[currentSlot][2] : height);
      }.bind(this)).style('fill', function (d) {
        return this.color(d.title);
      }.bind(this)).on('mouseover', function (d) {
        this.highlightNode(d);
      }.bind(this)).on('mouseout', function (d) {
        this.unHighlightNode(d);
      }.bind(this));
      dots.transition().duration(animationLength).attr('r', function (d) {
        if (!d.data[currentSlot][3])
          return this.zRange.min;
        return this.z(d.data[currentSlot] ? d.data[currentSlot][3] : this.zRange.min);
      }.bind(this)).attr('cx', function (d) {
        if (!d.data[currentSlot][1] && currentSlot === 0) {
          return 0;
        }
        // if current x not defined, hide @ previous x
        if (!d.data[currentSlot][1]) {
          return d.data[currentSlot - 1][1] ? this.x(d.data[currentSlot - 1][1]) : 0;
        }
        return this.x(d.data[currentSlot] ? d.data[currentSlot][1] : 0);
      }.bind(this)).attr('cy', function (d) {
        if (!d.data[currentSlot][2] && currentSlot === 0) {
          return height;
        }
        // if current y not defined, hide @ previous y
        if (!d.data[currentSlot][2]) {
          return d.data[currentSlot - 1][2] ? this.y(d.data[currentSlot - 1][2]) : height;
        }
        return this.y(d.data[currentSlot] ? d.data[currentSlot][2] : height);
      }.bind(this));
    },
    _renderControlsStates: function () {
    },
    destroy: function () {
      this.remove();
      clearTimeout(this.animationTimeout);
    },
    _classNameForTitle: function (title) {
      title = title.replace(/[\$\#\:\;\"\'\+\=\{\}\[\]\\\/]/g, '');
      title = title.replace(/\s+/g, '-');
      title = title.replace(/\./g, '_');
      return title;
    },
    _togglePlay: function () {
      if (this.playing) {
        // pause
        this.animateButton.attr('class', 'icon play');
        clearTimeout(this.animationTimeout);
        this.playing = false;
      } else {
        // start playing
        this.animateButton.attr('class', 'icon pause');
        this.removeHistoryDots();
        this.walkTheTimes();
        this.playing = true;
      }
    },
    _changeValue: function (currentSlot) {
      this.currentSlot = currentSlot;
      this.renderGraph(currentSlot);
    },
    _showTime: function (slice) {
    },
    getLocationForDot: function (id) {
      var dot = this.svg.selectAll(id)[0];
      if (!dot) {
        // cannot find dot
        return {};
      }
      dot = dot[0];
      var dotLocation = {};
      var dotOffset = Openhose.$(dot).offset();
      var dotSize = dot.getBoundingClientRect();
      dotLocation.left = dotOffset.left;
      dotLocation.right = dotOffset.left + dotSize.width;
      dotLocation.top = dotOffset.top;
      dotLocation.bottom = dotOffset.top + dotSize.height;
      dotLocation.width = dotSize.width;
      dotLocation.height = dotSize.height;
      return dotLocation;
    },
    toolTipsForNode: function (data) {
      var dotLocation = this.getLocationForDot('[data-id=dot-' + this._classNameForTitle(data.title) + ']');
      var templateData = { 'data': data.data[this.currentSlot] };
      templateData.title = data.title;
      templateData.xField = this.xField;
      templateData.yField = this.yField;
      if (this.xField == this.zField) {
        templateData.zField = false;
      } else {
        templateData.zField = this.zField;
      }
      templateData.scatter = this;
      Openhose.d3.select('body').select('.tooltip-container').append('div').style('position', 'fixed').style('z-index', '100').style('top', dotLocation.top + Math.round(dotLocation.height / 2) - 12 + 'px').style('left', dotLocation.right + 4 + 'px').attr('class', 'tooltip tooltip-' + this._classNameForTitle(data.title)).html(function () {
        return Openhose._.template(dotToolTipTemplate)(templateData);
      }.bind(this));
    },
    removeToolTipsForNode: function (data) {
      Openhose.$('.tooltip-' + this._classNameForTitle(data.title)).remove();
      Openhose.$('.tooltip-history-' + this._classNameForTitle(data.title)).remove();
    },
    highlightNode: function (d) {
      if (this.playing) {
        return;
      }
      var faded = '0.2';
      var xAxisEl = Openhose.$(this.svg[0]).find('.axis')[0];
      //this.showHistoryDots(d);
      this.drawArrowsBetweenDots(d.data, this.color(d.title));
      this.svg.selectAll('.history-path-' + this._classNameForTitle(d.title)).call(function (selection) {
        d3Extensions.moveBehind(selection, xAxisEl);
      }).attr('opacity', '0.7');
      // fade out all dots, except the current one.
      this.svg.selectAll('.dot:not([data-id=dot-' + this._classNameForTitle(d.title) + '])').attr('opacity', faded);
      // move current dot to the front.
      this.svg.selectAll('[data-id=dot-' + this._classNameForTitle(d.title) + ']').call(function (selection) {
        d3Extensions.moveBehind(selection, xAxisEl);
      });
      this.svg.selectAll('.legend-rect:not([data-id=legend-rect-' + this._classNameForTitle(d.title) + '])').transition().attr('opacity', faded);
      this.svg.selectAll('.legend-text:not([data-id=legend-text-' + this._classNameForTitle(d.title) + '])').transition().attr('opacity', faded);
      this.toolTipsForNode(d);
      this.showTrail(d);
    },
    removeTrails: function () {
      this.svg.selectAll('.scatter-dottrail').transition().attr('opacity', '0').remove();
    },
    showTrail: function (data) {
      var line = Openhose.d3.svg.line().x(function (d) {
        return this.x(d[1]);
      }.bind(this)).y(function (d) {
        return this.y(d[2]);
      }.bind(this)).interpolate('linear').defined(function (d) {
        return d[1] !== null && d[2] !== null;
      });
      var lineData = data.data.map(function (v, i, a) {
        if (i >= a.length)
          return;
        return [
          v,
          a[i + 1]
        ];
      });
      lineData.pop();
      // last item is always undefined
      var trails = this.svg.selectAll('.scatter-dottrail').data(lineData);
      trails.enter().append('path').attr('class', 'scatter-dottrail').attr('opacity', 0);
      trails.attr('stroke', function (d, i) {
        // lighter or darker depending on time frame
        if (i < this.currentSlot) {
          return this.brighterStepColor(this.color(data.title), this.currentSlot, this.currentSlot - i);
        } else {
          return this.darkerStepColor(this.color(data.title), data.data.length - this.currentSlot, data.data.length - this.currentSlot - i);
        }
      }.bind(this)).attr('d', function (d) {
        return line(d);
      }).call(function (selection) {
        d3Extensions.moveInFront(selection, $(this).closest('svg').find('.x-grid')[0]);
      }).transition().attr('opacity', 1);
      trails.exit().transition().attr('opacity', 0).remove();
    },
    unHighlightNode: function (d) {
      this.svg.selectAll('.dot:not([data-id=dot-' + this._classNameForTitle(d.title) + '])').attr('opacity', '1');
      this.svg.selectAll('.legend-rect:not([data-id=legend-rect-' + this._classNameForTitle(d.title) + '])').transition().attr('opacity', '1');
      this.svg.selectAll('.legend-text:not([data-id=legend-text-' + this._classNameForTitle(d.title) + '])').transition().attr('opacity', '1');
      this.removeToolTipsForNode(d);
      this.removeHistoryDots();
      this.removeTrails();
    },
    removeHistoryDots: function () {
      var dots = [];
      var histdots = this.svg.selectAll('.history-dot').data(dots);
      histdots.exit().attr('opacity', '0').remove();
      this.drawArrowsBetweenDots([]);
    },
    showHistoryDots: function (data) {
      var startSlot = Math.min(this.currentSlot - 2, this.currentSlot);
      var endSlot = Math.max(this.currentSlot + 2, this.currentSlot);
      var start = data.data.slice(startSlot, this.currentSlot);
      var end = data.data.slice(this.currentSlot + 1, endSlot + 1);
      var dots = start.concat(end);
      var xAxisEl = Openhose.$(this.svg[0]).find('.axis')[0];
      var histdots = this.svg.selectAll('.history-dot').data(dots);
      histdots.enter().append('circle').attr('opacity', '0').style('stroke', 'black').attr('class', 'history-dot').attr('cx', function (d) {
        return this.x(d[1]);
      }.bind(this)).attr('cy', function (d) {
        return this.y(d[2]);
      }.bind(this));
      histdots.exit().attr('opacity', '0').remove();
      histdots.call(function (selection) {
        d3Extensions.moveBehind(selection, xAxisEl);
      }).transition()  //.attr("r", function(d, i) { return this.z(d[3]); }.bind(this))
.attr('r', 4).attr('opacity', '1').attr('id', 'history-dot').attr('cx', function (d) {
        return this.x(d[1]);
      }.bind(this)).attr('cy', function (d) {
        return this.y(d[2]);
      }.bind(this)).style('fill', function (d, i) {
        if (i < dots.length / 2) {
          return this.brighterStepColor(this.color(data.title), dots.length / 2, dots.length / 2 - i);
        } else {
          return this.darkerStepColor(this.color(data.title), dots.length / 2, dots.length / 2 - i);
        }
      }.bind(this));
    },
    darkerStepColor: function (startColor, range, count) {
      var hslColor = Openhose.d3.hsl(startColor);
      var step = hslColor.l / range;
      // amount per step
      hslColor.l = hslColor.l + step * count;
      return hslColor;
    },
    brighterStepColor: function (startColor, range, count) {
      var hslColor = Openhose.d3.hsl(startColor);
      var step = (0.9 - hslColor.l) / range;
      // diff to full l, divided by range
      hslColor.l = hslColor.l + step * count;
      return hslColor;
    },
    _prettyNumber: function (number) {
      if (!number) {
        if (!number) {
          return '';
        }
      }
      if (number > 980000 || number < -980000) {
        return Openhose.d3.format(this.options.format)(Math.round(number / 1000 / 1000)) + 'mm';
      }
      if (number > 10000 || number < -10000) {
        return Openhose.d3.format(this.options.format)(Math.round(number / 1000)) + 'k';
      }
      return Openhose.d3.format(this.options.format)(number);
    }
  });
  // non instance functions.
  View.validate = function (metrics, dimensions) {
    var validated = false;
    var error = null;
    // embed does one dimension, one metric
    if (metrics.length === 1 && dimensions.length === 1) {
      validated = true;
    }
    // tab graph does not pass a dimension, but multiple metrics
    if (metrics.length > 1 && dimensions.length === 0) {
      validated = true;
    }
    if (!validated) {
      error = 'Motions Scatter needs one metrics and one dimension. Or multiple metrics and no dimensions.';
    }
    return [
      validated,
      error
    ];
  };
  return View;
}(core, text_templates_dot_tool_tiphtml, text_templates_history_dot_tool_tiphtml, visualization_lib_d3extensions);
visualization_lib_gauge = function (container, configuration) {
  var that = {};
  var config = {
    size: 200,
    clipWidth: 200,
    clipHeight: 310,
    ringInset: 20,
    ringWidth: 20,
    align: 'center',
    pointerWidth: 10,
    pointerTailLength: 5,
    pointerHeadLengthPercent: 0.9,
    minValue: 0,
    maxValue: 100,
    minAngle: -140,
    maxAngle: 140,
    transitionMs: 750,
    majorTicks: 81,
    labelFormat: Openhose.d3.format(',g'),
    labelInset: 10,
    arcColorFn: Openhose.d3.interpolateHsl(Openhose.d3.rgb('#e8e2ca'), Openhose.d3.rgb('#3e6c0a')),
    tickLabelEnable: false
  };
  var range;
  var r;
  var pointerHeadLength;
  var svg;
  var arc;
  var scale;
  var ticks;
  var tickData;
  var pointer;
  function deg2rad(deg) {
    return deg * Math.PI / 180;
  }
  function configure(configuration) {
    var prop;
    for (prop in configuration) {
      config[prop] = configuration[prop];
    }
    range = config.maxAngle - config.minAngle;
    r = config.size / 2;
    pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);
    // a linear scale that maps domain values to a percent from 0..1
    scale = Openhose.d3.scale.linear().range([
      0,
      1
    ]).domain([
      config.minValue,
      config.maxValue
    ]);
    ticks = scale.ticks(config.majorTicks);
    tickData = Openhose.d3.range(config.majorTicks).map(function () {
      return 1 / config.majorTicks;
    });
    arc = Openhose.d3.svg.arc().innerRadius(r - config.ringWidth - config.ringInset).outerRadius(r - config.ringInset).startAngle(function (d, i) {
      var ratio = d * i;
      return deg2rad(config.minAngle + ratio * range);
    }).endAngle(function (d, i) {
      var ratio = d * (i + 1);
      return deg2rad(config.minAngle + ratio * range + 0.5);  // add 0.5 to get rid of the lines betweeen segments
    });
  }
  that.configure = configure;
  function centerTranslation() {
    if (config.align == 'left') {
      return 'translate(' + r + ',' + r + ')';
    } else {
      var xPos = config.clipWidth / 2;
      var yPos = config.clipHeight / 2;
      return 'translate(' + xPos + ', ' + yPos + ')';
    }
  }
  function isRendered() {
    return svg !== undefined;
  }
  that.isRendered = isRendered;
  function render(newValue) {
    svg = Openhose.d3.select(container).append('svg:svg').attr('class', 'gauge').attr('width', config.clipWidth).attr('height', config.clipHeight);
    var group = svg.append('g').attr('transform', centerTranslation());
    var arcs = group.append('g').attr('class', 'arc');
    arcs.selectAll('path').data(tickData).enter().append('path').attr('fill', function (d, i) {
      return config.arcColorFn(d * i);
    }).attr('d', arc);
    var lg = group.append('g').attr('class', 'label');
    if (config.tickLabelEnable) {
      lg.selectAll('text').data(ticks).enter().append('text').attr('transform', function (d) {
        var ratio = scale(d);
        var newAngle = config.minAngle + ratio * range;
        return 'rotate(' + newAngle + ') translate(0,' + (config.labelInset - r) + ')';
      }).text(config.labelFormat);
    }
    var lineData = [
      [
        config.pointerWidth / 2,
        0
      ],
      [
        0,
        -pointerHeadLength
      ],
      [
        -(config.pointerWidth / 2),
        0
      ],
      [
        0,
        config.pointerTailLength
      ],
      [
        config.pointerWidth / 2,
        0
      ]
    ];
    var pointerLine = Openhose.d3.svg.line().interpolate('monotone');
    var pg = group.append('g').data([lineData]).attr('class', 'pointer');
    pointer = pg.append('path').attr('d', pointerLine).attr('transform', 'rotate(' + config.minAngle + ')');
    update(newValue === undefined ? 0 : newValue);
  }
  that.render = render;
  function update(newValue, newConfiguration) {
    if (newConfiguration !== undefined) {
      configure(newConfiguration);
    }
    var ratio = scale(newValue);
    var newAngle = config.minAngle + ratio * range;
    pointer.transition().duration(config.transitionMs).ease('elastic').attr('transform', 'rotate(' + newAngle + ')');
  }
  that.update = update;
  configure(configuration);
  return that;
};
visualization_gauge = function (Openhose, Gauge) {
  var View = Openhose.Backbone.View.extend({
    className: 'visualization gauge',
    redToGray: Openhose.d3.interpolateHsl(Openhose.d3.rgb('#ff0000'), Openhose.d3.rgb('#dddddd')),
    grayToGreen: Openhose.d3.interpolateHcl(Openhose.d3.rgb('#dddddd'), Openhose.d3.rgb('#00ff00')),
    // Options available:
    // ==================
    //
    // events             Backbone events
    // arcColorFn         Function that should return a color given a range of 0..1
    // data               Number
    // width
    // height
    // convertFn          Data pre processor.
    // onRender           callback called after render.
    initialize: function (options) {
      this.options = options || {};
      if (options.events)
        this.events = Openhose._.extend(this.events, options.events);
      this.data = options.data;
      this.options.arcColorFn = this.options.arcColorFn || function arcColorFn(x) {
        // take a value of 0.0..1.0 and return a color
        if (x < 0.5) {
          return this.redToGray(x * 2);
        } else {
          return this.grayToGreen((x - 0.5) * 2);
        }
      }.bind(this);
    },
    //updateData: function(data) {
    //  this.data = this.processData();
    //  this.render();
    //},
    render: function () {
      var width = this.options.width || this.$el.width() || 100;
      var height = this.options.height || this.$el.height() || 100;
      var maxSize = Math.min(width, height);
      this.options.size = maxSize;
      this.options.clipWidth = width;
      this.options.clipHeight = height;
      var value = this.options.convertFn ? this.options.convertFn(this.data) : this.data;
      var $element = Openhose.$('<div />')[0];
      var g = Gauge($element, this.options);
      g.render();
      g.update(value);
      this.$el.html($element);
      this.options.onRender && this.options.onRender();
    },
    destroy: function () {
      this.remove();
    }
  });
  return View;
}(core, visualization_lib_gauge);
visualization_distribution = function (Openhose) {
  return Openhose.Backbone.View.extend({
    className: 'visualization distribution',
    legendItemTemplate: '<span class="legend-color" style="background-color: <%= color %>"></span> <%= data.label %>',
    defaults: {
      height: '5px',
      lineHeight: '32px',
      colors: Openhose.d3.scale.category20(),
      enableLabels: true,
      transitionDuration: 1000  // set to 0 to turn off
    },
    // Options available:
    // ==================
    //
    // events                 Backbone events
    // enableLabels           Show percentage labels
    // colors                 d3 color scheme
    // height                 Widget size
    // lineHeight             Where the text will show
    // transitionDuration     Duration of transition in ms. Default 1000, set to 0 to turn off
    initialize: function (options) {
      this.options = Openhose._.defaults(options, this.defaults);
      this.data = options.data;
      this.noDataColors = function () {
        return '#f2f1ed';
      };
    },
    render: function () {
      var self = this;
      var color = this.options.colors || this.defaults.colors;
      var total = this._calculateTotal();
      if (!total) {
        color = this.noDataColors;
        this.data = {
          'values': [{
              'label': 'No Data',
              'value': 100
            }]
        };
        total = 100;
      }
      function textTransition(selection) {
        if (!self.options.enableLabels) {
          return function noOp() {
          };  // no-op function
        }
        selection.tween('text', function (d) {
          // if we ever get updates, this 0 needs to be what it is in the DOM.
          var i = Openhose.d3.interpolateRound(0, x(d.value));
          return function (t) {
            Openhose.d3.select(this).select('span').text(i(t) + '%');
          };
        });
      }
      var x = Openhose.d3.scale.linear().domain([
        0,
        total
      ]).range([
        0,
        100
      ]);
      this.$el.height(this.options.height);
      var sections = Openhose.d3.select(this.$el[0]).selectAll('div').data(this.data.values);
      sections.enter().append('div').attr('class', 'distribution-section').style('background-color', function (d) {
        return color(d.label);
      }).style('height', this.options.height).style('width', 0).style('display', 'inline-block').style('line-height', this.options.lineHeight);
      if (this.options.enableLabels) {
        var subSection = sections.append('span');
        subSection.text('0%');
      }
      sections.transition().duration(this.options.transitionDuration).style('width', function (d) {
        return x(d.value) + '%';
      }).call(textTransition);
      sections.exit().remove();
    },
    _calculateTotal: function () {
      var segments = this.data.values;
      return Openhose._.reduce(segments, function (total, segment) {
        return total + segment.value;
      }, 0);
    },
    destroy: function () {
      this.remove();
    }
  });
}(core);
visualization_bar_chart = function (Openhose, Utils) {
  var View = Openhose.Backbone.View.extend({
    className: 'visualization bar',
    // Options available:
    // ==================
    //
    // events             backbone events
    //
    // colors             d3 color scheme
    // formatter          Number formatter function
    // groupedColors      Pick colors per group
    // isComparison       Show percentage change
    // barStyler          callback called whit d3 arguments (d,i,j) on each bar
    defaults: {
      groupedColors: true,
      isComparison: undefined
    },
    initialize: function (options) {
      this.options = _.extend({}, this.defaults, options);
      if (options.events)
        this.events = _.extend(this.events, options.events);
      this.data = options.data;
      this._colors = this.options.colors || d3.scale.category20c();
      this.formatter = options.formatter || Openhose.d3.format(',3');
    },
    _formatData: function (data) {
      data = _.clone(data);
      // shallow copy. don't modify original data
      function compare(a, b) {
        if (!a.period || !b.period) {
          return 0;
        }
        // no period, can't sort
        if (a.period.get('start') > b.period.get('start')) {
          return -1;
        } else if (a.period.get('start') > b.period.get('start')) {
          return 1;
        }
        // a must be equal to b
        return 0;
      }
      data.sort(compare).reverse();
      var newData = [];
      data.forEach(function (d) {
        d.values.map(function (d2, i) {
          var segment = newData[i];
          if (segment === undefined) {
            segment = [];
            newData[i] = segment;
          }
          segment.push({
            label: d2.label,
            value: d2.value,
            period: d.period
          });  // copy
        });
      });
      if (this.options.isComparison) {
        newData = this._formatForComparison(newData);
      }
      return newData;
    },
    _formatForComparison: function (data) {
      // set diff labels.
      data.map(function (d) {
        for (var i = 1; i < d.length; i++) {
          var diff = 100 - d[i - 1].value / d[i].value * 100;
          diff = Utils.round(diff, 1);
          var diffLabel = Math.abs(diff).toString();
          if (diffLabel == 'Infinity') {
            diffLabel = '\u221E';
          } else if (diffLabel === '0') {
            diffLabel = '';
          } else {
            diffLabel += '%';
          }
          d[i].diffLabel = diffLabel;
          if (diff < 0) {
            d[i].class = 'down';
          } else if (diff > 0) {
            d[i].class = 'up';
          } else {
            d[i].class = 'no-change';
          }
        }
      });
      return data;
    },
    color: function (d, i, j) {
      if (this.options.groupedColors) {
        return this._colors(i);
      } else {
        return this._colors(d.label);
      }
    },
    resize: function () {
      this.render();
    },
    render: function () {
      var self = this;
      var data = this.data.values;
      if (!data || !data[0] || !data[0].values.length || !data[0].values[0] || !data[0].values[0].value) {
        this.trigger('noData');
        return this.$el.empty();
      }
      if (this.options.isComparison === undefined) {
        // only take from data when explicitly not set.
        this.options.isComparison = this.data.isComparison;
      }
      var container = d3.select(this.el);
      var formattedData = this._formatData(data);
      this.formattedData = formattedData;
      var percentageOfTotal;
      var max = d3.max(data, function (d) {
        return d3.max(d.values, function (d2) {
          return d2.value;
        });
      });
      var segmentCount = formattedData.length;
      var inSegmentCount = data.length;
      var y = d3.scale.linear().domain([
        0,
        max
      ]).range([
        0,
        100
      ]);
      var x = d3.scale.ordinal().domain(d3.range(segmentCount)).rangeBands([
        0,
        100
      ]);
      var inX = d3.scale.ordinal().domain(d3.range(inSegmentCount)).rangeBands([
        0,
        100
      ], 0.1);
      var segmentWidth = x.rangeBand() + '%';
      var inSegmentWidth = inX.rangeBand() + '%';
      if (this.data.totalVolume) {
        percentageOfTotal = d3.scale.linear().domain([
          0,
          this.data.totalVolume
        ]).range([
          0,
          100
        ]);
      }
      var bars = container.append('div').attr('class', 'bars');
      var segments = bars.selectAll('.column').data(formattedData);
      segments.enter().append('div').attr('class', 'column').style('width', segmentWidth).on('mouseenter', function (data, i, j) {
        self.showHover(this, data, i, j);
      }).on('mouseleave', function () {
        self.removeHover(this);
      });
      var bars = segments.selectAll('.bar-bar').data(function (d) {
        return d;
      }).enter().append('div').attr('class', 'bar-bar').style('width', inSegmentWidth).style('height', function (d) {
        return y(d.value) + '%';
      }).style('background-color', function (d, i, j) {
        return self.color(d, i, j);
      }).each(function (d, i, j) {
        var content = document.createElement('div');
        if (self.options.isComparison) {
          content.innerHTML = d.diffLabel || '';
        } else {
          content.innerHTML = d.label || '';
        }
        content.classList.add('bar-label');
        if (d.class) {
          content.classList.add(d.class);
        }
        this.appendChild(content);
        // needs to be in the DOM before can get heights.
        var contentHeight = content.getBoundingClientRect().height;
        if (y(d.value) < contentHeight) {
          content.classList.add('ontop');
          content.style.top = -contentHeight + 'px';
        }
        if (self.data.images) {
          var labelContent = document.createElement('div');
          labelContent.innerHTML = '<img class="bar-image" src="' + self.data.images[j] + '">';
          content.insertBefore(labelContent, content.childNodes[0]);
        }
      }).each(function () {
        if (self.options.barStyler) {
          self.options.barStyler.apply(this, arguments);
        }
      });
      var labels = container.append('div').attr('class', 'labels');
      labels.selectAll('.group-labels').data(this.data.labels || []).enter().append('div').attr('class', 'group-label').style('width', segmentWidth).html(function (d) {
        return d;
      });
    },
    removeHover: function (element) {
      this.$('.hover-container').remove();
      this.$('.hover-line').remove();
    },
    showHover: function (element, data, i, j) {
      var self = this;
      var groupBB = element.getBoundingClientRect();
      var left = groupBB.left - element.parentNode.getBoundingClientRect().left;
      var label = '';
      label += '<div class="hover-line" style="left: ' + (left - 1) + 'px"></div>';
      label += '<div class="hover-container" style="left: ' + left + 'px">';
      label += '<table class="hover-table">';
      // header
      var prevTime = 0;
      // items
      data.forEach(function (item, i) {
        if (item.period && item.period.get('start') !== prevTime) {
          prevTime = item.period.get('start');
          label += '<tr>';
          label += '<th colspan="2">' + item.period.getBucketDescription() + '</th>';
          label += '</tr>';
        }
        label += '<tr class="hover-item">';
        // add color
        label += '<td class="hover-label" style="color:' + self.color(item, i) + '">' + item.label + '</td>';
        label += '<td>' + self.formatter(item.value) + '</td>';
        label += '</tr>';
      });
      label += '</table></div>';
      this.el.insertAdjacentHTML('beforeend', label);
      // do we need to flip it?
      var hoverContainer = this.$('.hover-container');
      var labelBB = hoverContainer[0].getBoundingClientRect();
      var containerBB = this.el.getBoundingClientRect();
      if (labelBB.right > containerBB.right) {
        hoverContainer.css('left', containerBB.width - labelBB.width + 'px');
      }
    },
    destroy: function () {
      this.remove();
    }
  });
  return View;
}(core, lib_utils);
visualization_main = function (Openhose, Number, LeaderBoard, Pie, Line, Area, StackedBar, TimeLine, Table, MotionScatter, Gauge, Distribution, Bar) {
  var subModules = {};
  subModules.Number = Number;
  subModules.LeaderBoard = LeaderBoard;
  subModules.Pie = Pie;
  subModules.Line = Line;
  subModules.TimeLine = TimeLine;
  subModules.Area = Area;
  subModules.StackedBar = StackedBar;
  subModules.Table = Table;
  subModules.MotionScatter = MotionScatter;
  subModules.Gauge = Gauge;
  subModules.Distribution = Distribution;
  subModules.Bar = Bar;
  Openhose.Visualization = subModules;
  return Openhose.Visualization;
}(core, visualization_number, visualization_leaderboard, visualization_pie, visualization_line, visualization_area, visualization_stacked_bar, visualization_time_line, visualization_table, visualization_motion_scatter, visualization_gauge, visualization_distribution, visualization_bar_chart);
processor_analytics_mixin = function (Openhose, Utils) {
  return {
    _offsetByOneBucket: function (timeline, period) {
      return (timeline || []).map(function (v) {
        // add one bucket to the timestamp.
        period = period || this.period;
        v[0] = period.incrementMomentByBucket(Openhose.moment(v[0]).tz(period.timezone()));
        return v;
      }.bind(this));
    },
    _alignSegments: function (alignMetrics, segments) {
      // TODO: remove invocation of _alignSegments
      return segments;
    },
    _fillMissingGaps: function (period, values) {
      return values;  // Seems like this is not needed anymore:
                      //
                      // if (!values.length) {
                      //   // give it a starting value
                      //   values = [[period.timeframe().start, 0, 0]];
                      //   console.warn("got an empty metric, zeroing it out.", values);
                      // }
                      // if (!values.length) return values;
                      // var numberOfSummaries = period.getNumSummariesToFetch();
                      // if (numberOfSummaries == values.length) {
                      //   return values;
                      // }
                      // var bucketTs = period.getBucketMs();
                      // var firstTs = Openhose.moment(values[0][0]).tz(period.timezone());
                      // var nextTs = period.toMoments().start;
                      // var bucket = period.getBucket();
                      // if (bucket == 'day') {
                      //   nextTs.hour(firstTs.hour()).startOf('hour');
                      // } else if(bucket == 'hour') {
                      //   nextTs.startOf('hour');
                      // }
                      // nextTs = nextTs.valueOf();
                      // //because the api doesn't always return timestamps with the same interval (DST)
                      // //we attempt to make it a range to protect against that
                      // var isWithInRange = function(wantedValue){
                      //   var min = wantedValue - bucketTs/4;
                      //   var max = wantedValue + bucketTs/4;
                      //   return Openhose._.find(values, function(i){
                      //     return max > i[0] && min < i[0];
                      //   });
                      // };
                      // var results = [];
                      // var v;
                      // var rangeFailureCount = 0;
                      // for(var i = 0; i < numberOfSummaries; i++) {
                      //   v = isWithInRange(nextTs);
                      //   if (v) {
                      //     results.push(v);
                      //   } else {
                      //     rangeFailureCount++;
                      //     results.push([nextTs, 0, 0]);
                      //   }
                      //   nextTs = nextTs + bucketTs;
                      // }
                      // return  Openhose._.sortBy(results, function(v){ return v[0]; });
    },
    timelineSegmentsForDimension: function (dimensions, options) {
      var segments = [];
      var context = options.context;
      var doOffsetOneBucket = options.doOffsetOneBucket || true;
      dimensions[0].metrics.forEach(function (metric) {
        var timeline = metric.timeline();
        var values = this._fillMissingGaps(metric.period, timeline);
        values = doOffsetOneBucket ? this._offsetByOneBucket(values, metric.period) : values;
        segments.push({
          label: metric.getLabel({ context: context }),
          values: values,
          period: metric.period
        });
      }.bind(this));
      return this._alignSegments(dimensions[0].metrics, segments);
    },
    _psychProfileSegments: function (callback) {
      this.metrics[0].zeroFillPsychHeatmap();
      var metrics = bn.utils.analytics.metricsByCategory('social-media', 'Psych');
      var metricNames = [
        'affection',
        'glory',
        'positive_affect',
        'restraint',
        'expressive_beh',
        'moral_imperative',
        'anxiety',
        'aggression',
        'sadness',
        'social_behavior'
      ];
      var segments = [];
      for (var level1key in metrics) {
        var level1children = metrics[level1key].children;
        if (level1children) {
          for (var level2key in level1children) {
            if (metricNames.indexOf(level2key) !== -1) {
              var metric = level1children[level2key];
              var segment;
              metric.metricId = level1key + '-' + level2key;
              metric.parentKey = level1key;
              if (callback && typeof callback == 'function') {
                segment = callback.call(this, metric);
              } else {
                segment = metric;
              }
              segments.push(segment);
            }
          }
        }
      }
      return segments.reverse();
    },
    // TODO: replace Special Exceptions with something more generic
    _timelineSegmentsForMetrics: function (metrics, options) {
      var doOffsetOneBucket = options.doOffsetOneBucket || true;
      metrics = metrics || this.metrics;
      var segments = [];
      //var filledMetric;
      // Special exception
      // if(metrics[0] && metrics[0].get('metricId') == 'sentimentHeatmap') {
      //
      //   metrics[0].zeroFillSentimentHeatmap();
      //   for(var i = -18; 18 >= i; i++) {
      //     if (!i) continue;
      //     filledMetric = this._fillMissingGaps(metrics[0].period, metrics[0].timeline('s' + i));
      //     segments.push({
      //       label: i + '',
      //       values: doOffsetOneBucket ? this._offsetByOneBucket(filledMetric) : filledMetric
      //     });
      //   }
      //   return this._alignSegments(metrics, segments);
      // }
      //
      // // Special exception 2
      // if (metrics[0] && metrics[0].get('metricId') == 'psychProfile') {
      //   segments = this._psychProfileSegments(function(metric) {
      //     filledMetric = this._fillMissingGaps(this.metrics[0].period, this.metrics[0].timeline(metric.metricId));
      //     return {
      //       label: metric.label,
      //       info: metric,
      //       values: doOffsetOneBucket ? this._offsetByOneBucket(filledMetric) : filledMetric
      //     };
      //   });
      //
      //   return this._alignSegments(metrics, segments);
      // }
      //
      // // Special exception 3
      // if(metrics[0] && metrics[0].get('metricId') == 'psychHeatmap') {
      //
      //   metrics[0].zeroFillPsychHeatmap();
      //
      //   var addPsych = function(info, metricId, parentKey) {
      //     info.metricId = metricId;
      //     info.parentKey = parentKey;
      //     segments.push({
      //       label: info.label,
      //       info: info,
      //       values: this._fillMissingGaps(metrics[0].period, metrics[0].timeline(metricId))
      //     });
      //   }.bind(this);
      //
      //   var psychMetrics = bn.utils.analytics.metricsByCategory('social-media', 'Psych');
      //   for (var level1key in psychMetrics) {
      //     addPsych(psychMetrics[level1key], level1key);
      //     if (psychMetrics[level1key].children) {
      //       for (var level2key in psychMetrics[level1key].children) {
      //         addPsych(psychMetrics[level1key].children[level2key], level1key+'-'+level2key, level1key);
      //         if (psychMetrics[level1key].children[level2key].children) {
      //           for (var level3key in psychMetrics[level1key].children[level2key].children) {
      //             addPsych(psychMetrics[level1key].children[level2key].children[level3key], level1key+'-'+level2key+'-'+level3key);
      //           }
      //         }
      //       }
      //     }
      //   }
      //
      //   return this._alignSegments(metrics, segments);
      // }
      var context = options.context;
      metrics.forEach(function (metric, i) {
        var tl = metric.timeline();
        var values = this._fillMissingGaps(metric.period, tl);
        if (metric.relativeMap) {
          this._fillRelativeValues(values, metric);
        }
        values = doOffsetOneBucket ? this._offsetByOneBucket(values, metric.period) : values;
        var segment = {
          label: metric.getLabel({ context: context }),
          period: metric.period,
          // TODO: do this for the other segments (above) too
          relativeValues: metric.relativeValues,
          values: values
        };
        if (metric.get('previousPeriod') && metric.collection.length) {
          //TODO: investigate if this fromISO isn't error prone, use moment instead
          var prevTs = Utils.fromISO(metric.collection.at(0).get('timestamp'));
          var currentTs = Utils.fromISO(metrics[i - 1].collection.at(0).get('timestamp'));
          segment.timeDelta = currentTs - prevTs;
          segment.isHistory = true;
          var moments = metric.period.toPreviousMoments();
          segment.label = segment.label + ' ' + Utils.getShortTimeRangeLabel(moments.start, moments.end);
        }
        segments.push(segment);
      }.bind(this));
      return this._alignSegments(metrics, segments);
    },
    _fillRelativeValues: function (values, metric) {
      var relativeValues = [];
      var tsMap = {};
      Object.keys(metric.relativeMap).map(function (x) {
        tsMap[Date.parse(x)] = metric.relativeMap[x];
      });
      for (var i = 0; i < values.length; i++) {
        var totalValue = tsMap[values[i][0].toString()];
        if (totalValue !== undefined) {
          relativeValues.push(values[i][1] / totalValue[metric.metricId]);
        } else {
          relativeValues.push(0);
        }
      }
      metric.relativeValues = relativeValues;
      return relativeValues;
    },
    _getLabelPrevious: function (timeline, metric, context) {
      if (!timeline.length) {
        return metric.getLabel({ context: context });
      }
      var prev = this.period.timeframePreviousPeriod();
      var start = Openhose.moment(prev.start).tz(this.period.timezone());
      var end = Openhose.moment(prev.end).tz(this.period.timezone());
      var label = bn.utils.getShortTimeRangeLabel(start, end);
      return metric.getLabel({ context: context }) + ' ' + label;
    },
    _segmentsForDimension: function () {
      var segments = [];
      this.dimensions.forEach(function (dim) {
        var segment = [];
        dim.collection.forEach(function (summary) {
          summary = summary.toJSON ? summary.toJSON() : summary;
          if (this.options.filter && !this.options.filter(summary)) {
            return false;
          }
          var secondaryValues = {};
          var metricIds = dim.options.metrics;
          // start at second because the first one is already used for the value, rest goes into secondaryValues
          for (var i = 1; i < metricIds.length; i++) {
            var metric = metricIds[i];
            secondaryValues[metric] = summary[metric];
          }
          segment.push({
            label: dim.getLabelForSummary(summary),
            value: summary[metricIds[0]],
            secondaryValues: secondaryValues
          });
        }.bind(this));
        segments.push({
          values: segment,
          period: dim.period
        });
      }.bind(this));
      // apply totals  FIXME, totals are needed for all dimensions
      var totals = {};
      this.dimensions[0].get('metrics').forEach(function (metric) {
        totals[metric] = this.dimensions[0].get('totals')[metric];
      }.bind(this));
      this.totalVolume = totals;
      return segments;
    },
    _segmentsForMetrics: function (metrics, options) {
      metrics = metrics || this.metrics;
      options = options || this.options || {};
      var segments = [];
      var context = options.context;
      metrics.forEach(function (metric) {
        segments.push({
          label: metric.getLabel({ context: context }),
          value: metric.total()
        });
      });
      return segments;
    },
    _tableSegmentsForMetrics: function (metrics, options) {
      options = options || {};
      var segments = [];
      if (metrics[0] && metrics[0].get('metricId') == 'psychProfile') {
        segments = this._psychProfileSegments(function (metric) {
          return {
            label: metric.label,
            info: metric,
            value: this.metrics[0].total(metric.metricId)
          };
        });
      } else {
        segments = this._segmentsForMetrics(metrics, options);
      }
      return segments;
    },
    _tableSegmentsForDimension: function (dimensions, options) {
      var orderedMapping = {};
      var context = options.context;
      if (options.columns) {
        // Clone so it doesn't interfere with view options
        options.columns.forEach(function (data) {
          var column = Openhose._.clone(data);
          var id = column.id;
          if (!column.metricId)
            column.metricId = column.id;
          orderedMapping[id] = column;
        });
      }
      // Just so we can have nice labels
      var tempMetrics = dimensions[0].get('metrics').map(function (metric) {
        return new Openhose.Models.Metric({
          ids: [metric],
          stream: dimensions[0].stream,
          period: dimensions[0].period
        });
      }.bind(this));
      tempMetrics.forEach(function (metric) {
        var mapping = {
          id: metric,
          label: metric.getLabel({ context: context }),
          metricId: metric.get('metricId')
        };
        // Reverse merge so metrics can be overwritten with custom values in columns hash
        // but will still be filled with additional info if needed
        orderedMapping[metric.get('metricId')] = Openhose._.extend(mapping, orderedMapping[metric] || {});
      }.bind(this));
      var tableData = dimensions[0].table(orderedMapping, {
        minValue: options.minValue || 1,
        filter: options.filter
      });
      if (!tableData || !tableData.values.length) {
        return false;
      }
      // add previous
      if (dimensions[1] && dimensions[1].get('previousPeriod')) {
        tableData.previousDimension = dimensions[1];
      }
      return tableData;
    },
    zeroFill: function (data) {
      for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].data.length; j++) {
          if (isNaN(data[i].data[j].x)) {
            throw new Error('NaN timestamp detected, quitting');
          }
        }
      }
      Openhose.Rickshaw.Series.zeroFill(data);
    }
  };
}(core, lib_utils);
processor_number = function (Openhose) {
  var processData = function (metric) {
    var summaryFn = this.options.summaryFn;
    if (this.options.average === true) {
      return metric.average();
    }
    // Temp hack for edge case until we have proper relative metric control
    if (metric.get('metricId') == 'sentimentPositive') {
      summaryFn = function (metric) {
        return metric.total('sentimentPositive') * 1 / (metric.total('sentimentNegative') + metric.total('sentimentPositive')) || 0;
      };
      this.options.format = ',%';
    }
    return summaryFn ? summaryFn(metric) : metric.total();
  };
  var getLabel = function (label, metric) {
    if (label || label === false) {
      return label;
    } else {
      return metric.getLabel();
    }
  };
  return {
    process: function (view) {
      var metric = this.metrics[0];
      var label = getLabel(this.options.label, metric);
      var comparePeriods = !!metric.get('comparePeriods');
      if (comparePeriods) {
        var previousMetric = this.metrics[1];
        var otherLabel = this.options.otherLabel;
        view.options.percentDiff = true;
        var comparisonDays = (previousMetric.period.get('end') - previousMetric.period.get('start')) / 1000 / 60 / 60 / 24;
        // TODO: MAKE THIS SANE, we should either be showing the range of the comparison (previous) date or the current date, NOT BOTH (the else statement is showing previous, others are showing current)
        if (!otherLabel) {
          if (comparisonDays <= 1) {
            otherLabel = 'in last 24 hours';
          } else if (comparisonDays === 7) {
            otherLabel = 'in last 7 days';
          } else if (comparisonDays === 30) {
            otherLabel = 'in last 30 days';
          } else {
            var timeframe = previousMetric.period.timeframePreviousPeriod();
            otherLabel = 'from ' + Openhose.moment(timeframe.start).format('MMMM D') + ' to ' + Openhose.moment(timeframe.end).format('MMMM D');
          }
        }
        view.otherData = {
          value: processData.bind(this)(previousMetric),
          label: otherLabel
        };
      }
      view.data = {
        value: processData.bind(this)(metric),
        label: label
      };
    },
    validate: function (metrics, dimensions) {
      var validated = true;
      var error = null;
      if (metrics && metrics.length === 1) {
        return [
          validated,
          error
        ];  // valid
      }
      if (metrics && metrics.length === 2 && metrics[1].get('previousPeriod')) {
        return [
          validated,
          error
        ];  // valid
      }
      error = 'Need exactly one metric (and/or a previous period metric) to render a number summary';
      validated = false;
      return [
        validated,
        error
      ];
    }
  };
}(core);
processor_leaderboard = function (Openhose, AnalyticsMixin) {
  var processData = function (dimensions, metrics) {
    var segments = null;
    if (dimensions.length) {
      segments = AnalyticsMixin._segmentsForDimension.call(this);
      segments = segments[0].values;
    } else {
      segments = AnalyticsMixin._segmentsForMetrics(this.metrics, this.options);
    }
    segments = Openhose._.sortBy(segments, function (segment) {
      return segment.value;
    }).reverse();
    // add sentiment
    //segments = _.map(segments, function(segment) {
    //  var metric   = _.find(metrics, function(metric) { return metric.name.toLowerCase() == segment.label.toLowerCase(); });
    //  if (metric) {
    //    var positive = metric.collection.reduce( function(total, slice) { return total + slice.sentimentPositive; }, 0) || 0;
    //    var negative = metric.collection.reduce( function(total, slice) { return total + slice.sentimentNegative; }, 0) || 0;
    //    var volume   = metric.collection.reduce( function(total, slice) { return total + slice.volume; }, 0) || 0;
    //    segment.positiveSentiment = positive / volume;
    //    segment.negativeSentiment = negative / volume;
    //  }
    //  return segment;
    //});
    //this.totalVolume = _.reduce(segments, function(total, segment){ return total + segment.value; }, 0) || 0;
    return segments;
  };
  return {
    process: function (view) {
      var dimensions = this.dimensions;
      var metric = this.metrics[0];
      view.data = { values: processData.bind(this)(dimensions, metric) };
      if (this.totalVolume) {
        // TODO: figure out a better way to this
        view.data.totalVolume = this.totalVolume[this.dimensions[0].get('metrics')[0]];
      }
    },
    validate: function (metrics, dimensions) {
      return [
        true,
        null
      ];
      // TODO: FIXME: metrics are in the dimension now
      var validated = true;
      var error = null;
      if (dimensions.length) {
        if (dimensions.length != 1) {
          error = 'Leaderboard charts currently only support one dimension';
          validated = false;
        }
        if (dimensions.length != 1) {
          error = 'Bar charts currently only support one dimension';
          validated = false;
        }
      } else {
        if (!metrics.length) {
          error = 'Need at least one dimension or metric to render leaderboard chart';
          validated = false;
        }
      }
      return [
        validated,
        error
      ];
    }
  };
}(core, processor_analytics_mixin);
processor_pie = function (Openhose, AnalyticsMixin) {
  var processData = function (dimensions, metrics) {
    var segments = null;
    if (dimensions.length) {
      segments = AnalyticsMixin._segmentsForDimension.bind(this)();
      segments = segments[0].values;
    } else {
      segments = AnalyticsMixin._segmentsForMetrics.bind(this)(metrics, {});
    }
    return segments;
  };
  return {
    process: function (view) {
      var dimensions = this.dimensions;
      var metric = this.metrics[0];
      view.data = { values: processData.bind(this)(dimensions, this.metrics) };
      if (this.totalVolume) {
        // TODO: figure out a better way to this
        view.data.totalVolume = this.totalVolume[this.dimensions[0].get('metrics')[0]];
      }
    },
    validate: function (metrics, dimensions) {
      var validated = true;
      var error = null;
      if (dimensions.length) {
        if (dimensions[0].get('metrics').length != 1) {
          error = 'Need exactly one metric to render a pie chart with dimensions';
          validated = false;
        }
        if (dimensions.length != 1) {
          error = 'Pie charts currently only support one dimension';
          validated = false;
        }
      } else {
        if (!metrics.length) {
          error = 'Need at least one dimension or metric to render pie chart';
          validated = false;
        }
      }
      return [
        validated,
        error
      ];
    },
    dimensionNeedsTrendMetrics: false
  };
}(core, processor_analytics_mixin);
lib_error_logger = function (Openhose) {
  var errorLogger = function (message, options) {
    console.warn(message);
    if (Openhose.SETTINGS.errorLogger) {
      Openhose.SETTINGS.errorLogger(message, options);
    }
  };
  return errorLogger;
}(core);
processor_line = function (Openhose, Utils, AnalyticsMixin, errorLogger) {
  var defaults = { disablePreviousTimeLine: true };
  var processData = function (dimensions, metrics) {
    this.options = Openhose._.extend({}, defaults, this.options);
    var segments = [];
    if (dimensions.length) {
      segments = AnalyticsMixin.timelineSegmentsForDimension(dimensions, this.options);
    } else {
      segments = AnalyticsMixin._timelineSegmentsForMetrics(metrics, this.options);
      // disables the previous line if the option is set
      if (this.options.disablePreviousTimeLine) {
        // find history graphs
        for (var i = 0; i < segments.length; i++) {
          if (segments[i].isHistory) {
            segments[i].disabled = true;
          }
        }
      }
      if (!this.options.includePercentage && !this.noTotals && metrics[0] && metrics[0].relativeMetric && !this.options.yFormat) {
        this.options.yFormat = function (num) {
          return Math.round(num * 10000) / 100 + '%';
        };
      }
    }
    return segments;
  };
  function formatData(data) {
    var colors = this.options.colors || Openhose.d3.scale.category20c();
    var lines = Openhose._(data).map(function (graph, i) {
      graph.noPrediction = this.options.noPrediction;
      var graphValues = Openhose._(graph.values).map(function (coords, i) {
        return {
          x: coords[0] / 1000,
          y: coords[1]
        };
      });
      if (graph.relativeValues && graph.relativeValues.length) {
        graphValues.map(function (values, j) {
          values.yRelative = graph.relativeValues[j] || 0;
        });
      }
      var timeDelta = 0;
      var period = graph.period;
      if (graph.isHistory) {
        timeDelta = graph.timeDelta;
        // and set prev x value to be overlapping with current
        graphValues.map(function (x) {
          x.x = graph.period.incrementMomentByPeriod(x.x * 1000).valueOf() / 1000;
        });
      }
      graph.lineBreakPoint = 0;
      var currentTs = new Date().getTime();
      var bucketMs = period.getBucketMs();
      // timeframes in the future get a highlight.
      if (!this.options.noPrediction) {
        for (var j = graphValues.length - 1; j > 0; j--) {
          if (graphValues[j].x * 1000 - timeDelta > currentTs) {
            graph.lineBreakPoint++;
          }
        }
      }
      if (graph.lineBreakPoint > 1) {
        errorLogger('Detected >1 future data points', {
          extra: {
            'graphValues': graphValues,
            'lineBreakPoint': graph.lineBreakPoint,
            'period': graph.period.toJSON(),
            'location': window.location.href,
            'options': this.options
          }
        });
      }
      graph.lineBreakPoint = graphValues.length - graph.lineBreakPoint;
      if (graph.lineBreakPoint < graphValues.length) {
        var point = graphValues[graph.lineBreakPoint];
        var yVal = point.y;
        point.yNonPredicted = yVal;
        point.highlight = true;
        var timePassed = new Date().getTime() - (point.x * 1000 - timeDelta - bucketMs);
        point.atTime = new Date().getTime();
        // A bit of an hack, this sets the current timeframe value to the predicted value. original value is in yNonPredicted
        point.y = Math.round(yVal / timePassed * bucketMs);
      }
      var name = graph.label || '';
      if (name.length > 30) {
        name = Utils.truncate(name, 30, '...');
      }
      return {
        name: name,
        data: graphValues,
        color: colors(i),
        disabled: graph.disabled,
        period: graph.period,
        isHistory: graph.isHistory,
        timeDelta: graph.timeDelta,
        lineLabel: graph.lineLabel,
        annotations: graph.annotations,
        lineBreakPoint: graph.lineBreakPoint,
        'noPrediction': graph.noPrediction
      };
    }.bind(this));
    if (!this.options.noZeroFill) {
      AnalyticsMixin.zeroFill(lines);
    }
    return lines;
  }
  return {
    process: function (view) {
      var dimensions = this.dimensions;
      var segments = processData.bind(this)(dimensions, this.metrics);
      var values = formatData.bind(this)(segments);
      if (this.metrics.length)
        view.options.yHoverFormat = this.metrics[0].getFormatter();
      view.data = { values: values };
    },
    validate: function (metrics, dimensions) {
      var validated = true;
      var error = null;
      if (dimensions && dimensions.length) {
        if (dimensions[0].get('metrics').length != 1) {
          error = 'Need exactly one metric to render a line chart with dimensions';
          validated = false;
        }
        if (dimensions.length != 1) {
          error = 'Line charts currently only support one dimension';
          validated = false;
        }
      } else {
        if (!metrics.length) {
          error = 'Need at least one dimension or metric to render line chart';
          validated = false;
        }
      }
      return [
        validated,
        error
      ];
    },
    dimensionNeedsTrendMetrics: true
  };
}(core, lib_utils, processor_analytics_mixin, lib_error_logger);
processor_area = function (Openhose, Utils, AnalyticsMixin) {
  var processData = function (dimensions, metrics) {
    var segments = [];
    if (dimensions.length) {
      segments = AnalyticsMixin.timelineSegmentsForDimension(dimensions, this.options);
    } else {
      segments = AnalyticsMixin._timelineSegmentsForMetrics(metrics, this.options);
    }
    return this.options.reverse ? _.clone(segments).reverse() : segments;
  };
  function formatData(data, options) {
    var colors = this.options.colors || d3.scale.category20c();
    // TODO: document colorMap
    var colorMap = options.colorMap || {};
    var lines = _(data).map(function (graph, i) {
      var color = colorMap[graph.label] ? colorMap[graph.label] : colors(i);
      var graphValues = _(graph.values).map(function (coords, i) {
        return {
          x: coords[0] / 1000,
          y: coords[1]
        };
      });
      var name = graph.label || '';
      if (name.length > 30) {
        name = Utils.truncate(name, 30, '...');
      }
      return {
        name: name,
        data: graphValues,
        color: color,
        disabled: graph.disabled,
        period: graph.period,
        lineLabel: graph.lineLabel,
        annotations: graph.annotations,
        'noPrediction': graph.noPrediction
      };
    }.bind(this));
    if (!this.options.noZeroFill) {
      AnalyticsMixin.zeroFill(lines);
    }
    return lines;
  }
  return {
    process: function (view) {
      var dimensions = this.dimensions;
      var segments = processData.bind(this)(dimensions, this.metrics);
      var values = formatData.bind(this)(segments, this.options);
      view.data = { values: values };
    },
    validate: function (metrics, dimensions) {
      var validated = true;
      var error = null;
      if (dimensions.length) {
        if (dimensions[0].get('metrics').length != 1) {
          error = 'Need exactly one metric to render a area chart with dimensions';
          validated = false;
        }
        if (dimensions.length != 1) {
          error = 'Area charts currently only support one dimension';
          validated = false;
        }
      } else {
        if (!metrics.length) {
          error = 'Need at least one dimension or metric to render area chart';
          validated = false;
        }
      }
      return [
        validated,
        error
      ];
    },
    dimensionNeedsTrendMetrics: true
  };
}(core, lib_utils, processor_analytics_mixin);
processor_time_line = function (Openhose, AnalyticsMixin) {
  var processData = function (dimensions, metrics) {
    var segments = [];
    if (dimensions.length) {
      segments = AnalyticsMixin.timelineSegmentsForDimension(dimensions, this.options);
    } else {
      segments = AnalyticsMixin._timelineSegmentsForMetrics(metrics, this.options);
    }
    return segments;
  };
  var formatData = function (data) {
    return Openhose._(data).map(function (graph, i) {
      var graphValues = _(graph.values).map(function (coords, i) {
        return {
          x: coords[0] / 1000,
          y: coords[1]
        };
      });
      return {
        data: graphValues,
        period: graph.period
      };
    });
  };
  return {
    dimensionNeedsTrendMetrics: true,
    process: function (view) {
      var dimensions = this.dimensions;
      var metric = this.metrics;
      var segments = processData.bind(this)(dimensions, metric);
      var values = formatData.bind(this)(segments);
      view.data = { values: values };
    },
    validate: function (metrics, dimensions) {
      return [
        true,
        null
      ];  // TODO: FIXME: metrics are in the dimension now
          // var validated = true;
          // var error = null;
          // if (dimensions.length) {
          //   if (dimensions.length != 1) {
          //     error = "Timeline charts currently only support one dimension";
          //     validated = false;
          //   }
          //   if (dimensions.length != 1) {
          //     error = "Timeline charts currently only support one dimension";
          //     validated = false;
          //   }
          // } else {
          //   if (!metrics.length) {
          //     error = "Need at least one dimension or metric to render timeline chart";
          //     validated = false;
          //   }
          // }
          // return [validated, error];
    }
  };
}(core, processor_analytics_mixin);
processor_table = function (Openhose, Utils, AnalyticsMixin) {
  var processData = function (dimensions, metrics) {
    var segments = [];
    if (dimensions.length) {
      segments = AnalyticsMixin._tableSegmentsForDimension(dimensions, { columns: this.options.columns });
      var mapping = {};
      if (segments.previousDimension) {
        segments.previousDimension.collection.forEach(function (s) {
          mapping[s.get('id')] = s;
        });
      }
      segments.previousMapping = mapping;
    } else {
      var labels = {};
      var values = AnalyticsMixin._tableSegmentsForMetrics(metrics, this.options);
      if (values.length) {
        if (this.options.labels) {
          labels = this.options.labels;
        } else {
          var labelKeys = _.reject(Object.keys(values[0]), function (k) {
            return k === 'label';
          });
          labelKeys.forEach(function (k) {
            labels[k] = k.charAt(0).toUpperCase() + k.slice(1);
          });
        }
      }
      if (this.options.sortBy) {
        var sortBy = this.options.sortBy;
        var sortOrder = this.options.sortOrder || 'ASC';
        values = _.sortBy(values, function (value, i) {
          value.originalIndex = i;
          var sortKey;
          if (sortOrder === 'DESC') {
            sortKey = -value[sortBy];
          } else {
            sortKey = value[sortBy];
          }
          return sortKey;
        });
      }
      segments = {
        labels: labels,
        values: values
      };
    }
    return segments;
  };
  return {
    process: function (view) {
      var dimensions = this.dimensions;
      view.data = processData.bind(this)(dimensions, this.metrics);
    },
    validate: function (metrics, dimensions) {
      var validated = true;
      var error = null;
      if (dimensions.length) {
        if (dimensions.length !== 1 && dimensions.length !== 2) {
          error = 'Table needs exactly one dimension';
          validated = false;
        } else if (dimensions.length === 2 && !dimensions[1].get('previousPeriod')) {
          error = 'Table can only have a second dimension if it is of a previous period';
          validated = false;
        }
        if (dimensions[0].get('metrics').length < 1) {
          error = 'Table needs at least one metric when used with dimension.';
          validated = false;
        }
      } else if (metrics.length < 1) {
        error = 'Table needs at least one metric';
        validated = false;
      }
      return [
        validated,
        error
      ];
    }
  };
}(core, lib_utils, processor_analytics_mixin);
processor_motion_scatter = function (Openhose, Utils, AnalyticsMixin) {
  var processData = function (dimensions, metrics) {
    var topics = [];
    // topics contains a [] of {} with a .data with historic [time, x, y, z].
    if (dimensions.length) {
      var xField = this.options.xField || dimensions[0].metrics[0].get('metricIds')[0];
      var yField = this.options.yField || dimensions[0].metrics[0].get('metricIds')[1] || xField;
      var zField = this.options.zField || dimensions[0].metrics[0].get('metricIds')[2] || yField;
      dimensions[0].metrics.forEach(function (metric) {
        var topic = {};
        topic.xField = xField;
        topic.yField = yField;
        topic.zField = zField;
        var overTimeX = metric.timeline(topic.xField);
        var overTimeY = metric.timeline(topic.yField);
        var overTimeZ = metric.timeline(topic.zField);
        topic.title = topic.id || metric.get('id') || metric.get('metricId');
        topic.period = metric.period;
        topic.data = [];
        for (var count in overTimeX) {
          var values = [
            overTimeX[count][0],
            // time
            overTimeX[count][1],
            // x
            overTimeY[count][1],
            // y
            overTimeZ[count][1]  // z
          ];
          topic.data.push(values);
        }
        topics.push(topic);
      }.bind(this));
    } else {
      metrics.forEach(function (metric) {
        var topic = metric.toJSON();
        if (!this.xField && Openhose._.isArray(topic.metricId) && topic.metricId[0]) {
          this.xField = topic.metricId[0];
        }
        if (!this.yField && Openhose._.isArray(topic.metricId) && topic.metricId[1]) {
          this.yField = topic.metricId[1];
        }
        if (!this.zField && Openhose._.isArray(topic.metricId) && topic.metricId[2]) {
          this.zField = topic.metricId[2];
        } else if (!this.zField) {
          this.zField = this.xField;
        }
        topic.xField = this.xField;
        topic.yField = this.yField;
        topic.zField = this.zField;
        topic.period = metric.period;
        topic.title = topic.id || metric.get('metricId');
        topic.data = [];
        var overTimeX = metric.timeline(this.xField);
        var overTimeY = metric.timeline(this.yField);
        var overTimeZ = metric.timeline(this.zField);
        for (var count in overTimeX) {
          var values = [
            overTimeX[count][0],
            // time
            overTimeX[count][1],
            // x
            overTimeY[count][1],
            // y
            overTimeZ[count][1]  // z
          ];
          topic.data.push(values);
        }
        topics.push(topic);
      }.bind(this));
    }
    return topics;
  };
  return {
    dimensionNeedsTrendMetrics: true,
    process: function (view) {
      var dimensions = this.dimensions;
      view.data = processData.bind(this)(dimensions, this.metrics);
    },
    validate: function (metrics, dimensions) {
      var validated = true;
      var error = null;
      var errorMsg = 'Motion-Scatter needs at least 1 metric with 2 to 3 ids or exactly 1 dimension with 2 to 3 metrics';
      if (dimensions.length !== 1 && metrics.length < 1) {
        validated = false;
        error = errorMsg;
      }
      if (metrics.length && (metrics[0].get('ids').length < 2 && metrics.length < 2)) {
        validated = false;
        error = errorMsg;
      }
      if (dimensions.length && (dimensions[0].get('metrics').length > 3 || dimensions[0].get('metrics').length < 2)) {
        validated = false;
        error = errorMsg;
      }
      return [
        validated,
        error
      ];
    }
  };
}(core, lib_utils, processor_analytics_mixin);
processor_gauge = function (Openhose) {
  // summaryFn         Function used on how to reduce the data to one number
  var processData = function (metric) {
    var summaryFn = this.options.summaryFn;
    if (this.options.average === true) {
      return metric.average();
    }
    // Temp hack for edge case until we have proper relative metric control
    if (metric.get('metricId') == 'sentimentPositive') {
      summaryFn = function (metric) {
        return metric.total('sentimentPositive') * 1 / (metric.total('sentimentNegative') + metric.total('sentimentPositive')) || 0;
      };
    }
    return summaryFn ? summaryFn(metric) : metric.total();
  };
  return {
    process: function (view) {
      var metric = this.metrics[0];
      view.data = processData.bind(this)(metric);
    },
    validate: function (metrics, dimensions) {
      var validated = true;
      var error = null;
      if (metrics.length !== 1) {
        validated = false;
        error = 'Gauge needs exactly one metric.';
      }
      if (dimensions.length >= 1) {
        validated = false;
        error = 'Gauge does not support Dimensions';
      }
      return [
        validated,
        error
      ];
    }
  };
}(core);
processor_distribution = function (Openhose, AnalyticsMixin) {
  var processData = function (dimensions, metrics) {
    var segments = null;
    if (dimensions.length) {
      segments = AnalyticsMixin._segmentsForDimension.bind(this)();
      segments = segments[0].values;
    } else {
      segments = AnalyticsMixin._segmentsForMetrics.bind(this)(metrics, {});
    }
    return segments;
  };
  return {
    process: function (view) {
      var dimensions = this.dimensions;
      var metric = this.metrics[0];
      view.data = { values: processData.bind(this)(dimensions, this.metrics) };
      if (this.totalVolume) {
        // TODO: figure out a better way to this
        view.data.totalVolume = this.totalVolume[this.dimensions[0].get('metrics')[0]];
      }
    },
    validate: function (metrics, dimensions) {
      var validated = true;
      var error = null;
      if (dimensions.length) {
        if (metrics.length != 1) {
          error = 'Need exactly one metric to render a distribution chart with dimensions';
          validated = false;
        }
        if (dimensions.length != 1) {
          error = 'Distribution charts currently only support one dimension';
          validated = false;
        }
      } else {
        if (!metrics.length) {
          error = 'Need at least one dimension or metric to render distribution chart';
          validated = false;
        }
      }
      return [
        validated,
        error
      ];
    },
    dimensionNeedsTrendMetrics: false
  };
}(core, processor_analytics_mixin);
processor_bar = function (Openhose, AnalyticsMixin) {
  var processData = function (dimensions, metrics) {
    var segments = {};
    if (dimensions.length) {
      segments.values = AnalyticsMixin._segmentsForDimension.call(this);
      var isComparison = false;
      for (var i = 0; i < dimensions.length; i++) {
        if (dimensions[i].get('previousPeriod')) {
          isComparison = true;
          break;
        }
      }
      segments.isComparison = isComparison;
      return segments;
    } else {
      segments.values = AnalyticsMixin._segmentsForMetrics.call(this);
      segments.period = metrics[0].period;
      return { values: [segments] };
    }
  };
  return {
    process: function (view) {
      var dimensions = this.dimensions;
      view.data = processData.bind(this)(dimensions, this.metrics);
    },
    validate: function (metrics, dimensions) {
      var validated = true;
      var error = null;
      if (dimensions.length) {
        if (dimensions[0].get('metrics').length != 1) {
          error = 'Need exactly one metric to render a bar chart with dimensions';
          validated = false;
        }
      } else {
        if (!metrics.length) {
          error = 'Need at least one dimension or metric to render pie chart';
          validated = false;
        }
      }
      return [
        validated,
        error
      ];
    }
  };
}(core, processor_analytics_mixin);
processor_main = function (Openhose, Number, LeaderBoard, Pie, Line, Area, TimeLine, Table, MotionScatter, Gauge, Distribution, Bar) {
  var subModules = {};
  subModules.Number = Number;
  subModules.LeaderBoard = LeaderBoard;
  subModules.Pie = Pie;
  subModules.Line = Line;
  subModules.Area = Area;
  subModules.TimeLine = TimeLine;
  subModules.Table = Table;
  subModules.MotionScatter = MotionScatter;
  subModules.Gauge = Gauge;
  subModules.Distribution = Distribution;
  subModules.Bar = Bar;
  Openhose.Processor = subModules;
  return Openhose;
}(core, processor_number, processor_leaderboard, processor_pie, processor_line, processor_area, processor_time_line, processor_table, processor_motion_scatter, processor_gauge, processor_distribution, processor_bar);
models_analytics_data = function (Openhose) {
  return Openhose.Backbone.Model.extend({
    defaults: {
      fetchState: 'notLoaded'  // 'notLoaded', 'loading', 'success', 'error', 'noDataAvailable'
    },
    initialize: function (options) {
      this.period = this.period || options.period;
      //TODO: investigate if we can drop `this.period ||` and only use `this.period = options.period`
      this.period.on('change', this._onPeriodChange, this);
      this.mapFn = this.mapFn || options.mapFn;
      this.collection = new Openhose.Backbone.Collection();
      this.collection.comparator = function (a, b) {
        return Date.parse(a.timestamp || a.get('timestamp')) - Date.parse(b.timestamp || b.get('timestamp'));
      };
      this.on('fetch:loading', function (model) {
        model.set('fetchState', 'loading');
      });
      this.on('fetch:success', function (model) {
        model.set('fetchState', 'success');
      });
      this.on('fetch:error', function (model) {
        model.set('fetchState', 'error');
      });
      this.on('fetch:noDataAvailable', function (model) {
        model.set('fetchState', 'noDataAvailable');
      });
    },
    release: function () {
      this.period.off('change', this._onPeriodChange, this);
      this.stopListening();
      this.collection && this.collection.reset([], { silent: true });
      if (this.request)
        this.request.abort();
      delete this.collection;
      this.trigger('release');
    },
    _onPeriodChange: function () {
      this.fetch({ reset: true });
    },
    _handleFetchResponse: function (error, results) {
      if (!this.collection)
        return;
      if (error || !results) {
        return false;
      }
      results = results.result;
      if (!Openhose._.isArray(results)) {
        this.trigger('fetch:error', this, error && error.message);
        return;
      }
      if (this.mapFn) {
        results = results.map(this.mapFn);
      }
      this.collection.reset(results);
      this._mapReduceAdvancedQueries && this._mapReduceAdvancedQueries();
      this.trigger('fetch:success', this);
      return this.collection;
    }
  });
}(core);
lib_mapping_processor = function (Openhose, errorLogger) {
  // allow the cache to be persistent
  if (!Openhose._MAPPINGS_CACHE) {
    Openhose._MAPPINGS_CACHE = {
      requests: {},
      // jQuery Ajax requests (used to determine if mapping is loading)
      results: {}  // cached mappings
    };
  }
  var MAPPINGS = Openhose._MAPPINGS_CACHE.results;
  var MappingProcessor = {};
  MappingProcessor.sourceTypes = [
    'social-media',
    'tv-radio'
  ];
  MappingProcessor.loadDefinitions = function (sourceType, callback) {
    var url = Openhose.SETTINGS.apiHost + '/mappings/' + sourceType;
    Openhose._MAPPINGS_CACHE.requests[sourceType] = false;
    // loading...
    Openhose.$.get(url, function (mapping) {
      if (!mapping.result) {
        errorLogger('Mapping ' + mapping + ' didn\'t return any results');
      }
      MAPPINGS[sourceType] = mapping.result;
      Openhose._MAPPINGS_CACHE.requests[sourceType] = true;
      // loaded
      callback && callback();
    }, 'json');
  };
  MappingProcessor.purge = function () {
    Openhose._MAPPINGS_CACHE = {
      requests: {},
      results: {}
    };
    MAPPINGS = Openhose._MAPPINGS_CACHE.results;
  };
  MappingProcessor.hasMapping = function (sourceType) {
    return !!MAPPINGS[sourceType];
  };
  MappingProcessor.setMapping = function (mappings) {
    MAPPINGS = mappings;
  };
  MappingProcessor.getMappings = function () {
    return MAPPINGS;
  };
  MappingProcessor.isLoading = function (mappings) {
    return Openhose._.chain(Openhose._MAPPINGS_CACHE.requests).pick(mappings).values().contains(false).value();
  };
  //
  // MappingProcessor.timestampPath = function(sourceType) {
  //   var mapping = MAPPINGS[sourceType] || {};
  //   return mapping.timestampPath || 'publishedTs';
  // };
  //
  // MappingProcessor.getLabelForSourceType = function (sourceType) {
  //   if (MAPPINGS[sourceType] !== undefined) {
  //     return MAPPINGS[sourceType].label;
  //   }
  //   else return '';
  // };
  //
  // MappingProcessor.getLabelForContextType = function(sourceType, contextType) {
  //   sourceType = MAPPINGS[sourceType];
  //   if (sourceType !== undefined &&
  //       sourceType.contextTypes &&
  //       sourceType.contextTypes[contextType]) {
  //     return sourceType.contextTypes[contextType].label;
  //   }
  //   return '';
  // },
  //
  // MappingProcessor.trendTypes = function(sourceType) {
  //   var keys = [];
  //   for (var key in MAPPINGS[sourceType].entities) {
  //     keys.push(key);
  //   }
  //   return keys;
  // };
  //
  // MappingProcessor.isValidTrendType = function(sourceType, trendType) {
  //   return !!MAPPINGS[sourceType].entities[trendType];
  // };
  //
  // MappingProcessor.isValidMetricId = function(sourceType, metricId) {
  //   return !!MAPPINGS[sourceType].metrics[metricId];
  // };
  //
  // MappingProcessor.singular = function(name) {
  //   var lowerCased = name.toLowerCase();
  //
  //   // Append letters using the same case as the last word of the singularized word
  //   var append = function(word, chars) {
  //     var lastChar = word.slice(-1);
  //     return word + (lastChar === lastChar.toUpperCase() ? chars.toUpperCase() : chars.toLowerCase());
  //   };
  //
  //   // If ending in ss it is probably already singular
  //   if (lowerCased.slice(-2) === 'ss') {
  //     return name;
  //   }
  //
  //   if (lowerCased.slice(-3) === 'ies') {
  //     return append(name.slice(0, -3), 'y');
  //   }
  //
  //   // Words ending in ches, ses, shes, xes, or zes
  //   if (/(ch|s|sh|x|z)es$/.test(lowerCased)) {
  //     return name.slice(0, -2);
  //   }
  //
  //   if (lowerCased.slice(-3) === 'chs') {
  //     return name.slice(0, -1);
  //   }
  //
  //   if (lowerCased.slice(-3) === 'ves') {
  //     return append(name.slice(0, -3), 'f');
  //   }
  //
  //   if (lowerCased.slice(-3) === 'oes') {
  //     return name.slice(0, -2);
  //   }
  //
  //   if (lowerCased.slice(-1) === 's') {
  //     return name.slice(0, -1);
  //   }
  //
  //   // Apparently the word was already singular
  //   return name;
  // };
  //
  // MappingProcessor.parseEntityMetric = function(sourceType, path) {
  //   path = path.split(/:/).map(decodeURIComponent);
  //
  //   var directives = {
  //     metric: path[path.length-1]
  //   };
  //
  //   if (path.length == 2 && path[0] != "stream") {
  //     directives.entityType = path[0];
  //     directives.entityId = path[1];
  //     delete directives.metric;
  //   } else if (path.length == 1 || path.length == 2 && path[0] == "stream") {
  //     directives.entityType = 'stream';
  //   } else if (path.length == 3) {
  //     directives.entityType = path[0];
  //     directives.entityId = path[1];
  //   } else if (path.length == 4) {
  //     directives.entityType = path[0];
  //     directives.entityGroup = path[1];
  //     directives.entityId = path[2];
  //   } else {
  //     throw new Error("Invalid path: " + path.map(encodeURIComponent).join(':'));
  //   }
  //   return directives;
  // };
  //
  // MappingProcessor.joinEntityMetric = function(sourceType, entityMetric) {
  //   var path = [];
  //
  //   path.push(entityMetric.entityType); // always has a entityType
  //
  //   // TODO would be nice to have sanity check based on source typ (reason it is already in the signatue)
  //   // add optional things when provided
  //   if (entityMetric.entityGroup) path.push(entityMetric.entityGroup);
  //   if (entityMetric.entityId) path.push(entityMetric.entityId);
  //   if (entityMetric.metric) path.push(entityMetric.metric);
  //
  //   return path.map(encodeURIComponent).join(':');
  // };
  //
  // MappingProcessor.decodePath = function (sourceType, path) {
  //   var query = {};
  //
  //   var directives = MappingProcessor.parseEntityMetric(sourceType, path);
  //
  //   if (directives.entityType) {
  //     if (directives.entityType == 'stream') {
  //       query.entity = {'entityType': directives.entityType};
  //     } else {
  //       query.entity = MappingProcessor.entityById(sourceType, directives.entityType);
  //       if (!query.entity) {
  //         throw new Error("Could not find entity for type "+ directives.entityType);
  //       }
  //       query.entity.entityType = directives.entityType;
  //       if (directives.entityId)
  //         query.entity.id = directives.entityId;
  //       if (directives.entityGroup) {
  //         query.entity.group = directives.entityGroup;
  //       }
  //     }
  //   }
  //
  //   if (directives.metric) {
  //     query.metrics = [];
  //     if (directives.metric == '*') {
  //       var metrics = MappingProcessor.metrics(sourceType);
  //       for (var id in metrics) {
  //         var metric = metrics[id];
  //         metric.id = id;
  //         query.metrics.push(metric);
  //
  //       }
  //     } else {
  //       var metric = MappingProcessor.metricById(sourceType, directives.metric);
  //       if (!metric) {
  //         throw new Error("Could not find metric with id " + directives.metric);
  //       }
  //       metric.id = directives.metric;
  //       query.metrics.push(metric);
  //       if (metric.children) {
  //         MappingProcessor._addChildrenToQuery(query, metric.children);
  //       }
  //     }
  //   }
  //
  //   return query;
  // };
  //
  // MappingProcessor.decodePaths = function(sourceType, paths) {
  //   return paths.map(MappingProcessor.decodePath.bind(null, sourceType));
  // };
  //
  // MappingProcessor._addChildrenToQuery = function(query, children) {
  //   for (var id in children) {
  //     var metric = children[id];
  //     metric.id = id;
  //     query.metrics.push(metric);
  //     if (metric.children) {
  //       MappingProcessor._addChildrenToQuery(query, metric.children);
  //     }
  //   }
  // };
  //
  // MappingProcessor.pathForEntity = function(entity) {
  //   var path = [entity.entityType];
  //   if (entity.group)
  //     path.push(entity.group);
  //   if (entity.id)
  //     path.push(entity.id);
  //   return path.map(encodeURIComponent).join(':');
  // };
  //
  // MappingProcessor.entityForPath = function(path) {
  //   path = path.split(':').map(decodeURIComponent);
  //   var entity = {
  //     entityType: path.shift(),
  //     id: path.pop()
  //   };
  //   if (path.length > 0) {
  //     entity.group = path.shift();
  //   }
  //   return entity;
  // };
  MappingProcessor.metricsByCategory = function (sourceType, category) {
    var metrics = {};
    for (var metricId in MAPPINGS[sourceType].metrics) {
      if (MAPPINGS[sourceType].metrics[metricId].category == category) {
        metrics[metricId] = MAPPINGS[sourceType].metrics[metricId];
      }
    }
    return metrics;
  };
  // MappingProcessor.entities = function(sourceType, ids) {
  //   if (!ids) {
  //     return MAPPINGS[sourceType].entities;
  //   }
  //
  //   var pickedDefinitions = {};
  //   ids.forEach(function(id) {
  //     pickedDefinitions[id] = MAPPINGS[sourceType].entities[id];
  //   });
  //   return pickedDefinitions;
  // };
  //
  // MappingProcessor.metrics = function(sourceType, ids) {
  //   if (!ids) {
  //     return MAPPINGS[sourceType].metrics;
  //   }
  //   var pickedDefinitions = {};
  //   ids.forEach(function(id) {
  //     pickedDefinitions[id] = MAPPINGS[sourceType].metrics[id];
  //   });
  //   return pickedDefinitions;
  // };
  //
  // MappingProcessor.complexEntityDefinition = function (entityObj) {
  //   if (!entityObj || !entityObj.fields) return null;
  //
  //   var template = {};
  //   var fields = entityObj.fields;
  //   Object.keys(fields).forEach(function (field) {
  //     if (!fields[field].path) return;
  //     template[field] = fields[field].path;
  //     if (fields[field].alternativePath) {
  //       template[field] = [
  //         template[field],
  //         fields[field].alternativePath
  //       ];
  //     }
  //   });
  //
  //   var foundFields = Object.keys(template);
  //   if (foundFields.length === 0) return null; // there are no fields for the complexEntity
  //   if (foundFields.length == 1 && foundFields[0] == 'id' && !Array.isArray(template.id)) return null; // only the id is found, the id is the entity
  //
  //   var options = {};
  //
  //   if (entityObj.fields.id) {
  //     if (entityObj.fields.id.richEntityOrder) {
  //       options.order = entityObj.fields.id.richEntityOrder;
  //     }
  //     if (entityObj.fields.id.richEntity == 'root') {
  //       options.returnRoot = true;
  //     }
  //   }
  //
  //   return {
  //     options: options,
  //     template: template
  //   };
  // };
  //
  // MappingProcessor.parseComplexEntity = function(complexEntityDefinition, activity, id) {
  //   if (complexEntityDefinition.options && complexEntityDefinition.options.returnRoot) return activity;
  //
  //   var indices = null;
  //   if (id) {
  //     if (!complexEntityDefinition.template || !complexEntityDefinition.template.id) throw new Error("Matching on id while the complex entity does not have an id field");
  //     // find the indices matching the id
  //     var idPath = complexEntityDefinition.template.id;
  //     if (!Array.isArray(idPath)) idPath = idPath.split('.');
  //
  //     // recursivly find the correct indices to take down the road
  //     var traverse = function (obj, path) {
  //       var key = path[0];
  //       var nextPath = path.slice(1);
  //       var field = obj[key];
  //       if (!field) return false;
  //
  //       if (Array.isArray(field)) {
  //         // branch into all elements until one matches
  //         for (var i=0; i<field.length; i++) {
  //           var match = traverse(field[i], nextPath);
  //           if (match) { // non falsy value indicates we got a match on this branch
  //             match.unshift(i); // put the current index at the beginning of the array
  //             return match;
  //           }
  //         }
  //         return false;
  //       } else if (nextPath.length === 0) {
  //         // the end of the path, lets test the id to the field
  //         // returning an array to collect the indices in when matching
  //         return (field == id)?[]:false;
  //       } else {
  //         return traverse(field, nextPath);
  //       }
  //     };
  //
  //     indices = traverse(activity, idPath);
  //     if (!indices) return null; // no entity found
  //   }
  //
  //   function deepPluck(obj, path) {
  //     if (!Array.isArray(path)) path = path.split('.');
  //
  //     var indexCounter = 0;
  //     for (var i=0; obj && i<path.length; i++) {
  //       obj = obj[path[i]];
  //       if (Array.isArray(obj)) {
  //         if (!indices) throw new Error("Need to specify an id when the entity is nested in an array");
  //         obj = obj[indices[indexCounter]]; // step into the correct index
  //         indexCounter++; // make sure the next array takes the correct index
  //       }
  //     }
  //     return obj;
  //   }
  //
  //   var entity = {};
  //
  //   Object.keys(complexEntityDefinition.template).forEach(function (key) {
  //     entity[key] = deepPluck(activity, complexEntityDefinition.template[key]);
  //   });
  //
  //   return entity;
  // };
  //
  // MappingProcessor.validEntityTypes = function (sourceType) {
  //   var validEntities = {};
  //   Openhose._.each(MAPPINGS[sourceType].entities, function (definition, entityType) {
  //     // test if it has an id field with a path in the definition
  //     if (!definition || !definition.fields || !definition.fields.id || !definition.fields.id.path) return;
  //     validEntities[entityType] = definition.fields.id.path;
  //   });
  //   return validEntities;
  // };
  // example response
  // {
  //    label: 'Volume',
  //    definition: ['sum']
  // }
  MappingProcessor.isMappingLoaded = function (mapping) {
    var isMappingLoaded = MAPPINGS && MAPPINGS[mapping];
    // if (!isMappingLoaded) {
    //   console.log('mapping not loaded yet:', mapping);
    // }
    return isMappingLoaded;
  };
  MappingProcessor.metricById = function (mapping, metricId) {
    if (!MappingProcessor.isMappingLoaded(mapping))
      return false;
    if (!MAPPINGS[mapping].metrics[metricId]) {
      errorLogger('mapping ' + mapping + ' is missing metric: ' + metricId);
      return false;
    }
    return Openhose._.clone(MAPPINGS[mapping].metrics[metricId]);
  };
  // MappingProcessor.entityById = function(sourceType, entityId) {
  //   return Openhose._.clone(MAPPINGS[sourceType].entities[entityId]);
  // };
  //
  // MappingProcessor.getSearchableFields = function(entity) {
  //   var fields = [];
  //
  //   if (entity && entity.fields) {
  //     // we can filter safely
  //     Object.keys(entity.fields).forEach(function (fieldName) {
  //       var field = entity.fields[fieldName];
  //       if (!field.searchable) return; // not searchable
  //       fields.push(field.path);
  //     });
  //   }
  //
  //   return fields;
  // };
  //
  // var INTERVAL_SECONDS = {
  //   'minute':   60,
  //   'hour':     3600,
  //   'day':      24*3600,
  //   'week':     7*24*3600,
  //   'month':    30*24*3600,
  //   'quarter':  3*30*24*3600,
  //   'year':     356*24*3600
  // };
  //
  // var INTERVAL_ALIASES = {
  //   'm': 'minute',
  //   'h': 'hour',
  //   'd': 'day',
  //   'w': 'week'
  // };
  //
  // MappingProcessor.parseInterval = function(interval) {
  //   var numMatch = interval.match(/^([0-9\.]+)[a-z]+$/);
  //
  //   var num = 1;
  //   if (numMatch && numMatch[1]) {
  //     num = parseFloat(numMatch[1]);
  //     interval = interval.replace(/[0-9\.]*/g, '');
  //   }
  //   if (interval.length == 1) {
  //     interval = INTERVAL_ALIASES[interval];
  //   }
  //
  //   if (!INTERVAL_SECONDS[interval]) return null;
  //
  //   return {
  //     num: num,
  //     interval: interval
  //   };
  // };
  //
  // MappingProcessor.strictInterval = function(interval) {
  //   var parsed = MappingProcessor.parseInterval(interval);
  //   if (parsed && parsed.num == 1) return parsed.interval;
  //   return false;
  // };
  //
  // MappingProcessor.intervalToMs = function(interval) {
  //   var parsed = MappingProcessor.parseInterval(interval);
  //   if (!parsed) return null;
  //   var intervalSeconds = INTERVAL_SECONDS[parsed.interval];
  //   return parsed.num * intervalSeconds * 1000;
  // };
  //
  // MappingProcessor.msToInterval = function(ms) {
  //   if (ms <= 3600*1000*24*7) { // hours
  //     var hours = ms / (3600*1000);
  //     return ''+hours+'h';
  //   } else { // days
  //     var days = ms / (3600*24*1000);
  //     return ''+days+'d';
  //   }
  // };
  //
  // var inDays = function (from, to) {
  //   var milliseconds = to - from;
  //   return Math.round(milliseconds / 86400000);
  // };
  //
  // MappingProcessor.defaultBucketFor = function (from, to) {
  //   var days = inDays(from, to);
  //   if (days <= 7) return 'hour';
  //   return 'day';
  // };
  //
  // MappingProcessor.getNumSummariesToFetch = function (bucket, from, to) {
  //   return Math.ceil((to - from) / this.intervalToMs(bucket));
  // };
  //
  // MappingProcessor.projections = {
  //   sentimentScore: Openhose._.compose(Math.round, function (value) {
  //     if (7.3 < value) {
  //       // 7.3 < AvgSent ⇒ SentScore = 100
  //       return 100;
  //     } else if (4.99 < value) {
  //       // 4.99 < AvgSent ≤ 7.3 ⇒ SentScore = 99
  //       return 99;
  //     } else if (3.179 < value) {
  //       // 3.179 < AvgSent ≤ 7.3 ⇒ SentScore = -0.3866*AvgSent^2+4.5747*AvgSent+85.402
  //       return -0.3866*Math.pow(value,2)+4.5747*value+85.402;
  //     } else if (2 < value) {
  //       // 2 < AvgSent ≤ 3.179 ⇒ SentScore = -3.8636*AvgSent^2+24.721*AvgSent+56.167
  //       return -3.8636*Math.pow(value,2)+24.721*value+56.167;
  //     } else if (1.35 < value) {
  //       // 1.35 < AvgSent ≤ 2 ⇒ SentScore = -20.371*AvgSent^2+87.086*AvgSent-2.996
  //       return -20.371*Math.pow(value,2)+87.086*value-2.996;
  //     } else if (0.573 < value) {
  //       // .573 < AvgSent ≤ 1.35 ⇒ SentScore = -19.68*AvgSent^2+99.874*AvgSent-21.301
  //       return -19.68*Math.pow(value,2)+99.874*value-21.301;
  //     } else if (0.03 < value) {
  //       // .03 < AvgSent ≤ .573 ⇒ SentScore = 22.207*AvgSent^2+39.705*AvgSent-0.0941
  //       return 22.207*Math.pow(value,2)+39.705*value-0.0941;
  //     } else if (0.0001 < value) {
  //       // .0001 < AvgSent ≤ .03 ⇒ SentScore = 1
  //       return 1;
  //     } else if (-0.193 < value) {
  //       // -.193 < AvgSent ≤ .0001 ⇒ SentScore = AvgSent*155.2795
  //       return value*155.2795;
  //     } else if (-1.1267 < value) {
  //       // -1.1267 < AvgSent ≤ -.193 ⇒ SentScore = 41.322*AvgSent^2+104.13*AvgSent-11.786
  //       return 41.322*Math.pow(value,2)+104.13*value-11.786;
  //     } else if (-3.0379 < value) {
  //       // -3.0379 < AvgSent ≤ -1.1267 ⇒ SentScore = 4.7024*AvgSent^2+28.485*AvgSent-51.945
  //       return 4.7024*Math.pow(value,2)+28.485*value-51.945;
  //     } else if (-6 < value) {
  //       // -6 < AvgSent ≤ -3.0379 ⇒ SentScore = 0.4968*AvgSent^2+5.5837*AvgSent-83.087
  //       return 0.4968*Math.pow(value,2)+5.5837*value-83.087;
  //     } else {
  //       // AvgSent < -6  ⇒ SentScore = -100
  //       return -100;
  //     }
  //   }),
  //
  //   sentimentScoreTV: Openhose._.compose(Math.round, function (value) {
  //     if (5.744 < value) {
  //       // 5.744 < AvgSent, sent score = 100
  //       return 100;
  //     } else if (5.139 < value) {
  //       // 5.139 < AvgSent <= 5.744, sent score = 99
  //       return 99;
  //     } else if (4.568 < value) {
  //       // 4.568 < AvgSent <= 5.139, sent score = -3.8731 AvgSent^2 + 41.946 AvgSent - 14.805
  //       return -3.8731 * Math.pow(value,2) + 41.946 * value - 14.805;
  //     } else if (3.795 < value) {
  //       // 3.795 < AvgSent <= 4.568, sent score = -1.5077AvgSent^2 + 20.496AvgSent + 33.933
  //       return -1.5077 * Math.pow(value,2) + 20.496 * value + 33.933;
  //     } else if (2.751 < value) {
  //       // 2.751 < AvgSent <= 3.795, sent score = 3.9214 AvgSent^3 - 41.799AvgSent^2 + 158.93AvgSent - 125.52
  //       return 3.9214 * Math.pow(value,3) - 41.799 * Math.pow(value,2) + 158.93 * value - 125.52;
  //     } else if (1.751 < value) {
  //       // 1.751 < AvgSent <= 2.751= 7.3654 AvgSent^3 - 58.507 AvgSent^2 + 175.1 AvgSent - 115.12
  //       return 7.3654 * Math.pow(value,3) - 58.507 * Math.pow(value,2) + 175.1 * value - 115.12;
  //     } else if (1.123 < value) {
  //       // 1.123 < AvgSent <= 1.751, sent score = 4.6636 AvgSent^2 + 27.66 AvgSent - 10.917
  //       return 4.6636 * Math.pow(value,2) + 27.66 * value - 10.917;
  //     } else if (0.124 < value) {
  //       // .124 < AvgSent <= 1.123, sent score = 7.072 AvgSent^3 - 1.4017 AvgSent^2 + 16.382 AvgSent - 0.6053
  //       return 7.072 * Math.pow(value,3) - 1.4017 * Math.pow(value,2) + 16.382 * value - 0.6053;
  //     } else if (0.049 < value) {
  //       // .049 < AvgSent <= .124, sent score = 1
  //       return 1;
  //     } else if (-0.006 < value) {
  //       // -.006 < AvgSent <= .049, sent score = 0
  //       return 0;
  //     } else if (-0.013 < value) {
  //       // -.013 < AvgSent <= -.006, sent score = -1
  //       return -1;
  //     } else if (-0.374 < value) {
  //       // -.374 < AvgSent <= -.013, sent score = 71.697 AvgSent^2 + 106.3 AvgSent + 0.0068
  //       return 71.697 * Math.pow(value,2) + 106.3 * value + 0.0068;
  //     } else if (-1.333 < value) {
  //       // -1.333 < AvgSent <= -.374, sent score = 24.228 AvgSent^2 + 89.364 AvgSent - 0.6448
  //       return 24.228 * Math.pow(value,2) + 89.364 * value - 0.6448;
  //     } else if (-2.354 < value) {
  //       // -2.354 < AvgSent <= -1.333, sent score = 11.321 AvgSent^2 + 59.278 AvgSent - 17.948
  //       return 11.321 * Math.pow(value,2) + 59.278 * value - 17.948;
  //     } else if (-3.214 < value) {
  //       // -3.214 < AvgSent <= -2.354, sent score = 2.795 AvgSent^2 + 19.533 AvgSent - 64.565
  //       return 2.795 * Math.pow(value,2) + 19.533 * value - 64.565;
  //     } else if (-3.779 < value) {
  //       // -3.779 < AvgSent <= -3.214, sent score = -99
  //       return -99;
  //     } else {
  //       // AvgSent < -3.779, sent score = -100
  //       return -100;
  //     }
  //   })
  // };
  //
  // MappingProcessor.project = function (name, value) {
  //   if (!(name in MappingProcessor.projections)) {
  //     throw new Error("Unknown projection '" + name + "'");
  //   }
  //
  //   return MappingProcessor.projections[name](value);
  // };
  Openhose.Mapping = MappingProcessor;
  return MappingProcessor;
}(core, lib_error_logger);
lib_api = function (Openhose) {
  var API = function () {
    this._cache = {};
    // This needs to be expired / cleaned up every now and then
    setInterval(function () {
      for (var cacheKey in this._cache) {
        delete this._cache[cacheKey];
      }
    }.bind(this), 60 * 1000);
  };
  API.prototype._getUrl = function (path, params, callback, options) {
    if (!params)
      params = {};
    if (!options)
      options = {};
    params.appName = Openhose.SETTINGS.appName;
    if (Openhose.SETTINGS.cacheLong) {
      params.cacheLong = true;
    }
    var url = Openhose.SETTINGS.apiHost + path;
    return Openhose.$.ajax({
      url: url,
      type: options.method || 'GET',
      dataType: 'json',
      data: params,
      success: function (response, status, xhr) {
        var options = {};
        var cacheControl = xhr.getResponseHeader('Cache-Control');
        //if the browser already cache the result, we shouldnt attempt
        if (cacheControl && cacheControl.length)
          options.noCache = true;
        callback(null, response, options);
      },
      error: function (xhr, textStatus) {
        //if the call is abort, dont trigger callback 
        if (textStatus == 'abort')
          return;
        var message = 'Service temporarily unavailable.';
        var clientside = false;
        try {
          message = JSON.parse(xhr.responseText).error;
        } catch (e) {
          clientside = true;
        }
        if (typeof message == 'object') {
          message = message.message;
        }
        var error = new Error(message);
        error.responseText = xhr.responseText;
        error.clientside = clientside;
        if (xhr.status == 502 || !xhr.status) {
          error.statusCode = null;
        } else {
          error.statusCode = xhr.status;
        }
        callback(error);
      }
    });
  };
  API.prototype.getUrl = function (url, params, callback, options) {
    options = options || {};
    return this._getUrl(url, params, function (err, response, opt) {
      return callback(err, response);
    }.bind(this), options);
  };
  return new API();
}(core);
lib_parse_stream = function (Openhose) {
  var streamWithDefaultSettings = function () {
    var stream = {
      id: Openhose.SETTINGS.streamId,
      mapping: Openhose.SETTINGS.mapping
    };
    if (Openhose.SETTINGS.streamId && Openhose.SETTINGS.organizationId && Openhose.SETTINGS.organizationToken) {
      stream.organizationId = Openhose.SETTINGS.organizationId;
      stream.organizationToken = Openhose.SETTINGS.organizationToken;
    } else if (Openhose.SETTINGS.streamId && Openhose.SETTINGS.userId && Openhose.SETTINGS.userToken) {
      stream.userId = Openhose.SETTINGS.userId;
      stream.userToken = Openhose.SETTINGS.userToken;
    }
    return stream;
  };
  return function (stream) {
    if (!stream)
      stream = streamWithDefaultSettings();
    // TODO: add error handling
    if (!stream.cid)
      stream = new Openhose.Backbone.Model(stream);
    return stream || stream;
  };
}(core);
models_helpers_timezone_detector = function () {
  /**
   * This script gives you the zone info key representing your device's time zone setting.
   *
   * @name jsTimezoneDetect
   * @version 1.0.5
   * @author Jon Nylander
   * @license MIT License - http://www.opensource.org/licenses/mit-license.php
   *
   * For usage and examples, visit:
   * http://pellepim.bitbucket.org/jstz/
   *
   * Copyright (c) Jon Nylander
   */
  /*jslint undef: true */
  /*global console, exports*/
  (function (root) {
    /**
     * Namespace to hold all the code for timezone detection.
     */
    var jstz = function () {
      'use strict';
      var HEMISPHERE_SOUTH = 's',
        /**
         * Gets the offset in minutes from UTC for a certain date.
         * @param {Date} date
         * @returns {Number}
         */
        get_date_offset = function (date) {
          var offset = -date.getTimezoneOffset();
          return offset !== null ? offset : 0;
        }, get_date = function (year, month, date) {
          var d = new Date();
          if (year !== undefined) {
            d.setFullYear(year);
          }
          d.setMonth(month);
          d.setDate(date);
          return d;
        }, get_january_offset = function (year) {
          return get_date_offset(get_date(year, 0, 2));
        }, get_june_offset = function (year) {
          return get_date_offset(get_date(year, 5, 2));
        },
        /**
         * Private method.
         * Checks whether a given date is in daylight saving time.
         * If the date supplied is after august, we assume that we're checking
         * for southern hemisphere DST.
         * @param {Date} date
         * @returns {Boolean}
         */
        date_is_dst = function (date) {
          var is_southern = date.getMonth() > 7, base_offset = is_southern ? get_june_offset(date.getFullYear()) : get_january_offset(date.getFullYear()), date_offset = get_date_offset(date), is_west = base_offset < 0, dst_offset = base_offset - date_offset;
          if (!is_west && !is_southern) {
            return dst_offset < 0;
          }
          return dst_offset !== 0;
        },
        /**
         * This function does some basic calculations to create information about
         * the user's timezone. It uses REFERENCE_YEAR as a solid year for which
         * the script has been tested rather than depend on the year set by the
         * client device.
         *
         * Returns a key that can be used to do lookups in jstz.olson.timezones.
         * eg: "720,1,2".
         *
         * @returns {String}
         */
        lookup_key = function () {
          var january_offset = get_january_offset(), june_offset = get_june_offset(), diff = january_offset - june_offset;
          if (diff < 0) {
            return january_offset + ',1';
          } else if (diff > 0) {
            return june_offset + ',1,' + HEMISPHERE_SOUTH;
          }
          return january_offset + ',0';
        },
        /**
         * Uses get_timezone_info() to formulate a key to use in the olson.timezones dictionary.
         *
         * Returns a primitive object on the format:
         * {'timezone': TimeZone, 'key' : 'the key used to find the TimeZone object'}
         *
         * @returns Object
         */
        determine = function () {
          var key = lookup_key();
          return new jstz.TimeZone(jstz.olson.timezones[key]);
        },
        /**
         * This object contains information on when daylight savings starts for
         * different timezones.
         *
         * The list is short for a reason. Often we do not have to be very specific
         * to single out the correct timezone. But when we do, this list comes in
         * handy.
         *
         * Each value is a date denoting when daylight savings starts for that timezone.
         */
        dst_start_for = function (tz_name) {
          var ru_pre_dst_change = new Date(2010, 6, 15, 1, 0, 0, 0),
            // In 2010 Russia had DST, this allows us to detect Russia :)
            dst_starts = {
              'America/Denver': new Date(2011, 2, 13, 3, 0, 0, 0),
              'America/Mazatlan': new Date(2011, 3, 3, 3, 0, 0, 0),
              'America/Chicago': new Date(2011, 2, 13, 3, 0, 0, 0),
              'America/Mexico_City': new Date(2011, 3, 3, 3, 0, 0, 0),
              'America/Asuncion': new Date(2012, 9, 7, 3, 0, 0, 0),
              'America/Santiago': new Date(2012, 9, 3, 3, 0, 0, 0),
              'America/Campo_Grande': new Date(2012, 9, 21, 5, 0, 0, 0),
              'America/Montevideo': new Date(2011, 9, 2, 3, 0, 0, 0),
              'America/Sao_Paulo': new Date(2011, 9, 16, 5, 0, 0, 0),
              'America/Los_Angeles': new Date(2011, 2, 13, 8, 0, 0, 0),
              'America/Santa_Isabel': new Date(2011, 3, 5, 8, 0, 0, 0),
              'America/Havana': new Date(2012, 2, 10, 2, 0, 0, 0),
              'America/New_York': new Date(2012, 2, 10, 7, 0, 0, 0),
              'Europe/Helsinki': new Date(2013, 2, 31, 5, 0, 0, 0),
              'Pacific/Auckland': new Date(2011, 8, 26, 7, 0, 0, 0),
              'America/Halifax': new Date(2011, 2, 13, 6, 0, 0, 0),
              'America/Goose_Bay': new Date(2011, 2, 13, 2, 1, 0, 0),
              'America/Miquelon': new Date(2011, 2, 13, 5, 0, 0, 0),
              'America/Godthab': new Date(2011, 2, 27, 1, 0, 0, 0),
              'Europe/Moscow': ru_pre_dst_change,
              'Asia/Amman': new Date(2013, 2, 29, 1, 0, 0, 0),
              'Asia/Beirut': new Date(2013, 2, 31, 2, 0, 0, 0),
              'Asia/Damascus': new Date(2013, 3, 6, 2, 0, 0, 0),
              'Asia/Jerusalem': new Date(2013, 2, 29, 5, 0, 0, 0),
              'Asia/Yekaterinburg': ru_pre_dst_change,
              'Asia/Omsk': ru_pre_dst_change,
              'Asia/Krasnoyarsk': ru_pre_dst_change,
              'Asia/Irkutsk': ru_pre_dst_change,
              'Asia/Yakutsk': ru_pre_dst_change,
              'Asia/Vladivostok': ru_pre_dst_change,
              'Asia/Baku': new Date(2013, 2, 31, 4, 0, 0),
              'Asia/Yerevan': new Date(2013, 2, 31, 3, 0, 0),
              'Asia/Kamchatka': ru_pre_dst_change,
              'Asia/Gaza': new Date(2010, 2, 27, 4, 0, 0),
              'Africa/Cairo': new Date(2010, 4, 1, 3, 0, 0),
              'Europe/Minsk': ru_pre_dst_change,
              'Pacific/Apia': new Date(2010, 10, 1, 1, 0, 0, 0),
              'Pacific/Fiji': new Date(2010, 11, 1, 0, 0, 0),
              'Australia/Perth': new Date(2008, 10, 1, 1, 0, 0, 0)
            };
          return dst_starts[tz_name];
        };
      return {
        determine: determine,
        date_is_dst: date_is_dst,
        dst_start_for: dst_start_for
      };
    }();
    /**
     * Simple object to perform ambiguity check and to return name of time zone.
     */
    jstz.TimeZone = function (tz_name) {
      'use strict';
      /**
       * The keys in this object are timezones that we know may be ambiguous after
       * a preliminary scan through the olson_tz object.
       *
       * The array of timezones to compare must be in the order that daylight savings
       * starts for the regions.
       */
      var AMBIGUITIES = {
          'America/Denver': [
            'America/Denver',
            'America/Mazatlan'
          ],
          'America/Chicago': [
            'America/Chicago',
            'America/Mexico_City'
          ],
          'America/Santiago': [
            'America/Santiago',
            'America/Asuncion',
            'America/Campo_Grande'
          ],
          'America/Montevideo': [
            'America/Montevideo',
            'America/Sao_Paulo'
          ],
          'Asia/Beirut': [
            'Asia/Amman',
            'Asia/Jerusalem',
            'Asia/Beirut',
            'Europe/Helsinki',
            'Asia/Damascus'
          ],
          'Pacific/Auckland': [
            'Pacific/Auckland',
            'Pacific/Fiji'
          ],
          'America/Los_Angeles': [
            'America/Los_Angeles',
            'America/Santa_Isabel'
          ],
          'America/New_York': [
            'America/Havana',
            'America/New_York'
          ],
          'America/Halifax': [
            'America/Goose_Bay',
            'America/Halifax'
          ],
          'America/Godthab': [
            'America/Miquelon',
            'America/Godthab'
          ],
          'Asia/Dubai': ['Europe/Moscow'],
          'Asia/Dhaka': ['Asia/Yekaterinburg'],
          'Asia/Jakarta': ['Asia/Omsk'],
          'Asia/Shanghai': [
            'Asia/Krasnoyarsk',
            'Australia/Perth'
          ],
          'Asia/Tokyo': ['Asia/Irkutsk'],
          'Australia/Brisbane': ['Asia/Yakutsk'],
          'Pacific/Noumea': ['Asia/Vladivostok'],
          'Pacific/Tarawa': [
            'Asia/Kamchatka',
            'Pacific/Fiji'
          ],
          'Pacific/Tongatapu': ['Pacific/Apia'],
          'Asia/Baghdad': ['Europe/Minsk'],
          'Asia/Baku': [
            'Asia/Yerevan',
            'Asia/Baku'
          ],
          'Africa/Johannesburg': [
            'Asia/Gaza',
            'Africa/Cairo'
          ]
        }, timezone_name = tz_name,
        /**
         * Checks if a timezone has possible ambiguities. I.e timezones that are similar.
         *
         * For example, if the preliminary scan determines that we're in America/Denver.
         * We double check here that we're really there and not in America/Mazatlan.
         *
         * This is done by checking known dates for when daylight savings start for different
         * timezones during 2010 and 2011.
         */
        ambiguity_check = function () {
          var ambiguity_list = AMBIGUITIES[timezone_name], length = ambiguity_list.length, i = 0, tz = ambiguity_list[0];
          for (; i < length; i += 1) {
            tz = ambiguity_list[i];
            if (jstz.date_is_dst(jstz.dst_start_for(tz))) {
              timezone_name = tz;
              return;
            }
          }
        },
        /**
         * Checks if it is possible that the timezone is ambiguous.
         */
        is_ambiguous = function () {
          return typeof AMBIGUITIES[timezone_name] !== 'undefined';
        };
      if (is_ambiguous()) {
        ambiguity_check();
      }
      return {
        name: function () {
          return timezone_name;
        }
      };
    };
    jstz.olson = {};
    /*
     * The keys in this dictionary are comma separated as such:
     *
     * First the offset compared to UTC time in minutes.
     *
     * Then a flag which is 0 if the timezone does not take daylight savings into account and 1 if it
     * does.
     *
     * Thirdly an optional 's' signifies that the timezone is in the southern hemisphere,
     * only interesting for timezones with DST.
     *
     * The mapped arrays is used for constructing the jstz.TimeZone object from within
     * jstz.determine_timezone();
     */
    jstz.olson.timezones = {
      '-720,0': 'Pacific/Majuro',
      '-660,0': 'Pacific/Pago_Pago',
      '-600,1': 'America/Adak',
      '-600,0': 'Pacific/Honolulu',
      '-570,0': 'Pacific/Marquesas',
      '-540,0': 'Pacific/Gambier',
      '-540,1': 'America/Anchorage',
      '-480,1': 'America/Los_Angeles',
      '-480,0': 'Pacific/Pitcairn',
      '-420,0': 'America/Phoenix',
      '-420,1': 'America/Denver',
      '-360,0': 'America/Guatemala',
      '-360,1': 'America/Chicago',
      '-360,1,s': 'Pacific/Easter',
      '-300,0': 'America/Bogota',
      '-300,1': 'America/New_York',
      '-270,0': 'America/Caracas',
      '-240,1': 'America/Halifax',
      '-240,0': 'America/Santo_Domingo',
      '-240,1,s': 'America/Santiago',
      '-210,1': 'America/St_Johns',
      '-180,1': 'America/Godthab',
      '-180,0': 'America/Argentina/Buenos_Aires',
      '-180,1,s': 'America/Montevideo',
      '-120,0': 'America/Noronha',
      '-120,1': 'America/Noronha',
      '-60,1': 'Atlantic/Azores',
      '-60,0': 'Atlantic/Cape_Verde',
      '0,0': 'UTC',
      '0,1': 'Europe/London',
      '60,1': 'Europe/Berlin',
      '60,0': 'Africa/Lagos',
      '60,1,s': 'Africa/Windhoek',
      '120,1': 'Asia/Beirut',
      '120,0': 'Africa/Johannesburg',
      '180,0': 'Asia/Baghdad',
      '180,1': 'Europe/Moscow',
      '210,1': 'Asia/Tehran',
      '240,0': 'Asia/Dubai',
      '240,1': 'Asia/Baku',
      '270,0': 'Asia/Kabul',
      '300,1': 'Asia/Yekaterinburg',
      '300,0': 'Asia/Karachi',
      '330,0': 'Asia/Kolkata',
      '345,0': 'Asia/Kathmandu',
      '360,0': 'Asia/Dhaka',
      '360,1': 'Asia/Omsk',
      '390,0': 'Asia/Rangoon',
      '420,1': 'Asia/Krasnoyarsk',
      '420,0': 'Asia/Jakarta',
      '480,0': 'Asia/Shanghai',
      '480,1': 'Asia/Irkutsk',
      '525,0': 'Australia/Eucla',
      '525,1,s': 'Australia/Eucla',
      '540,1': 'Asia/Yakutsk',
      '540,0': 'Asia/Tokyo',
      '570,0': 'Australia/Darwin',
      '570,1,s': 'Australia/Adelaide',
      '600,0': 'Australia/Brisbane',
      '600,1': 'Asia/Vladivostok',
      '600,1,s': 'Australia/Sydney',
      '630,1,s': 'Australia/Lord_Howe',
      '660,1': 'Asia/Kamchatka',
      '660,0': 'Pacific/Noumea',
      '690,0': 'Pacific/Norfolk',
      '720,1,s': 'Pacific/Auckland',
      '720,0': 'Pacific/Tarawa',
      '765,1,s': 'Pacific/Chatham',
      '780,0': 'Pacific/Tongatapu',
      '780,1,s': 'Pacific/Apia',
      '840,0': 'Pacific/Kiritimati'
    };
    if (typeof exports !== 'undefined') {
      exports.jstz = jstz;
    } else {
      root.jstz = jstz;
    }
  }(this));
  return this.jstz;
}();
models_period = function (Openhose, timezoneDetector) {
  var Period = Openhose.Backbone.Model.extend({
    INTERVAL_SECONDS: {
      'minute': 60,
      'hour': 3600,
      'day': 24 * 3600,
      'week': 7 * 24 * 3600,
      'month': 30 * 24 * 3600,
      'quarter': 3 * 30 * 24 * 3600,
      'year': 356 * 24 * 3600
    },
    INTERVAL_ALIASES: {
      'm': 'minute',
      'h': 'hour',
      'd': 'day',
      'w': 'week'
    },
    bucketAliases: {
      'month': 'month',
      'week': '1w',
      'day': '1d',
      'hour': '1h'
    },
    parseInterval: function (interval) {
      var numMatch = interval.match(/^([0-9\.]+)[a-z]+$/);
      var num = 1;
      if (numMatch && numMatch[1]) {
        num = parseFloat(numMatch[1]);
        interval = interval.replace(/[0-9\.]*/g, '');
      }
      if (interval.length == 1) {
        interval = this.INTERVAL_ALIASES[interval];
      }
      if (!this.INTERVAL_SECONDS[interval])
        return null;
      return {
        num: num,
        interval: interval,
        duration: Openhose.moment.duration(num, interval)
      };
    },
    incrementMomentByBucket: function (time) {
      time = Openhose.moment(time).tz(this.timezone());
      var bucket = this.parseInterval(this.getBucket());
      time.add(bucket.num, bucket.interval);
      return time;
    },
    decrementMomentByBucket: function (time) {
      time = Openhose.moment(time).tz(this.timezone());
      var bucket = this.parseInterval(this.getBucket());
      time.subtract(bucket.num, bucket.interval);
      return time;
    },
    incrementMomentByPeriod: function (time) {
      time = Openhose.moment(time).tz(this.timezone());
      var diff = this.get('_end') - this.get('_start') + 1;
      // small correction for the end already being -1
      var bucketCount = Math.round(diff / this.getBucketMs());
      var bucket = this.parseInterval(this.getBucket());
      var interval = 'ms';
      var count = diff;
      if ([
          'month',
          'week',
          'day'
        ].indexOf(bucket.interval) !== -1) {
        interval = bucket.interval;
        count = bucketCount;
      }
      time.add(count, interval);
      return time;
    },
    decrementMomentByPeriod: function (time) {
      time = Openhose.moment(time).tz(this.timezone());
      var diff = this.get('_end') - this.get('_start') + 1;
      // small correction for the end already being -1
      var bucketCount = Math.round(diff / this.getBucketMs());
      var bucket = this.parseInterval(this.getBucket());
      var interval = 'ms';
      var count = diff;
      if ([
          'month',
          'week',
          'day'
        ].indexOf(bucket.interval) !== -1) {
        interval = bucket.interval;
        count = bucketCount;
      }
      time.subtract(count, interval);
      return time;
    },
    bucketAsDuration: function (bucket) {
      if (!bucket) {
        bucket = this.getBucket();
      }
      var parsed = this.parseInterval(bucket);
      return parsed.duration;
    },
    intervalToMs: function (interval) {
      var parsed = this.parseInterval(interval);
      if (!parsed)
        return null;
      var intervalSeconds = this.INTERVAL_SECONDS[parsed.interval];
      return parsed.num * intervalSeconds * 1000;
    },
    initialize: function () {
      this.on('change', this._correctDayBucketTimes);
      this._correctDayBucketTimes();
    },
    timeframe: function () {
      return {
        start: this.get('_start'),
        end: this.get('_end'),
        to: this.get('_end'),
        from: this.get('_start')
      };
    },
    toMoments: function () {
      return {
        start: Openhose.moment(this.get('_start')).tz(this.timezone()),
        end: Openhose.moment(this.get('_end')).tz(this.timezone()),
        to: Openhose.moment(this.get('_end')).tz(this.timezone()),
        from: Openhose.moment(this.get('_start')).tz(this.timezone())
      };
    },
    getPreviousPeriod: function () {
      var prev = this.timeframePreviousPeriod();
      prev.bucket = this.get('bucket');
      prev.timezone = this.get('timezone');
      prev.duration = this.get('duration');
      return new Openhose.Models.Period(prev);
    },
    timeframePreviousPeriod: function () {
      if (this.getBucket() == 'day') {
        //we need to use days because otherwise we get issues with daylightsaving
        //when we use days moment correct the problems for us
        return {
          start: Openhose.moment(this.get('start')).tz(this.timezone()).subtract(this.inDays(), 'days').valueOf(),
          end: Openhose.moment(this.get('end')).tz(this.timezone()).subtract(this.inDays(), 'days').valueOf()
        };
      }
      //the -1 makes sure that there is no overlap between the current and the previous timeperiod
      return {
        start: this.get('start') - 1 - this.inMilliseconds(),
        end: this.get('end') - 1 - this.inMilliseconds()
      };
    },
    toPreviousMoments: function () {
      var timeframes = this.timeframePreviousPeriod();
      return {
        start: Openhose.moment(timeframes.start).tz(this.timezone()),
        end: Openhose.moment(timeframes.end).tz(this.timezone()),
        to: Openhose.moment(timeframes.end).tz(this.timezone()),
        from: Openhose.moment(timeframes.start).tz(this.timezone())
      };
    },
    timezone: function () {
      var timezone = this.get('timezone');
      if (!timezone) {
        timezone = timezoneDetector.determine().name();
        this.set('timezone', timezone, { silent: true });
      }
      return timezone;
    },
    inDays: function () {
      return Math.round(this.inMilliseconds() / 86400000);
    },
    inHours: function () {
      return Math.round(this.inMilliseconds() / 3600000);
    },
    inMilliseconds: function () {
      return this.get('end') - this.get('start');
    },
    getDefaultBucket: function () {
      var moments = this.toMoments();
      var start = moments.start;
      var end = Openhose.moment(moments.end + 1);
      // correct the 1ms offset on the end
      if (end.diff(start, 'years') >= 2) {
        return 'month';
      } else if (end.diff(start, 'months') >= 3) {
        // FIXME: this fails on summertime switch
        return '1w';
      } else if (end.diff(start, 'days') >= 14) {
        return '1d';
      } else if (end.diff(start, 'days') >= 7) {
        return '6h';
      } else if (end.diff(start, 'hours') >= 24) {
        return '1h';
      } else if (end.diff(start, 'hours') >= 12) {
        return '30m';
      } else if (end.diff(start, 'hours') >= 1) {
        return '10m';  //} else if (end.diff(start, 'minutes') >= 30) {
                       //  return '5m';
      } else {
        return '1m';
      }
    },
    getDuration: function () {
      return this.get('duration');
    },
    getBucket: function () {
      var bucket = this.get('bucket');
      // When it is day or hour, convert to new format
      if (this.bucketAliases[bucket]) {
        bucket = this.bucketAliases[bucket];
        this.set({ 'bucket': bucket });
      }
      if (bucket)
        return bucket;
      return this.getDefaultBucket();
    },
    getBucketMs: function () {
      var bucket = this.getBucket();
      return this.intervalToMs(bucket);
    },
    getNumSummariesToFetch: function () {
      if (this.getBucket() == 'day') {
        return this.inDays();
      }
      return Math.ceil((this.get('_end') - this.get('_start')) / this.getBucketMs());
    },
    getBucketDescription: function (options) {
      options = options || {};
      var isPredefinedTimeRange = this.get('isPredefinedTimeRange');
      if (typeof options.isPredefinedTimeRange == 'boolean') {
        isPredefinedTimeRange = options.isPredefinedTimeRange;
      }
      if (isPredefinedTimeRange) {
        var length = this.inDays();
        if (length == 30) {
          // 720 hours
          result = 'Last 30 days';
        } else if (length == 7) {
          // 168 hours
          result = 'Last 7 days';
        } else {
          result = 'Last ' + this.inHours() + ' hours';
        }
        return result;
      }
      var start = Openhose.moment(this.get('start')).tz(this.timezone());
      var end = Openhose.moment(this.get('end')).tz(this.timezone());
      // Hack for the end being till the end of a period, not including.
      if (end.millisecond() === 999) {
        end.add(1, 'millisecond');
      }
      var now = Openhose.moment().tz(this.timezone());
      var result = '';
      var startDate = {
        year: '',
        monthDay: '',
        hourMin: ''
      };
      var endDate = {
        year: '',
        monthDay: '',
        hourMin: ''
      };
      if (start.year() !== end.year()) {
        startDate.year = start.format('YYYY');
        endDate.year = end.format('YYYY');
      } else if (start.year() !== now.year()) {
        endDate.year = start.format('YYYY');
      }
      if (start.date() !== end.date() || start.month() !== end.month()) {
        if (end.diff(start, 'days') == 1) {
          startDate.monthDay = start.format('MMMM D');
          // fix the year
          startDate.year = endDate.year;
          endDate.year = '';
        } else {
          if (start.month() == end.month()) {
            startDate.monthDay = start.format('MMMM D');
            if (startDate.year && endDate.year) {
              // when the year is added, also add the month in the second one.
              endDate.monthDay = end.format('MMMM D');
            } else {
              endDate.monthDay = end.format('D');
            }
          } else {
            startDate.monthDay = start.format('MMMM D');
            endDate.monthDay = end.format('MMMM D');
          }
        }
      } else if (start.date() !== end.date() || start.month() !== end.month() || start.year() !== end.year()) {
        // special case when month and date are the same, but only year is different
        startDate.monthDay = start.format('MMMM D');
        endDate.monthDay = end.format('MMMM D');
        startDate.year = start.format('YYYY');
        endDate.year = end.format('YYYY');
      }
      if (start.hour() !== end.hour() || start.minute() !== end.minute()) {
        startDate.hourMin = start.format('h:mm A');
        endDate.hourMin = end.format('h:mm A');
        // The day should be in there
        if (!startDate.monthDay) {
          if (endDate.year && !startDate.year) {
            // prevent: January 20 1:00 AM - , 2014 2:00 AM
            // and turn it into January 20, 2014 1:00 AM - 2:00 AM
            startDate.year = endDate.year;
            endDate.year = '';
          }
          startDate.monthDay = start.format('MMMM D');
        }
      }
      var template = '<%= monthDay %><% if (year) print(\', \' + year) %> <%= hourMin %>';
      template = Openhose._.template(template);
      var startStr = template(startDate).trim();
      var endStr = template(endDate).trim();
      return startStr + (endStr ? ' - ' + endStr : '');
    },
    _nextHour: function () {
      var date = new Date();
      date.setMinutes(60, 0, 0);
      return date;
    },
    _correctDayBucketTimes: function () {
      var start = new Date(this.get('start'));
      var end = new Date(this.get('end'));
      this.set({
        _start: start.getTime(),
        _end: end.getTime()
      }, { silent: true });
      // Do this separately after a _start & _end update
      this.set({ duration: this.bucketAsDuration() }, { silent: true });
    }
  });
  Period.parse = function (period) {
    if (!period)
      return false;
    // oops we fucked up
    if (period.cid)
      return period;
    // its a backbone model
    if (!period.start && !period.end && period.to && period.from) {
      period.start = period.from;
      period.end = period.to;
      delete period.from;
      delete period.to;
    }
    return new Period(period);
  };
  Openhose.Period = Period;
  return Period;
}(core, models_helpers_timezone_detector);
models_metric = function (Openhose, AnalyticsData, MappingProcessor, API, errorLogger, parseStream, Period) {
  var Metric = AnalyticsData.extend({
    constructor: function (options) {
      this.stream = parseStream(options.stream);
      this.period = Period.parse(options.period);
      if (!this.period)
        throw new Error('Metric needs period');
      if (!this.stream)
        throw new Error('Metric needs stream');
      var opt = Openhose._.clone(options);
      delete opt.stream;
      delete opt.period;
      Openhose.Backbone.Model.call(this, opt);
    },
    initialize: function (options) {
      options = options || {};
      if (Openhose._.isString(this.get('ids'))) {
        this.set('ids', [this.get('ids')]);
      }
      var metricId = this.get('ids')[0];
      this.set('metricId', metricId);
      // Interval can have value 'false' to omit the interval from the api call
      this.interval = options.interval;
      options.mapFn = options.mapFn || this._mapFnForMetricId(metricId);
      this.relativeMetric = options.relativeMetric;
      this.populateFields();
      AnalyticsData.prototype.initialize.apply(this, [options]);
    },
    // TODO: seems to Bottlenose specific, we need a general way of dealing with this.
    populateFields: function () {
      var results = [];
      var fields = Openhose._.clone(this.get('ids') || []);
      fields.forEach(function (metric) {
        // Deal with pseudo-metrics
        switch (metric) {
        case 'simScore':
        case 'sentimentPositive':
        case 'sentimentNeutral':
        case 'sentimentNegative':
          results = results.concat([
            'volume',
            'sentimentPositive',
            'sentimentNeutral',
            'sentimentNegative'
          ]);
          break;
        case 'conversationRate':
          results = results.concat([
            'volume',
            'impressions'
          ]);
          break;
        case 'otherNetworkVolume':
          results = results.concat([
            'volume',
            'twitterVolume',
            'facebookVolume',
            'tumblrVolume'
          ]);
          break;
        case 'post':
          results = results.concat([
            'volume',
            'reply',
            'repost'
          ]);
          break;
        case 'ethnicityBlackAndWhite':
          results = results.concat([
            'ethnicityWhite',
            'ethnicityBlack',
            'ethnicityWhiteOrBlack'
          ]);
          break;
        default:
          results.push(metric);
        }
      });
      this.set('ids', results, { silent: true });
    },
    _getMetric: function (metricId) {
      metricId = metricId || this.get('metricId');
      if (Openhose._.isArray(metricId))
        metricId = metricId[0];
      return metricId;
    },
    timeline: function (metricId, options) {
      if (!options)
        options = {};
      if (!this.collection.length)
        return false;
      var values = [];
      var relativeMap = {};
      var relativeMetricId = null;
      var plotTimeShift = options.plotTimeShift || 0;
      metricId = this._getMetric(metricId);
      if (this.relativeMetric) {
        relativeMetricId = this.relativeMetric.get('metricId');
        this.relativeMetric.collection.forEach(function (timeframe) {
          relativeMap[timeframe.timestamp] = timeframe;
        });
      }
      this.relativeValues = [];
      this.collection.map(function (timeframe, i) {
        var date = new Date(Date.parse(timeframe.get('timestamp')));
        var currentTimeframe = plotTimeShift ? this.collection.at(i + plotTimeShift) : timeframe;
        var value = 0;
        if (currentTimeframe) {
          value = timeframe.get(metricId) || currentTimeframe[metricId] || 0;
        }
        var previousValue = 0;
        if (this.collection.at(i - 1)) {
          previousValue = this.collection.at(i - 1)[metricId] || 0;
        }
        values.push([
          date - 0,
          value,
          value - previousValue
        ]);
      }.bind(this));
      this.relativeMap = relativeMap;
      return values;
    },
    total: function (metricId) {
      metricId = this._getMetric(metricId);
      if (!this.collection.length)
        return false;
      return this.collection.map(function (timeframe) {
        return timeframe.get(metricId || this.get('metricId')) || 0;
      }.bind(this)).reduce(function (total, increment) {
        return total + increment;
      });
    },
    average: function (metricId) {
      metricId = this._getMetric(metricId);
      if (!this.collection.length)
        return false;
      return this.total(metricId) / this.collection.length;
    },
    getFormatter: function (options) {
      if (!options)
        options = {};
      if (this.get('formatter'))
        return this.get('formatter');
      var defaultFormat = options.defaultFormat || ',3';
      var sourceType;
      var metricId = this.get('metricId');
      if (this.stream) {
        sourceType = this.stream.get('sourceType');
      }
      if (!sourceType) {
        sourceType = 'social-media';
      }
      var metric = MappingProcessor.metricById(sourceType, metricId);
      if (!metric) {
        return Openhose.d3.format(defaultFormat);
      }
      return function (x) {
        var str = '';
        if (metric.viewOptions && metric.viewOptions.formatPrefix) {
          str += metric.viewOptions.formatPrefix;
        }
        if (metric.viewOptions && metric.viewOptions.format) {
          str += Openhose.d3.format(metric.viewOptions.format)(x);
        } else {
          str += Openhose.d3.format(defaultFormat)(x);
        }
        if (metric.viewOptions && metric.viewOptions.formatSuffix) {
          str += metric.viewOptions.formatSuffix;
        }
        return str;
      };
    },
    getLabel: function (options) {
      if (!options)
        options = {};
      if (this.get('label'))
        return this.get('label');
      var metricId = this.get('metricId');
      var mapping;
      if (this.stream) {
        mapping = this.stream.get('mapping');
      }
      var metric = MappingProcessor.metricById(mapping, metricId);
      if (metric) {
        if (options.full && metric.category) {
          return metric.category + ': ' + metric.label;
        }
        return metric.label;
      }
      return metricId.slice(0, 1).toUpperCase() + metricId.slice(1);
    },
    zeroFillSentimentHeatmap: function () {
      this.collection.forEach(function (timeframe) {
        for (var i = -18; 18 >= i; i++) {
          if (!timeframe['s' + i]) {
            timeframe['s' + i] = 0;
          }
        }
      });
    },
    zeroFillPsychHeatmap: function () {
      var metrics = MappingProcessor.metricsByCategory('social-media', 'Psych');
      this.collection.forEach(function (timeframe) {
        for (var level1key in metrics) {
          if (!timeframe[level1key]) {
            timeframe[level1key] = 0;
          }
          if (metrics[level1key].children) {
            for (var level2key in metrics[level1key].children) {
              if (!timeframe[level1key + '-' + level2key]) {
                timeframe[level1key + '-' + level2key] = 0;
              }
              if (metrics[level1key].children[level2key].children) {
                for (var level3key in metrics[level1key].children[level2key].children) {
                  if (!timeframe[level1key + '-' + level2key + '-' + level3key]) {
                    timeframe[level1key + '-' + level2key + '-' + level3key] = 0;
                  }
                }
              }
            }
          }
        }
      });
    },
    _timeValuesForPeriod: function (snapshots, field) {
      var throughputMeasurementArray = [];
      var snapshotCount = snapshots.length;
      var snapshot;
      var date;
      for (var i = 0; snapshotCount > i; i++) {
        snapshot = snapshots[i];
        date = new Date(snapshot.timestamp);
        throughputMeasurementArray.push([
          date.getTime(),
          snapshot[field]
        ]);
      }
      throughputMeasurementArray = throughputMeasurementArray.sort(function (a, b) {
        return a[0] - b[0];
      });
      return throughputMeasurementArray;
    },
    // Pseudo metrics
    _mapFnForMetricId: function (metricId) {
      var pseudoMetrics = {
        ethnicityBlackAndWhite: function (timeframe) {
          timeframe.ethnicityBlackAndWhite = (timeframe.ethnicityWhite || 0) + (timeframe.ethnicityBlack || 0) + (timeframe.ethnicityWhiteOrBlack || 0);
          return timeframe;
        },
        simScore: function (timeframe) {
          timeframe.simScore = ((timeframe.sentimentPositive || 0) + (timeframe.sentimentNeutral || 0) - (timeframe.sentimentNegative || 0)) / (timeframe.volume || 0) * 100;
          if (!isFinite(timeframe.simScore))
            timeframe.simScore = 0;
          return timeframe;
        },
        post: function (timeframe) {
          timeframe.post = timeframe.volume - (timeframe.repost || 0) - (timeframe.reply || 0);
          return timeframe;
        },
        otherNetworkVolume: function (timeframe) {
          timeframe.otherNetworkVolume = timeframe.volume - (timeframe.twitterVolume || 0) - (timeframe.facebookVolume || 0) - (timeframe.tumblrVolume || 0);
          return timeframe;
        },
        conversationRate: function (timeframe) {
          if (timeframe.volume === 0) {
            timeframe.conversationRate = 0;
          } else {
            timeframe.conversationRate = (timeframe.volume || 1) * 100 / (timeframe.impressions || 1);
          }
          return timeframe;
        }
      };
      return pseudoMetrics[metricId];
    },
    fetch: function () {
      if (this.get('fetchState') == 'loading')
        return;
      this.trigger('fetch:loading', this);
      this._fetchApiV3();
    },
    _fetchApiV3: function (options) {
      if (this.request)
        this.request.abort();
      if (!options)
        options = {};
      var timeframe = this.get('previousPeriod') ? this.period.timeframePreviousPeriod() : this.period.timeframe();
      var stream = this.stream;
      var params = {
        streamId: stream.id || Openhose.SETTINGS.streamId,
        organizationId: stream.get('organizationId') || Openhose.SETTINGS.organizationId,
        organizationToken: stream.get('organizationToken') || Openhose.SETTINGS.organizationToken,
        userId: stream.get('userId') || Openhose.SETTINGS.userId,
        userToken: stream.get('userToken') || Openhose.SETTINGS.userToken,
        from: timeframe.start,
        to: timeframe.end,
        timezone: this.period.timezone()
      };
      // Make sure to not send empty values so that APIs and proxies take proper defaults
      for (var key in params) {
        if (!params[key] === undefined)
          delete params[key];
      }
      // Always use interval param, except for when explicitly omitted in options
      if (this.interval !== false) {
        params.interval = this.interval || this.period.getBucket();
      }
      if (this.get('normalizeSampleRate'))
        params.normalizeSampleRate = this.get('normalizeSampleRate');
      params.filter = {};
      if (this.options && this.options.entities && this.options.entities.length) {
        params.filter.entities = this.options.entities.map(function (entity) {
          entity = entity.split(':');
          var type = entity[0];
          var id = entity[1];
          return [
            type,
            id
          ].map(encodeURIComponent).join(':');
        });
      }
      if (this.get('filter')) {
        var filter = Openhose._.extend(params.filter || {}, this.get('filter'));
        if (filter.excludeEntities) {
          filter.excludeEntities = filter.excludeEntities.map(function (item) {
            return encodeURIComponent(item.entityType) + ':' + encodeURIComponent(item.id);
          });
        }
        params.filter = filter;
      }
      params.ids = this.get('ids');
      var path = '/metrics';
      if (this.get('type') == 'demographics') {
        path = '/demographics/metrics';
        params.metricIds = params.ids.concat();
        params.ids = 'stream:*';
      }
      this.request = API.getUrl(path, params, this._handleApiV3Response.bind(this, options));
    },
    _handleApiV3Response: function (options, error, response) {
      this.request = null;
      if (!this.collection)
        return;
      if (error && error.statusCode) {
        this.trigger('fetch:error', this, 'Could not retrieve metrics for ' + this.getLabel());
        return false;
      }
      if (response && response.queued || error && !error.statusCode) {
        if (!options.requestCount)
          options.requestCount = 0;
        options.requestCount++;
        options.queued = true;
        if (!this._eventFired && options.requestCount > 25) {
          this._eventFired = true;
          errorLogger('[Metric] Timeout while fetching', { extra: options });
        }
        this.fetchTimer = setTimeout(this._fetchApiV3.bind(this, options), 2000);
        return;
      }
      if (response.error) {
        this.trigger('fetch:error', this, 'Error while fetching metrics: ' + response.error.message);
        return false;
      }
      var results = response.result;
      if (!results) {
        results = [];
      }
      results = results.sort(function (a, b) {
        return a.timestamp - b.timestamp;
      });
      results = results.map(function (result) {
        var obj = {};
        if (result.timestamp) {
          obj.timestamp = new Date(result.timestamp).toISOString();
        }
        if (result.error)
          obj.error = result.error;
        if (result.normalizedValues)
          result.values = result.normalizedValues;
        for (var entityMetricId in result.values) {
          // get metricId from entityMetricId (hacky)
          var metricId = entityMetricId.split(':');
          metricId = metricId[metricId.length - 1];
          obj[metricId] = result.values[entityMetricId];
        }
        return obj;
      });
      if (!Openhose._.isArray(results)) {
        this.trigger('fetch:error', this, error && error.message);
        return;
      }
      if (this.mapFn) {
        results = results.map(this.mapFn);
      }
      if (this.get('postProcess'))
        results = results.filter(this.get('postProcess'));
      this.collection.reset(results);
      this._mapReduceAdvancedQueries && this._mapReduceAdvancedQueries();
      this.trigger('fetch:success', this);
      return this.collection;
    }
  });
  Openhose.Metric = Metric;
  return Metric;
}(core, models_analytics_data, lib_mapping_processor, lib_api, lib_error_logger, lib_parse_stream, models_period);
models_helpers_meta = function (Openhose) {
  function MetaHelper() {
    this._cache = {};
  }
  MetaHelper.prototype = {
    fetch: function (dataType, callback) {
      if (this.isSupportedDataType())
        throw new Error('Not Valid DataType:' + dataType + '. Please add a source for ' + dataType + ' in `entityMapping` in your settings.');
      if (this._cache[dataType]) {
        return callback();
      }
      Openhose.$.getJSON(this._getPath(dataType)).then(function (data) {
        this._handleFetchResponse(dataType, data);
        callback();
      }.bind(this));
    },
    getValue: function (dataType, id) {
      if (this.isSupportedDataType())
        throw new Error('Not Valid DataType:' + dataType + '. Please add a source for ' + dataType + ' in `entityMapping` in your settings.');
      var data = this._cache[dataType];
      return data[id.toLowerCase()];
    },
    getLabel: function (dataType, id) {
      if (this.isSupportedDataType())
        throw new Error('Not Valid DataType:' + dataType + '. Please add a source for ' + dataType + ' in `entityMapping` in your settings.');
      var data = this._cache[dataType];
      return data[id.toLowerCase()].name;
    },
    isSupportedDataType: function (dataType) {
      return Openhose._.keys(Openhose.SETTINGS.entityMapping).indexOf(dataType) != -1;
    },
    _getPath: function (dataType) {
      return Openhose.SETTINGS.entityMapping[dataType];
    },
    _handleFetchResponse: function (dataType, data) {
      var dataTypeCache = this._cache[dataType] = {};
      //TODO: clean me up, this alpha-2 business is too Nerve Center specific...
      data.forEach(function (d) {
        if (d.name && d['alpha-2']) {
          dataTypeCache[d['alpha-2'].toLowerCase()] = d;
        }
        if (d.name && d['alpha-3']) {
          dataTypeCache[d['alpha-3'].toLowerCase()] = d;
        }
      });
    }
  };
  return new MetaHelper();
}(core);
models_trend_metric = function (Openhose, Metric, MetaHelper) {
  var TrendMetric = Metric.extend({
    defaults: { objectType: 'TrendMetric' },
    initialize: function (options) {
      this.options = options;
      var metricIds = options.metricIds;
      if (!metricIds) {
        metricIds = [options.metricId];
      }
      var ids = [];
      metricIds.forEach(function (metricId) {
        var id = [];
        if (this.get('type'))
          id.push(this.get('type'));
        id.push(this.get('entityType'));
        id.push(options.id);
        if (Openhose._.isArray(metricId)) {
          Openhose._.each(metricId, function (m) {
            ids.push(Openhose._.union(id, [m]));
          });
        } else {
          id.push(metricId);
          ids.push(id);
        }
      }.bind(this));
      this.set('ids', ids.map(function (id) {
        return id.map(encodeURIComponent).join(':');
      }));
      Metric.prototype.initialize.apply(this, [options]);
      this.set('metricId', metricIds[0]);
    },
    _fetchMetaDependencies: function (callback) {
      if (MetaHelper.isSupportedDataType(this.get('type')))
        MetaHelper.fetch(this.get('type'), callback);
      return callback();
    },
    getLabel: function (options) {
      var metricLabel;
      if (this.get('label'))
        return this.get('label');
      if (options && options.context == 'trend' && this.get('metricId')) {
        metricLabel = Metric.prototype.getLabel.apply(this, [options]);
        return metricLabel;
      }
      var model = this.collection.at(0);
      var title = model && model.title || this.id || '';
      if (MetaHelper.isSupportedDataType(this.get('type'))) {
        return MetaHelper.getLabel(this.get('type'), title);
      }
      if (options && options.full) {
        metricLabel = Metric.prototype.getLabel.apply(this, [options]);
        return title.titleize() + ' ' + metricLabel;
      }
      return title;
    },
    // XXX not used in app, but called in the process
    // but don't want to remove before there a long term plan
    _mapReduceAdvancedQueries: function () {
      return;
      if (this.keywords.length <= 1)
        return;
      var newSummaries = [];
      var summariesByTime = {};
      for (var i = 0; this.collection.models.length > i; i++) {
        var summary = _.clone(this.collection.models[i]);
        var existingSummary = summariesByTime[summary.timestamp];
        if (!existingSummary) {
          summariesByTime[summary.timestamp] = summary;
        } else {
          var allKeys = _.uniq(_.keys(summary).concat(_.keys(existingSummary)));
          for (var k = 0; allKeys.length > k; k++) {
            if (allKeys[k] == 's0') {
            }
            if (typeof existingSummary[allKeys[k]] == 'number' || typeof summary[allKeys[k]] == 'number') {
              if (!existingSummary[allKeys[k]]) {
                existingSummary[allKeys[k]] = 0;
              }
              existingSummary[allKeys[k]] += summary[allKeys[k]] || 0;
            }
          }
        }
        summariesByTime[summary.timestamp].title = this.get('metricId');
      }
      newSummaries = _.values(summariesByTime);
      this.collection.reset(newSummaries);
    }
  });
  Openhose.TrendMetric = TrendMetric;
  return TrendMetric;
}(core, models_metric, models_helpers_meta);
models_stream_metric = function (Openhose, Metric) {
  var StreamMetric = Metric.extend({
    defaults: { objectType: 'StreamMetric' },
    initialize: function (options) {
      if (Openhose._.isString(options.ids)) {
        options.ids = [options.ids];
      }
      this.set('ids', options.ids);
      this.options = options;
      Metric.prototype.initialize.apply(this, [options]);
      this.set('metricId', options.ids[0]);
    },
    summaryNumber: function (field) {
      if (!this.collection.length)
        return [];
      return this.collection.map(function (timeframe) {
        return timeframe[field];
      }).reduce(function (total, value) {
        return total + value;
      });
    },
    getUrl: function () {
      return Openhose.SETTINGS.apiHost + '/1/metrics?' + Openhose.$.param(this._getParams());
    },
    _getParams: function () {
      var timeframe = this.get('previousPeriod') ? this.period.timeframePreviousPeriod() : this.period.timeframe();
      var periodBucket = this.period.getBucket();
      var limit = this.period.getNumSummariesToFetch();
      var stream = this.stream;
      var params = {
        start: timeframe.start,
        end: timeframe.end,
        period: periodBucket,
        limit: limit,
        organizationId: stream.get('organizationId') || Openhose.SETTINGS.organizationId,
        organizationToken: stream.get('organizationToken') || Openhose.SETTINGS.organizationToken,
        userId: stream.get('userId') || Openhose.SETTINGS.userId,
        userToken: stream.get('userToken') || Openhose.SETTINGS.userToken,
        streamId: stream.id || Openhose.SETTINGS.streamId
      };
      if (this.get('normalizeSampleRate')) {
        params.normalizeSampleRate = this.get('normalizeSampleRate');
      }
      if (this.get('filter')) {
        var filter = Openhose._.extend(params.filter || {}, this.get('filter'));
        if (filter.excludeEntities) {
          filter.excludeEntities = filter.excludeEntities.map(function (item) {
            return encodeURIComponent(item.entityType) + ':' + encodeURIComponent(item.id);
          });
        }
        params.filter = filter;
      }
      return params;
    },
    fieldEncoding: function (field) {
      return [
        'stream',
        field
      ].map(encodeURIComponent).join(':');
    }
  });
  Openhose.StreamMetric = StreamMetric;
  return StreamMetric;
}(core, models_metric);
models_dimension = function (Openhose, AnalyticsData, TrendMetric, MetaHelper, Metric, API, errorLogger, parseStream, Period) {
  var Dimension = AnalyticsData.extend({
    constructor: function (options) {
      this.stream = parseStream(options.stream);
      this.period = Period.parse(options.period);
      if (!this.period)
        throw new Error('Dimension need period');
      if (!this.stream)
        throw new Error('Dimension need stream');
      var opt = Openhose._.clone(options);
      delete opt.stream;
      delete opt.period;
      Openhose.Backbone.Model.call(this, opt);
    },
    initialize: function (options) {
      this.options = options;
      this.includeStream = options.includeStream;
      this.dateLimit = options.dateLimit || false;
      this.fetchCount = options.fetchCount || false;
      AnalyticsData.prototype.initialize.apply(this, [options]);
      this.collection = new Openhose.Backbone.Collection();
      this.collection.comparator = null;
      if (options.collectionComparator) {
        this.collection.comparator = options.collectionComparator;
      }
      this.MetaHelper = MetaHelper;
    },
    clean: function () {
      this.metrics && this.metrics.forEach(function (metric) {
        metric && metric.release && metric.release();
      });
      this.collection && this.collection.reset([], { silent: true });
    },
    getUrl: function () {
      var url = '/entities';
      if (this.get('type') == 'demographics') {
        url = '/demographics/entities';
      }
      return url;
    },
    getParamsV3: function (options) {
      if (!options)
        options = {};
      //var timeframe = this.get('previousPeriod') ? this.period.timeframePreviousPeriod() : this.period.timeframe();
      var timeframe = this.period.timeframe();
      var stream = this.stream;
      var order = this.get('order') || 'desc';
      if (typeof order !== 'string') {
        order = order === -1 ? 'desc' : 'asc';
      }
      var params = {
        streamId: stream.id || Openhose.SETTINGS.streamId,
        organizationId: stream.get('organizationId') || Openhose.SETTINGS.organizationId,
        organizationToken: stream.get('organizationToken') || Openhose.SETTINGS.organizationToken,
        userId: stream.get('userId') || Openhose.SETTINGS.userId,
        userToken: stream.get('userToken') || Openhose.SETTINGS.userToken,
        entityTypes: this.get('entityTypes'),
        from: timeframe.start,
        to: timeframe.end,
        limit: this.get('limit'),
        metrics: this.get('metrics'),
        sort: this.get('sort'),
        order: order,
        minVolume: this.get('minVolume'),
        includeStream: true,
        previousPeriod: this.get('previousPeriod'),
        timezone: this.period.timezone(),
        appName: Openhose.SETTINGS.appName
      };
      // Make sure to not send empty values so that APIs and proxies take proper defaults
      for (var key in params) {
        if (params[key] === undefined)
          delete params[key];
      }
      if (this.get('normalizeSampleRate'))
        params.normalizeSampleRate = this.get('normalizeSampleRate');
      if (this.get('filter')) {
        var filter = Openhose._.extend(params.filter || {}, this.get('filter'));
        if (filter.excludeEntities) {
          filter.excludeEntities = filter.excludeEntities.map(function (item) {
            return encodeURIComponent(item.entityType) + ':' + encodeURIComponent(item.id);
          });
        }
        params.filter = filter;
      }
      if (this.get('type') == 'demographics') {
        params.entityTypes = [
          'demographics',
          params.entityTypes
        ].map(encodeURIComponent).join(':');
      }
      if (options.offset) {
        params.limit = options.offset + this.get('limit');
      }
      // if (!params.organizationToken && !params.organizationId) {
      //   if (app.me && app.me.user) {
      //     params.userId = app.me.user.id;
      //     params.userToken = app.me.user.apiToken;
      //   }
      // }
      var entityFilter = options.entityFilter || options.title || this.get('entityFilter');
      if (entityFilter) {
        params.entityFilter = entityFilter.replace(/\*/g, '').toLowerCase();
      }
      return params;
    },
    fetch: function (options) {
      if (this.fetchTimer)
        clearTimeout(this.fetchTimer);
      options = options || {};
      this.trigger('fetch:loading', this);
      if (options.reset)
        this.clean();
      this._fetchMetaDependencies(function () {
        this._fetchApiV3(options);
      }.bind(this));
    },
    release: function () {
      if (this.fetchTimer)
        clearTimeout(this.fetchTimer);
      this.clean();
      AnalyticsData.prototype.release.apply(this, []);
    },
    getLabelForSummary: function (summary) {
      summary = summary.toJSON ? summary.toJSON() : summary;
      var entityType = this.get('entityTypes')[0];
      //TODO: we need an alternative way of doing this
      if (MetaHelper.isSupportedDataType(entityType)) {
        return MetaHelper.getLabel(entityType, summary.id.toLowerCase()) || summary.title;
      }
      //TODO: Replace me, this much too Nerve Center specific
      switch (entityType) {
      case 'tags':
        return '#' + summary.title;
      case 'actors':
        if (summary.network == 'twitter') {
          return '@' + summary.title;
        } else {
          return summary.title;
        }
        break;
      case 'mentions':
        if (summary.network == 'twitter') {
          return '@' + summary.title;
        } else {
          return summary.title;
        }
        break;
      /* disabled in https://trello.com/card/reorganize-and-merge-views/50e88f24a977af843c0023e9/301 something
      case 'types':
        if(bn.semantics && bn.semantics.types) {
          var type = bn.semantics.types[summary.title];
          if(type) {
            return type.name;
          }
        }
        return summary.title;
      */
      default:
        var title = summary.title || summary.id || 'unknown';
        return title.titleize ? title.titleize() : title;
      }
    },
    table: function (mapping, options) {
      var sortMetricId = this.get('sort');
      var labels = {};
      if (!options) {
        options = {};
      }
      for (var id in mapping) {
        labels[id] = mapping[id].label;
        if (!sortMetricId) {
          sortMetricId = id;
        }
      }
      if (options.sort) {
        sortMetricId = options.sort;
      }
      var tableData = {
        labels: labels,
        values: []
      };
      if (!this.collection.length)
        return false;
      for (var i = 0; this.collection.models.length > i; i++) {
        var object = this.collection.at(i).toJSON();
        var valueObject = {
          id: object.id,
          label: options.labelFn && options.labelFn(object) || this.getLabelForSummary(object),
          title: object.title,
          entityType: object.entityType
        };
        if (object.imageUrl) {
          valueObject.imageUrl = Openhose.SETTINGS.imageUrlFormatter ? Openhose.SETTINGS.imageUrlFormatter(object.imageUrl) : object.imageUrl;
        }
        var lastValue = null;
        for (id in mapping) {
          if (mapping[id].getValue) {
            lastValue = mapping[id].getValue(object);
          } else {
            lastValue = object[mapping[id].metricId];
          }
          valueObject[id] = lastValue;
        }
        if (options.filter && !options.filter(valueObject)) {
          continue;
        }
        tableData.values.push(valueObject);
      }
      // Support percentage
      for (var id in mapping) {
        if (mapping[id].percentage) {
          var max = Openhose._.reduce(tableData.values.map(function (value) {
            return value[mapping[id].metricId] || 0;
          }), function (total, num) {
            return total + num;
          }, 0);
          tableData.values.forEach(function (value) {
            value[mapping[id].metricId] = (value[mapping[id].metricId] || 0) / max;
          });
        }
      }
      if (!tableData.values.length)
        return false;
      return tableData;
    },
    _fetchMetaDependencies: function (callback) {
      var entityType = this.get('entityTypes')[0];
      if (MetaHelper.isSupportedDataType(entityType))
        return MetaHelper.fetch(entityType, callback);
      return callback();
    },
    _fetchTrendMetrics: function () {
      if (!this.includeTrendMetricId) {
        this.trigger('fetch:success', this);
        return;
      }
      this.metrics = [];
      var metricId = this.get('metrics')[0];
      // FIXME: do ALL the entities, not just one
      var dimensionId = this.get('entityTypes')[0];
      this.collection.forEach(function (summary) {
        summary = summary.toJSON();
        var trendMetric = new TrendMetric(Openhose._.extend(summary, {
          period: this.period,
          stream: this.stream,
          entityType: dimensionId,
          id: summary.title,
          //metricId: metricId
          metricIds: this.get('metrics')
        }));
        trendMetric.fetch();
        this.metrics.push(trendMetric);
      }.bind(this));
      this._fireSuccessWhenTrendMetricsAreDone();
    },
    _fireSuccessWhenTrendMetricsAreDone: function () {
      var done = true;
      var error = false;
      this.metrics.forEach(function (metric) {
        if (metric.get('fetchState') != 'success') {
          done = false;
        }
        if (metric.get('fetchState') == 'error') {
          error = true;
          return this.trigger('fetch:error', this, 'Could not retrieve metrics for ' + metric.get('name'));
        }
      }.bind(this));
      if (error)
        return;
      if (done) {
        return this.trigger('fetch:success', this);
      } else {
        setTimeout(this._fireSuccessWhenTrendMetricsAreDone.bind(this), 100);
      }
    },
    detectVolume: function (callback) {
      var metric = new Metric({
        stream: this.stream,
        period: this.period,
        ids: ['volume']
      });
      metric.collection.once('reset', function () {
        callback(metric.total('volume'));
      });
      metric.fetch();
    },
    _fetchApiV3: function (options) {
      if (this.request)
        this.request.abort();
      options = options || {};
      if (!Openhose._.isBoolean(options.volumeCheck)) {
        options.volumeCheck = true;
      }
      var params = this.getParamsV3(options);
      var entityType = this.get('entityTypes')[0];
      var self = this;
      if (options.volumeCheck && this.get('sort') == 'netPositiveImpressions') {
        this.detectVolume(function (count) {
          if (count < 1000000) {
            self._fetchApiV3(Openhose._.extend(options, { volumeCheck: false }));
          } else {
            self.collection.trigger('sync');
            self.trigger('fetch:error', self, 'The messages volume is too high for this calculation. Select a smaller timeframe');
          }
        });
        return;
      }
      if (this.get('type') == 'demographics' && [
          'age',
          'brands dressed by',
          'brands eat/drink at',
          'brands shop at',
          'family status',
          'native language',
          'occupations',
          'personal income',
          'religion'
        ].indexOf(entityType) != -1 && this.period.inDays() == 1) {
        this.collection.trigger('sync');
        return this.trigger('fetch:noDataAvailable', this);
      }
      if (this.dateLimit && this.period.inDays() > this.dateLimit) {
        this.collection.trigger('sync');
        //XXX is need a little delay otherwise the widget gets confused, if loading state
        setTimeout(function () {
          this.trigger('fetch:noDataAvailable', this);
        }.bind(this), 0);
        return;
      }
      this.request = API.getUrl(this.getUrl(), params, this._handleApiV3Response.bind(this, options));
    },
    _handleApiV3Response: function (options, error, response) {
      this.request = null;
      if (!this.collection)
        return;
      if (error && error.statusCode) {
        var message = 'Service Unavailable. Please try again later or contact support if this keeps happening.';
        if (error.message.match(/demographic samples/)) {
          message = 'Not enough demographic samples available to provide statistical accuracy. Please try again later or select a different timeframe.';
        }
        this.trigger('fetch:error', this, message);
        return false;
      }
      if (response && response.queued || error && error.statusCode) {
        if (!options.requestCount)
          options.requestCount = 0;
        options.requestCount++;
        options.queued = true;
        if (!this._eventFired && options.requestCount > 25) {
          this._eventFired = true;
          errorLogger('[Dimension] Timeout while fetching', { extra: options });
        }
        this.fetchTimer = setTimeout(this.fetch.bind(this, options), 2000);
        return;
      }
      this.set('count', response.total);
      // Convert to legacy format for now
      var results = response.result;
      var streamTotal = {};
      if (results.length && results[0].entity) {
        for (var i = 0; i < results.length; i++) {
          if (results[i].entity && results[i].entity.entityType == 'stream') {
            streamTotal = results[i].normalizedValues || results[i].values;
            results.splice(i, 1);
            break;
          }
        }
      }
      this.set('totals', streamTotal);
      results = results.map(function (result) {
        var key;
        var metricId;
        var obj = {
          id: result.entity.id,
          title: result.entity.title || result.entity.id,
          entityType: result.entity.entityType
        };
        if (result.entity.object) {
          for (key in result.entity.object) {
            obj[key] = result.entity.object[key];
          }
          obj.title = obj.title || result.entity.object.id;
        }
        if (result.entity.entityType == 'actors') {
          obj.title = result.entity.object.displayName;
          obj.network = result.entity.object.network;
          obj.imageUrl = result.entity.object.imageUrl;
        }
        if (result.normalizedValues)
          result.values = result.normalizedValues;
        for (metricId in result.values) {
          obj[metricId] = result.values[metricId];
        }
        return obj;
      });
      if (this.get('postProcess'))
        results = results.filter(this.get('postProcess'));
      this.collection.reset(results, { gotoRef: this.collection.last() });
      this.collection.trigger('sync');
      this._fetchTrendMetrics();
      return this.collection;
    }
  });
  Openhose.Dimension = Dimension;
  return Dimension;
}(core, models_analytics_data, models_trend_metric, models_helpers_meta, models_stream_metric, lib_api, lib_error_logger, lib_parse_stream, models_period);
models_main = function (Openhose, Metric, Dimension, Period) {
  var subModules = {};
  subModules.Metric = Metric;
  subModules.Dimension = Dimension;
  subModules.Period = Period;
  Openhose.Models = subModules;
  return Openhose;
}(core, models_metric, models_dimension, models_period);
widgets_analytics_wrapper = function (Openhose, Mapping) {
  return Openhose.Backbone.View.extend({
    className: 'openhose-wrapper',
    modelFetchStates: {
      notLoaded: 'notLoaded',
      loading: 'loading',
      success: 'success',
      error: 'error',
      noDataAvailable: 'noDataAvailable'
    },
    // Options available:
    // ==================
    //
    // view: function() { new Backbone.View(); }      // (required) function that generates the view
    // metrics:                                       // (required*)
    // dimensions:                                    // (required*)
    // dependencies:                                  // (required*)
    //
    // *you need at least one `metrics`, `dimensions` or `dependencies` object
    initialize: function (options) {
      this.options = options;
      this.metrics = options.metrics || [];
      this.dimensions = options.dimensions || [];
      this.dependencies = options.dependencies || [];
      this.processor = options.processor;
      this.loadedView = options.view;
      this.deferred = options.deferred || Openhose.$.Deferred();
      this.currentlyLoadedView = null;
      this.disableLoadingIndicator = options.disableLoadingIndicator;
      this.allDependencies = [].concat(this.metrics, this.dimensions, this.dependencies);
      this._defineDependencyStates(this.allDependencies);
      this._hookupBindings(this.allDependencies);
      this.on('noData', this._renderNoDataView, this);
    },
    onDestroy: function () {
      this._releasePreviousView();
    },
    _hookupBindings: function (dependencies) {
      Openhose._.each(dependencies, function (model) {
        this.listenTo(model, 'request', this._modelFetchLoading);
        this.listenTo(model, 'fetch:loading', this._modelFetchLoading);
        this.listenTo(model, 'fetch:success', this._modelFetchSuccess);
        this.listenTo(model, 'fetch:error', this._modelFetchFailed);
        this.listenTo(model, 'fetch:noDataAvailable', this._modelFetchNoData);
      }.bind(this), this);
    },
    _defineDependencyStates: function (dependencies) {
      this.dependencyStates = {};
      (dependencies || []).forEach(function (model) {
        this.dependencyStates[model.cid] = model.get('fetchState');  // 'notLoaded', 'loading', 'success', 'error', 'noDataAvailable'
      }.bind(this));
    },
    // querying different states
    _modelFetchLoading: function (model) {
      this.dependencyStates[model.cid] = this.modelFetchStates['loading'];
      //XXX this is to make sure the embeds doesnt flash every 30 secs
      if (!this.disableLoadingIndicator) {
        this._anyModelsLoading() && this.render();
      }
    },
    _modelFetchSuccess: function (model) {
      this.dependencyStates[model.cid] = this.modelFetchStates['success'];
      if (this._allModelsFetchedSuccessfully()) {
        this.trigger('fetch', this.deferred, {
          metric: this.metrics,
          dimensions: this.dimensions
        });
        // FIXME: remove this, and handle deferred some other way
        if (this.deferred.state() === 'rejected') {
          return;
        }
        this._renderLoadedView();
      }
    },
    _modelFetchFailed: function (model, message) {
      this.dependencyStates[model.cid] = this.modelFetchStates['error'];
      this._renderModelFetchError(message);
    },
    _modelFetchNoData: function (model) {
      this.dependencyStates[model.cid] = this.modelFetchStates['noDataAvailable'];
      this.trigger('noData', true);
    },
    _allModelsFetchedSuccessfully: function () {
      var success = this.modelFetchStates['success'];
      return Openhose._.all(this.dependencyStates, function (state) {
        return state == success;
      });
    },
    _anyModelsLoading: function () {
      var loading = this.modelFetchStates['loading'];
      return Openhose._.any(this.dependencyStates, function (state) {
        return state == loading;
      });
    },
    _anyModelsNeedLoading: function () {
      var loading = this.modelFetchStates['notLoaded'];
      return Openhose._.any(this.dependencyStates, function (state) {
        return state == loading;
      });
    },
    _anyModelsWithoutDataAvailable: function () {
      var noData = this.modelFetchStates['noDataAvailable'];
      return Openhose._.any(this.dependencyStates, function (state) {
        return state == noData;
      });
    },
    _anyModelsFetchedUnsuccessfully: function () {
      var error = this.modelFetchStates['error'];
      return Openhose._.any(this.dependencyStates, function (state) {
        return state == error;
      });
    },
    _isMappingLoading: function () {
      var mapping = Openhose._.chain(this.allDependencies).map(function (model) {
        if (model.stream)
          return model.stream.get('mapping');
      }).uniq().compact().value();
      return Mapping.isLoading(mapping);
    },
    // Render different view states
    _renderLoadedView: function () {
      this._releasePreviousView();
      var view = this.loadedView();
      if (!view) {
        // No data to render this view...
        this.trigger('noData', false);
        return;
      }
      this.listenTo(view, 'noData', this.trigger.bind(this, 'noData'));
      this.$el.removeClass('no-data');
      this.$el.empty().append(view.el);
      this.trigger('before:process', this.deferred, {
        metric: this.metrics,
        dimensions: this.dimensions
      });
      if (this.deferred.state() === 'rejected')
        return;
      this.processor.process.bind(this)(view);
      this.trigger('process', this.deferred, {
        metric: this.metrics,
        dimensions: this.dimensions
      }, view.data);
      if (this.deferred.state() === 'rejected')
        return;
      this.trigger('before:render', this.deferred, {
        metric: this.metrics,
        dimensions: this.dimensions
      }, view.data);
      view.render();
      this.currentlyLoadedView = view;
      this.trigger('render', this.deferred, {
        metric: this.metrics,
        dimensions: this.dimensions
      }, view.data);
    },
    _renderLoadingView: function () {
      if (this.disableLoadingIndicator)
        return;
      this._releasePreviousView();
      this.$el.html('<div class="loading"><span class="icon spinner"></span>Loading</div>');
    },
    _renderPlaceholder: function () {
      this._releasePreviousView();
      this.$el.html('<div class="loading">Data needs fetching...</div>');
    },
    _renderNoDataView: function (periodUnavailable) {
      this._releasePreviousView();
      if (periodUnavailable) {
        this.$el.html('<div class="no-data-message"><h4>Not Available</h4>This view is not available. This might be because the stream you are in does not contain enough data or data variety for this view, or it might be that the timeframe is too small or large. (Try changing the timeframe)</div>');
        this.$el.addClass('no-data');
      } else {
        this.$el.html('<div class="no-data-message"><h4>Not Enough Data</h4><p>There wasn\'t enough data, or variety in data, to render this view (Try changing the timeframe)</p></div>');
        this.$el.addClass('no-data');
      }
    },
    _renderModelFetchError: function (message) {
      this._releasePreviousView();
      this.$el.html('<div class="no-data-message"><h4>Problem detected</h4><p>' + (message || 'Oops an error occurred, please try again later...') + '</p>');
    },
    _releasePreviousView: function () {
      if (!this.currentlyLoadedView)
        return;
      this.currentlyLoadedView.off();
      this.currentlyLoadedView.destroy();
      delete this.currentlyLoadedView;
    },
    // port from marionette to backbone
    render: function () {
      this.onRender();
      return this;
    },
    onRender: function () {
      this.$el.addClass(this.options.cssClass || '');
      if (this._allModelsFetchedSuccessfully()) {
        this._renderLoadedView();
      } else if (this._anyModelsLoading()) {
        this._renderLoadingView();
      } else if (this._anyModelsWithoutDataAvailable()) {
        this.trigger('noData', true);
      } else if (this._anyModelsFetchedUnsuccessfully()) {
        this._renderModelFetchError();
      } else if (this._anyModelsNeedLoading()) {
        this._renderPlaceholder();
      } else if (this._isMappingLoading()) {
        this._renderLoadingView();
      } else {
        console.error('Unexpected case when rendering block view', JSON.stringify(this.dependencyStates));
      }
    },
    destroy: function (keepSharedEl) {
      if (this.isDestroyed)
        return;
      this.trigger.apply(this, ['before:destroy'].concat(arguments));
      // mark as destroyed before doing the actual destroy, to
      // prevent infinite loops within "destroy" event handlers
      // that are trying to destroy other views
      this.isDestroyed = true;
      this.trigger.apply(this, ['destroy'].concat(arguments));
      // remove the view from the DOM
      if (!keepSharedEl)
        this.remove();
      // remove all listeners
      this.stopListening();
      return this;
    }
  });
}(core, lib_mapping_processor);
text_templates_color_listjson = '{\n  "comparison": ["#1F77B4", "#a4d383"],\n  "gender": ["#619fc9", "#f2a2d0"],\n  "ethnicity": ["#1F77B4", "#AEC7E8", "#FF7F0E", "#FFBB78", "#2CA02C"],\n  "sentiment": ["#6DDE70", "#E86F6F", "#DCE6DD"],\n  "sentiment-heatmap": ["#FA2D2D","#F54242","#F04D4D","#ED5858","#E86161","#E86F6F","#E87979","#E88989","#E69191","#E8A0A0","#E6ACAC","#E6B8B8","#E3C1C1","#E3C5C5","#EDDADA","#F2E9E9","#F5EBEB","#F7F5F5","#DCE6DD","#D3DED3","#C6CFC6","#BACFBA","#A9C9AA","#A5CFA6","#A3D6A4","#92D693","#89D68B","#7ED681","#76DB79","#6DDE70","#63E066","#58E85C","#47ED4B","#3CF040","#28F72D","#1FFF24"],\n  "bottlenose": ["#36a1e8", "#f78f1d", "#1bc9a7", "#ff7bac", "#a65fc3", "#3b526b", "#fecb00", "#a0b2b3", "#f4503f", "#cdd31f", "#9c1581", "#49a708", "#5833fe", "#8d6f61", "#f52782", "#adb88a", "#b22341", "#660a1d", "#c09785", "#2d5b0d", "#1a1a1a", "#4d4d4d", "#808080", "#b3b3b3", "#e6e6e6" ] ,\n  "sentiment-distribution": ["#6DDE70", "#DCE6DD", "#E86F6F"],\n  "sentiment-stacked": ["#FF0000", "#EA9999", "#F4D6D6", "#F3F3F3", "#D9EAD3", "#A0EA92", "#00FF00"]\n}\n';
widgets_base = function (Openhose, Period, Metric, StreamMetric, TrendMetric, Dimension, AnalyticsWrapper, analyticsViews, colorList, MappingProcessor, parseStream) {
  //// Available Parameters
  // el: Openhose.$(".number.widget2"),
  // title: 'Total Volume',
  // data : {
  //   metrics: {
  //     ids: ['volume']
  //   }
  // },
  // cssClass: 'small-height',
  // viewOptions: {label: 'Mentions'},
  // stream: {
  //   id: ...,
  //   organizationToken: ...,
  //   organizationId: ...
  // },
  // period: {
  //   from: 1408367183762,
  //   to: 1410952784336
  // }
  var widgetOptions = [
    'el',
    'options',
    'viewOptions',
    'className',
    'tagName',
    'stream',
    'period',
    'mapping',
    'data',
    'title',
    'processor',
    'enableProgress',
    'colors',
    'colorList',
    'updateInterval'
  ];
  var WidgetBase = function (options) {
    // this.cid = Openhose._.uniqueId('widget');
    options || (options = {});
    Openhose._.extend(this, Openhose._.pick(options, widgetOptions));
    if (Openhose._.isNull(this.mapping) || Openhose._.isUndefined(this.mapping)) {
      this.mapping = Openhose.SETTINGS.mapping;
    }
    if (Openhose._.isNull(this.enableProgress) || Openhose._.isUndefined(this.enableProgress)) {
      this.enableProgress = Openhose.SETTINGS.enableProgress;
    }
    // this._ensureElement();
    // this.delegateEvents();
    // grab stream auth set in configurations if it isn't supplied
    if (this.stream)
      this.stream = parseStream(this.stream);
    if (this.stream && !this.stream.get('mapping'))
      this.stream.set('mapping', this.mapping);
    // turns Period into a model
    this.period = Period.parse(this.period);
    this.deferred = Openhose.$.Deferred();
    // might need moving to the processor
    if (this.data) {
      this.parseDataObject(this.data);
    }
    this.initialize.apply(this, arguments);
  };
  Openhose._.extend(WidgetBase.prototype, Openhose.Backbone.Events, {
    // The default `tagName` of a Widget's element is `"div"`.
    tagName: 'div',
    // The default `className` of a Widget's element is `"openhose-widget"`.
    className: 'openhose-widget',
    // how often do we want the widget to pull in new data
    // measured in milliseconds
    // `0` means don't update
    updateInterval: 0,
    // `enableProgress` (boolean) specifies if you want to show a loading indicator when feeding in new data
    // for best results `enableProgress` should be set to false when `updateInterval` is set to anything other than `0`
    enableProgress: undefined,
    // default is set to `Openhose.SETTINGS.enableProgress`
    // `mapping` (string) specifies what type of mapping you would like to use (see configure.js for more info)
    mapping: undefined,
    // default is set to `Openhose.SETTINGS.mapping`
    // colors you would like to use in the visualization
    // accepts d3 color scales, a string with the name of the predefined color range (see `color-list.json`)
    // also accepts an array of colors (eg. `["#aaffcc", "#ffc355"]`)
    colors: Openhose.d3.scale.category20c(),
    // predefined color ranges (see `color-list.json` for an example)
    colorList: colorList,
    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function () {
    },
    // when extending the widget you have to supply the visualization in the view parameter (this has to be a function)
    view: function () {
      console.error('Please supply the widget with a "view" parameter');
    },
    // specify what `Openhose.Processor` is needed to process (and gather the data?)
    processor: function () {
      console.error('Please supply the widget with a "processor" parameter');
    },
    // parses the `data` object and extracts the `dimensions` and `metrics` needed to power the widget
    // TODO: this might be too specific, we might want to break it off and have each widget (or processor) handle this them selves
    parseDataObject: function (data) {
      data = Openhose._.clone(data);
      // TODO: check if we really need these
      this.metrics = this.metrics || [];
      this.metricLabels = this.labels || [];
      this.entities = this.entities || [];
      this.dimensions = [];
      this.pseudoMetrics = this.pseudoMetrics || [];
      this.relativeMetrics = [];
      // TODO_END //
      var self = this;
      if (data.metrics && !Openhose._.isArray(data.metrics))
        data.metrics = [data.metrics];
      if (data.dimensions && !Openhose._.isArray(data.dimensions))
        data.dimensions = [data.dimensions];
      var metrics = data.metrics || [];
      var dimensions = data.dimensions || [];
      delete data.metrics;
      delete data.dimensions;
      metrics.forEach(function (metric) {
        if (metric.cid)
          return self.metrics.push(metric);
        // this is already a real metric, don't tamper with it
        var args = Openhose._.extend({
          period: self.period,
          stream: self.stream
        }, data, metric);
        var comparePeriods = metric.comparePeriods;
        delete metric.comparePeriods;
        if (metric.entityType && metric.metricId) {
          self.metrics.push(new TrendMetric(args));
        } else {
          self.metrics.push(new StreamMetric(args));
        }
        // add an additional metric for the previous period
        if (comparePeriods) {
          args = Openhose._.clone(args);
          args.previousPeriod = true;
          self.metrics.push(new StreamMetric(args));
        }
      });
      dimensions.forEach(function (dimension) {
        if (dimension.cid)
          return self.dimensions.push(dimension);
        // this is already a real dimension, don't tamper with it
        var comparePeriods = dimension.comparePeriods;
        delete dimension.comparePeriods;
        var args = Openhose._.extend({
          stream: self.stream,
          period: self.period
        }, data, dimension);
        self.dimensions.push(new Dimension(args));
        // add an additional dimension for the previous period
        if (comparePeriods) {
          args = Openhose._.clone(args);
          args.period = args.period.getPreviousPeriod();
          args.previousPeriod = true;
          var prevDimension = new Dimension(args);
          // updated previous period when the current period is changed
          var setPreviousPeriod = function () {
            prevDimension.period.set(self.period.getPreviousPeriod().toJSON());
          };
          self.period.on('change', setPreviousPeriod);
          prevDimension.once('release', function () {
            self.period.off('change', setPreviousPeriod);
          });
          self.dimensions.push(prevDimension);  //TODO put this on the normal dimensions, and do the check somewhere else
        }
      });
    },
    fetch: function () {
      this.trigger('before:fetch', this.deferred, {
        metrics: this.metrics,
        dimensions: this.dimensions
      });
      if (this.deferred.state() === 'rejected') {
        return;
      }
      if (this.updateInterval !== 0 && this.updateInterval < 1500) {
        this.trigger('error', new Error('Update Interval cannot be lower than 1500ms'));
        return false;
      }
      // retrieve the mapping if we hadn't already
      if (this.mapping && !MappingProcessor.hasMapping(this.mapping)) {
        return MappingProcessor.loadDefinitions(this.mapping, this.fetch.bind(this));
      }
      // only for 'line', 'area', 'motion-scatter', 'cards' // TODO: remove this after all processors have it
      if (this.dimensions.length && this.processor.dimensionNeedsTrendMetrics) {
        this.dimensions.forEach(function (dimension) {
          dimension.includeTrendMetricId = true;
        });
      }
      // Fetch all
      (this.metrics || []).forEach(function (metric) {
        metric.fetch({ reset: true });
      });
      this.relativeMetrics.forEach(function (metric) {
        metric.fetch({ reset: true });
      });
      (this.dimensions || []).forEach(function (dimension) {
        dimension.fetch({ reset: true });
      });
      if (this.updateInterval) {
        this.fetchTimeout && clearTimeout(this.fetchTimeout);
        this.fetchTimeout = setTimeout(this.fetch.bind(this), this.updateInterval);
      }
      this.hasFetched = true;
    },
    // TODO: move to processors
    validate: function () {
      this.trigger('before:validate', this.deferred, {
        metrics: this.metrics,
        dimensions: this.dimensions
      });
      if (this.deferred.state() === 'rejected') {
        return false;
      }
      if (!this.view) {
        this.trigger('error', new Error('Please specify a view for this Analytics View'));
        return false;
      }
      if (this.updateInterval !== 0 && this.updateInterval < 1500) {
        this.trigger('error', new Error('Update Interval cannot be lower than 1500ms'));
        return false;
      }
      var result = this.processor.validate(this.metrics, this.dimensions);
      var validated = result[0];
      var errorMessage = result[1];
      if (!validated) {
        if (errorMessage) {
          this.trigger('error', new Error(errorMessage));
        } else {
          this.trigger('error', new Error('Unknown error'));
        }
        return false;
      }
      this.trigger('validate', this.deferred, {
        metrics: this.metrics,
        dimensions: this.dimensions
      });
      if (this.deferred.state() === 'rejected') {
        return false;
      }
      return true;
    },
    resize: function () {
      this.trigger('resize');
      this.render();
    },
    getAnalyticsWrapperOptions: function () {
      return Openhose._.extend({
        metrics: [].concat(this.metrics, this.relativeMetrics),
        dimensions: [].concat(this.dimensions),
        view: this.view.bind(this),
        processor: this.processor,
        colors: this.colors,
        className: this.className,
        tagName: this.tagName,
        deferred: this.deferred,
        base: this,
        disableLoadingIndicator: !this.enableProgress
      }, this.viewOptions);
    },
    createAnalyticsWrapper: function (options) {
      var analyticsWrapper = new AnalyticsWrapper(options);
      this.listenTo(analyticsWrapper, 'all', function (eventName, deferred, context, data) {
        var eventsToBubble = [
          'before:render',
          'render',
          'fetch',
          'before:process',
          'process',
          'noData'
        ];
        if (eventsToBubble.indexOf(eventName) !== -1) {
          this.trigger(eventName, deferred, context, data);
        }
      }, this);
      return analyticsWrapper;
    },
    render: function () {
      this._destroyAnalyticsWrapper(true);
      if (!this.hasFetched) {
        this.fetch();
      }
      var wrapperOptions = this.getAnalyticsWrapperOptions();
      if (this.el)
        wrapperOptions.el = this.el;
      this.analyticsWrapper = this.createAnalyticsWrapper(wrapperOptions);
      if (!this.el)
        this.el = this.analyticsWrapper.el;
      this.analyticsWrapper.render();
      return this;
    },
    _destroyAnalyticsWrapper: function (keepSharedEl) {
      if (!this.analyticsWrapper)
        return;
      this.analyticsWrapper.destroy(keepSharedEl);
      this.stopListening(this.analyticsWrapper);
      delete this.analyticsWrapper;
    },
    destroy: function () {
      Openhose._.flatten([
        this.metrics,
        this.dimensions
      ]).forEach(function (object) {
        object && object.release && object.release();
      });
      this._destroyAnalyticsWrapper();
      Openhose.$(this.el).remove();
      this.fetchTimeout && clearTimeout(this.fetchTimeout);
      this.trigger('destroy');
    },
    getColors: function () {
      var colors = this.colors;
      if (this.colors && typeof this.colors == 'string') {
        colors = this._colorsForColorGroup(this.colors);
      }
      if (this.colors && typeof this.colors == 'object' && this.colors.length) {
        colors = Openhose.d3.scale.ordinal().range(this.colors);
      }
      if (this.colors && typeof this.colors == 'function') {
        colors = this.colors.copy();
      }
      return colors;
    },
    _colorsForColorGroup: function (colorGroup) {
      if (typeof this.colorList == 'string') {
        this.colorList = JSON.parse(this.colorList);
      }
      return Openhose.d3.scale.ordinal().range(this.colorList[colorGroup]);
    },
    $: function (selection) {
      return this.analyticsWrapper.$(selection);
    }
  });
  WidgetBase.extend = Openhose.Backbone.Model.extend;
  Openhose.WidgetBase = WidgetBase;
  return WidgetBase;  // Original code.
                      // TODO: Remove once we move all Nerve Center widgets in
                      //
                      //////////////////////////////////////////////////////////////////////////////
                      //////////////////////////////////////////////////////////////////////////////
                      //
                      // return Openhose.Backbone.View.extend({
                      //
                      //   className: "wrap",
                      //
                      //   initialize: function(options) {
                      //     this.view = options.view;
                      //     this.stream = options.stream;
                      //
                      //     this.options = options;
                      //     this.metrics = options.metrics || [];
                      //
                      //     this.metricLabels = options.labels || [];
                      //
                      //     this.entities = options.entities || [];
                      //     this.dimensions = [];
                      //     this.timeComparisonMetricIds = options.timeComparisonMetrics || [];
                      //     this.timeComparisonMetrics = [];
                      //     this.pseudoMetrics = options.pseudoMetrics || [];
                      //     this.relativeMetrics = [];
                      //     this.data = options.data;
                      //     this.title = options.title;
                      //     this.viewOptions = options.viewOptions || {};
                      //     this.colors = options.colors;
                      //     this.limit = options.limit;
                      //     this.minVolume = options.minVolume;
                      //     this.includePercentage = options.includePercentage;
                      //     this.dateLimit = options.dateLimit;
                      //
                      //     this.period = options.period;
                      //     this.updateInterval = options.updateInterval;
                      //
                      //     if (this.data) {
                      //       this.parseDataObject(this.data);
                      //     }
                      //
                      //     if(typeof colorList == 'string') {
                      //       colorList = JSON.parse(colorList);
                      //     }
                      //   },
                      //
                      //   parseDataObject: function(data){
                      //     var self = this;
                      //
                      //     if (data.metrics && !Openhose._.isArray(data.metrics)) data.metrics = [data.metrics];
                      //     if (data.dimensions && !Openhose._.isArray(data.dimensions)) data.dimensions = [data.dimensions];
                      //
                      //     (data.metrics || []).forEach(function(metric) {
                      //       var args = Openhose._.extend({
                      //         period: self.period,
                      //         stream: self.stream
                      //       }, metric);
                      //
                      //       var comparePeriods = metric.comparePeriods;
                      //       delete metric.comparePeriods;
                      //
                      //       self.metrics.push(new StreamMetric(args));
                      //       if (comparePeriods) {
                      //         args = Openhose._.clone(args);
                      //         args.previousPeriod = true;
                      //         self.timeComparisonMetrics.push(new StreamMetric(args));
                      //       }
                      //     });
                      //
                      //     (data.dimensions || []).forEach(function(dimension) {
                      //       self.dimensions.push(new Dimension(Openhose._.extend({
                      //         stream: self.stream,
                      //         period: self.period
                      //       }, dimension)));
                      //     });
                      //   },
                      //
                      //   fetch: function() {
                      //     if (this.updateInterval !== 0 && this.updateInterval < 1500) {
                      //       this.trigger('error', new Error("Update Interval cannot be lower than 1500ms"));
                      //       return false;
                      //     }
                      //
                      //     if (this.dimensions.length && this._dimensionNeedsTrendMetrics()) {
                      //       this.dimensions.forEach(function(dimension){
                      //         dimension.includeTrendMetricId = true;
                      //       });
                      //     }
                      //     // Fetch all
                      //     (this.metrics || []).forEach(function(metric) {
                      //       metric.fetch({ reset: true });
                      //     });
                      //
                      //
                      //     this.relativeMetrics.forEach(function(metric) {
                      //       metric.fetch({ reset: true  });
                      //     });
                      //
                      //
                      //     this.timeComparisonMetrics.forEach(function(metric) {
                      //       metric.fetch({ reset: true  });
                      //     });
                      //
                      //     (this.dimensions || []).forEach(function(dimension) {
                      //       dimension.fetch({ reset: true  });
                      //     });
                      //
                      //     if(this.updateInterval) {
                      //       this.fetchTimeout && clearTimeout(this.fetchTimeout);
                      //       this.fetchTimeout = setTimeout(this.fetch.bind(this), this.updateInterval);
                      //     }
                      //   },
                      //
                      //   // TODO: move to processors
                      //   validate: function() {
                      //     if (!this.view) {
                      //       this.trigger('error', new Error("Please specify a view for this Analytics View"));
                      //       return false;
                      //     }
                      //
                      //     if (!analyticsViews[this.view]) {
                      //       this.trigger('error', new Error("No such analytics view \"" + this.view + "\". Available views: " + Openhose._.keys(analyticsViews).join(', ')));
                      //       return false;
                      //     }
                      //
                      //     if (this.updateInterval !== 0 && this.updateInterval < 1500) {
                      //       this.trigger('error', new Error("Update Interval cannot be lower than 1500ms"));
                      //       return false;
                      //     }
                      //
                      //
                      //     var result = analyticsViews[this.view].validate(this.metrics, this.dimensions);
                      //     var validated = result[0];
                      //     var errorMessage = result[1];
                      //
                      //     if (!validated) {
                      //       if (errorMessage) {
                      //         this.trigger('error', new Error(errorMessage));
                      //       } else {
                      //         this.trigger('error', new Error("Uknown error"));
                      //       }
                      //       return false;
                      //     }
                      //
                      //     return true;
                      //   },
                      //
                      //   resize: function(){
                      //     this.render();
                      //   },
                      //
                      //   render: function() {
                      //     this.$el.html('');
                      //     if(this.analyticsWrapper) this.analyticsWrapper.destroy();
                      //
                      //     this.analyticsWrapper = new AnalyticsWrapper(Openhose._.extend({
                      //       metrics: [].concat(this.metrics, this.relativeMetrics, this.timeComparisonMetrics),
                      //       dimensions: this.dimensions,
                      //       view: this._renderView.bind(this),
                      //       viewType: this.view,
                      //       disableLoadingIndicator: this.options.enableProgress === false ? true : false
                      //     }, this.viewOptions));
                      //     this.$el.append(this.analyticsWrapper.render().el);
                      //   },
                      //
                      //   destroy: function() {
                      //     Openhose._.flatten([this.metrics, this.timeComparisonMetrics, this.dimensions]).forEach(function(object) {
                      //       object && object.release && object.release();
                      //     });
                      //     this.analyticsWrapper && this.analyticsWrapper.destroy();
                      //     delete this.analyticsWrapper;
                      //     this.fetchTimeout && clearTimeout(this.fetchTimeout);
                      //     this.remove();
                      //   },
                      //
                      //   _dimensionNeedsTrendMetrics: function() {
                      //     if(this.view == 'line' || this.view == 'area' || this.view == 'motion-scatter' || this.view == 'cards') {
                      //       return true;
                      //     }
                      //     return false;
                      //   },
                      //
                      //   _renderView: function() {
                      //     // Determine colors
                      //     var colors = this.colors;
                      //     if(this.colors && typeof this.colors == 'string') {
                      //       colors = this._colorsForColorGroup(this.colors);
                      //     }
                      //     if(this.colors && typeof this.colors == 'object' && this.colors.length) {
                      //       colors = d3.scale.ordinal().range(this.colors);
                      //     }
                      //
                      //     // colorMap: option to attach colors to specific labels
                      //     // e.g. metric with label: Extremely Negative will always be #FF0000
                      //     // Only used in stacked-bar now, can be spread to others if/when needed
                      //     var colorMap = this.options.colorMap || {};
                      //
                      //     switch(this.view.toLowerCase()) {
                      //       case 'pie':
                      //          return new analyticsViews.Pie(Openhose._.extend({
                      //            dimensions: this.dimensions,
                      //            metrics: this.metrics,
                      //            colors: colors
                      //          }, this.viewOptions));
                      //       //
                      //       // case 'distribution':
                      //       //   return new analyticsViews.distribution(Openhose._.extend({
                      //       //     dimensions: this.dimensions,
                      //       //     metrics: this.metrics,
                      //       //     colors: colors
                      //       //   }, this.viewOptions));
                      //       //
                      //       // case 'line':
                      //       //   var newOptions = {
                      //       //     dimensions: this.dimensions,
                      //       //     metrics: this.metrics,
                      //       //     timeComparisonMetrics: this.timeComparisonMetrics,
                      //       //     period: this.period,
                      //       //     colors: colors
                      //       //   };
                      //       //   var lineOptions = { includePercentage: !!(this.relativeMetrics && this.relativeMetrics.length)};
                      //       //
                      //       //   // Need to solve this in a different way
                      //       //   if (this.metrics && this.metrics.length == 1 && this.metrics[0].get('metricId').match(/rate/i)) {
                      //       //     lineOptions.yFormat = function(value) {
                      //       //       return d3.format('.3f')(value) + '%';
                      //       //     };
                      //       //   }
                      //       //
                      //       //
                      //       //   return new analyticsViews.line(Openhose._.extend(newOptions, Openhose._.extend(lineOptions, this.viewOptions)));
                      //       //
                      //       // case 'stacked-bar':
                      //       //   return new analyticsViews['stacked-bar'](Openhose._.extend({
                      //       //     dimensions: this.dimensions,
                      //       //     metrics: this.metrics,
                      //       //     timeComparisonMetrics: this.timeComparisonMetrics,
                      //       //     period: this.period,
                      //       //     colors: colors,
                      //       //     colorMap: colorMap
                      //       //   }, this.viewOptions));
                      //       //
                      //       // case 'area':
                      //       //   return new analyticsViews.area(Openhose._.extend({
                      //       //     dimensions: this.dimensions,
                      //       //     metrics: this.metrics,
                      //       //     timeComparisonMetrics: this.timeComparisonMetrics,
                      //       //     period: this.period,
                      //       //     colors: colors
                      //       //   }, this.viewOptions));
                      //
                      //       case 'number':
                      //         return new analyticsViews.Number(Openhose._.extend({
                      //           label: this.metrics[0].getLabel(),
                      //           metrics: this.metrics,
                      //           period: this.period,
                      //           timeComparisonMetrics: this.timeComparisonMetrics,
                      //           summaryFn: this.options.summaryFn
                      //         }, this.viewOptions));
                      //
                      //
                      //       // case 'gauge':
                      //       //   return new analyticsViews.gauge(Openhose._.extend({
                      //       //     label: this.metrics[0].getLabel(),
                      //       //     metrics: this.metrics,
                      //       //     summaryFn: this.options.summaryFn
                      //       //   }, this.viewOptions));
                      //       //
                      //       // case 'table':
                      //       //   return new analyticsViews.table(Openhose._.extend({
                      //       //     dimensions: this.dimensions,
                      //       //     timeComparisonDimensions: this.timeComparisonDimensions,
                      //       //     metrics: this.metrics,
                      //       //     colors: colors
                      //       //   }, this.viewOptions));
                      //       //
                      //       // case 'motion-scatter':
                      //       //   var metrics =  this.metrics;
                      //       //   //the motion scatter cant really figure out by it self when to use what...
                      //       //   if (this.metrics[0].get('objectType') == 'StreamMetric') {
                      //       //     metrics = this.dimensions && this.dimensions[0] && this.dimensions[0].metrics;
                      //       //   }
                      //       //
                      //       //   if (!metrics) {
                      //       //     metrics = this.metrics;
                      //       //     metrics.forEach(function (m) {
                      //       //       m.title = m.metricId;
                      //       //     });
                      //       //   }
                      //       //   var metricId = this.metrics[0].get('metricId');
                      //       //
                      //       //   return new analyticsViews['motion-scatter'](Openhose._.extend({
                      //       //     metrics: metrics,
                      //       //     xField: metricId,
                      //       //     zField: metricId,
                      //       //     colors: colors
                      //       //   }, this.viewOptions));
                      //       //
                      //       // case 'geo-vectors':
                      //       //   var geoOptions = {};
                      //       //   if (this.dimensions[0].get('entityTypes')[0] == 'states') {
                      //       //     geoOptions.mapType = 'albers';
                      //       //     geoOptions.zoomFactor = 2;
                      //       //     geoOptions.geoPolygonsFile = "/templates/geo/administrative-regions-level1-USA.json";
                      //       //   }
                      //       //   return new analyticsViews['geo-vectors'](Openhose._.extend({
                      //       //     dimension: this.dimensions[0],
                      //       //     allowMapTypes: true,
                      //       //     colors: colors
                      //       //   }, Openhose._.extend(geoOptions, this.viewOptions)));
                      //       //
                      //       // case 'cards':
                      //       //   return new analyticsViews.cards(Openhose._.extend({
                      //       //     dimension: this.dimensions[0],
                      //       //     colors: colors
                      //       //   }, this.viewOptions));
                      //       //
                      //       // case 'bar-horizontal':
                      //       //   return new analyticsViews['bar-horizontal'](Openhose._.extend({
                      //       //     dimensions: this.dimensions,
                      //       //     metrics: this.metrics,
                      //       //     colors: colors
                      //       //   }, this.viewOptions));
                      //       //
                      //       case 'leaderboard':
                      //          return new analyticsViews.LeaderBoard(Openhose._.extend({
                      //            dimensions: this.dimensions,
                      //            metrics: this.metrics,
                      //            colors: colors
                      //          }, this.viewOptions));
                      //       //
                      //       // case 'psych':
                      //       //   return new analyticsViews.psych(Openhose._.extend({
                      //       //     metrics: this.metrics
                      //       //   }, this.viewOptions));
                      //       //
                      //       // case 'table-graph':
                      //       //   geoOptions = {};
                      //       //   if (this.dimensions.length && this.dimensions[0].get('entityTypes') == 'states') {
                      //       //     geoOptions.mapType = 'albers';
                      //       //     geoOptions.zoomFactor = 2;
                      //       //     geoOptions.geoPolygonsFile = "/templates/geo/administrative-regions-level1-USA.json";
                      //       //   }
                      //       //   return new analyticsViews['table-graph'](Openhose._.extend({
                      //       //     dimensions: this.dimensions,
                      //       //     metrics: this.metrics,
                      //       //     colors: colors
                      //       //   }, Openhose._.extend(geoOptions, this.viewOptions)));
                      //       default:
                      //         console.warn("View '"+this.view+"' does not exist.");
                      //     }
                      //     return false;
                      //   },
                      //
                      //   _colorsForColorGroup: function(colorGroup) {
                      //     return d3.scale.ordinal().range(colorList[colorGroup]);
                      //   }
                      // });
                      // // Openhose.text = colorList;
                      // // Openhose.Widget = view;
}(core, models_period, models_metric, models_stream_metric, models_trend_metric, models_dimension, widgets_analytics_wrapper, visualization_main, text_templates_color_listjson, lib_mapping_processor, lib_parse_stream);
widgets_number = function (Openhose, WidgetBase) {
  var Number = WidgetBase.extend({
    initialize: function () {
      this.validate();
    },
    view: function () {
      return new Openhose.Visualization.Number(this.viewOptions);
    },
    processor: Openhose.Processor.Number
  });
  return Number;
}(core, widgets_base);
widgets_leaderboard = function (Openhose, WidgetBase) {
  var Module = WidgetBase.extend({
    initialize: function () {
      this.validate();
    },
    view: function () {
      return new Openhose.Visualization.LeaderBoard(Openhose._.extend({ colors: this.getColors() }, this.viewOptions));
    },
    processor: Openhose.Processor.LeaderBoard
  });
  return Module;
}(core, widgets_base);
widgets_pie = function (Openhose, WidgetBase) {
  var Module = WidgetBase.extend({
    initialize: function () {
      this.validate();
    },
    view: function () {
      return new Openhose.Visualization.Pie(Openhose._.extend({ colors: this.getColors() }, this.viewOptions));
    },
    processor: Openhose.Processor.Pie
  });
  return Module;
}(core, widgets_base);
widgets_line = function (Openhose, WidgetBase) {
  var Module = WidgetBase.extend({
    initialize: function () {
      this.validate();
      this.colors = this.getColors();
    },
    view: function () {
      return new Openhose.Visualization.Line(Openhose._.extend({ colors: this.getColors() }, this.viewOptions));
    },
    processor: Openhose.Processor.Line
  });
  return Module;
}(core, widgets_base);
widgets_area = function (Openhose, WidgetBase) {
  var Module = WidgetBase.extend({
    initialize: function () {
      this.validate();
      this.colors = this.getColors();
    },
    view: function () {
      return new Openhose.Visualization.Area(Openhose._.extend({ colors: this.getColors() }, this.viewOptions));
    },
    processor: Openhose.Processor.Area
  });
  return Module;
}(core, widgets_base);
widgets_stacked_bar = function (Openhose, WidgetBase) {
  var Module = WidgetBase.extend({
    initialize: function () {
      this.validate();
      this.colors = this.getColors();
    },
    view: function () {
      return new Openhose.Visualization.StackedBar(Openhose._.extend({ colors: this.getColors() }, this.viewOptions));
    },
    processor: Openhose.Processor.Area
  });
  return Module;
}(core, widgets_base);
widgets_table = function (Openhose, WidgetBase) {
  var Module = WidgetBase.extend({
    initialize: function () {
      this.validate();
    },
    view: function () {
      return new Openhose.Visualization.Table(Openhose._.extend({ colors: this.getColors() }, this.viewOptions));
    },
    processor: Openhose.Processor.Table
  });
  return Module;
}(core, widgets_base);
widgets_motion_scatter = function (Openhose, WidgetBase) {
  var Module = WidgetBase.extend({
    initialize: function () {
      this.validate();
    },
    view: function () {
      return new Openhose.Visualization.MotionScatter(Openhose._.extend({ colors: this.getColors() }, this.viewOptions));
    },
    processor: Openhose.Processor.MotionScatter
  });
  return Module;
}(core, widgets_base);
widgets_time_line = function (Openhose, WidgetBase) {
  var Module = WidgetBase.extend({
    initialize: function () {
      this.validate();
    },
    view: function () {
      return new Openhose.Visualization.TimeLine(Openhose._.extend({ colors: this.getColors() }, this.viewOptions));
    },
    processor: Openhose.Processor.TimeLine
  });
  return Module;
}(core, widgets_base);
widgets_gauge = function (Openhose, WidgetBase) {
  var Gauge = WidgetBase.extend({
    initialize: function () {
      this.validate();
    },
    view: function () {
      return new Openhose.Visualization.Gauge(this.viewOptions);
    },
    processor: Openhose.Processor.Gauge
  });
  return Gauge;
}(core, widgets_base);
widgets_distribution = function (Openhose, WidgetBase) {
  var Module = WidgetBase.extend({
    initialize: function () {
      this.validate();
    },
    view: function () {
      return new Openhose.Visualization.Distribution(Openhose._.extend({ colors: this.getColors() }, this.viewOptions));
    },
    processor: Openhose.Processor.Distribution
  });
  return Module;
}(core, widgets_base);
widgets_bar = function (Openhose, WidgetBase) {
  var Module = WidgetBase.extend({
    initialize: function () {
      this.validate();
    },
    view: function () {
      return new Openhose.Visualization.Bar(Openhose._.extend({ colors: this.getColors() }, this.viewOptions));
    },
    processor: Openhose.Processor.Bar
  });
  return Module;
}(core, widgets_base);
widgets_main = function (Openhose, Number, LeaderBoard, Pie, Line, Area, StackedBar, Table, MotionScatter, TimeLine, Gauge, Distribution, Bar) {
  var subModules = {};
  subModules.Number = Number;
  subModules.LeaderBoard = LeaderBoard;
  subModules.Pie = Pie;
  subModules.Line = Line;
  subModules.Area = Area;
  subModules.StackedBar = StackedBar;
  subModules.TimeLine = TimeLine;
  subModules.Table = Table;
  subModules.MotionScatter = MotionScatter;
  subModules.Gauge = Gauge;
  subModules.Distribution = Distribution;
  subModules.Bar = Bar;
  Openhose.Widget = subModules;
  return Openhose;
}(core, widgets_number, widgets_leaderboard, widgets_pie, widgets_line, widgets_area, widgets_stacked_bar, widgets_table, widgets_motion_scatter, widgets_time_line, widgets_gauge, widgets_distribution, widgets_bar);
openhose = function (Openhose) {
  return Openhose;
}(core);  return core;
}));
