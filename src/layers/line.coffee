line = ->
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

    layer