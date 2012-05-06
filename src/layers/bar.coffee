rene.bar = ->
    scales =
        x: d3.scale.ordinal
        y: d3.scale.linear
        color: d3.scale.category20

    x = (d) -> d[0]
    y = (d) -> d[1]
    color = (d) -> d[1]
    group = (d) -> d[2]

    stack = d3.layout.stack()
    move = ->

    position = (data) ->
        if data.some((el, idx, ar) -> idx != ar.length - 1 and el.length != ar[idx+1].length)
            data = rene.utils.naiveFill(data)
        stack(data)

    mapData = (dataset) ->
        aesthetics = [
            ['x', x],
            ['y', y],
            ['color', color],
            ['group', group]
        ]

        # Ouch, iterate over every data point...
        newPoints = []
        for point in dataset
            newPoint = {}
            for aesthetic in aesthetics
                newPoint[aesthetic[0]] = aesthetic[1](point)
            newPoints.push(newPoint)
        position(groupData(newPoints))

    groupData = (dataset) ->
        if dataset[0]?.group
            (v for k, v of d3.nest().key((d) -> d.group).map(dataset))
        else
            [dataset]

    # I really dislike this, but it's necessary to support time scale bar charts.
    ranger = d3.range
    step = d3.functor(1)
    padding = (barWidth) -> if barWidth <= 4 then 0 else 2

    barWidth = (scales) ->
        if scales.x.rangeBand
            scales.x.rangeBand()
        else
            [minDomain, maxDomain] = scales.x.domain()
            [minRange, maxRange] = scales.x.range()
            bars = ranger(minDomain, maxDomain, step())

            width = 1
            if ((maxRange - minRange) / bars.length) > 1
                # Create a temporary ordinal scale for bar width calculations
                width = d3.scale.ordinal()
                    .domain(bars)
                    .rangeRoundBands(scales.x.range(), 0.2)
                    .rangeBand()
            width

    layer = (g, scales, w, h) ->
        width = barWidth(scales)

        g.classed("bar", true)

        g.each (d, i) ->
            barGroups = d3.select(this)
                .selectAll("g")
                .data(d)

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

    layer.stack = (v) ->
        return stack if not arguments.length
        stack = v
        layer

    layer.mapData = mapData

    layer