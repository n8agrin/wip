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
        x: d3.scale.linear
        y: d3.scale.linear
        color: d3.scale.category20
        size: d3.scale.linear

    layer = (g, scales) ->
        pathFn = d3.svg.line()
            .interpolate(layer.interpolate())
            .x((d) -> scales.x(x(d)))
            .y((d) -> scales.y(y(d)))

        g.classed("line", true)

        g.each (data) ->
            lines = d3.select(this)
                .selectAll("path")
                .data([data])

            linesEnter = lines.enter()
                .append("path")

            linesExit = d3.transition(lines.exit())
                .remove()

            linesUpdate = d3.transition(lines)

            linesUpdate.attr("d", pathFn)

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