
attrAccessor = (retval, name) ->
    (v) =>
        return this[name] if not v?
        this[name] = v
        retval || this

ordinalScales = [
    d3.scale.ordinal,
    d3.scale.category10,
    d3.scale.category20,
    d3.scale.category20b,
    d3.scale.category20c
]

rene =

    plot: ->
        chart = (selection) ->
            selection.each((datasets) ->
                svg = d3.select(this).selectAll("svg").data([datasets])
                gEnter = svg.enter().append("svg").attr("class", "plot").append("g")
                gEnter.append("g").attr("class", "x axis")

                layers = svg.select("g").selectAll("g.layer").data(Object)
                layers.enter().append("g").attr("class", "layer").attr("id", (d, i) -> "layer" + i)


                # add the appropriate scales for each layer
                for layer in attrs.layers
                    for aesthetic, scale of layer.scales()
                        attrs.scales[aesthetic] ||= scale

                # train the scales with each layer of data
                scales = {}
                layers.each((d, i) ->
                    console.log('layers data', d)
                    layer = attrs.layers[i]
                    for aesthetic, scale of attrs.scales
                        scale = scales[aesthetic] ||= scale()
                        if layer[aesthetic]
                            layerData = d.map(layer[aesthetic]())
                            scaleData = scale.domain()
                            scale.domain(d3.extent(layerData.concat(scaleData))))

                svgNode = svg.node()
                margin = chart.margin()
                panelWidth = svgNode.clientWidth - (margin.left + margin.right)
                panelHeight = svgNode.clientHeight - (margin.top + margin.bottom)

                # train the ranges
                if scales.x
                    scales.x.range([0, panelWidth])
                    xAxis = d3.svg.axis().scale(scales.x).orient("bottom")
                    svg.select(".x.axis")
                        .attr("transform", "translate(0," + scales.y.range()[0] + ")")
                        .call(xAxis)

                if scales.y
                    scales.y.range([panelHeight, 0])
                    yAxis = d3.svg.axis().scale(scales.y).orient("left")

                # hey margins are good
                layers.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

                # render each layer
                layers.each((d, i) ->
                    d3.select(this).call(attrs.layers[i], scales))

            )

        attrs =
            margin: {top: 40, bottom: 40, left: 40, right: 40}
            layers: []
            scales: {}
            size: []

        chart.attrs = attrs

        _a = attrAccessor.bind(attrs, chart)

        chart.size  = _a("size")
        chart.margin = _a("margin")

        chart.addLayer = (layer) ->
            attrs.layers.push(layer)
            chart

        chart.layers = chart.addLayer

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

        return layer

    area: ->
        layer = (g, scales) ->
            g.each((data)->

                g = d3.select(this)
                lines = g.selectAll("path").data([g.datum()])
                linesEnter = lines.enter().append("path")
                linesExit = d3.transition(lines.exit())
                linesUpdate = d3.transition(lines)

                pathFn = d3.svg.area().interpolate("basis")
                     .x((d) -> scales.x(layer.x()(d)))
                     .y((d) -> scales.y(layer.y()(d)))

                linesUpdate.attr("d", pathFn)
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

        return layer

    bar: ->
        layer = (g, scales) ->
            g.each((data)->
                g = d3.select(this)
                lines = g.selectAll("path").data([g.datum()])
                linesEnter = lines.enter().append("path")
                linesExit = d3.transition(lines.exit())
                linesUpdate = d3.transition(lines)

                pathFn = d3.svg.area().interpolate("basis")
                     .x((d) -> scales.x(layer.x()(d)))
                     .y((d) -> scales.y(layer.y()(d)))

                linesUpdate.attr("d", pathFn)
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

        return layer

    pie: ->
        layer = (g, scales) ->
            g.each((d) ->
                g = d3.select(this)
                arcs = g.selectAll("path.arc").data((d) -> console.log('p d', d, layer.pie()(d)); layer.pie()(d))
                arcsEnter = arcs.enter().append("path").attr("class", "arc")
                arcsExit = d3.transition(arcs.exit()).remove()
                arcsUpdate = d3.transition(arcs)
                debugger
                arcsUpdate.attr("d", layer.arc())
            )

        scales = {}

        attrs =
            outerRadius: 200
            innerRadius: 50
            arc: d3.svg.arc()
            pie: d3.layout.pie()

        AA = attrAccessor.bind(attrs, layer)
        layer.outerRadius = AA("outerRadius")
        layer.innerRadius = AA("innerRadius")
        layer.arc = AA("arc")
        layer.pie = AA("pie")
        layer.scales = -> scales

        layer

if module?
    module.exports = rene
else
    this.rene = rene