(function() {
  var rene,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  rene = {};

  rene.plot = function() {
    var AA, attrs, chart;
    chart = function(selection) {
      return selection.each(function(datasets) {
        var aesthetic, gEnter, layer, layers, panelHeight, panelWidth, scale, svg, svgNode, xAxis, yAxis, _base, _i, _len, _ref, _ref2;
        svg = d3.select(this).selectAll("svg").data([datasets]);
        gEnter = svg.enter().append("svg").attr("class", "plot").append("g");
        gEnter.append("g").attr("class", "x axis");
        gEnter.append("g").attr("class", "y axis");
        gEnter.append("g").attr("class", "geoms");
        layers = svg.select("g.geoms").selectAll("g.layer").data(Object);
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
          var aesthetic, dp, layerData, point, scale, scaleData, _j, _k, _len2, _len3, _ref3, _results;
          layer = attrs.layers[i];
          _ref3 = attrs.scales;
          _results = [];
          for (aesthetic in _ref3) {
            scale = _ref3[aesthetic];
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
        panelWidth = svgNode.clientWidth - (attrs.margin.left + attrs.margin.right);
        panelHeight = svgNode.clientHeight - (attrs.margin.top + attrs.margin.bottom);
        if (attrs.scales.x) {
          attrs.scales.x.range([0, panelWidth]);
          if (attrs.scales.x.rangeBand != null) {
            attrs.scales.x.rangeBands([0, panelWidth], 0.1);
          }
          xAxis = d3.svg.axis().scale(attrs.scales.x).orient("bottom");
          svg.select(".x.axis").attr("transform", utils.translate(0, panelHeight)).call(xAxis);
        }
        if (attrs.scales.y) {
          attrs.scales.y.range([panelHeight, 0]);
          yAxis = d3.svg.axis().scale(attrs.scales.y).orient("left");
          svg.select(".y.axis").call(yAxis);
        }
        svg.select("g").attr("transform", utils.translate(attrs.margin.left, attrs.margin.top));
        layers.each(function(d, i) {
          return d3.transition(d3.select(this)).call(attrs.layers[i], attrs.scales, panelWidth, panelHeight);
        });
        layers.each(function(d, i) {
          return attrs.layers[i].position(d3.select(this), panelWidth, panelHeight, attrs.margin);
        });
        return attrs.legend.call(chart, layers, attrs.scales, panelWidth, panelHeight);
      });
    };
    attrs = {
      margin: {
        top: 20,
        bottom: 20,
        left: 30,
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
  };

}).call(this);
