class rene.Chart

    callable = (selection) ->
        chart = this
        selection.each (data) ->
            chart.setContainer(this)
            chart.initChart(data)
            chart.render()

    constructor: ->
        @layers         = []
        @xAxis          = d3.svg.axis().orient('bottom')
        @yAxis          = d3.svg.axis().orient('left')
        @xAxisLabel     = null
        @yAxisLabel     = null
        @xGrid          = d3.svg.axis()
        @yGrid          = d3.svg.axis()
        @margin         = {top: 20, bottom: 20, left: 30, right: 20}
        @containerSize  = [0, 0]
        @panelSize      = [0, 0]
        @container      = d3.select()
        @svg            = d3.select()
        @layerGroups    = d3.select()
        @scales         = {}
        @originalScales = {}

    setScale: (aes, scale) =>
        @scales[aes] = scale
        @originalScales[aes] = scale.copy()
            .domain(scale.domain().concat())
            .range(scale.range().concat())

    setContainer: (container) =>
        @container = d3.select(container)
        @setDimensionsFromSelection(container)

    resetXYScales: =>
        for scaleName in ['x', 'y']
            if @scales[scaleName] and @originalScales[scaleName]
                @scales[scaleName] = @originalScales[scaleName].copy()

    initSVG: (data) =>
        @svg = @container.selectAll('svg')
            .data([data])

        gEnter = @svg.enter()
            .append('svg')
            .attr('class', 'plot')
            .attr('width', @containerSize[0])
            .attr('height', @containerSize[1])
            .append('g')
            .attr('transform', rene.utils.translate(@margin.left, @margin.top))

        gEnter.append('g')
            .attr('class', 'x grid')

        gEnter.append('g')
            .attr('class', 'y grid')

        gEnter.append('g')
            .attr('class', 'geoms')

        gEnter.append('g')
            .attr('class', 'x axis')

        gEnter.append('g')
            .attr('class', 'y axis')

    initScales: =>
        for layer in @layers
            for aes, scale of layer.scales
                @scales[aes] || @setScale(aes, scale())

    positionData: (data) =>
        (@layers[i].mapData(dataset) for dataset, i in data)

    initLayerGroups: (data) =>
        @layerGroups = @svg.select('g.geoms')
            .selectAll('g.layer')
            .data(data)

        @layerGroups.enter()
            .append('g')
            .attr('class', 'layer')
            .attr('id', (d, i) -> "layer#{i}")

    trainScaleRanges: =>
        if @scales.x?.rangeRoundBands?
            @scales.x.rangeRoundBands([0, @panelSize[0]], 0.1)
        else
            @scales.x?.range([0, @panelSize[0]])
        @scales.y?.range([0, @panelSize[1]])

    trainScaleDomains: (data) =>
        for aesthetic, scale of @scales
            scaleData = scale.domain().concat()
            for dataset in data
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

    renderLayers: ->
        do ({layers, scales, panelSize} = @) =>
            @layerGroups.each((data, idx) ->
                d3.transition(d3.select(this))
                    .call(layers[idx].render, scales, panelSize[0], panelSize[1]))

    moveLayers: ->
        # You're going to love this one ;)
        do ({layers, scales, panelSize, margin} = @) =>
            @layerGroups.each (data, idx) ->
                d3.transition(d3.select(this))
                    .call(layers[idx].move, panelSize[0], panelSize[1], margin)

    renderScales: ->
        panelSize = @panelSize
        if @scales.x and @xAxis
            @xAxis.scale(@scales.x)
            @svg.select('.x.axis')
                .attr('transform', rene.utils.translate(0, panelSize[1]))
                .call(@xAxis)

        if @scales.y and @yAxis
            yAxisScale = @scales.y.copy()
            yAxisScale.range(@scales.y.range().concat().reverse())
            @yAxis.scale(yAxisScale)
            @svg.select('.y.axis')
                .call(@yAxis)

    renderGrid: ->
        panelSize = @panelSize
        if @xGrid
            @xGrid.scale(@scales.x)
                .tickSize(-panelSize[1], -panelSize[1], -panelSize[1])
                .orient('bottom')

            @svg.select('g.x.grid')
                .attr('transform', rene.utils.translate(0, panelSize[1]))
                .call(@xGrid)

            @svg.selectAll('g.x.grid text, g.x.grid path.domain')
                .remove()

        if @yGrid
            @yGrid.scale(@scales.y)
                .tickSize(-panelSize[0], -panelSize[0], -panelSize[0])
                .orient('left')

            @svg.select('g.y.grid')
                    .call(@yGrid)

            @svg.selectAll('g.y.grid text, g.y.grid path.domain')
                .remove()

    renderLabels: ->
        if @xAxisLabel
            xLabel = @svg.select('.x.axis')
                .selectAll('text.label')
                .data([@xAxisLabel])

            xLabelEnter = xLabel.enter()
                .append('text')
                .classed('label', true)

            xLabel.text((d) -> d)
                .attr('transform', rene.utils.translate(0, 34))

        if @yAxisLabel
            yLabel = @svg.select('.y.axis')
                .selectAll('text.label')
                .data([@yAxisLabel])

            yLabelEnter = yLabel.enter()
                .append('text')
                .classed('label', true)

            yLabel.text((d) -> d)
                .attr("transform", rene.utils.translate(-40, @panelSize[1]) + " rotate(270, 0, 0)")

    initChart: (data) =>
        @resetXYScales()
        @initSVG(data)
        @initScales()
        data = @positionData(data)
        @initLayerGroups(data)
        @trainScaleRanges()
        @trainScaleDomains(data)

    render: =>
        @renderLayers()
        @renderScales()
        @renderGrid()
        @renderLabels()
        @moveLayers()

    setDimensionsFromSelection: (selection) =>
        @containerSize = [selection.clientWidth, selection.clientHeight]
        @panelSize[0] = selection.clientWidth - (@margin.left + @margin.right)
        @panelSize[1] = selection.clientHeight - (@margin.top + @margin.bottom)

    # Makes the object appear callable by adhearing to the fn.apply interface
    call: => callable.apply(this, arguments)
    apply: => callable.apply(this, arguments)