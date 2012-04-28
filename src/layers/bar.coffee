rene.bar = ->

    scales =
        x: d3.scale.ordinal
        y: d3.scale.linear
        color: d3.scale.category20

    x = (d) -> d[0]
    y = (d) -> d[1]
    color = (d) -> d[1]
    group = (d) -> d[2]
    move = ->

    position = (data) ->
        if data.some((el, idx, ar) -> idx != ar.length - 1 and el.length != ar[idx+1].length)
            data = rene.utils.naiveFill(data)

        d3.layout.stack()(data)

    # I really dislike this, but it's necessary to support time scale bar charts.
    ranger = d3.range
    step = d3.functor(1)
    padding = (barWidth) -> if barWidth <= 4 then 0 else 2

    barWidth = (scales) ->
        if scales.x.rangeBand
            scales.x.rangeBand()
        else
            [start, stop] = scales.x.domain()
            bars = ranger(start, stop, step())

            # Create a temporary ordinal scale for bar width calculations
            ord = d3.scale.ordinal()
                .domain(bars)
                .rangeRoundBands(scales.x.range(), 0.2)

            # TODO: This retraining of the scale should happen elsewhere...
            scales.x.domain(ord.domain()).range(ord.range())
            ord.rangeBand() || 1

    layer = (g, scales, w, h) ->
        width = barWidth(scales)

        g.classed("bar", true)

        g.each (d, i) ->
            posd = position(d)

            barGroups = d3.select(this)
                .selectAll("g")
                .data(posd)

            barGroups.enter()
                .append("g")

            d3.transition(barGroups.exit())
                .remove()

            bars = barGroups.selectAll("rect")
                .data(Object)

            barsEnter = bars.enter()
                .append("rect")

            barsExit = d3.transition(bars.exit())
                .remove()

            barsUpdate = d3.transition(bars)
                .attr("x", (d) -> scales.x(d.x))
                .attr("y", (d) -> scales.y(d.y0) - (h - scales.y(d.y)))
                .attr("height", (d) -> h - scales.y(d.y))
                .attr("width", -> width)

            if scales.color
                barsUpdate.style("fill", (d) -> scales.color(d.color))

    layer.x = (v) ->
        return x if not arguments.length
        x = d3.functor(v)
        layer

    layer.y = (v) ->
        return y if not arguments.length
        y = d3.functor(v)
        layer

    layer.color = (v) ->
        return color if not arguments.length
        color = d3.functor(v)
        layer

    layer.group = (v) ->
        return group if not arguments.length
        group = v
        layer

    layer.barWidth = (v) ->
        return bandWidth if not arguments.length
        bandWidth = d3.functor(v)
        layer

    layer.ranger = (v) ->
        return ranger if not arguments.length
        ranger = d3.functor(v)
        layer

    layer.step = (v) ->
        return step if not arguments.length
        step = d3.functor(v)
        layer

    layer.padding = (v) ->
        return padding if not arguments.length
        padding = d3.functor(v)
        layer

    layer.position = (v) ->
        return position if not arguments.length
        position = v
        layer

    layer.scales = -> scales

    layer.move = (v) ->
        return move if not arguments.length
        move = v
        layer

    layer