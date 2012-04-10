rene.bar = ->
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