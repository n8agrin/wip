
rene.chart = ->
    margin = { top: 20, bottom: 20, left: 30, right: 20 }
    layers = []
    scales = {}
    origScales = {}
    layerDuration = 500
    layerDelay = 200
    legend = ->
    xAxis = d3.svg.axis().orient("bottom")
    yAxis = d3.svg.axis().orient("left")
    xAxisLabel = null
    yAxisLabel = null
    xGrid = d3.svg.axis()
    yGrid = d3.svg.axis()
    panelSize = [0,0]
    svg = d3.select()
    layerGroups = d3.select()

    # Originally this reset all the scales, but it turned out that color and other
    # scales were important to preserve for legend interaction.
    resetXYScales = ->
        for scaleName in ['x', 'y']
            if scales[scaleName] and origScales[scaleName]
                scales[scaleName] = origScales[scaleName].copy()

    render = ->
        [panelWidth, panelHeight] = panelSize

        # render each layer
        layerGroups.each((d, i) ->
            d3.transition(d3.select(this))
                .call(layers[i], scales, panelWidth, panelHeight))

        # TODO: This is only use by the pie charts for the moment, probably a sign
        # that it's unnecessary and can be externalized.
        layerGroups.each((d, i) ->
            layers[i].move(d3.select(this), panelWidth, panelHeight, margin)
        )

        # Render the scales
        if scales.x
            xAxis.scale(scales.x)
            svg.select('.x.axis')
                .attr('transform', rene.utils.translate(0, panelHeight))
                .call(xAxis)

            if xGrid
                xGrid.scale(scales.x)
                    .tickSize(-panelHeight, -panelHeight, -panelHeight)
                    .orient('bottom')

                svg.select('g.x.grid')
                    .attr('transform', rene.utils.translate(0, panelHeight))
                    .call(xGrid)

                svg.selectAll('g.x.grid text, g.x.grid path.domain')
                    .remove()

            if xAxisLabel
                console.log('x label', xAxisLabel)
                xLabel = svg.select('.x.axis')
                    .selectAll('text.label')
                    .data([xAxisLabel])

                xLabelEnter = xLabel.enter()
                    .append('text')
                    .classed('label', true)

                xLabel.text((d) -> d)
                    .attr('transform', rene.utils.translate(0, 34))

        if scales.y

            if yAxis
                yAxis.scale(scales.y)
                svg.select(".y.axis")
                    .call(yAxis)

            if yGrid
                yGrid.scale(scales.y)
                    .tickSize(-panelWidth, -panelWidth, -panelWidth)
                    .orient('left')

                svg.select('g.y.grid')
                    .call(yGrid)

                svg.selectAll('g.y.grid text, g.y.grid path.domain')
                    .remove()

            if yAxisLabel
                yLabel = svg.select('.y.axis')
                    .selectAll('text.label')
                    .data([yAxisLabel])

                yLabelEnter = yLabel.enter()
                    .append('text')
                    .classed('label', true)

                yLabel.text((d) -> d)
                    .attr("transform", rene.utils.translate(-40, panelHeight) + " rotate(270, 0, 0)")

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
                .attr("class", "x grid")

            gEnter.append("g")
                .attr("class", "y grid")

            gEnter.append("g")
                .attr("class", "geoms")

            gEnter.append("g")
                .attr("class", "x axis")

            gEnter.append("g")
                .attr("class", "y axis")

            # Add the appropriate scales for each layer
            for layer in layers
                for aesthetic, scale of layer.scales()
                    scales[aesthetic] || chart.scale(aesthetic, scale())

            # Convert data in each layer to a standardized object format:
            #
            # {
            #   x: ...
            #   y: ...
            #   y0: ...
            #   color: ...
            #   group: ...
            #   ...
            # }
            #
            # This allows us to group and position the data once, so we don't have
            # to do it multiple times (speed) and gives us a common format to write
            # viz components to.
            positionedData = (layers[idx].mapData(dataset) for dataset, idx in datasets)

            layerGroups = svg.select("g.geoms")
                .selectAll("g.layer")
                .data(positionedData)

            layerGroups.enter()
                .append("g")
                .attr("class", "layer")
                .attr("id", (d, i) -> "layer" + i)

            # Reset the scales
            resetXYScales()

            # train the ranges / reset the domains
            svg.attr("width", @clientWidth).attr("height", @clientHeight)
            panelWidth = @clientWidth - (margin.left + margin.right)
            panelHeight = @clientHeight - (margin.top + margin.bottom)
            panelSize = [panelWidth, panelHeight]

            if scales.x
                if scales.x.rangeRoundBands?
                    scales.x.rangeRoundBands([0, panelWidth], 0.1)
                else
                    scales.x.range([0, panelWidth])

            if scales.y
                scales.y.range([panelHeight, 0])

            # train the scales with each layer of data
            for aesthetic, scale of scales
                scaleData = scale.domain().concat()
                for dataset in positionedData
                    for dataGroup in dataset
                        if scale.rangeBand
                            for point in dataGroup
                                if point[aesthetic] not in scaleData
                                    scaleData.push(point[aesthetic])
                        else
                            # Y may be stacked by the y0 attribute
                            if aesthetic is 'y'
                                aesValues = (point[aesthetic] + (point[aesthetic + '0'] || 0) for point in dataGroup)
                            else
                                aesValues = (point[aesthetic] for point in dataGroup)

                            scaleData = d3.extent(scaleData.concat(aesValues))
                scale.domain(scaleData)

            # hey margins are good
            svg.select("g").attr("transform", rene.utils.translate(margin.left, margin.top))

            render()
            legend?(layerGroups, datasets, scales, panelWidth, panelHeight)

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

    # Return cloned copies of the scales so they can be used for external purposes
    # but force setting of scales through the scale() interface in order to preserve
    # the original domain / range from user settings.
    chart.scales = ->
        copiedScales = {}
        for aesthetic, scale of scales
            copiedScales[aesthetic] = scale.copy()
        copiedScales

    # Sets a scale to the given aesthetic. Also copies the scale to the original scales
    # dictionary which is used when resetting and retraining the scales.
    # I suspect the origScales dictionary will be confusing in the future and may be
    # removed in favor of simply externalizing scale preservation in a closure.
    chart.scale = (aesthetic, scale) ->
        return scales[aesthetic] if not scale
        scales[aesthetic] = scale
        origScales[aesthetic] = scale.copy()
        chart

    chart.xAxis = (v) ->
        return xAxis if not arguments.length
        xAxis = v
        chart

    chart.yAxis = (v) ->
        return yAxis if not arguments.length
        yAxis = v
        chart

    chart.xAxisLabel = (v) ->
        return xAxisLabel if not arguments.length
        xAxisLabel = v
        chart

    chart.yAxisLabel = (v) ->
        return yAxisLabel if not arguments.length
        yAxisLabel = v
        chart

    chart.xGrid = (v) ->
        return xGrid if not arguments.length
        xGrid = v
        chart

    chart.yGrid = (v) ->
        return yGrid if not arguments.length
        yGrid = v
        chart

    chart.layers = (v) ->
        return layers if not v
        layers = v
        chart

    chart.addLayer = (v) ->
        layers.push(v)
        chart

    chart.panelSize = ->
        panelSize

    chart.render = render

    chart
