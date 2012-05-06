rene.pie = ->

    scales =
        color: d3.scale.category20

    location = "center"
    locationMargin = 10
    arc = d3.svg.arc()
    pie = d3.layout.pie().value((d) -> d.value)
    color = (d) -> d[0]
    value = (d) -> d[1]

    mapData = (dataset) ->
        aesthetics = [
            ['value', value],
            ['color', color]
        ]

        # Ouch, iterate over every data point...
        newPoints = []
        for point in dataset
            newPoint = {}
            for aesthetic in aesthetics
                newPoint[aesthetic[0]] = aesthetic[1](point)
            newPoints.push(newPoint)
        [newPoints]

    layer = (g, scales) ->
        g.classed("pie", true)

        g.each (d, i) ->
            pied = pie(d[0])

            arcs = d3.select(this)
                .selectAll("path.arc")
                .data(pied)

            arcsEnter = arcs.enter()
                .append("path")
                .attr("class", "arc")
                .style("opacity", 1e-6)

            arcsExit = d3.transition(arcs.exit())
                .style("opacity", 1e-6)
                .remove()

            arcsUpdate = d3.transition(arcs)
                .style("opacity", 1)

            # Apply the color styling
            arcsUpdate.attr("d", (d, i) -> arc(d))
                .attr("fill", (d, i) -> scales.color(d.data.color))

    layer.arc = (v) ->
        return arc if not v?
        arc = v
        layer

    layer.pie = (v) ->
        return pie if not v?
        pie = v
        layer

    layer.location = (v) ->
        return location if not v?
        location = v
        layer

    layer.color = (v) ->
        return color if not v?
        color = v
        layer

    layer.value = (v) ->
        return value if not v?
        value = v
        layer

    layer.position = (v) ->
        return position if not arguments.length
        position = v
        layer

    layer.color = (v) ->
        return color if not arguments.length
        color = v
        layer

    layer.scales = -> scales

    layer.mapData = mapData

    layer.move = (layer, width, height, margins) ->
        switch location
            when "center"
                layer.attr("transform", rene.utils.translate(width / 2, height / 2))
            when "left"
                layer.attr("transform", rene.utils.translate((arc.outerRadius())(), height / 2))

    layer