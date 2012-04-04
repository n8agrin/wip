(function() {
  var attrAccessor, ordinalScales, rene2, utils;

  attrAccessor = function(retval, name) {
    var _this = this;
    return function(v) {
      if (!(v != null)) return _this[name];
      _this[name] = v;
      return retval || _this;
    };
  };

  ordinalScales = [d3.scale.ordinal, d3.scale.category10, d3.scale.category20, d3.scale.category20b, d3.scale.category20c];

  utils = {
    translate: function(x, y) {
      return ["translate(", String(x), ",", String(y), ")"].join("");
    }
  };

  rene2 = {
    plot: function() {
      var AA, attrs, chart;
      chart = function(selection) {
        return selection.each(function(datasets) {
          var aesthetic, gEnter, layer, layers, panelHeight, panelWidth, scale, svg, svgNode, xAxis, yAxis, _base, _i, _len, _ref, _ref2;
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
              (_base = attrs.scales)[aesthetic] || (_base[aesthetic] = scale());
            }
          }
          layers.each(function(d, i) {
            var aesthetic, layerData, scale, scaleData, _ref3, _results;
            layer = attrs.layers[i];
            _ref3 = attrs.scales;
            _results = [];
            for (aesthetic in _ref3) {
              scale = _ref3[aesthetic];
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
          panelWidth = svgNode.clientWidth - (attrs.margin.left + attrs.margin.right);
          panelHeight = svgNode.clientHeight - (attrs.margin.top + attrs.margin.bottom);
          console.log("panel w/h", panelWidth, panelHeight);
          if (attrs.scales.x) {
            attrs.scales.x.range([0, panelWidth]);
            xAxis = d3.svg.axis().scale(scales.x).orient("bottom");
            svg.select(".x.axis").attr("transform", utils.translate(0, panelWidth)).call(xAxis);
          }
          if (attrs.scales.y) {
            attrs.scales.y.range([panelHeight, 0]);
            yAxis = d3.svg.axis().scale(attrs.scales.y).orient("left");
          }
          svg.select("g").attr("transform", utils.translate(attrs.margin.left, attrs.margin.top));
          layers.each(function(d, i) {
            return d3.transition(d3.select(this)).call(attrs.layers[i], attrs.scales, panelWidth, panelHeight);
          });
          layers.each(function(d, i) {
            return attrs.layers[i].position(d3.select(this), panelWidth, panelHeight, attrs.margin);
          });
          return attrs.legend.call(chart, layers, attrs.scales);
        });
      };
      attrs = {
        margin: {
          top: 20,
          bottom: 20,
          left: 20,
          right: 20
        },
        layers: [],
        size: [],
        scales: {},
        layerDuration: 500,
        layerDelay: 200,
        legend: function() {}
      };
      AA = attrAccessor.bind(attrs, chart);
      chart.size = AA("size");
      chart.margin = AA("margin");
      chart.layerDuration = AA("layerDuration");
      chart.layerDelay = AA("layerDelay");
      chart.legend = AA("legend");
      chart.scales = AA("scales");
      chart.inactiveData = AA("inactiveData");
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
      layer = function(g, scales, width, height) {
        return g.each(function(d, i) {
          var arc, arcs, arcsEnter, arcsExit, arcsUpdate, innerRadius, outerRadius, pie, pieData;
          pieData = d.map(attrs.value);
          pie = attrs.pie;
          outerRadius = attrs.outerRadius;
          innerRadius = attrs.innerRadius;
          if (typeof outerRadius === "function") {
            outerRadius = outerRadius(width, height);
          }
          if (typeof innerRadius === "function") {
            innerRadius = innerRadius(width, height);
          }
          arc = attrs.arc.outerRadius(outerRadius).innerRadius(innerRadius);
          g = d3.select(this).classed("pie", true);
          arcs = g.selectAll("path.arc").data(pie(pieData));
          arcsEnter = arcs.enter().append("path").attr("class", "arc").style("opacity", 1e-6);
          arcsExit = d3.transition(arcs.exit()).style("opacity", 1e-6).remove();
          arcsUpdate = d3.transition(arcs).style("opacity", 1);
          return arcsUpdate.attr("d", arc).attr("fill", function(point, index) {
            return scales.color(attrs.color(point, index));
          });
        });
      };
      scales = {
        color: d3.scale.category20
      };
      attrs = {
        outerRadius: 100,
        innerRadius: 10,
        location: "center",
        locationMargin: 10,
        arc: d3.svg.arc(),
        pie: d3.layout.pie(),
        color: function(point, pointIndex) {
          return point.data;
        },
        value: function(v) {
          return v;
        },
        label: function(l) {
          return l;
        }
      };
      AA = attrAccessor.bind(attrs, layer);
      layer.outerRadius = AA("outerRadius");
      layer.innerRadius = AA("innerRadius");
      layer.arc = AA("arc");
      layer.pie = AA("pie");
      layer.location = AA("location");
      layer.color = AA("color");
      layer.value = AA("value");
      layer.label = AA("label");
      layer.scales = function() {
        return scales;
      };
      layer.position = function(layer, width, height, margins) {
        switch (attrs.location) {
          case "center":
            return layer.attr("transform", utils.translate(width / 2, height / 2));
          case "left":
            return layer.attr("transform", utils.translate(attrs.outerRadius, height / 2));
        }
      };
      return layer;
    }
  };

  if (typeof module !== "undefined" && module !== null) {
    module.exports = rene2;
  } else {
    this.rene2 = rene2;
  }

}).call(this);
