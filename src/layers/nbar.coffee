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
        @stack = d3.layout.stack()

    scales:
        x: d3.scale.ordinal
        y: d3.scale.linear
        color: d3.scale.category20

    position: (data) ->
        @stack(rene.utils.naiveFill(data))

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
                .attr('y', (point) -> height - scales.y(Math.max(point.y0, point.y + point.y0)))
                .attr('height', (point) -> Math.abs(scales.y(point.y) - scales.y(0)))
                .attr('width', -> barWidth)

            if scales.color
                barsUpdate.style('fill', (point) -> scales.color(point.color))

