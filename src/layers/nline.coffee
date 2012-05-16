class rene.NLine extends rene.Layer

    @scales =
        x: d3.time.scale
        y: d3.scale.linear
        color: d3.scale.category20
        size: d3.scale.linear

    constructor: ->
        @interpolate = 'cardinal'
        @x = (d) -> d[0]
        @y = (d) -> d[1]
        @color = (d) -> d[2]
        @size = (d) -> d[3]
        @group = (d) -> d[2]

    render: (group, scales) =>
        path = d3.svg.line()
            .interpolate(@interpolate)
            .x((point) -> scales.x(point.x))
            .y((point) -> scales.y(point.y))

        group.classed('line', true)

        group.each (dataset) ->
            lineGroups = d3.select(this)
                .selectAll('g')
                .data(dataset)

            lineGroups.enter()
                .append('g')

            d3.transition(lineGroups.exit())
                .remove()

            # The input dataset looks like:
            # [
            #   // Group 1
            #   [point 1..., point 2...],
            #   // Group 2
            #   [point 1..., point 2...]
            # ]
            #
            # if we just use the identify function here to rebind data, it will
            # try to create as many path elements as there are points. Instead
            # points are part of a path vector and need to be rebound in an array.
            lines = lineGroups.selectAll('path')
                .data((pathset) -> [pathset])

            linesEnter = lines.enter()
                .append('path')

            linesExit = d3.transition(lines.exit())
                .remove()

            linesUpdate = d3.transition(lines)

            linesUpdate.attr("d", path)

            if scales.color
                linesUpdate.style('stroke', (pathset) -> if pathset[0]? then scales.color(pathset[0].color))

    apply: => render.apply(this, arguments)