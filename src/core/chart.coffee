rene.chart = ->
    margin = { top: 20, bottom: 20, left: 30, right: 20 }
    layers = []
    scales = {}
    layerDuration = 500
    layerDelay = 200
    legend = ->

    chart = (selection) ->
        selection.each((datasets) ->
            svg = d3.select(this)
                .selectAll("svg")
                .data([datasets])

            gEnter = svg.enter()
                .append("svg")
                .attr("class", "plot")
                .append("g")

            gEnter.append("g")
                .attr("class", "x axis")

            gEnter.append("g")
                .attr("class", "y axis")

            gEnter.append("g")
                .attr("class", "geoms")

            layerGroups = svg.select("g.geoms")
                .selectAll("g.layer")
                .data(Object)

            layerGroups.enter()
                .append("g")
                .attr("class", "layer")
                .attr("id", (d, i) -> "layer" + i)

            # add the appropriate scales for each layer
            for layer in layers
                for aesthetic, scale of layer.scales()
                    scales[aesthetic] ||= scale()

            # train the scales with each layer of data
            layerGroups.each((d, i) ->
                layer = layers[i]
                for aesthetic, scale of scales
                    if layer[aesthetic]
                        layerData = d.map(layer[aesthetic]())
                        scaleData = scale.domain()
                        if aesthetic is "color"
                            for dp in layerData
                                scaleData.push(dp) if dp not in scaleData
                            scale.domain(scaleData)
                        else if scale.rangeBand
                            # Ordinal scales
                            for point in layerData
                                scaleData.push(point) if point not in scaleData
                            scale.domain(scaleData)
                        else
                            scale.domain(d3.extent(layerData.concat(scaleData))))

            svgNode = svg.node()
            panelWidth = svgNode.clientWidth - (margin.left + margin.right)
            panelHeight = svgNode.clientHeight - (margin.top + margin.bottom)

            # train the ranges
            if scales.x
                scales.x.range([0, panelWidth])

                if scales.x.rangeBand?
                    scales.x.rangeBands([0, panelWidth], 0.1)

                xAxis = d3.svg.axis().scale(scales.x).orient("bottom")
                svg.select(".x.axis")
                    .attr("transform", utils.translate(0, panelHeight))
                    .call(xAxis)

            if scales.y
                scales.y.range([panelHeight, 0])
                yAxis = d3.svg.axis()
                    .scale(scales.y)
                    .orient("left")

                svg.select(".y.axis")
                    .call(yAxis)

            # hey margins are good
            svg.select("g").attr("transform", utils.translate(margin.left, margin.top))

            # render each layer
            layerGroups.each((d, i) ->
                d3.transition(d3.select(this))
                    .call(layers[i], scales, panelWidth, panelHeight))

            layerGroups.each((d, i) ->
                layers[i].position(d3.select(this), panelWidth, panelHeight, margin))

            legend.call(chart, layerGroups, scales, panelWidth, panelHeight)
        )

    chart.margin = (v) ->
        return margin if not arguments.length
        margin = v
        chart

    chart.layerDuration = (v) ->
        return layerDuration if not arguments.length
        layerDuration = v
        chart

    chart.layerDelay = (v) ->
        return layerDelay if not arguments.length
        layerDelay = v
        chart

    chart.legend = (v) ->
        return legend if not arguments.length
        legend = v
        chart

    chart.scales = (v) ->
        return scales if not arguments.length
        scales = v
        chart

    chart.layers = (v) ->
        return layers if not arguments.length
        layers = v
        chart

    chart.addLayer = (v) ->
        layers.push(v)
        chart

    chart
