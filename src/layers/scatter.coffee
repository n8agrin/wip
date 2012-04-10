rene.scatter = ->
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