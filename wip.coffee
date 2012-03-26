
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
                dthis = d3.select(this)
                svg = dthis.selectAll("svg").data([datasets])
                svg.enter().append("svg").attr("class", "plot")

                layers = svg.selectAll("g.layer").data(Object)
                layers.enter().append("g").attr("class", (d, i) -> "layer layer" + i)

                # add the appropriate scales for each layer
                for layer in attrs.layers
                    for aesthetic, scale of layer.scales()
                        attrs.scales[aesthetic] ||= scale

                # train the scales with each layer of data
                scales = {}
                layers.each((data, i) ->
                    console.log("training the scales!")

                    layer = attrs.layers[i]
                    for aesthetic, scale of attrs.scales

                        # Instantiate the scale for this render
                        scale = scales[aesthetic] ||= scale()
                        if layer[aesthetic]
                            layerData = data.map(layer[aesthetic]())
                            scaleData = scale.domain()
                            console.log("layer", layerData, "scale", scaleData)
                            scale.domain(d3.extent(layerData.concat(scaleData)))

                )

                # train the ranges
                if scales.x
                    scales.x.range([0, svg.node().clientWidth])

                if scales.y
                    scales.y.range([svg.node().clientHeight, 0])

                # render each layer
                layers.each((data, i) -> d3.select(this).call(attrs.layers[i], scales))
            )

        attrs =
            layers: []
            scales: {}
            size: []

        chart.attrs = attrs

        _a = attrAccessor.bind(attrs, chart)

        chart.size  = _a("size")

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

        return layer

    line: ->
        layer = (g, scales) ->
            g.each((data)->

                g = d3.select(this)
                lines = g.selectAll("path").data([g.datum()])
                linesEnter = lines.enter().append("path")
                linesExit = d3.transition(lines.exit())
                linesUpdate = d3.transition(lines)

                pathFn = d3.svg.line().interpolate("basis")
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

if module?
    module.exports = rene
else
    this.rene = rene