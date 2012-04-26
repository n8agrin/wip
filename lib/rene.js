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
    },
    naiveFill: function(data) {
      var cats, kind, mapData, newSets, points, samples, seen;
      samples = data.map(function(dset) {
        return dset[0];
      });
      if (samples[0].x instanceof Date) {
        kind = "date";
      } else {
        kind = typeof samples[0].x;
      }
      data = data.map(function(dset) {
        return dset.map(function(p) {
          var k, n, v;
          n = {};
          for (k in p) {
            v = p[k];
            n[k] = v;
          }
          return n;
        });
      });
      if (kind === "date" || kind === "number") {
        mapData = data.map(function(dset, i) {
          return dset.reduce((function(p, c) {
            var x;
            x = c.x.valueOf();
            if (!p[x]) {
              p[x] = c;
            } else {
              p[x].y += c.y;
            }
            return p;
          }), {});
        });
        points = d3.merge(mapData.map(function(dset) {
          return Object.keys(dset).map(function(x) {
            return parseInt(x, 10);
          });
        })).sort(function(a, b) {
          if (a < b) {
            return -1;
          } else if (a === b) {
            return 0;
          } else {
            return 1;
          }
        }).reduce((function(p, c) {
          if (p.last !== c) {
            p.push(c);
            p.last = c;
          }
          return p;
        }), []);
        newSets = mapData.map(function(dset, i) {
          return points.map(function(p, j) {
            return dset[p] || {
              x: parseInt(p, 10),
              y: 0
            };
          });
        });
        if (kind === "date") {
          newSets.forEach(function(dset) {
            return dset.forEach(function(p) {
              return p.x = new Date(p.x.valueOf());
            });
          });
        }
      } else {
        seen = data.map(function(dset, di) {
          return dset.reduce((function(p, c) {
            p[c.x] = c;
            return p;
          }), {});
        });
        cats = d3.merge(seen.map(function(c) {
          return Object.keys(c);
        })).sort().reduce((function(p, c) {
          if (p.last !== c) {
            p.push(c);
            p.last = c;
          }
          return p;
        }), []);
        newSets = data.map(function(dset, di) {
          return cats.map(function(c) {
            return seen[di][c] || {
              x: c,
              y: 0
            };
          });
        });
      }
      newSets.forEach(function(dset, i) {
        return dset.forEach(function(p) {
          var k, v, _ref, _results;
          _ref = samples[i];
          _results = [];
          for (k in _ref) {
            v = _ref[k];
            if (!(p[k] != null)) {
              _results.push(p[k] = v);
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        });
      });
      return newSets;
    }
  };

  rene.aesthetics = ['x', 'y', 'color', 'group'];

  rene.chart = function() {
    var chart, group, layerDelay, layerDuration, layers, legend, mapData, margin, scales, xAxis, xAxisLabel, yAxis, yAxisLabel;
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
    xAxisLabel = null;
    yAxisLabel = null;
    mapData = function(layer, data) {
      var aesthetic, mapped, newPoint, point, points, _i, _j, _len, _len2, _ref;
      points = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        point = data[_i];
        newPoint = {};
        _ref = rene.aesthetics;
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          aesthetic = _ref[_j];
          if (layer[aesthetic] && (mapped = (layer[aesthetic]())(point))) {
            newPoint[aesthetic] = mapped;
          }
        }
        points.push(newPoint);
      }
      return points;
    };
    group = function(data) {
      var k, v, _ref, _results;
      if (data[0].group) {
        _ref = d3.nest().key(function(d) {
          return d.group;
        }).map(data);
        _results = [];
        for (k in _ref) {
          v = _ref[k];
          _results.push(v);
        }
        return _results;
      } else {
        return [data];
      }
    };
    chart = function(selection) {
      return selection.each(function(datasets) {
        var aesthetic, gEnter, layer, layerGroups, panelHeight, panelWidth, scale, svg, xGridAxis, xLabel, xLabelEnter, yGridAxis, yLabel, yLabelEnter, _i, _len, _ref;
        svg = d3.select(this).selectAll("svg").data([datasets]);
        gEnter = svg.enter().append("svg").attr("class", "plot").append("g");
        gEnter.append("g").attr("class", "x grid");
        gEnter.append("g").attr("class", "y grid");
        gEnter.append("g").attr("class", "geoms");
        gEnter.append("g").attr("class", "x axis");
        gEnter.append("g").attr("class", "y axis");
        layerGroups = svg.select("g.geoms").selectAll("g.layer").data(function(datasets, i) {
          return datasets.map(function(dataset) {
            var grouped, mappedData;
            mappedData = mapData(layers[i], dataset);
            grouped = group(mappedData);
            return layers[i].position()(grouped);
          });
        });
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
              if (aesthetic === 'y') {
                layerData = d.reduce(function(prev, curr) {
                  return prev.concat(curr.map(function(point) {
                    return point[aesthetic] + (point[aesthetic + '0'] || 0);
                  }));
                }, []);
              } else {
                layerData = d.reduce(function(prev, curr) {
                  return prev.concat(curr.map(function(point) {
                    return point[aesthetic];
                  }));
                }, []);
              }
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
          if (scales.x.rangeRoundBands != null) {
            scales.x.rangeRoundBands([0, panelWidth], 0.1);
          } else {
            scales.x.range([0, panelWidth]);
          }
        }
        if (scales.y) scales.y.range([panelHeight, 0]);
        svg.select("g").attr("transform", rene.utils.translate(margin.left, margin.top));
        layerGroups.each(function(d, i) {
          return d3.transition(d3.select(this)).call(layers[i], scales, panelWidth, panelHeight);
        });
        layerGroups.each(function(d, i) {
          return layers[i].position(d3.select(this), panelWidth, panelHeight, margin);
        });
        if (scales.x) {
          xAxis.scale(scales.x);
          svg.select('.x.axis').attr('transform', rene.utils.translate(0, panelHeight)).call(xAxis);
          xGridAxis = d3.svg.axis().scale(scales.x).tickSize(-panelHeight, -panelHeight, -panelHeight).orient('bottom');
          svg.select('g.x.grid').attr('transform', rene.utils.translate(0, panelHeight)).call(xGridAxis);
          svg.selectAll('g.x.grid text, g.x.grid path.domain').remove();
          if (xAxisLabel) {
            xAxis = d3.select('.x.axis');
            xLabel = xAxis.selectAll('text.label').data([xAxisLabel]);
            xLabelEnter = xLabel.enter().append('text').classed('label', true);
            xLabel.text(function(d) {
              return d;
            }).attr('transform', rene.utils.translate(0, 34));
          }
        }
        if (scales.y) {
          yAxis.scale(scales.y);
          svg.select(".y.axis").call(yAxis);
          yGridAxis = d3.svg.axis().scale(scales.y).tickSize(-panelWidth, -panelWidth, -panelWidth).orient('left');
          svg.select('g.y.grid').call(yGridAxis);
          svg.selectAll('g.y.grid text, g.y.grid path.domain').remove();
          if (yAxisLabel) {
            yAxis = d3.select('.y.axis');
            yLabel = yAxis.selectAll('text.label').data([yAxisLabel]);
            yLabelEnter = yLabel.enter().append('text').classed('label', true);
            yLabel.text(function(d) {
              return d;
            }).attr("transform", rene.utils.translate(-34, panelHeight) + " rotate(270, 0, 0)");
          }
        }
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
    chart.xAxisLabel = function(v) {
      if (!arguments.length) return xAxisLabel;
      xAxisLabel = v;
      return chart;
    };
    chart.yAxisLabel = function(v) {
      if (!arguments.length) return yAxisLabel;
      yAxisLabel = v;
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
    var barWidth, color, group, layer, padding, position, ranger, scales, step, x, y;
    x = function(d) {
      return d[0];
    };
    y = function(d) {
      return d[1];
    };
    color = function(d) {
      return d[1];
    };
    group = function(d) {
      return d[2];
    };
    position = function(data) {
      if (data.some(function(el, idx, ar) {
        return idx !== ar.length - 1 && el.length !== ar[idx + 1].length;
      })) {
        data = rene.utils.naiveFill(data);
      }
      return d3.layout.stack()(data);
    };
    scales = {
      x: d3.scale.ordinal,
      y: d3.scale.linear,
      color: d3.scale.category20
    };
    ranger = d3.range;
    step = d3.functor(1);
    padding = function(barWidth) {
      if (barWidth <= 4) {
        return 0;
      } else {
        return 2;
      }
    };
    barWidth = function(scales) {
      var bars, ord, start, stop, _ref;
      if (scales.x.rangeBand) {
        return scales.x.rangeBand();
      } else {
        _ref = scales.x.domain(), start = _ref[0], stop = _ref[1];
        bars = ranger(start, stop, step());
        ord = d3.scale.ordinal().domain(bars).rangeRoundBands(scales.x.range(), 0.2);
        scales.x.domain(ord.domain()).range(ord.range());
        return ord.rangeBand() || 1;
      }
    };
    layer = function(g, scales, w, h) {
      var width;
      width = barWidth(scales);
      g.classed("bar", true);
      return g.each(function(d, i) {
        var barGroups, bars, barsEnter, barsExit, barsUpdate, posd;
        posd = position(d);
        barGroups = d3.select(this).selectAll("g").data(posd);
        barGroups.enter().append("g");
        bars = barGroups.selectAll("rect").data(Object);
        barsEnter = bars.enter().append("rect");
        barsExit = d3.transition(bars.exit()).remove();
        barsUpdate = d3.transition(bars).attr("x", function(d) {
          return scales.x(d.x);
        }).attr("y", function(d) {
          return scales.y(d.y0) - (h - scales.y(d.y));
        }).attr("height", function(d) {
          return h - scales.y(d.y);
        }).attr("width", function() {
          return width;
        });
        if (scales.color) {
          return barsUpdate.style("fill", function(d) {
            return scales.color(d.color);
          });
        }
      });
    };
    layer.x = function(v) {
      if (!arguments.length) return x;
      x = d3.functor(v);
      return layer;
    };
    layer.y = function(v) {
      if (!arguments.length) return y;
      y = d3.functor(v);
      return layer;
    };
    layer.color = function(v) {
      if (!arguments.length) return color;
      color = d3.functor(v);
      return layer;
    };
    layer.group = function(v) {
      if (!arguments.length) return group;
      group = v;
      return layer;
    };
    layer.barWidth = function(v) {
      var bandWidth;
      if (!arguments.length) return bandWidth;
      bandWidth = d3.functor(v);
      return layer;
    };
    layer.ranger = function(v) {
      if (!arguments.length) return ranger;
      ranger = d3.functor(v);
      return layer;
    };
    layer.step = function(v) {
      if (!arguments.length) return step;
      step = d3.functor(v);
      return layer;
    };
    layer.padding = function(v) {
      if (!arguments.length) return padding;
      padding = d3.functor(v);
      return layer;
    };
    layer.position = function(v) {
      if (!arguments.length) return position;
      position = v;
      return layer;
    };
    layer.scales = function() {
      return scales;
    };
    return layer;
  };

  rene.pie = function() {
    var arc, color, innerRadius, label, layer, location, locationMargin, outerRadius, pie, scales, value;
    outerRadius = d3.functor(100);
    innerRadius = d3.functor(10);
    location = "center";
    locationMargin = 10;
    arc = d3.svg.arc();
    pie = d3.layout.pie();
    color = function(d, i) {
      return d;
    };
    value = function(v) {
      return v;
    };
    label = function(l) {
      return l;
    };
    scales = {
      color: d3.scale.category20
    };
    layer = function(g, scales, width, height) {
      g.classed("pie", true);
      return g.each(function(d, i) {
        var arcs, arcsEnter, arcsExit, arcsUpdate, pied;
        pied = pie(d);
        arc = arc.outerRadius(outerRadius(width, height)).innerRadius(innerRadius(width, height));
        arcs = d3.select(this).selectAll("path.arc").data(d);
        arcsEnter = arcs.enter().append("path").attr("class", "arc").style("opacity", 1e-6);
        arcsExit = d3.transition(arcs.exit()).style("opacity", 1e-6).remove();
        arcsUpdate = d3.transition(arcs).style("opacity", 1);
        return arcsUpdate.attr("d", function(d, i) {
          return arc(pied[i]);
        }).attr("fill", function(d, i) {
          return scales.color(color(d, i));
        });
      });
    };
    layer.outerRadius = function(v) {
      if (!(v != null)) return outerRadius;
      outerRadius = d3.functor(v);
      return layer;
    };
    layer.innerRadius = function(v) {
      if (!(v != null)) return innerRadius;
      innerRadius = d3.functor(v);
      return layer;
    };
    layer.arc = function(v) {
      if (!(v != null)) return arc;
      arc = v;
      return layer;
    };
    layer.pie = function(v) {
      if (!(v != null)) return pie;
      pie = v;
      return layer;
    };
    layer.location = function(v) {
      if (!(v != null)) return location;
      location = v;
      return layer;
    };
    layer.color = function(v) {
      if (!(v != null)) return color;
      color = v;
      return layer;
    };
    layer.value = function(v) {
      if (!(v != null)) return value;
      value = v;
      return layer;
    };
    layer.label = function(v) {
      if (!(v != null)) return label;
      label = v;
      return layer;
    };
    layer.scales = function() {
      return scales;
    };
    layer.position = function(layer, width, height, margins) {
      switch (location) {
        case "center":
          return layer.attr("transform", rene.utils.translate(width / 2, height / 2));
        case "left":
          return layer.attr("transform", rene.utils.translate(outerRadius(width, height), height / 2));
      }
    };
    return layer;
  };

}).call(this);
