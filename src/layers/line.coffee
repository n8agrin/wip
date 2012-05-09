rene.line = ->

    x = (d) -> d[0]
    y = (d) -> d[1]
    color = (d) -> d[2]
    size = (d) -> d[3]
    group = (d) -> d[2]
    interpolate = "cardinal"

    position = (data) ->
        data

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

    scales =
        x: d3.time.scale
        y: d3.scale.linear
        color: d3.scale.category20
        size: d3.scale.linear

    layer = (g, scales) ->
        pathFn = d3.svg.line()
            .interpolate(layer.interpolate())
            .x((d) -> scales.x(d.x))
            .y((d) -> scales.y(d.y))

        g.classed("line", true)

        g.each (dataset) ->
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

            linesUpdate.attr("d", pathFn)

            if scales.color
                linesUpdate.style('stroke', (pathset) -> if pathset[0]? then scales.color(pathset[0].color))

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

    layer.interpolate = (v) ->
        return interpolate if not v
        interpolate = d3.functor(v)
        layer

    layer.group = (v) ->
        return group if not arguments.length
        group = v
        layer

    layer.scales = -> scales
    layer.mapData = mapData
    layer.move = ->

    layer