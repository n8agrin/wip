rene.pie = ->
    layer = (g, scales, width, height) ->
        g.classed("pie", true)
        g.each((d, i) ->
            pie = attrs.pie
            pieData = pie(d.map(attrs.value))

            outerRadius = attrs.outerRadius
            innerRadius = attrs.innerRadius
            if typeof outerRadius is "function"
                outerRadius = outerRadius(width, height)
            if typeof innerRadius is "function"
                innerRadius = innerRadius(width, height)

            arc = attrs.arc.outerRadius(outerRadius).innerRadius(innerRadius)

            g = d3.select(this)
                .classed("pie", true)

            arcs = g.selectAll("path.arc")
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
            arcsUpdate.attr("d", (d, i) -> arc(pieData[i]))
                .attr("fill", (d, i) -> scales.color(attrs.color(d, i)))
        )

    scales =
        color: d3.scale.category20

    attrs =
        outerRadius: 100
        innerRadius: 10
        location: "center"
        locationMargin: 10
        arc: d3.svg.arc()
        pie: d3.layout.pie()
        color: (point, pointIndex) -> point.data
        value: (v) -> v
        label: (l) -> l

    AA = attrAccessor.bind(attrs, layer)
    layer.outerRadius = AA("outerRadius")
    layer.innerRadius = AA("innerRadius")
    layer.arc = AA("arc")
    layer.pie = AA("pie")
    layer.location = AA("location")
    layer.color = AA("color")
    layer.value = AA("value")
    layer.label = AA("label")

    layer.scales = -> scales
    layer.position = (layer, width, height, margins) ->
        switch attrs.location
            when "center"
                layer.attr("transform", utils.translate(width / 2, height / 2))
            when "left"
                layer.attr("transform", utils.translate(attrs.outerRadius(width, height), height / 2))

    layer