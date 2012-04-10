rene.bar = ->

    x = (d) -> d[0]
    y = (d) -> d[1]

    scales =
        x: d3.scale.ordinal
        y: d3.scale.linear

    layer = (g, scales, w, h) ->
        g.each (d, i) ->
            bars = d3.select(this)
                .selectAll("rect")
                .data(d)

            barsEnter = bars.enter()
                .append("rect")

            barsExit = d3.transition(bars.exit())
                .remove()

            barsUpdate = d3.transition(bars)
                .attr("x", (d) -> scales.x(x(d)))
                .attr("y", (d) -> scales.y(y(d)))
                .attr("height", (d) -> h - scales.y(y(d)))
                .attr("width", -> scales.x.rangeBand())

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