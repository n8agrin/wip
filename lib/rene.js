(function() {
  var rene,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  rene = {};

  if (typeof module !== "undefined" && module !== null) {
    module.exports = rene;
  } else {
    this.rene = rene;
  }

  rene.chart = function() {
    var chart, layerDelay, layerDuration, layers, legend, margin, scales;
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
    chart = function(selection) {
      return selection.each(function(datasets) {
        var aesthetic, gEnter, layer, layerGroups, panelHeight, panelWidth, scale, svg, svgNode, xAxis, yAxis, _i, _len, _ref;
        svg = d3.select(this).selectAll("svg").data([datasets]);
        gEnter = svg.enter().append("svg").attr("class", "plot").append("g");
        gEnter.append("g").attr("class", "x axis");
        gEnter.append("g").attr("class", "y axis");
        gEnter.append("g").attr("class", "geoms");
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
        svgNode = svg.node();
        panelWidth = svgNode.clientWidth - (margin.left + margin.right);
        panelHeight = svgNode.clientHeight - (margin.top + margin.bottom);
        if (scales.x) {
          scales.x.range([0, panelWidth]);
          if (scales.x.rangeBand != null) {
            scales.x.rangeBands([0, panelWidth], 0.1);
          }
          xAxis = d3.svg.axis().scale(scales.x).orient("bottom");
          svg.select(".x.axis").attr("transform", utils.translate(0, panelHeight)).call(xAxis);
        }
        if (scales.y) {
          scales.y.range([panelHeight, 0]);
          yAxis = d3.svg.axis().scale(scales.y).orient("left");
          svg.select(".y.axis").call(yAxis);
        }
        svg.select("g").attr("transform", utils.translate(margin.left, margin.top));
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
      if (!arguments.length) return margin;
      margin = v;
      return chart;
    };
    chart.layerDuration = function(v) {
      if (!arguments.length) return layerDuration;
      layerDuration = v;
      return chart;
    };
    chart.layerDelay = function(v) {
      if (!arguments.length) return layerDelay;
      layerDelay = v;
      return chart;
    };
    chart.legend = function(v) {
      if (!arguments.length) return legend;
      legend = v;
      return chart;
    };
    chart.scales = function(v) {
      if (!arguments.length) return scales;
      scales = v;
      return chart;
    };
    chart.layers = function(v) {
      if (!arguments.length) return layers;
      layers = v;
      return chart;
    };
    chart.addLayer = function(v) {
      layers.push(v);
      return chart;
    };
    return chart;
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
