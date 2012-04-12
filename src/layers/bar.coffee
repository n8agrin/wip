rene.bar = ->

    x = (d) -> d[0]
    y = (d) -> d[1]

    # I really dislike this, but it's necessary to support time scale bar charts.
    ranger = d3.range
    step = d3.functor(1)
    padding = (barWidth) -> if barWidth <= 4 then 0 else 2
    barWidth = (scales) ->
        if scales.x.rangeBand
            scales.x.rangeBand()
        else
            range = scales.x.range()
            domain = scales.x.domain()
            barLen = ranger(domain[0], domain[1], step()).length
            barWidth = Math.round((range[1] - range[0]) / barLen)
            barWidth - padding(barWidth)

    scales =
        x: d3.scale.ordinal
        y: d3.scale.linear

    layer = (g, scales, w, h) ->
        width = barWidth(scales)

        g.classed("bar", true)

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
                .attr("width", -> width)

    layer.x = (v) ->
        return x if not v
        x = d3.functor(v)
        layer

    layer.y = (v) ->
        return y if not v
        y = d3.functor(v)
        layer

    layer.barWidth = (v) ->
        return bandWidth if not v?
        bandWidth = d3.functor(v)
        layer

    layer.ranger = (v) ->
        return ranger if not v?
        ranger = d3.functor(v)
        layer

    layer.step = (v) ->
        return step if not v?
        step = d3.functor(v)
        layer

    layer.padding = (v) ->
        return padding if not v?
        padding = d3.functor(v)
        layer

    layer.scales = -> scales
    layer.position = ->

    layer