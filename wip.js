(function() {
  var attrAccessor, ordinalScales, rene;

  attrAccessor = function(retval, name) {
    var _this = this;
    return function(v) {
      if (!(v != null)) return _this[name];
      _this[name] = v;
      return retval || _this;
    };
  };

  ordinalScales = [d3.scale.ordinal, d3.scale.category10, d3.scale.category20, d3.scale.category20b, d3.scale.category20c];

  rene = {
    plot: function() {
      var attrs, chart, _a;
      chart = function(selection) {
        return selection.each(function(datasets) {
          var aesthetic, gEnter, layer, layers, margin, panelHeight, panelWidth, scale, scales, svg, svgNode, xAxis, yAxis, _base, _i, _len, _ref, _ref2;
          svg = d3.select(this).selectAll("svg").data([datasets]);
          gEnter = svg.enter().append("svg").attr("class", "plot").append("g");
          gEnter.append("g").attr("class", "x axis");
          layers = svg.select("g").selectAll("g.layer").data(Object);
          layers.enter().append("g").attr("class", "layer").attr("id", function(d, i) {
            return "layer" + i;
          });
          _ref = attrs.layers;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            layer = _ref[_i];
            _ref2 = layer.scales();
            for (aesthetic in _ref2) {
              scale = _ref2[aesthetic];
              (_base = attrs.scales)[aesthetic] || (_base[aesthetic] = scale);
            }
          }
          scales = {};
          layers.each(function(d, i) {
            var aesthetic, layerData, scale, scaleData, _ref3, _results;
            console.log('layers data', d);
            layer = attrs.layers[i];
            _ref3 = attrs.scales;
            _results = [];
            for (aesthetic in _ref3) {
              scale = _ref3[aesthetic];
              scale = scales[aesthetic] || (scales[aesthetic] = scale());
              if (layer[aesthetic]) {
                layerData = d.map(layer[aesthetic]());
                scaleData = scale.domain();
                _results.push(scale.domain(d3.extent(layerData.concat(scaleData))));
              } else {
                _results.push(void 0);
              }
            }
            return _results;
          });
          svgNode = svg.node();
          margin = chart.margin();
          panelWidth = svgNode.clientWidth - (margin.left + margin.right);
          panelHeight = svgNode.clientHeight - (margin.top + margin.bottom);
          if (scales.x) {
            scales.x.range([0, panelWidth]);
            xAxis = d3.svg.axis().scale(scales.x).orient("bottom");
            svg.select(".x.axis").attr("transform", "translate(0," + scales.y.range()[0] + ")").call(xAxis);
          }
          if (scales.y) {
            scales.y.range([panelHeight, 0]);
            yAxis = d3.svg.axis().scale(scales.y).orient("left");
          }
          layers.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
          return layers.each(function(d, i) {
            return d3.select(this).call(attrs.layers[i], scales);
          });
        });
      };
      attrs = {
        margin: {
          top: 40,
          bottom: 40,
          left: 40,
          right: 40
        },
        layers: [],
        scales: {},
        size: []
      };
      chart.attrs = attrs;
      _a = attrAccessor.bind(attrs, chart);
      chart.size = _a("size");
      chart.margin = _a("margin");
      chart.addLayer = function(layer) {
        attrs.layers.push(layer);
        return chart;
      };
      chart.layers = chart.addLayer;
      return chart;
    },
    scatter: function() {
      var attrs, layer, scales, _a;
      layer = function(g, scales) {
        return g.each(function() {
          var circles, circlesEnter, circlesExit, circlesUpdate;
          g = d3.select(this);
          circles = g.selectAll("circle").data(Object);
          circlesEnter = circles.enter().append("circle").attr("opacity", 1e-6);
          circlesExit = d3.transition(circles.exit()).attr("opacity", 0).remove();
          circlesUpdate = d3.transition(circles).attr("opacity", 1);
          return circlesUpdate.attr("cx", function(d) {
            return scales.x(layer.x()(d));
          }).attr("cy", function(d) {
            return scales.y(layer.y()(d));
          }).attr("r", 2);
        });
      };
      attrs = {
        x: function(d) {
          return d[0];
        },
        y: function(d) {
          return d[1];
        },
        color: function(d) {
          return d[2];
        },
        size: function(d) {
          return d[3];
        }
      };
      scales = {
        x: d3.scale.linear,
        y: d3.scale.linear,
        color: d3.scale.category20,
        size: d3.scale.linear
      };
      _a = attrAccessor.bind(attrs, layer);
      layer.x = _a("x");
      layer.y = _a("y");
      layer.color = _a("color");
      layer.size = _a("size");
      layer.scales = function() {
        return scales;
      };
      return layer;
    },
    line: function() {
      var attrs, layer, scales, _a;
      layer = function(g, scales) {
        return g.each(function(data) {
          var lines, linesEnter, linesExit, linesUpdate, pathFn;
          g = d3.select(this);
          lines = g.selectAll("path").data([g.datum()]);
          linesEnter = lines.enter().append("path");
          linesExit = d3.transition(lines.exit());
          linesUpdate = d3.transition(lines);
          pathFn = d3.svg.line().interpolate(layer.interpolate()).x(function(d) {
            return scales.x(layer.x()(d));
          }).y(function(d) {
            return scales.y(layer.y()(d));
          });
          return linesUpdate.attr("d", pathFn);
        });
      };
      attrs = {
        x: function(d) {
          return d[0];
        },
        y: function(d) {
          return d[1];
        },
        color: function(d) {
          return d[2];
        },
        size: function(d) {
          return d[3];
        },
        interpolate: "cardinal"
      };
      scales = {
        x: d3.scale.linear,
        y: d3.scale.linear,
        color: d3.scale.category20,
        size: d3.scale.linear
      };
      _a = attrAccessor.bind(attrs, layer);
      layer.x = _a("x");
      layer.y = _a("y");
      layer.color = _a("color");
      layer.size = _a("size");
      layer.interpolate = _a("interpolate");
      layer.scales = function() {
        return scales;
      };
      return layer;
    },
    area: function() {
      var attrs, layer, scales, _a;
      layer = function(g, scales) {
        return g.each(function(data) {
          var lines, linesEnter, linesExit, linesUpdate, pathFn;
          g = d3.select(this);
          lines = g.selectAll("path").data([g.datum()]);
          linesEnter = lines.enter().append("path");
          linesExit = d3.transition(lines.exit());
          linesUpdate = d3.transition(lines);
          pathFn = d3.svg.area().interpolate("basis").x(function(d) {
            return scales.x(layer.x()(d));
          }).y(function(d) {
            return scales.y(layer.y()(d));
          });
          return linesUpdate.attr("d", pathFn);
        });
      };
      attrs = {
        x: function(d) {
          return d[0];
        },
        y: function(d) {
          return d[1];
        },
        color: function(d) {
          return d[2];
        },
        size: function(d) {
          return d[3];
        }
      };
      scales = {
        x: d3.scale.linear,
        y: d3.scale.linear,
        color: d3.scale.category20,
        size: d3.scale.linear
      };
      _a = attrAccessor.bind(attrs, layer);
      layer.x = _a("x");
      layer.y = _a("y");
      layer.color = _a("color");
      layer.size = _a("size");
      layer.scales = function() {
        return scales;
      };
      return layer;
    },
    bar: function() {
      var attrs, layer, scales, _a;
      layer = function(g, scales) {
        return g.each(function(data) {
          var lines, linesEnter, linesExit, linesUpdate, pathFn;
          g = d3.select(this);
          lines = g.selectAll("path").data([g.datum()]);
          linesEnter = lines.enter().append("path");
          linesExit = d3.transition(lines.exit());
          linesUpdate = d3.transition(lines);
          pathFn = d3.svg.area().interpolate("basis").x(function(d) {
            return scales.x(layer.x()(d));
          }).y(function(d) {
            return scales.y(layer.y()(d));
          });
          return linesUpdate.attr("d", pathFn);
        });
      };
      attrs = {
        x: function(d) {
          return d[0];
        },
        y: function(d) {
          return d[1];
        },
        color: function(d) {
          return d[2];
        },
        size: function(d) {
          return d[3];
        }
      };
      scales = {
        x: d3.scale.linear,
        y: d3.scale.linear,
        color: d3.scale.category20,
        size: d3.scale.linear
      };
      _a = attrAccessor.bind(attrs, layer);
      layer.x = _a("x");
      layer.y = _a("y");
      layer.color = _a("color");
      layer.size = _a("size");
      layer.scales = function() {
        return scales;
      };
      return layer;
    },
    pie: function() {
      var AA, attrs, layer, scales;
      layer = function(g, scales) {
        return g.each(function(d) {
          var arcs, arcsEnter, arcsExit, arcsUpdate;
          g = d3.select(this);
          arcs = g.selectAll("path.arc").data(function(d) {
            console.log('p d', d, layer.pie()(d));
            return layer.pie()(d);
          });
          arcsEnter = arcs.enter().append("path").attr("class", "arc");
          arcsExit = d3.transition(arcs.exit()).remove();
          arcsUpdate = d3.transition(arcs);
          debugger;
          return arcsUpdate.attr("d", layer.arc());
        });
      };
      scales = {};
      attrs = {
        outerRadius: 200,
        innerRadius: 50,
        arc: d3.svg.arc(),
        pie: d3.layout.pie()
      };
      AA = attrAccessor.bind(attrs, layer);
      layer.outerRadius = AA("outerRadius");
      layer.innerRadius = AA("innerRadius");
      layer.arc = AA("arc");
      layer.pie = AA("pie");
      layer.scales = function() {
        return scales;
      };
      return layer;
    }
  };

  if (typeof module !== "undefined" && module !== null) {
    module.exports = rene;
  } else {
    this.rene = rene;
  }

}).call(this);
