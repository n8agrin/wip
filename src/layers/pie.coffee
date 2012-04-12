rene.pie = ->

    outerRadius = d3.functor(100)
    innerRadius = d3.functor(10)
    location = "center"
    locationMargin = 10
    arc = d3.svg.arc()
    pie = d3.layout.pie()
    color = (d, i) -> d
    value = (v) -> v
    label = (l) -> l

    scales =
        color: d3.scale.category20

    layer = (g, scales, width, height) ->
        g.classed("pie", true)

        g.each (d, i) ->
            pied = pie(d)

            arc = arc.outerRadius(outerRadius(width, height))
                .innerRadius(innerRadius(width, height))

            arcs = d3.select(this)
                .selectAll("path.arc")
                .data(d)

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
            arcsUpdate.attr("d", (d, i) -> arc(pied[i]))
                .attr("fill", (d, i) -> scales.color(color(d, i)))

    layer.outerRadius = (v) ->
        return outerRadius if not v?
        outerRadius = d3.functor(v)
        layer

    layer.innerRadius = (v) ->
        return innerRadius if not v?
        innerRadius = d3.functor(v)
        layer

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

    layer.label = (v) ->
        return label if not v?
        label = v
        layer

    layer.scales = -> scales

    layer.position = (layer, width, height, margins) ->
        switch location
            when "center"
                layer.attr("transform", rene.utils.translate(width / 2, height / 2))
            when "left"
                layer.attr("transform", rene.utils.translate(outerRadius(width, height), height / 2))

    layer