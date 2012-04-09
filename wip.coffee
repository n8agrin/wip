
attrAccessor = (retval, name) ->
    (v) =>
        return this[name] if not v?
        this[name] = v
        retval || this

utils =
    translate: (x, y) ->
        ["translate(", String(x), ",", String(y), ")"].join("")

rene2 =
    plot: ->
        chart = (selection) ->
            selection.each((datasets) ->
                svg = d3.select(this).selectAll("svg").data([datasets])
                gEnter = svg.enter().append("svg").attr("class", "plot").append("g")
                gEnter.append("g").attr("class", "x axis")
                gEnter.append("g").attr("class", "y axis")
                gEnter.append("g").attr("class", "geoms")
                layers = svg.select("g.geoms").selectAll("g.layer").data(Object)
                layers.enter().append("g").attr("class", "layer").attr("id", (d, i) -> "layer" + i)

                # add the appropriate scales for each layer
                for layer in attrs.layers
                    for aesthetic, scale of layer.scales()
                        attrs.scales[aesthetic] ||= scale()

                # train the scales with each layer of data
                layers.each((d, i) ->
                    layer = attrs.layers[i]
                    for aesthetic, scale of attrs.scales
                        if layer[aesthetic]
                            layerData = d.map(layer[aesthetic]())
                            scaleData = scale.domain()
                            if aesthetic is "color"
                                for dp in layerData
                                    scaleData.push(dp) if dp not in scaleData
                                scale.domain(scaleData)
                            else if scale.rangeBand
                                # Ordinal scales
                                for point in layerData
                                    scaleData.push(point) if point not in scaleData
                                scale.domain(scaleData)
                            else
                                scale.domain(d3.extent(layerData.concat(scaleData))))

                svgNode = svg.node()
                panelWidth = svgNode.clientWidth - (attrs.margin.left + attrs.margin.right)
                panelHeight = svgNode.clientHeight - (attrs.margin.top + attrs.margin.bottom)

                # train the ranges
                if attrs.scales.x
                    attrs.scales.x.range([0, panelWidth])

                    if attrs.scales.x.rangeBand?
                        attrs.scales.x.rangeBands([0, panelWidth], 0.1)

                    xAxis = d3.svg.axis().scale(attrs.scales.x).orient("bottom")
                    svg.select(".x.axis")
                        .attr("transform", utils.translate(0, panelHeight))
                        .call(xAxis)

                if attrs.scales.y
                    attrs.scales.y.range([panelHeight, 0])
                    yAxis = d3.svg.axis()
                        .scale(attrs.scales.y)
                        .orient("left")

                    svg.select(".y.axis")
                        .call(yAxis)

                # hey margins are good
                svg.select("g").attr("transform", utils.translate(attrs.margin.left, attrs.margin.top))

                # render each layer
                layers.each((d, i) ->
                    d3.transition(d3.select(this))
                        .call(attrs.layers[i], attrs.scales, panelWidth, panelHeight))

                layers.each((d, i) ->
                    attrs.layers[i].position(d3.select(this), panelWidth, panelHeight, attrs.margin))

                attrs.legend.call(chart, layers, attrs.scales, panelWidth, panelHeight)
            )

        attrs =
            margin: {top: 20, bottom: 20, left: 30, right: 20}
            layers: []
            size: []
            scales: {}
            layerDuration: 500
            layerDelay: 200
            legend: ->

        AA = attrAccessor.bind(attrs, chart)
        chart.size  = AA("size")
        chart.margin = AA("margin")
        chart.layerDuration = AA("layerDuration")
        chart.layerDelay = AA("layerDelay")
        chart.legend = AA("legend")
        chart.scales = AA("scales")
        chart.inactiveData = AA("inactiveData")

        chart.addLayer = (layer) ->
            attrs.layers.push(layer)
            chart

        return chart

    scatter: ->
        layer = (g, scales) ->
            g.each( ->
                g = d3.select(this)
                circles = g.selectAll("circle").data(Object)

                circlesEnter = circles.enter().append("circle").attr("opacity", 1e-6)
                circlesExit = d3.transition(circles.exit()).attr("opacity", 0).remove()
                circlesUpdate = d3.transition(circles).attr("opacity", 1)

                circlesUpdate.attr("cx", (d) -> scales.x(layer.x()(d)))
                    .attr("cy", (d) -> scales.y(layer.y()(d)))
                    .attr("r", 2)
            )


        attrs =
            x: (d) -> d[0]
            y: (d) -> d[1]
            color: (d) -> d[2]
            size: (d) -> d[3]

        scales =
            x: d3.scale.linear
            y: d3.scale.linear
            color: d3.scale.category20
            size: d3.scale.linear

        _a = attrAccessor.bind(attrs, layer)

        layer.x = _a("x")
        layer.y = _a("y")
        layer.color = _a("color")
        layer.size = _a("size")

        layer.scales = ->
            scales

        layer.position = ->

        return layer

    line: ->
        layer = (g, scales) ->
            g.each((data)->

                g = d3.select(this)
                lines = g.selectAll("path").data([g.datum()])
                linesEnter = lines.enter().append("path")
                linesExit = d3.transition(lines.exit())
                linesUpdate = d3.transition(lines)

                pathFn = d3.svg.line().interpolate(layer.interpolate())
                     .x((d) -> scales.x(layer.x()(d)))
                     .y((d) -> scales.y(layer.y()(d)))

                linesUpdate.attr("d", pathFn)
            )

        attrs =
            x: (d) -> d[0]
            y: (d) -> d[1]
            color: (d) -> d[2]
            size: (d) -> d[3]
            interpolate: "cardinal"

        scales =
            x: d3.scale.linear
            y: d3.scale.linear
            color: d3.scale.category20
            size: d3.scale.linear

        _a = attrAccessor.bind(attrs, layer)

        layer.x = _a("x")
        layer.y = _a("y")
        layer.color = _a("color")
        layer.size = _a("size")
        layer.interpolate = _a("interpolate")

        layer.scales = ->
            scales

        layer.position = ->

        return layer

    bar: ->
        layer = (g, scales, w, h) ->
            g.each((d, i) ->
                g = d3.select(this)

                bars = g.selectAll("rect")
                    .data(d)

                barsEnter = bars.enter()
                    .append("rect")

                barsExit = d3.transition(bars.exit())
                    .remove()

                barsUpdate = d3.transition(bars)
                    .attr("x", (d) -> scales.x(attrs.x(d)))
                    .attr("y", (d) -> scales.y(attrs.y(d)))
                    .attr("height", (d) -> h - scales.y(attrs.y(d)))
                    .attr("width", -> rangeBands(scales.x))
            )

        attrs =
            x: (d) -> d[0]
            y: (d) -> d[1]
            color: (d) -> d[2]
            size: (d) -> d[3]

        scales =
            x: d3.scale.ordinal
            y: d3.scale.linear
            color: d3.scale.category20
            size: d3.scale.linear

        _a = attrAccessor.bind(attrs, layer)

        layer.x = _a("x")
        layer.y = _a("y")
        layer.color = _a("color")
        layer.size = _a("size")
        layer.scales = -> scales
        layer.position = ->
        layer.interval = (a) -> a

        return layer

    pie: ->
        layer = (g, scales, width, height) ->
            g.each((d, i) ->
                pie = attrs.pie
                pieData = pie(d.map(attrs.value))

                outerRadius = attrs.outerRadius
                innerRadius = attrs.innerRadius
                if typeof outerRadius is "function"
                    outerRadius = outerRadius(width, height)
                if typeof innerRadius is "function"
                    innerRadius = innerRadius(width, height)

                arc = attrs.arc.outerRadius(outerRadius).innerRadius(innerRadius)

                g = d3.select(this)
                    .classed("pie", true)

                arcs = g.selectAll("path.arc")
                    .data(d)

                arcsEnter = arcs.enter()
                    .append("path")
                    .attr("class", "arc")
                    .style("opacity", 1e-6)

                arcsExit = d3.transition(arcs.exit())
                    .style("opacity", 1e-6)
                    .remove()

                arcsUpdate = d3.transition(arcs)
                    .style("opacity", 1)

                # Apply the color styling
                arcsUpdate.attr("d", (d, i) -> arc(pieData[i]))
                    .attr("fill", (d, i) -> scales.color(attrs.color(d, i)))
            )

        scales =
            color: d3.scale.category20

        attrs =
            outerRadius: 100
            innerRadius: 10
            location: "center"
            locationMargin: 10
            arc: d3.svg.arc()
            pie: d3.layout.pie()
            color: (point, pointIndex) -> point.data
            value: (v) -> v
            label: (l) -> l

        AA = attrAccessor.bind(attrs, layer)
        layer.outerRadius = AA("outerRadius")
        layer.innerRadius = AA("innerRadius")
        layer.arc = AA("arc")
        layer.pie = AA("pie")
        layer.location = AA("location")
        layer.color = AA("color")
        layer.value = AA("value")
        layer.label = AA("label")

        layer.scales = -> scales
        layer.position = (layer, width, height, margins) ->
            switch attrs.location
                when "center"
                    layer.attr("transform", utils.translate(width / 2, height / 2))
                when "left"
                    layer.attr("transform", utils.translate(attrs.outerRadius(width, height), height / 2))

        layer

if module?
    module.exports = rene2
else
    this.rene2 = rene2