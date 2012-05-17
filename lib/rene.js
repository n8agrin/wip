(function() {
  var rene,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

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
      var dataXIndexed, dataset, datasetXIndexed, idx, kind, mapData, newDataset, newSets, point, points, samples, seenXValues, x, _i, _j, _len, _len2, _len3, _name;
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
        seenXValues = {};
        dataXIndexed = [];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          dataset = data[_i];
          datasetXIndexed = {};
          for (idx = 0, _len2 = dataset.length; idx < _len2; idx++) {
            point = dataset[idx];
            seenXValues[_name = point.x] || (seenXValues[_name] = idx);
            datasetXIndexed[point.x] = point;
          }
          dataXIndexed.push(datasetXIndexed);
        }
        newSets = [];
        for (_j = 0, _len3 = dataXIndexed.length; _j < _len3; _j++) {
          dataset = dataXIndexed[_j];
          newDataset = [];
          for (x in seenXValues) {
            idx = seenXValues[x];
            newDataset[idx] = dataset[x] || {
              x: x,
              y: 0
            };
          }
          newSets.push(newDataset);
        }
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

  rene.Chart = (function() {
    var callable;

    callable = function(selection) {
      var chart;
      chart = this;
      return selection.each(function(data) {
        chart.container = d3.select(this);
        chart.setDimensionsFromSelection(this);
        chart.initChart(data);
        return chart.render();
      });
    };

    function Chart() {
      this.apply = __bind(this.apply, this);
      this.call = __bind(this.call, this);
      this.setDimensionsFromSelection = __bind(this.setDimensionsFromSelection, this);
      this.render = __bind(this.render, this);
      this.initChart = __bind(this.initChart, this);
      this.trainScaleDomains = __bind(this.trainScaleDomains, this);
      this.trainScaleRanges = __bind(this.trainScaleRanges, this);
      this.initLayerGroups = __bind(this.initLayerGroups, this);
      this.positionData = __bind(this.positionData, this);
      this.initScales = __bind(this.initScales, this);
      this.initSVG = __bind(this.initSVG, this);
      this.resetXYScales = __bind(this.resetXYScales, this);
      this.setContainer = __bind(this.setContainer, this);
      this.setScale = __bind(this.setScale, this);      this.layers = [];
      this.xAxis = d3.svg.axis().orient('bottom');
      this.yAxis = d3.svg.axis().orient('left');
      this.xAxisLabel = null;
      this.yAxisLabel = null;
      this.xGrid = d3.svg.axis();
      this.yGrid = d3.svg.axis();
      this.margin = {
        top: 20,
        bottom: 20,
        left: 30,
        right: 20
      };
      this.containerSize = [0, 0];
      this.panelSize = [0, 0];
      this.container = d3.select();
      this.svg = d3.select();
      this.layerGroups = d3.select();
      this.scales = {};
      this.originalScales = {};
    }

    Chart.prototype.setScale = function(aes, scale) {
      this.scales[aes] = scale;
      return this.originalScales[aes] = scale.copy();
    };

    Chart.prototype.setContainer = function(container) {
      this.container = d3.select(container);
      return this.setDimensionsFromSelection(container);
    };

    Chart.prototype.resetXYScales = function() {
      var scaleName, _i, _len, _ref, _results;
      _ref = ['x', 'y'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        scaleName = _ref[_i];
        if (this.scales[scaleName] && this.originalScales[scaleName]) {
          _results.push(this.scales[scaleName] = this.originalScales[scaleName]);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Chart.prototype.initSVG = function(data) {
      var gEnter;
      this.svg = this.container.selectAll('svg').data([data]);
      gEnter = this.svg.enter().append('svg').attr('class', 'chart').attr('width', this.containerSize[0]).attr('height', this.containerSize[1]).append('g').attr('transform', rene.utils.translate(this.margin.left, this.margin.top));
      gEnter.append('g').attr('class', 'x grid');
      gEnter.append('g').attr('class', 'y grid');
      gEnter.append('g').attr('class', 'geoms');
      gEnter.append('g').attr('class', 'x axis');
      return gEnter.append('g').attr('class', 'y axis');
    };

    Chart.prototype.initScales = function() {
      var aes, layer, scale, _i, _len, _ref, _results;
      _ref = this.layers;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        layer = _ref[_i];
        _results.push((function() {
          var _ref2, _results2;
          _ref2 = layer.scales;
          _results2 = [];
          for (aes in _ref2) {
            scale = _ref2[aes];
            _results2.push(this.scales[aes] || this.setScale(aes, scale()));
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };

    Chart.prototype.positionData = function(data) {
      var dataset, i, _len, _results;
      _results = [];
      for (i = 0, _len = data.length; i < _len; i++) {
        dataset = data[i];
        _results.push(this.layers[i].mapData(dataset));
      }
      return _results;
    };

    Chart.prototype.initLayerGroups = function(data) {
      this.layerGroups = this.svg.select('g.geoms').selectAll('g.layer').data(data);
      return this.layerGroups.enter().append('g').attr('class', 'layer').attr('id', function(d, i) {
        return "layer" + i;
      });
    };

    Chart.prototype.trainScaleRanges = function() {
      var _ref, _ref2, _ref3;
      if (((_ref = this.scales.x) != null ? _ref.rangeRoundBands : void 0) != null) {
        this.scales.x.rangeRoundBands([0, this.panelSize[0]], 0.1);
      } else {
        if ((_ref2 = this.scales.x) != null) _ref2.range([0, this.panelSize[0]]);
      }
      return (_ref3 = this.scales.y) != null ? _ref3.range([0, this.panelSize[1]]) : void 0;
    };

    Chart.prototype.trainScaleDomains = function(data) {
      var aesValues, aesthetic, dataGroup, dataset, point, scale, scaleData, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _results;
      _ref = this.scales;
      _results = [];
      for (aesthetic in _ref) {
        scale = _ref[aesthetic];
        scaleData = scale.domain().concat();
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          dataset = data[_i];
          for (_j = 0, _len2 = dataset.length; _j < _len2; _j++) {
            dataGroup = dataset[_j];
            if (scale.rangeBand) {
              for (_k = 0, _len3 = dataGroup.length; _k < _len3; _k++) {
                point = dataGroup[_k];
                if (_ref2 = point[aesthetic], __indexOf.call(scaleData, _ref2) < 0) {
                  scaleData.push(point[aesthetic]);
                }
              }
            } else {
              if (aesthetic === 'y') {
                aesValues = (function() {
                  var _l, _len4, _results2;
                  _results2 = [];
                  for (_l = 0, _len4 = dataGroup.length; _l < _len4; _l++) {
                    point = dataGroup[_l];
                    _results2.push(point[aesthetic] + (point[aesthetic + '0'] || 0));
                  }
                  return _results2;
                })();
              } else {
                aesValues = (function() {
                  var _l, _len4, _results2;
                  _results2 = [];
                  for (_l = 0, _len4 = dataGroup.length; _l < _len4; _l++) {
                    point = dataGroup[_l];
                    _results2.push(point[aesthetic]);
                  }
                  return _results2;
                })();
              }
              scaleData = d3.extent(scaleData.concat(aesValues));
            }
          }
        }
        _results.push(scale.domain(scaleData));
      }
      return _results;
    };

    Chart.prototype.renderLayers = function() {
      var layer, panelSize, scales,
        _this = this;
      layer = function(index) {
        return _this.layers[index];
      };
      scales = this.scales;
      panelSize = this.panelSize;
      return this.layerGroups.each(function(data, i) {
        return d3.transition(d3.select(this)).call(layer(i).render, scales, panelSize[0], panelSize[1]);
      });
    };

    Chart.prototype.renderScales = function() {
      var panelSize, yAxisScale;
      panelSize = this.panelSize;
      if (this.scales.x) {
        this.xAxis.scale(this.scales.x);
        this.svg.select('.x.axis').attr('transform', rene.utils.translate(0, panelSize[1])).call(this.xAxis);
      }
      if (this.scales.y) {
        yAxisScale = this.scales.y.copy();
        yAxisScale.range(this.scales.y.range().concat().reverse());
        this.yAxis.scale(yAxisScale);
        return this.svg.select('.y.axis').call(this.yAxis);
      }
    };

    Chart.prototype.renderGrid = function() {
      var panelSize;
      panelSize = this.panelSize;
      if (this.xGrid) {
        this.xGrid.scale(this.scales.x).tickSize(-panelSize[1], -panelSize[1], -panelSize[1]).orient('bottom');
        this.svg.select('g.x.grid').attr('transform', rene.utils.translate(0, panelSize[1])).call(this.xGrid);
        this.svg.selectAll('g.x.grid text, g.x.grid path.domain').remove();
      }
      if (this.yGrid) {
        this.yGrid.scale(this.scales.y).tickSize(-panelSize[0], -panelSize[0], -panelSize[0]).orient('left');
        this.svg.select('g.y.grid').call(this.yGrid);
        return this.svg.selectAll('g.y.grid text, g.y.grid path.domain').remove();
      }
    };

    Chart.prototype.renderLabels = function() {
      var xLabel, xLabelEnter, yLabel, yLabelEnter;
      if (this.xAxisLabel) {
        xLabel = this.svg.select('.x.axis').selectAll('text.label').data([this.xAxisLabel]);
        xLabelEnter = xLabel.enter().append('text').classed('label', true);
        xLabel.text(function(d) {
          return d;
        }).attr('transform', rene.utils.translate(0, 34));
      }
      if (this.yAxisLabel) {
        yLabel = this.svg.select('.y.axis').selectAll('text.label').data([this.yAxisLabel]);
        yLabelEnter = yLabel.enter().append('text').classed('label', true);
        return yLabel.text(function(d) {
          return d;
        }).attr("transform", rene.utils.translate(-40, this.panelSize[1]) + " rotate(270, 0, 0)");
      }
    };

    Chart.prototype.initChart = function(data) {
      this.resetXYScales();
      this.initSVG(data);
      this.initScales();
      data = this.positionData(data);
      this.initLayerGroups(data);
      this.trainScaleRanges();
      return this.trainScaleDomains(data);
    };

    Chart.prototype.render = function() {
      this.renderLayers();
      this.renderScales();
      this.renderGrid();
      return this.renderLabels();
    };

    Chart.prototype.setDimensionsFromSelection = function(selection) {
      this.containerSize = [selection.clientWidth, selection.clientHeight];
      this.panelSize[0] = selection.clientWidth - (this.margin.left + this.margin.right);
      return this.panelSize[1] = selection.clientHeight - (this.margin.top + this.margin.bottom);
    };

    Chart.prototype.call = function() {
      return callable.apply(this, arguments);
    };

    Chart.prototype.apply = function() {
      return callable.apply(this, arguments);
    };

    return Chart;

  })();

  rene.Layer = (function() {

    function Layer() {}

    Layer.prototype.position = Object;

    Layer.prototype.aesthetics = function() {
      return [['x', this.x], ['y', this.y], ['color', this.color], ['group', this.group]];
    };

    Layer.prototype.mapData = function(dataset) {
      var aesthetic, newPoint, newPoints, point, _i, _j, _len, _len2, _ref;
      newPoints = [];
      for (_i = 0, _len = dataset.length; _i < _len; _i++) {
        point = dataset[_i];
        newPoint = {};
        _ref = this.aesthetics();
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          aesthetic = _ref[_j];
          newPoint[aesthetic[0]] = aesthetic[1](point);
        }
        newPoints.push(newPoint);
      }
      return this.position(this.groupData(newPoints));
    };

    Layer.prototype.groupData = function(dataset) {
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

    return Layer;

  })();

  rene.NLine = (function(_super) {

    __extends(NLine, _super);

    NLine.prototype.scales = {
      x: d3.time.scale,
      y: d3.scale.linear,
      color: d3.scale.category20,
      size: d3.scale.linear
    };

    function NLine() {
      this.render = __bind(this.render, this);      this.interpolate = 'cardinal';
      this.x = function(d) {
        return d[0];
      };
      this.y = function(d) {
        return d[1];
      };
      this.color = function(d) {
        return d[2];
      };
      this.size = function(d) {
        return d[3];
      };
      this.group = function(d) {
        return d[2];
      };
    }

    NLine.prototype.render = function(group, scales, width, height) {
      var path;
      path = d3.svg.line().interpolate(this.interpolate).x(function(point) {
        return scales.x(point.x);
      }).y(function(point) {
        return scales.y(point.y);
      });
      group.classed('line', true);
      return group.each(function(dataset) {
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
        linesUpdate.attr("d", path);
        if (scales.color) {
          return linesUpdate.style('stroke', function(pathset) {
            if (pathset[0] != null) return scales.color(pathset[0].color);
          });
        }
      });
    };

    return NLine;

  })(rene.Layer);

  rene.NBar = (function(_super) {

    __extends(NBar, _super);

    function NBar() {
      this.render = __bind(this.render, this);      NBar.__super__.constructor.apply(this, arguments);
      this.x = function(d) {
        return d[0];
      };
      this.y = function(d) {
        return d[1];
      };
      this.color = function(d) {
        return d[2];
      };
      this.size = function(d) {
        return d[3];
      };
      this.group = function(d) {
        return d[2];
      };
      this.ranger = d3.range;
      this.step = d3.functor(1);
      this.stack = d3.layout.stack();
    }

    NBar.prototype.scales = {
      x: d3.scale.ordinal,
      y: d3.scale.linear,
      color: d3.scale.category20
    };

    NBar.prototype.position = function(data) {
      return this.stack(rene.utils.naiveFill(data));
    };

    NBar.prototype.barWidth = function(scales) {
      var bars, maxDomain, maxRange, minDomain, minRange, width, _ref, _ref2;
      if (scales.x.rangeBand) {
        return scales.x.rangeBand();
      } else {
        _ref = scales.x.domain(), minDomain = _ref[0], maxDomain = _ref[1];
        _ref2 = scales.x.range(), minRange = _ref2[0], maxRange = _ref2[1];
        bars = this.ranger(minDomain, maxDomain, this.step());
        width = 1;
        if (((maxRange - minRange) / bars.length) > 1) {
          width = d3.scale.ordinal().domain(bars).rangeRoundBands(scales.x.range(), 0.2).rangeBand();
        }
        return width;
      }
    };

    NBar.prototype.render = function(group, scales, width, height) {
      var barWidth;
      barWidth = this.barWidth(scales);
      group.classed('bar', true);
      return group.each(function(dataset, i) {
        var barGroups, bars, barsEnter, barsExit, barsUpdate;
        barGroups = d3.select(this).selectAll('g').data(dataset);
        barGroups.enter().append('g');
        d3.transition(barGroups.exit()).remove();
        bars = barGroups.selectAll('rect').data(Object);
        barsEnter = bars.enter().append('rect');
        barsExit = d3.transition(bars.exit()).remove();
        barsUpdate = d3.transition(bars).attr('x', function(point) {
          return scales.x(point.x);
        }).attr('y', function(point) {
          return height - scales.y(Math.max(point.y0, point.y + point.y0));
        }).attr('height', function(point) {
          return Math.abs(scales.y(point.y) - scales.y(0));
        }).attr('width', function() {
          return barWidth;
        });
        if (scales.color) {
          return barsUpdate.style('fill', function(point) {
            return scales.color(point.color);
          });
        }
      });
    };

    return NBar;

  })(rene.Layer);

  rene.NPoint = (function(_super) {

    __extends(NPoint, _super);

    function NPoint() {
      this.render = __bind(this.render, this);      NPoint.__super__.constructor.apply(this, arguments);
      this.x = function(point) {
        return point[0];
      };
      this.y = function(point) {
        return point[1];
      };
      this.color = function(point) {
        return point[2];
      };
      this.size = function(point) {
        return point[3];
      };
      this.group = function(point) {
        return point[2];
      };
      this.defaultSize = 2;
    }

    NPoint.prototype.scales = {
      x: d3.scale.linear,
      y: d3.scale.linear,
      color: d3.scale.category20,
      size: d3.scale.linear
    };

    NPoint.prototype.render = function(group, scales, width, height) {
      var layer;
      layer = this;
      group.classed('point', true);
      return group.each(function(d) {
        var circleGroups, circles, circlesEnter, circlesExit, circlesUpdate;
        circleGroups = d3.select(this).selectAll('g.group').data(Object);
        circleGroups.enter().append('g').attr('class', 'group');
        d3.transition(circleGroups.exit()).remove();
        circles = circleGroups.selectAll('circle').data(Object);
        circlesEnter = circles.enter().append('circle').attr('opacity', 1e-6);
        circlesExit = d3.transition(circles.exit()).attr('opacity', 0).remove();
        circlesUpdate = d3.transition(circles).attr('opacity', 1);
        circlesUpdate.attr('cx', function(point) {
          return scales.x(point.x);
        }).attr('cy', function(point) {
          return scales.y(point.y);
        }).attr('r', function(point) {
          return layer.defaultSize;
        });
        if (scales.color) {
          return circlesUpdate.style('fill', function(point) {
            return scales.color(point.color);
          });
        }
      });
    };

    return NPoint;

  })(rene.Layer);

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
