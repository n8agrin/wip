class rene.layers.Base

    # The default positioning method is the identity function
    position: Object

    group: (dataset) ->
        if dataset[0]?.group
            (v for k, v of d3.nest().key((d) -> d.group).map(dataset))
        else
            [dataset]

    map: (dataset) ->
        newPoints = []
        for point in dataset
            newPoint = {}
            for aesthetic in aesthetics
                newPoint[aesthetic[0]] = aesthetic[1](point)
            newPoints.push(newPoint)
        position(group(newPoints))





class rene.layers.Bar extends rene.layers.Base

    @scales:
        x: d3.scale.ordinal
        y: d3.scale.linear
        color: d3.scale.category20

    aesthetics:
        x: (point) -> point[0]
        y: (point) -> point[1]
        color: (point) -> point[1]
        group: (point) -> point[2]

    position: (data) ->
        if data.some((el, idx, ar) -> idx != ar.length - 1 and el.length != ar[idx+1].length)
            data = rene.utils.naiveFill(data)
        d3.layout.stack(data)

    barWidth: (scales) ->
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

    render: (group, scales, width, height) ->
        width = @barWidth(scales)
        group.classed("bar", true)
        group.each (d, i) ->
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

