rene.bar = ->

    x = (d) -> d[0]
    y = (d) -> d[1]
    bandWidth = (yScale, d) ->
        if yScale.rangeBand
            yScale.rangeBand()
        else
            range = yScale.range()
            domain = yScale.domain()
            if domain[0].getDate
                domain[1].setDate(domain[1].getDate() + 1)
                bars = d3.time.days(domain[0], domain[1]).length
                console.log('days count', bars)
                yScale.domain(domain)
            else
                bars = d.length
            rangeExtent = range[1] - range[0]
            Math.round(rangeExtent / bars) - 2# Magic padding



    scales =
        x: d3.scale.ordinal
        y: d3.scale.linear

    layer = (g, scales, w, h) ->
        width = bandWidth(scales.x, g.datum())

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
                .attr("x", (d) -> console.log(d[0]); scales.x(x(d)))
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

    layer.color = (v) ->
        return color if not v
        color = d3.functor(v)
        layer

    layer.size = (v) ->
        return size if not v
        size = d3.functor(v)
        layer

    layer.bandWidth = (v) ->
        return bandWidth if not v?
        bandWidth = d3.functor(v)
        layer

    layer.scales = -> scales
    layer.position = ->

    layer