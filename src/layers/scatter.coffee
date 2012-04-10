rene.scatter = ->

    x = (d) -> d[0]
    y = (d) -> d[1]
    color = (d) -> "blue"
    size = (d) -> 2

    scales =
        x: d3.scale.linear
        y: d3.scale.linear
        color: d3.scale.category20
        size: d3.scale.linear

    layer = (g, scales) ->

        g.classed("scatter", true)

        g.each ->
            circles = d3.select(this)
                .selectAll("circle")
                .data(Object)

            circlesEnter = circles.enter()
                .append("circle")
                .attr("opacity", 1e-6)

            circlesExit = d3.transition(circles.exit())
                .attr("opacity", 0)
                .remove()

            circlesUpdate = d3.transition(circles)
                .attr("opacity", 1)

            circlesUpdate.attr("cx", (d) -> scales.x(x(d)))
                .attr("cy", (d) -> scales.y(y(d)))
                .attr("r", (d) -> size(d))
                .style("fill", (d) -> color(d))

    layer.x = (v) ->
        return x if not v
        x = d3.functor(v)
        layer

    layer.y = (v) ->
        return y if not v
        y = d3.functor(v)
        layer

    layer.color = (v) ->
        return color if not v
        color = d3.functor(v)
        layer

    layer.size = (v) ->
        return size if not v
        size = d3.functor(v)
        layer

    layer.scales = -> scales
    layer.position = ->

    layer