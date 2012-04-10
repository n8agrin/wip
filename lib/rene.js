(function() {
  var rene,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  rene = {};

  if (typeof module !== "undefined" && module !== null) {
    module.exports = rene;
  } else {
    this.rene = rene;
  }

  rene.utils = {
    translate: function(x, y) {
      return ["translate(", String(x), ",", String(y), ")"].join("");
    }
  };

  rene.chart = function() {
    var chart, layerDelay, layerDuration, layers, legend, margin, scales, xAxis, yAxis;
    margin = {
      top: 20,
      bottom: 20,
      left: 30,
      right: 20
    };
    layers = [];
    scales = {};
    layerDuration = 500;
    layerDelay = 200;
    legend = function() {};
    xAxis = d3.svg.axis().orient("bottom");
    yAxis = d3.svg.axis().orient("left");
    chart = function(selection) {
      return selection.each(function(datasets) {
        var aesthetic, gEnter, layer, layerGroups, panelHeight, panelWidth, scale, svg, _i, _len, _ref;
        svg = d3.select(this).selectAll("svg").data([datasets]);
        gEnter = svg.enter().append("svg").attr("class", "plot").append("g");
        gEnter.append("g").attr("class", "geoms");
        gEnter.append("g").attr("class", "x axis");
        gEnter.append("g").attr("class", "y axis");
        layerGroups = svg.select("g.geoms").selectAll("g.layer").data(Object);
        layerGroups.enter().append("g").attr("class", "layer").attr("id", function(d, i) {
          return "layer" + i;
        });
        for (_i = 0, _len = layers.length; _i < _len; _i++) {
          layer = layers[_i];
          _ref = layer.scales();
          for (aesthetic in _ref) {
            scale = _ref[aesthetic];
            scales[aesthetic] || (scales[aesthetic] = scale());
          }
        }
        layerGroups.each(function(d, i) {
          var aesthetic, dp, layerData, point, scale, scaleData, _j, _k, _len2, _len3, _results;
          layer = layers[i];
          _results = [];
          for (aesthetic in scales) {
            scale = scales[aesthetic];
            if (layer[aesthetic]) {
              layerData = d.map(layer[aesthetic]());
              scaleData = scale.domain();
              if (aesthetic === "color") {
                for (_j = 0, _len2 = layerData.length; _j < _len2; _j++) {
                  dp = layerData[_j];
                  if (__indexOf.call(scaleData, dp) < 0) scaleData.push(dp);
                }
                _results.push(scale.domain(scaleData));
              } else if (scale.rangeBand) {
                for (_k = 0, _len3 = layerData.length; _k < _len3; _k++) {
                  point = layerData[_k];
                  if (__indexOf.call(scaleData, point) < 0) scaleData.push(point);
                }
                _results.push(scale.domain(scaleData));
              } else {
                _results.push(scale.domain(d3.extent(layerData.concat(scaleData))));
              }
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        });
        svg.attr("width", this.clientWidth).attr("height", this.clientHeight);
        panelWidth = this.clientWidth - (margin.left + margin.right);
        panelHeight = this.clientHeight - (margin.top + margin.bottom);
        if (scales.x) {
          if (scales.x.rangeBand != null) {
            scales.x.rangeBands([0, panelWidth], 0.1);
          } else {
            scales.x.range([0, panelWidth]);
          }
          xAxis.scale(scales.x);
          svg.select(".x.axis").attr("transform", rene.utils.translate(0, panelHeight)).call(xAxis);
        }
        if (scales.y) {
          scales.y.range([panelHeight, 0]);
          yAxis.scale(scales.y);
          svg.select(".y.axis").call(yAxis);
        }
        svg.select("g").attr("transform", rene.utils.translate(margin.left, margin.top));
        layerGroups.each(function(d, i) {
          return d3.transition(d3.select(this)).call(layers[i], scales, panelWidth, panelHeight);
        });
        layerGroups.each(function(d, i) {
          return layers[i].position(d3.select(this), panelWidth, panelHeight, margin);
        });
        return legend.call(chart, layerGroups, scales, panelWidth, panelHeight);
      });
    };
    chart.margin = function(v) {
      if (!v) return margin;
      margin = v;
      return chart;
    };
    chart.layerDuration = function(v) {
      if (!v) return layerDuration;
      layerDuration = v;
      return chart;
    };
    chart.layerDelay = function(v) {
      if (!v) return layerDelay;
      layerDelay = v;
      return chart;
    };
    chart.legend = function(v) {
      if (!v) return legend;
      legend = v;
      return chart;
    };
    chart.scales = function(v) {
      if (!v) return scales;
      scales = v;
      return chart;
    };
    chart.scale = function(name, fn) {
      if (!fn) return scales[name];
      scales[name] = fn;
      return chart;
    };
    chart.xAxis = function(v) {
      if (!v) return xAxis;
      xAxis = v;
      return chart;
    };
    chart.yAxis = function(v) {
      if (!v) return yAxis;
      yAxis = v;
      return chart;
    };
    chart.layers = function(v) {
      if (!v) return layers;
      layers = v;
      return chart;
    };
    chart.addLayer = function(v) {
      layers.push(v);
      return chart;
    };
    return chart;
  };

  rene.scatter = function() {
    var color, layer, scales, size, x, y;
    x = function(d) {
      return d[0];
    };
    y = function(d) {
      return d[1];
    };
    color = function(d) {
      return "blue";
    };
    size = function(d) {
      return 2;
    };
    scales = {
      x: d3.scale.linear,
      y: d3.scale.linear,
      color: d3.scale.category20,
      size: d3.scale.linear
    };
    layer = function(g, scales) {
      g.classed("scatter", true);
      return g.each(function() {
        var circles, circlesEnter, circlesExit, circlesUpdate;
        circles = d3.select(this).selectAll("circle").data(Object);
        circlesEnter = circles.enter().append("circle").attr("opacity", 1e-6);
        circlesExit = d3.transition(circles.exit()).attr("opacity", 0).remove();
        circlesUpdate = d3.transition(circles).attr("opacity", 1);
        return circlesUpdate.attr("cx", function(d) {
          return scales.x(x(d));
        }).attr("cy", function(d) {
          return scales.y(y(d));
        }).attr("r", function(d) {
          return size(d);
        }).style("fill", function(d) {
          return color(d);
        });
      });
    };
    layer.x = function(v) {
      if (!v) return x;
      x = d3.functor(v);
      return layer;
    };
    layer.y = function(v) {
      if (!v) return y;
      y = d3.functor(v);
      return layer;
    };
    layer.color = function(v) {
      if (!v) return color;
      color = d3.functor(v);
      return layer;
    };
    layer.size = function(v) {
      if (!v) return size;
      size = d3.functor(v);
      return layer;
    };
    layer.scales = function() {
      return scales;
    };
    layer.position = function() {};
    return layer;
  };

  rene.line = function() {
    var color, interpolate, layer, scales, size, x, y;
    x = function(d) {
      return d[0];
    };
    y = function(d) {
      return d[1];
    };
    color = function(d) {
      return d[2];
    };
    size = function(d) {
      return d[3];
    };
    interpolate = "cardinal";
    scales = {
      x: d3.scale.linear,
      y: d3.scale.linear,
      color: d3.scale.category20,
      size: d3.scale.linear
    };
    layer = function(g, scales) {
      var pathFn;
      pathFn = d3.svg.line().interpolate(layer.interpolate()).x(function(d) {
        return scales.x(x(d));
      }).y(function(d) {
        return scales.y(y(d));
      });
      g.classed("line", true);
      return g.each(function(data) {
        var lines, linesEnter, linesExit, linesUpdate;
        lines = d3.select(this).selectAll("path").data([data]);
        linesEnter = lines.enter().append("path");
        linesExit = d3.transition(lines.exit()).remove();
        linesUpdate = d3.transition(lines);
        return linesUpdate.attr("d", pathFn);
      });
    };
    layer.x = function(v) {
      if (!v) return x;
      x = d3.functor(v);
      return layer;
    };
    layer.y = function(v) {
      if (!v) return y;
      y = d3.functor(v);
      return layer;
    };
    layer.color = function(v) {
      if (!v) return color;
      color = d3.functor(v);
      return layer;
    };
    layer.size = function(v) {
      if (!v) return size;
      size = d3.functor(v);
      return layer;
    };
    layer.interpolate = function(v) {
      if (!v) return interpolate;
      interpolate = d3.functor(v);
      return layer;
    };
    layer.scales = function() {
      return scales;
    };
    layer.position = function() {};
    return layer;
  };

  rene.area = function() {
    var color, interpolate, layer, scales, size, x, y, y0, y1;
    x = function(d) {
      return d[0];
    };
    y = function(d) {
      return d[1];
    };
    y0 = function(d) {
      return 0;
    };
    y1 = function(d) {
      return 0;
    };
    color = function(d) {
      return d[2];
    };
    size = function(d) {
      return d[3];
    };
    interpolate = d3.functor("cardinal");
    scales = {
      x: d3.scale.linear,
      y: d3.scale.linear,
      color: d3.scale.category20,
      size: d3.scale.linear
    };
    layer = function(g, scales) {
      var pathFn;
      pathFn = d3.svg.area().interpolate(interpolate()).x(function(d) {
        return scales.x(x(d));
      }).y(function(d) {
        return scales.y(y(d));
      }).y0(function(d) {
        return scales.y(y0(d));
      }).y1(function(d) {
        return scales.y(y(d) + y0(d));
      });
      g.classed("area", true);
      return g.each(function(data) {
        var lines, linesEnter, linesExit, linesUpdate;
        lines = d3.select(this).selectAll("path").data([data]);
        linesEnter = lines.enter().append("path");
        linesExit = d3.transition(lines.exit()).remove();
        linesUpdate = d3.transition(lines);
        console.log('scaley ', scales.y.range());
        return linesUpdate.attr("d", pathFn.y0(scales.y.range()[0]));
      });
    };
    layer.x = function(v) {
      if (!v) return x;
      x = d3.functor(v);
      return layer;
    };
    layer.y = function(v) {
      if (!v) return y;
      y = d3.functor(v);
      return layer;
    };
    layer.y0 = function(v) {
      if (!v) return y0;
      y0 = d3.functor(v);
      return layer;
    };
    layer.y1 = function(v) {
      if (!v) return y1;
      y1 = d3.functor(v);
      return layer;
    };
    layer.color = function(v) {
      if (!v) return color;
      color = d3.functor(v);
      return layer;
    };
    layer.size = function(v) {
      if (!v) return size;
      size = d3.functor(v);
      return layer;
    };
    layer.interpolate = function(v) {
      if (!v) return interpolate;
      interpolate = d3.functor(v);
      return layer;
    };
    layer.scales = function() {
      return scales;
    };
    layer.position = function() {};
    return layer;
  };

  rene.bar = function() {
    var layer, scales, x, y;
    x = function(d) {
      return d[0];
    };
    y = function(d) {
      return d[1];
    };
    scales = {
      x: d3.scale.ordinal,
      y: d3.scale.linear
    };
    layer = function(g, scales, w, h) {
      return g.each(function(d, i) {
        var bars, barsEnter, barsExit, barsUpdate;
        bars = d3.select(this).selectAll("rect").data(d);
        barsEnter = bars.enter().append("rect");
        barsExit = d3.transition(bars.exit()).remove();
        return barsUpdate = d3.transition(bars).attr("x", function(d) {
          return scales.x(x(d));
        }).attr("y", function(d) {
          return scales.y(y(d));
        }).attr("height", function(d) {
          return h - scales.y(y(d));
        }).attr("width", function() {
          return scales.x.rangeBand();
        });
      });
    };
    layer.x = function(v) {
      if (!v) return x;
      x = d3.functor(v);
      return layer;
    };
    layer.y = function(v) {
      if (!v) return y;
      y = d3.functor(v);
      return layer;
    };
    layer.color = function(v) {
      var color;
      if (!v) return color;
      color = d3.functor(v);
      return layer;
    };
    layer.size = function(v) {
      var size;
      if (!v) return size;
      size = d3.functor(v);
      return layer;
    };
    layer.scales = function() {
      return scales;
    };
    layer.position = function() {};
    return layer;
  };

  rene.pie = function() {
    var AA, attrs, layer, scales;
    layer = function(g, scales, width, height) {
      return g.each(function(d, i) {
        var arc, arcs, arcsEnter, arcsExit, arcsUpdate, innerRadius, outerRadius, pie, pieData;
        pie = attrs.pie;
        pieData = pie(d.map(attrs.value));
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
        arcs = g.selectAll("path.arc").data(d);
        arcsEnter = arcs.enter().append("path").attr("class", "arc").style("opacity", 1e-6);
        arcsExit = d3.transition(arcs.exit()).style("opacity", 1e-6).remove();
        arcsUpdate = d3.transition(arcs).style("opacity", 1);
        return arcsUpdate.attr("d", function(d, i) {
          return arc(pieData[i]);
        }).attr("fill", function(d, i) {
          return scales.color(attrs.color(d, i));
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
          return layer.attr("transform", utils.translate(attrs.outerRadius(width, height), height / 2));
      }
    };
    return layer;
  };

}).call(this);
