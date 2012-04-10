rene.chart = ->
    margin = { top: 20, bottom: 20, left: 30, right: 20 }
    layers = []
    scales = {}
    layerDuration = 500
    layerDelay = 200
    legend = ->
    xAxis = d3.svg.axis().orient("bottom")
    yAxis = d3.svg.axis().orient("left")

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
                .attr("class", "geoms")
                    
            gEnter.append("g")
                .attr("class", "x axis")

            gEnter.append("g")
                .attr("class", "y axis")                    

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

            svg.attr("width", this.clientWidth).attr("height", this.clientHeight)
            panelWidth = this.clientWidth - (margin.left + margin.right)
            panelHeight = this.clientHeight - (margin.top + margin.bottom)

            # train the ranges
            if scales.x
                if scales.x.rangeBand?
                    scales.x.rangeBands([0, panelWidth], 0.1)
                else
                    scales.x.range([0, panelWidth])

                xAxis.scale(scales.x)
                svg.select(".x.axis")
                    .attr("transform", rene.utils.translate(0, panelHeight))
                    .call(xAxis)

            if scales.y
                scales.y.range([panelHeight, 0])
                yAxis.scale(scales.y)
                svg.select(".y.axis")
                    .call(yAxis)

            # hey margins are good
            svg.select("g").attr("transform", rene.utils.translate(margin.left, margin.top))

            # render each layer
            layerGroups.each((d, i) ->
                d3.transition(d3.select(this))
                    .call(layers[i], scales, panelWidth, panelHeight))

            layerGroups.each((d, i) ->
                layers[i].position(d3.select(this), panelWidth, panelHeight, margin))

            legend.call(chart, layerGroups, scales, panelWidth, panelHeight)
        )

    chart.margin = (v) ->
        return margin if not v
        margin = v
        chart

    chart.layerDuration = (v) ->
        return layerDuration if not v
        layerDuration = v
        chart

    chart.layerDelay = (v) ->
        return layerDelay if not v
        layerDelay = v
        chart

    chart.legend = (v) ->
        return legend if not v
        legend = v
        chart

    chart.scales = (v) ->
        return scales if not v
        scales = v
        chart

    chart.scale = (name, fn) ->
        return scales[name] if not fn
        scales[name] = fn
        chart

    chart.xAxis = (v) ->
        return xAxis if not v
        xAxis = v
        chart

    chart.yAxis = (v) ->
        return yAxis if not v
        yAxis = v
        chart

    chart.layers = (v) ->
        return layers if not v
        layers = v
        chart

    chart.addLayer = (v) ->
        layers.push(v)
        chart

    chart
