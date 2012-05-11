(function() {
  var rene,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  rene = {};

  if (typeof module !== "undefined" && module !== null) {
    module.exports = rene;
  } else {
    this.wip = rene;
  }

  rene.utils = {
    translate: function(x, y) {
      return "translate(" + x + "," + y + ")";
    },
    naiveFill: function(data) {
      var cats, kind, mapData, newSets, points, samples, seen;
      if (!data.some(function(dataset) {
        return dataset.length;
      })) {
        return data;
      }
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

  rene.chart = function() {
    var chart, layerDelay, layerDuration, layerGroups, layers, legend, margin, origScales, panelSize, render, resetXYScales, scales, svg, xAxis, xAxisLabel, xGrid, yAxis, yAxisLabel, yGrid;
    margin = {
      top: 20,
      bottom: 20,
      left: 30,
      right: 20
    };
    layers = [];
    scales = {};
    origScales = {};
    layerDuration = 500;
    layerDelay = 200;
    legend = function() {};
    xAxis = d3.svg.axis().orient("bottom");
    yAxis = d3.svg.axis().orient("left");
    xAxisLabel = null;
    yAxisLabel = null;
    xGrid = d3.svg.axis();
    yGrid = d3.svg.axis();
    panelSize = [0, 0];
    svg = d3.select();
    layerGroups = d3.select();
    resetXYScales = function() {
      var scaleName, _i, _len, _ref, _results;
      _ref = ['x', 'y'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        scaleName = _ref[_i];
        if (scales[scaleName] && origScales[scaleName]) {
          _results.push(scales[scaleName] = origScales[scaleName].copy());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    render = function() {
      var panelHeight, panelWidth, xLabel, xLabelEnter, yLabel, yLabelEnter, ytemp;
      panelWidth = panelSize[0], panelHeight = panelSize[1];
      layerGroups.each(function(d, i) {
        return d3.transition(d3.select(this)).call(layers[i], scales, panelWidth, panelHeight);
      });
      layerGroups.each(function(d, i) {
        return layers[i].move(d3.select(this), panelWidth, panelHeight, margin);
      });
      if (scales.x) {
        xAxis.scale(scales.x);
        svg.select('.x.axis').attr('transform', rene.utils.translate(0, panelHeight)).call(xAxis);
        if (xGrid) {
          xGrid.scale(scales.x).tickSize(-panelHeight, -panelHeight, -panelHeight).orient('bottom');
          svg.select('g.x.grid').attr('transform', rene.utils.translate(0, panelHeight)).call(xGrid);
          svg.selectAll('g.x.grid text, g.x.grid path.domain').remove();
        }
        if (xAxisLabel) {
          console.log('x label', xAxisLabel);
          xLabel = svg.select('.x.axis').selectAll('text.label').data([xAxisLabel]);
          xLabelEnter = xLabel.enter().append('text').classed('label', true);
          xLabel.text(function(d) {
            return d;
          }).attr('transform', rene.utils.translate(0, 34));
        }
      }
      if (scales.y) {
        if (yAxis) {
          ytemp = scales.y.copy();
          ytemp.range(ytemp.range().concat().reverse());
          yAxis.scale(ytemp);
          svg.select(".y.axis").call(yAxis);
        }
        if (yGrid) {
          yGrid.scale(scales.y).tickSize(-panelWidth, -panelWidth, -panelWidth).orient('left');
          svg.select('g.y.grid').call(yGrid);
          svg.selectAll('g.y.grid text, g.y.grid path.domain').remove();
        }
        if (yAxisLabel) {
          yLabel = svg.select('.y.axis').selectAll('text.label').data([yAxisLabel]);
          yLabelEnter = yLabel.enter().append('text').classed('label', true);
          return yLabel.text(function(d) {
            return d;
          }).attr("transform", rene.utils.translate(-40, panelHeight) + " rotate(270, 0, 0)");
        }
      }
    };
    chart = function(selection) {
      return selection.each(function(datasets) {
        var aesValues, aesthetic, dataGroup, dataset, gEnter, idx, layer, panelHeight, panelWidth, point, positionedData, scale, scaleData, _i, _j, _k, _l, _len, _len2, _len3, _len4, _ref, _ref2;
        svg = d3.select(this).selectAll("svg").data([datasets]);
        gEnter = svg.enter().append("svg").attr("class", "plot").append("g");
        gEnter.append("g").attr("class", "x grid");
        gEnter.append("g").attr("class", "y grid");
        gEnter.append("g").attr("class", "geoms");
        gEnter.append("g").attr("class", "x axis");
        gEnter.append("g").attr("class", "y axis");
        for (_i = 0, _len = layers.length; _i < _len; _i++) {
          layer = layers[_i];
          _ref = layer.scales();
          for (aesthetic in _ref) {
            scale = _ref[aesthetic];
            scales[aesthetic] || chart.scale(aesthetic, scale());
          }
        }
        positionedData = (function() {
          var _len2, _results;
          _results = [];
          for (idx = 0, _len2 = datasets.length; idx < _len2; idx++) {
            dataset = datasets[idx];
            _results.push(layers[idx].mapData(dataset));
          }
          return _results;
        })();
        layerGroups = svg.select("g.geoms").selectAll("g.layer").data(positionedData);
        layerGroups.enter().append("g").attr("class", "layer").attr("id", function(d, i) {
          return "layer" + i;
        });
        resetXYScales();
        svg.attr("width", this.clientWidth).attr("height", this.clientHeight);
        panelWidth = this.clientWidth - (margin.left + margin.right);
        panelHeight = this.clientHeight - (margin.top + margin.bottom);
        panelSize = [panelWidth, panelHeight];
        if (scales.x) {
          if (scales.x.rangeRoundBands != null) {
            scales.x.rangeRoundBands([0, panelWidth], 0.1);
          } else {
            scales.x.range([0, panelWidth]);
          }
        }
        if (scales.y) scales.y.range([0, panelHeight]);
        for (aesthetic in scales) {
          scale = scales[aesthetic];
          scaleData = scale.domain().concat();
          for (_j = 0, _len2 = positionedData.length; _j < _len2; _j++) {
            dataset = positionedData[_j];
            for (_k = 0, _len3 = dataset.length; _k < _len3; _k++) {
              dataGroup = dataset[_k];
              if (scale.rangeBand) {
                for (_l = 0, _len4 = dataGroup.length; _l < _len4; _l++) {
                  point = dataGroup[_l];
                  if (_ref2 = point[aesthetic], __indexOf.call(scaleData, _ref2) < 0) {
                    scaleData.push(point[aesthetic]);
                  }
                }
              } else {
                if (aesthetic === 'y') {
                  aesValues = (function() {
                    var _len5, _m, _results;
                    _results = [];
                    for (_m = 0, _len5 = dataGroup.length; _m < _len5; _m++) {
                      point = dataGroup[_m];
                      _results.push(point[aesthetic] + (point[aesthetic + '0'] || 0));
                    }
                    return _results;
                  })();
                } else {
                  aesValues = (function() {
                    var _len5, _m, _results;
                    _results = [];
                    for (_m = 0, _len5 = dataGroup.length; _m < _len5; _m++) {
                      point = dataGroup[_m];
                      _results.push(point[aesthetic]);
                    }
                    return _results;
                  })();
                }
                scaleData = d3.extent(scaleData.concat(aesValues));
              }
            }
          }
          scale.domain(scaleData);
        }
        svg.select("g").attr("transform", rene.utils.translate(margin.left, margin.top));
        render();
        return typeof legend === "function" ? legend(layerGroups, datasets, scales, panelWidth, panelHeight) : void 0;
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
    chart.scales = function() {
      var aesthetic, copiedScales, scale;
      copiedScales = {};
      for (aesthetic in scales) {
        scale = scales[aesthetic];
        copiedScales[aesthetic] = scale.copy();
      }
      return copiedScales;
    };
    chart.scale = function(aesthetic, scale) {
      if (!scale) return scales[aesthetic];
      scales[aesthetic] = scale;
      origScales[aesthetic] = scale.copy();
      return chart;
    };
    chart.xAxis = function(v) {
      if (!arguments.length) return xAxis;
      xAxis = v;
      return chart;
    };
    chart.yAxis = function(v) {
      if (!arguments.length) return yAxis;
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
    chart.xGrid = function(v) {
      if (!arguments.length) return xGrid;
      xGrid = v;
      return chart;
    };
    chart.yGrid = function(v) {
      if (!arguments.length) return yGrid;
      yGrid = v;
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
    chart.panelSize = function() {
      return panelSize;
    };
    chart.render = render;
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
    var color, group, groupData, interpolate, layer, mapData, position, scales, size, x, y;
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
    group = function(d) {
      return d[2];
    };
    interpolate = "cardinal";
    position = function(data) {
      return data;
    };
    mapData = function(dataset) {
      var aesthetic, aesthetics, newPoint, newPoints, point, _i, _j, _len, _len2;
      aesthetics = [['x', x], ['y', y], ['color', color], ['group', group]];
      newPoints = [];
      for (_i = 0, _len = dataset.length; _i < _len; _i++) {
        point = dataset[_i];
        newPoint = {};
        for (_j = 0, _len2 = aesthetics.length; _j < _len2; _j++) {
          aesthetic = aesthetics[_j];
          newPoint[aesthetic[0]] = aesthetic[1](point);
        }
        newPoints.push(newPoint);
      }
      return position(groupData(newPoints));
    };
    groupData = function(dataset) {
      var k, v, _ref, _ref2, _results;
      if ((_ref = dataset[0]) != null ? _ref.group : void 0) {
        _ref2 = d3.nest().key(function(d) {
          return d.group;
        }).map(dataset);
        _results = [];
        for (k in _ref2) {
          v = _ref2[k];
          _results.push(v);
        }
        return _results;
      } else {
        return [dataset];
      }
    };
    scales = {
      x: d3.time.scale,
      y: d3.scale.linear,
      color: d3.scale.category20,
      size: d3.scale.linear
    };
    layer = function(g, scales) {
      var pathFn;
      pathFn = d3.svg.line().interpolate(layer.interpolate()).x(function(d) {
        return scales.x(d.x);
      }).y(function(d) {
        return scales.y(d.y);
      });
      g.classed("line", true);
      return g.each(function(dataset) {
        var lineGroups, lines, linesEnter, linesExit, linesUpdate;
        lineGroups = d3.select(this).selectAll('g').data(dataset);
        lineGroups.enter().append('g');
        d3.transition(lineGroups.exit()).remove();
        lines = lineGroups.selectAll('path').data(function(pathset) {
          return [pathset];
        });
        linesEnter = lines.enter().append('path');
        linesExit = d3.transition(lines.exit()).remove();
        linesUpdate = d3.transition(lines);
        linesUpdate.attr("d", pathFn);
        if (scales.color) {
          return linesUpdate.style('stroke', function(pathset) {
            if (pathset[0] != null) return scales.color(pathset[0].color);
          });
        }
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
    layer.group = function(v) {
      if (!arguments.length) return group;
      group = v;
      return layer;
    };
    layer.scales = function() {
      return scales;
    };
    layer.mapData = mapData;
    layer.move = function() {};
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
    var barWidth, color, group, groupData, layer, mapData, move, padding, position, ranger, scales, stack, step, x, y;
    scales = {
      x: d3.scale.ordinal,
      y: d3.scale.linear,
      color: d3.scale.category20
    };
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
    stack = d3.layout.stack();
    move = function() {};
    position = function(data) {
      return stack(rene.utils.naiveFill(data));
    };
    mapData = function(dataset) {
      var aesthetic, aesthetics, newPoint, newPoints, point, _i, _j, _len, _len2;
      aesthetics = [['x', x], ['y', y], ['color', color], ['group', group]];
      newPoints = [];
      for (_i = 0, _len = dataset.length; _i < _len; _i++) {
        point = dataset[_i];
        newPoint = {};
        for (_j = 0, _len2 = aesthetics.length; _j < _len2; _j++) {
          aesthetic = aesthetics[_j];
          newPoint[aesthetic[0]] = aesthetic[1](point);
        }
        newPoints.push(newPoint);
      }
      return position(groupData(newPoints));
    };
    groupData = function(dataset) {
      var k, v, _ref, _ref2, _results;
      if ((_ref = dataset[0]) != null ? _ref.group : void 0) {
        _ref2 = d3.nest().key(function(d) {
          return d.group;
        }).map(dataset);
        _results = [];
        for (k in _ref2) {
          v = _ref2[k];
          _results.push(v);
        }
        return _results;
      } else {
        return [dataset];
      }
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
      var bars, maxDomain, maxRange, minDomain, minRange, width, _ref, _ref2;
      if (scales.x.rangeBand) {
        return scales.x.rangeBand();
      } else {
        _ref = scales.x.domain(), minDomain = _ref[0], maxDomain = _ref[1];
        _ref2 = scales.x.range(), minRange = _ref2[0], maxRange = _ref2[1];
        bars = ranger(minDomain, maxDomain, step());
        width = 1;
        if (((maxRange - minRange) / bars.length) > 1) {
          width = d3.scale.ordinal().domain(bars).rangeRoundBands(scales.x.range(), 0.2).rangeBand();
        }
        return width;
      }
    };
    layer = function(g, scales, w, h) {
      var width;
      width = barWidth(scales);
      g.classed("bar", true);
      return g.each(function(d, i) {
        var barGroups, bars, barsEnter, barsExit, barsUpdate;
        barGroups = d3.select(this).selectAll("g").data(d);
        barGroups.enter().append("g");
        d3.transition(barGroups.exit()).remove();
        bars = barGroups.selectAll("rect").data(Object);
        barsEnter = bars.enter().append("rect");
        barsExit = d3.transition(bars.exit()).remove();
        barsUpdate = d3.transition(bars).attr("x", function(d) {
          return scales.x(d.x);
        }).attr("y", function(d) {
          return h - scales.y(Math.max(0 + d.y0, d.y + d.y0));
        }).attr("height", function(d) {
          return Math.abs(scales.y(d.y) - scales.y(0));
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
    layer.move = function(v) {
      if (!arguments.length) return move;
      move = v;
      return layer;
    };
    layer.stack = function(v) {
      if (!arguments.length) return stack;
      stack = v;
      return layer;
    };
    layer.mapData = mapData;
    return layer;
  };

  rene.pie = function() {
    var arc, color, layer, location, locationMargin, mapData, pie, scales, value;
    scales = {
      color: d3.scale.category20
    };
    location = "center";
    locationMargin = 10;
    arc = d3.svg.arc();
    pie = d3.layout.pie().value(function(d) {
      return d.value;
    });
    color = function(d) {
      return d[0];
    };
    value = function(d) {
      return d[1];
    };
    mapData = function(dataset) {
      var aesthetic, aesthetics, newPoint, newPoints, point, _i, _j, _len, _len2;
      aesthetics = [['value', value], ['color', color]];
      newPoints = [];
      for (_i = 0, _len = dataset.length; _i < _len; _i++) {
        point = dataset[_i];
        newPoint = {};
        for (_j = 0, _len2 = aesthetics.length; _j < _len2; _j++) {
          aesthetic = aesthetics[_j];
          newPoint[aesthetic[0]] = aesthetic[1](point);
        }
        newPoints.push(newPoint);
      }
      return [newPoints];
    };
    layer = function(g, scales) {
      g.classed("pie", true);
      return g.each(function(d, i) {
        var arcs, arcsEnter, arcsExit, arcsUpdate, pied;
        pied = pie(d[0]);
        arcs = d3.select(this).selectAll("path.arc").data(pied);
        arcsEnter = arcs.enter().append("path").attr("class", "arc").style("opacity", 1e-6);
        arcsExit = d3.transition(arcs.exit()).style("opacity", 1e-6).remove();
        arcsUpdate = d3.transition(arcs).style("opacity", 1);
        return arcsUpdate.attr("d", function(d, i) {
          return arc(d);
        }).attr("fill", function(d, i) {
          return scales.color(d.data.color);
        });
      });
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
    layer.position = function(v) {
      var position;
      if (!arguments.length) return position;
      position = v;
      return layer;
    };
    layer.color = function(v) {
      if (!arguments.length) return color;
      color = v;
      return layer;
    };
    layer.scales = function() {
      return scales;
    };
    layer.mapData = mapData;
    layer.move = function(layer, width, height, margins) {
      switch (location) {
        case "center":
          return layer.attr("transform", rene.utils.translate(width / 2, height / 2));
        case "left":
          return layer.attr("transform", rene.utils.translate((arc.outerRadius())(), height / 2));
      }
    };
    return layer;
  };

}).call(this);
