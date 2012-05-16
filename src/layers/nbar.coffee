class rene.NBar extends rene.Layer

    constructor: ->
        super
        @x = (d) -> d[0]
        @y = (d) -> d[1]
        @color = (d) -> d[2]
        @size = (d) -> d[3]
        @group = (d) -> d[2]
        @ranger = d3.range
        @step = d3.functor(1)

    scales:
        x: d3.scale.ordinal
        y: d3.scale.linear
        color: d3.scale.category20

    position: (data) ->
        if data.some((el, idx, ar) -> idx != ar.length - 1 and el.length != ar[idx+1].length)
            data = rene.utils.naiveFill(data)
        d3.layout.stack()(data)

    barWidth: (scales) ->
        if scales.x.rangeBand
            scales.x.rangeBand()
        else
            [minDomain, maxDomain] = scales.x.domain()
            [minRange, maxRange] = scales.x.range()
            bars = @ranger(minDomain, maxDomain, @step())

            width = 1
            if ((maxRange - minRange) / bars.length) > 1
                # Create a temporary ordinal scale for bar width calculations
                width = d3.scale.ordinal()
                    .domain(bars)
                    .rangeRoundBands(scales.x.range(), 0.2)
                    .rangeBand()
            width

    render: (group, scales, width, height) =>
        barWidth = @barWidth(scales)
        group.classed('bar', true)
        group.each (dataset, i) ->
            barGroups = d3.select(this)
                .selectAll('g')
                .data(dataset)

            barGroups.enter()
                .append('g')

            d3.transition(barGroups.exit())
                .remove()

            bars = barGroups.selectAll('rect')
                .data(Object)

            barsEnter = bars.enter()
                .append('rect')

            barsExit = d3.transition(bars.exit())
                .remove()

            barsUpdate = d3.transition(bars)
                .attr('x', (point) -> scales.x(point.x))
                .attr('y', (point) -> scales.y(point.y0) - (height - scales.y(point.y)))
                .attr('height', (point) -> height - scales.y(point.y))
                .attr('width', -> barWidth)

            if scales.color
                barsUpdate.style('fill', (point) -> scales.color(point.color))

