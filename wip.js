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
          var aesthetic, dthis, layer, layers, scale, scales, svg, _base, _i, _len, _ref, _ref2;
          dthis = d3.select(this);
          svg = dthis.selectAll("svg").data([datasets]);
          svg.enter().append("svg").attr("class", "plot");
          layers = svg.selectAll("g.layer").data(Object);
          layers.enter().append("g").attr("class", function(d, i) {
            return "layer layer" + i;
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
          layers.each(function(data, i) {
            var aesthetic, layerData, scale, scaleData, _ref3, _results;
            console.log("training the scales!");
            layer = attrs.layers[i];
            _ref3 = attrs.scales;
            _results = [];
            for (aesthetic in _ref3) {
              scale = _ref3[aesthetic];
              scale = scales[aesthetic] || (scales[aesthetic] = scale());
              if (layer[aesthetic]) {
                layerData = data.map(layer[aesthetic]());
                scaleData = scale.domain();
                console.log("layer", layerData, "scale", scaleData);
                _results.push(scale.domain(d3.extent(layerData.concat(scaleData))));
              } else {
                _results.push(void 0);
              }
            }
            return _results;
          });
          if (scales.x) scales.x.range([0, svg.node().clientWidth]);
          if (scales.y) scales.y.range([svg.node().clientHeight, 0]);
          return layers.each(function(data, i) {
            return d3.select(this).call(attrs.layers[i], scales);
          });
        });
      };
      attrs = {
        layers: [],
        scales: {},
        size: []
      };
      chart.attrs = attrs;
      _a = attrAccessor.bind(attrs, chart);
      chart.size = _a("size");
      chart.addLayer = function(layer) {
        attrs.layers.push(layer);
        return chart;
      };
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
          pathFn = d3.svg.line().interpolate("basis").x(function(d) {
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
    }
  };

  if (typeof module !== "undefined" && module !== null) {
    module.exports = rene;
  } else {
    this.rene = rene;
  }

}).call(this);
